"use client";

import { use, useState } from "react";
import { mutate } from "swr";
import { Plus, Upload, Download } from "lucide-react";
import { useProject, SINGLE_PROJECT_KEY, ALL_PROJECTS_KEY } from "@/data_access/swr/projects";
import { edit } from "@/data_access/api/projects";
import { useDocumentations } from "@/data_access/swr/documentations";
import List from "./components/List";
import Form from "./components/Form";
import ImportForm from "./components/ImportForm";
import AISearch from "./components/AISearch";
import {
    HubModal,
    ModalHeader,
    Breadcrumb,
    StatusPill,
    Button,
    SectionHeader,
    EmptyState,
    Spinner,
    useHubToast,
} from "@/components/hub";

const slugify = (n?: string) =>
    (n || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function ProjectDetails({ params }: { params: { id: string } }) {
    const projectId = use(params as any)?.id as string;
    const { data: project, isLoading: projectLoading } = useProject(projectId as any);
    const { data: docs, isLoading: docsLoading } = useDocumentations(projectId as any);
    const { toast } = useHubToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [editDocId, setEditDocId] = useState<string | null>(null);
    const [importOpen, setImportOpen] = useState(false);

    const active = project?.status === "Active";

    const toggleActive = async () => {
        if (!project) return;
        const status = active ? "Inactive" : "Active";
        await edit(projectId, { title: project.title, description: project.description, status });
        mutate(SINGLE_PROJECT_KEY(projectId));
        mutate(ALL_PROJECTS_KEY);
        toast(status === "Active" ? "Project set active" : "Project set inactive");
    };

    const openNewDoc = () => {
        setEditDocId(null);
        setModalOpen(true);
    };
    const openEditDoc = (id: string) => {
        setEditDocId(id);
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

    if (projectLoading) {
        return (
            <div className="hub-container hub-container--detail">
                <Spinner />
            </div>
        );
    }

    const list: any[] = docs || [];

    return (
        <div className="hub-container hub-container--detail">
            <Breadcrumb
                items={[
                    { label: "projects", href: "/projects" },
                    { label: slugify(project?.title), current: true },
                ]}
            />

            {/* header */}
            <div className="hub-detail-head">
                <div style={{ minWidth: 0 }}>
                    <div className="hub-detail-title-row">
                        <h1 className="hub-detail-h1">{project?.title}</h1>
                        <StatusPill active={active} onClick={toggleActive} />
                    </div>
                    {project?.description && <p className="hub-detail-lead">{project.description}</p>}
                </div>
                <div className="hub-detail-actions">
                    <Button variant="ghost" icon={<Download size={15} />} onClick={() => setImportOpen(true)}>
                        Import
                    </Button>
                    <Button variant="ghost" icon={<Upload size={15} />} href={`/projects/${projectId}/upload`}>
                        Upload assets
                    </Button>
                    <Button variant="primary" icon={<Plus size={16} strokeWidth={2.2} />} onClick={openNewDoc}>
                        Add documentation
                    </Button>
                </div>
            </div>

            {/* guides section */}
            <SectionHeader label="Guides" meta={`${list.length} ${list.length === 1 ? "guide" : "guides"}`} />

            {docsLoading ? (
                <Spinner />
            ) : list.length === 0 ? (
                <EmptyState
                    variant="detail"
                    title="No guides yet"
                    body="Each guide points at a real URL. Add one, then open it to annotate the live page."
                    action={
                        <Button variant="dark" onClick={openNewDoc}>
                            Add documentation
                        </Button>
                    }
                />
            ) : (
                <List projectId={projectId} documentations={list} onEdit={openEditDoc} />
            )}

            {/* composer */}
            <HubModal open={modalOpen} onClose={closeModal}>
                <Form projectId={projectId} documentationId={editDocId} onClose={closeModal} />
            </HubModal>

            {/* import */}
            <HubModal open={importOpen} onClose={() => setImportOpen(false)}>
                <ModalHeader title="Import data" onClose={() => setImportOpen(false)} />
                <div className="hub-modal-body">
                    <ImportForm documentationId={projectId} postSubmit={() => setImportOpen(false)} />
                </div>
            </HubModal>

            <AISearch projectName={project?.title} />
        </div>
    );
}
