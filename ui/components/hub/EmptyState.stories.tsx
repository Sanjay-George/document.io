import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import EmptyState from "./EmptyState";
import Button from "./Button";
import { Plus } from "lucide-react";

/** Placeholder shown when a list or detail view has no content yet. */
const meta = {
    title: "Hub/Components/EmptyState",
    component: EmptyState,
    args: { title: "Nothing documented yet" },
    parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Icon, body copy and a call-to-action — the full first-run state. */
export const Default: Story = {
    args: {
        title: "Nothing documented yet",
        body: "A project holds related guides. Create one to start documenting a workflow at its source.",
        action: (
            <Button variant="primary" icon={<Plus size={16} strokeWidth={2.2} />}>
                New project
            </Button>
        ),
    },
};

/** Trimmed variant for empty search/filter results — no icon, no action. */
export const NoIcon: Story = {
    args: { showIcon: false, title: "No matching projects", body: "Try a different filter or search term." },
};

/** Compact spacing for use inside a project detail pane. */
export const Detail: Story = {
    args: {
        variant: "detail",
        title: "No guides here yet",
        body: "Open the companion on your app to capture the first step.",
    },
};
