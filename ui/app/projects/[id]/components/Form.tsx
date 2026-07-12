"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { Globe } from "lucide-react";
import { add, edit } from "@/data_access/api/documentations";
import { ALL_DOCUMENTATIONS_KEY, SINGLE_DOCUMENTATION_KEY, useDocumentation } from "@/data_access/swr/documentations";
import { Button, ModalHeader, useHubToast } from "@/components/hub";

export default function Form({
    projectId,
    documentationId,
    onClose,
}: {
    projectId: string;
    documentationId: string | null;
    onClose: () => void;
}) {
    const { toast } = useHubToast();
    const documentation = useDocumentation(documentationId as any)?.data;

    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (documentationId && documentation) {
            setTitle(documentation.title || "");
            setUrl(documentation.url || "");
        } else {
            setTitle("");
            setUrl("");
        }
    }, [documentationId, documentation]);

    const save = async () => {
        if (!title.trim() || !url.trim()) return;
        setSaving(true);
        try {
            if (!documentationId) {
                await add({ title: title.trim(), url: url.trim(), projectId });
                toast("Documentation added");
            } else {
                await edit(documentationId, { title: title.trim(), url: url.trim(), projectId });
                mutate(SINGLE_DOCUMENTATION_KEY(documentationId));
                toast("Documentation updated");
            }
            mutate(ALL_DOCUMENTATIONS_KEY(projectId));
            onClose();
        } catch (e) {
            console.error(e);
            toast("Couldn’t save documentation");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <ModalHeader title={documentationId ? "Edit documentation" : "Add documentation"} onClose={onClose} />
            <div className="hub-modal-body">
                <label className="hub-field-label">Guide title</label>
                <input
                    className="hub-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Renaming a repository"
                    autoFocus
                />

                <label className="hub-field-label mt">Target URL</label>
                <div className="hub-url-field">
                    <Globe size={15} color="#DD6234" style={{ flex: "none" }} />
                    <input
                        className="hub-url-input"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="app.example.com/settings"
                        onKeyDown={(e) => e.key === "Enter" && save()}
                    />
                </div>
                <div className="hub-field-hint">
                    Opening this guide launches the target in your browser with the companion active.
                </div>

                <div className="hub-modal-foot">
                    <span />
                    <div className="hub-modal-btns">
                        <Button variant="cancel" onClick={onClose}>Cancel</Button>
                        <Button variant="save" onClick={save} disabled={saving || !title.trim() || !url.trim()}>
                            {documentationId ? "Save" : "Add guide"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
