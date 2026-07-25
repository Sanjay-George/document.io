"use client";

import { useState, useEffect } from "react";
import { FileIcon } from "lucide-react";

function isImage(file: File) {
    return file.type.startsWith("image/");
}

interface FileCardProps {
    file: File;
}

export default function FileCard({ file }: FileCardProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    useEffect(() => {
        if (isImage(file)) {
            const url = URL.createObjectURL(file);
            setImgSrc(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    return (
        <div className="hub-file-card">
            <div className="hub-file-thumb">
                {imgSrc ? (
                    <img src={imgSrc} alt={file.name} />
                ) : (
                    <span className="empty">
                        <FileIcon size={26} strokeWidth={1.6} />
                        No preview
                    </span>
                )}
            </div>
            <div className="hub-file-name" title={file.name}>
                {file.name}
            </div>
            <div className="hub-file-size">{(file.size / 1024).toFixed(1)} KB</div>
        </div>
    );
}
