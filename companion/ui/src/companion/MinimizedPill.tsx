import { Mode } from '@/companion/types';
import BrandGlyph from '@/companion/BrandGlyph';
import { ExpandIcon } from '@/companion/icons';

type Props = {
    mode: Mode;
    onModeChange: (mode: Mode) => void;
    onRestore: () => void;
};

/** Read is the orange accent; Annotate is the red danger tone, to set the modes apart. */
const SEGMENTS: { mode: Mode; label: string; letter: string; activeBg: string }[] = [
    { mode: 'view', label: 'Read', letter: 'R', activeBg: 'bg-dio-accent' },
    { mode: 'edit', label: 'Annotate', letter: 'A', activeBg: 'bg-dio-danger' },
];

/**
 * Collapsed companion — a compact dark pill fixed bottom-right (README §8).
 * The active mode shows its full label; the other collapses to its initial and
 * expands when clicked. The brand glyph echoes the active mode's colour.
 */
export default function MinimizedPill({ mode, onModeChange, onRestore }: Props) {
    const accentBg = mode === 'edit' ? 'bg-dio-danger' : 'bg-dio-accent';

    return (
        <div className="animate-dio-pop-pill fixed bottom-[22px] right-[22px] z-[50] flex items-center gap-1 rounded-dio-pill bg-dio-ink p-1.5 font-dio-ui shadow-dio-pill">
            <div className="flex items-center gap-[7px] pl-1 pr-[3px]">
                <span
                    title="document.io"
                    className={`flex h-[26px] w-[26px] flex-none items-center justify-center rounded-dio-chip text-white transition-colors ${accentBg}`}
                >
                    <BrandGlyph size={9} />
                </span>
            </div>
            <div className="h-[22px] w-px bg-white/[.14]" />
            <div className="flex gap-0.5 rounded-[18px] bg-white/[.06] p-0.5">
                {SEGMENTS.map(({ mode: m, label, letter, activeBg }) => {
                    const active = mode === m;
                    return (
                        <button
                            key={m}
                            type="button"
                            onClick={() => onModeChange(m)}
                            title={label}
                            className={`h-[30px] cursor-pointer rounded-[16px] border-none font-dio-ui text-[12.5px] font-semibold transition-colors ${
                                active ? `${activeBg} px-3 text-white` : 'w-[30px] bg-transparent text-dio-muted'
                            }`}
                        >
                            {active ? label : letter}
                        </button>
                    );
                })}
            </div>
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
