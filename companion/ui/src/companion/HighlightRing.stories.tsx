import type { Meta, StoryObj } from '@storybook/react-vite';
import HighlightRing from '@/companion/HighlightRing';
import Badge from '@/companion/Badge';

const meta = {
    title: 'Companion/Primitives/HighlightRing',
    component: HighlightRing,
    args: { selected: false, radius: '10px' },
    decorators: [
        (Story) => (
            <div className="relative flex h-[44px] w-[180px] items-center justify-center rounded-[10px] bg-dio-subtle text-[13.5px] text-dio-secondary">
                Target element
                {Story()}
            </div>
        ),
    ],
} satisfies Meta<typeof HighlightRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};
export const Selected: Story = { args: { selected: true } };

export const WithBadge: Story = {
    args: { selected: true },
    render: (args) => (
        <>
            <HighlightRing {...args} />
            <Badge number={4} state="selected" style={{ top: -11, right: -9 }} />
        </>
    ),
};
