// Keep this as simple script (not module) since it's needed in content.js and popup.js without bundler.

// IIFE so these names don't leak into the shared content-script scope
globalThis.DOCIO_MESSAGES = (() => {
    // Requests the in-page bridge posts to the content script
    // page -> content.js (window.postMessage)
    const PAGE_REQUEST = {
        // Fetch data from the document.io backend.
        fetchData: "DOCIO_FETCH",
        // Fetch any asset (CORS-bypassed) as { contentType, base64 } for the exporter.
        fetchAsset: "DOCIO_ASSET_FETCH"
    };

    // Responses the content script posts back to the page.
    // content.js -> page (window.postMessage)
    const PAGE_RESPONSE = {
        // Response for PAGE_REQUEST.fetchData.
        fetchData: "DOCIO_FETCH_RESPONSE",
        // Response for PAGE_REQUEST.fetchAsset.
        fetchAsset: "DOCIO_ASSET_FETCH_RESPONSE"
    };

    // Requests sent to the background service worker.
    // content / popup -> background (chrome.runtime)
    const RUNTIME_REQUEST = {
        // Get the documentation id for the current tab.
        getCurrentDocumentationId: "GET_DOC_ID",
        // Fetch data from the document.io backend (CORS-bypassed).
        fetchData: "API_FETCH",
        // Fetch any asset (CORS-bypassed) as { contentType, base64 } for the exporter.
        fetchAsset: "ASSET_FETCH",
        // Get the configured API host for the backend.
        getApiHost: "GET_API_HOST",
        // Set the API host for the backend.
        setApiHost: "SET_API_HOST"
    };

    return { PAGE_REQUEST, PAGE_RESPONSE, RUNTIME_REQUEST };
})();
