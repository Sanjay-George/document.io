import { CSSProperties, forwardRef } from 'react';
import { Note, Placement } from '@/companion/types';
import NumberCircle from '@/companion/NumberCircle';
import NoteBody from '@/companion/NoteBody';
import TextButton from '@/companion/TextButton';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, EditIcon, TargetIcon } from '@/companion/icons';

type Props = {
    note: Note;
    /** Hide editing actions (Edit / Re-anchor / Delete) — used by exported files. */
    readOnly?: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    /** Start re-anchoring this note to a different element. */
    onReanchor: () => void;
    /** Select the previous / next on-page note; null disables at the list ends. */
    onPrev?: (() => void) | null;
    onNext?: (() => void) | null;
    /** Which side of the target the popover sits on; flips its anchor origin. */
    placement?: Placement;
    /** Fixed-position offsets supplied by the host integration. */
    style?: CSSProperties;
};

/**
 * In-context popover shown next to the selected element in Read mode (README §6).
 * Positioning (x/y/placement) is owned by the host; this renders the card.
 */
const Popover = forwardRef<HTMLDivElement, Props>(function Popover(
    { note, readOnly = false, onClose, onEdit, onDelete, onReanchor, onPrev, onNext, placement = 'below', style },
    ref,
) {
    const navBtn =
        'flex h-[26px] w-[22px] flex-none items-center justify-center rounded-dio-tab border-none bg-transparent ' +
        'text-dio-faint enabled:cursor-pointer enabled:hover:bg-dio-subtle disabled:opacity-30';
    return (
        <div
            ref={ref}
            className="fixed z-[55] w-[308px]"
            // Positioned by its top edge; origin only steers the pop-in animation.
            style={{ ...style, transformOrigin: placement === 'above' ? 'bottom left' : 'top left' }}
        >
            <div className="animate-dio-pop overflow-hidden rounded-dio-container border border-dio-border-panel bg-white font-dio-ui shadow-dio-popover">
                <div className="flex items-center gap-[11px] px-[15px] pb-[11px] pt-[14px]">
                    <NumberCircle number={note.n} variant="selected" />
                    <span className="flex-1 text-[14px] font-semibold leading-[1.3] text-dio-primary">{note.title}</span>
                    <button
                        type="button"
                        onClick={() => onPrev?.()}
                        disabled={!onPrev}
                        aria-label="Previous note"
                        className={navBtn}
                    >
                        <ChevronLeftIcon size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onNext?.()}
                        disabled={!onNext}
                        aria-label="Next note"
                        className={navBtn}
                    >
                        <ChevronRightIcon size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-[26px] w-[26px] flex-none cursor-pointer items-center justify-center rounded-dio-tab border-none bg-transparent text-dio-faint hover:bg-dio-subtle"
                    >
                        <CloseIcon size={15} />
                    </button>
                </div>
                <div className="max-h-[320px] overflow-y-auto px-[15px] pb-[14px]">
                    <NoteBody note={note} />
                    {!readOnly && (
                        <div className="mt-[14px] flex gap-[14px] border-t border-dio-border-divider pt-3">
                            <TextButton
                                label="Edit"
                                onClick={onEdit}
                                icon={<EditIcon size={13} />}
                                className="text-dio-tertiary hover:text-dio-primary"
                            />
                            <TextButton
                                label="Re-anchor"
                                onClick={onReanchor}
                                icon={<TargetIcon size={13} />}
                                className="text-dio-tertiary hover:text-dio-primary"
                            />
                            <TextButton label="Delete" onClick={onDelete} className="text-dio-danger-muted hover:text-dio-danger" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default Popover;
