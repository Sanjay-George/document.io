export interface Project {
    id: string;
    title: string;
    description: string;
    status: "Active" | "Inactive";
    exportEnabled?: boolean;
    created: Date;
    updated: Date;
}