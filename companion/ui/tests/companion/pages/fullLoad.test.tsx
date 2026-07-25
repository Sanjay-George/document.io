import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Annotation } from '@/models/annotations';
import { mountCompanion, type CompanionHandle } from '../../support/companion';

/**
 * Page type: a fully-loaded page (hard navigation / refresh). The anchored
 * element is either already in the DOM at mount, or hydrates shortly after —
 * the latter is the only case that exercises the MutationObserver + 150ms
 * debounce watcher. Both must end with the note pinned.
 */

const PAGE = '/en/product-analysis';

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

/** Append the element the note is anchored to, as the host page would render it. */
function renderAnchoredSection() {
    const section = document.createElement('section');
    section.id = 'parts-overview';
    document.body.appendChild(section);
}

describe('Full page load', () => {
    let companion: CompanionHandle;

    beforeEach(() => {
        window.history.replaceState({}, '', PAGE);
    });
    afterEach(() => {
        companion.unmount();
        document.body.innerHTML = '';
    });

    it('pins a note whose anchored element is present at mount', async () => {
        renderAnchoredSection();
        companion = await mountCompanion();
        await companion.waitForPins(1);
    });

    it('pins a note whose element hydrates after mount (MutationObserver path)', async () => {
        companion = await mountCompanion();
        expect(companion.pinCount()).toBe(0); // nothing to anchor yet

        // Late-arriving content, as a slow hydration would produce.
        await act(async () => {
            renderAnchoredSection();
        });
        await companion.waitForPins(1);
    });
});
