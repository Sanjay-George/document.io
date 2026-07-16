import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mode, Note, Placement } from '@/companion/types';
import Badge from '@/companion/Badge';
import HighlightRing from '@/companion/HighlightRing';
import Popover from '@/companion/Popover';
import { buildAnchor, resolveAnchoredElement } from '@/utils/anchor';
import { isHighlightable } from '@/utils/annotations';
import { HOVERED_ELEMENT_CLASS, MODAL_ROOT_ID } from '@/utils/constants';
import type { PickedTarget } from '@/companion/CompanionContainer';

/** Sits just below the docked panel's z-index but above host-page content. */
const Z_OVERLAY = 2147483000;

type Props = {
    /** On-page, resolvable notes to pin (host resolves rects live). */
    notes: Note[];
    selectedId: string | null;
    mode: Mode;
    /** A re-anchor pick is in progress — the next element click completes it. */
    reanchoring: boolean;
    onSelectNote: (id: string) => void;
    onCloseSelected: () => void;
    onEditNote: (id: string) => void;
    onReanchorNote: (id: string) => void;
    onDeleteNote: (id: string) => void;
    onPickTarget: (target: PickedTarget) => void;
};

type RectInfo = { top: number; left: number; width: number; height: number; radius: string };

/** Measure a note's anchor against the live DOM in viewport (fixed) coordinates. */
function measure(note: Note): RectInfo | null {
    const el = resolveAnchoredElement(note.selector, note.anchor);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null;
    const radius = window.getComputedStyle(el).borderRadius || '8px';
    return { top: r.top, left: r.left, width: r.width, height: r.height, radius };
}

/** Place the popover next to the target, flipping above when there's no room below. */
function computePopover(rect: RectInfo): { left: number; top: number; placement: Placement } {
    const W = 308;
    const margin = 12;
    const estH = 200;
    const left = Math.max(margin, Math.min(rect.left, window.innerWidth - W - margin));
    const belowTop = rect.top + rect.height + 8;
    const roomBelow = window.innerHeight - belowTop;
    if (roomBelow >= estH || rect.top < estH) {
        return { left, top: belowTop, placement: 'below' };
    }
    return { left, top: rect.top - 8, placement: 'above' };
}

/**
 * On-page overlay layer (companion README §4/§6): numbered Badge pins + inset
 * HighlightRings tracked over live DOM elements, the in-context Popover for the
 * selected note, and Annotate-mode click-to-pick (also completes re-anchoring).
 *
 * Anchoring is the host's responsibility — this owns positioning; the container
 * owns note state and persistence.
 */
export default function HostOverlay({
    notes,
    selectedId,
    mode,
    reanchoring,
    onSelectNote,
    onCloseSelected,
    onEditNote,
    onReanchorNote,
    onDeleteNote,
    onPickTarget,
}: Props) {
    const [rects, setRects] = useState<Map<string, RectInfo | null>>(new Map());

    const recompute = useCallback(() => {
        const next = new Map<string, RectInfo | null>();
        for (const n of notes) next.set(n.id, measure(n));
        setRects(next);
    }, [notes]);

    // Keep pins glued to their elements across scroll, resize, and DOM changes.
    useEffect(() => {
        let raf = 0;
        const schedule = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                recompute();
            });
        };
        window.addEventListener('scroll', schedule, true);
        window.addEventListener('resize', schedule);
        const observer = new MutationObserver(schedule);
        observer.observe(document.body, { childList: true, subtree: true });
        recompute();
        return () => {
            window.removeEventListener('scroll', schedule, true);
            window.removeEventListener('resize', schedule);
            observer.disconnect();
            if (raf) cancelAnimationFrame(raf);
        };
    }, [recompute]);

    // Bring the selected element into view (as the old detail/edit views did).
    useEffect(() => {
        if (mode !== 'view' || !selectedId) return;
        const note = notes.find((n) => n.id === selectedId);
        if (!note) return;
        resolveAnchoredElement(note.selector, note.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [selectedId, mode, notes]);

    // Annotate mode: hover-highlight pickable elements + click to pick a target.
    // The same click completes an in-progress re-anchor. Ported from App.tsx.
    useEffect(() => {
        if (mode !== 'edit') return;

        const isOwn = (el: HTMLElement | null) => !el || !!el.closest(`#${MODAL_ROOT_ID}`);

        const onOver = (e: MouseEvent) => {
            if (!(e.target instanceof HTMLElement)) return;
            const el = e.target;
            if (isOwn(el) || !isHighlightable(el)) return;
            el.classList.add(HOVERED_ELEMENT_CLASS);
        };
        const onOut = (e: MouseEvent) => {
            (e.target as HTMLElement).classList.remove(HOVERED_ELEMENT_CLASS);
        };
        const onClick = (e: MouseEvent) => {
            const el = e.target as HTMLElement;
            if (isOwn(el) || !isHighlightable(el)) return;
            e.preventDefault();
            e.stopPropagation();
            el.classList.remove(HOVERED_ELEMENT_CLASS);
            // Store the origin-independent path (no query string)
            const relativeUrl = window.location.pathname + window.location.hash;
            // Capture selector + identity signals so the note re-resolves robustly.
            const anchor = buildAnchor(el);
            onPickTarget({ selector: anchor.selector, anchor, url: relativeUrl, type: 'component' });
        };

        document.addEventListener('mouseover', onOver, { passive: true });
        document.addEventListener('mouseout', onOut, { passive: true });
        document.addEventListener('click', onClick, true);
        return () => {
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onOut);
            document.removeEventListener('click', onClick, true);
            document
                .querySelectorAll(`.${HOVERED_ELEMENT_CLASS}`)
                .forEach((el) => el.classList.remove(HOVERED_ELEMENT_CLASS));
        };
    }, [mode, reanchoring, onPickTarget]);

    const selectedNote = useMemo(
        () => (selectedId ? notes.find((n) => n.id === selectedId) ?? null : null),
        [selectedId, notes],
    );
    const selectedRect = selectedId ? rects.get(selectedId) ?? null : null;
    const popover = selectedRect ? computePopover(selectedRect) : null;

    return (
        <>
            {notes.map((note) => {
                const rect = rects.get(note.id);
                if (!rect) return null;
                const selected = note.id === selectedId;
                return (
                    <div
                        key={note.id}
                        style={{
                            position: 'fixed',
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                            zIndex: Z_OVERLAY,
                            pointerEvents: 'none',
                        }}
                    >
                        <HighlightRing selected={selected} radius={rect.radius} />
                        <Badge
                            number={note.n}
                            state={selected ? 'selected' : 'idle'}
                            onClick={() => onSelectNote(note.id)}
                            style={{
                                top: -11,
                                left: -11,
                                // In Annotate mode let clicks fall through to pick the element.
                                pointerEvents: mode === 'edit' ? 'none' : 'auto',
                            }}
                        />
                    </div>
                );
            })}

            {mode === 'view' && selectedNote && popover && (
                <Popover
                    note={selectedNote}
                    placement={popover.placement}
                    style={{ left: popover.left, top: popover.top, zIndex: Z_OVERLAY + 1 }}
                    onClose={onCloseSelected}
                    onEdit={() => onEditNote(selectedNote.id)}
                    onReanchor={() => onReanchorNote(selectedNote.id)}
                    onDelete={() => onDeleteNote(selectedNote.id)}
                />
            )}
        </>
    );
}
