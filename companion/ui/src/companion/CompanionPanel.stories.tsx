import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import CompanionPanel from '@/companion/CompanionPanel';
import { Mode, Note, Tab } from '@/companion/types';
import { PanelOrientation } from '@/models/panelOrientation';
import { toNotes } from '@/companion/adapter';
import { noteSetTitle, sampleAnnotations, sampleNotes } from '@/companion/fixtures';

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

function Harness({
    initialMode = 'view' as Mode,
    notes = sampleNotes,
    initialOrientation = PanelOrientation.VERTICAL,
    readOnly = false,
}: {
    initialMode?: Mode;
    notes?: Note[];
    initialOrientation?: PanelOrientation;
    readOnly?: boolean;
}) {
    const [mode, setMode] = useState<Mode>(initialMode);
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

export const Reading: Story = {
    render: () => <Harness />,
};

export const Annotate: Story = {
    render: () => <Harness initialMode="edit" />,
};

/** Docked to the bottom, full width — cards flow into a responsive grid. */
export const HorizontalDock: Story = {
    render: () => <Harness initialOrientation={PanelOrientation.HORIZONTAL} />,
};

export const Empty: Story = {
    render: () => <Harness notes={[]} />,
};

/** Read-only export view — no mode toggle, tabs, or per-note editing actions. */
export const ReadOnly: Story = {
    render: () => <Harness readOnly />,
};

/**
 * Renders one card per persisted `Annotation` via the `toNotes` adapter — the
 * real path a container replacing `AnnotationListView` would take.
 */
export const FromAnnotations: Story = {
    render: () => <Harness notes={toNotes(sampleAnnotations, () => ({ onPage: true }))} />,
};
