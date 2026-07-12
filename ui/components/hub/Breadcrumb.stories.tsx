import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Breadcrumb from "./Breadcrumb";

const meta = {
    title: "Hub/Breadcrumb",
    component: Breadcrumb,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectDetail: Story = {
    args: {
        items: [
            { label: "projects", href: "/projects" },
            { label: "support-playbook", current: true },
        ],
    },
};

export const NestedUpload: Story = {
    args: {
        items: [
            { label: "projects", href: "/projects" },
            { label: "support-playbook", href: "/projects/1" },
            { label: "upload", current: true },
        ],
    },
};
