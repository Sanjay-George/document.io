import type { Meta, StoryObj } from '@storybook/react-vite';
import ConfirmDialog from '@/companion/ConfirmDialog';

const noop = () => {};

const meta = {
    title: 'Companion/Components/ConfirmDialog',
    component: ConfirmDialog,
    parameters: { layout: 'fullscreen' },
    args: {
        title: 'Delete note',
        message: '“Promote the build” will be permanently deleted.',
        onConfirm: noop,
        onCancel: noop,
    },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Also carries non-destructive confirmations — re-anchoring an off-page note
 * moves it, so `title`/`message`/`confirmLabel` are all overridable.
 */
export const Default: Story = {};
