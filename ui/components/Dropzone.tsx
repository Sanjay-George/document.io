"use client";

import React, { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface FileDropZoneProps {
    onFilesSelected?: (files: File[]) => void;
}

export default function Dropzone({ onFilesSelected }: FileDropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => inputRef.current?.click();

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        onFilesSelected?.(Array.from(fileList));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = "";
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div
            className={`hub-dropzone${isDragging ? " is-drag" : ""}`}
            onClick={handleClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            tabIndex={0}
            role="button"
        >
            <input type="file" multiple ref={inputRef} onChange={handleChange} style={{ display: "none" }} />
            <UploadCloud className="hub-dropzone-icon" size={30} strokeWidth={1.6} />
            <span className="hub-dropzone-title">Drag files here, or click to browse</span>
            <span className="hub-dropzone-hint">Images and video for your documentation</span>
        </div>
    );
}
