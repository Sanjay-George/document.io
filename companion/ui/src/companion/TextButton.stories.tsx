import type { Meta, StoryObj } from '@storybook/react-vite';
import TextButton from '@/companion/TextButton';
import { EditIcon, TargetIcon } from '@/companion/icons';

const meta = {
    title: 'Companion/Primitives/TextButton',
    component: TextButton,
    args: { label: 'Edit', className: 'text-dio-tertiary hover:text-dio-primary' },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { icon: <EditIcon size={13} /> } };

/** The three tones used on cards and the popover — neutral, destructive, danger. */
export const Variants: Story = {
    render: () => (
        <div className="flex items-center gap-[14px]">
            <TextButton label="Edit" icon={<EditIcon size={13} />} className="text-dio-tertiary hover:text-dio-primary" />
            <TextButton label="Delete" className="text-dio-danger-muted hover:text-dio-danger" />
            <TextButton label="Re-anchor" icon={<TargetIcon size={13} />} className="text-dio-danger-2" />
        </div>
    ),
};
