import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Annotation } from '@/models/annotations';

/**
 * Page type: an exported, self-contained HTML file. `window.__DOCIO_EXPORT__`
 * being present flips the companion into read-only mode and swaps the SWR
 * fetcher for the inlined payload — BOTH are decided at module load, so the
 * global must be set in `vi.hoisted`, before any import evaluates.
 *
 * For anchoring this means two things differ from a live page:
 *   - targets are baked to a unique `[data-docio-note-id]`, so resolution is an
 *     exact hit;
 *   - page-scope matching is bypassed entirely — an exported note pins on its
 *     page no matter what the current URL is.
 *
 * This file deliberately does NOT mock `@/data_access/*`; SWR resolves through
 * the real offline fetcher against the payload below.
 */

const noteEl = { id: 'n1', tag: 'section' };

vi.hoisted(() => {
    window.__DOCIO_EXPORT__ = {
        documentation: { id: 'doc-1', title: 'Exported Docs' },
        annotations: [
            {
                id: 'n1',
                value: 'Parts of this report',
                target: '[data-docio-note-id="n1"]', // baked unique target
                anchor: { selector: '[data-docio-note-id="n1"]', tag: 'section', id: 'parts-overview' },
                url: '/en/product-analysis',
                documentationId: 'doc-1',
                created: new Date(),
                updated: new Date(),
                type: 'component',
                index: 0,
            } as Annotation,
        ],
    };
});

// Imported after the global is set so READ_ONLY / the offline fetcher bind to it.
const { mountCompanion } = await import('../../support/companion');
type CompanionHandle = Awaited<ReturnType<typeof mountCompanion>>;

/** Stamp the element the export baked its note id onto. */
function renderBakedElement() {
    const section = document.createElement('section');
    section.id = 'parts-overview';
    section.setAttribute('data-docio-note-id', noteEl.id);
    document.body.appendChild(section);
}

describe('Exported read-only page', () => {
    let companion: CompanionHandle;

    afterEach(() => {
        companion.unmount();
        document.body.innerHTML = '';
    });

    it('pins an exported note regardless of the current path (page-match bypassed)', async () => {
        // A URL that does NOT match the note's captured page — a live companion
        // would show nothing here; the export ignores page scope.
        window.history.replaceState({}, '', '/some/unrelated/path');
        renderBakedElement();

        companion = await mountCompanion();
        await companion.waitForPins(1);
    });

    it('hides editing affordances', async () => {
        renderBakedElement();
        companion = await mountCompanion();
        await companion.waitForPins(1);

        const labels = Array.from(companion.shadow.querySelectorAll('button')).map((b) => b.textContent?.trim());
        expect(labels).not.toContain('Annotate'); // mode toggle is suppressed in read-only
    });
});

afterEach(() => {
    // Leave no export flag behind for other files sharing the process pool.
    delete window.__DOCIO_EXPORT__;
});
