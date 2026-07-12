"use client";

import { use, useState } from "react";
import { Upload } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import FileCard from "@/components/FileCard";
import { useProject } from "@/data_access/swr/projects";
import { Breadcrumb, Button, SectionHeader, Spinner } from "@/components/hub";

const slugify = (n?: string) =>
    (n || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function UploadMediaPage({ params }: { params: { id: string } }) {
    const projectId = use(params as any)?.id as string;
    const { data: project, isLoading } = useProject(projectId as any);
    const [files, setFiles] = useState<File[]>([]);

    if (isLoading) {
        return (
            <div className="hub-container hub-container--detail">
                <Spinner />
            </div>
        );
    }

    const slug = slugify(project?.title);

    return (
        <div className="hub-container hub-container--detail">
            <Breadcrumb
                items={[
                    { label: "projects", href: "/projects" },
                    { label: slug, href: `/projects/${projectId}` },
                    { label: "upload", current: true },
                ]}
            />

            <div className="hub-detail-head">
                <div style={{ minWidth: 0 }}>
                    <h1 className="hub-detail-h1">{project?.title}</h1>
                    <p className="hub-detail-lead">Upload images and video to reference from this project’s guides.</p>
                </div>
            </div>

            <SectionHeader label="Assets" meta={files.length > 0 ? `${files.length} selected` : undefined} />

            <div style={{ paddingTop: 14 }}>
                <Dropzone onFilesSelected={setFiles} />

                {files.length > 0 && (
                    <div className="hub-file-grid">
                        {files.map((file, idx) => (
                            <FileCard key={`${file.name}-${idx}`} file={file} />
                        ))}
                    </div>
                )}

                {files.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
                        <Button
                            variant="primary"
                            icon={<Upload size={16} />}
                            onClick={() => console.log("Processing files:", files)}
                        >
                            Process files
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
