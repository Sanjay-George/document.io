import { afterEach, describe, expect, it } from 'vitest';
import { type AnchorMeta, type AnchorScope, anchorSignals, resolveAnchoredElement } from '@/utils/anchor';
import { byText, mount, resetDom } from '../../support/dom';

/**
 * Resolution under an explicit `AnchorScope` — the per-signal strictness the
 * composer's anchor editor writes. Three states, one rule each:
 *   required  the candidate must carry it (all of them, an AND)
 *   hint      only ranks the survivors
 *   ignored   invisible to both
 *
 * The default path (no stored scope) is a *different*, more forgiving contract —
 * any one strong signal corroborates — and is covered by resolve-direct.test.ts /
 * resolve-recovery.test.ts. The last block here pins that separation down.
 */

afterEach(resetDom);

/** The docs' running example, with a full fingerprint to loosen or tighten. */
const START_ANALYSIS: AnchorMeta = {
    selector: 'button.act',
    tag: 'button',
    id: 'start-analysis',
    text: 'Start Analysis',
    attributes: { 'data-testid': 'analysis-btn' },
};

/** Every signal at `state`, so each test only says what it changes. */
function scopeOf(anchor: AnchorMeta, state: AnchorScope[string]): AnchorScope {
    return Object.fromEntries(anchorSignals(anchor).map((s) => [s.key, state]));
}

describe('required signals gate — all of them must match', () => {
    it('rejects a selector match that lost the required id', () => {
        // The button survived a rebuild that dropped its id; text still matches.
        mount(`<button class="act">Start Analysis</button>`);
        const scope: AnchorScope = { ...scopeOf(START_ANALYSIS, 'hint'), id: 'required' };
        expect(resolveAnchoredElement('button.act', START_ANALYSIS, scope)).toBeNull();
    });

    it('accepts it once the required id is back', () => {
        mount(`<button class="act" id="start-analysis">Start Analysis</button>`);
        const scope: AnchorScope = { ...scopeOf(START_ANALYSIS, 'hint'), id: 'required' };
        expect(resolveAnchoredElement('button.act', START_ANALYSIS, scope)).toBe(
            document.querySelector('button.act'),
        );
    });

    it('needs every required signal, not just one', () => {
        // id matches, text does not — an OR gate would accept this, AND must not.
        mount(`<button class="act" id="start-analysis">Start Diagnostics</button>`);
        const scope: AnchorScope = {
            ...scopeOf(START_ANALYSIS, 'hint'),
            id: 'required',
            text: 'required',
        };
        expect(resolveAnchoredElement('button.act', START_ANALYSIS, scope)).toBeNull();
    });
});

describe('hint signals rank but never gate', () => {
    it('picks the higher-scoring twin without excluding the other', () => {
        mount(`
            <button class="act">Start Analysis</button>
            <button class="act" id="start-analysis" data-testid="analysis-btn">Start Analysis</button>
        `);
        // Nothing required: both survive the (empty) gate, so score decides —
        // id (100) + test id (40) + text (30) + tag (5) beats text + tag.
        const scope = scopeOf(START_ANALYSIS, 'hint');
        expect(resolveAnchoredElement('button.act', START_ANALYSIS, scope)).toBe(
            document.getElementById('start-analysis'),
        );
    });
});

describe('ignored signals are invisible to scoring', () => {
    it('lets a lower-scoring element win once the winner’s edge is ignored', () => {
        mount(`
            <button class="act" id="start-analysis">Other label</button>
            <button class="act">Start Analysis</button>
        `);
        // With `id` ignored, the first button scores tag (5) only, while the
        // second scores text (30) + tag (5) — so the text match wins.
        const scope: AnchorScope = { ...scopeOf(START_ANALYSIS, 'hint'), id: 'ignored' };
        expect(resolveAnchoredElement('button.act', START_ANALYSIS, scope)).toBe(
            byText('button', 'Start Analysis'),
        );
    });
});

describe('a required position pins the note to its selector', () => {
    const anchor: AnchorMeta = { ...START_ANALYSIS, selector: 'button.act' };

    it('refuses to recover when the selector no longer resolves', () => {
        // The element is still on the page under a new class — recovery would
        // find it by id, but `position: required` forbids looking past the selector.
        mount(`<button class="renamed" id="start-analysis">Start Analysis</button>`);
        const scope: AnchorScope = { ...scopeOf(anchor, 'hint'), position: 'required' };
        expect(resolveAnchoredElement('button.act', anchor, scope)).toBeNull();
    });

    it('recovers by identity when the position is only a hint', () => {
        mount(`<button class="renamed" id="start-analysis">Start Analysis</button>`);
        const scope = scopeOf(anchor, 'hint');
        expect(resolveAnchoredElement('button.act', anchor, scope)).toBe(
            document.getElementById('start-analysis'),
        );
    });
});

describe('a scope only constrains signals it names', () => {
    it('treats an unknown key as a hint, so an old scope cannot gate on a new signal', () => {
        mount(`<button class="act" id="start-analysis">Start Analysis</button>`);
        // Saved before the element gained `data-testid`: the scope says nothing
        // about it, so it must rank only — never reject.
        const scope: AnchorScope = { id: 'required' };
        expect(resolveAnchoredElement('button.act', START_ANALYSIS, scope)).toBe(
            document.querySelector('button.act'),
        );
    });
});

describe('the default path is left alone', () => {
    it('accepts a text-only match that an all-required scope would reject', () => {
        mount(`<button class="act">Start Analysis</button>`);
        // Same DOM, same anchor — only the presence of a scope differs.
        expect(resolveAnchoredElement('button.act', START_ANALYSIS)).toBe(
            document.querySelector('button.act'),
        );
        expect(resolveAnchoredElement('button.act', START_ANALYSIS, scopeOf(START_ANALYSIS, 'required'))).toBeNull();
    });

    it('treats the null a reset writes to the database as no scope at all', () => {
        // The server persists `anchorScope ?? null`, so notes come back with a
        // literal null the `AnchorScope | undefined` type doesn't admit.
        mount(`<button class="act">Start Analysis</button>`);
        const fromDatabase = null as unknown as undefined;
        expect(resolveAnchoredElement('button.act', START_ANALYSIS, fromDatabase)).toBe(
            document.querySelector('button.act'),
        );
    });
});
