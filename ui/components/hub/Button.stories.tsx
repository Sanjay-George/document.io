import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus, ArrowRight, Download } from "lucide-react";
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

/** The main call to action — brand-filled, with an optional leading icon. */
export const Primary: Story = { args: { variant: "primary", icon: <Plus size={16} strokeWidth={2.2} /> } };
export const Dark: Story = { args: { variant: "dark", children: "Get the app" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Import" } };
export const Cancel: Story = { args: { variant: "cancel", children: "Cancel" } };
export const Save: Story = { args: { variant: "save", children: "Save" } };

/** Icons can trail the label too. */
export const WithTrailingIcon: Story = {
    args: { variant: "primary", children: "Add to Chrome", icon: <ArrowRight size={16} /> },
};

export const Disabled: Story = {
    args: { variant: "primary", children: "New project", disabled: true },
};

/** Passing `href` renders an anchor; `target="_blank"` makes it an external link. */
export const AsLink: Story = {
    args: { variant: "dark", href: "https://example.com", target: "_blank", children: "Download extension", icon: <Download size={16} /> },
};
