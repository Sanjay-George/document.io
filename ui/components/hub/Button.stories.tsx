import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus, Download } from "lucide-react";
import Button from "./Button";

/**
 * The hub's button, one component across five visual variants. Renders a
 * `<button>` by default, or an `<a>`/Next `<Link>` when given an `href`.
 */
const meta = {
    title: "Hub/Components/Button",
    component: Button,
    args: { children: "New project", variant: "primary" },
    argTypes: {
        variant: { control: "inline-radio", options: ["primary", "dark", "ghost", "cancel", "save"] },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An `icon` sits before the label; set `disabled` or switch `variant` from the controls. */
export const Default: Story = { args: { icon: <Plus size={16} strokeWidth={2.2} /> } };

/** The five variants, plus disabled and the anchor form that `href` produces. */
export const Variants: Story = {
    render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <Button variant="primary" icon={<Plus size={16} strokeWidth={2.2} />}>
                New project
            </Button>
            <Button variant="dark">Get the app</Button>
            <Button variant="ghost">Import</Button>
            <Button variant="cancel">Cancel</Button>
            <Button variant="save">Save</Button>
            <Button variant="primary" disabled>
                Disabled
            </Button>
            <Button variant="dark" href="https://example.com" target="_blank" icon={<Download size={16} />}>
                Download extension
            </Button>
        </div>
    ),
};
