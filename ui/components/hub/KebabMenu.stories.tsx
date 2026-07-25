import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Pencil, Power, Link2, Trash2 } from "lucide-react";
import KebabMenu, { type MenuItem } from "./KebabMenu";

/**
 * Overflow "…" button that opens a popover menu. Closes on outside click or
 * Escape; items can be flagged `danger` and grouped with `separatorBefore`.
 */
const meta = {
    title: "Hub/Components/KebabMenu",
    component: KebabMenu,
    parameters: { layout: "padded" },
    decorators: [(Story) => <div style={{ display: "flex", justifyContent: "flex-end", width: 240 }}>{Story()}</div>],
} satisfies Meta<typeof KebabMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open the menu and pick an item — the last action is echoed below. */
export const Default: Story = {
    render: () => {
        const [last, setLast] = useState<string | null>(null);
        const items: MenuItem[] = [
            { label: "Rename", icon: <Pencil size={15} />, onClick: () => setLast("Rename") },
            { label: "Set inactive", icon: <Power size={15} />, onClick: () => setLast("Set inactive") },
            { label: "Copy link", icon: <Link2 size={15} />, onClick: () => setLast("Copy link") },
            { label: "Delete project", icon: <Trash2 size={15} />, onClick: () => setLast("Delete project"), danger: true, separatorBefore: true },
        ];
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                <KebabMenu items={items} />
                <span style={{ fontSize: 12, color: "var(--dio-text-muted)" }}>
                    {last ? `Clicked: ${last}` : "No action yet"}
                </span>
            </div>
        );
    },
};
