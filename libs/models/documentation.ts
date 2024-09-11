export interface Documentation {
    id: string;
    title: string;
    project: string;
    status: "Active" | "Inactive";
    created: Date;
    updated: Date;
}