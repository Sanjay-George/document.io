// Security guards for the export asset proxy. Pure, dependency-free so they can
// be unit-tested outside the extension runtime (see security.test.js).

// True for private/loopback/link-local/metadata hosts we must never proxy to
// cross-origin (169.254.169.254, 10/8, 127/8, intranet, ::1, fc00::/7, …).
export function isPrivateHost(hostname) {
    const h = hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".localhost")) return true;

    if (h.includes(":")) {
        const s = h.replace(/^\[|\]$/g, "");
        if (s === "::1" || s === "::") return true;
        if (/^fe80:/.test(s) || /^f[cd][0-9a-f]{2}:/.test(s)) return true;
        // IPv4-mapped/embedded, e.g. ::ffff:169.254.169.254
        const embedded = s.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
        return embedded ? isPrivateHost(embedded[1]) : false;
    }

    const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (m) {
        const a = Number(m[1]);
        const b = Number(m[2]);
        if (a === 0 || a === 10 || a === 127) return true;
        if (a === 169 && b === 254) return true; // link-local + cloud metadata
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 192 && b === 168) return true;
        return false;
    }

    // TODO: FIX CASE WHERE DOMAIN NAME IS POINTED TO 127.0.0.1 OR ANY OTHER PRIVATE IPS (SSRF BYPASS)
    // ALSO HANDLE DNS REBINDING

    return false; // non-literal hostnames are treated as public
}

/**
 * Validate an asset URL requested by a page before the extension fetches it.
 * Allows only http(s), and blocks cross-origin fetches to private/internal
 * hosts (SSRF) while permitting the page's own origin. Returns the parsed URL.
 * @returns {URL}
 * @throws if the URL is malformed, non-http(s), or a blocked internal host.
 */
export function assertAllowedAssetUrl(rawUrl, tabUrl) {
    let target;
    try {
        target = new URL(rawUrl, tabUrl);
    } catch {
        throw new Error("Invalid asset URL");
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") {
        throw new Error("Unsupported asset scheme. Only http(s) is allowed");
    }
    // Same-origin as the page is always fine (intranet/localhost docs load their
    // own assets); cross-origin to a private/internal host is blocked.
    if (target.origin !== new URL(tabUrl).origin && isPrivateHost(target.hostname)) {
        throw new Error("Blocked non-public asset host");
    }
    return target; // TODO: return resolved IP
}
