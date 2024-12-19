import React, { useEffect } from 'react';
import { Space, Table as Tbl, Tag } from 'antd';
import useSWR, { mutate } from 'swr';
import { exportData, remove } from '@/data_access/api/documentations';
import EditIcon from '@/components/icons/edit_icon';
import DeleteIcon from '@/components/icons/delete_icon';
import { ALL_DOCUMENTATIONS_KEY, useDocumentations } from '@/data_access/swr/documentations';
import OpenExternalIcon from '@/components/icons/open_external';
import CopyIcon from '@/components/icons/copy_icon';
import { Tooltip } from '@nextui-org/tooltip';
import Link from 'next/link';
import { Documentation } from '@/data_access/models/documentation';


export default function Table({ projectId, onRowEdit }:
    { projectId: string, onRowEdit: (id: string) => void }) {

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            width: '30%',
            key: 'title',
            render: (title: string, record: any) => {
                const id = record._id;
                return (
                    <Link
                        className='text-slate-600 hover:text-primary w-full flex space-x-2 items-start'
                        href={`document-io://documentations/${id}/`}>
                        <div className='w-fit pt-0.5'><OpenExternalIcon /></div>
                        <div className=''>{title}</div>
                    </Link>
                )
            }
        },
        {
            title: 'Base URL',
            dataIndex: 'url',
            key: 'url',
            width: '35%',
            ellipsis: true,
        },
        {
            title: 'Updated At',
            dataIndex: 'updated',
            key: 'updated',
            ellipsis: true,
            render: (item: string) => <p>{
                new Date(item).toLocaleDateString('en-US',
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    }
                )}
            </p>,
        },
        {
            title: 'Actions',
            key: 'action',
            dataIndex: '_id',
            render: (id: string, record: Documentation) => (
                <Space size="middle">
                    <a onClick={() => handleEdit(id)} className='text-emerald-600'><EditIcon /></a>
                    <a onClick={() => handleDelete(id)} className='text-red-600'><DeleteIcon /></a>
                    <Tooltip content="Copy data" placement="top" offset={10}><a onClick={() => handleCopyClick(id)} className='text-slate-600 hover:text-black'>  <CopyIcon /></a></Tooltip>
                </Space>
            ),
        },
    ];

    const { data, isLoading, error } = useDocumentations(projectId);

    const handleDelete = async (id: string) => {
        // show confirmation dialog
        if (!window.confirm('Are you sure you want to delete this annotation?')) {
            return;
        }

        console.log(`Delete documentation ${id}`);
        await remove(id);
        mutate(ALL_DOCUMENTATIONS_KEY(projectId));
    }

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
        const { title, url } = record;
        let newUrl = url.includes('?')
            ? `${url}&pageId=${id}` : `${url}?pageId=${id}`;
        newUrl += `&mode=edit`;

        // Open a new window with the url
        window.open(newUrl, '_blank');
    }

    return (
        data && <Tbl size='middle' columns={columns} dataSource={[...data]} pagination={false} />
    );
}