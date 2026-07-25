import { AnchorMeta } from '@/utils/anchor';

export interface Annotation {
    id?: string;
    /** Short heading shown on cards/popovers. Optional for legacy notes — the
     *  companion derives one from `value` when absent (see companion/adapter). */
    title?: string;
    value: string;
    target: string;
    /** Resilient anchor descriptor (selector + identity signals). Optional —
     *  legacy notes only have `target`, which stays the source of truth. */
    anchor?: AnchorMeta;
    /** Page the note was captured on (origin-independent path). */
    url: string;
    /** Optional glob (with `*`/`**`) that generalises which pages the note shows
     *  on. When absent, the note matches `url` exactly. */
    urlPattern?: string;
    documentationId: string;
    created: Date;
    updated: Date;
    type: 'page' | 'component';
    comments?: string[];
    index: number,
}