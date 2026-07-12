import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Spinner from "./Spinner";

const meta = {
    title: "Hub/Spinner",
    component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
