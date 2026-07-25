"use client";

import { useRef } from "react";
import { mutate } from "swr";
import { Globe, ExternalLink, Pencil, Copy, Trash2 } from "lucide-react";
import { exportData, remove } from "@/data_access/api/documentations";
import { ALL_DOCUMENTATIONS_KEY } from "@/data_access/swr/documentations";
import { Documentation } from "@/data_access/models/documentation";
import { KebabMenu, useHubToast } from "@/components/hub";
import { safeUrl } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ICON = 15;

const fmtDate = (d?: Date) =>
    d
        ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "";

export default function List({
    projectId,
    documentations,
    onEdit,
}: {
    projectId: string;
    documentations: any[];
    onEdit: (id: string) => void;
}) {
    const { toast } = useHubToast();
    // Guards against duplicate delete requests from rapid double-clicks, per doc.
    const inFlight = useRef<Set<string>>(new Set());

    const openLive = (doc: any) => {
        // Reject unsafe schemes (javascript:, data:, …) before navigating.
        if (!safeUrl(doc.url)) {
            toast("This guide has an invalid URL");
            return;
        }
        const sep = doc.url.includes("?") ? "&" : "?";
        const url = `${doc.url}${sep}documentation-id=${doc._id}&api-host=${encodeURIComponent(API_URL || "")}`;
        window.open(url, "_blank", "noopener");
    };

    const handleCopy = async (id: string) => {
        try {
            const data = await exportData(id);
            await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            toast("Data copied");
        } catch {
            toast("Couldn’t copy data");
        }
    };

    const handleDelete = async (doc: any) => {
        if (!window.confirm(`Delete “${doc.title}”? This can’t be undone.`)) return;
        if (inFlight.current.has(doc._id)) return;
        inFlight.current.add(doc._id);
        try {
            await remove(doc._id);
            mutate(ALL_DOCUMENTATIONS_KEY(projectId));
            toast("Documentation deleted");
        } catch {
            toast("Couldn’t delete documentation");
        } finally {
            inFlight.current.delete(doc._id);
        }
    };

    return (
        <div className="hub-index">
            {documentations.map((doc: any, i: number) => (
                <div key={doc._id} className="hub-doc-row">
                    <div className="hub-doc-num">{String(i + 1).padStart(2, "0")}</div>
                    <div className="hub-doc-main">
                        <div className="hub-doc-titlerow">
                            <span className="hub-doc-title">{doc.title}</span>
                        </div>
                        <div className="hub-doc-meta">
                            <Globe size={14} color="#C6CAD2" style={{ flex: "none" }} />
                            <code className="hub-doc-url">{doc.url}</code>
                        </div>
                    </div>
                    <div className="hub-doc-actions">
                        {doc.updated && <span className="hub-doc-updated">{fmtDate(doc.updated)}</span>}
                        <button className="hub-open-btn" onClick={() => openLive(doc)}>
                            <ExternalLink size={14} />
                            Open
                        </button>
                        <KebabMenu
                            items={[
                                { label: "Edit", icon: <Pencil size={ICON} />, onClick: () => onEdit(doc._id) },
                                { label: "Copy config (JSON)", icon: <Copy size={ICON} />, onClick: () => handleCopy(doc._id) },
                                {
                                    label: "Delete",
                                    icon: <Trash2 size={ICON} />,
                                    onClick: () => handleDelete(doc),
                                    danger: true,
                                    separatorBefore: true,
                                },
                            ]}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
