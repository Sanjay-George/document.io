export interface Annotation {
    id: string;
    value: string;
    target: string;
    url: string;
    pageId: string;
    created: Date;
    updated: Date;
    type: 'page' | 'component';
    comments?: string[];
}