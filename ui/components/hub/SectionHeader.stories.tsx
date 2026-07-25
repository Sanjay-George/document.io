import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SectionHeader from "./SectionHeader";
import StatusPill from "./StatusPill";

/** Label + optional trailing `meta` slot that heads a list section. */
const meta = {
    title: "Hub/Components/SectionHeader",
    component: SectionHeader,
    args: { label: "Guides", meta: "3 guides" },
    parameters: { layout: "padded" },
    decorators: [(Story) => <div style={{ width: 520 }}>{Story()}</div>],
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `meta` is optional — omit it for a bare label. */
export const NoMeta: Story = { args: { label: "Assets", meta: undefined } };

/** `meta` accepts any node, so it can carry a status chip or other control. */
export const RichMeta: Story = {
    args: { label: "support-playbook", meta: <StatusPill active /> },
};
