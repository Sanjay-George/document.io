import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ModalHeader from "./ModalHeader";

const meta = {
    title: "Hub/ModalHeader",
    component: ModalHeader,
    args: { title: "New project", onClose: () => {} },
    decorators: [(Story) => <div style={{ width: 460, background: "#fff", borderRadius: 18 }}>{Story()}</div>],
} satisfies Meta<typeof ModalHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const DocTitle: Story = { args: { title: "Add documentation", onClose: () => {} } };
