import type { Meta, StoryObj } from '@storybook/react-vite';
import Badge from '@/companion/Badge';

const meta = {
    title: 'Companion/Primitives/Badge',
    component: Badge,
    args: { number: 4, state: 'idle' },
    argTypes: { state: { control: 'inline-radio', options: ['idle', 'selected', 'flashing'] } },
    // Badge is absolutely positioned; give it a relative host to sit on.
    decorators: [
        (Story) => (
            <div className="relative h-[60px] w-[160px] rounded-dio-card border border-dio-border-panel bg-white">
                {Story()}
            </div>
        ),
    ],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = { args: { style: { top: -10, left: -10 } } };
export const Selected: Story = { args: { state: 'selected', style: { top: -10, left: -10 } } };
export const Flashing: Story = { args: { state: 'flashing', style: { top: -10, left: -10 } } };
