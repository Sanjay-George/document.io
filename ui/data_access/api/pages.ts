const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const add = async (data: any) => {
    const res = await fetch(`${API_URL}/pages/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to add page');
    }
    return res.json();
};

export const edit = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/pages/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to edit page');
    }
    return res.json();
}

export const remove = async (id: string) => {
    const res = await fetch(`${API_URL}/pages/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error('Failed to delete page');
    }
    return res.json();
};

export const exportData = async (id: string) => {
    const res = await fetch(`${API_URL}/pages/${id}/export`, {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error('Failed to export page');
    }
    return res.json();
}