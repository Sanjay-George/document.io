import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus, ArrowRight } from "lucide-react";
import Button from "./Button";

const meta = {
    title: "Hub/Button",
    component: Button,
    args: { children: "New project", variant: "primary" },
    argTypes: {
        variant: { control: "inline-radio", options: ["primary", "dark", "ghost", "cancel", "save"] },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary", icon: <Plus size={16} strokeWidth={2.2} /> } };
export const Dark: Story = { args: { variant: "dark", children: "Get the app" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Import" } };
export const Cancel: Story = { args: { variant: "cancel", children: "Cancel" } };
export const Save: Story = { args: { variant: "save", children: "Save" } };
export const WithTrailingIcon: Story = {
    args: { variant: "primary", children: "Add to Chrome", icon: <ArrowRight size={16} /> },
};
