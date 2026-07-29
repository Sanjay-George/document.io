import { AnchorMeta, AnchorScope } from '@/utils/anchor';

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
    /** Per-signal strictness for re-finding the anchored element. Absent means
     *  the default resolution (see `resolveAnchoredElement`); a stored value is
     *  always a deliberate choice made in the composer's scope editor. */
    anchorScope?: AnchorScope;
    /** Page the note was captured on (origin-independent path, plus the host's
     *  own query params — matching still compares paths). */
    url: string;
    /** Optional glob that generalises which pages the note shows on: `*` is one
     *  segment, `**` is any number, and a `?k=v` suffix requires that param.
     *  When absent, the note matches `url`'s path exactly. See `pageMatches`. */
    urlPattern?: string;
    documentationId: string;
    created: Date;
    updated: Date;
    type: 'page' | 'component';
    comments?: string[];
    index: number,
}