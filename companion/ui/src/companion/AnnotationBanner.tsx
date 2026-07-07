import { PlusCircleIcon } from '@/companion/icons';

type Props = {
    /** `annotate` = generic pick prompt; `reanchor` = re-anchoring a stale note. */
    variant: 'annotate' | 'reanchor';
    /** Title of the note being re-anchored (reanchor variant only). */
    reanchorTitle?: string;
    onCancel?: () => void;
};

/**
 * Prompt banner shown at the top of the body in Annotate mode, and during the
 * re-anchor pick flow (README §Interactions).
 */
export default function AnnotationBanner({ variant, reanchorTitle, onCancel }: Props) {
    const reanchor = variant === 'reanchor';
    return (
        <div
            className={`mb-[14px] mt-2 flex items-center gap-[9px] rounded-dio-banner px-[13px] py-3 ${
                reanchor ? 'bg-dio-tint-reanchor' : 'bg-dio-tint-orange-2'
            }`}
        >
            <PlusCircleIcon size={16} className={`flex-none ${reanchor ? 'text-dio-danger-2' : 'text-dio-accent-deep'}`} />
            <div className="text-[12.5px] leading-[1.4] text-dio-accent-ink-soft">
                {reanchor ? (
                    <>
                        Re-anchoring &ldquo;<b className="text-dio-accent-ink">{reanchorTitle ?? 'note'}</b>&rdquo; — tap
                        its new element on the page.
                    </>
                ) : (
                    <>
                        <b className="text-dio-accent-ink">Tap anything on the page</b> to leave a note there.
                    </>
                )}
            </div>
            {reanchor && onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="ml-auto flex-none cursor-pointer border-none bg-transparent p-0 font-dio-ui text-[12px] font-semibold text-[#C79079]"
                >
                    Cancel
                </button>
            )}
        </div>
    );
}
