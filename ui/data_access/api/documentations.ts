const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Add a new documentation
export const add = async (data: any) => {
    const res = await fetch(`${API_URL}/documentations/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to add documentation');
    }
    return res.json();
};

export const edit = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/documentations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to edit documentation');
    }
    return res.json();
}

// Remove a documentation
export const remove = async (id: string) => {
    const res = await fetch(`${API_URL}/documentations/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error('Failed to delete documentation');
    }
    return res.json();
}

export const importData = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/documentations/${id}/import`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to import documentation');
    }
    return res.text();
}