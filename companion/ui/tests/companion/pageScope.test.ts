import { describe, expect, it } from 'vitest';
import {
    PageScope,
    SegmentState,
    buildPageScope,
    capturePageUrl,
    describePageScope,
    pageMatches,
    parsePageScope,
    pathMatchesPattern,
    reanchorScope,
} from '@/companion/helpers';

/**
 * Page scope decides whether a note appears at all — it is the gate in front of
 * anchor resolution (see docs/anchoring.md). Two wildcards, one opt-in extra:
 *   `*`   any value, one segment
 *   `**`  any number of whole segments, including zero
 *   `?k=v` a query param the note requires (params are ignored otherwise)
 */

const REPORT = '/en/commonality/report/commonality/59bb70f8';
const GITHUB = '/Sanjay-George?tab=repositories';

describe('pathMatchesPattern — `*` matches one segment', () => {
    it('matches any value in that slot but never crosses a slash', () => {
        expect(pathMatchesPattern('/en/report/*', '/en/report/59bb')).toBe(true);
        expect(pathMatchesPattern('/en/report/*', '/en/report/other')).toBe(true);
        // one `*` is one segment: `a/b` is two, so it cannot fill the slot.
        expect(pathMatchesPattern('/en/report/*', '/en/report/a/b')).toBe(false);
        // and the slot must exist at all.
        expect(pathMatchesPattern('/en/report/*', '/en/report')).toBe(false);
    });

    it('does not match the site root', () => {
        // `/*` is "one top-level segment"; `/` has none.
        expect(pathMatchesPattern('/*', '/a')).toBe(true);
        expect(pathMatchesPattern('/*', '/')).toBe(false);
    });
});

describe('pathMatchesPattern — `**` matches any number of segments', () => {
    it('covers zero levels, so a prefix pattern includes the prefix itself', () => {
        expect(pathMatchesPattern('/docs/**', '/docs')).toBe(true);
        expect(pathMatchesPattern('/docs/**', '/docs/guide')).toBe(true);
        expect(pathMatchesPattern('/docs/**', '/docs/guide/install/advanced')).toBe(true);
        expect(pathMatchesPattern('/docs/**', '/other')).toBe(false);
    });

    it('works in the middle of a path, with zero or many levels between', () => {
        const pattern = '/path/**/again/this';
        expect(pathMatchesPattern(pattern, '/path/again/this')).toBe(true);
        expect(pathMatchesPattern(pattern, '/path/x/again/this')).toBe(true);
        expect(pathMatchesPattern(pattern, '/path/x/y/z/again/this')).toBe(true);
        // the fixed segments either side still have to be there, in order.
        expect(pathMatchesPattern(pattern, '/path/again')).toBe(false);
        expect(pathMatchesPattern(pattern, '/other/again/this')).toBe(false);
    });

    it('matches everything when it is the whole pattern', () => {
        expect(pathMatchesPattern('/**', '/')).toBe(true);
        expect(pathMatchesPattern('/**', '/a')).toBe(true);
        expect(pathMatchesPattern('/**', '/a/b/c')).toBe(true);
    });

    it('is segment-aligned — it cannot match half a segment', () => {
        // `.*` would let `/rep**` swallow "ort/x"; whole-segment semantics do not.
        expect(pathMatchesPattern('/rep/**', '/report')).toBe(false);
    });

    it('collapses consecutive steps, so N of them still match any depth', () => {
        // What the editor emits before collapsing is equivalent to a single `**`.
        expect(pathMatchesPattern('/**/**/**', '/')).toBe(true);
        expect(pathMatchesPattern('/**/**/**', '/a/b/c')).toBe(true);
    });
});

describe('pathMatchesPattern — normalisation and failure', () => {
    it('ignores a trailing slash on either side', () => {
        expect(pathMatchesPattern('/docs/guide/', '/docs/guide')).toBe(true);
        expect(pathMatchesPattern('/docs/guide', '/docs/guide/')).toBe(true);
    });

    it('escapes regex metacharacters in literal segments', () => {
        // `.` must be a literal dot, not "any char", or `/v1x2` would match.
        expect(pathMatchesPattern('/v1.2', '/v1.2')).toBe(true);
        expect(pathMatchesPattern('/v1.2', '/v1x2')).toBe(false);
    });
});

describe('pageMatches — no pattern is an exact path match', () => {
    it('compares paths only, ignoring query and hash on both sides', () => {
        expect(pageMatches('https://host.dev/docs/guide', '/docs/guide')).toBe(true);
        // the companion injects `?documentation-id`; it must not split the page.
        expect(pageMatches('https://host.dev/docs/guide?documentation-id=42', '/docs/guide')).toBe(true);
        expect(pageMatches('https://host.dev/docs/guide#install', '/docs/guide')).toBe(true);
        expect(pageMatches('https://host.dev/docs/other', '/docs/guide')).toBe(false);
    });

    it('is origin-independent, so a documentation can move between domains', () => {
        expect(pageMatches('http://localhost:3000/docs/guide', 'https://prod.io/docs/guide')).toBe(true);
    });

    it('a stored url carrying query params still matches on path alone', () => {
        // Capture keeps `?tab=` only to offer chips — it must not narrow scope.
        expect(pageMatches('https://github.com/Sanjay-George?tab=stars', GITHUB)).toBe(true);
    });
});

describe('pageMatches — a pattern replaces the exact match', () => {
    it('covers a family of pages while excluding unrelated ones', () => {
        const pattern = '/en/commonality/report/commonality/*';
        expect(pageMatches('https://host.dev/en/commonality/report/commonality/aaaa', REPORT, pattern)).toBe(true);
        expect(pageMatches('https://host.dev/en/commonality/report/financials/aaaa', REPORT, pattern)).toBe(false);
    });

    it('ignores the captured url entirely once a pattern is present', () => {
        // The note was made on /a, but the pattern says /b — the pattern wins.
        expect(pageMatches('https://host.dev/b', '/a', '/b')).toBe(true);
        expect(pageMatches('https://host.dev/a', '/a', '/b')).toBe(false);
    });

    it('treats a blank pattern as absent', () => {
        expect(pageMatches('https://host.dev/docs/guide', '/docs/guide', '   ')).toBe(true);
    });

    it('accepts a bare path as `here`, not just a full href', () => {
        expect(pageMatches('/docs/guide', '/docs/anything', '/docs/*')).toBe(true);
    });
});

describe('pageMatches — required query params', () => {
    const pattern = '/*?tab=repositories';

    it('matches any user page on the required tab', () => {
        expect(pageMatches('https://github.com/Sanjay-George?tab=repositories', GITHUB, pattern)).toBe(true);
        expect(pageMatches('https://github.com/someone-else?tab=repositories', GITHUB, pattern)).toBe(true);
    });

    it('rejects the same path on a different tab, or with the param absent', () => {
        expect(pageMatches('https://github.com/Sanjay-George?tab=stars', GITHUB, pattern)).toBe(false);
        expect(pageMatches('https://github.com/Sanjay-George', GITHUB, pattern)).toBe(false);
    });

    it('ignores params the pattern does not name', () => {
        // Subset match: extra params (paging, tracking) must not break the note.
        const here = 'https://github.com/Sanjay-George?tab=repositories&q=doc&page=2';
        expect(pageMatches(here, GITHUB, pattern)).toBe(true);
    });

    it('still enforces the path half', () => {
        expect(pageMatches('https://github.com/a/b?tab=repositories', GITHUB, pattern)).toBe(false);
    });

    it('supports a wildcard value, meaning "present with any value"', () => {
        expect(pageMatches('https://github.com/x?tab=stars', GITHUB, '/*?tab=*')).toBe(true);
        expect(pageMatches('https://github.com/x', GITHUB, '/*?tab=*')).toBe(false);
    });
});

describe('capturePageUrl — what a new note stores', () => {
    it('keeps the host’s own params and drops the companion’s', () => {
        const href = 'https://github.com/Sanjay-George?tab=repositories&documentation-id=42&api-host=x';
        expect(capturePageUrl(href)).toBe('/Sanjay-George?tab=repositories');
    });

    it('drops the hash, and omits the `?` when nothing is left', () => {
        expect(capturePageUrl('https://host.dev/docs/guide?documentation-id=42#install')).toBe('/docs/guide');
    });
});

describe('parsePageScope / buildPageScope — the chip-state codec', () => {
    const states = (scope: PageScope) => scope.states;

    it('reads an unscoped note as every chip exact and no param required', () => {
        const scope = parsePageScope(REPORT);
        expect(states(scope)).toEqual(['exact', 'exact', 'exact', 'exact', 'exact']);
        expect(buildPageScope(scope)).toBeUndefined();
    });

    it('emits undefined, not a redundant pattern, once every chip is exact again', () => {
        const scope = parsePageScope(REPORT, '/en/commonality/report/commonality/*');
        expect(states(scope)).toEqual(['exact', 'exact', 'exact', 'exact', 'any']);
        const cleared: PageScope = { ...scope, states: scope.states.map(() => 'exact' as SegmentState) };
        expect(buildPageScope(cleared)).toBeUndefined();
    });

    it('keeps the real labels so a wildcard can be toggled back', () => {
        const scope = parsePageScope(REPORT, '/en/**/commonality/59bb70f8');
        expect(scope.segments[1]).toBe('commonality');
        expect(states(scope)).toEqual(['exact', 'deep', 'exact', 'exact', 'exact']);
    });

    it('collapses a trailing run of `**` to one, and reads it back padded', () => {
        // 5 captured segments; the last 3 are deep. Storage keeps only one `**`…
        const scope: PageScope = {
            segments: ['en', 'commonality', 'report', 'commonality', '59bb70f8'],
            states: ['exact', 'exact', 'deep', 'deep', 'deep'],
            params: [],
        };
        expect(buildPageScope(scope)).toBe('/en/commonality/**');
        // …and the missing tail reads back as deep, so the chips are unchanged.
        expect(states(parsePageScope(REPORT, '/en/commonality/**'))).toEqual([
            'exact',
            'exact',
            'deep',
            'deep',
            'deep',
        ]);
    });

    it('builds the two headline scopes from their chip states', () => {
        const everywhere: PageScope = {
            segments: ['en', 'commonality'],
            states: ['deep', 'deep'],
            params: [],
        };
        expect(buildPageScope(everywhere)).toBe('/**');

        const githubScope = parsePageScope(GITHUB);
        expect(githubScope.params).toEqual([{ key: 'tab', value: 'repositories', required: false }]);
        expect(
            buildPageScope({
                ...githubScope,
                states: ['any'],
                params: [{ key: 'tab', value: 'repositories', required: true }],
            }),
        ).toBe('/*?tab=repositories');
    });

    it('round-trips a pattern that mixes both wildcards and a param', () => {
        const pattern = '/en/**/report/*/59bb70f8?tab=repositories';
        const scope = parsePageScope(`${REPORT}?tab=repositories`, pattern);
        expect(states(scope)).toEqual(['exact', 'deep', 'exact', 'any', 'exact']);
        expect(buildPageScope(scope)).toBe(pattern);
    });

    it('keeps a chip for a required param the current url does not have', () => {
        // Editing the note from a page without `?tab=` must not silently drop it.
        const scope = parsePageScope('/Sanjay-George', '/*?tab=repositories');
        expect(scope.params).toEqual([{ key: 'tab', value: 'repositories', required: true }]);
        expect(buildPageScope(scope)).toBe('/*?tab=repositories');
    });
});

describe('describePageScope — the plain-English line under the chips', () => {
    const scope = (states: SegmentState[], params: PageScope['params'] = []): PageScope => ({
        segments: states.map((_, i) => `s${i}`),
        states,
        params,
    });

    it('names each combination of wildcards', () => {
        expect(describePageScope(scope(['exact', 'exact']))).toBe('Only this exact page.');
        expect(describePageScope(scope(['exact', 'any']))).toBe('Any value where ∗ is.');
        expect(describePageScope(scope(['deep', 'exact']))).toBe('Any number of levels where ∗∗ is.');
        expect(describePageScope(scope(['deep', 'any']))).toBe(
            'Any number of levels where ∗∗ is, any value where ∗ is.',
        );
    });

    it('appends a clause for each required param, and none for ignored ones', () => {
        const ignored = [{ key: 'tab', value: 'repositories', required: false }];
        expect(describePageScope(scope(['any'], ignored))).toBe('Any value where ∗ is.');

        const required = [{ key: 'tab', value: 'repositories', required: true }];
        expect(describePageScope(scope(['any'], required))).toBe(
            'Any value where ∗ is. Only when tab=repositories.',
        );
    });
});

describe('reanchorScope — does re-anchoring move the note?', () => {
    it('an unscoped note stays put when re-anchored on its own page', () => {
        // The broken-pin fix: same page, so no confirmation and nothing to reset.
        const result = reanchorScope({ url: '/en/report/a' }, '/en/report/a');
        expect(result).toEqual({ movesPage: false, url: '/en/report/a', urlPattern: undefined });
    });

    it('an unscoped note moves when re-anchored on another page', () => {
        const result = reanchorScope({ url: '/en/report/a' }, '/en/financials/x');
        expect(result).toEqual({ movesPage: true, url: '/en/financials/x', urlPattern: undefined });
    });

    it('a scoped note re-anchored inside its own family keeps its pattern', () => {
        // /en/report/* already covers /en/report/b — landing there is a pin fix,
        // not a move, so the user is not prompted and the scope survives.
        const existing = { url: '/en/report/a', urlPattern: '/en/report/*' };
        expect(reanchorScope(existing, '/en/report/b')).toEqual({
            movesPage: false,
            url: '/en/report/b',
            urlPattern: '/en/report/*',
        });
    });

    it('a scoped note re-anchored outside its family resets to an exact match', () => {
        // /en/report/* does not cover /en/financials/x, so the pattern describes
        // pages the note no longer belongs to and must not survive the move.
        const existing = { url: '/en/report/a', urlPattern: '/en/report/*' };
        expect(reanchorScope(existing, '/en/financials/x')).toEqual({
            movesPage: true,
            url: '/en/financials/x',
            urlPattern: undefined,
        });
    });

    it('a note scoped to every page can never be moved off it', () => {
        const everywhere = { url: '/en/report/a', urlPattern: '/**' };
        expect(reanchorScope(everywhere, '/anything/at/all')).toEqual({
            movesPage: false,
            url: '/anything/at/all',
            urlPattern: '/**',
        });
    });

    it('reads required query params, so losing the param is a move', () => {
        const existing = { url: '/Sanjay-George?tab=repositories', urlPattern: '/*?tab=repositories' };
        // Still on the repositories tab of some profile — in scope.
        expect(reanchorScope(existing, '/someone-else?tab=repositories').movesPage).toBe(false);
        // Same path family, but the required param is gone — out of scope.
        expect(reanchorScope(existing, '/someone-else?tab=stars').movesPage).toBe(true);
        expect(reanchorScope(existing, '/someone-else').movesPage).toBe(true);
    });

    it('always sets urlPattern as an own property, never omits the key', () => {
        // The server persists `urlPattern ?? null`, so an absent key would leave
        // the stale pattern in Mongo rather than clearing it.
        const result = reanchorScope({ url: '/a', urlPattern: '/a/*' }, '/b');
        expect(Object.prototype.hasOwnProperty.call(result, 'urlPattern')).toBe(true);
        expect(result.urlPattern).toBeUndefined();
    });
});
