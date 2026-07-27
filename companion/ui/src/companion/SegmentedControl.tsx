import { Mode } from '@/companion/types';

type Props = {
    value: Mode;
    onChange: (mode: Mode) => void;
    /** `panel` = light track (docked header); `pill` = dark track (minimized pill). */
    variant?: 'panel' | 'pill';
};

/** In the pill, Read is the orange accent and Annotate the red danger tone; the letter is the collapsed form. */
const SEGMENTS: { mode: Mode; label: string; letter: string; activeBg: string }[] = [
    { mode: 'view', label: 'Read', letter: 'R', activeBg: 'bg-dio-accent' },
    { mode: 'edit', label: 'Annotate', letter: 'A', activeBg: 'bg-dio-danger' },
];

/**
 * Read / Annotate segmented toggle.
 * `panel` (light, docked header) shows both full labels with a neutral active tab.
 * `pill` (dark, minimized) collapses the inactive mode to its initial and tints
 * the active mode by mode — orange Read / red Annotate — to save space and stand out.
 */
export default function SegmentedControl({ value, onChange, variant = 'panel' }: Props) {
    const isPill = variant === 'pill';
    const track = isPill
        ? 'gap-0.5 rounded-[18px] bg-white/[.06] p-0.5'
        : 'gap-0.5 rounded-dio-control bg-dio-subtle p-[3px]';

    return (
        <div className={`flex ${track}`}>
            {SEGMENTS.map(({ mode, label, letter, activeBg }) => {
                const active = value === mode;
                const base =
                    'h-[30px] cursor-pointer border-none font-dio-ui text-[12.5px] font-semibold transition-colors';
                const skin = isPill
                    ? active
                        ? `rounded-[16px] ${activeBg} px-3 text-white`
                        : 'w-[30px] rounded-[16px] bg-transparent text-dio-muted'
                    : active
                        ? 'rounded-dio-tab bg-white px-[14px] text-dio-primary shadow-dio-seg'
                        : 'rounded-dio-tab bg-transparent px-[14px] text-[#8A93A0]';
                return (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => onChange(mode)}
                        title={label}
                        className={`${base} ${skin}`}
                    >
                        {isPill && !active ? letter : label}
                    </button>
                );
            })}
        </div>
    );
}
