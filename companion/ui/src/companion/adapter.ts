import { Annotation } from '@/models/annotations';
import { renderTitleFromValue } from '@/utils';
import { Draft, Note } from '@/companion/types';

/**
 * Bridge between the persisted `Annotation` model (data_access / models) and the
 * companion's `Note` view-model. Keeping this mapping in one place is what lets
 * the companion components drop in over the existing list/editor views.
 *
 * Field mapping:
 *   Annotation.target       → Note.selector
 *   Annotation.value        → Note.body
 *   Annotation.title/value  → Note.title   (derived from value when title absent)
 *   Annotation.type         → Note.type    (same 'page' | 'component' union)
 * `n`, `onPage` and `broken` are presentation state resolved by the container
 * (list order + live-DOM matching), not stored on the annotation.
 */

/** Runtime state the container resolves per annotation against the live page. */
export type NoteFlags = { onPage?: boolean; broken?: boolean };

const TITLE_MAX = 60;

/** Map one persisted annotation to a numbered Note. */
export function toNote(annotation: Annotation, n: number, flags: NoteFlags = {}): Note {
    return {
        id: annotation.id ?? '',
        n,
        type: annotation.type,
        selector: annotation.target,
        url: annotation.url,
        title: annotation.title || renderTitleFromValue(annotation.value, TITLE_MAX) || 'Untitled note',
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
        url: annotation.url,
        title: annotation.title ?? renderTitleFromValue(annotation.value, TITLE_MAX),
        body: annotation.value,
    };
}

/** Persisted fields produced from a composer Draft (for add/update calls). */
export type AnnotationInput = Pick<Annotation, 'title' | 'value' | 'target' | 'url' | 'type'>;

/** Map a composer Draft back to the fields the data-access layer persists. */
export function draftToAnnotationInput(draft: Draft): AnnotationInput {
    return {
        title: draft.title,
        value: draft.body,
        target: draft.selector,
        url: draft.url,
        type: draft.type,
    };
}
