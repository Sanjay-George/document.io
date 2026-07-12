import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SectionHeader from "./SectionHeader";

const meta = {
    title: "Hub/SectionHeader",
    component: SectionHeader,
    args: { label: "Guides", meta: "3 guides" },
    parameters: { layout: "padded" },
    decorators: [(Story) => <div style={{ width: 520 }}>{Story()}</div>],
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoMeta: Story = { args: { label: "Assets", meta: undefined } };
