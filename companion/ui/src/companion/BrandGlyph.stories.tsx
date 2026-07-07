import type { Meta, StoryObj } from '@storybook/react-vite';
import BrandGlyph from '@/companion/BrandGlyph';

const meta = {
    title: 'Companion/Primitives/BrandGlyph',
    component: BrandGlyph,
    args: { size: 8 },
    argTypes: { size: { control: { type: 'range', min: 6, max: 48, step: 1 } } },
} satisfies Meta<typeof BrandGlyph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accent: Story = {
    render: (args) => (
        <span className="text-dio-accent">
            <BrandGlyph {...args} />
        </span>
    ),
};

export const OnAccentChip: Story = {
    args: { size: 9 },
    render: (args) => (
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-dio-chip bg-dio-accent text-white">
            <BrandGlyph {...args} />
        </span>
    ),
};
