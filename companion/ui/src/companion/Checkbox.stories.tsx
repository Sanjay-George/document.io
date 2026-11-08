import { ComponentProps, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Checkbox from '@/companion/Checkbox';

function Harness(args: ComponentProps<typeof Checkbox>) {
    const [checked, setChecked] = useState(args.checked);
    return <Checkbox {...args} checked={checked} onChange={setChecked} />;
}

const meta = {
    title: 'Companion/Primitives/Checkbox',
    component: Checkbox,
    args: { checked: false, label: 'Whole page', onChange: () => {} },
    render: (args) => <Harness {...args} />,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click to toggle. */
export const Default: Story = {};
