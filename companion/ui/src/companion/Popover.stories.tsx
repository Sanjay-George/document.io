import type { Meta, StoryObj } from '@storybook/react-vite';
import Popover from '@/companion/Popover';
import { sampleNotes } from '@/companion/fixtures';

const noop = () => {};

const meta = {
    title: 'Companion/Components/Popover',
    component: Popover,
    args: {
        note: sampleNotes[3],
        onClose: noop,
        onEdit: noop,
        onReanchor: noop,
        onDelete: noop,
        onPrev: noop,
        onNext: noop,
        style: { position: 'absolute', left: 0, top: 0 },
    },
    // Popover is position:fixed; render it relative to the story frame instead.
    decorators: [(Story) => <div className="relative h-[320px] w-[340px]">{Story()}</div>],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clear `onPrev`/`onNext` to hide the prev/next stepper in the header. */
export const Default: Story = {};

/** Read-only (exported file) — the Edit / Re-anchor / Delete action row is hidden. */
export const ReadOnly: Story = { args: { readOnly: true } };
