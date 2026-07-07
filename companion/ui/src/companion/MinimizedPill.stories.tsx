import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import MinimizedPill from '@/companion/MinimizedPill';
import { Mode } from '@/companion/types';

const meta = {
    title: 'Companion/Components/MinimizedPill',
    component: MinimizedPill,
    parameters: { layout: 'fullscreen' },
    args: { count: 5, mode: 'view', onRestore: () => {}, onModeChange: () => {} },
    render: (args) => {
        const [mode, setMode] = useState<Mode>(args.mode);
        return <MinimizedPill {...args} mode={mode} onModeChange={setMode} />;
    },
} satisfies Meta<typeof MinimizedPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
