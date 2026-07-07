import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Companion, { type CompanionHandle } from '@/companion/Companion';
import { PanelOrientation } from '@/models/panelOrientation';
import { noteSetTitle, sampleNotes } from '@/companion/fixtures';

const meta = {
    title: 'Companion/Companion',
    component: Companion,
    parameters: { layout: 'fullscreen' },
    decorators: [(Story) => <div className="flex h-screen flex-col items-end justify-end bg-[#F5F6FB]">{Story()}</div>],
} satisfies Meta<typeof Companion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The full, self-contained companion: mode/scope toggles, note CRUD, the
 * composer, toasts and minimize/restore all wired up.
 */
export const Full: Story = {
    args: { title: noteSetTitle, initialNotes: sampleNotes },
};

export const Empty: Story = {
    args: { title: noteSetTitle, initialNotes: [] },
};

/** Bottom-docked from the start; toggle back to right-dock in the header. */
export const HorizontalDock: Story = {
    args: { title: noteSetTitle, initialNotes: sampleNotes, initialOrientation: PanelOrientation.HORIZONTAL },
};

/**
 * Shows the `pickTarget` integration seam: the host calls it when the user
 * clicks an element on the page, opening the composer for a new note.
 */
export const SimulateElementPick: Story = {
    args: { title: noteSetTitle, initialNotes: sampleNotes },
    render: (args) => {
        const ref = useRef<CompanionHandle>(null);
        return (
            <>
                <div className="fixed left-4 top-4 z-[80]">
                    <button
                        type="button"
                        onClick={() =>
                            ref.current?.pickTarget({
                                selector: 'header button.btn--deploy',
                                url: 'halyard.app/deployments',
                                type: 'component',
                            })
                        }
                        className="rounded-dio-button bg-dio-ink px-3 py-2 text-[12.5px] font-semibold text-white"
                    >
                        Simulate element pick
                    </button>
                </div>
                <Companion {...args} ref={ref} />
            </>
        );
    },
};
