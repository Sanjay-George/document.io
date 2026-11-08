import { AnchorMeta } from '@/utils/anchor';

/**
 * Types for the document.io in-context annotation companion.
 * Mirrors the state model documented in design/README.md.
 */

/**
 * A note is anchored either to a single element or to the whole page/URL.
 * Values match the persisted `Annotation.type` so the view-model maps 1:1.
 */
export type NoteType = 'component' | 'page';

/** Read (view) or Annotate (edit). */
export type Mode = 'view' | 'edit';

/** Scope filter for the note list. */
export type Tab = 'page' | 'all';

/** Toast tone — success is auto-dismissed, warn persists until state changes. */
export type Tone = 'ok' | 'warn';

/** Which side of the target element a popover is rendered on. */
export type Placement = 'above' | 'below';

export interface Note {
    id: string;
    /** 1-based display number shown in badges and the number circle. */
    n: number;
    type: NoteType;
    /** CSS selector the note is anchored to (empty for whole-page notes). */
    selector: string;
    /** Resilient anchor descriptor used to resolve the element robustly. */
    anchor?: AnchorMeta;
    /** Page URL/path the note was captured on. */
    url: string;
    title: string;
    /** Markdown body. */
    body: string;
    /** False when the note belongs to a different page than the one shown. */
    onPage?: boolean;
    /** True when the anchored element can no longer be found (stale). */
    broken?: boolean;
}

/** The in-progress note being written in the composer. */
export interface Draft {
    type: NoteType;
    selector: string;
    /** Anchor descriptor captured at pick time; carried through save. */
    anchor?: AnchorMeta;
    url: string;
    /** Optional page glob (`*`/`**`); when absent the note matches `url` exactly. */
    urlPattern?: string;
    title: string;
    body: string;
}
