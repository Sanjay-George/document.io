import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import StatusPill from "./StatusPill";

/** Active/inactive state chip for a project or guide. Renders as a `<button>` when `onClick` is supplied. */
const meta = {
    title: "Hub/Primitives/StatusPill",
    component: StatusPill,
    args: { active: true },
    argTypes: { onClick: { control: false } },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { active: true } };
export const Inactive: Story = { args: { active: false } };

/** With `onClick` it becomes an interactive toggle — click to flip the state. */
export const Clickable: Story = {
    render: () => {
        const [active, setActive] = useState(true);
        return <StatusPill active={active} onClick={() => setActive((a) => !a)} />;
    },
};
