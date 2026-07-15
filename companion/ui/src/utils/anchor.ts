import { getQuerySelector } from '@/utils';

/**
 * A resilient descriptor of the element a note is anchored to.
 *
 * A CSS selector alone is brittle: `div.ag-header-cell:nth-of-type(1)` can match
 * several elements and silently re-point a note at the wrong one when the DOM
 * shifts. `AnchorMeta` pairs that selector with identity signals (id, ARIA,
 * text, stable attributes) so resolution can *verify* a match and, when the
 * selector no longer resolves, *recover* by scoring nearby candidates.
 *
 * The `selector` mirrors the annotation's `target` field, so legacy notes that
 * only stored a selector keep working (see `resolveAnchoredElement`).
 */
export interface AnchorMeta {
    /** Primary CSS selector — same value stored in `Annotation.target`. */
    selector: string;
    /** Lowercased tag name, e.g. `button`. */
    tag: string;
    /** Element id, when present (strong identity signal). */
    id?: string;
    /** Explicit `role` attribute, when present. */
    role?: string;
    /** Accessible name from `aria-label` / `aria-labelledby`. */
    ariaLabel?: string;
    /** Normalised, truncated visible text. */
    text?: string;
    /** Stable, identifying attributes (test ids, name, placeholder, data-*, …). */
    attributes?: Record<string, string>;
    /**
     * Identifying ancestors (nearest-first), each carrying a strong signal. This
     * is what distinguishes two *visually identical* widgets that share the same
     * selector and text but live in different sections — e.g. the same card in
     * two tab panels: the panels differ by id / `role="tabpanel"` / accessible
     * name even when the cards inside them don't.
     */
    context?: AncestorRef[];
}

/** A compact, identity-bearing reference to an ancestor element. */
export interface AncestorRef {
    tag: string;
    id?: string;
    role?: string;
    ariaLabel?: string;
    /** `data-testid` / `data-test` / `data-cy`, whichever is present. */
    testid?: string;
}

/** Attributes stable enough to identify an element across DOM changes. */
const STABLE_ATTRS = [
    'data-testid', 'data-test', 'data-cy', 'data-id',
    'name', 'placeholder', 'title', 'alt', 'type', 'value', 'href', 'for',
];

const TEXT_MAX = 120;
/** Minimum score for a *recovered* match (selector no longer resolves). Tuned so
 *  a single strong signal — id, a test id, or exact text — is enough, but tag or
 *  role alone is not, to avoid re-anchoring onto an unrelated element. */
const MIN_RECOVERY_SCORE = 30;
/** Cap the fallback candidate pool so scoring stays cheap on large pages. */
const MAX_POOL = 500;
/** How many identifying ancestors to record for context disambiguation. */
const MAX_CONTEXT = 3;
/** Roles worth recording on an ancestor even without an id (sectioning-ish). */
const SECTION_ROLE = /^(tabpanel|tab|dialog|region|navigation|menu|group|form|search|complementary|main)$/;
const TESTID_ATTRS = ['data-testid', 'data-test', 'data-cy'];

/** Collapse runs of whitespace and trim — makes text comparisons robust. */
function normalizeText(raw: string | null | undefined): string {
    return (raw ?? '').replace(/\s+/g, ' ').trim();
}

/** Accessible name: `aria-label`, else the text of `aria-labelledby` targets. */
function ariaLabelOf(el: HTMLElement): string | undefined {
    const direct = el.getAttribute('aria-label');
    if (direct && direct.trim()) return direct.trim();
    const labelledby = el.getAttribute('aria-labelledby');
    if (labelledby) {
        const text = labelledby
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent ?? '')
            .join(' ');
        const normalized = normalizeText(text);
        if (normalized) return normalized;
    }
    return undefined;
}

/** First present `data-testid` / `data-test` / `data-cy` value, if any. */
function testidOf(el: HTMLElement): string | undefined {
    for (const attr of TESTID_ATTRS) {
        const value = el.getAttribute(attr);
        if (value && value.trim()) return value.trim();
    }
    return undefined;
}

/** An ancestor descriptor, but only when the ancestor carries a strong signal. */
function strongAncestorRef(el: HTMLElement): AncestorRef | null {
    const id = el.id || undefined;
    const testid = testidOf(el);
    const ariaLabel = ariaLabelOf(el);
    const role = el.getAttribute('role') || undefined;
    // Skip anonymous wrappers — only ancestors we can actually re-identify help.
    if (!id && !testid && !ariaLabel && !(role && SECTION_ROLE.test(role))) return null;
    return { tag: el.tagName.toLowerCase(), id, role, ariaLabel, testid };
}

/** Nearest-first list of identifying ancestors, capped at `MAX_CONTEXT`. */
function buildContext(el: HTMLElement): AncestorRef[] {
    const refs: AncestorRef[] = [];
    let node = el.parentElement;
    while (node && node !== document.body && refs.length < MAX_CONTEXT) {
        const ref = strongAncestorRef(node);
        if (ref) refs.push(ref);
        node = node.parentElement;
    }
    return refs;
}

/** Capture a resilient anchor descriptor for `el` at annotation time. */
export function buildAnchor(el: HTMLElement): AnchorMeta {
    const attributes: Record<string, string> = {};
    for (const name of STABLE_ATTRS) {
        const value = el.getAttribute(name);
        if (value && value.trim()) attributes[name] = value.trim();
    }
    // Any remaining data-* attributes are usually app-assigned identifiers too.
    for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith('data-') && attr.value.trim() && !(attr.name in attributes)) {
            attributes[attr.name] = attr.value.trim();
        }
    }

    const text = normalizeText(el.textContent);
    const context = buildContext(el);

    return {
        selector: getQuerySelector(el),
        tag: el.tagName.toLowerCase(),
        id: el.id || undefined,
        role: el.getAttribute('role') || undefined,
        ariaLabel: ariaLabelOf(el),
        text: text ? text.slice(0, TEXT_MAX) : undefined,
        attributes: Object.keys(attributes).length ? attributes : undefined,
        context: context.length ? context : undefined,
    };
}

/** True when `el` sits inside an ancestor matching `ref`'s strongest signal. */
function ancestorMatches(el: HTMLElement, ref: AncestorRef): boolean {
    if (ref.id) return el.closest(`#${CSS.escape(ref.id)}`) !== null;
    if (ref.testid) {
        return TESTID_ATTRS.some((attr) => el.closest(`[${attr}="${CSS.escape(ref.testid!)}"]`) !== null);
    }
    // role (+ optional accessible name) — walk ancestors since it needs both.
    if (ref.role) {
        for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
            if (node.getAttribute('role') === ref.role && (!ref.ariaLabel || ariaLabelOf(node) === ref.ariaLabel)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Reward candidates whose surrounding structure matches the stored context.
 * This is what pulls resolution toward the right copy when the element itself is
 * indistinguishable from a twin elsewhere on the page (e.g. per-tab widgets).
 */
function scoreContext(el: HTMLElement, context?: AncestorRef[]): number {
    if (!context?.length) return 0;
    let score = 0;
    for (const ref of context) {
        if (ancestorMatches(el, ref)) score += ref.id || ref.testid ? 25 : 10;
    }
    return score;
}

/**
 * How well `el` matches the stored anchor. Higher is better; 0 means no shared
 * identity signal. Weights favour signals an app is least likely to reuse across
 * unrelated elements (ids, test ids, accessible names, exact text) plus the
 * element's surrounding context.
 */
function scoreCandidate(el: HTMLElement, anchor: AnchorMeta): number {
    let score = scoreContext(el, anchor.context);

    if (anchor.id && el.id === anchor.id) score += 100;

    if (anchor.attributes) {
        for (const [name, value] of Object.entries(anchor.attributes)) {
            if (el.getAttribute(name) === value) {
                // Test ids and names are near-unique; generic attrs (type) weaker.
                score += /testid|test|cy|data-id|name|for/.test(name) ? 40 : 15;
            }
        }
    }

    if (anchor.ariaLabel && ariaLabelOf(el) === anchor.ariaLabel) score += 40;

    if (anchor.text) {
        const text = normalizeText(el.textContent).slice(0, TEXT_MAX);
        if (text === anchor.text) score += 30;
        else if (text && (text.startsWith(anchor.text) || anchor.text.startsWith(text))) score += 12;
    }

    if (anchor.role && el.getAttribute('role') === anchor.role) score += 8;
    if (el.tagName.toLowerCase() === anchor.tag) score += 5;

    return score;
}

/** Best-scoring element at or above `minScore`; ties resolve to the first. */
function bestByScore(candidates: HTMLElement[], anchor: AnchorMeta, minScore = 0): HTMLElement | null {
    let best: HTMLElement | null = null;
    let bestScore = minScore - 1;
    for (const el of candidates) {
        const score = scoreCandidate(el, anchor);
        if (score > bestScore) {
            best = el;
            bestScore = score;
        }
    }
    return bestScore >= minScore ? best : null;
}

/** Safe `querySelectorAll` — malformed selectors yield an empty list, not a throw. */
function queryAll(selector: string): HTMLElement[] {
    try {
        return Array.from(document.querySelectorAll<HTMLElement>(selector));
    } catch {
        return [];
    }
}

/**
 * Gather a candidate pool from the anchor's strongest identity signals, used
 * only when the primary selector resolves to nothing. Prefers narrow queries
 * (id, test ids) and falls back to tag/role, capped for performance.
 */
function gatherCandidates(anchor: AnchorMeta): HTMLElement[] {
    const found = new Set<HTMLElement>();
    const add = (els: HTMLElement[]) => els.forEach((el) => found.add(el));

    if (anchor.id) add(queryAll(`#${CSS.escape(anchor.id)}`));
    if (anchor.attributes) {
        for (const [name, value] of Object.entries(anchor.attributes)) {
            add(queryAll(`[${name}="${CSS.escape(value)}"]`));
        }
    }
    // Only widen to tag/role scans when narrow signals found nothing, to stay cheap.
    if (found.size === 0) {
        if (anchor.role) add(queryAll(`[role="${CSS.escape(anchor.role)}"]`));
        if (anchor.tag) add(queryAll(anchor.tag));
    }
    return Array.from(found).slice(0, MAX_POOL);
}

/**
 * Resolve the element a note points at, robustly.
 *
 * 1. Selector matches exactly one element → use it.
 * 2. Selector matches several → pick the one that best fits the anchor metadata.
 * 3. Selector matches none → recover by scoring candidates gathered from the
 *    anchor's identity signals, accepting only a confident match.
 *
 * Legacy notes without `anchor` fall back to plain first-match behaviour, so
 * nothing that resolved before stops resolving.
 */
export function resolveAnchoredElement(target: string, anchor?: AnchorMeta): HTMLElement | null {
    const candidates = queryAll(target);

    if (!anchor) return candidates[0] ?? null;

    if (candidates.length === 1) return candidates[0];
    if (candidates.length > 1) return bestByScore(candidates, anchor);

    return bestByScore(gatherCandidates(anchor), anchor, MIN_RECOVERY_SCORE);
}
