import type { Meta, StoryObj } from '@storybook/react-vite';
import EmptyState from '@/companion/EmptyState';

const meta = {
    title: 'Companion/Components/EmptyState',
    component: EmptyState,
    args: { onAddNote: () => {} },
    decorators: [
        (Story) => <div className="w-[376px] rounded-dio-container border border-dio-border-panel bg-white">{Story()}</div>,
    ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Read-only export view — no "Add a note" call-to-action. */
export const ReadOnly: Story = { args: { onAddNote: undefined } };
