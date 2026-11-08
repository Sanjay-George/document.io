import { afterEach, describe, expect, it } from 'vitest';
import { resolveAnchoredElement, type AnchorMeta } from '@/utils/anchor';
import { byText, mount, resetDom } from '../../support/dom';

/**
 * The DIRECT path: the stored selector still resolves. Resolution keeps only the
 * matches that corroborate the anchor's discriminating identity (the "gate"),
 * then picks the highest-scoring one. When the anchor has no discriminating
 * identity there is nothing to verify, so the selector is trusted as-is.
 *
 * See resolve-recovery.test.ts for the selector-rots-to-nothing path.
 */

afterEach(resetDom);

describe('resolveAnchoredElement — legacy notes without an anchor', () => {
    it('returns the first selector match', () => {
        mount(`<button>a</button><button>b</button>`);
        expect(resolveAnchoredElement('button')).toBe(document.querySelector('button'));
    });

    it('returns null when the selector matches nothing', () => {
        mount(`<div></div>`);
        expect(resolveAnchoredElement('button')).toBeNull();
    });
});

describe('resolveAnchoredElement — the identity gate', () => {
    it('an identity-poor anchor trusts the selector even with siblings', () => {
        mount(`<i class="icon"></i><i class="icon"></i>`);
        const first = document.querySelector('i.icon')!;
        // No id/aria/text/strong-attr → nothing to verify → plain selector trust.
        const anchor: AnchorMeta = { selector: 'i.icon', tag: 'i' };
        expect(resolveAnchoredElement('i.icon', anchor)).toBe(first);
    });

    it('picks the corroborating match over a non-corroborating one', () => {
        mount(`<button class="act">Print</button><button class="act">Start Analysis</button>`);
        const target = byText('button', 'Start Analysis');
        const anchor: AnchorMeta = { selector: 'button.act', tag: 'button', text: 'Start Analysis' };
        expect(resolveAnchoredElement('button.act', anchor)).toBe(target);
    });

    it('returns the first when several matches score equally (tie → first)', () => {
        mount(`<button class="act">Save</button><button class="act">Save</button>`);
        const [first] = Array.from(document.querySelectorAll<HTMLElement>('button.act'));
        const anchor: AnchorMeta = { selector: 'button.act', tag: 'button', text: 'Save' };
        expect(resolveAnchoredElement('button.act', anchor)).toBe(first);
    });
});

describe('resolveAnchoredElement — context breaks a tie between twins', () => {
    // The motivating case: the same widget in two sections, indistinguishable by
    // its own signals; the stored ancestor context pulls resolution to the right copy.
    const twoPanels = `
        <div id="panel-a" role="tabpanel"><button class="save">Save</button></div>
        <div id="panel-b" role="tabpanel"><button class="save">Save</button></div>
    `;

    it('prefers the twin under the recorded ancestor id (+25)', () => {
        mount(twoPanels);
        const target = document.querySelector('#panel-b > button.save')!;
        const anchor: AnchorMeta = {
            selector: 'button.save', // matches BOTH buttons
            tag: 'button',
            text: 'Save',
            context: [{ tag: 'div', id: 'panel-b', role: 'tabpanel' }],
        };
        expect(resolveAnchoredElement('button.save', anchor)).toBe(target);
    });

    it('prefers the twin under an ancestor identified only by accessible name (+10)', () => {
        // Sections distinguished purely by aria-label (no id, no role) — a shape
        // strongAncestorRef records, so ancestorMatches must honour it.
        mount(`
            <section aria-label="Revenue"><button class="save">Save</button></section>
            <section aria-label="Costs"><button class="save">Save</button></section>
        `);
        const target = document.querySelector('[aria-label="Costs"] > button.save')!;
        const anchor: AnchorMeta = {
            selector: 'button.save',
            tag: 'button',
            text: 'Save',
            context: [{ tag: 'section', ariaLabel: 'Costs' }],
        };
        expect(resolveAnchoredElement('button.save', anchor)).toBe(target);
    });

    it('does not fall through from a missing ancestor id to its role', () => {
        mount(twoPanels);
        const [firstTwin] = Array.from(document.querySelectorAll<HTMLElement>('button.save'));
        const anchor: AnchorMeta = {
            selector: 'button.save',
            tag: 'button',
            text: 'Save',
            // The id is gone from the page but the ref still carries role=tabpanel.
            // ancestorMatches must NOT reward the role once the id branch misses —
            // so neither twin gets context points and the first wins the tie.
            context: [{ tag: 'div', id: 'panel-gone', role: 'tabpanel' }],
        };
        expect(resolveAnchoredElement('button.save', anchor)).toBe(firstTwin);
    });
});
