import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import Toggle from "./Toggle";

const meta = {
    title: "Hub/Toggle",
    component: Toggle,
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

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
