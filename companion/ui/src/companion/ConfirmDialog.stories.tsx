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

export const DeleteNote: Story = {};

/**
 * Reused for a non-destructive confirmation: re-anchoring an off-page note onto
 * the current page moves it there, so we confirm the page change first
 * (custom title + confirm label, longer two-clause message).
 */
export const ReanchorMove: Story = {
    args: {
        title: 'Move note to this page?',
        message: 'This note was made on /guide/install. Re-anchoring here will move it to /guide/config.',
        confirmLabel: 'Move it here',
    },
};
