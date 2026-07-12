"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useProjects } from "@/data_access/swr/projects";
import List from "./components/List";
import Form from "./components/Form";
import { HubModal, Button, EmptyState, Spinner } from "@/components/hub";

type Filter = "all" | "active" | "inactive";

export default function ProjectsHub() {
    const { data, isLoading } = useProjects();
    const [filter, setFilter] = useState<Filter>("all");
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const projects: any[] = data || [];
    const countAll = projects.length;
    const countActive = projects.filter((p) => p.status === "Active").length;
    const countInactive = countAll - countActive;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        let list = projects.filter((p) =>
            filter === "all" ? true : filter === "active" ? p.status === "Active" : p.status !== "Active"
        );
        if (q) {
            list = list.filter(
                (p) =>
                    (p.title || "").toLowerCase().includes(q) ||
                    (p.description || "").toLowerCase().includes(q)
            );
        }
        return list;
    }, [projects, filter, search]);

    const openNew = () => {
        setEditId(null);
        setModalOpen(true);
    };
    const openEdit = (id: string) => {
        setEditId(id);
        setModalOpen(true);
    };

    return (
        <div className="hub-container">
            {/* masthead */}
            <div className="hub-masthead">
                <div>
                    <h1 className="hub-h1">Projects</h1>
                    <p className="hub-lead">
                        Guides that live on the product itself — anchored to real elements, so they never drift out of date.
                    </p>
                </div>
                <Button variant="primary" icon={<Plus size={16} strokeWidth={2.2} />} onClick={openNew}>
                    New project
                </Button>
            </div>

            {/* controls */}
            <div className="hub-controls">
                <div className="hub-filters">
                    <button className={`hub-filter${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
                        all · {countAll}
                    </button>
                    <button className={`hub-filter${filter === "active" ? " active" : ""}`} onClick={() => setFilter("active")}>
                        active · {countActive}
                    </button>
                    <button className={`hub-filter${filter === "inactive" ? " active" : ""}`} onClick={() => setFilter("inactive")}>
                        inactive · {countInactive}
                    </button>
                </div>
                <div className="hub-search-wrap">
                    <Search size={14} color="#B0A99E" className="hub-search-icon" />
                    <input
                        className="hub-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter…"
                    />
                </div>
            </div>

            {isLoading ? (
                <Spinner />
            ) : countAll === 0 ? (
                <EmptyState
                    title="Nothing documented yet"
                    body="A project holds related guides. Create one to start documenting a workflow at its source."
                    action={
                        <Button variant="primary" onClick={openNew}>
                            New project
                        </Button>
                    }
                />
            ) : filtered.length === 0 ? (
                <EmptyState showIcon={false} title="No matching projects" body="Try a different filter or search term." />
            ) : (
                <List projects={filtered} onEdit={openEdit} />
            )}

            <HubModal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Form projectId={editId} onClose={() => setModalOpen(false)} />
            </HubModal>
        </div>
    );
}
