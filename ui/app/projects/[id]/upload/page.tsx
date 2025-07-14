"use client";

import ButtonPrimary from "@/components/ButtonPrimary";
import Dropzone from "@/components/Dropzone";
import FileCard from "@/components/FileCard";
import H2 from "@/components/H2";
import { useProject } from "@/data_access/swr/projects";
import { Spinner } from "@heroui/react";
import { Upload } from "lucide-react";
import { use, useState } from "react";

export default function UploadMediaPage({ params }: { params: { id: string } }) {
    const projectId = use(params).id;

    const { data: projectData, isLoading: isProjectLoading } = useProject(projectId as any);
    const [files, setFiles] = useState<File[]>([]);

    const handleFilesSelected = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        // You could add uploading logic here!
    };

    if (isProjectLoading) {
        return <Spinner />;
    }

    return (
        <>
            <div className="flex justify-between">
                <div>
                    <H2>{projectData?.title}</H2>
                </div>

            </div>
            <div>
                <p className="mb-4 pb-2 text-slate-400 font-light ">Upload documentation media for this project here</p>
            </div>

            <div className="p-1">
                <Dropzone onFilesSelected={handleFilesSelected} />
                {files.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                        {files.map((file, idx) => (
                            <FileCard key={idx} file={file} />
                        ))}
                    </div>
                )}
            </div>

            {files.length > 0 && (
                <div className="flex justify-end mt-4 mb-10">
                    <ButtonPrimary text="Process Files"
                        icon={<Upload size={18} />}
                        onClick={() => {
                            console.log("Processing files:", files);
                        }}
                    />
                </div>
            )}

        </>
    );
}