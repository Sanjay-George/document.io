import React, { useEffect } from 'react';
import { Space, Table as Tbl, Tag } from 'antd';
import { Chip } from '@nextui-org/chip';
import useSWR, { mutate } from 'swr';
import { remove } from '@/data/api/pages';
import { ALL_DOCUMENTATIONS_KEY, useDocumentations } from '@/data/swr/documentations';
import EditIcon from '@/components/icons/edit_icon';
import DeleteIcon from '@/components/icons/delete_icon';
import { ALL_PAGES_KEY, usePages } from '@/data/swr/pages';
import PlayIcon from '@/components/icons/play_icon';
import OpenExternalIcon from '@/components/icons/open_external';
import { Page } from '@/data/models/page';
import { render } from 'react-dom';
import CopyIcon from '@/components/icons/copy_icon';
import { Tooltip } from '@nextui-org/tooltip';


export default function Table({ documentationId, onRowEdit }:
    { documentationId: string, onRowEdit: (id: string) => void }) {

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            width: '15%',
            key: 'title',
        },
        {
            title: '',
            dataIndex: '_id',
            width: '5%',
            key: 'open',
            render: (id: string, record: Page) => (
                <a onClick={() => handleConfigure(id, record)} className='text-slate-700'><OpenExternalIcon /></a>
            ),
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            width: '50%',
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
                    <Tooltip content="Copy data (JSON)" placement="top" offset={10}><a onClick={() => handleCopyClick()} className='text-slate-400 hover:text-slate-700'>  <CopyIcon /></a></Tooltip>
                </Space>
            ),
        },
    ];

    const { data, isLoading, error } = usePages(documentationId);

    const handleDelete = async (id: string) => {
        console.log(`Delete page ${id}`);
        await remove(id);
        mutate(ALL_PAGES_KEY(documentationId));
    }

    const handleEdit = (id: string) => {
        onRowEdit && onRowEdit(id);
    };


    const handleCopyClick = () => {

    };


    const handleConfigure = (id: string, record: Page) => {
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