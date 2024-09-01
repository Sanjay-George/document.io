interface Annotation {
    id: string;
    value: string;
    uri: string;
    openExternal: boolean;
    comments: string[];
    parentId: string;
    created: Date;
    updated: Date;
}