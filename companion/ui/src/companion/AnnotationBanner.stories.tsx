import type { Meta, StoryObj } from '@storybook/react-vite';
import AnnotationBanner from '@/companion/AnnotationBanner';

const meta = {
    title: 'Companion/Components/AnnotationBanner',
    component: AnnotationBanner,
    decorators: [(Story) => <div className="w-[348px]">{Story()}</div>],
} satisfies Meta<typeof AnnotationBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Annotate: Story = { args: { variant: 'annotate' } };

export const Reanchor: Story = {
    args: { variant: 'reanchor', reanchorTitle: 'Legacy deploy toggle', onCancel: () => {} },
};
