import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Breadcrumb from "./Breadcrumb";

/** Hierarchy trail. Items with `href` are links; the `current` item is the plain, final crumb. */
const meta = {
    title: "Hub/Components/Breadcrumb",
    component: Breadcrumb,
    parameters: { layout: "padded" },
    args: {
        items: [
            { label: "projects", href: "/projects" },
            { label: "support-playbook", href: "/projects/1" },
            { label: "upload", current: true },
        ],
    },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every crumb but the last is navigable; drop items for a shallower trail. */
export const Default: Story = {};
