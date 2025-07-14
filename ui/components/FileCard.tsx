import { Card } from "@heroui/react";
import { useState, useEffect } from "react";

// Helper to check for image type
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
            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [file]);

    return (
        <Card
            key={file.name}
            className="border rounded shadow-sm bg-white p-3 flex flex-col items-center">
            <div className="mb-2 w-28 h-28 flex items-center justify-center border border-gray-100 rounded overflow-hidden bg-gray-50">
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={file.name}
                        className="object-contain max-h-28 max-w-28"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg
                            className="w-10 h-10 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M12 8v4l3 3m6 4V6a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2h6"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth={2}
                            />
                        </svg>
                        <span className="text-xs">No preview</span>
                    </div>
                )}
            </div>
            <div className="flex-1 flex flex-col items-center w-full">
                <div className="text-xs font-medium text-gray-900 truncate w-full text-center">
                    {file.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                </div>
            </div>
        </Card>
    );
};