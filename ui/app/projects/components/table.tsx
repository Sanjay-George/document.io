"use client";

import React from 'react';
import { Space, Table as Tbl, Tag } from 'antd';
import { Chip } from '@nextui-org/chip';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

// const columns: TableProps<DataType>['columns'] = [
//   {
//     title: 'Name',
//     dataIndex: 'name',
//     key: 'name',
//     render: (text) => <a>{text}</a>,
//   },
//   {
//     title: 'Age',
//     dataIndex: 'age',
//     key: 'age',
//   },
//   {
//     title: 'Address',
//     dataIndex: 'address',
//     key: 'address',
//   },
//   {
//     title: 'Tags',
//     key: 'tags',
//     dataIndex: 'tags',
//     render: (_, { tags }) => (
//       <>
//         {tags.map((tag) => {
//           let color = tag.length > 5 ? 'geekblue' : 'green';
//           if (tag === 'loser') {
//             color = 'volcano';
//           }
//           return (
//             <Tag color={color} key={tag}>
//               {tag.toUpperCase()}
//             </Tag>
//           );
//         })}
//       </>
//     ),
//   },
//   {
//     title: 'Action',
//     key: 'action',
//     render: (_, record) => (
//       <Space size="middle">
//         <a>Invite {record.name}</a>
//         <a>Delete</a>
//       </Space>
//     ),
//   },
// ];

const projects = [
  {
    id: "1",
    name: "Project 1",
    description: "Description 1",
    status: "Active",
    updated: "2021-07-01T00:00:00.000Z"
  },
  {
    id: "2",
    name: "Project 2",
    description: "Description 2",
    status: "Inactive",
    updated: "2021-07-01T00:00:00.000Z"
  }
];

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    colSpan: 2,
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
];

export default function Table() {
  return (
    <Tbl columns={columns} dataSource={projects} pagination={false} />
  );
}
