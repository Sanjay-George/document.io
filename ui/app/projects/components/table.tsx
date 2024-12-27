import React, { useEffect } from 'react';
import { Space, Table as Tbl, Tag } from 'antd';
import { Chip } from '@nextui-org/chip';
import EditIcon from '@/components/icons/edit_icon';
import DeleteIcon from '@/components/icons/delete_icon';
import useSWR, { mutate } from 'swr';
import { remove } from '@/data_access/api/projects';
import { ALL_PROJECTS_KEY, useProjects } from '@/data_access/swr/projects';
import Link from 'next/link';
import Spinner from '@/components/icons/spinner';
import OpenExternalIcon from '@/components/icons/open_external';


export default function Table({ onRowEdit }: { onRowEdit: (id: string) => void }) {
	const columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			width: '20%',
			key: 'title',
			render: (title: string, record: any) => {
				const id = record._id;
				return <Link className='text-slate-600 hover:text-primary w-full flex space-x-2 items-start' href={`projects/${id}`}>
					<div className='w-fit pt-0.5'><OpenExternalIcon /></div>
					<div>{title}</div></Link>
			}
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			ellipsis: true,
			width: '40%',
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
			render: (id: string) => (
				<Space size="middle">
					<a onClick={() => handleEdit(id)} className='text-primary'><EditIcon /></a>
					<a onClick={() => handleDelete(id)} className='text-red-600'><DeleteIcon /></a>
				</Space>
			),
		},
	];

	const { data, isLoading, error } = useProjects();

	const handleDelete = async (id: string) => {
		// show confirmation dialog
		if (!window.confirm('Are you sure you want to delete this annotation?')) {
			return;
		}
		await remove(id);
		mutate(ALL_PROJECTS_KEY);
	}

	const handleEdit = (id: string) => {
		onRowEdit && onRowEdit(id);
	};

	if (isLoading) {
		return <Spinner />;
	}
	return (
		data && <Tbl size='middle' columns={columns} dataSource={[...data]} pagination={false} />
	);
}