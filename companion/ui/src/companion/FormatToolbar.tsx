import { CodeIcon, ListIcon } from '@/companion/icons';

export type FormatToken = 'h' | 'b' | 'i' | 'list' | 'quote' | 'code';

type Props = {
    onInsert: (token: FormatToken) => void;
};

const btn = 'flex h-[28px] min-w-[28px] cursor-pointer items-center justify-center rounded-[6px] border-none bg-transparent px-[7px] text-dio-secondary hover:bg-dio-border-field';

/**
 * Optional Markdown formatting toolbar revealed by the composer's Format button
 * (README §7). Each control inserts a snippet of Markdown into the note body.
 */
export default function FormatToolbar({ onInsert }: Props) {
    return (
        <div className="mt-1 flex items-center gap-0.5 rounded-[10px] bg-dio-subtle-2 p-[5px]">
            <button type="button" onClick={() => onInsert('h')} className={`${btn} text-[13px] font-bold`}>H</button>
            <button type="button" onClick={() => onInsert('b')} className={`${btn} text-[13px] font-bold`}>B</button>
            <button type="button" onClick={() => onInsert('i')} className={`${btn} font-serif text-[13px] italic`}>i</button>
            <span className="mx-[3px] h-[15px] w-px bg-[#E4E6EA]" />
            <button type="button" onClick={() => onInsert('list')} className={btn}><ListIcon size={15} /></button>
            <button type="button" onClick={() => onInsert('quote')} className={`${btn} font-serif text-[15px] font-bold`}>&rdquo;</button>
            <button type="button" onClick={() => onInsert('code')} className={btn}><CodeIcon size={14} /></button>
        </div>
    );
}
