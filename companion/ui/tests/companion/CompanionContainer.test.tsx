import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Annotation } from '@/models/annotations';

const DOC_ID = 'doc-1';
const PAGE = '/en/product-analysis';
const PIN = 'button.rounded-dio-badge';

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

import CompanionContainer from '@/companion/CompanionContainer';

/** Mount the element the note is anchored to, as a host router would on render. */
function renderHostPage() {
    const section = document.createElement('section');
    section.id = 'parts-overview';
    document.body.appendChild(section);
}

/** Poll until `check` holds — the DOM watcher debounces, so pins land async. */
async function waitFor(check: () => boolean, timeout = 2000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        if (check()) return;
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 25));
        });
    }
    throw new Error('timed out waiting for condition');
}

describe('CompanionContainer anchoring', () => {
    let root: Root;
    let container: HTMLDivElement;

    beforeEach(() => {
        vi.stubEnv('VITE_APP_ENV', 'test');
        // jsdom has no layout: the overlay drops notes it measures as zero-sized.
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
            top: 40, left: 40, width: 200, height: 80, bottom: 120, right: 240, x: 40, y: 40,
            toJSON: () => ({}),
        } as DOMRect);

        document.body.innerHTML = `<div id="document-io-root" data-documentation-id="${DOC_ID}"></div>`;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        document.body.innerHTML = '';
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    const mount = async () => {
        await act(async () => {
            root.render(<CompanionContainer />);
        });
    };

    it('pins a note whose page is loaded directly', async () => {
        window.history.replaceState({}, '', PAGE);
        renderHostPage();
        await mount();

        await waitFor(() => container.querySelectorAll(PIN).length === 1);
    });

    // Regression: the host router changes the URL *before* it renders the route,
    // so a single re-check at navigation time always misses the new page's DOM.
    it('pins a note on a page reached by SPA navigation', async () => {
        window.history.replaceState({}, '', '/en/products');
        await mount();
        expect(container.querySelectorAll(PIN)).toHaveLength(0);

        await act(async () => {
            window.history.pushState({}, '', PAGE);
        });
        await act(async () => {
            renderHostPage();
        });

        await waitFor(() => container.querySelectorAll(PIN).length === 1);
    });

    it('drops pins when SPA navigation leaves the note behind', async () => {
        window.history.replaceState({}, '', PAGE);
        renderHostPage();
        await mount();
        await waitFor(() => container.querySelectorAll(PIN).length === 1);

        await act(async () => {
            window.history.pushState({}, '', '/en/products');
            document.querySelector('#parts-overview')?.remove();
        });

        await waitFor(() => container.querySelectorAll(PIN).length === 0);
    });
});
