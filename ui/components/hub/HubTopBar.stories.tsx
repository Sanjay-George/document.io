import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HubTopBar from "./HubTopBar";

/** Sticky app chrome: brand mark, the "get companion" CTA, and the session badge. */
const meta = {
    title: "Hub/Components/TopBar",
    component: HubTopBar,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HubTopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
