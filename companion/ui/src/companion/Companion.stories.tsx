import { ComponentProps, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Companion, { type CompanionHandle } from '@/companion/Companion';
import { noteSetTitle, sampleNotes } from '@/companion/fixtures';

const meta = {
    title: 'Companion/Companion',
    component: Companion,
    parameters: { layout: 'fullscreen' },
    args: { title: noteSetTitle, initialNotes: sampleNotes },
    decorators: [(Story) => <div className="flex h-screen flex-col items-end justify-end bg-[#F5F6FB]">{Story()}</div>],
} satisfies Meta<typeof Companion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The full, self-contained companion: mode/scope toggles, note CRUD, the
 * composer, toasts, dock orientation and minimize/restore all wired up. Clear
 * `initialNotes` for the empty state.
 */
export const Default: Story = {};

/**
 * The `pickTarget` integration seam: the host calls it when the user clicks an
 * element on the page, opening the composer for a new note.
 */
export const SimulateElementPick: Story = { render: (args) => <PickHarness {...args} /> };

function PickHarness(args: ComponentProps<typeof Companion>) {
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
}
