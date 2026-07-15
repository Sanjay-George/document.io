import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import PageScopeEditor from '@/companion/PageScopeEditor';

const REPORT_URL = '/en/commonality/report/commonality/59bb70f8d5d71c7b8768b5257d8f60b8';

const meta = {
    title: 'Companion/Components/PageScopeEditor',
    component: PageScopeEditor,
    args: { url: REPORT_URL, onChange: () => {} },
    decorators: [(Story) => <div className="w-[380px] bg-white p-4 font-dio-ui">{Story()}</div>],
} satisfies Meta<typeof PageScopeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive harness — click a segment to toggle it to a wildcard. */
function Harness({ url, initial }: { url: string; initial?: string }) {
    const [value, setValue] = useState<string | undefined>(initial);
    return (
        <>
            <PageScopeEditor url={url} value={value} onChange={setValue} />
            <div className="mt-3 font-dio-mono text-[11px] text-dio-muted">
                urlPattern: {value === undefined ? '(exact match)' : value}
            </div>
        </>
    );
}

/** Default: no wildcards yet — the note matches its exact page. */
export const Exact: Story = {
    render: () => <Harness url={REPORT_URL} />,
};

/** The volatile document id wildcarded, so the note covers the report for any id. */
export const IdWildcarded: Story = {
    render: () => <Harness url={REPORT_URL} initial="/en/commonality/report/commonality/*" />,
};

/** Multiple wildcards — e.g. any locale, any document id. */
export const MultipleWildcards: Story = {
    render: () => <Harness url={REPORT_URL} initial="/*/commonality/report/commonality/*" />,
};
