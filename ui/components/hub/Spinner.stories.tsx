import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Spinner from "./Spinner";

/** Centered loading indicator used while a hub view fetches its data. */
const meta = {
    title: "Hub/Primitives/Spinner",
    component: Spinner,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
