import { assertAllowedAssetUrl } from "./security.js";

const DEFAULT_API_HOST = "http://localhost:5001";

chrome.runtime.onInstalled.addListener(() => {
    console.log("[Document.io Companion] Extension installed.");
});

// ---- API Host Config ----
async function getApiHost() {
    const data = await chrome.storage.local.get("docio_api_host");
    return data.docio_api_host || DEFAULT_API_HOST;
}

// ---- Web Navigation Logic ----
function makeKey(tabId, domain) {
    return `docio_${tabId}_${domain}`;
}

function handleUrl(details) {
    if (details.frameId !== 0) return; // only top-level frames

    try {
        const urlObj = new URL(details.url);
        const domain = urlObj.hostname;
        const docId = urlObj.searchParams.get("documentation-id");

        if (docId) {
            const key = makeKey(details.tabId, domain);

            chrome.storage.session.set({ [key]: docId }, () => {
                console.debug(
                    `[Document.io Companion] [Tab=${details.tabId}] [${domain}] Stored documentation-id=${docId}`
                );
            });
        }
    } catch (err) {
        console.warn("[Document.io Companion] Failed parsing URL:", err);
    }
}

// Listen to navigations
chrome.webNavigation.onCommitted.addListener(handleUrl);
chrome.webNavigation.onHistoryStateUpdated.addListener(handleUrl);

// Cleanup storage on tab close
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.session.get(null).then((all) => {
        for (const key of Object.keys(all)) {
            if (key.startsWith(`docio_${tabId}_`)) {
                chrome.storage.session.remove(key);
            }
        }
    });
});

// ---- Message Handling ----
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "GET_DOC_ID") {
        // Use sender.tab info
        if (!sender.tab?.id || !sender.tab?.url) {
            sendResponse({ documentationId: null });
            return false;
        }

        try {
            const urlObj = new URL(sender.tab.url);
            const key = makeKey(sender.tab.id, urlObj.hostname);

            chrome.storage.session.get(key).then((data) => {
                sendResponse({ documentationId: data[key] || null });
            });
        } catch (err) {
            console.warn("[Document.io Companion] Failed extracting domain:", err);
            sendResponse({ documentationId: null });
        }

        return true; // Keep response channel open
    }

    if (msg.type === "API_FETCH") {
        doFetch(msg.url, msg.options)
            .then((data) => sendResponse({ ok: true, data }))
            .catch((err) => sendResponse({ ok: false, error: err.message }));

        return true; // async response
    }

    if (msg.type === "ASSET_FETCH") {
        fetchAssetForExport(msg.url, sender.tab)
            .then((data) => sendResponse({ ok: true, data }))
            .catch((err) => sendResponse({ ok: false, error: err.message }));

        return true; // async response
    }

    if (msg.type === "GET_API_HOST") {
        getApiHost().then((host) => sendResponse({ host }));
        return true;
    }

    if (msg.type === "SET_API_HOST") {
        chrome.storage.local.set({ docio_api_host: msg.host }).then(() => sendResponse({ ok: true }));
        return true;
    }
});

// ---- Export capability gate ----
// The asset proxy bypasses CORS/SOP, so it is only made available to pages whose
// project opted into export (beta), and never to internal/loopback hosts.

const EXPORT_FLAG_TTL_MS = 60_000;
const exportFlagCache = new Map(); // docId -> { enabled, at }

// Whether the documentation *we* recorded for this tab (from navigation, not a
// page-supplied value) belongs to a project with export enabled. Cached briefly.
async function isExportEnabled(docId) {
    const cached = exportFlagCache.get(docId);
    if (cached && Date.now() - cached.at < EXPORT_FLAG_TTL_MS) return cached.enabled;

    let enabled = false;
    try {
        const doc = await doFetch(`/documentations/${encodeURIComponent(docId)}`, {});
        enabled = doc?.exportEnabled === true;
    } catch {
        enabled = false;
    }
    exportFlagCache.set(docId, { enabled, at: Date.now() });
    return enabled;
}

async function tabExportEnabled(tab) {
    if (!tab?.id || !tab?.url) return false;
    try {
        const key = makeKey(tab.id, new URL(tab.url).hostname);
        const data = await chrome.storage.session.get(key);
        const docId = data[key] || null;
        return docId ? await isExportEnabled(docId) : false;
    } catch {
        return false;
    }
}

// INFO: ONLY USED FOR EXPORT, WHICH IS IN BETA.
// ---- Asset Fetch (arbitrary bytes → base64, bypasses page CORS) ----
async function fetchAssetForExport(url, tab) {
    if (!tab?.id || !tab?.url) throw new Error("No tab context");

    // Reject bad schemes / cross-origin internal hosts before doing anything.
    const target = assertAllowedAssetUrl(url, tab.url);

    // TODO: HAndle DNS rebinding issue. Use the IP resolved from assertAllowedAssetUrl call. 
    //  Discard new IP.

    // TODO: Check what this does.
    // Only proxy bytes for projects that opted into export (beta).
    if (!(await tabExportEnabled(tab))) {
        throw new Error("Export not enabled for this page");
    }

    // Don't follow redirects: the allowlist validated `target`, but a 3xx to an
    // internal host (169.254.169.254, localhost, …) would bypass it entirely.
    const res = await fetch(target.href, { redirect: "manual" });
    if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
        throw new Error("Asset URL redirected");
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    const CHUNK = 0x8000; // avoid arg-count limits on String.fromCharCode
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return {
        contentType: res.headers.get("content-type") || "application/octet-stream",
        base64: btoa(binary),
    };
}

// ---- Fetch Helper ----
async function doFetch(url, options) {
    const base = await getApiHost();

    if (!/^https?:\/\//i.test(url)) url = base + url;

    console.debug(`[Document.io Companion] Background fetching: ${url}`);
    const res = await fetch(url, options);

    // TODO: CHECK if there should be an allow-lists for urls.

    if (res.status === 401) {
        const err = new Error("HTTP 401");
        err.status = 401;
        throw err;
    }
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        throw err;
    }

    return await res.json();
}