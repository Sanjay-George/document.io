import { afterEach, describe, expect, it } from 'vitest';
import { buildAnchor, resolveAnchoredElement, type AnchorMeta } from '@/utils/anchor';

/** Render `html` into the document body and return the root's first element. */
function mount(html: string): void {
    document.body.innerHTML = html;
}

function byText(tag: string, text: string): HTMLElement {
    const el = Array.from(document.querySelectorAll<HTMLElement>(tag)).find(
        (e) => e.textContent?.trim() === text,
    );
    if (!el) throw new Error(`no <${tag}> with text "${text}"`);
    return el;
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('resolveAnchoredElement — selector rot onto a sibling', () => {
    it('Path A: single-match rot → broken, not the neighbour (the Excel Export bug)', () => {
        // Two sibling buttons sharing a class inside an identifiable toolbar.
        mount(`
            <div id="analysis-toolbar">
                <button class="btn">Start Analysis</button>
                <button class="btn">Excel Export</button>
            </div>
        `);
        const startBtn = byText('button', 'Start Analysis');
        const exportBtn = byText('button', 'Excel Export');
        const anchor = buildAnchor(startBtn);

        // The stored selector is positional and rots onto the sibling once the
        // real target is gone — this is what makes the scenario dangerous.
        startBtn.remove();
        expect(document.querySelector(anchor.selector)).toBe(exportBtn);

        // ...but the fingerprint (text "Start Analysis") doesn't corroborate the
        // export button, and a shared toolbar ancestor (+25) + tag (+5) must NOT
        // be enough to recover it either.
        expect(resolveAnchoredElement(anchor.selector, anchor)).toBeNull();
    });

    it('Path B: multi-match rot → broken when none corroborates', () => {
        mount(`
            <button class="act">Excel Export</button>
            <button class="act">Print</button>
        `);
        // Anchor for a now-removed "Start Analysis" whose selector matches both.
        const anchor: AnchorMeta = { selector: 'button.act', tag: 'button', text: 'Start Analysis' };
        expect(document.querySelectorAll(anchor.selector)).toHaveLength(2);

        expect(resolveAnchoredElement('button.act', anchor)).toBeNull();
    });

    it('Path B: multi-match → picks the corroborating element, not merely the first', () => {
        mount(`
            <button class="act">Excel Export</button>
            <button class="act">Start Analysis</button>
        `);
        const target = byText('button', 'Start Analysis');
        const anchor: AnchorMeta = { selector: 'button.act', tag: 'button', text: 'Start Analysis' };

        expect(resolveAnchoredElement('button.act', anchor)).toBe(target);
    });
});

describe('resolveAnchoredElement — genuine matches still resolve', () => {
    it('exact match with a corroborating fingerprint returns the element', () => {
        mount(`<div id="tb"><button class="btn">Start Analysis</button></div>`);
        const btn = byText('button', 'Start Analysis');
        const anchor = buildAnchor(btn);

        expect(resolveAnchoredElement(anchor.selector, anchor)).toBe(btn);
    });

    it('an id-identified element survives a full text change (translation)', () => {
        mount(`<button id="run" class="btn">Start Analysis</button>`);
        const btn = byText('button', 'Start Analysis');
        const anchor = buildAnchor(btn);
        expect(anchor.selector).toBe('#run');

        btn.textContent = 'Analyse starten';
        // The id selector can't rot, and the id itself corroborates — text is moot.
        expect(resolveAnchoredElement(anchor.selector, anchor)).toBe(btn);
    });

    it('tolerates a minor label edit via text-prefix corroboration', () => {
        mount(`<div id="c"><button class="b">Start Analysis</button></div>`);
        const btn = byText('button', 'Start Analysis');
        const anchor = buildAnchor(btn);

        btn.textContent = 'Start Analysis (beta)';
        expect(resolveAnchoredElement(anchor.selector, anchor)).toBe(btn);
    });

    it('an identity-poor element (no id/aria/text) keeps plain selector-trust', () => {
        mount(`<div id="wrap"><i class="icon"></i></div>`);
        const icon = document.querySelector<HTMLElement>('i.icon')!;
        const anchor = buildAnchor(icon);
        // Nothing to verify against → the selector is trusted as-is.
        expect(resolveAnchoredElement(anchor.selector, anchor)).toBe(icon);
    });

    it('recovers via a strong signal when the selector rots to zero matches', () => {
        mount(`<div id="d"><button class="old" data-testid="run-btn">Start</button></div>`);
        const btn = document.querySelector<HTMLElement>('button')!;
        const anchor = buildAnchor(btn);

        // Class-based selector rots to nothing; the test id still recovers it.
        btn.className = 'new';
        expect(document.querySelector(anchor.selector)).toBeNull();
        expect(resolveAnchoredElement(anchor.selector, anchor)).toBe(btn);
    });
});
