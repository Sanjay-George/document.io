import type { Meta, StoryObj } from '@storybook/react-vite';
import NoteBody from '@/companion/NoteBody';
import { sampleNotes } from '@/companion/fixtures';

const meta = {
    title: 'Companion/Components/NoteBody',
    component: NoteBody,
    decorators: [(Story) => <div className="w-[300px]">{Story()}</div>],
} satisfies Meta<typeof NoteBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMarkdown: Story = {
    args: { note: sampleNotes[2] },
};

export const PageScoped: Story = {
    args: { note: sampleNotes[0] },
};

export const BodyOnly: Story = {
    args: { note: sampleNotes[3], showContext: false },
};
