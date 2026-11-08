import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Annotation } from '@/models/annotations';
import { updateAnnotation } from '@/data_access/annotations';
import { mountCompanion, type CompanionHandle } from '../../support/companion';

/**
 * Page type: re-anchoring a note that carries a `urlPattern`. Because
 * `pageMatches` ignores `url` whenever a pattern is present, the pattern — not
 * the stored url — is what decides where a note shows. So the re-anchor write
 * path has to move the *scope*, not just the anchor, or the note silently keeps
 * matching the family it was dragged out of.
 *
 * These drive the real UI (expand card → Re-anchor → pick an element) and assert
 * the payload that reaches `updateAnnotation`, since the bug was an omitted field
 * in exactly that payload.
 */

const IN_FAMILY = '/en/report/b';
const OUT_OF_FAMILY = '/en/financials/x';

const { annotation } = vi.hoisted(() => ({
    annotation: {
        id: 'n1',
        title: 'Scoped note',
        value: 'Applies to every report',
        target: '#anchor',
        anchor: { selector: '#anchor', tag: 'section', id: 'anchor' },
        url: '/en/report/a',
        urlPattern: '/en/report/*',
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

function renderAnchor() {
    const section = document.createElement('section');
    section.id = 'anchor';
    document.body.appendChild(section);
}

/** The element the note will be re-anchored onto, on whatever page we're on. */
function renderNewTarget() {
    const section = document.createElement('section');
    section.id = 'new-target';
    document.body.appendChild(section);
}

/** Buttons live inside the companion's shadow root; find one by its label. */
function clickByText(handle: CompanionHandle, text: string) {
    const button = [...handle.shadow.querySelectorAll('button')].find((b) =>
        b.textContent?.includes(text),
    );
    if (!button) throw new Error(`no button matching “${text}”`);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
}

/** Enter re-anchor mode: expand the note's card, then hit Re-anchor. */
async function startReanchor(handle: CompanionHandle) {
    // The card's action row only renders once the card is selected; the title
    // span bubbles its click up to the card's onSelect.
    await act(async () => {
        const title = [...handle.shadow.querySelectorAll('span')].find(
            (el) => el.textContent === 'Scoped note',
        );
        if (!title) throw new Error('note card not rendered');
        title.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    });
    await act(async () => clickByText(handle, 'Re-anchor'));
}

/** Click the pickable element, completing the re-anchor. */
async function pickNewTarget() {
    await act(async () => {
        document
            .querySelector('#new-target')!
            .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
}

const dialogText = (handle: CompanionHandle) => handle.shadow.textContent ?? '';

describe('re-anchoring a scoped note', () => {
    let companion: CompanionHandle;

    beforeEach(() => {
        vi.mocked(updateAnnotation).mockClear();
        window.history.replaceState({}, '', '/en/report/a');
        renderAnchor();
    });
    afterEach(() => {
        companion.unmount();
        window.history.replaceState({}, '', '/');
        document.body.innerHTML = '';
    });

    it('applies silently and keeps the pattern within the note’s own family', async () => {
        companion = await mountCompanion();
        await companion.waitForPins(1);
        await startReanchor(companion);

        // /en/report/* already covers /en/report/b — this is a pin fix, not a move.
        await act(async () => window.history.pushState({}, '', IN_FAMILY));
        renderNewTarget();
        await pickNewTarget();

        expect(dialogText(companion)).not.toContain('Move note to this page?');
        expect(vi.mocked(updateAnnotation)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(updateAnnotation).mock.calls[0][1]).toMatchObject({
            target: '#new-target',
            url: IN_FAMILY,
            urlPattern: '/en/report/*',
        });
    });

    it('confirms before leaving the family, and resets the scope on confirm', async () => {
        companion = await mountCompanion();
        await companion.waitForPins(1);
        await startReanchor(companion);

        await act(async () => window.history.pushState({}, '', OUT_OF_FAMILY));
        renderNewTarget();
        await pickNewTarget();

        // Nothing is written until the user accepts the move.
        expect(dialogText(companion)).toContain('Move note to this page?');
        expect(dialogText(companion)).toContain('reset its scope to that one page');
        expect(vi.mocked(updateAnnotation)).not.toHaveBeenCalled();

        await act(async () => clickByText(companion, 'Move it here'));

        const payload = vi.mocked(updateAnnotation).mock.calls[0][1];
        expect(payload).toMatchObject({ target: '#new-target', url: OUT_OF_FAMILY });
        // The old pattern described pages the note no longer belongs to. It must
        // be written as an explicit undefined — the server persists `?? null`, so
        // an omitted key would leave the stale pattern in place.
        expect(payload.urlPattern).toBeUndefined();
        expect(Object.prototype.hasOwnProperty.call(payload, 'urlPattern')).toBe(true);
    });

    it('writes nothing when the move is cancelled', async () => {
        companion = await mountCompanion();
        await companion.waitForPins(1);
        await startReanchor(companion);

        await act(async () => window.history.pushState({}, '', OUT_OF_FAMILY));
        renderNewTarget();
        await pickNewTarget();
        await act(async () => clickByText(companion, 'Cancel'));

        expect(vi.mocked(updateAnnotation)).not.toHaveBeenCalled();
    });
});
