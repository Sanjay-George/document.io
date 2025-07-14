import React from 'react';
import { Chip } from "@heroui/chip";
import { Card } from "@heroui/card";
import EditIcon from '@/components/icons/edit_icon';
import DeleteIcon from '@/components/icons/delete_icon';
import Spinner from '@/components/icons/spinner';
import OpenExternalIcon from '@/components/icons/open_external';
import Link from 'next/link';

import { mutate } from 'swr';
import { remove } from '@/data_access/api/projects';
import { ALL_PROJECTS_KEY, useProjects } from '@/data_access/swr/projects';

export default function List({ onRowEdit }: { onRowEdit: (id: string) => void }) {
    const { data, isLoading } = useProjects();

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this annotation?')) return;
        await remove(id);
        mutate(ALL_PROJECTS_KEY);
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (!data || data.length === 0) {
        return <div className='text-center text-slate-500 pt-12'>No projects found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4  gap-6 p-1">
            {data.map((project: any) => (
                <Card
                    key={project._id}
                    className="flex flex-col justify-between shadow border rounded-lg py-5 px-4 bg-white hover:shadow-md"
                >
                    <div>
                        <div className="flex items-start space-x-2 mb-2">
                            <Link
                                href={`/projects/${project._id}`}
                                className="text-lg font-semibold text-slate-800 hover:text-primary flex items-center space-x-1"
                            >
                                <span className="pt-0.5"><OpenExternalIcon /></span>
                                <span>{project.title}</span>
                            </Link>
                        </div>

                        <div className="mb-3">
                            <Chip
                                color={project.status === 'Active' ? 'success' : 'danger'}
                                variant="flat"
                                size="sm"
                                className="font-semibold tracking-wide"
                            >
                                {project.status}
                            </Chip>
                        </div>

                        <div className="text-slate-600 mb-4 text-sm line-clamp-3">
                            {project.description}
                        </div>

                        <div className="text-xs text-slate-400">
                            {new Date(project.updated).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t">

                        <div className="flex gap-3 text-gray-400">
                            <button
                                onClick={() => onRowEdit(project._id)}
                                className="hover:text-primary transition"
                                aria-label="Edit project"
                            >
                                <EditIcon />
                            </button>
                            <button
                                onClick={() => handleDelete(project._id)}
                                className="hover:text-red-600 transition"
                                aria-label="Delete project"
                            >
                                <DeleteIcon />
                            </button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}