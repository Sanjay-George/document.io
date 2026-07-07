import { CSSProperties } from 'react';
import { Note, Placement } from '@/companion/types';
import NumberCircle from '@/companion/NumberCircle';
import NoteBody from '@/companion/NoteBody';
import TextButton from '@/companion/TextButton';
import { CloseIcon, EditIcon } from '@/companion/icons';

type Props = {
    note: Note;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    /** Which side of the target the popover sits on; flips its anchor origin. */
    placement?: Placement;
    /** Fixed-position offsets supplied by the host integration. */
    style?: CSSProperties;
};

/**
 * In-context popover shown next to the selected element in Read mode (README §6).
 * Positioning (x/y/placement) is owned by the host; this renders the card.
 */
export default function Popover({ note, onClose, onEdit, onDelete, placement = 'below', style }: Props) {
    return (
        <div
            className="fixed z-[55] w-[308px]"
            style={{ ...style, transform: placement === 'above' ? 'translateY(-100%)' : undefined }}
        >
            <div className="animate-dio-pop overflow-hidden rounded-dio-container border border-dio-border-panel bg-white font-dio-ui shadow-dio-popover">
                <div className="flex items-center gap-[11px] px-[15px] pb-[11px] pt-[14px]">
                    <NumberCircle number={note.n} variant="selected" />
                    <span className="flex-1 text-[14px] font-semibold leading-[1.3] text-dio-primary">{note.title}</span>
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
                    <div className="mt-[14px] flex gap-[14px] border-t border-dio-border-divider pt-3">
                        <TextButton
                            label="Edit"
                            onClick={onEdit}
                            icon={<EditIcon size={13} />}
                            className="text-dio-tertiary hover:text-dio-primary"
                        />
                        <TextButton label="Delete" onClick={onDelete} className="text-[#B79A93] hover:text-dio-danger" />
                    </div>
                </div>
            </div>
        </div>
    );
}
