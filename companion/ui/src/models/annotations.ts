export interface Annotation {
    id?: string;
    /** Short heading shown on cards/popovers. Optional for legacy notes — the
     *  companion derives one from `value` when absent (see companion/adapter). */
    title?: string;
    value: string;
    target: string;
    url: string;
    documentationId: string;
    created: Date;
    updated: Date;
    type: 'page' | 'component';
    comments?: string[];
    index: number,
}