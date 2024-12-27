"use client";

import { useEffect, useState } from "react";
import { add, edit, importData } from "@/data_access/api/projects";
import { mutate } from "swr";
import { ALL_DOCUMENTATIONS_KEY } from "@/data_access/swr/documentations";

export default function ImportForm({ documentationId, postSubmit }: { documentationId: string, postSubmit: () => void }) {
    const [docData, setDocData] = useState(null) as any;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await importData(documentationId, JSON.parse(docData));
        mutate(ALL_DOCUMENTATIONS_KEY(documentationId));
        setDocData('');
        postSubmit();
    }

    return (
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>
            <div className="mb-5">
                <label htmlFor="description"
                    className="block mb-2 text-sm font-medium 
                        text-gray-900 ">Documentation Config</label>
                <textarea id="description" name="description"
                    value={docData}
                    onChange={(e) => setDocData(e.target.value)}
                    rows={20}
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 
                        rounded-lg border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500
                            
                           "
                    placeholder="Paste JSON here..."></textarea>
            </div>


            <button type="submit"
                className="text-white bg-emerald-700 hover:bg-emerald-800 
                focus:ring-4 focus:outline-none focus:ring-emerald-300 
                font-medium rounded-lg text-sm px-5 py-2.5 text-center 
                  
                ">
                Import
            </button>
        </form>
    )
}