import { Note } from '@/companion/types';

/**
 * Context line shown on expanded cards and popovers: the element's CSS selector,
 * or the page URL for whole-page notes.
 */
export function contextLabel(note: Pick<Note, 'type' | 'selector' | 'url'>): string {
    if (note.type === 'page') return note.url || 'this page';
    return note.selector || 'element';
}

/**
 * Reduce any URL (absolute or already-relative) to its origin-independent
 * identity: pathname + hash. Absolute URLs have their origin stripped; relative
 * URLs resolve against `base` (defaults to the current page).
 *
 * The query string is intentionally dropped: in this app query params are
 * companion configuration (e.g. `?documentation-id=…&api-host=…`), not page
 * identity.
 */
export function toRelativeUrl(url: string, base?: string): string {
    const resolvedBase = base ?? (typeof window !== 'undefined' ? window.location.href : undefined);
    try {
        const parsed = new URL(url, resolvedBase);
        return parsed.pathname + parsed.hash;
    } catch {
        return url; // unparseable — compare as-is
    }
}

const REGEX_META = /[.+?^${}()|[\]\\]/g;
const DOUBLE_STAR = '\x00'; // sentinel for `**` — cannot occur in a URL path

/**
 * Compile a path glob to a RegExp test. `*` matches within a single path segment
 * (no `/`); `**` matches across segments. The pattern is expected to already be
 * origin-independent (a path, optionally with search/hash).
 */
export function pathMatchesPattern(pattern: string, path: string): boolean {
    const source = pattern
        .replace(REGEX_META, '\\$&') // escape regex metachars (leaves * and /)
        .replace(/\*\*/g, DOUBLE_STAR) // stash cross-segment wildcard
        .replace(/\*/g, '[^/]*') // single-segment wildcard
        .replace(new RegExp(DOUBLE_STAR, 'g'), '.*'); // restore cross-segment wildcard
    try {
        return new RegExp(`^${source}$`).test(path);
    } catch {
        return false;
    }
}

/**
 * Does the current page (`here`, an origin-independent path) belong to a note
 * captured at `url`, optionally generalised by `urlPattern`?
 *
 * Without a pattern this is an exact path match — a note stays on the one page it
 * was made on. With a pattern, `*`/`**` wildcards let one note cover a family of
 * pages (e.g. `/en/commonality/report/commonality/*` matches that report for any
 * document id) while still excluding unrelated pages like `/…/financials/…`.
 */
export function pageMatches(here: string, url: string, urlPattern?: string): boolean {
    if (urlPattern && urlPattern.trim()) {
        return pathMatchesPattern(toRelativeUrl(urlPattern), here);
    }
    return toRelativeUrl(url) === here;
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
