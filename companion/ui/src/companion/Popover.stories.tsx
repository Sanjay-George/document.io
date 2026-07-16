import type { Meta, StoryObj } from '@storybook/react-vite';
import Popover from '@/companion/Popover';
import { sampleNotes } from '@/companion/fixtures';

const noop = () => {};

const meta = {
    title: 'Companion/Components/Popover',
    component: Popover,
    args: { onClose: noop, onEdit: noop, onReanchor: noop, onDelete: noop },
    // Popover is position:fixed; render it relative to the story frame instead.
    decorators: [(Story) => <div className="relative h-[320px] w-[340px]">{Story()}</div>],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { note: sampleNotes[3], style: { position: 'absolute', left: 0, top: 0 } },
};

// Prev/next enabled — stepping through on-page notes from the header.
export const WithNavigation: Story = {
    args: { note: sampleNotes[3], onPrev: noop, onNext: noop, style: { position: 'absolute', left: 0, top: 0 } },
};
