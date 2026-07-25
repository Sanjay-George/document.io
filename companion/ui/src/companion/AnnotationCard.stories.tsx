import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import AnnotationCard from '@/companion/AnnotationCard';
import { sampleNotes } from '@/companion/fixtures';

const noop = () => {};

const meta = {
    title: 'Companion/Components/AnnotationCard',
    component: AnnotationCard,
    args: { selected: false, onSelect: noop, onEdit: noop, onDelete: noop, onReanchor: noop },
    decorators: [
        (Story) => (
            <div className="w-[348px] rounded-dio-container bg-white p-[14px]">{Story()}</div>
        ),
    ],
} satisfies Meta<typeof AnnotationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
    args: { note: sampleNotes[1], selected: false },
};

export const Expanded: Story = {
    args: { note: sampleNotes[3], selected: true },
};

/** Off-page note (collapsed) — shows a "Go to page" action alongside the snippet. */
export const OtherPage: Story = {
    args: { note: sampleNotes[4], selected: false, onOpen: noop },
};

/** Off-page note (expanded) — editable/re-anchorable, with "Go to page" on the right. */
export const OtherPageExpanded: Story = {
    args: { note: sampleNotes[4], selected: true, onOpen: noop },
};

/** Broken (off-anchor) note, collapsed — same shape as any other card, flagged by the "!" circle. */
export const Broken: Story = {
    args: { note: sampleNotes[5], selected: false },
};

/** Broken note, expanded — reveals the body, the dead selector, and Re-anchor/Dismiss. */
export const BrokenExpanded: Story = {
    args: { note: sampleNotes[5], selected: true },
};

/** Expanded card with the reorder (move up/down) controls. */
export const Reorderable: Story = {
    args: {
        note: sampleNotes[3],
        selected: true,
        onMoveUp: noop,
        onMoveDown: noop,
        canMoveUp: true,
        canMoveDown: true,
    },
};

/** Read-only (exported file) — expanded body with all editing actions hidden. */
export const ReadOnly: Story = {
    args: { note: sampleNotes[3], selected: true, readOnly: true },
};

/** Read-only broken note (expanded) — warning and selector stay, but Re-anchor/Dismiss are hidden. */
export const ReadOnlyBroken: Story = {
    args: { note: sampleNotes[5], selected: true, readOnly: true },
};

export const Interactive: Story = {
    args: { note: sampleNotes[2] },
    render: (args) => {
        const [selected, setSelected] = useState(false);
        return <AnnotationCard {...args} selected={selected} onSelect={() => setSelected((v) => !v)} />;
    },
};
