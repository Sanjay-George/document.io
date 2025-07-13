import React, { useRef, useState } from "react";

interface FileDropZoneProps {
    onFilesSelected?: (files: File[]) => void;
}

export default function Dropzone({ onFilesSelected }: FileDropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        onFilesSelected?.(Array.from(fileList));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = "";
    };

    // Drag & drop handlers
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
            className={`w-full h-[220px] flex items-center justify-center border border-dashed ${isDragging ? "border-gray-400 bg-gray-50" : "border-gray-300 bg-white"} 
                cursor-pointer select-none`}
            onClick={handleClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            tabIndex={0}
            role="button"
        >
            <input
                type="file"
                multiple
                ref={inputRef}
                onChange={handleChange}
                style={{ display: "none" }}
            />
            <span className="text-center text-gray-400 text-base">
                Click or Drag files to this area to upload
            </span>
        </div>
    );
};