(async function () {
    const ROOT_ID = "document-io-root";

    // ---- Get documentationId from background storage ----
    const documentationId = await getDocumentationId();
    if (!documentationId) {
        console.log("[Document.io Companion] No documentation-id found. Skipping injection.");
        return;
    }

    // ---- Inject assets and bridge ----
    injectRoot(documentationId);
    injectAssets();
    injectBridge();
    setupMessageListener();
    setupNavigationListener();

    // ---- Functions ----
    function getDocumentationId() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "GET_DOC_ID" }, (resp) => {
                resolve(resp?.documentationId || null);
            });
        });
    }

    function injectRoot(docId) {
        let root = document.getElementById(ROOT_ID);
        if (!root) {
            root = document.createElement("div");
            root.id = ROOT_ID;
            root.dataset.documentationId = docId;
            document.body.appendChild(root);
        }
        // Expose the companion bundle URLs so the export serializer can inline them.
        root.dataset.assetJs = chrome.runtime.getURL("dist/assets/index.js");
        root.dataset.assetCss = chrome.runtime.getURL("dist/assets/index.css");
    }

    function injectAssets() {
        // Inject stylesheet
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = chrome.runtime.getURL("dist/assets/index.css");
        document.head.appendChild(cssLink);

        // Inject JS bundle
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("dist/assets/index.js");
        document.body.appendChild(script);
    }

    function injectBridge() {
        const bridge = document.createElement("script");
        bridge.src = chrome.runtime.getURL("scripts/bridge.js");
        (document.head || document.documentElement).appendChild(bridge);
    }

    // ---- Message Listener ----
    function setupMessageListener() {
        window.addEventListener("message", async (event) => {
            if (event.source !== window) return;
            const msg = event.data;
            if (msg.type === "DOCIO_FETCH") {
                try {
                    const result = await apiFetch(msg.url, msg.options);
                    window.postMessage({ type: "DOCIO_FETCH_RESPONSE", reqId: msg.reqId, ok: true, data: result });
                } catch (err) {
                    window.postMessage({ type: "DOCIO_FETCH_RESPONSE", reqId: msg.reqId, ok: false, error: err.message });
                }
                return;
            }

            if (msg.type === "DOCIO_ASSET_FETCH") {
                try {
                    const result = await assetFetch(msg.url);
                    window.postMessage({ type: "DOCIO_ASSET_FETCH_RESPONSE", reqId: msg.reqId, ok: true, data: result });
                } catch (err) {
                    window.postMessage({ type: "DOCIO_ASSET_FETCH_RESPONSE", reqId: msg.reqId, ok: false, error: err.message });
                }
                return;
            }
        });
    }

    // ---- Asset Fetch Bridge (CORS-bypassed, base64) — used by the export serializer ----
    function assetFetch(url) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "ASSET_FETCH", url }, (resp) => {
                if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                if (!resp?.ok) return reject(new Error(resp?.error || "Unknown error"));
                resolve(resp.data);
            });
        });
    }

    // ---- API Fetch Bridge ----
    function apiFetch(url, options = {}) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "API_FETCH", url, options }, (resp) => {
                if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                if (!resp?.ok) return reject(new Error(resp?.error || "Unknown error"));
                resolve(resp.data);
            });
        });
    }

    // ---- SPA Navigation Detection ----
    function setupNavigationListener() {
        const notify = () => window.postMessage({ type: "DOCIO_NAVIGATION_UPDATED" }, "*");

        const originalPushState = history.pushState.bind(history);
        const originalReplaceState = history.replaceState.bind(history);

        history.pushState = function (...args) {
            originalPushState(...args);
            notify();
        };

        history.replaceState = function (...args) {
            originalReplaceState(...args);
            notify();
        };

        window.addEventListener("popstate", notify);
    }
})();