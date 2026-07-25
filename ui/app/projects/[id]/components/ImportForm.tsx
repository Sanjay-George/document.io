"use client";

import { useState } from "react";
import { mutate } from "swr";
import { importData } from "@/data_access/api/projects";
import { ALL_DOCUMENTATIONS_KEY } from "@/data_access/swr/documentations";
import { Button, useHubToast } from "@/components/hub";

export default function ImportForm({ documentationId, postSubmit }: { documentationId: string; postSubmit: () => void }) {
    const { toast } = useHubToast();
    const [docData, setDocData] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!docData.trim()) return;
        let parsed: any;
        try {
            parsed = JSON.parse(docData);
        } catch {
            toast("That isn’t valid JSON");
            return;
        }
        setSaving(true);
        try {
            await importData(documentationId, parsed);
            mutate(ALL_DOCUMENTATIONS_KEY(documentationId));
            setDocData("");
            toast("Data imported");
            postSubmit();
        } catch (err) {
            console.error(err);
            toast("Import failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label className="hub-field-label">Documentation config</label>
            <textarea
                className="hub-import-textarea"
                value={docData}
                onChange={(e) => setDocData(e.target.value)}
                placeholder="Paste exported JSON here…"
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <Button variant="save" type="submit" disabled={saving || !docData.trim()}>
                    Import
                </Button>
            </div>
        </form>
    );
}
