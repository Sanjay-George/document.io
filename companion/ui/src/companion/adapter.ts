import { Annotation } from '@/models/annotations';
import { Draft, Note } from '@/companion/types';

/**
 * Bridge between the persisted `Annotation` model (data_access / models) and the
 * companion's `Note` view-model. Keeping this mapping in one place is what lets
 * the companion components drop in over the existing list/editor views.
 *
 * Field mapping:
 *   Annotation.target       → Note.selector
 *   Annotation.value        → Note.body
 *   Annotation.title        → Note.title   ('No title' for legacy notes with none)
 *   Annotation.type         → Note.type    (same 'page' | 'component' union)
 * `n`, `onPage` and `broken` are presentation state resolved by the container
 * (list order + live-DOM matching), not stored on the annotation.
 */

/** Runtime state the container resolves per annotation against the live page. */
export type NoteFlags = { onPage?: boolean; broken?: boolean };

/** Map one persisted annotation to a numbered Note. */
export function toNote(annotation: Annotation, n: number, flags: NoteFlags = {}): Note {
    return {
        id: annotation.id ?? '',
        n,
        type: annotation.type,
        selector: annotation.target,
        anchor: annotation.anchor,
        anchorScope: annotation.anchorScope,
        url: annotation.url,
        title: annotation.title || 'No title',
        body: annotation.value,
        onPage: flags.onPage,
        broken: flags.broken,
    };
}

/**
 * Map a list of annotations to Notes, sorted by `index` and numbered 1..N.
 * `flagsFor` lets the caller supply live on-page / broken state per annotation.
 */
export function toNotes(annotations: Annotation[], flagsFor?: (a: Annotation) => NoteFlags): Note[] {
    return [...annotations]
        .sort((a, b) => a.index - b.index)
        .map((a, i) => toNote(a, i + 1, flagsFor?.(a)));
}

/** Build a composer Draft from an existing annotation (for the Edit flow). */
export function draftFromAnnotation(annotation: Annotation): Draft {
    return {
        type: annotation.type,
        selector: annotation.target,
        anchor: annotation.anchor,
        anchorScope: annotation.anchorScope,
        url: annotation.url,
        urlPattern: annotation.urlPattern,
        title: annotation.title ?? '',
        body: annotation.value,
    };
}

/** Persisted fields produced from a composer Draft (for add/update calls). */
export type AnnotationInput = Pick<
    Annotation,
    'title' | 'value' | 'target' | 'anchor' | 'anchorScope' | 'url' | 'urlPattern' | 'type'
>;

/** Map a composer Draft back to the fields the data-access layer persists. */
export function draftToAnnotationInput(draft: Draft): AnnotationInput {
    return {
        title: draft.title,
        value: draft.body,
        target: draft.selector,
        anchor: draft.anchor,
        anchorScope: draft.anchorScope,
        url: draft.url,
        urlPattern: draft.urlPattern,
        type: draft.type,
    };
}
