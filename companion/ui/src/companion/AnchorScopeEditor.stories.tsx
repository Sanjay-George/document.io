import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import AnchorScopeEditor from '@/companion/AnchorScopeEditor';
import { AnchorMeta, AnchorScope } from '@/utils/anchor';

/** The docs' running example: a button with a full identity to loosen. */
const START_ANALYSIS: AnchorMeta = {
    selector: '#start-analysis',
    tag: 'button',
    id: 'start-analysis',
    role: 'button',
    ariaLabel: 'Start Analysis',
    text: '📈 Start Analysis',
    attributes: { 'data-testid': 'analysis-btn' },
    context: [{ tag: 'section', id: 'analysis-toolbar', role: 'region', ariaLabel: 'Product Analysis' }],
};

/** A grid header cell: no id, no test id — text and position are all there is. */
const HEADER_CELL: AnchorMeta = {
    selector: 'div.ag-header-cell:nth-of-type(1)',
    tag: 'th',
    text: 'Commonality',
};

/** Holds the scope so the chips are live — the row itself renders the result. */
function Harness({ anchor }: { anchor: AnchorMeta }) {
    const [value, setValue] = useState<AnchorScope | undefined>(undefined);
    return <AnchorScopeEditor anchor={anchor} value={value} onChange={setValue} />;
}

/**
 * Click-to-loosen anchor scope. The three presets set every chip at once —
 * `Exact` requires the whole fingerprint, `Smart` requires only the strongest
 * signal, `Loose` requires none — and each chip then cycles required → hint →
 * ignored, which reads back as `Custom`. The line underneath restates the mix and
 * ends in the trade-off it buys.
 */
const meta = {
    title: 'Companion/Components/AnchorScopeEditor',
    component: AnchorScopeEditor,
    args: { anchor: START_ANALYSIS, onChange: () => {} },
    argTypes: {
        anchor: {
            control: 'object',
            description: 'Fingerprint captured when the element was picked.',
        },
    },
    render: ({ anchor }) => <Harness key={JSON.stringify(anchor)} anchor={anchor} />,
    decorators: [(Story) => <div className="w-[380px] bg-white p-4 font-dio-ui">{Story()}</div>],
} satisfies Meta<typeof AnchorScopeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A richly identified button. `Smart` leans on the id alone, so the note follows
 * the button when it moves; `Exact` pins the label and the toolbar too.
 */
export const Default: Story = {};

/**
 * The brittle case the docs warn about — a `nth-of-type` selector with only text
 * behind it. With so few chips, the distance between `Exact` and `Loose` is one
 * signal, and `Loose` openly admits it may land on a lookalike column.
 */
export const ThinFingerprint: Story = { args: { anchor: HEADER_CELL } };
