import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import SegmentedControl from '@/companion/SegmentedControl';
import { Mode } from '@/companion/types';

const meta = {
    title: 'Companion/Primitives/SegmentedControl',
    component: SegmentedControl,
    args: { value: 'view', onChange: () => {} },
    render: (args) => {
        const [mode, setMode] = useState<Mode>(args.value);
        return <SegmentedControl {...args} value={mode} onChange={setMode} />;
    },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Panel: Story = {
    args: { value: 'view', variant: 'panel' },
};

export const Pill: Story = {
    args: { value: 'view', variant: 'pill' },
    decorators: [(Story) => <div className="rounded-dio-pill bg-dio-ink p-1.5">{Story()}</div>],
};
