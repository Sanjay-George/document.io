"use client";

import React, { useEffect } from 'react';
import { Space, Table as Tbl, Tag } from 'antd';
import { Chip } from '@nextui-org/chip';
import EditIcon from './edit_icon';
import DeleteIcon from './delete_icon';
import useSWR, { mutate } from 'swr';
import { remove } from '@/data/documentations/routes';
import { ALL_DOCUMENTATIONS_KEY, useDocumentations } from '@/data/documentations/useSWR';

interface DataType {
	key: string;
	name: string;
	age: number;
	address: string;
	tags: string[];
}

export default function Table({ onRowEdit }: { onRowEdit: (id: string) => void }) {
	const columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => {
				let color = status === 'Active' ? 'success' : 'danger' as any;
				return status ? (
					<Chip color={color} variant='flat' size='sm'>
						{status}
					</Chip>
				) : null;
			}
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
					<a onClick={() => handleDelete(id)}><DeleteIcon color="text-red-600" /></a>
				</Space>
			),
		},
	];

	const { data, isLoading, error } = useDocumentations();

	const handleDelete = async (id: string) => {
		console.log(id);
		await remove(id);
		mutate(ALL_DOCUMENTATIONS_KEY);
	}

	const handleEdit = (id: string) => {
		onRowEdit && onRowEdit(id);
	};

	return (
		data && <Tbl columns={columns} dataSource={[...data]} />
	);
}