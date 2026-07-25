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

/**
 * Anchor to a deeply-nested element whose CSS-module selector is enormous. The
 * banner shows the smart, single-row label (tag + visible text), never the raw
 * selector chain.
 */
export const LongSelectorAnchor: Story = {
    render: () => (
        <ComposerHarness
            mode="edit"
            initial={{
                type: 'component',
                selector:
                    'div.Primer_Brand__Grid-module__Grid__column___Hips.lp-CustomerStories-gridColumn:nth-of-type(2) > a.Primer_Brand__Button-module__Button___lDruK > span.Primer_Brand__Button-module__Button__text___Z3ocU > span.Primer_Brand__Text-module__Text___pecHN',
                anchor: {
                    selector:
                        'div.Primer_Brand__Grid-module__Grid__column___Hips.lp-CustomerStories-gridColumn:nth-of-type(2) > a.Primer_Brand__Button-module__Button___lDruK > span.Primer_Brand__Button-module__Button__text___Z3ocU > span.Primer_Brand__Text-module__Text___pecHN',
                    tag: 'span',
                    text: 'Read the customer story',
                },
                url: '/',
                title: '',
                body: '',
            }}
        />
    ),
};

/** Scope generalised with a wildcard so the note covers a page across ids. */
export const WildcardPageScope: Story = {
    render: () => (
        <ComposerHarness
            mode="edit"
            initial={{
                type: 'component',
                selector: 'div.col-md-6:nth-of-type(2) > div.card',
                url: '/en/test-page/abcdef123456',
                urlPattern: '/en/commonality/report/commonality/*',
                title: 'Commonality Matrix',
                body: 'For each product selected, it shows the commonality rate with each other.',
            }}
        />
    ),
};
