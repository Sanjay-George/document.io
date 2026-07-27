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
        const testid = a.attributes?.['data-testid'];
        const name = a.text || a.ariaLabel || (a.id ? `#${a.id}` : '') || testid;
        return name ? `${a.tag} · ${name}` : a.tag;
    }
    return lastSelectorTag(note.selector) || 'element';
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
 * Both the query string and the hash are intentionally dropped:
 * - a page's identity is its path; params like `?tab=repositories` vary within
 *   one page, and enforcing them is opt-in per note via `urlPattern` (see
 *   `pageMatches`), never a default;
 * - the hash identifies a section *within* a page (`/guide#install`), so it
 *   must not split one page into several — an annotation made anywhere on the
 *   page should be discoverable regardless of the current anchor.
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
    const segments = splitPath(toRelativeUrl(url));
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
 * `urlPattern` is always an own property: the server persists `urlPattern ?? null`,
 * so an absent key would leave the stale pattern in place.
 */
export function reanchorScope(
    existing: { url: string; urlPattern?: string },
    targetUrl: string,
): { movesPage: boolean; url: string; urlPattern: string | undefined } {
    const inScope = pageMatches(targetUrl, existing.url, existing.urlPattern);
    return {
        movesPage: !inScope,
        url: targetUrl,
        urlPattern: inScope ? existing.urlPattern : undefined,
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
