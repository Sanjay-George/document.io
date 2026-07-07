import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Draft, Mode, Note, NoteType, Tab, Tone } from '@/companion/types';
import { PanelOrientation } from '@/models/panelOrientation';
import CompanionPanel from '@/companion/CompanionPanel';
import MinimizedPill from '@/companion/MinimizedPill';
import Composer from '@/companion/Composer';
import Toast from '@/companion/Toast';

/** A freshly picked anchor target, captured from a click on the host page. */
export type PickedTarget = {
    selector: string;
    url: string;
    type: NoteType;
};

/** Imperative seam the host uses to feed element picks into the companion. */
export type CompanionHandle = {
    /**
     * Call when the user clicks an element on the page while in Annotate mode.
     * Opens the composer for a new note, or completes an in-progress re-anchor.
     */
    pickTarget: (target: PickedTarget) => void;
};

type Props = {
    /** Title of the note-set shown in the panel header. */
    title?: string;
    initialNotes?: Note[];
    /** Initial dock orientation. Defaults to vertical (dock right). */
    initialOrientation?: PanelOrientation;
};

type ComposerState = { editingId: string | null; draft: Draft } | null;

const TOAST_TIMEOUT = 2600;

/**
 * Stateful orchestrator that ties the companion together: mode/scope/minimize
 * state, note CRUD, the composer, toasts, and the re-anchor flow. Live-DOM
 * anchoring (badges, rings, popover positioning) is the host's responsibility —
 * it drives creation and re-anchoring through the `pickTarget` handle.
 */
const Companion = forwardRef<CompanionHandle, Props>(function Companion(
    { title = 'Notes', initialNotes = [], initialOrientation = PanelOrientation.VERTICAL },
    ref,
) {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [mode, setMode] = useState<Mode>('view');
    const [tab, setTab] = useState<Tab>('page');
    const [minimized, setMinimized] = useState(false);
    const [orientation, setOrientation] = useState<PanelOrientation>(initialOrientation);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reanchorId, setReanchorId] = useState<string | null>(null);
    const [composer, setComposer] = useState<ComposerState>(null);
    const [toast, setToast] = useState<{ text: string; tone: Tone } | null>(null);

    const showToast = (text: string, tone: Tone) => setToast({ text, tone });

    // Success toasts auto-dismiss; warn toasts persist until state changes.
    useEffect(() => {
        if (!toast || toast.tone === 'warn') return;
        const t = setTimeout(() => setToast(null), TOAST_TIMEOUT);
        return () => clearTimeout(t);
    }, [toast]);

    const onPageHealthy = useMemo(() => notes.filter((a) => a.onPage !== false && !a.broken), [notes]);
    const displayed = useMemo(() => {
        if (tab === 'all') return notes;
        const broken = notes.filter((a) => a.onPage !== false && a.broken);
        return [...onPageHealthy, ...broken];
    }, [notes, tab, onPageHealthy]);

    const changeMode = (next: Mode) => {
        setMode(next);
        setComposer(null);
        if (next === 'view' && reanchorId) {
            setReanchorId(null);
            setToast(null);
        }
    };

    const selectNote = (id: string) => setSelectedId((cur) => (cur === id ? null : id));

    const editNote = (id: string) => {
        const note = notes.find((a) => a.id === id);
        if (!note) return;
        setComposer({
            editingId: id,
            draft: { type: note.type, selector: note.selector, url: note.url, title: note.title, body: note.body },
        });
    };

    const deleteNote = (id: string) => {
        setNotes((prev) => prev.filter((a) => a.id !== id));
        if (selectedId === id) setSelectedId(null);
        setComposer(null);
        showToast('Note deleted', 'ok');
    };

    const startReanchor = (id: string) => {
        setReanchorId(id);
        setMode('edit');
        setSelectedId(null);
        setComposer(null);
        showToast('Pick the element this note should point to', 'warn');
    };

    const cancelReanchor = () => {
        setReanchorId(null);
        setMode('view');
        setToast(null);
    };

    const saveComposer = () => {
        if (!composer) return;
        const { editingId, draft } = composer;
        const noteTitle = draft.title || 'Untitled note';

        if (editingId) {
            setNotes((prev) =>
                prev.map((a) =>
                    a.id === editingId ? { ...a, type: draft.type, title: noteTitle, body: draft.body } : a,
                ),
            );
            setSelectedId(editingId);
            showToast('Note updated', 'ok');
        } else {
            const nextN = notes.reduce((m, a) => Math.max(m, a.n), 0) + 1;
            const note: Note = {
                id: `n${Date.now()}`,
                n: nextN,
                type: draft.type,
                selector: draft.selector,
                url: draft.url,
                title: noteTitle,
                body: draft.body,
                onPage: true,
            };
            setNotes((prev) => [...prev, note]);
            setSelectedId(note.id);
            showToast('Note saved', 'ok');
        }
        setComposer(null);
        setMode('view');
    };

    useImperativeHandle(ref, () => ({
        pickTarget: (target: PickedTarget) => {
            if (reanchorId) {
                setNotes((prev) =>
                    prev.map((a) =>
                        a.id === reanchorId
                            ? { ...a, ...target, broken: false, onPage: true }
                            : a,
                    ),
                );
                setSelectedId(reanchorId);
                setReanchorId(null);
                setMode('view');
                showToast('Note re-anchored', 'ok');
                return;
            }
            setComposer({
                editingId: null,
                draft: { type: target.type, selector: target.selector, url: target.url, title: '', body: '' },
            });
        },
    }));

    const reanchorTitle = reanchorId ? notes.find((a) => a.id === reanchorId)?.title : undefined;

    return (
        <>
            {minimized ? (
                <MinimizedPill
                    count={onPageHealthy.length}
                    mode={mode}
                    onModeChange={setMode}
                    onRestore={() => setMinimized(false)}
                />
            ) : (
                <CompanionPanel
                    title={title}
                    mode={mode}
                    onModeChange={changeMode}
                    tab={tab}
                    onTabChange={setTab}
                    onMinimize={() => setMinimized(true)}
                    countAll={notes.length}
                    notes={displayed}
                    selectedId={selectedId}
                    onSelect={selectNote}
                    onEdit={editNote}
                    onDelete={deleteNote}
                    onReanchor={startReanchor}
                    reanchoring={!!reanchorId}
                    reanchorTitle={reanchorTitle}
                    onCancelReanchor={cancelReanchor}
                    orientation={orientation}
                    onOrientationChange={setOrientation}
                />
            )}

            {composer && (
                <Composer
                    mode={composer.editingId ? 'edit' : 'new'}
                    draft={composer.draft}
                    onChange={(patch) => setComposer((c) => (c ? { ...c, draft: { ...c.draft, ...patch } } : c))}
                    onSave={saveComposer}
                    onClose={() => setComposer(null)}
                />
            )}

            {toast && <Toast text={toast.text} tone={toast.tone} />}
        </>
    );
});

export default Companion;
