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
    ExternalLinkIcon,
    TargetIcon,
} from '@/companion/icons';

type Props = {
    note: Note;
    /** Hide editing actions (Edit / Re-anchor / Delete / reorder) — exported files. */
    readOnly?: boolean;
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
 * A note in the docked list (README §5). Collapses/expands on click and renders
 * a broken/stale state. Off-page notes stay expandable and editable, gaining a
 * "Go to page" action in place of the reorder controls.
 */
export default function AnnotationCard({
    note,
    readOnly = false,
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
    const expanded = selected;
    const collapsed = !selected;

    const numVariant = broken ? 'broken' : otherPage ? 'other' : selected ? 'selected' : 'idle';

    const container = broken
        ? `border border-dashed border-dio-broken-border bg-dio-broken-bg${selected ? ' shadow-dio-card' : ''}`
        : otherPage
            ? `border border-dio-border-field bg-dio-subtle-2${selected ? ' shadow-dio-card' : ''}`
            : selected
                ? 'border border-dio-border-field bg-white shadow-dio-card'
                : 'border border-transparent bg-transparent';

    const stop = (fn?: () => void) => (e: MouseEvent) => {
        e.stopPropagation();
        fn?.();
    };

    const moveBtn =
        'flex h-[26px] w-[26px] items-center justify-center rounded-dio-tab border-none bg-transparent text-dio-tertiary hover:bg-dio-subtle disabled:cursor-not-allowed disabled:opacity-30';

    const goToPage = otherPage && onOpen && (
        <TextButton
            label="Go to page"
            onClick={stop(onOpen)}
            icon={<ExternalLinkIcon size={13} />}
            className="text-dio-tertiary hover:text-dio-primary"
        />
    );

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer rounded-dio-card p-3 transition-[background-color,border-color] duration-150 ${container}`}
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

            {collapsed && goToPage && <div className="ml-9 mt-2">{goToPage}</div>}

            {expanded && (
                <div className="ml-9 mt-[11px]">
                    <NoteBody note={note} showContext={!broken} />

                    {broken && (
                        <div className="mt-[11px] flex items-start gap-2">
                            <AlertTriangleIcon size={14} className="mt-px flex-none text-dio-danger-2" />
                            <div className="min-w-0 flex-1">
                                <div className="text-[12.5px] leading-[1.4] text-dio-danger">
                                    This element isn&apos;t on the page anymore.
                                </div>
                                {note.selector && (
                                    <code className="mt-1.5 block truncate rounded-dio-tab bg-dio-danger-bg px-1.5 py-1 font-dio-mono text-[11.5px] text-dio-danger-2">
                                        {note.selector}
                                    </code>
                                )}
                            </div>
                        </div>
                    )}

                    {!readOnly && (broken ? (
                        <div className="mt-[14px] flex gap-[14px]">
                            <TextButton
                                label="Re-anchor"
                                onClick={stop(onReanchor)}
                                icon={<TargetIcon size={13} />}
                                className="text-dio-danger-2"
                            />
                            <TextButton label="Dismiss" onClick={stop(onDelete)} className="text-[#B79A93] hover:text-dio-danger" />
                        </div>
                    ) : (
                        <div className="mt-[14px] flex items-center gap-[14px]">
                            <TextButton
                                label="Edit"
                                onClick={stop(onEdit)}
                                icon={<EditIcon size={13} />}
                                className="text-dio-tertiary hover:text-dio-primary"
                            />
                            <TextButton
                                label="Re-anchor"
                                onClick={stop(onReanchor)}
                                icon={<TargetIcon size={13} />}
                                className="text-dio-tertiary hover:text-dio-primary"
                            />
                            <TextButton label="Delete" onClick={stop(onDelete)} className="text-[#B79A93] hover:text-dio-danger" />
                            {otherPage ? (
                                onOpen && (
                                    <button
                                        type="button"
                                        title="Go to page"
                                        onClick={stop(onOpen)}
                                        className={`ml-auto ${moveBtn}`}
                                    >
                                        <ExternalLinkIcon size={15} />
                                    </button>
                                )
                            ) : (
                                (onMoveUp || onMoveDown) && (
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
                                )
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
