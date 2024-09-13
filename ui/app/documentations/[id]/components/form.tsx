"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { Page } from "@/data/models/page";
import { ALL_PAGES_KEY, SINGLE_PAGE_KEY, usePage } from "@/data/swr/pages";
import { add, edit } from "@/data/api/pages";


export default function Form({ documentationId, pageId, postSubmit }: { documentationId: string, pageId: string | null, postSubmit: (data?: any) => void }) {
    const [formData, setFormData] = useState({ title: '', url: '' } as Page);
    const page: Page = usePage(pageId as any)?.data;

    useEffect(() => {
        if (page) {
            setFormData({
                ...page
            })
        }
    }, [page]);

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
            if (!pageId) {
                await add({ title, url, documentationId });
            }
            else {
                await edit(pageId, { title, url, documentationId });
                mutate(SINGLE_PAGE_KEY(pageId));
            }
        }
        catch (error) {
            console.error(error);
            return;
        }

        mutate(ALL_PAGES_KEY(documentationId));
        setFormData({ title: '', url: '' } as Page);
        postSubmit();
    };


    return (
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>
            <div className="mb-5">
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                <input value={formData.title} type="text" id="title" name="title" onChange={handleTextChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500 dark:shadow-sm-light" placeholder="Page Title" required />
            </div>

            <div className="mb-5">
                <label htmlFor="url" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">URL</label>
                <input value={formData.url} type="url" id="url" name="url" onChange={handleTextChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500 dark:shadow-sm-light" placeholder="eg: https://www.google.com/" required />
            </div>

            <button type="submit" className="text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800">Save</button>
        </form>
    );
}