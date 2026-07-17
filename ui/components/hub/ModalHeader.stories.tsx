import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ModalHeader from "./ModalHeader";

/** Title row with a close button, used at the top of a `HubModal`. */
const meta = {
    title: "Hub/Components/ModalHeader",
    component: ModalHeader,
    args: { title: "New project", onClose: () => {} },
    decorators: [
        (Story) => <div style={{ width: 460, background: "var(--dio-surface)", borderRadius: 18 }}>{Story()}</div>,
    ],
} satisfies Meta<typeof ModalHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const DocTitle: Story = { args: { title: "Add documentation", onClose: () => {} } };
