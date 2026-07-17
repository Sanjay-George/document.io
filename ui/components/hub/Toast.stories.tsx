import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HubToastProvider, useHubToast } from "./toast";
import Button from "./Button";

/**
 * Transient confirmation toast. Provided app-wide by `HubToastProvider` and
 * fired imperatively via the `useHubToast()` hook; it auto-dismisses after a
 * few seconds.
 */
const meta = {
    title: "Hub/Components/Toast",
    component: HubToastProvider,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HubToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Trigger() {
    const { toast } = useHubToast();
    return (
        <div style={{ padding: 40, display: "flex", gap: 12 }}>
            <Button variant="primary" onClick={() => toast("Link copied")}>
                Show toast
            </Button>
            <Button variant="dark" onClick={() => toast("Project set inactive")}>
                Another message
            </Button>
        </div>
    );
}

/** Click a button to fire a toast — it slides in at the top and fades out on its own. */
export const Default: Story = {
    render: () => (
        <HubToastProvider>
            <Trigger />
        </HubToastProvider>
    ),
};
