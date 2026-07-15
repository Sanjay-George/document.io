import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { mutate } from 'swr';
import { Draft, Mode, Note, NoteType, Tab, Tone } from '@/companion/types';
import { PanelOrientation } from '@/models/panelOrientation';
import { Annotation } from '@/models/annotations';
import { useDocumentation } from '@/data_access/documentations';
import {
    ALL_ANNOTATIONS_KEY,
    SINGLE_ANNOTATION_KEY,
    addAnnotation,
    deleteAnnotation,
    updateAnnotation,
    updateAnnotations,
    useAnnotations,
} from '@/data_access/annotations';
import { NoteFlags, draftFromAnnotation, draftToAnnotationInput, toNotes } from '@/companion/adapter';
import CompanionPanel from '@/companion/CompanionPanel';
import MinimizedPill from '@/companion/MinimizedPill';
import Composer from '@/companion/Composer';
import Toast from '@/companion/Toast';
import ConfirmDialog from '@/companion/ConfirmDialog';
import HostOverlay from '@/companion/HostOverlay';
import { debounce } from '@/utils';
import { AnchorMeta, resolveAnchoredElement } from '@/utils/anchor';
import { safeUrl, toRelativeUrl } from '@/companion/helpers';

/** A freshly picked anchor target, captured from a click on the host page. */
export type PickedTarget = {
    selector: string;
    anchor: AnchorMeta;
    url: string;
    type: NoteType;
};

type ComposerState = { editingId: string | null; draft: Draft } | null;

const TOAST_TIMEOUT = 2600;
const MAX_Z = 2147483647;

/**
 * Data-connected root of the companion. Replaces the legacy routed App + views:
 * derives the panel's notes from persisted annotations (SWR + adapter), owns
 * mode/scope/minimize/selection/composer/re-anchor/toast state, and drives CRUD
 * through `data_access/annotations`. The docked panel stays drag-resizable via
 * `react-resizable-panels`; on-page pins/rings/popover live in `HostOverlay`.
 */
export default function CompanionContainer() {
    const [documentationId, setDocumentationId] = useState<string | null>(null);

    // Persisted UI state (same localStorage keys as the legacy App).
    const [orientation, setOrientation] = useState<PanelOrientation>(PanelOrientation.VERTICAL);
    const [minimized, setMinimized] = useState(() => localStorage.getItem('isMinimized') === 'true');
    const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('editMode') === 'true' ? 'edit' : 'view'));

    // In-memory UI state.
    const [tab, setTab] = useState<Tab>('page');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reanchorId, setReanchorId] = useState<string | null>(null);
    const [composer, setComposer] = useState<ComposerState>(null);
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);
    const [toast, setToast] = useState<{ text: string; tone: Tone } | null>(null);
    const [highlightResizeHandle, setHighlightResizeHandle] = useState(false);
    // Bumped to re-evaluate live-DOM on/off-page + broken flags.
    const [tick, setTick] = useState(0);
    const bump = () => setTick((t) => t + 1);

    const showToast = (text: string, tone: Tone) => setToast({ text, tone });

    // ---- Bootstrap: documentation id + persisted orientation (from App.tsx) ----
    useEffect(() => {
        const rootElement = document.getElementById('document-io-root');
        const id = rootElement?.getAttribute('data-documentation-id') ?? null;
        setDocumentationId(id);
        setOrientation(
            (localStorage.getItem('panelOrientation') as PanelOrientation) || PanelOrientation.VERTICAL,
        );

        if (import.meta.env.VITE_APP_ENV === 'development') {
            setDocumentationId(import.meta.env.VITE_TEST_DOCUMENTATION_ID);
        }
        return () => setDocumentationId(null);
    }, []);

    // ---- Persist UI state ----
    useEffect(() => {
        localStorage.setItem('panelOrientation', orientation);
    }, [orientation]);
    useEffect(() => {
        localStorage.setItem('isMinimized', String(minimized));
    }, [minimized]);
    useEffect(() => {
        localStorage.setItem('editMode', String(mode === 'edit'));
    }, [mode]);

    // ---- Data ----
    const { data: documentation } = useDocumentation(documentationId ?? '');
    const { data: annotationsData } = useAnnotations(documentationId ?? '');
    const annotations: Annotation[] = annotationsData ?? [];

    const title = documentation?.title || 'Notes';

    // ---- Notes derived from annotations + live-DOM flags ----
    const notes: Note[] = useMemo(() => {
        // Match on the origin-independent path so notes stay attached when a
        // documentation moves between domains (localhost → dev-server, etc.).
        const here = toRelativeUrl(window.location.href);
        const resolves = (a: Annotation): boolean => {
            try {
                if (a.type === 'page') {
                    return toRelativeUrl(a.url) === here && resolveAnchoredElement(a.target, a.anchor) !== null;
                }
                return resolveAnchoredElement(a.target, a.anchor) !== null;
            } catch {
                return false;
            }
        };
        const flagsFor = (a: Annotation): NoteFlags => {
            if (resolves(a)) return { onPage: true, broken: false };
            if (toRelativeUrl(a.url) === here) return { onPage: true, broken: true };
            return { onPage: false, broken: false };
        };
        return toNotes(annotations, flagsFor);
        // eslint-disable-next-line
    }, [annotations, tick]);

    const onPageHealthy = useMemo(() => notes.filter((n) => n.onPage !== false && !n.broken), [notes]);
    const displayed = useMemo(() => {
        if (tab === 'all') return notes;
        const broken = notes.filter((n) => n.onPage !== false && n.broken);
        return [...onPageHealthy, ...broken];
    }, [notes, tab, onPageHealthy]);

    // ---- Live-DOM re-evaluation (ported from AnnotationListView) ----
    // Re-run the flag computation as host-page elements appear/disappear and on
    // SPA navigation, so "This page" scope and broken pins stay accurate.
    useEffect(() => {
        if (!annotations.length) return;
        bump(); // quick first pass for static pages

        const allResolved = () =>
            annotations.every((a) => {
                try {
                    return resolveAnchoredElement(a.target, a.anchor) !== null;
                } catch {
                    return true; // invalid selector — stop watching
                }
            });
        if (allResolved()) return;

        let debounceTimer: ReturnType<typeof setTimeout>;
        const observer = new MutationObserver(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                bump();
                if (allResolved()) observer.disconnect();
            }, 150);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        const safety = setTimeout(() => observer.disconnect(), 5000);
        return () => {
            observer.disconnect();
            clearTimeout(debounceTimer);
            clearTimeout(safety);
        };
        // eslint-disable-next-line
    }, [annotations.length]);

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.data?.type !== 'DOCIO_NAVIGATION_UPDATED') return;
            bump();
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // ---- Toast: success auto-dismisses; warn persists until state changes ----
    useEffect(() => {
        if (!toast || toast.tone === 'warn') return;
        const t = setTimeout(() => setToast(null), TOAST_TIMEOUT);
        return () => clearTimeout(t);
    }, [toast]);

    // ---- Mode / selection ----
    const changeMode = (next: Mode) => {
        setMode(next);
        setComposer(null);
        if (next === 'view' && reanchorId) {
            setReanchorId(null);
            setToast(null);
        }
    };
    const selectNote = (id: string) => setSelectedId((cur) => (cur === id ? null : id));

    // ---- CRUD ----
    const editNote = (id: string) => {
        const annotation = annotations.find((a) => a.id === id);
        if (!annotation) return;
        // Dismiss the in-context popover / expanded card so only the edit modal shows.
        setSelectedId(null);
        setComposer({ editingId: id, draft: draftFromAnnotation(annotation) });
    };

    // Ask before destroying a note — the actual delete runs on confirm.
    const deleteNote = (id: string) => setPendingDelete(id);

    const performDelete = async (id: string) => {
        setPendingDelete(null);
        if (!documentationId) return;
        await deleteAnnotation(id);
        await mutate(ALL_ANNOTATIONS_KEY(documentationId));
        if (selectedId === id) setSelectedId(null);
        setComposer(null);
        showToast('Note deleted', 'ok');
    };

    // Navigate to an off-page note's page.
    const openNote = (id: string) => {
        const note = notes.find((n) => n.id === id);
        if (!note?.url) return;
        // Only follow safe http(s) targets — never javascript:/data: URLs that
        // could ride in on stored note data.
        const target = safeUrl(note.url, { protocols: ['http:', 'https:'] });
        if (target) window.location.assign(target);
    };

    // Reorder a note in the global step order (persisted via the `index` field).
    // Reindexes the whole set so any legacy null/duplicate indices are normalised.
    const moveNote = async (id: string, dir: 'up' | 'down') => {
        if (!documentationId) return;
        const ordered = [...notes];
        const i = ordered.findIndex((n) => n.id === id);
        const j = dir === 'up' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= ordered.length) return;
        const [moved] = ordered.splice(i, 1);
        ordered.splice(j, 0, moved);

        const byId = new Map(annotations.map((a) => [a.id, a]));
        const reindexed = ordered
            .map((n, idx) => {
                const a = byId.get(n.id);
                return a ? { ...a, index: idx } : null;
            })
            .filter((a): a is Annotation => a !== null);

        await updateAnnotations(reindexed);
        await mutate(ALL_ANNOTATIONS_KEY(documentationId));
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

    const saveComposer = async () => {
        if (!composer || !documentationId) return;
        const { editingId, draft } = composer;
        const input = draftToAnnotationInput(draft);
        const noteTitle = input.title?.trim() || undefined;

        if (editingId) {
            const existing = annotations.find((a) => a.id === editingId);
            if (!existing) return;
            await updateAnnotation(editingId, {
                ...existing,
                title: noteTitle,
                value: input.value,
                type: input.type,
                updated: new Date(),
            });
            await mutate(ALL_ANNOTATIONS_KEY(documentationId));
            await mutate(SINGLE_ANNOTATION_KEY(editingId));
            setSelectedId(editingId);
            showToast('Note updated', 'ok');
        } else {
            const maxIndex = annotations.reduce((max, a) => (a.index > max ? a.index : max), -1);
            await addAnnotation({
                documentationId,
                title: noteTitle,
                value: input.value,
                target: input.target,
                anchor: input.anchor,
                url: input.url,
                type: input.type,
                created: new Date(),
                updated: new Date(),
                index: maxIndex + 1,
            });
            await mutate(ALL_ANNOTATIONS_KEY(documentationId));
            showToast('Note saved', 'ok');
        }
        setComposer(null);
        setMode('view');
    };

    // ---- Element pick (Annotate-mode click / re-anchor completion) ----
    const handlePickTarget = async (target: PickedTarget) => {
        if (reanchorId) {
            if (!documentationId) return;
            const existing = annotations.find((a) => a.id === reanchorId);
            if (existing) {
                await updateAnnotation(reanchorId, {
                    ...existing,
                    target: target.selector,
                    anchor: target.anchor,
                    url: target.url,
                    type: target.type,
                    updated: new Date(),
                });
                await mutate(ALL_ANNOTATIONS_KEY(documentationId));
                await mutate(SINGLE_ANNOTATION_KEY(reanchorId));
            }
            setSelectedId(reanchorId);
            setReanchorId(null);
            setMode('view');
            showToast('Note re-anchored', 'ok');
            return;
        }
        setComposer({
            editingId: null,
            draft: { type: target.type, selector: target.selector, anchor: target.anchor, url: target.url, title: '', body: '' },
        });
    };

    // ---- Resizable dock handle highlight (from App.tsx) ----
    const handlePanelResize = (size: number) => setHighlightResizeHandle(size < 10);
    const debouncedHandlePanelResize = useRef(debounce(handlePanelResize, 100)).current;

    const reanchorTitle = reanchorId ? notes.find((n) => n.id === reanchorId)?.title : undefined;
    const firstNoteId = notes[0]?.id ?? null;
    const lastNoteId = notes[notes.length - 1]?.id ?? null;
    const isVertical = orientation === PanelOrientation.VERTICAL;
    const handleHighlight = highlightResizeHandle ? 'pulsing-animation' : '';

    if (!documentationId) return null;

    const panel = (
        <CompanionPanel
            fill
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
            onOpen={openNote}
            onMoveUp={(id) => moveNote(id, 'up')}
            onMoveDown={(id) => moveNote(id, 'down')}
            firstNoteId={firstNoteId}
            lastNoteId={lastNoteId}
            reanchoring={!!reanchorId}
            reanchorTitle={reanchorTitle}
            onCancelReanchor={cancelReanchor}
            orientation={orientation}
            onOrientationChange={setOrientation}
        />
    );

    return (
        <>
            <div
                data-color-mode="light"
                data-light-theme="light"
                style={{ display: minimized ? 'none' : 'block' }}
            >
                <PanelGroup
                    autoSaveId="document-io-panel"
                    // Panel direction is how panels split, so a vertical dock (right)
                    // means a horizontal split. (Same inversion as the legacy App.)
                    direction={isVertical ? 'horizontal' : 'vertical'}
                    className={
                        isVertical
                            ? 'fixed group top-0 left-0 pointer-events-none active:pointer-events-auto'
                            : 'fixed group bottom-0 left-0 pointer-events-none active:pointer-events-auto'
                    }
                    style={
                        isVertical
                            ? { minHeight: '100%', width: '100vw', zIndex: MAX_Z }
                            : { minWidth: '100%', height: '100vh', zIndex: MAX_Z }
                    }
                >
                    <Panel className="bg-transparent pointer-events-none" />

                    <PanelResizeHandle
                        className={
                            (isVertical ? 'w-0.5 h-full' : 'h-0.5 w-full') +
                            ' bg-slate-300 hover:bg-slate-400 group-hover:bg-slate-400 ' +
                            `transition-background duration-150 pointer-events-auto ${handleHighlight}`
                        }
                    />

                    <Panel
                        className="pointer-events-auto"
                        defaultSize={isVertical ? 25 : 60}
                        onResize={debouncedHandlePanelResize}
                    >
                        {panel}
                    </Panel>
                </PanelGroup>
            </div>

            {minimized && (
                <MinimizedPill
                    mode={mode}
                    onModeChange={setMode}
                    onRestore={() => setMinimized(false)}
                />
            )}

            <HostOverlay
                notes={onPageHealthy}
                selectedId={selectedId}
                mode={mode}
                reanchoring={!!reanchorId}
                onSelectNote={selectNote}
                onCloseSelected={() => setSelectedId(null)}
                onEditNote={editNote}
                onReanchorNote={startReanchor}
                onDeleteNote={deleteNote}
                onPickTarget={handlePickTarget}
            />

            {composer && (
                <Composer
                    mode={composer.editingId ? 'edit' : 'new'}
                    draft={composer.draft}
                    onChange={(patch) =>
                        setComposer((c) => (c ? { ...c, draft: { ...c.draft, ...patch } } : c))
                    }
                    onSave={saveComposer}
                    onClose={() => setComposer(null)}
                />
            )}

            {pendingDelete && (
                <ConfirmDialog
                    message={`“${notes.find((n) => n.id === pendingDelete)?.title ?? 'This note'}” will be permanently deleted.`}
                    onConfirm={() => performDelete(pendingDelete)}
                    onCancel={() => setPendingDelete(null)}
                />
            )}

            {toast && <Toast text={toast.text} tone={toast.tone} />}
        </>
    );
}
