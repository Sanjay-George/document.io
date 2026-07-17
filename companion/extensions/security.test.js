import { test } from "node:test";
import assert from "node:assert/strict";
import { isPrivateHost, assertAllowedAssetUrl } from "./security.js";

test("isPrivateHost: loopback / localhost", () => {
    for (const h of ["localhost", "app.localhost", "127.0.0.1", "127.255.255.254", "0.0.0.0", "::1", "::"]) {
        assert.equal(isPrivateHost(h), true, h);
    }
});

test("isPrivateHost: link-local + cloud metadata", () => {
    assert.equal(isPrivateHost("169.254.169.254"), true);
    assert.equal(isPrivateHost("169.254.0.1"), true);
    assert.equal(isPrivateHost("fe80::1"), true);
});

test("isPrivateHost: RFC1918 ranges and their boundaries", () => {
    assert.equal(isPrivateHost("10.0.0.1"), true);
    assert.equal(isPrivateHost("192.168.1.1"), true);
    assert.equal(isPrivateHost("172.16.0.1"), true);
    assert.equal(isPrivateHost("172.31.255.255"), true);
    // Just outside 172.16/12 — must be treated as public.
    assert.equal(isPrivateHost("172.15.0.1"), false);
    assert.equal(isPrivateHost("172.32.0.1"), false);
});

test("isPrivateHost: IPv6 unique-local and IPv4-mapped", () => {
    assert.equal(isPrivateHost("fc00::1"), true);
    assert.equal(isPrivateHost("fd12:3456::1"), true);
    assert.equal(isPrivateHost("::ffff:169.254.169.254"), true);
    assert.equal(isPrivateHost("::ffff:10.0.0.1"), true);
});

test("isPrivateHost: public hosts and addresses", () => {
    for (const h of ["example.com", "cdn.jsdelivr.net", "8.8.8.8", "1.1.1.1", "2606:4700::1111"]) {
        assert.equal(isPrivateHost(h), false, h);
    }
});

const PAGE = "https://docs.example.com/guide";

test("assertAllowedAssetUrl: allows public cross-origin assets (CDN)", () => {
    const u = assertAllowedAssetUrl("https://cdn.example.net/font.woff2", PAGE);
    assert.equal(u.href, "https://cdn.example.net/font.woff2");
});

test("assertAllowedAssetUrl: resolves relative refs against the page", () => {
    const u = assertAllowedAssetUrl("/assets/logo.png", PAGE);
    assert.equal(u.href, "https://docs.example.com/assets/logo.png");
});

test("assertAllowedAssetUrl: blocks cross-origin internal hosts (SSRF)", () => {
    assert.throws(() => assertAllowedAssetUrl("http://169.254.169.254/latest/meta-data/", PAGE), /non-public/);
    assert.throws(() => assertAllowedAssetUrl("http://10.0.0.5/secret", PAGE), /non-public/);
    assert.throws(() => assertAllowedAssetUrl("http://localhost:5001/admin", PAGE), /non-public/);
});

test("assertAllowedAssetUrl: allows the page's OWN internal origin", () => {
    const intranet = "http://10.0.0.5/docs";
    const u = assertAllowedAssetUrl("http://10.0.0.5/style.css", intranet);
    assert.equal(u.href, "http://10.0.0.5/style.css");
});

test("assertAllowedAssetUrl: rejects non-http(s) schemes", () => {
    assert.throws(() => assertAllowedAssetUrl("file:///etc/passwd", PAGE), /scheme/);
    assert.throws(() => assertAllowedAssetUrl("chrome://settings", PAGE), /scheme/);
    // data: URIs are inlined by the serializer directly, never proxied.
    assert.throws(() => assertAllowedAssetUrl("data:text/plain,hi", PAGE), /scheme/);
});

test("assertAllowedAssetUrl: rejects malformed URLs", () => {
    assert.throws(() => assertAllowedAssetUrl("http://", PAGE), /Invalid asset URL/);
});
