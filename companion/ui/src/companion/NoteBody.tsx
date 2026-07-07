import { renderMarkdown } from '@/companion/markdown';
import { contextLabel } from '@/companion/helpers';
import { Note } from '@/companion/types';
import { TargetIcon } from '@/companion/icons';

type Props = {
    note: Pick<Note, 'type' | 'selector' | 'url' | 'body'>;
    /** Show the selector/URL context line above the body. */
    showContext?: boolean;
};

/**
 * The context line + rendered Markdown body shared by the expanded card and the
 * in-context popover.
 */
export default function NoteBody({ note, showContext = true }: Props) {
    return (
        <>
            {showContext && (
                <div className="mb-[11px] flex items-center gap-1.5 text-[11.5px] text-dio-faint">
                    <TargetIcon size={12} className="flex-none" />
                    <span className="min-w-0 flex-1 truncate" title={contextLabel(note)}>
                        {contextLabel(note)}
                    </span>
                </div>
            )}
            <div className="text-[13.5px] leading-[1.65] text-dio-body [&>*:last-child]:mb-0">
                {renderMarkdown(note.body)}
            </div>
        </>
    );
}
