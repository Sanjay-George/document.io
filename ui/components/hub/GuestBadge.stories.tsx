import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import GuestBadge from "./GuestBadge";

const meta = {
    title: "Hub/GuestBadge",
    component: GuestBadge,
} satisfies Meta<typeof GuestBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
