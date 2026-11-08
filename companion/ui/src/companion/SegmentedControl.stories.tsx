import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import SegmentedControl from '@/companion/SegmentedControl';
import { Mode } from '@/companion/types';

const meta = {
    title: 'Companion/Primitives/SegmentedControl',
    component: SegmentedControl,
    args: { value: 'view', onChange: () => {} },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness({ variant }: { variant: 'panel' | 'pill' }) {
    const [mode, setMode] = useState<Mode>('view');
    return <SegmentedControl value={mode} onChange={setMode} variant={variant} />;
}

/** `panel` sits in the panel header; `pill` is reversed out of the minimized pill. */
export const Variants: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <Harness variant="panel" />
            <div className="rounded-dio-pill bg-dio-ink p-1.5">
                <Harness variant="pill" />
            </div>
        </div>
    ),
};
