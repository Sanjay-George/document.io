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

/** Labelled and bare, both live — the label tracks the state as you flip it. */
export const Default: Story = {
    render: () => {
        const [labelled, setLabelled] = useState(true);
        const [bare, setBare] = useState(false);
        return (
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <Toggle on={labelled} onChange={setLabelled} label={labelled ? "Active" : "Inactive"} />
                <Toggle on={bare} onChange={setBare} />
            </div>
        );
    },
};
