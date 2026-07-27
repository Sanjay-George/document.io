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

/** The glyph inherits `currentColor` — on the accent, and reversed out of it. */
export const Default: Story = {
    render: (args) => (
        <div className="flex items-center gap-4">
            <span className="text-dio-accent">
                <BrandGlyph {...args} />
            </span>
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-dio-chip bg-dio-accent text-white">
                <BrandGlyph {...args} />
            </span>
        </div>
    ),
};
