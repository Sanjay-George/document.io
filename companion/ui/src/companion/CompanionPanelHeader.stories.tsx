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

function Harness({ initialMode = 'view' as Mode }: { initialMode?: Mode }) {
    const [mode, setMode] = useState<Mode>(initialMode);
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

/** Read mode shows the scope tabs; the dock + minimize controls sit top-right. */
export const Reading: Story = { render: () => <Harness /> };

/** Annotate mode hides the scope tabs. */
export const Annotate: Story = { render: () => <Harness initialMode="edit" /> };

/** Without `onOrientationChange` the dock toggle is hidden. */
export const NoOrientationToggle: Story = {};
