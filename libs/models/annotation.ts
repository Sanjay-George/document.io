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

/**
 * Per-signal anchor strictness, keyed by the signal ids the companion's resolver
 * derives from `anchor` (`id`, `text`, `attr:data-testid`, `ctx:0`, `position`…).
 * Absent means the default resolution; opaque to the server, which only stores it.
 */
export type AnchorScope = Record<string, 'required' | 'hint' | 'ignored'>;

export interface Annotation {
    id: string;
    title?: string;
    value: string;
    target: string;
    anchor?: AnchorMeta;
    anchorScope?: AnchorScope;
    url: string;
    urlPattern?: string;
    documentationId: string;
    created: Date;
    updated: Date;
    type: 'page' | 'component';
    index: number;
}
