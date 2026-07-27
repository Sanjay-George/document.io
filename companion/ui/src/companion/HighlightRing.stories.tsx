import type { Meta, StoryObj } from '@storybook/react-vite';
import HighlightRing from '@/companion/HighlightRing';
import Badge from '@/companion/Badge';

const meta = {
    title: 'Companion/Primitives/HighlightRing',
    component: HighlightRing,
    args: { selected: true, radius: '10px' },
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

/** As it appears on the host page — ring plus its badge. Clear `selected` for the idle ring. */
export const Default: Story = {
    render: (args) => (
        <>
            <HighlightRing {...args} />
            <Badge number={4} state={args.selected ? 'selected' : 'idle'} style={{ top: -11, right: -9 }} />
        </>
    ),
};
