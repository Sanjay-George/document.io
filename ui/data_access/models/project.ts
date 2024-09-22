export interface Project {
    id?: string;
    title: string;
    description: string;
    status: "Active" | "Inactive";
    created?: Date;
    updated?: Date;
}

