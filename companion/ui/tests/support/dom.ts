/**
 * Host-page fixtures for the anchoring unit tests (pure DOM, no React).
 *
 * Anchoring resolves against the live `document`, so tests build a throwaway
 * host page in `document.body`, exercise `buildAnchor`/`resolveAnchoredElement`
 * against it, and reset between cases.
 */

/** Replace the document body with `html`. */
export function mount(html: string): void {
    document.body.innerHTML = html;
}

/** First `<tag>` whose trimmed text is exactly `text`. Throws if none. */
export function byText(tag: string, text: string): HTMLElement {
    const el = Array.from(document.querySelectorAll<HTMLElement>(tag)).find(
        (e) => e.textContent?.trim() === text,
    );
    if (!el) throw new Error(`no <${tag}> with text "${text}"`);
    return el;
}

/** Clear the host page — call from `afterEach`. */
export function resetDom(): void {
    document.body.innerHTML = '';
}
