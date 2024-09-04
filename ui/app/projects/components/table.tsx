"use client";

import React, { useEffect } from 'react';
import { Space, Table as Tbl, Tag } from 'antd';
import { Chip } from '@nextui-org/chip';
import EditIcon from './edit_icon';
import DeleteIcon from './delete_icon';
import { get } from '../projects';
import { Project } from '@/data/defintions';
import useSWR from 'swr';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}


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
    render: (text: any, record: any) => (
      <Space size="middle">
        {/* <a><EditIcon color="text-emerald-600" /></a> */}
        <a><DeleteIcon color="text-red-600" /></a>
      </Space>
    ),
  },
];

// TODO: fix TS error later.
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json())


export default function Table() {
  const { data, isLoading, error } = useSWR('http://localhost:5000/documents/', fetcher);


  return (
    <Tbl columns={columns} dataSource={data} />
  );
}