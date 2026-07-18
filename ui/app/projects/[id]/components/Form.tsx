"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { Globe } from "lucide-react";
import { add, edit } from "@/data_access/api/documentations";
import { ALL_DOCUMENTATIONS_KEY, SINGLE_DOCUMENTATION_KEY, useDocumentation } from "@/data_access/swr/documentations";
import { Button, ModalHeader, useHubToast } from "@/components/hub";
import { safeUrl } from "@/lib/utils";

/** Accept bare hosts (`app.example.com/x`) by assuming https, then require http(s). */
const normalizeUrl = (raw: string): string | null =>
    safeUrl(/^[a-zA-Z][\w+.-]*:/.test(raw) ? raw : `https://${raw}`);

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

    const safeUrlValue = normalizeUrl(url.trim());
    const urlInvalid = url.trim().length > 0 && !safeUrlValue;

    const save = async () => {
        if (!title.trim() || !safeUrlValue) return;
        setSaving(true);
        try {
            if (!documentationId) {
                await add({ title: title.trim(), url: safeUrlValue, projectId });
                toast("Documentation added");
            } else {
                await edit(documentationId, { title: title.trim(), url: safeUrlValue, projectId });
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
                        type="url"
                        className="hub-url-input"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="app.example.com/settings"
                        aria-invalid={urlInvalid}
                        onKeyDown={(e) => e.key === "Enter" && save()}
                    />
                </div>
                <div className="hub-field-hint">
                    {urlInvalid ? (
                        <span className="hub-field-error">Enter a valid http(s) URL.</span>
                    ) : (
                        <>
                            Opening this guide launches the target in your browser with the companion
                            active. Notes attach to the path only, so you can change the domain (e.g.
                            localhost → a dev server) here and your annotations move with it.
                        </>
                    )}
                </div>

                <div className="hub-modal-foot">
                    <span />
                    <div className="hub-modal-btns">
                        <Button variant="cancel" onClick={onClose}>Cancel</Button>
                        <Button variant="save" onClick={save} disabled={saving || !title.trim() || !safeUrlValue}>
                            {documentationId ? "Save" : "Add guide"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
