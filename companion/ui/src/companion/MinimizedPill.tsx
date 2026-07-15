import { Mode } from '@/companion/types';
import BrandGlyph from '@/companion/BrandGlyph';
import SegmentedControl from '@/companion/SegmentedControl';
import { ExpandIcon } from '@/companion/icons';

type Props = {
    mode: Mode;
    onModeChange: (mode: Mode) => void;
    onRestore: () => void;
};

/**
 * Collapsed companion — a compact dark pill fixed bottom-right (README §8).
 * Keeps the brand glyph, page count, mode toggle, and an expand affordance.
 */
export default function MinimizedPill({ mode, onModeChange, onRestore }: Props) {
    return (
        <div className="animate-dio-pop-pill fixed bottom-[22px] right-[22px] z-[50] flex items-center gap-1 rounded-dio-pill bg-dio-ink p-1.5 font-dio-ui shadow-dio-pill">
            <div className="flex items-center gap-[7px] pl-1 pr-[3px]">
                <span
                    title="document.io"
                    className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-dio-chip bg-dio-accent text-white"
                >
                    <BrandGlyph size={9} />
                </span>
            </div>
            <div className="h-[22px] w-px bg-white/[.14]" />
            <SegmentedControl value={mode} onChange={onModeChange} variant="pill" />
            <button
                type="button"
                onClick={onRestore}
                title="Expand"
                className="flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-full border-none bg-white/[.06] text-white hover:bg-white/[.14]"
            >
                <ExpandIcon size={16} />
            </button>
        </div>
    );
}
