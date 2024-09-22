export interface Documentation {
    id: string;
    title: string;
    description: string;
    project: string;
    status: "Active" | "Inactive";
    created: Date;
    updated: Date;
}