import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import CompanionPanelHeader from '@/companion/CompanionPanelHeader';
import { Mode, Tab } from '@/companion/types';
import { PanelOrientation } from '@/models/panelOrientation';
import { noteSetTitle, sampleNotes } from '@/companion/fixtures';

const noop = () => {};

const meta = {
    title: 'Companion/Components/CompanionPanelHeader',
    component: CompanionPanelHeader,
    parameters: { layout: 'padded' },
    args: {
        title: noteSetTitle,
        mode: 'view',
        onModeChange: noop,
        onMinimize: noop,
        tab: 'page',
        onTabChange: noop,
        countAll: sampleNotes.length,
    },
    decorators: [(Story) => <div className="w-[376px] bg-white">{Story()}</div>],
} satisfies Meta<typeof CompanionPanelHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness() {
    const [mode, setMode] = useState<Mode>('view');
    const [tab, setTab] = useState<Tab>('page');
    const [orientation, setOrientation] = useState<PanelOrientation>(PanelOrientation.VERTICAL);
    return (
        <CompanionPanelHeader
            title={noteSetTitle}
            mode={mode}
            onModeChange={setMode}
            onMinimize={noop}
            tab={tab}
            onTabChange={setTab}
            countAll={sampleNotes.length}
            orientation={orientation}
            onOrientationChange={setOrientation}
        />
    );
}

/** Read mode shows the scope tabs; switching to Annotate hides them. */
export const Default: Story = { render: () => <Harness /> };

/** Read-only export view — mode toggle and scope tabs are hidden. */
export const ReadOnly: Story = {
    args: { readOnly: true, orientation: PanelOrientation.VERTICAL, onOrientationChange: noop },
};
