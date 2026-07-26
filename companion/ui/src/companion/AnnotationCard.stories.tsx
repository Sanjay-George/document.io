import { ComponentProps, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import AnnotationCard from '@/companion/AnnotationCard';
import { sampleNotes } from '@/companion/fixtures';

const noop = () => {};

const normal = sampleNotes[3];
const offPage = sampleNotes[4];
const broken = sampleNotes[5];

const meta = {
    title: 'Companion/Components/AnnotationCard',
    component: AnnotationCard,
    // Every control wired, so a variant differs only where it genuinely must.
    args: {
        note: normal,
        selected: true,
        onSelect: noop,
        onEdit: noop,
        onDelete: noop,
        onReanchor: noop,
        onOpen: noop,
        onMoveUp: noop,
        onMoveDown: noop,
        canMoveUp: true,
        canMoveDown: true,
    },
    decorators: [
        (Story) => <div className="w-[348px] rounded-dio-container bg-white p-[14px]">{Story()}</div>,
    ],
} satisfies Meta<typeof AnnotationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

function Expandable(args: ComponentProps<typeof AnnotationCard>) {
    const [selected, setSelected] = useState(true);
    return <AnnotationCard {...args} selected={selected} onSelect={() => setSelected((v) => !v)} />;
}

/** Click the card to collapse/expand it. */
export const Default: Story = { render: (args) => <Expandable {...args} /> };

/**
 * Normal / off-page / broken, collapsed then expanded. The control row must stay
 * identical across all three — only "Go to page" (off-page) and the stale-element
 * warning (broken) may differ.
 */
export const Variants: Story = {
    render: (args) => (
        <div className="flex flex-col gap-1">
            {[normal, offPage, broken].map((note) => (
                <AnnotationCard {...args} key={`collapsed-${note.id}`} note={note} selected={false} />
            ))}
            {[normal, offPage, broken].map((note) => (
                <AnnotationCard {...args} key={`expanded-${note.id}`} note={note} selected />
            ))}
        </div>
    ),
};

/** Exported file — every editing control is hidden, the warning stays. */
export const ReadOnly: Story = {
    args: { readOnly: true },
    render: (args) => (
        <div className="flex flex-col gap-1">
            <AnnotationCard {...args} note={normal} />
            <AnnotationCard {...args} note={broken} />
        </div>
    ),
};
