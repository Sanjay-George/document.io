import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import GuestBadge from "./GuestBadge";

/** Avatar-slot placeholder shown in the top bar for an unauthenticated (guest) session. */
const meta = {
    title: "Hub/Primitives/GuestBadge",
    component: GuestBadge,
} satisfies Meta<typeof GuestBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
