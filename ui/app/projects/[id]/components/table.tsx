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
            width: '20%',
            key: 'title',
            render: (title: string, record: any) => {
                const id = record._id;
                return <Link className='text-black hover:text-black hover:underline' href={`/documentations/${id}`}>{title}</Link>
            }
        },
        {
            title: '',
            dataIndex: '_id',
            width: '5%',
            key: 'open',
            render: (id: string, record: Documentation) => (
                <Link className='text-primary hover:text-slate-700 hover:underline' href={`/documentations/${id}`}><OpenExternalIcon /></Link>
            ),
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
            render: (id: string, record: Page) => (
                <Space size="middle">
                    <a onClick={() => handleEdit(id)} className='text-emerald-600'><EditIcon /></a>
                    <a onClick={() => handleDelete(id)} className='text-red-600'><DeleteIcon /></a>
                    <Tooltip content="Copy data" placement="top" offset={10}><a onClick={() => handleCopyClick(id)} className='text-slate-400 hover:text-slate-700'>  <CopyIcon /></a></Tooltip>
                </Space>
            ),
        },
    ];

    const { data, isLoading, error } = useDocumentations(projectId);

    const handleDelete = async (id: string) => {
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
        data && <Tbl columns={columns} dataSource={[...data]} />
    );
}