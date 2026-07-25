// Executed in page context
(function () {
    // Round-trip a postMessage request to the content script and back.
    function request(requestType, responseType, payload) {
        return new Promise((resolve, reject) => {
            const reqId = Math.random().toString(36).slice(2);
            function handler(event) {
                if (event.source !== window) return;
                const data = event.data;
                if (data.type === responseType && data.reqId === reqId) {
                    window.removeEventListener("message", handler);
                    if (data.ok) resolve(data.data);
                    else reject(new Error(data.error));
                }
            }
            window.addEventListener("message", handler);
            window.postMessage({ type: requestType, reqId, ...payload });
        });
    }

    window.documentioAPI = {
        fetch: (url, options = {}) => {
            console.debug(`[Document.io Bridge] Fetching: ${url}`);
            return request("DOCIO_FETCH", "DOCIO_FETCH_RESPONSE", { url, options });
        },
        // Fetch any asset (CORS-bypassed) as { contentType, base64 } for the exporter.
        fetchAsset: (url) => request("DOCIO_ASSET_FETCH", "DOCIO_ASSET_FETCH_RESPONSE", { url }),
    };
})();