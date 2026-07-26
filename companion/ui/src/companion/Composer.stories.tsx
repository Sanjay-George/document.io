import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Composer from '@/companion/Composer';
import { Draft } from '@/companion/types';

const meta = {
    title: 'Companion/Components/Composer',
    component: Composer,
    parameters: { layout: 'fullscreen' },
    args: {
        mode: 'new',
        draft: { type: 'component', selector: '', url: '', title: '', body: '' },
        onChange: () => {},
        onSave: () => {},
        onClose: () => {},
    },
} satisfies Meta<typeof Composer>;

export default meta;
type Story = StoryObj<typeof meta>;

function ComposerHarness({ mode, initial }: { mode: 'new' | 'edit'; initial: Draft }) {
    const [draft, setDraft] = useState<Draft>(initial);
    return (
        <Composer
            mode={mode}
            draft={draft}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            onSave={() => {}}
            onClose={() => {}}
        />
    );
}

export const NewComponentNote: Story = {
    render: () => (
        <ComposerHarness
            mode="new"
            initial={{ type: 'component', selector: '#build-4210 button.promote', url: 'halyard.app/deployments', title: '', body: '' }}
        />
    ),
};

export const EditNote: Story = {
    render: () => (
        <ComposerHarness
            mode="edit"
            initial={{
                type: 'component',
                selector: '#build-4210 button.promote',
                url: 'halyard.app/deployments',
                title: 'Promote the build',
                body: 'Click **Promote** to open the target picker.',
            }}
        />
    ),
};

export const WholePageNote: Story = {
    render: () => (
        <ComposerHarness
            mode="new"
            initial={{ type: 'page', selector: '', url: 'halyard.app/deployments', title: '', body: '' }}
        />
    ),
};
