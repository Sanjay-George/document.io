"use client";

import { useEffect, useState } from "react";
import { add, edit, importData } from "@/data/api/documentations";
import { mutate } from "swr";
import { ALL_DOCUMENTATIONS_KEY, SINGLE_DOCUMENT_KEY, useDocumentation } from "@/data/swr/documentations";
import { Documentation } from "@/data/models/documentation";
import { ALL_PAGES_KEY } from "@/data/swr/pages";

export default function ImportForm({ documentationId, postSubmit }: { documentationId: string, postSubmit: () => void }) {
    const [pageData, setPageData] = useState(null) as any;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await importData(documentationId, JSON.parse(pageData));
        mutate(ALL_PAGES_KEY(documentationId));
        setPageData(null);
        postSubmit();
    }

    return (
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>
            <div className="mb-5">
                <label htmlFor="description"
                    className="block mb-2 text-sm font-medium 
                        text-gray-900 dark:text-white">Documentation Data (JSON)</label>
                <textarea id="description" name="description"
                    value={pageData}
                    onChange={(e) => setPageData(e.target.value)}
                    rows={20}
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 
                        rounded-lg border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500
                         dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                          dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                    placeholder="Paste JSON here..."></textarea>
            </div>


            <button type="submit"
                className="text-white bg-emerald-700 hover:bg-emerald-800 
                focus:ring-4 focus:outline-none focus:ring-emerald-300 
                font-medium rounded-lg text-sm px-5 py-2.5 text-center 
                dark:bg-emerald-600 dark:hover:bg-emerald-700 
                dark:focus:ring-emerald-800">
                Import
            </button>
        </form>
    )
}