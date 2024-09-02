"use client";

import React from 'react';
import { Space, Table as Tbl, Tag } from 'antd';
import { Chip } from '@nextui-org/chip';
import EditIcon from './edit_icon';
import DeleteIcon from './delete_icon';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const projects = [
  {
    id: "1",
    name: "Project 1",
    description: "A long description of project 1 that explains what it is about. Also, it is a very long description.",
    status: "Active",
    updated: "2024-07-01T00:00:00.000Z"
  },
  {
    id: "2",
    name: "Project 2",
    description: "Yet another long description of project 2 that explains what it is about. Also, it is a very long description.",
    status: "Inactive",
    updated: "2021-11-18T00:00:00.000Z"
  }
];

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
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
      return (
        <Chip color={color} variant='flat' size='sm'>
          {status}
        </Chip>
      );
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
        }
      )}
    </p>,
  },
  {
    title: 'Actions',
    key: 'action',
    render: (text: any, record: any) => (
      <Space size="middle">
        <a><EditIcon color="text-emerald-800" /></a>
        <a><DeleteIcon color="text-red-600" /></a>
      </Space>
    ),
  },
];

export default function Table() {
  return (
    <Tbl columns={columns} dataSource={projects} pagination={false} />
  );
}
