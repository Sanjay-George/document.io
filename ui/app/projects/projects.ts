import { Project } from "@/data/defintions";

// TODO: replace host url.
export const add = async (data: Project) => {
    const res = await fetch('http://localhost:5000/documents/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if(!res.ok) {
        throw new Error('Failed to add project');
    }
    return res.json();
};

export const get = async () => {
    const res = await fetch('http://localhost:5000/documents/');
    if(!res.ok) {
        throw new Error('Failed to fetch projects');
    }
    return res.json();
}

export const remove = async (id: string) => {
    const res = await fetch(`http://localhost:5000/documents/${id}`, {
        method: 'DELETE',
    });
    if(!res.ok) {
        throw new Error('Failed to delete project');
    }
    return res.json();
}