import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import PageScopeEditor from '@/companion/PageScopeEditor';

const REPORT_URL = '/en/commonality/report/59bb70f8d5d71c7b8768b5257d8f60b8?qs=1&sort=4';

/** Holds the pattern so the chips are live — the row itself renders the result. */
function Harness({ url }: { url: string }) {
    const [value, setValue] = useState<string | undefined>(undefined);
    return <PageScopeEditor url={url} value={value} onChange={setValue} />;
}

/**
 * Click-to-wildcard page scope. Each path chip cycles exact → `∗` (any value, one
 * segment) → `∗∗` (any number of levels); query params are separate chips, ignored
 * until clicked. Swap the `url` control to see how the row adapts.
 */
const meta = {
    title: 'Companion/Components/PageScopeEditor',
    component: PageScopeEditor,
    args: { url: REPORT_URL, onChange: () => {} },
    argTypes: {
        url: {
            control: 'text',
            description: 'Captured page URL — path plus any host query params.',
        },
    },
    render: ({ url }) => <Harness key={url} url={url} />,
    decorators: [(Story) => <div className="w-[380px] bg-white p-4 font-dio-ui">{Story()}</div>],
} satisfies Meta<typeof PageScopeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A deep path with query params, starting as an exact match. Click the volatile
 * document id once to cover the report for any id; click a middle segment twice
 * to match any number of levels there; click a param chip to require it.
 */
export const Default: Story = {};
