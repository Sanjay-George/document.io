import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import CompanionPanel from '@/companion/CompanionPanel';
import { Mode, Note, Tab } from '@/companion/types';
import { PanelOrientation } from '@/models/panelOrientation';
import { noteSetTitle, sampleNotes } from '@/companion/fixtures';

const noop = () => {};

const meta = {
    title: 'Companion/Components/CompanionPanel',
    component: CompanionPanel,
    parameters: { layout: 'fullscreen' },
    args: {
        title: noteSetTitle,
        mode: 'view',
        onModeChange: noop,
        tab: 'page',
        onTabChange: noop,
        onMinimize: noop,
        countAll: sampleNotes.length,
        notes: [],
        selectedId: null,
        onSelect: noop,
        onEdit: noop,
        onDelete: noop,
        onReanchor: noop,
    },
    // Stage that works for both docks: right-aligned when vertical, bottom when horizontal.
    decorators: [(Story) => <div className="flex h-screen flex-col items-end justify-end bg-[#F5F6FB]">{Story()}</div>],
} satisfies Meta<typeof CompanionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const onPage = (notes: Note[], tab: Tab) =>
    tab === 'all' ? notes : notes.filter((n) => n.onPage !== false);

/** Live panel — mode, scope tab, selection and dock all drive real state. */
function Harness({
    notes = sampleNotes,
    initialOrientation = PanelOrientation.VERTICAL,
    readOnly = false,
}: {
    notes?: Note[];
    initialOrientation?: PanelOrientation;
    readOnly?: boolean;
}) {
    const [mode, setMode] = useState<Mode>('view');
    const [tab, setTab] = useState<Tab>('page');
    const [selectedId, setSelectedId] = useState<string | null>('a4');
    const [orientation, setOrientation] = useState<PanelOrientation>(initialOrientation);
    return (
        <CompanionPanel
            title={noteSetTitle}
            mode={mode}
            onModeChange={setMode}
            tab={tab}
            onTabChange={setTab}
            onMinimize={noop}
            countAll={notes.length}
            notes={onPage(notes, tab)}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
            onEdit={noop}
            onDelete={noop}
            onReanchor={noop}
            onOpen={noop}
            onMoveUp={noop}
            onMoveDown={noop}
            firstNoteId={notes[0]?.id}
            lastNoteId={notes[notes.length - 1]?.id}
            readOnly={readOnly}
            onExport={readOnly ? undefined : noop}
            orientation={orientation}
            onOrientationChange={setOrientation}
        />
    );
}

/** Toggle Read/Annotate and the scope tabs in the header to reach those states. */
export const Default: Story = { render: () => <Harness /> };

/** Docked to the bottom, full width — cards flow into a responsive grid. */
export const HorizontalDock: Story = {
    render: () => <Harness initialOrientation={PanelOrientation.HORIZONTAL} />,
};

/** Read-only export view — no mode toggle, tabs, or per-note editing actions. */
export const ReadOnly: Story = { render: () => <Harness readOnly /> };
