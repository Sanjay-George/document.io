const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Add a new documentation
export const add = async (data: any) => {
    const res = await fetch(`${API_URL}/projects/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to add project');
    }
    return res.json();
};

export const edit = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to edit project');
    }
    return res.json();
}

// Remove a documentation
export const remove = async (id: string) => {
    const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error('Failed to delete project');
    }
    return res.json();
}

export const importData = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/projects/${id}/import`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to import documentation into project');
    }
    return res.text();
}