"use client";

import { useEffect, useState } from "react";
import { add, edit } from "@/data_access/api/projects";
import { mutate } from "swr";
import { ALL_PROJECTS_KEY, SINGLE_PROJECT_KEY, useProject } from "@/data_access/swr/projects";
import { Project } from "@/data_access/models/project";
import ButtonPrimary from "@/components/ButtonPrimary";

export default function Form({ projectId, postSubmit }: { projectId: string | null, postSubmit: (data?: any) => void }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Active'
    });
    const project: Project = useProject(projectId as any)?.data;

    useEffect(() => {
        if (project) {
            setFormData({
                ...project
            })
        }
        else {
            resetForm();
        }
    }, [project]);

    const handleTextChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            status: e.target.checked ? 'Active' : 'Inactive'
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            status: 'Active'
        });
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { title, description, status } = formData;
        if (!title) {
            // TODO: show alert.
            console.error('Title is required');
            return;
        }

        try {
            if (!projectId) {
                await add({ title, description, status });
            }
            else {
                await edit(projectId, { title, description, status });
                mutate(SINGLE_PROJECT_KEY(projectId));
            }
        }
        catch (error) {
            console.error(error);
            return;
        }

        // Refetch data with useSWR
        mutate(ALL_PROJECTS_KEY);
        resetForm();
        postSubmit();
    }

    const isProjectActive = formData.status === 'Active';

    return (
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>
            <div className="mb-5">
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 ">Title</label>
                <input value={formData.title} type="text" id="title" name="title" onChange={handleTextChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5       " placeholder="eg: Lead Form - User Flow" required />
            </div>

            <div className="mb-5">
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 ">Description</label>
                <textarea value={formData.description} id="description" name="description" rows={4}
                    onChange={handleTextChange} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 
                        rounded-lg border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 
                            
                          " placeholder="Project description..."></textarea>
            </div>

            <div className="mb-8 ms-0.5">
                <label className="inline-flex items-center cursor-pointer">
                    <input name='status' type="checkbox" className="sr-only peer" checked={isProjectActive} onChange={handleStatusChange} />
                    <div className="relative w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-3 after:h-3 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ms-3 text-sm font-sm text-gray-900">
                        {isProjectActive ? 'Active' : 'Inactive'}</span>
                </label>
            </div>

            <ButtonPrimary text="Save" icon />
        </form>
    )
}