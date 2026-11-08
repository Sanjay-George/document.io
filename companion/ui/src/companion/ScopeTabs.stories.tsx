import { ComponentProps, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ScopeTabs from '@/companion/ScopeTabs';
import { Tab } from '@/companion/types';

function Harness(args: ComponentProps<typeof ScopeTabs>) {
    const [tab, setTab] = useState<Tab>(args.value);
    return <ScopeTabs {...args} value={tab} onChange={setTab} />;
}

const meta = {
    title: 'Companion/Primitives/ScopeTabs',
    component: ScopeTabs,
    args: { value: 'page', countAll: 7, onChange: () => {} },
    render: (args) => <Harness {...args} />,
} satisfies Meta<typeof ScopeTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
