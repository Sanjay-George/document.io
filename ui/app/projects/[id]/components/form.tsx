"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { ALL_DOCUMENTATIONS_KEY, SINGLE_DOCUMENTATION_KEY, useDocumentation } from "@/data_access/swr/documentations";
import { add, edit } from "@/data_access/api/documentations";
import { Documentation } from "@/data_access/models/documentation";


export default function Form({ projectId, documentationId, postSubmit }: { projectId: string, documentationId: string | null, postSubmit: (data?: any) => void }) {
    const [formData, setFormData] = useState({ title: '', url: '' } as Documentation);
    const documentation: Documentation = useDocumentation(documentationId as any)?.data;

    useEffect(() => {
        if (documentation) {
            setFormData({
                ...documentation
            })
        }
        else {
            setFormData({ title: '', url: '' } as Documentation);
        }
    }, [documentation]);

    const handleTextChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { title, url } = formData;
        if (!title || !url) {
            console.error('Title and URL are required');
            return;
        }

        try {
            if (!documentationId) {
                await add({ title, url, projectId });
            }
            else {
                await edit(documentationId, { title, url, projectId });
                mutate(SINGLE_DOCUMENTATION_KEY(documentationId));
            }
        }
        catch (error) {
            console.error(error);
            return;
        }

        mutate(ALL_DOCUMENTATIONS_KEY(projectId));
        setFormData({ title: '', url: '' } as Documentation);
        postSubmit();
    };


    return (
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>
            <div className="mb-5">
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                <input value={formData.title} type="text" id="title" name="title" onChange={handleTextChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500 dark:shadow-sm-light" placeholder="Page Title" required />
            </div>

            <div className="mb-5">
                <label htmlFor="url" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Base URL</label>
                <input value={formData.url} type="url" id="url" name="url" onChange={handleTextChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500 dark:shadow-sm-light" placeholder="eg: https://www.google.com/" required />
            </div>

            <button type="submit" className="text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800">Save</button>
        </form>
    );
}