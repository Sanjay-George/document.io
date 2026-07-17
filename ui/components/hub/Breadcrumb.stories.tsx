import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Breadcrumb from "./Breadcrumb";

/** Hierarchy trail. Items with `href` are links; the `current` item is the plain, final crumb. */
const meta = {
    title: "Hub/Components/Breadcrumb",
    component: Breadcrumb,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two levels: a linked root and the current project. */
export const ProjectDetail: Story = {
    args: {
        items: [
            { label: "projects", href: "/projects" },
            { label: "support-playbook", current: true },
        ],
    },
};

/** Three levels — every crumb but the last is navigable. */
export const NestedUpload: Story = {
    args: {
        items: [
            { label: "projects", href: "/projects" },
            { label: "support-playbook", href: "/projects/1" },
            { label: "upload", current: true },
        ],
    },
};
