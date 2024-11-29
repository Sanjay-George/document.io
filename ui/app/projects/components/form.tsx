"use client";

import { useEffect, useState } from "react";
import { add, edit } from "@/data_access/api/documentations";
import { mutate } from "swr";
import { ALL_PROJECTS_KEY, SINGLE_PROJECT_KEY, useProject } from "@/data_access/swr/projects";
import { Documentation } from "@/data_access/models/documentation";

export default function Form({ docId, postSubmit }: { docId: string | null, postSubmit: (data?: any) => void }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Active'
    });
    const documentation: Documentation = useProject(docId as any)?.data;

    useEffect(() => {
        if (documentation) {
            setFormData({
                ...documentation
            })
        }
        else {
            resetForm();
        }
    }, [documentation]);

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
            if (!docId) {
                await add({ title, description, status });
            }
            else {
                await edit(docId, { title, description, status });
                mutate(SINGLE_PROJECT_KEY(docId));
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
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                <input value={formData.title} type="text" id="title" name="title" onChange={handleTextChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500 dark:shadow-sm-light" placeholder="eg: Lead Form - User Flow" required />
            </div>

            <div className="mb-5">
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                <textarea value={formData.description} id="description" name="description" rows={4}
                    onChange={handleTextChange} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 
                        rounded-lg border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700
                         dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500
                          dark:focus:border-emerald-500" placeholder="Project description..."></textarea>
            </div>

            <div className="mb-5">
                <label className="inline-flex items-center mb-5 cursor-pointer">
                    <input name='status' type="checkbox" className="sr-only peer" checked={isProjectActive} onChange={handleStatusChange} />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {isProjectActive ? 'Active' : 'Inactive'}</span>
                </label>
            </div>

            <button type="submit" className="text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800">Save</button>
        </form>
    )
}