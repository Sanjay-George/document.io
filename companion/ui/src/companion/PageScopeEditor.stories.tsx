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

function Harness() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
        <>
            <PageScopeEditor url={REPORT_URL} value={value} onChange={setValue} />
            <div className="mt-3 font-dio-mono text-[11px] text-dio-muted">
                urlPattern: {value === undefined ? '(exact match)' : value}
            </div>
        </>
    );
}

/**
 * Starts as an exact match. Click a segment to wildcard it — e.g. the volatile
 * document id, so the note covers the report for any id — and the resulting
 * pattern is echoed below.
 */
export const Default: Story = { render: () => <Harness /> };
