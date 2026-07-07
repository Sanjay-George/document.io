import { MouseEvent } from 'react';
import { Note } from '@/companion/types';
import { snippet } from '@/companion/markdown';
import NumberCircle from '@/companion/NumberCircle';
import NoteBody from '@/companion/NoteBody';
import TextButton from '@/companion/TextButton';
import {
    AlertTriangleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    EditIcon,
    LinkIcon,
} from '@/companion/icons';

type Props = {
    note: Note;
    selected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onReanchor: () => void;
    /** Navigate to the note's page (off-page notes only). */
    onOpen?: () => void;
    /** Reorder controls — shown on the expanded card when provided. */
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
};

/**
 * A note in the docked list (README §5). Renders one of four states: collapsed,
 * expanded (selected), broken/stale, or off-page ("not on this page").
 */
export default function AnnotationCard({
    note,
    selected,
    onSelect,
    onEdit,
    onDelete,
    onReanchor,
    onOpen,
    onMoveUp,
    onMoveDown,
    canMoveUp = false,
    canMoveDown = false,
}: Props) {
    const broken = !!note.broken;
    const otherPage = !broken && note.onPage === false;
    const expanded = selected && !broken && !otherPage;
    const collapsed = !selected && !broken && !otherPage;

    const numVariant = broken ? 'broken' : otherPage ? 'other' : selected ? 'selected' : 'idle';

    const container = broken
        ? 'border border-dashed border-dio-broken-border bg-dio-broken-bg'
        : otherPage
            ? 'border border-dio-border-field bg-dio-subtle-2'
            : selected
                ? 'border border-dio-border-field bg-white shadow-dio-card'
                : 'border border-transparent bg-transparent';

    const stop = (fn?: () => void) => (e: MouseEvent) => {
        e.stopPropagation();
        fn?.();
    };

    const moveBtn =
        'flex h-[26px] w-[26px] items-center justify-center rounded-dio-tab border-none bg-transparent text-dio-tertiary hover:bg-dio-subtle disabled:cursor-not-allowed disabled:opacity-30';

    return (
        <div
            onClick={otherPage ? undefined : onSelect}
            className={`rounded-dio-card p-3 transition-[background-color,border-color] duration-150 ${
                otherPage ? '' : 'cursor-pointer'
            } ${container}`}
        >
            <div className="flex items-center gap-3">
                <NumberCircle number={note.n} variant={numVariant} />
                <span className="flex-1 text-[14px] font-semibold leading-[1.3] text-dio-primary">{note.title}</span>
                {collapsed && <ChevronRightIcon size={16} className="flex-none text-dio-chevron" />}
            </div>

            {collapsed && (
                <div className="ml-9 mt-1.5 line-clamp-1 text-[12.5px] leading-[1.45] text-dio-muted">
                    {snippet(note.body)}
                </div>
            )}

            {expanded && (
                <div className="ml-9 mt-[11px]">
                    <NoteBody note={note} />
                    <div className="mt-[14px] flex items-center gap-[14px]">
                        <TextButton
                            label="Edit"
                            onClick={stop(onEdit)}
                            icon={<EditIcon size={13} />}
                            className="text-dio-tertiary hover:text-dio-primary"
                        />
                        <TextButton label="Delete" onClick={stop(onDelete)} className="text-[#B79A93] hover:text-dio-danger" />
                        {(onMoveUp || onMoveDown) && (
                            <div className="ml-auto flex items-center gap-0.5">
                                <button
                                    type="button"
                                    title="Move up"
                                    disabled={!canMoveUp}
                                    onClick={stop(onMoveUp)}
                                    className={moveBtn}
                                >
                                    <ChevronUpIcon size={15} />
                                </button>
                                <button
                                    type="button"
                                    title="Move down"
                                    disabled={!canMoveDown}
                                    onClick={stop(onMoveDown)}
                                    className={moveBtn}
                                >
                                    <ChevronDownIcon size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {otherPage && (
                <div className="ml-9 mt-2">
                    <div className="inline-flex items-center gap-1.5 rounded-dio-tab bg-white px-2 py-1 text-[11.5px] font-medium text-dio-tertiary">
                        <LinkIcon size={12} className="flex-none" />
                        Not on this page
                    </div>
                    <div className="mt-2 line-clamp-1 text-[12.5px] leading-[1.45] text-dio-muted">
                        {snippet(note.body)}
                    </div>
                    {onOpen && (
                        <div className="mt-2">
                            <TextButton
                                label="Open page"
                                onClick={stop(onOpen)}
                                className="!text-[12px] text-dio-tertiary hover:text-dio-primary"
                            />
                        </div>
                    )}
                </div>
            )}

            {broken && (
                <div className="ml-9 mt-[9px] flex items-start gap-2">
                    <AlertTriangleIcon size={14} className="mt-px flex-none text-dio-danger-2" />
                    <div className="flex-1">
                        <div className="text-[12.5px] leading-[1.4] text-dio-danger">
                            This element isn&apos;t on the page anymore.
                        </div>
                        <div className="mt-2 flex gap-[14px]">
                            <TextButton label="Re-anchor" onClick={stop(onReanchor)} className="!text-[12px] text-dio-danger-2" />
                            <TextButton label="Dismiss" onClick={stop(onDelete)} className="!text-[12px] text-[#B79A93]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
