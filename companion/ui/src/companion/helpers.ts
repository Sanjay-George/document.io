import { AnchorMeta, AnchorScope, AnchorSignal, SignalState, anchorSignals } from '@/utils/anchor';
import { Note } from '@/companion/types';

/**
 * Context line shown on expanded cards and popovers: a human-friendly handle for
 * the anchored element, or the page URL for whole-page notes.
 *
 * Auto-generated CSS-module selectors are unreadable and often hundreds of chars
 * long, so for element notes we prefer the anchor's identity signals (visible
 * text, accessible name, id) and fall back to the target tag — never the raw
 * selector chain.
 */
export function contextLabel(note: Pick<Note, 'type' | 'selector' | 'url' | 'anchor'>): string {
    if (note.type === 'page') return note.url || 'this page';

    const a = note.anchor;
    if (a) {
        const name = anchorName(a);
        return name ? `${a.tag} · ${name}` : a.tag;
    }
    return lastSelectorTag(note.selector) || 'element';
}

/** The human handle for an anchored element — what a reader would call it, with
 *  no tag name. `undefined` when the element has nothing recognisable to show. */
export function anchorName(anchor?: AnchorMeta): string | undefined {
    if (!anchor) return undefined;
    const testid = anchor.attributes?.['data-testid'];
    return anchor.text || anchor.ariaLabel || (anchor.id ? `#${anchor.id}` : '') || testid || undefined;
}

/** Tag of the deepest selector in a descendant chain (drops the class soup). */
function lastSelectorTag(selector: string): string {
    const token = selector.split(/[>+~\s]+/).filter(Boolean).pop() ?? '';
    return token.split(/[.#:[]/)[0] || token;
}

/**
 * Reduce any URL (absolute or already-relative) to its origin-independent
 * identity: the pathname only. Absolute URLs have their origin stripped;
 * relative URLs resolve against `base` (defaults to the current page).
 *
 * Both the query string and the hash are intentionally dropped
 */
export function toRelativeUrl(url: string, base?: string): string {
    const resolvedBase = base ?? (typeof window !== 'undefined' ? window.location.href : undefined);
    try {
        const parsed = new URL(url, resolvedBase);
        return parsed.pathname;
    } catch {
        return url; // unparseable — compare as-is
    }
}

/** Query params the companion injects into host URLs — never part of page identity. */
export const COMPANION_PARAMS = ['documentation-id', 'api-host'];

/**
 * The current page as stored on a new note: path plus the host's own query
 * params. The query is kept only so the scope editor can offer them as opt-in
 * chips — matching still compares paths (see `pageMatches`), so this does not
 * narrow where a note appears.
 */
export function capturePageUrl(href: string = window.location.href): string {
    try {
        const parsed = new URL(href);
        COMPANION_PARAMS.forEach((p) => parsed.searchParams.delete(p));
        return parsed.pathname + (parsed.searchParams.toString() ? `?${parsed.searchParams}` : '');
    } catch {
        return href;
    }
}

const REGEX_META = /[.+?^${}()|[\]\\]/g;
const DEEP = '\x00'; // sentinel for `/**` — cannot occur in a URL path

/** Trailing slashes never distinguish two pages, and `/` normalises to ''. */
function trimTrailingSlash(path: string): string {
    return path.replace(/\/+$/, '');
}

/**
 * Compile a path glob to a RegExp test. `*` matches any value within a single
 * segment; a `/**` step matches any number of whole segments, including zero —
 * so `/docs/**` covers `/docs` itself, and a `**` step between `/a` and `/b`
 * covers both `/a/b` and `/a/x/y/b`. The pattern must be an origin-independent
 * path.
 */
export function pathMatchesPattern(pattern: string, path: string): boolean {
    const source = trimTrailingSlash(pattern)
        .replace(REGEX_META, '\\$&') // escape regex metachars (leaves * and /)
        .replace(/\/\*\*/g, DEEP) // stash cross-segment wildcard
        .replace(/\*/g, '[^/]*') // single-segment wildcard
        .replace(new RegExp(DEEP, 'g'), '(?:/[^/]+)*'); // zero or more whole segments
    try {
        return new RegExp(`^${source}$`).test(trimTrailingSlash(path));
    } catch {
        return false;
    }
}

/** Split a pattern into its path glob and its required `k=v` params. */
function splitPattern(pattern: string): { path: string; params: URLSearchParams } {
    const q = pattern.indexOf('?');
    if (q === -1) return { path: pattern, params: new URLSearchParams() };
    return { path: pattern.slice(0, q), params: new URLSearchParams(pattern.slice(q + 1)) };
}

/**
 * Does the current page (`here`, a full href or a bare path) belong to a note
 * captured at `url`, optionally generalised by `urlPattern`?
 *
 * Without a pattern this is an exact path match — a note stays on the one page it
 * was made on. With a pattern, `*`/`**` wildcards let one note cover a family of
 * pages (e.g. `/en/commonality/report/commonality/*` matches that report for any
 * document id) while still excluding unrelated pages like `/…/financials/…`.
 *
 * A pattern may also require query params (`/*?tab=repositories`), which is the
 * only way params ever affect matching: params the pattern doesn't name are
 * ignored, so `?tab=repositories&q=x` still matches.
 */
export function pageMatches(here: string, url: string, urlPattern?: string): boolean {
    const herePath = toRelativeUrl(here);
    if (!urlPattern || !urlPattern.trim()) return toRelativeUrl(url) === herePath;

    const { path, params } = splitPattern(urlPattern.trim());
    if (!pathMatchesPattern(toRelativeUrl(path), herePath)) return false;

    const hereParams = searchParamsOf(here);
    return [...params].every(([key, value]) => {
        const actual = hereParams.get(key);
        return actual !== null && pathMatchesPattern(value, actual);
    });
}

/** Query params of any URL, absolute or relative — the base only has to parse. */
function searchParamsOf(href: string): URLSearchParams {
    try {
        return new URL(href, 'http://x').searchParams;
    } catch {
        return new URLSearchParams();
    }
}

// ---- Page scope: the chip-state ↔ urlPattern codec behind PageScopeEditor ----

/** What one path segment of the scope editor matches. */
export type SegmentState =
    /** the captured value, verbatim */
    | 'exact'
    /** any value, one segment (`*`) */
    | 'any'
    /** any number of segments, including zero (`**`) */
    | 'deep';

export type PageScope = {
    /** Real segment labels from the captured url — always the full captured depth. */
    segments: string[];
    /** Per-segment state, same length and order as `segments`. */
    states: SegmentState[];
    /** Query params offered as chips, with whether the note requires each. */
    params: { key: string; value: string; required: boolean }[];
};

/** Split a relative URL (already stripped of search/hash) into path segments. */
function splitPath(relative: string): string[] {
    return relative.split('/').filter((s) => s.length > 0);
}

const GLYPH: Record<SegmentState, string> = { exact: '', any: '*', deep: '**' };

/**
 * Read the editor's chip states back out of a stored pattern. The captured `url`
 * is the source of truth for segment labels and depth, so a wildcarded segment
 * can always be toggled back to its real value.
 *
 * A pattern shorter than the captured path is a collapsed trailing `**` (see
 * `buildPageScope`), so the missing tail reads back as `deep`.
 */
export function parsePageScope(url: string, pattern?: string): PageScope {
    const capturedSegments = splitPath(toRelativeUrl(url));
    // Root has no segments but still needs a chip, or `/` could never widen to `/**`.
    const segments = capturedSegments.length ? capturedSegments : [''];
    const captured = [...searchParamsOf(url)];

    if (!pattern || !pattern.trim()) {
        return {
            segments,
            states: segments.map(() => 'exact'),
            params: captured.map(([key, value]) => ({ key, value, required: false })),
        };
    }

    const { path, params: required } = splitPattern(pattern.trim());
    const patternSegs = splitPath(toRelativeUrl(path));
    const collapsed = patternSegs[patternSegs.length - 1] === '**';

    const states = segments.map((_, i): SegmentState => {
        const seg = patternSegs[i] ?? (collapsed ? '**' : undefined);
        if (seg === '**') return 'deep';
        if (seg === '*') return 'any';
        return 'exact';
    });

    // A param the pattern requires but the captured url lacks still needs a chip,
    // otherwise editing a note from a page without it would silently drop it.
    const capturedKeys = new Set(captured.map(([key]) => key));
    const extra = [...required].filter(([key]) => !capturedKeys.has(key));
    return {
        segments,
        states,
        params: [...captured, ...extra].map(([key, value]) => ({
            key,
            value: required.get(key) ?? value,
            required: required.has(key),
        })),
    };
}

/**
 * Build the stored `urlPattern` from chip states, or `undefined` when the scope
 * is back to an exact match on the captured page.
 *
 * A trailing run of `**` collapses to a single one, since consecutive `**` steps
 * match identically — the shorter form is what a human would write.
 */
export function buildPageScope({ segments, states, params }: PageScope): string | undefined {
    const required = params.filter((p) => p.required);
    if (states.every((s) => s === 'exact') && required.length === 0) return undefined;

    const parts = segments.map((seg, i) => GLYPH[states[i]] || seg);
    while (parts.length > 1 && parts[parts.length - 1] === '**' && parts[parts.length - 2] === '**') {
        parts.pop();
    }

    const query = new URLSearchParams(required.map((p) => [p.key, p.value])).toString();
    return '/' + parts.join('/') + (query ? `?${query}` : '');
}

/**
 * How re-anchoring a note onto `targetUrl` changes its page scope.
 *
 * A re-anchor is a *move* exactly when the new page falls outside the scope the
 * note already has — not merely when the URL string differs. Re-anchoring within
 * a note's own family (a `/en/report/*` note onto a sibling report) is a pin fix,
 * so it keeps the pattern; leaving the family resets the note to an exact match
 * on where it landed, since the old pattern describes pages it no longer covers.
 *
 * `anchorScope` resets unconditionally — it is keyed by the *old* anchor's
 * signals, and the new element has its own.
 *
 * Both are always own properties: the server persists each as `?? null`, so an
 * absent key would leave the stale value in place.
 */
export function reanchorScope(
    existing: { url: string; urlPattern?: string },
    targetUrl: string,
): { movesPage: boolean; url: string; urlPattern: string | undefined; anchorScope: undefined } {
    const inScope = pageMatches(targetUrl, existing.url, existing.urlPattern);
    return {
        movesPage: !inScope,
        url: targetUrl,
        urlPattern: inScope ? existing.urlPattern : undefined,
        anchorScope: undefined,
    };
}

/** Plain-English restatement of the scope, so the chips need no glob knowledge. */
export function describePageScope({ states, params }: PageScope): string {
    const any = states.includes('any');
    const deep = states.includes('deep');
    const required = params.filter((p) => p.required);

    let scope: string;
    if (deep && any) scope = 'Any number of levels where ∗∗ is, any value where ∗ is.';
    else if (deep) scope = 'Any number of levels where ∗∗ is.';
    else if (any) scope = 'Any value where ∗ is.';
    else scope = 'Only this exact page.';

    if (!required.length) return scope;
    return `${scope} Only when ${required.map((p) => `${p.key}=${p.value}`).join(' and ')}.`;
}

// ---- Anchor scope: the chip-state ↔ strictness codec behind AnchorScopeEditor ----

export type AnchorLevel = 'exact' | 'smart' | 'loose';

/** A resolver signal dressed for the editor: same `key`, plus how to say it. */
export type Signal = AnchorSignal & {
    /** Chip label — the captured value, so a signal can always be read back. */
    label: string;
    /** Same signal inside a sentence. */
    phrase: string;
};

export const ANCHOR_LEVELS: AnchorLevel[] = ['exact', 'smart', 'loose'];

export const ANCHOR_LEVEL_COPY: Record<AnchorLevel | 'custom', { label: string; meaning: string }> = {
    exact: { label: 'Exact', meaning: 'Only this element, exactly as it was captured.' },
    smart: { label: 'Smart', meaning: 'Follows the element by its identity, even when it moves.' },
    loose: { label: 'Loose', meaning: 'Settles for the closest match anywhere on the page.' },
    custom: { label: 'Custom', meaning: 'Your own mix of signals.' },
};

/** How each signal reads as a chip and inside a sentence. The resolver owns the
 *  keys and the weights; this only adds words. */
function describeSignal(signal: AnchorSignal): { label: string; phrase: string } {
    const value = signal.value ?? '';
    switch (signal.kind) {
        case 'id':
            return { label: `#${value}`, phrase: `#${value}` };
        case 'attr':
            return { label: `${signal.name}=${value}`, phrase: `${signal.name}=${value}` };
        case 'aria':
            return { label: `aria “${value}”`, phrase: `the label “${value}”` };
        case 'text':
            return { label: `“${value}”`, phrase: `the text “${value}”` };
        case 'tag':
            return { label: `<${value}>`, phrase: `being a ${value}` };
        case 'role':
            return { label: `role=${value}`, phrase: `role ${value}` };
        case 'context': {
            const ref = signal.ref!;
            const name = ref.id ? `#${ref.id}` : ref.testid || (ref.ariaLabel ? `“${ref.ariaLabel}”` : `<${ref.tag}>`);
            return { label: `in ${name}`, phrase: `sitting inside ${name}` };
        }
        case 'position':
            return { label: 'in place', phrase: 'its exact place in the page' };
    }
}

/** The anchor's signals in strength order, which is also how the chips read. */
export function scopeSignals(anchor: AnchorMeta): Signal[] {
    return anchorSignals(anchor).map((signal) => ({ ...signal, ...describeSignal(signal) }));
}

/**
 * The states a level gives each signal. `smart` requires only the strongest
 * identity signal — today's behaviour, where one strong signal has to corroborate
 * and the rest merely rank — while `exact` requires all of them and `loose` none.
 */
function presetScope(signals: Signal[], level: AnchorLevel): AnchorScope {
    const strongest = signals.find((s) => s.strong)?.key;
    const state = (signal: Signal): SignalState => {
        if (level === 'exact') return 'required';
        if (level === 'loose') return signal.kind === 'position' || signal.kind === 'context' ? 'ignored' : 'hint';
        return signal.key === strongest ? 'required' : 'hint';
    };
    return Object.fromEntries(signals.map((s) => [s.key, state(s)]));
}

/** Every preset's scope for one anchor, keyed by level. */
export function anchorPresets(signals: Signal[]): Record<AnchorLevel, AnchorScope> {
    return Object.fromEntries(ANCHOR_LEVELS.map((l) => [l, presetScope(signals, l)])) as Record<
        AnchorLevel,
        AnchorScope
    >;
}

/** Which preset a scope reads back as — `custom` when it matches none. */
export function levelOfScope(
    signals: Signal[],
    presets: Record<AnchorLevel, AnchorScope>,
    scope: AnchorScope,
): AnchorLevel | 'custom' {
    return ANCHOR_LEVELS.find((l) => signals.every((s) => presets[l][s.key] === scope[s.key])) ?? 'custom';
}

/** Same, straight from an anchor — for the composer's collapsed scope digest. */
export function anchorLevelOf(anchor: AnchorMeta, scope?: AnchorScope): AnchorLevel | 'custom' {
    if (!scope) return 'smart';
    const signals = scopeSignals(anchor);
    return levelOfScope(signals, anchorPresets(signals), scope);
}

/** Comma list ending in “and”, trimmed so the sentence stays one or two lines. */
function joinPhrases(phrases: string[], max = 3): string {
    const kept = phrases.slice(0, max);
    if (phrases.length > max) kept.push(`${phrases.length - max} more`);
    if (kept.length < 3) return kept.join(' and ');
    return `${kept.slice(0, -1).join(', ')} and ${kept[kept.length - 1]}`;
}

/** Plain-English restatement of the chips, so nothing here needs anchor knowledge.
 *  Mostly-required mixes are stated by their exceptions — shorter, and it's the
 *  exception that carries the meaning. */
export function describeAnchorScope(signals: Signal[], scope: AnchorScope): string {
    const required = signals.filter((s) => scope[s.key] === 'required');
    const optional = signals.filter((s) => scope[s.key] !== 'required');
    const ignored = signals.filter((s) => scope[s.key] === 'ignored');

    if (!required.length) return 'Nothing has to match — the best-looking candidate wins.';
    if (!optional.length) return 'Every signal has to still match.';
    if (optional.length < required.length) {
        return `Everything has to still match except ${joinPhrases(optional.map((s) => s.phrase))}.`;
    }

    const rest = ignored.length
        ? `Ignores ${joinPhrases(ignored.map((s) => s.phrase))}.`
        : 'Everything else only breaks ties.';
    return `Must match ${joinPhrases(required.map((s) => s.phrase))}. ${rest}`;
}

/** The trade-off the current mix lands on — derived from the chips, so a custom
 *  mix is judged the same way a preset is. */
export function anchorVerdict(signals: Signal[], scope: AnchorScope): { text: string; risky: boolean } {
    const required = signals.filter((s) => scope[s.key] === 'required').length;
    if (!required) return { text: 'May land on a lookalike.', risky: true };
    if (required === signals.length) return { text: 'Breaks on the smallest edit.', risky: true };
    return { text: 'Survives most page changes.', risky: false };
}

const DEFAULT_SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/**
 * Resolve `url` and return its href only if it uses a safe scheme, otherwise
 * `null`. Note/annotation URLs come from user-provided text, so dangerous
 * schemes like `javascript:`/`data:`/`vbscript:` must never reach an `href`
 * or a navigation call. Parsing via the URL constructor (rather than a regex)
 * also defends against obfuscated schemes (leading whitespace, control chars).
 *
 * Relative URLs are resolved against `base` (defaults to the current page).
 */
export function safeUrl(
    url: string,
    { base, protocols = DEFAULT_SAFE_PROTOCOLS }: { base?: string; protocols?: readonly string[] } = {},
): string | null {
    const resolvedBase = base ?? (typeof window !== 'undefined' ? window.location.href : undefined);
    try {
        const parsed = new URL(url, resolvedBase);
        return protocols.includes(parsed.protocol) ? parsed.href : null;
    } catch {
        // Malformed URL (e.g. a bare relative path with no base) — treat as unsafe.
        return null;
    }
}
