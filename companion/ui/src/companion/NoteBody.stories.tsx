import type { Meta, StoryObj } from '@storybook/react-vite';
import NoteBody from '@/companion/NoteBody';
import { sampleNotes } from '@/companion/fixtures';

const meta = {
    title: 'Companion/Components/NoteBody',
    component: NoteBody,
    args: { note: sampleNotes[2], showContext: true },
    decorators: [(Story) => <div className="w-[300px]">{Story()}</div>],
} satisfies Meta<typeof NoteBody>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Element-anchored note; clear `showContext` to drop the context line. */
export const Default: Story = {};

/** Whole-page note — the context line shows the URL instead of an element. */
export const PageScoped: Story = { args: { note: sampleNotes[0] } };
