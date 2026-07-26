import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import FormatToolbar, { type FormatToken } from '@/companion/FormatToolbar';

const meta = {
    title: 'Companion/Components/FormatToolbar',
    component: FormatToolbar,
    args: { onInsert: () => {} },
    decorators: [(Story) => <div className="w-[300px]">{Story()}</div>],
} satisfies Meta<typeof FormatToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { onInsert: () => {} },
};

export const WithLog: Story = {
    render: () => {
        const [last, setLast] = useState<FormatToken | null>(null);
        return (
            <div>
                <FormatToolbar onInsert={setLast} />
                <p className="mt-2 text-[12px] text-dio-muted">Inserted: {last ?? '—'}</p>
            </div>
        );
    },
};
