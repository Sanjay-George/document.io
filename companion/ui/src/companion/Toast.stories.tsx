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

export const Success: Story = { args: { text: 'Note saved', tone: 'ok' } };
export const Warn: Story = { args: { text: '1 note couldn’t be placed on this page', tone: 'warn' } };
