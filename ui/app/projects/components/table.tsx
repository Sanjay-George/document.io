import React, { useEffect } from 'react';
import { Space, Table as Tbl, Tag } from 'antd';
import { Chip } from '@nextui-org/chip';
import EditIcon from '@/components/icons/edit_icon';
import DeleteIcon from '@/components/icons/delete_icon';
import useSWR, { mutate } from 'swr';
import { remove } from '@/data_access/api/documentations';
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
				return <Link className='text-black hover:text-black hover:underline' href={`projects/${id}`}>{title}</Link>
			}
		},
		{
			title: '',
			dataIndex: '_id',
			width: '5%',
			key: 'open',
			render: (id: string, record: any) => (
				<Link className='text-primary hover:text-slate-700 hover:underline' href={`projects/${id}`}><OpenExternalIcon /></Link>
			),
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
					<a onClick={() => handleDelete(id)} className='text-accent'><DeleteIcon /></a>
				</Space>
			),
		},
	];

	const { data, isLoading, error } = useProjects();

	const handleDelete = async (id: string) => {
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
		data && <Tbl columns={columns} dataSource={[...data]} />
	);
}