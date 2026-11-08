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

/** Live draft — typing updates the preview and the save button's enabled state. */
function Harness({ mode, initial }: { mode: 'new' | 'edit'; initial: Draft }) {
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

/** Writing a new note against a freshly picked element. */
export const Default: Story = {
    render: () => (
        <Harness
            mode="new"
            initial={{
                type: 'component',
                selector: '#build-4210 button.promote',
                url: 'halyard.app/deployments',
                title: '',
                body: '',
            }}
        />
    ),
};

/**
 * Editing an existing note anchored to a deeply-nested element. The enormous
 * CSS-module selector is the point: the banner shows the smart single-row label
 * (tag + visible text), never the raw chain.
 */
export const Edit: Story = {
    render: () => (
        <Harness
            mode="edit"
            initial={{
                type: 'component',
                selector:
                    'div.Primer_Brand__Grid-module__Grid__column___Hips.lp-CustomerStories-gridColumn:nth-of-type(2) > a.Primer_Brand__Button-module__Button___lDruK > span.Primer_Brand__Text-module__Text___pecHN',
                anchor: {
                    selector:
                        'div.Primer_Brand__Grid-module__Grid__column___Hips.lp-CustomerStories-gridColumn:nth-of-type(2) > a.Primer_Brand__Button-module__Button___lDruK > span.Primer_Brand__Text-module__Text___pecHN',
                    tag: 'span',
                    text: 'Read the customer story',
                },
                url: '/en/commonality/report/commonality/abcdef123456',
                urlPattern: '/en/commonality/report/commonality/*',
                title: 'Commonality Matrix',
                body: 'For each product selected, it shows the commonality rate with each other.',
            }}
        />
    ),
};
