import type { Meta, StoryObj } from '@storybook/react-vite';
import AnnotationBanner from '@/companion/AnnotationBanner';

const meta = {
    title: 'Companion/Components/AnnotationBanner',
    component: AnnotationBanner,
    args: { variant: 'annotate', reanchorTitle: 'Legacy deploy toggle', onCancel: () => {} },
    argTypes: { variant: { control: 'inline-radio', options: ['annotate', 'reanchor'] } },
    decorators: [(Story) => <div className="w-[348px]">{Story()}</div>],
} satisfies Meta<typeof AnnotationBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Switch `variant` to the re-anchor prompt, which names the note being moved. */
export const Default: Story = {};
