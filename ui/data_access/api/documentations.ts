import { Documentation } from "../models/documentation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const add = async (data: Documentation) => {
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

export const edit = async (id: string, data: Documentation) => {
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

export const remove = async (id: string) => {
    const res = await fetch(`${API_URL}/documentations/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error('Failed to delete documentation');
    }
    return res.json();
};

export const exportData = async (id: string) => {
    const res = await fetch(`${API_URL}/documentations/${id}/export`, {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error('Failed to export documentation');
    }
    return res.json();
}