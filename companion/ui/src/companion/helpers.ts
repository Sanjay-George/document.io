import { Note } from '@/companion/types';

/**
 * Context line shown on expanded cards and popovers: the element's CSS selector,
 * or the page URL for whole-page notes.
 */
export function contextLabel(note: Pick<Note, 'type' | 'selector' | 'url'>): string {
    if (note.type === 'page') return note.url || 'this page';
    return note.selector || 'element';
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
