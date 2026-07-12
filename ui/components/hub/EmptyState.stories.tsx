import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import EmptyState from "./EmptyState";
import Button from "./Button";

const meta = {
    title: "Hub/EmptyState",
    component: EmptyState,
    args: { title: "Nothing documented yet" },
    parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: "Nothing documented yet",
        body: "A project holds related guides. Create one to start documenting a workflow at its source.",
        action: <Button variant="primary">New project</Button>,
    },
};

export const NoIcon: Story = {
    args: { showIcon: false, title: "No matching projects", body: "Try a different filter or search term." },
};
