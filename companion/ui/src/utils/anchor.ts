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

/** What one captured signal is allowed to do when the element is re-found. */
export type SignalState =
    /** the candidate must carry this exact value */
    | 'required'
    /** only ranks near-matches against each other */
    | 'hint'
    /** not looked at */
    | 'ignored';

/** Per-signal strictness, keyed by `AnchorSignal.key`. Absent means the default
 *  resolution — a stored scope is always a deliberate choice. */
export type AnchorScope = Record<string, SignalState>;

/** One identity signal carried by an anchor. `key` is the stable id an
 *  `AnchorScope` addresses it by, so the editor and the resolver can't disagree. */
export interface AnchorSignal {
    key: string;
    kind: 'id' | 'attr' | 'aria' | 'text' | 'tag' | 'role' | 'context' | 'position';
    /** Attribute name, for `attr` signals. */
    name?: string;
    /** Captured value — the element's own, or the ancestor's for `context`. */
    value?: string;
    ref?: AncestorRef;
    /** Identifies an element on its own — apps rarely reuse it across elements. */
    strong: boolean;
    /** Points earned when a candidate carries this signal. */
    weight: number;
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
/** Attribute names an app rarely reuses across unrelated elements (test ids,
 *  `name`, `for`, `data-id`) — strong enough to identify an element on their own.
 *  Anchored to whole names: a substring match wrongly promotes framework-generic
 *  attrs that merely *contain* these words — e.g. PrimeVue tags every button with
 *  `data-pc-name="button"` (a shared component type, not an identity), and `for`
 *  hides inside `data-format`/`platform` — which would re-anchor a note onto any
 *  lookalike sibling. */
const STRONG_ATTR = /^(data-)?test(-?id)?$|^(data-)?cy$|^data-id$|^name$|^for$/;

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
    // Accessible name alone — a section labelled by aria-label with no id/role
    // (which strongAncestorRef records) still distinguishes twins by their panel.
    if (ref.ariaLabel && !ref.role) {
        for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
            if (ariaLabelOf(node) === ref.ariaLabel) return true;
        }
    }
    return false;
}

/**
 * Every identity signal the anchor carries, strongest first — the single source
 * of the keys an `AnchorScope` uses. Weights favour signals an app is least
 * likely to reuse across unrelated elements. `position` scores nothing: it
 * decides *where* we look rather than what we accept.
 */
export function anchorSignals(anchor: AnchorMeta): AnchorSignal[] {
    const signals: AnchorSignal[] = [];

    if (anchor.id) {
        signals.push({ key: 'id', kind: 'id', value: anchor.id, strong: true, weight: 100 });
    }
    for (const [name, value] of Object.entries(anchor.attributes ?? {})) {
        // Test ids and names are near-unique; generic attrs (type, …) are weaker.
        const strong = STRONG_ATTR.test(name);
        signals.push({ key: `attr:${name}`, kind: 'attr', name, value, strong, weight: strong ? 40 : 15 });
    }
    if (anchor.ariaLabel) {
        signals.push({ key: 'aria', kind: 'aria', value: anchor.ariaLabel, strong: true, weight: 40 });
    }
    if (anchor.text) {
        signals.push({ key: 'text', kind: 'text', value: anchor.text, strong: true, weight: 30 });
    }
    signals.push({ key: 'tag', kind: 'tag', value: anchor.tag, strong: false, weight: 5 });
    if (anchor.role) {
        signals.push({ key: 'role', kind: 'role', value: anchor.role, strong: false, weight: 8 });
    }
    anchor.context?.forEach((ref, i) => {
        // An ancestor identified by id/test id pins the right *copy* of a twin;
        // one identified only by role is a much weaker sectioning hint.
        signals.push({
            key: `ctx:${i}`,
            kind: 'context',
            value: ref.id || ref.testid || ref.ariaLabel,
            ref,
            strong: false,
            weight: ref.id || ref.testid ? 25 : 10,
        });
    });
    signals.push({ key: 'position', kind: 'position', value: anchor.selector, strong: false, weight: 0 });

    return signals;
}

/** Does `el` carry this signal? Text matches exactly or by prefix, so a minor
 *  label edit still corroborates (`"Start Analysis"` ↔ `"Start Analysis (beta)"`). */
function signalMatches(el: HTMLElement, signal: AnchorSignal): boolean {
    switch (signal.kind) {
        case 'id':
            return el.id === signal.value;
        case 'attr':
            return el.getAttribute(signal.name!) === signal.value;
        case 'aria':
            return ariaLabelOf(el) === signal.value;
        case 'text': {
            const text = normalizeText(el.textContent).slice(0, TEXT_MAX);
            if (text === signal.value) return true;
            return !!text && (text.startsWith(signal.value!) || signal.value!.startsWith(text));
        }
        case 'tag':
            return el.tagName.toLowerCase() === signal.value;
        case 'role':
            return el.getAttribute('role') === signal.value;
        case 'context':
            return ancestorMatches(el, signal.ref!);
        case 'position':
            // Handled by candidate gathering, not by inspecting the element.
            return true;
    }
}

/** Points `el` earns for one signal. Text scores partial credit on a prefix
 *  match, since truncation shouldn't rank as highly as the real thing. */
function signalScore(el: HTMLElement, signal: AnchorSignal): number {
    if (signal.kind === 'text') {
        const text = normalizeText(el.textContent).slice(0, TEXT_MAX);
        if (text === signal.value) return signal.weight;
        return text && (text.startsWith(signal.value!) || signal.value!.startsWith(text)) ? 12 : 0;
    }
    return signalMatches(el, signal) ? signal.weight : 0;
}

/** How well `el` matches a set of signals. Higher is better. */
function scoreCandidate(el: HTMLElement, signals: AnchorSignal[]): number {
    return signals.reduce((total, signal) => total + signalScore(el, signal), 0);
}

/** Best-scoring element at or above `minScore`; ties resolve to the first. */
function bestByScore(candidates: HTMLElement[], signals: AnchorSignal[], minScore = 0): HTMLElement | null {
    let best: HTMLElement | null = null;
    let bestScore = minScore - 1;
    for (const el of candidates) {
        const score = scoreCandidate(el, signals);
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

/** A stored scope never gates on a signal it doesn't mention: an anchor captured
 *  before the scope was saved (or one that has since gained an attribute) must
 *  not start rejecting candidates on a key the user never chose. */
function stateOf(scope: AnchorScope, signal: AnchorSignal): SignalState {
    return scope[signal.key] ?? 'hint';
}

/**
 * Resolution under an explicit `AnchorScope`: every **required** signal has to
 * match, **hint** signals only rank the survivors, and **ignored** signals are
 * invisible to both. A required `position` pins the note to the stored selector,
 * so a rotted selector surfaces as broken instead of recovering elsewhere.
 */
function resolveWithScope(
    anchor: AnchorMeta,
    scope: AnchorScope,
    candidates: HTMLElement[],
): HTMLElement | null {
    const signals = anchorSignals(anchor).filter((s) => stateOf(scope, s) !== 'ignored');
    const required = signals.filter((s) => s.kind !== 'position' && stateOf(scope, s) === 'required');
    const gate = (els: HTMLElement[]) => els.filter((el) => required.every((s) => signalMatches(el, s)));

    const direct = gate(candidates);
    if (direct.length) return bestByScore(direct, signals);

    const pinned = scope.position === 'required';
    if (pinned) return null;
    return bestByScore(gate(gatherCandidates(anchor)), signals, MIN_RECOVERY_SCORE);
}

/** Whether the anchor carries a signal worth verifying against — one an app
 *  rarely shares across unrelated elements (id, accessible name, exact text, or
 *  a strong attr). When it has none, there's nothing to catch a rotted selector
 *  with, so we keep trusting the selector. */
function hasDiscriminatingIdentity(signals: AnchorSignal[]): boolean {
    return signals.some((s) => s.strong);
}

/**
 * True when `el` corroborates at least one of the anchor's discriminating
 * signals. Used to reject a selector match that landed on a lookalike sibling
 * after the real target was removed (a class/`nth-of-type` selector rotting).
 */
function sharesDiscriminatingSignal(el: HTMLElement, signals: AnchorSignal[]): boolean {
    return signals.some((s) => s.strong && signalMatches(el, s));
}

/**
 * Resolve the element a note points at, robustly.
 *
 * 1. Selector still resolves → use the best match that corroborates the anchor's
 *    discriminating identity (id / accessible name / strong attr / text). A bare
 *    CSS selector is a liar: a class/`nth-of-type` selector can rot onto a
 *    lookalike sibling once the real target is removed, so we never trust it
 *    alone when we stored something to verify against.
 * 2. Nothing corroborates (or the selector matches none) → recover by scoring
 *    candidates gathered from the anchor's identity signals, accepting only a
 *    confident match (`MIN_RECOVERY_SCORE`); otherwise `null` → note is "broken".
 *
 * The identity gate applies to *both* paths: `context`/`tag`/`role` are shared by
 * siblings and can't tell a target from its neighbour, so an element must share
 * an element-specific signal before it can be adopted. Anchors with no
 * discriminating identity keep plain selector-trust behaviour (there's nothing to
 * verify), as do legacy notes without `anchor`.
 *
 * `scope` replaces all of the above with the user's own per-signal choice. It is
 * opt-in because the two gates differ: the default accepts *any one* strong
 * signal, a scope requires *all* of them (see docs/anchoring.md).
 */
export function resolveAnchoredElement(
    target: string,
    anchor?: AnchorMeta,
    scope?: AnchorScope,
): HTMLElement | null {
    const candidates = queryAll(target);

    if (!anchor) return candidates[0] ?? null;
    if (scope) return resolveWithScope(anchor, scope, candidates);

    const signals = anchorSignals(anchor);
    // Only elements that corroborate an element-specific signal may be adopted —
    // context/tag alone can't distinguish the target from a sibling the selector
    // rotted onto, and they can reach MIN_RECOVERY_SCORE on their own.
    const gate = hasDiscriminatingIdentity(signals)
        ? (els: HTMLElement[]) => els.filter((el) => sharesDiscriminatingSignal(el, signals))
        : (els: HTMLElement[]) => els;

    const direct = gate(candidates);
    // bestByScore only returns null for an empty list, which direct.length excludes.
    if (direct.length) return bestByScore(direct, signals);

    return bestByScore(gate(gatherCandidates(anchor)), signals, MIN_RECOVERY_SCORE);
}
