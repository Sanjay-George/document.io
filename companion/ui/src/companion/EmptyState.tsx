import { PlusCircleIcon } from '@/companion/icons';

type Props = {
    /** Omit in read-only export view to hide the call-to-action. */
    onAddNote?: () => void;
};

/**
 * Empty companion body (README §10) — shown when there are no notes.
 */
export default function EmptyState({ onAddNote }: Props) {
    return (
        <div className="animate-dio-fade px-[22px] pb-5 pt-11 text-center">
            <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-dio-container bg-dio-subtle-2">
                <PlusCircleIcon size={24} strokeWidth={1.8} className="text-[#C4A99B]" />
            </div>
            <div className="mt-4 text-[15.5px] font-semibold text-dio-primary">Nothing here yet</div>
            {onAddNote && (
                <>
                    <div className="mx-auto mt-[7px] max-w-[250px] text-[13px] leading-[1.5] text-dio-muted">
                        Leave your first note and it stays pinned to the page — even after the design changes.
                    </div>
                    <button
                        type="button"
                        onClick={onAddNote}
                        className="mt-[18px] inline-flex h-10 cursor-pointer items-center gap-2 rounded-dio-button border-none bg-dio-ink px-5 text-[13.5px] font-semibold text-white hover:bg-black"
                    >
                        Add a note
                    </button>
                </>
            )}
        </div>
    );
}
