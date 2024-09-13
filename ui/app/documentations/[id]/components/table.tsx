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
import SettingsIcon from '@/components/icons/settings_icon';


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
            render: (id: string) => (
                <Space size="middle">
                    <a onClick={() => handleEdit(id)}><EditIcon color="text-emerald-600" /></a>
                    <a onClick={() => null}><SettingsIcon color="text-gray-800" /></a>
                    <a onClick={() => null}><PlayIcon color="text-blue-600" /></a>
                    <a onClick={() => null}><DeleteIcon color="text-red-600" /></a>
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

    return (
        data && <Tbl columns={columns} dataSource={[...data]} />
    );
}