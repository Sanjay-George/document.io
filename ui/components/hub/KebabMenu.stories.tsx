import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pencil, Power, Link2, Trash2 } from "lucide-react";
import KebabMenu from "./KebabMenu";

const meta = {
    title: "Hub/KebabMenu",
    component: KebabMenu,
    parameters: { layout: "padded" },
    decorators: [(Story) => <div style={{ display: "flex", justifyContent: "flex-end", width: 240 }}>{Story()}</div>],
    args: {
        items: [
            { label: "Rename", icon: <Pencil size={15} />, onClick: () => {} },
            { label: "Set inactive", icon: <Power size={15} />, onClick: () => {} },
            { label: "Copy link", icon: <Link2 size={15} />, onClick: () => {} },
            { label: "Delete project", icon: <Trash2 size={15} />, onClick: () => {}, danger: true, separatorBefore: true },
        ],
    },
} satisfies Meta<typeof KebabMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
