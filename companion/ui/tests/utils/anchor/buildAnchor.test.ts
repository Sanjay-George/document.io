import { afterEach, describe, expect, it } from 'vitest';
import { buildAnchor } from '@/utils/anchor';
import { mount, resetDom } from '../../support/dom';

/**
 * `buildAnchor` captures the resilient fingerprint at annotation time. These
 * tests pin exactly which identity signals it records (and omits) for a given
 * element — the raw material every later resolution scores against.
 */

const TEXT_MAX = 120;

afterEach(resetDom);

describe('buildAnchor — attribute capture', () => {
    it('collects the stable identifying attributes', () => {
        mount(`<input name="q" placeholder="Search" type="search" value="hi" />`);
        const anchor = buildAnchor(document.querySelector('input')!);
        expect(anchor.attributes).toEqual({
            name: 'q',
            placeholder: 'Search',
            type: 'search',
            value: 'hi',
        });
    });

    it('sweeps up any other data-* attribute', () => {
        mount(`<div data-row="7" data-grid-col="name" aria-hidden="true" class="x"></div>`);
        const anchor = buildAnchor(document.querySelector('div')!);
        // data-* are app-assigned identifiers; non-data attrs like aria-hidden/class are not.
        expect(anchor.attributes).toEqual({ 'data-row': '7', 'data-grid-col': 'name' });
    });

    it('does not let the data-* sweep overwrite a stable attr of the same name', () => {
        mount(`<button data-testid="save">Save</button>`);
        const anchor = buildAnchor(document.querySelector('button')!);
        // data-testid is in STABLE_ATTRS; the sweep must dedupe, not double-capture.
        expect(anchor.attributes?.['data-testid']).toBe('save');
    });

    it('trims values and skips whitespace-only ones', () => {
        mount(`<button name="  go  " title="   " data-x="  ">go</button>`);
        const anchor = buildAnchor(document.querySelector('button')!);
        expect(anchor.attributes).toEqual({ name: 'go' });
    });

    it('omits attributes entirely when there are none', () => {
        mount(`<i class="icon"></i>`);
        expect(buildAnchor(document.querySelector('i')!).attributes).toBeUndefined();
    });
});

describe('buildAnchor — text', () => {
    it('normalises whitespace', () => {
        mount(`<button>  Start\n\t Analysis  </button>`);
        expect(buildAnchor(document.querySelector('button')!).text).toBe('Start Analysis');
    });

    it('keeps text of exactly the max length', () => {
        const exact = 'a'.repeat(TEXT_MAX);
        mount(`<button>${exact}</button>`);
        expect(buildAnchor(document.querySelector('button')!).text).toBe(exact);
    });

    it('truncates text longer than the max', () => {
        mount(`<button>${'a'.repeat(TEXT_MAX + 1)}</button>`);
        expect(buildAnchor(document.querySelector('button')!).text).toHaveLength(TEXT_MAX);
    });

    it('omits text for an empty element', () => {
        mount(`<i class="icon"></i>`);
        expect(buildAnchor(document.querySelector('i')!).text).toBeUndefined();
    });
});

describe('buildAnchor — scalar signals', () => {
    it('records id, role and accessible name; lowercases the tag', () => {
        mount(`<BUTTON id="run" role="switch" aria-label="Run it">Run</BUTTON>`);
        const anchor = buildAnchor(document.querySelector('#run')!);
        expect(anchor).toMatchObject({ tag: 'button', id: 'run', role: 'switch', ariaLabel: 'Run it' });
    });

    it('derives the accessible name from aria-labelledby', () => {
        mount(`<h2 id="t">Filters Panel</h2><section aria-labelledby="t"></section>`);
        expect(buildAnchor(document.querySelector('section')!).ariaLabel).toBe('Filters Panel');
    });

    it('leaves id/role/ariaLabel undefined when absent', () => {
        mount(`<div id="w"><i class="icon"></i></div>`);
        const anchor = buildAnchor(document.querySelector('i')!);
        expect(anchor.id).toBeUndefined();
        expect(anchor.role).toBeUndefined();
        expect(anchor.ariaLabel).toBeUndefined();
    });
});

describe('buildAnchor — context', () => {
    it('records identifying ancestors nearest-first, skipping anonymous wrappers', () => {
        mount(`<section id="panel"><div class="wrap"><button>x</button></div></section>`);
        const anchor = buildAnchor(document.querySelector('button')!);
        // div.wrap has no strong signal and is skipped; only #panel is kept.
        expect(anchor.context).toEqual([{ tag: 'section', id: 'panel' }]);
    });

    it('caps context at the three nearest identifying ancestors', () => {
        mount(`
            <div id="a"><div id="b"><div id="c"><div id="d"><button>x</button></div></div></div></div>
        `);
        const context = buildAnchor(document.querySelector('button')!).context!;
        expect(context.map((c) => c.id)).toEqual(['d', 'c', 'b']); // nearest 3, outermost #a dropped
    });

    it('omits context for a top-level element under body', () => {
        mount(`<button>x</button>`);
        expect(buildAnchor(document.querySelector('button')!).context).toBeUndefined();
    });
});
