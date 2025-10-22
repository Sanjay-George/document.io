import React from 'react';
import { mutate } from 'swr';
import { Card } from "@heroui/card";
import { exportData, remove } from '@/data_access/api/documentations';
import EditIcon from '@/components/icons/edit_icon';
import DeleteIcon from '@/components/icons/delete_icon';
import { ALL_DOCUMENTATIONS_KEY, useDocumentations } from '@/data_access/swr/documentations';
import OpenExternalIcon from '@/components/icons/open_external';
import CopyIcon from '@/components/icons/copy_icon';
import Link from 'next/link';
import { Documentation } from '@/data_access/models/documentation';
import { Tooltip } from "@heroui/tooltip";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function List({
    projectId,
    onRowEdit,
}: {
    projectId: string;
    onRowEdit: (id: string) => void;
}) {
    const { data, isLoading } = useDocumentations(projectId);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this annotation?')) return;
        await remove(id);
        mutate(ALL_DOCUMENTATIONS_KEY(projectId));
    };

    const handleEdit = (id: string) => {
        onRowEdit && onRowEdit(id);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleCopyClick = async (id: string) => {
        const pageData = await exportData(id);
        copyToClipboard(JSON.stringify(pageData, null, 2));
    };

    const handleConfigure = (id: string, record: Documentation) => {
        const { url } = record;
        let newUrl = url.includes('?')
            ? `${url}&pageId=${id}`
            : `${url}?pageId=${id}`;
        newUrl += `&mode=edit`;
        window.open(newUrl, '_blank');
    };

    if (isLoading) {
        return <div className='flex justify-center py-16'><span className="loading loading-spinner" /></div>;
    }

    if (!data || data.length === 0) {
        return <div className='text-center text-slate-400 pt-16'>No documentations found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {data.map((doc: Documentation) => (

                <Card
                    key={doc._id}
                    className="flex flex-col justify-between shadow border rounded-lg py-5 px-4 bg-white hover:shadow-md"
                >
                    <div>
                        <Link
                            className="flex items-start space-x-2 text-lg font-semibold text-slate-800 hover:text-primary mb-2"
                            // href={`document-io://documentations/${doc._id}/?api-host=${encodeURI(API_URL || '')}`}
                            href={`${doc.url}?documentation-id=${doc._id}&api-host=${encodeURI(API_URL || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="pt-0.5"><OpenExternalIcon /></span>
                            <span>{doc.title}</span>
                        </Link>

                        <div className="text-xs text-slate-500 truncate mb-4">
                            <span className="truncate">{doc.url}</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                        {new Date(doc.updated).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                        })}
                    </div>

                    <div className="flex items-center gap-4 mt-2 border-t pt-4 text-slate-400">
                        <button
                            onClick={() => handleEdit(doc._id)}
                            className="hover:text-primary transition"
                            aria-label="Edit documentation"
                            type="button"
                        >
                            <EditIcon />
                        </button>
                        <button
                            onClick={() => handleDelete(doc._id)}
                            className="hover:text-red-600 transition"
                            aria-label="Delete documentation"
                            type="button"
                        >
                            <DeleteIcon />
                        </button>
                        <Tooltip content="Copy data" placement="top" offset={10}>
                            <button
                                onClick={() => handleCopyClick(doc._id)}
                                className="hover:text-gray-600 transition"
                                aria-label="Copy data"
                                type="button"
                            >
                                <CopyIcon />
                            </button>
                        </Tooltip>
                    </div>
                </Card>
            ))}
        </div>
    );
}