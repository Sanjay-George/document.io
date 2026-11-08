import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import EmptyState from "./EmptyState";
import Button from "./Button";
import { Plus } from "lucide-react";

/** Placeholder shown when a list or detail view has no content yet. */
const meta = {
    title: "Hub/Components/EmptyState",
    component: EmptyState,
    args: {
        title: "Nothing documented yet",
        body: "A project holds related guides. Create one to start documenting a workflow at its source.",
        action: (
            <Button variant="primary" icon={<Plus size={16} strokeWidth={2.2} />}>
                New project
            </Button>
        ),
    },
    parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The full first-run state. Clear `showIcon`/`action` for the trimmed
 * search-results form, or set `variant` to `detail` for compact spacing.
 */
export const Default: Story = {};
