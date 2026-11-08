import { afterEach, describe, expect, it } from 'vitest';
import { getQuerySelector } from '@/utils';
import { HOVERED_ELEMENT_CLASS } from '@/utils/constants';
import { mount, resetDom } from '../../support/dom';

/**
 * `getQuerySelector` builds the positional CSS selector stored as a note's
 * `target`. It is deliberately structural (tag + classes + `:nth-of-type`), which
 * is *why* it can rot onto a sibling — the resilience lives in `AnchorMeta`, not
 * here. These tests pin the selector-string it produces for each shape.
 */

afterEach(resetDom);

describe('getQuerySelector — guard', () => {
    it('throws when the input is not an element', () => {
        // The runtime guard protects callers passing a text node / null.
        expect(() => getQuerySelector(null as unknown as HTMLElement)).toThrow(
            'The provided input is not a DOM element',
        );
        const textNode = document.createTextNode('x') as unknown as HTMLElement;
        expect(() => getQuerySelector(textNode)).toThrow('not a DOM element');
    });
});

describe('getQuerySelector — short-circuits', () => {
    it('an id wins outright, no path walk', () => {
        mount(`<div><button id="run" class="btn">Run</button></div>`);
        expect(getQuerySelector(document.querySelector('#run')!)).toBe('#run');
    });

    it('escapes an id containing CSS metacharacters', () => {
        mount(`<button id="a:b">x</button>`);
        // A raw `#a:b` would parse as `#a` + `:b` pseudo — CSS.escape prevents that.
        expect(getQuerySelector(document.querySelector('button')!)).toBe(`#${CSS.escape('a:b')}`);
    });

    it('the body (without an id) serialises to "body"', () => {
        expect(getQuerySelector(document.body)).toBe('body');
    });
});

describe('getQuerySelector — class list', () => {
    it('keeps real classes and escapes them', () => {
        // Single unique element → the class part alone is unique, so it stops here.
        mount(`<span class="a b"></span>`);
        expect(getQuerySelector(document.querySelector('span')!)).toBe('span.a.b:nth-of-type(1)');
    });

    it('drops empty/whitespace tokens', () => {
        mount(`<i class="  solo  "></i>`);
        expect(getQuerySelector(document.querySelector('i')!)).toBe('i.solo:nth-of-type(1)');
    });

    it('filters the reserved hovered-element class', () => {
        mount(`<i class="icon ${HOVERED_ELEMENT_CLASS}"></i>`);
        // The transient hover class must never leak into a stored selector.
        expect(getQuerySelector(document.querySelector('i')!)).toBe('i.icon:nth-of-type(1)');
    });

    it('produces a bare tag when every class is filtered out', () => {
        mount(`<i class="${HOVERED_ELEMENT_CLASS}"></i>`);
        expect(getQuerySelector(document.querySelector('i')!)).toBe('i:nth-of-type(1)');
    });
});

describe('getQuerySelector — :nth-of-type', () => {
    it('counts only same-tag preceding siblings', () => {
        mount(`
            <div id="host">
                <span></span>
                <button class="b">1</button>
                <span></span>
                <button class="b">2</button>
            </div>
        `);
        const second = Array.from(document.querySelectorAll('button')).at(1)!;
        // Two <span>s sit between/around the buttons but don't affect the count.
        const sel = getQuerySelector(second);
        expect(sel.endsWith('button.b:nth-of-type(2)')).toBe(true);
        expect(document.querySelector(sel)).toBe(second);
    });

    it('climbs and joins ancestors until the selector is unique', () => {
        // Two identical leaves force the walk to add a distinguishing ancestor.
        mount(`
            <section class="s"><div class="row"><button class="b">x</button></div></section>
            <section class="s"><div class="row"><button class="b">y</button></div></section>
        `);
        const target = Array.from(document.querySelectorAll('button')).at(1)!;
        const sel = getQuerySelector(target);
        expect(sel).toContain(' > ');
        expect(document.querySelectorAll(sel)).toHaveLength(1);
        expect(document.querySelector(sel)).toBe(target);
    });
});
