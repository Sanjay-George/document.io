import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ScopeSection from '@/companion/ScopeSection';
import { Draft } from '@/companion/types';

const ELEMENT_NOTE: Draft = {
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
    body: '',
};

const PAGE_NOTE: Draft = {
    type: 'page',
    selector: '',
    url: '/en/commonality/report/commonality/59bb70f8d5d71c7b8768b5257d8f60b8',
    title: 'Read me first',
    body: '',
};

/** Live draft, so the digest updates as the chips inside are clicked. */
function Harness({ initial, initialOpen }: { initial: Draft; initialOpen?: boolean }) {
    const [draft, setDraft] = useState<Draft>(initial);
    return (
        <ScopeSection
            draft={draft}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            initialOpen={initialOpen}
        />
    );
}

/**
 * The composer's scope section: one banner that doubles as the disclosure —
 * *what* the note is on, then *where* it applies — expanding into both editors.
 * Collapsed by default, since together the editors are taller than the rest of
 * the composer and both are already correct for most notes. Every value carries
 * its key; a widened page glob renders semibold, and the anchor preset appears
 * only once it is moved off `Smart` — named by what it does, not by its label.
 */
const meta = {
    title: 'Companion/Components/ScopeSection',
    component: ScopeSection,
    args: { draft: ELEMENT_NOTE, onChange: () => {}, initialOpen: false },
    argTypes: {
        initialOpen: { control: 'boolean', description: 'Start with both editors revealed.' },
    },
    render: ({ draft, initialOpen }) => (
        <Harness key={String(initialOpen)} initial={draft as Draft} initialOpen={initialOpen} />
    ),
    decorators: [(Story) => <div className="w-[400px] bg-white p-4 font-dio-ui">{Story()}</div>],
} satisfies Meta<typeof ScopeSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An element note with a wildcarded path and a required param — the tallest case. */
export const Default: Story = {};

/**
 * A whole-page note. There is no element to re-find, so the anchor editor drops
 * out entirely and the digest is the page glob alone.
 */
export const PageNote: Story = { args: { draft: PAGE_NOTE } };
