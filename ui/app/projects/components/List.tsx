"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Pencil, Power, Link2, Trash2 } from "lucide-react";
import { edit, remove } from "@/data_access/api/projects";
import { ALL_PROJECTS_KEY } from "@/data_access/swr/projects";
import { KebabMenu, StatusPill, useHubToast } from "@/components/hub";

const ICON = 15;

export default function List({ projects, onEdit }: { projects: any[]; onEdit: (id: string) => void }) {
    const router = useRouter();
    const { toast } = useHubToast();
    // Guards against duplicate requests from rapid double-clicks, per project row.
    const inFlight = useRef<Set<string>>(new Set());

    const handleToggle = async (p: any) => {
        if (inFlight.current.has(p._id)) return;
        inFlight.current.add(p._id);
        const status = p.status === "Active" ? "Inactive" : "Active";
        try {
            await edit(p._id, { title: p.title, description: p.description, status });
            mutate(ALL_PROJECTS_KEY);
            toast(status === "Active" ? "Project set active" : "Project set inactive");
        } catch {
            toast("Couldn’t update project");
        } finally {
            inFlight.current.delete(p._id);
        }
    };

    const handleDelete = async (p: any) => {
        if (!window.confirm(`Delete “${p.title}”? This can’t be undone.`)) return;
        if (inFlight.current.has(p._id)) return;
        inFlight.current.add(p._id);
        try {
            await remove(p._id);
            mutate(ALL_PROJECTS_KEY);
            toast("Project deleted");
        } catch {
            toast("Couldn’t delete project");
        } finally {
            inFlight.current.delete(p._id);
        }
    };

    const handleShare = async (p: any) => {
        const link = `${window.location.origin}/projects/${p._id}`;
        try {
            await navigator.clipboard.writeText(link);
            toast("Link copied");
        } catch {
            toast("Couldn’t copy link");
        }
    };

    return (
        <div className="hub-index">
            {projects.map((p: any, i: number) => {
                const active = p.status === "Active";
                return (
                    <div
                        key={p._id}
                        className={`hub-row${active ? "" : " is-inactive"}`}
                        onClick={() => router.push(`/projects/${p._id}`)}
                    >
                        <div className="hub-row-num">{String(i + 1).padStart(2, "0")}</div>
                        <div className="hub-row-main">
                            <div className="hub-row-head">
                                <span className="hub-row-name">{p.title}</span>
                                <StatusPill active={active} />
                                <div style={{ flex: 1 }} />
                                <KebabMenu
                                    items={[
                                        { label: "Edit", icon: <Pencil size={ICON} />, onClick: () => onEdit(p._id) },
                                        {
                                            label: active ? "Set inactive" : "Set active",
                                            icon: <Power size={ICON} />,
                                            onClick: () => handleToggle(p),
                                        },
                                        { label: "Copy link", icon: <Link2 size={ICON} />, onClick: () => handleShare(p) },
                                        {
                                            label: "Delete project",
                                            icon: <Trash2 size={ICON} />,
                                            onClick: () => handleDelete(p),
                                            danger: true,
                                            separatorBefore: true,
                                        },
                                    ]}
                                />
                            </div>

                            {p.description && <div className="hub-row-desc">{p.description}</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
