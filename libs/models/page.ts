export interface Page {
    id?: string;
    title: string;
    url: string;
    documentationId: string;
    projectId?: string;
    created?: Date;
    updated?: Date;
}