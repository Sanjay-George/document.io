import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Annotation } from '@/models/annotations';
import { mountCompanion, type CompanionHandle } from '../../support/companion';

/**
 * Page type: a single-page app that swaps routes via the History API without a
 * reload. The companion patches pushState/replaceState and listens for popstate;
 * because the router changes the URL *before* it renders the new route, arriving
 * on a note's page must still pin it once its DOM appears.
 *
 * Timing discipline: push the URL in one `act()` and mutate the DOM in a
 * *separate* `act()`. Collapsing them into one hides the very race these tests
 * exist to cover.
 */

const PAGE = '/en/product-analysis';
const OTHER = '/en/products';

const { annotation } = vi.hoisted(() => ({
    annotation: {
        id: 'n1',
        value: 'Parts of this report',
        target: '#parts-overview',
        anchor: { selector: '#parts-overview', tag: 'section', id: 'parts-overview' },
        url: '/en/product-analysis',
        documentationId: 'doc-1',
        created: new Date(),
        updated: new Date(),
        type: 'component',
        index: 0,
    } as Annotation,
}));

vi.mock('@/data_access/documentations', () => ({
    useDocumentation: () => ({ data: { title: 'Docs' }, isLoading: false, error: null }),
}));
vi.mock('@/data_access/annotations', () => ({
    ALL_ANNOTATIONS_KEY: (id: string) => `/documentations/${id}/annotations`,
    SINGLE_ANNOTATION_KEY: (id: string) => `/annotations/${id}`,
    addAnnotation: vi.fn(),
    deleteAnnotation: vi.fn(),
    updateAnnotation: vi.fn(),
    updateAnnotations: vi.fn(),
    useAnnotations: () => ({ data: [annotation], isLoading: false, error: null }),
}));

function renderAnchoredSection() {
    const section = document.createElement('section');
    section.id = 'parts-overview';
    document.body.appendChild(section);
}
function removeAnchoredSection() {
    document.querySelector('#parts-overview')?.remove();
}

describe('SPA navigation', () => {
    let companion: CompanionHandle;

    beforeEach(() => {
        // Start away from the note's page — nothing to pin yet.
        window.history.replaceState({}, '', OTHER);
    });
    afterEach(() => {
        companion.unmount();
        window.history.replaceState({}, '', '/');
        document.body.innerHTML = '';
    });

    it('pins the note after arriving on its page via pushState', async () => {
        companion = await mountCompanion();
        expect(companion.pinCount()).toBe(0);

        await act(async () => window.history.pushState({}, '', PAGE));
        await act(async () => renderAnchoredSection());

        await companion.waitForPins(1);
    });

    it('pins the note after arriving via replaceState', async () => {
        companion = await mountCompanion();

        await act(async () => window.history.replaceState({}, '', PAGE));
        await act(async () => renderAnchoredSection());

        await companion.waitForPins(1);
    });

    it('pins the note after a popstate (back/forward) navigation', async () => {
        companion = await mountCompanion();

        await act(async () => {
            window.history.replaceState({}, '', PAGE);
            // jsdom's history.back() is async/unreliable — dispatch popstate directly.
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
        await act(async () => renderAnchoredSection());

        await companion.waitForPins(1);
    });

    it('drops the pin when navigation leaves the note behind', async () => {
        window.history.replaceState({}, '', PAGE);
        renderAnchoredSection();
        companion = await mountCompanion();
        await companion.waitForPins(1);

        await act(async () => {
            window.history.pushState({}, '', OTHER);
            removeAnchoredSection();
        });

        await companion.waitForPins(0);
    });

    it('restores the native history methods on unmount', async () => {
        const nativePush = window.history.pushState;
        const nativeReplace = window.history.replaceState;

        companion = await mountCompanion();
        expect(window.history.pushState).not.toBe(nativePush); // patched while mounted

        companion.unmount();
        expect(window.history.pushState).toBe(nativePush); // and cleanly restored
        expect(window.history.replaceState).toBe(nativeReplace);
    });
});
