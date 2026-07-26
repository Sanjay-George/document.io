// @ts-ignore
const directFetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

// @ts-expect-error Todo: fix this
// Bridged fetcher. See scripts/bridge.js
const bridgedFetcher = (...args: any[]) => window.documentioAPI.fetch(...args);


export const fetcher = (() => {
    if (window.documentioAPI) {
        return bridgedFetcher;
    }
    return directFetcher;
})();

export const fetch = (() => {
    if (window.documentioAPI) {
        return window.documentioAPI.fetch;
    }
    return window.fetch;
})();