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
import { pageMatches, safeUrl, toRelativeUrl } from '@/companion/helpers';
import { exportCurrentPage } from '@/export/serializePage';

/** True inside an exported HTML file: data is inlined, all editing is hidden. */
const READ_ONLY = typeof window !== 'undefined' && !!window.__DOCIO_EXPORT__;

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
/** How long to keep watching the DOM after each burst of activity (load/scroll). */
const WATCH_WINDOW = 4000;

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
    // A picked target awaiting confirmation because applying it would move the
    // note to a different page (see handlePickTarget).
    const [pendingReanchor, setPendingReanchor] = useState<{ id: string; target: PickedTarget } | null>(null);
    const [composer, setComposer] = useState<ComposerState>(null);
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);
    const [toast, setToast] = useState<{ text: string; tone: Tone } | null>(null);
    const [highlightResizeHandle, setHighlightResizeHandle] = useState(false);
    // Bumped to re-evaluate live-DOM on/off-page + broken flags.
    const [tick, setTick] = useState(0);
    const bump = () => setTick((t) => t + 1);
    // Bumped on host-router navigation; re-arms the live-DOM watcher below.
    const [navTick, setNavTick] = useState(0);

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
        const flagsFor = (a: Annotation): NoteFlags => {
            // In an export the payload is already scoped to this page and anchors are
            // baked to a unique attribute, so skip page matching and just resolve.
            if (READ_ONLY) {
                try {
                    return { onPage: true, broken: resolveAnchoredElement(a.target, a.anchor) === null };
                } catch {
                    return { onPage: true, broken: true };
                }
            }
            // A note belongs to the page(s) it was captured on. By default that's
            // the exact path; an optional `urlPattern` with `*` wildcards lets one
            // note cover a family of pages (e.g. the same report across document
            // ids) without blindly matching any page that shares a selector.
            if (!pageMatches(here, a.url, a.urlPattern)) return { onPage: false, broken: false };
            try {
                const found = resolveAnchoredElement(a.target, a.anchor) !== null;
                return { onPage: true, broken: !found };
            } catch {
                return { onPage: true, broken: true };
            }
        };
        return toNotes(annotations, flagsFor);
        // eslint-disable-next-line
    }, [annotations, tick]);

    // Signature of the fields the live-DOM watcher depends on (which annotations
    // exist and where each is anchored/scoped). Keying the watcher effect on this
    // — rather than just the count — re-arms it after a re-anchor or urlPattern
    // edit that changes anchoring without changing how many notes there are.
    const watchKey = useMemo(
        () => annotations.map((a) => `${a.id}|${a.target}|${a.url}|${a.urlPattern ?? ''}`).join('~'),
        [annotations],
    );

    const onPageHealthy = useMemo(() => notes.filter((n) => n.onPage !== false && !n.broken), [notes]);
    const displayed = useMemo(() => {
        if (tab === 'all') return notes;
        const broken = notes.filter((n) => n.onPage !== false && n.broken);
        return [...onPageHealthy, ...broken];
    }, [notes, tab, onPageHealthy]);

    // ---- Live-DOM re-evaluation (ported from AnnotationListView) ----
    // Re-run the flag computation as host-page elements appear/disappear and on
    // SPA navigation, so "This page" scope and broken pins stay accurate.
    //
    // Anchored content arrives three ways: (1) hydration shortly after load,
    // (2) elements lazy-mounted on scroll (e.g. notes near the bottom of a long
    // GitHub page), and (3) a host-router route swap, which renders *after* the
    // URL changes. A short-lived MutationObserver catches the first; re-arming it
    // on scroll and on navigation — while any on-page note is still unresolved —
    // catches the others, without keeping a subtree observer running forever.
    useEffect(() => {
        if (!annotations.length) return;
        bump(); // quick first pass for static pages

        const hasUnresolvedOnPage = () => {
            const here = toRelativeUrl(window.location.href);
            return annotations.some((a) => {
                if (!pageMatches(here, a.url, a.urlPattern)) return false;
                try {
                    return resolveAnchoredElement(a.target, a.anchor) === null;
                } catch {
                    return false; // unresolvable selector — never watch for it
                }
            });
        };

        let debounceTimer: ReturnType<typeof setTimeout>;
        let idleTimer: ReturnType<typeof setTimeout>;
        let observing = false;

        const stop = () => {
            observer.disconnect();
            observing = false;
            clearTimeout(debounceTimer);
            clearTimeout(idleTimer);
        };

        // Observe for a bounded window, extended by fresh DOM activity or scroll;
        // give up once everything on-page resolves or the page goes quiet.
        const arm = () => {
            if (!observing) {
                observer.observe(document.body, { childList: true, subtree: true });
                observing = true;
            }
            clearTimeout(idleTimer);
            idleTimer = setTimeout(stop, WATCH_WINDOW);
        };

        const observer = new MutationObserver(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                bump();
                if (hasUnresolvedOnPage()) arm();
                else stop();
            }, 150);
        });

        // Lazy content mounts as the user scrolls into it — re-arm to catch it.
        let scrollRaf = 0;
        const onScroll = () => {
            if (scrollRaf) return;
            scrollRaf = requestAnimationFrame(() => {
                scrollRaf = 0;
                if (hasUnresolvedOnPage()) arm();
            });
        };

        if (hasUnresolvedOnPage()) arm();
        window.addEventListener('scroll', onScroll, true);

        return () => {
            stop();
            window.removeEventListener('scroll', onScroll, true);
            if (scrollRaf) cancelAnimationFrame(scrollRaf);
        };
        // eslint-disable-next-line
    }, [watchKey, navTick]);

    // ---- SPA navigation ----
    // The host swaps pages via the History API without a reload, so re-evaluate
    // on-page scope whenever the URL changes. Patching history here (in the
    // page's main world, where this bundle runs) intercepts the host router's own
    // pushState — a content-script patch cannot, as it lives in an isolated world.
    //
    // The router updates the URL *before* it renders the new route, so this only
    // signals that a navigation happened: the watcher effect above re-runs (via
    // `navTick`) and observes the DOM until the new page's anchors show up.
    // Compare the full href, not just the pathname — plenty of hosts route on the
    // query string or hash alone.
    useEffect(() => {
        let lastUrl = window.location.href;
        const onNav = () => {
            if (window.location.href === lastUrl) return;
            lastUrl = window.location.href;
            setNavTick((n) => n + 1);
        };
        const origPush = window.history.pushState;
        const origReplace = window.history.replaceState;
        window.history.pushState = function (...args) {
            origPush.apply(this, args);
            onNav();
        };
        window.history.replaceState = function (...args) {
            origReplace.apply(this, args);
            onNav();
        };
        window.addEventListener('popstate', onNav);
        return () => {
            window.history.pushState = origPush;
            window.history.replaceState = origReplace;
            window.removeEventListener('popstate', onNav);
        };
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
            setPendingReanchor(null);
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
    //
    // The step is taken against the *rendered* list — the scope tab hides off-page
    // notes and sinks broken ones — so the note lands next to the neighbour the
    // user actually sees, not next to one filtered out of view.
    const moveNote = async (id: string, dir: 'up' | 'down') => {
        if (!documentationId) return;
        const shown = displayed.findIndex((n) => n.id === id);
        const neighbour = displayed[dir === 'up' ? shown - 1 : shown + 1];
        if (shown < 0 || !neighbour) return;

        const ordered = [...notes];
        const i = ordered.findIndex((n) => n.id === id);
        if (i < 0) return;
        const [moved] = ordered.splice(i, 1);
        const j = ordered.findIndex((n) => n.id === neighbour.id);
        if (j < 0) return;
        ordered.splice(dir === 'up' ? j : j + 1, 0, moved);

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
        setPendingReanchor(null);
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
                urlPattern: input.urlPattern,
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
                urlPattern: input.urlPattern,
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

    const applyReanchor = async (id: string, target: PickedTarget) => {
        if (!documentationId) return;
        const existing = annotations.find((a) => a.id === id);
        if (existing) {
            await updateAnnotation(id, {
                ...existing,
                target: target.selector,
                anchor: target.anchor,
                url: target.url,
                type: target.type,
                updated: new Date(),
            });
            await mutate(ALL_ANNOTATIONS_KEY(documentationId));
            await mutate(SINGLE_ANNOTATION_KEY(id));
        }
        setPendingReanchor(null);
        setSelectedId(id);
        setReanchorId(null);
        setMode('view');
        showToast('Note re-anchored', 'ok');
    };

    // ---- Element pick (Annotate-mode click / re-anchor completion) ----
    const handlePickTarget = async (target: PickedTarget) => {
        if (reanchorId) {
            const existing = annotations.find((a) => a.id === reanchorId);
            // Re-anchoring onto a different page re-homes the note there — a
            // silent, easy-to-make mistake for off-page notes. Confirm first;
            // a same-page re-anchor (e.g. fixing a broken pin) applies directly.
            if (existing && toRelativeUrl(existing.url) !== toRelativeUrl(target.url)) {
                setPendingReanchor({ id: reanchorId, target });
                return;
            }
            await applyReanchor(reanchorId, target);
            return;
        }
        setComposer({
            editingId: null,
            draft: { type: target.type, selector: target.selector, anchor: target.anchor, url: target.url, title: '', body: '' },
        });
    };

    // ---- Export the active page as a self-contained, read-only HTML file ----
    const handleExport = async () => {
        showToast('Preparing export…', 'warn');
        const result = await exportCurrentPage(
            { id: documentationId ?? undefined, title: documentation?.title },
            annotations,
        );
        if (result.ok) {
            showToast(`Exported ${result.notes} note${result.notes === 1 ? '' : 's'}`, 'ok');
        } else {
            showToast(`Export failed: ${result.error}`, 'warn');
        }
    };

    // ---- Resizable dock handle highlight (from App.tsx) ----
    const handlePanelResize = (size: number) => setHighlightResizeHandle(size < 10);
    const debouncedHandlePanelResize = useRef(debounce(handlePanelResize, 100)).current;

    const reanchorTitle = reanchorId ? notes.find((n) => n.id === reanchorId)?.title : undefined;
    const firstNoteId = displayed[0]?.id ?? null;
    const lastNoteId = displayed[displayed.length - 1]?.id ?? null;
    const isVertical = orientation === PanelOrientation.VERTICAL;
    const handleHighlight = highlightResizeHandle ? 'pulsing-animation' : '';

    if (!documentationId) return null;

    const panel = (
        <CompanionPanel
            fill
            readOnly={READ_ONLY}
            onExport={READ_ONLY || !documentation?.exportEnabled ? undefined : handleExport}
            title={title}
            mode={READ_ONLY ? 'view' : mode}
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
                mode={READ_ONLY ? 'view' : mode}
                readOnly={READ_ONLY}
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
                    key={composer.editingId ?? 'new'}
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

            {pendingReanchor && (
                <ConfirmDialog
                    title="Move note to this page?"
                    message={`This note was made on ${toRelativeUrl(annotations.find((a) => a.id === pendingReanchor.id)?.url ?? '')}. Re-anchoring here will move it to ${toRelativeUrl(pendingReanchor.target.url)}.`}
                    confirmLabel="Move it here"
                    onConfirm={() => applyReanchor(pendingReanchor.id, pendingReanchor.target)}
                    onCancel={() => setPendingReanchor(null)}
                />
            )}

            {toast && <Toast text={toast.text} tone={toast.tone} />}
        </>
    );
}
