import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import Toggle from "./Toggle";

/** Switch with an optional trailing label. Controlled — the parent owns `on`. */
const meta = {
    title: "Hub/Primitives/Toggle",
    component: Toggle,
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Starts on; the label tracks the state as you flip it. */
export const Interactive: Story = {
    render: () => {
        const [on, setOn] = useState(true);
        return <Toggle on={on} onChange={setOn} label={on ? "Active" : "Inactive"} />;
    },
};

export const Off: Story = {
    render: () => {
        const [on, setOn] = useState(false);
        return <Toggle on={on} onChange={setOn} label={on ? "Active" : "Inactive"} />;
    },
};

/** No label — just the switch. */
export const NoLabel: Story = {
    render: () => {
        const [on, setOn] = useState(true);
        return <Toggle on={on} onChange={setOn} />;
    },
};
