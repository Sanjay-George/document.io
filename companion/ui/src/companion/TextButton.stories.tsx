import type { Meta, StoryObj } from '@storybook/react-vite';
import TextButton from '@/companion/TextButton';
import { EditIcon } from '@/companion/icons';

const meta = {
    title: 'Companion/Primitives/TextButton',
    component: TextButton,
    args: { label: 'Edit', className: 'text-dio-tertiary hover:text-dio-primary' },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Edit: Story = {
    args: { label: 'Edit', icon: <EditIcon size={13} />, className: 'text-dio-tertiary hover:text-dio-primary' },
};

export const Delete: Story = {
    args: { label: 'Delete', className: 'text-[#B79A93] hover:text-dio-danger' },
};

export const Danger: Story = {
    args: { label: 'Re-anchor', className: 'text-dio-danger-2' },
};
