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

/** The worst case for height: a deep path with three query params to chip, plus a
 *  fully fingerprinted element — every scope control at its tallest at once. */
const CROWDED: Draft = {
    type: 'component',
    selector: '#analysis-toolbar > div.flex.gap-2 > button#start-analysis',
    anchor: {
        selector: '#analysis-toolbar > div.flex.gap-2 > button#start-analysis',
        tag: 'button',
        id: 'start-analysis',
        role: 'button',
        ariaLabel: 'Start Analysis',
        text: '📈 Start Analysis',
        attributes: { 'data-testid': 'analysis-btn' },
        context: [{ tag: 'section', id: 'analysis-toolbar', role: 'region', ariaLabel: 'Product Analysis' }],
    },
    url: '/en/commonality/report/commonality/59bb70f8d5d71c7b8768b5257d8f60b8?tab=repositories&qs=1&sort=4',
    urlPattern: '/en/commonality/report/commonality/*?tab=repositories',
    title: 'Commonality Matrix',
    body: 'For each product selected, it shows the commonality rate with each other.',
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

/**
 * Height stress test: a deep path with query params *and* a full element
 * fingerprint, so both scope editors are at their tallest.
 */
export const Crowded: Story = {
    render: () => <Harness mode="edit" initial={CROWDED} />,
};
