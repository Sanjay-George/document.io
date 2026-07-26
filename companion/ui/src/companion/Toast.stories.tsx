import type { Meta, StoryObj } from '@storybook/react-vite';
import Toast from '@/companion/Toast';

const meta = {
    title: 'Companion/Components/Toast',
    component: Toast,
    parameters: { layout: 'fullscreen' },
    args: { text: 'Note saved', tone: 'ok' },
    argTypes: { tone: { control: 'inline-radio', options: ['ok', 'warn'] } },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `ok` auto-dismisses; switch `tone` to `warn` for the persistent treatment. */
export const Default: Story = {};
