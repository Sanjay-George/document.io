// @ts-ignore
const directFetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

// @ts-expect-error Todo: fix this
// Bridged fetcher. See scripts/bridge.js
const bridgedFetcher = (...args: any[]) => window.documentioAPI.fetch(...args);

/**
 * Offline fetcher for exported HTML files: resolves the same SWR keys the live
 * companion uses against the inlined `window.__DOCIO_EXPORT__` payload, so no
 * component or SWR key has to change. An export contains exactly one
 * documentation, so the documentation id in the key is not matched against.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches the other fetchers; SWR data stays `any`.
const offlineFetcher = (key: string): Promise<any> => {
    const payload = window.__DOCIO_EXPORT__!;
    if (/\/documentations\/[^/]+\/annotations/.test(key)) return Promise.resolve(payload.annotations);
    const single = key.match(/\/annotations\/([^/?]+)$/);
    if (single) return Promise.resolve(payload.annotations.find((a) => a.id === single[1]) ?? null);
    if (/\/documentations\/[^/?]+$/.test(key)) return Promise.resolve(payload.documentation);
    return Promise.resolve(null);
};

export const fetcher = (() => {
    if (window.__DOCIO_EXPORT__) {
        return offlineFetcher;
    }
    if (window.documentioAPI) {
        return bridgedFetcher;
    }
    return directFetcher;
})();

export const fetch = (() => {
    if (window.__DOCIO_EXPORT__) {
        // Read-only export: mutations must never reach a network.
        return (() => Promise.reject(new Error('Read-only export'))) as unknown as typeof window.fetch;
    }
    if (window.documentioAPI) {
        return window.documentioAPI.fetch;
    }
    return window.fetch;
})();