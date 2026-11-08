"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { add, edit } from "@/data_access/api/projects";
import { ALL_PROJECTS_KEY, SINGLE_PROJECT_KEY, useProject } from "@/data_access/swr/projects";
import { Button, ModalHeader, Toggle, useHubToast } from "@/components/hub";

export default function Form({ projectId, onClose }: { projectId: string | null; onClose: () => void }) {
    const { toast } = useHubToast();
    const project = useProject(projectId as any)?.data;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [active, setActive] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (projectId && project) {
            setName(project.title || "");
            setDescription(project.description || "");
            setActive(project.status !== "Inactive");
        } else {
            setName("");
            setDescription("");
            setActive(true);
        }
    }, [projectId, project]);

    const save = async () => {
        if (!name.trim()) return;
        setSaving(true);
        const status = active ? "Active" : "Inactive";
        try {
            if (!projectId) {
                await add({ title: name.trim(), description, status });
                toast("Project created");
            } else {
                await edit(projectId, { title: name.trim(), description, status });
                mutate(SINGLE_PROJECT_KEY(projectId));
                toast("Project updated");
            }
            mutate(ALL_PROJECTS_KEY);
            onClose();
        } catch (e) {
            console.error(e);
            toast("Couldn’t save project");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <ModalHeader title={projectId ? "Edit project" : "New project"} onClose={onClose} />
            <div className="hub-modal-body">
                <label className="hub-field-label">Project name</label>
                <input
                    className="hub-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Support Playbook"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && save()}
                />

                <label className="hub-field-label mt">Description</label>
                <textarea
                    className="hub-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this project document?"
                />

                <div className="hub-modal-foot">
                    <Toggle on={active} onChange={setActive} label={active ? "Active" : "Inactive"} />
                    <div className="hub-modal-btns">
                        <Button variant="cancel" onClick={onClose}>Cancel</Button>
                        <Button variant="save" onClick={save} disabled={saving || !name.trim()}>
                            {projectId ? "Save" : "Create"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
