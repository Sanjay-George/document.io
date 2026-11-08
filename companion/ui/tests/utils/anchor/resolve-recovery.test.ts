import { afterEach, describe, expect, it } from 'vitest';
import { resolveAnchoredElement, type AnchorMeta } from '@/utils/anchor';
import { mount, resetDom } from '../../support/dom';

/**
 * The RECOVERY path: the stored selector resolves to nothing (class renamed,
 * element moved), so resolution rebuilds a candidate pool from the anchor's
 * identity signals and adopts the best only if it clears MIN_RECOVERY_SCORE (30).
 * A missing selector (`.rotted-away`) forces this path in every test here.
 *
 * Score weights (from scoreCandidate): id +100 · strong attr +40 · aria +40 ·
 * exact text +30 · prefix text +12 · role +8 · tag +5 · weak attr +15.
 */

const GONE = '.rotted-away';

afterEach(resetDom);

describe('resolveAnchoredElement — recovery threshold (min 30)', () => {
    // Each row forces recovery, then asserts whether the pool's best candidate
    // clears the cutoff. The score maths is spelled out per row.
    it.each([
        {
            name: 'strong attr data-testid (40+tag 5 = 45)',
            html: `<button data-testid="save-btn">Save</button>`,
            anchor: { selector: GONE, tag: 'button', attributes: { 'data-testid': 'save-btn' } },
            recovers: true,
        },
        {
            name: 'exact text (30+tag 5 = 35)',
            html: `<div>Quarterly Report</div>`,
            anchor: { selector: GONE, tag: 'div', text: 'Quarterly Report' },
            recovers: true,
        },
        {
            name: 'two weak attrs, exactly at the cutoff (15+15 = 30, tag differs)',
            html: `<input type="search" data-k="y" />`,
            anchor: { selector: GONE, tag: 'button', attributes: { type: 'search', 'data-k': 'y' } },
            recovers: true,
        },
        {
            name: 'one weak attr, below the cutoff (15)',
            html: `<input type="search" />`,
            anchor: { selector: GONE, tag: 'button', attributes: { type: 'search' } },
            recovers: false,
        },
        {
            name: 'structure only — tag + role, below the cutoff (5+8 = 13)',
            html: `<div role="dialog">x</div>`,
            anchor: { selector: GONE, tag: 'div', role: 'dialog' },
            recovers: false,
        },
    ] satisfies { name: string; html: string; anchor: AnchorMeta; recovers: boolean }[])(
        '$name → recovers=$recovers',
        ({ html, anchor, recovers }) => {
            mount(html);
            const el = document.body.firstElementChild;
            expect(document.querySelector(anchor.selector)).toBeNull(); // selector really is dead
            expect(resolveAnchoredElement(anchor.selector, anchor)).toBe(recovers ? el : null);
        },
    );
});

describe('resolveAnchoredElement — recovery candidate pool (gatherCandidates)', () => {
    it('recovers via id even when everything else changed', () => {
        mount(`<button id="run" class="brand-new">Analyse starten</button>`);
        const btn = document.querySelector('#run')!;
        const anchor: AnchorMeta = { selector: GONE, tag: 'button', id: 'run', text: 'Start Analysis' };
        expect(resolveAnchoredElement(GONE, anchor)).toBe(btn);
    });

    it('widens to a role/tag scan only when no id/attr narrowed the pool', () => {
        // No id/attrs on the anchor → the pool comes from the role scan; the
        // accessible name (+40) carries it over the threshold.
        mount(`
            <section role="region" aria-label="Cost breakdown">x</section>
            <section role="region" aria-label="Something else">y</section>
        `);
        const target = document.querySelector('[aria-label="Cost breakdown"]')!;
        const anchor: AnchorMeta = { selector: GONE, tag: 'section', role: 'region', ariaLabel: 'Cost breakdown' };
        expect(resolveAnchoredElement(GONE, anchor)).toBe(target);
    });

    it('caps the pool but still finds a strong match inside it', () => {
        // 600 same-tag siblings; the pool is sliced to MAX_POOL (500). The real
        // target is gathered by its test id (a narrow query), not the tag scan,
        // so the slice never drops it.
        const buttons = Array.from({ length: 600 }, (_, i) =>
            i === 550 ? `<button data-testid="the-one">x</button>` : `<button>x</button>`,
        ).join('');
        mount(`<div>${buttons}</div>`);
        const target = document.querySelector('[data-testid="the-one"]')!;
        const anchor: AnchorMeta = { selector: GONE, tag: 'button', attributes: { 'data-testid': 'the-one' } };
        expect(resolveAnchoredElement(GONE, anchor)).toBe(target);
    });
});

describe('queryAll safety (via resolution)', () => {
    it('treats a malformed selector as no match instead of throwing', () => {
        mount(`<button data-testid="x">ok</button>`);
        const anchor: AnchorMeta = { selector: '[unclosed', tag: 'button', attributes: { 'data-testid': 'x' } };
        // The broken selector yields [] (no throw); recovery then finds the button.
        expect(() => resolveAnchoredElement('[unclosed', anchor)).not.toThrow();
        expect(resolveAnchoredElement('[unclosed', anchor)).toBe(document.querySelector('button'));
    });
});
