import { Annotation } from '@/models/annotations';
import { resolveAnchoredElement } from '@/utils/anchor';
import { pageMatches } from '@/companion/helpers';
import { MODAL_ROOT_ID } from '@/utils/constants';

/**
 * Freeze the currently active page into a single, self-contained HTML file that
 * re-renders the companion overlay offline and read-only. WYSIWYG: only what the
 * author is looking at is captured — no other pages, no navigation.
 *
 * Strategy:
 *  - Bake anchors: stamp each on-page note's element with `data-docio-note-id` and
 *    rewrite its exported `target` to that unique attribute, so offline resolution
 *    is an exact match and `anchor.ts` / the overlay need no changes.
 *  - Serialize the live DOM (post-render, so SPAs freeze as-seen), inlining CSS and
 *    assets as data URIs and stripping scripts.
 *  - Re-inject the companion bundle + an inlined `window.__DOCIO_EXPORT__` payload;
 *    `data_access/fetcher` reads from it instead of the network.
 */

const NOTE_ID_ATTR = 'data-docio-note-id';
const INLINED_CSS_ID = 'docio-inlined-css';

/** Asset URLs of the companion bundle, passed from the extension via the root's dataset. */
type CompanionAssets = { js: string; css: string };

function companionAssets(): CompanionAssets | null {
    const root = document.getElementById(MODAL_ROOT_ID);
    const js = root?.dataset.assetJs;
    const css = root?.dataset.assetCss;
    return js && css ? { js, css } : null;
}

/** Fetch a URL through the extension (CORS-bypassed) and return a data URI, or null. */
async function assetDataUri(url: string): Promise<string | null> {
    try {
        const res = await window.documentioAPI?.fetchAssetForExport?.(url);
        if (!res) return null;
        return `data:${res.contentType};base64,${res.base64}`;
    } catch {
        return null;
    }
}

/** Absolute URL for a possibly-relative reference, resolved against the page. */
function absolute(url: string, base = document.baseURI): string | null {
    try {
        return new URL(url, base).href;
    } catch {
        return null;
    }
}

const URL_IN_CSS = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;

/** Inline every `url(...)` asset in a stylesheet's text as a data URI (best-effort). */
async function inlineCssUrls(css: string, base: string): Promise<string> {
    const refs = new Map<string, string>(); // raw ref -> data URI
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = URL_IN_CSS.exec(css))) {
        const ref = m[2];
        if (seen.has(ref) || ref.startsWith('data:')) continue;
        seen.add(ref);
        const abs = absolute(ref, base);
        if (!abs) continue;
        const uri = await assetDataUri(abs);
        if (uri) refs.set(ref, uri);
    }
    return css.replace(URL_IN_CSS, (whole, _q, ref) => (refs.has(ref) ? `url("${refs.get(ref)}")` : whole));
}

/**
 * Collect every applied stylesheet as one CSS string. Same-origin / CORS sheets
 * are read from `cssRules`; cross-origin sheets are re-fetched through the
 * extension. `url()` refs are inlined as data URIs so the file works offline.
 */
async function collectCss(): Promise<string> {
    const chunks: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
        const owner = sheet.ownerNode as HTMLElement | null;
        // Skip the companion's own injected stylesheet(s).
        if (owner?.closest?.(`#${MODAL_ROOT_ID}`)) continue;
        if (sheet.href?.startsWith('chrome-extension:')) continue;

        const base = sheet.href ?? document.baseURI;
        let text: string | null = null;
        try {
            text = Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
        } catch {
            // Cross-origin, unreadable — re-fetch the source through the extension.
            if (sheet.href) {
                const uri = await assetDataUri(sheet.href);
                if (uri) {
                    try {
                        text = atob(uri.split(',')[1]);
                    } catch {
                        text = null;
                    }
                }
            }
        }
        if (text) chunks.push(await inlineCssUrls(text, base));
    }
    return chunks.join('\n');
}

/** Inline `<img>` sources as data URIs; drop `srcset` (its candidates aren't captured). */
async function inlineImages(clone: HTMLElement): Promise<void> {
    const imgs = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
        imgs.map(async (img) => {
            const src = img.getAttribute('src');
            img.removeAttribute('srcset');
            if (!src || src.startsWith('data:')) return;
            const abs = absolute(src);
            const uri = abs && (await assetDataUri(abs));
            if (uri) img.setAttribute('src', uri);
            else if (abs) img.setAttribute('src', abs);
        }),
    );
}

/** Fetch the companion bundle text (web-accessible extension resource). */
async function bundleText(url: string): Promise<string> {
    const res = await window.fetch(url);
    return res.text();
}

/**
 * Notes for the current page, with `target` rewritten to the baked unique selector.
 * The original `anchor` is kept: resolution matches the unique baked attribute
 * directly, but the anchor's identity signals still power the context label (and
 * act as a recovery fallback if the stamped element is ever missing).
 */
function bakedPayloadAnnotations(annotations: Annotation[]): Annotation[] {
    const here = window.location.href;
    return annotations
        .filter((a) => a.id && pageMatches(here, a.url, a.urlPattern))
        // The baked target is unique, so the export needs no strictness — and a
        // scope keyed to the live page's signals could only reject the very
        // element we stamped.
        .map((a) => ({ ...a, target: `[${NOTE_ID_ATTR}="${a.id}"]`, anchorScope: undefined }));
}

function filename(title?: string): string {
    const slug = (title || 'documentation')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    return `${slug || 'documentation'}.html`;
}

function triggerDownload(html: string, name: string): void {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

export type ExportResult = { ok: true; notes: number } | { ok: false; error: string };

/**
 * Export the active page. Bakes anchors, serializes, and downloads a single HTML
 * file. Returns a result the caller can surface as a toast.
 */
export async function exportCurrentPage(
    documentation: { id?: string; title?: string },
    annotations: Annotation[],
): Promise<ExportResult> {
    const assets = companionAssets();
    if (!assets) return { ok: false, error: 'Companion assets unavailable' };

    const payloadNotes = bakedPayloadAnnotations(annotations);

    // 1. Bake anchors onto the live DOM, remembering elements to un-stamp after.
    const stamped: HTMLElement[] = [];
    for (const a of annotations) {
        if (!a.id) continue;
        const el = resolveAnchoredElement(a.target, a.anchor, a.anchorScope);
        if (el) {
            el.setAttribute(NOTE_ID_ATTR, a.id);
            stamped.push(el);
        }
    }

    try {
        // 2. Gather CSS + companion bundle before cloning (async, uses live sheets).
        const [pageCss, companionJs, companionCss] = await Promise.all([
            collectCss(),
            bundleText(assets.js),
            bundleText(assets.css),
        ]);

        // 3. Clone and clean.
        const clone = document.documentElement.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('script').forEach((s) => s.remove());
        clone.querySelectorAll('link[rel~="stylesheet"], style').forEach((s) => s.remove());
        clone.querySelector(`#${MODAL_ROOT_ID}`)?.remove();
        clone
            .querySelectorAll('link[href^="chrome-extension:"], [src^="chrome-extension:"]')
            .forEach((e) => e.remove());

        const head = clone.querySelector('head') ?? clone.insertBefore(document.createElement('head'), clone.firstChild);
        const body = clone.querySelector('body');
        if (!body) return { ok: false, error: 'Page has no <body>' };

        // 4. Inline images inside the clone.
        await inlineImages(clone);

        // 5. Inlined page CSS.
        const pageStyle = document.createElement('style');
        pageStyle.id = INLINED_CSS_ID;
        pageStyle.textContent = pageCss;
        head.appendChild(pageStyle);

        // 6. Companion CSS + root + payload + bundle.
        const companionStyle = document.createElement('style');
        companionStyle.textContent = companionCss;
        head.appendChild(companionStyle);

        const root = document.createElement('div');
        root.id = MODAL_ROOT_ID;
        root.dataset.documentationId = documentation.id || 'export';
        body.appendChild(root);

        const payload = document.createElement('script');
        payload.textContent = `window.__DOCIO_EXPORT__=${JSON.stringify({
            documentation: { id: documentation.id, title: documentation.title },
            annotations: payloadNotes,
        }).replace(/</g, '\\u003c')};`;
        body.appendChild(payload);

        const bundle = document.createElement('script');
        // A literal `</script` in the bundle would close this inline script when the
        // file is re-parsed; neutralise it (safe — such text only lives in string literals).
        bundle.textContent = companionJs.replace(/<\/script/gi, '<\\/script');
        body.appendChild(bundle);

        const html = `<!doctype html>\n${clone.outerHTML}`;
        triggerDownload(html, filename(documentation.title));
        return { ok: true, notes: payloadNotes.length };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Export failed' };
    } finally {
        stamped.forEach((el) => el.removeAttribute(NOTE_ID_ATTR));
    }
}
