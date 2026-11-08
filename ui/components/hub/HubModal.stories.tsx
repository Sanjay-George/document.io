import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import HubModal from "./HubModal";
import ModalHeader from "./ModalHeader";
import Button from "./Button";

/**
 * Overlay dialog shell. Renders a scrim + card, closes on scrim click or
 * Escape, and slots arbitrary content. The `install` variant is a centered,
 * padded promo card; `modal` is the standard header/body form container.
 */
const meta = {
    title: "Hub/Components/HubModal",
    component: HubModal,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HubModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open the dialog, then dismiss via the scrim, the ✕, or Escape. */
export const Standard: Story = {
    render: () => {
        const [open, setOpen] = useState(true);
        return (
            <div style={{ padding: 40 }}>
                <Button variant="primary" onClick={() => setOpen(true)}>
                    Open modal
                </Button>
                <HubModal open={open} onClose={() => setOpen(false)}>
                    <ModalHeader title="New project" onClose={() => setOpen(false)} />
                    <div className="hub-modal-body">
                        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--dio-text-tertiary)" }}>
                            A project groups related guides. Give it a name to get started.
                        </p>
                        <div className="hub-modal-foot">
                            <span />
                            <div className="hub-modal-btns">
                                <Button variant="cancel" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="save" onClick={() => setOpen(false)}>
                                    Create
                                </Button>
                            </div>
                        </div>
                    </div>
                </HubModal>
            </div>
        );
    },
};

/** The `install` variant — a centered card for the "get the companion" prompt. */
export const Install: Story = {
    render: () => {
        const [open, setOpen] = useState(true);
        return (
            <div style={{ padding: 40 }}>
                <Button variant="dark" onClick={() => setOpen(true)}>
                    Get Companion App
                </Button>
                <HubModal open={open} onClose={() => setOpen(false)} variant="install">
                    <div className="hub-install-icon">
                        <i />
                    </div>
                    <div className="hub-install-title">Install the companion</div>
                    <div className="hub-install-body">
                        The companion lives in your browser and lets you capture guides right where the work happens.
                    </div>
                    <a className="hub-install-cta" href="#" onClick={(e) => e.preventDefault()}>
                        Add to Chrome
                        <ArrowRight size={16} />
                    </a>
                    <button className="hub-install-later" onClick={() => setOpen(false)}>
                        Maybe later
                    </button>
                </HubModal>
            </div>
        );
    },
};
