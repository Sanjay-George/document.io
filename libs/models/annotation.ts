/**
 * Resilient anchor descriptor persisted alongside an annotation's `target`
 * selector. Structurally mirrors the companion's `AnchorMeta`
 * (companion/ui/src/utils/anchor.ts); kept independent so the server carries no
 * front-end dependency. Optional for backward compatibility with legacy notes.
 */
export interface AnchorMeta {
    selector: string;
    tag: string;
    id?: string;
    role?: string;
    ariaLabel?: string;
    text?: string;
    attributes?: Record<string, string>;
    context?: AncestorRef[];
}

export interface AncestorRef {
    tag: string;
    id?: string;
    role?: string;
    ariaLabel?: string;
    testid?: string;
}

export interface Annotation {
    id: string;
    title?: string;
    value: string;
    target: string;
    anchor?: AnchorMeta;
    url: string;
    urlPattern?: string;
    documentationId: string;
    created: Date;
    updated: Date;
    type: 'page' | 'component';
    index: number;
}
