import type { Meta, StoryObj } from '@storybook/react-vite';
import NumberCircle from '@/companion/NumberCircle';

const meta = {
    title: 'Companion/Primitives/NumberCircle',
    component: NumberCircle,
    args: { number: 4, variant: 'idle' },
    argTypes: {
        variant: { control: 'inline-radio', options: ['idle', 'selected', 'broken', 'other'] },
    },
} satisfies Meta<typeof NumberCircle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Idle, selected, off-page and broken — the four card states, side by side. */
export const Variants: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <NumberCircle number={4} variant="idle" />
            <NumberCircle number={4} variant="selected" />
            <NumberCircle number={6} variant="other" />
            <NumberCircle number={7} variant="broken" />
        </div>
    ),
};
