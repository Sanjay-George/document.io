import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Checkbox from '@/companion/Checkbox';

const meta = {
    title: 'Companion/Primitives/Checkbox',
    component: Checkbox,
    args: { checked: false, label: 'Whole page', onChange: () => {} },
    render: (args) => {
        const [checked, setChecked] = useState(args.checked);
        return <Checkbox {...args} checked={checked} onChange={setChecked} />;
    },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { checked: true } };
