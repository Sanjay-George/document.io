import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import StatusPill from "./StatusPill";

const meta = {
    title: "Hub/StatusPill",
    component: StatusPill,
    args: { active: true },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { active: true } };
export const Inactive: Story = { args: { active: false } };
export const Clickable: Story = {
    args: { active: true, onClick: () => alert("toggle") },
};
