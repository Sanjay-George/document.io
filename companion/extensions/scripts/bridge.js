// Executed in page context
(function () {
    window.documentioAPI = {
        fetch: (url, options = {}) => {
            console.debug(`[Document.io Bridge] Fetching: ${url}`);
            return new Promise((resolve, reject) => {
                const reqId = Math.random().toString(36).slice(2);
                function handler(event) {
                    if (event.source !== window) return;
                    const data = event.data;
                    if (data.type === "DOCIO_FETCH_RESPONSE" && data.reqId === reqId) {
                        window.removeEventListener("message", handler);
                        if (data.ok) resolve(data.data);
                        else reject(new Error(data.error));
                    }
                }
                window.addEventListener("message", handler);
                window.postMessage({ type: "DOCIO_FETCH", reqId, url, options });
            });
        },
    };
})();