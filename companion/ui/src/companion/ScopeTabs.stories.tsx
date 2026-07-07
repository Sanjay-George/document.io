import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ScopeTabs from '@/companion/ScopeTabs';
import { Tab } from '@/companion/types';

const meta = {
    title: 'Companion/Primitives/ScopeTabs',
    component: ScopeTabs,
    args: { value: 'page', countAll: 7, onChange: () => {} },
    render: (args) => {
        const [tab, setTab] = useState<Tab>(args.value);
        return <ScopeTabs {...args} value={tab} onChange={setTab} />;
    },
} satisfies Meta<typeof ScopeTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
