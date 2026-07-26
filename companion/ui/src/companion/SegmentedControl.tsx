import { Mode } from '@/companion/types';

type Props = {
    value: Mode;
    onChange: (mode: Mode) => void;
    /** `panel` = light track (docked header); `pill` = dark track (minimized pill). */
    variant?: 'panel' | 'pill';
};

/** Read is the orange accent; Annotate is the red danger tone, to set the modes apart. */
const SEGMENTS: { mode: Mode; label: string; letter: string; activeBg: string }[] = [
    { mode: 'view', label: 'Read', letter: 'R', activeBg: 'bg-dio-accent' },
    { mode: 'edit', label: 'Annotate', letter: 'A', activeBg: 'bg-dio-danger' },
];

/**
 * Read / Annotate segmented toggle. 
 * The active mode shows its full label in its accent colour; the other collapses to its initial and expands when clicked. 
 * Two skins share one behaviour — `panel` (light) / `pill` (dark).
 */
export default function SegmentedControl({ value, onChange, variant = 'panel' }: Props) {
    const isPill = variant === 'pill';
    const track = isPill
        ? 'gap-0.5 rounded-[18px] bg-white/[.06] p-0.5'
        : 'gap-0.5 rounded-dio-control bg-dio-subtle p-[3px]';
    const radius = isPill ? 'rounded-[16px]' : 'rounded-dio-tab';
    const inactive = isPill ? 'text-dio-muted' : 'text-[#8A93A0]';

    return (
        <div className={`flex ${track}`}>
            {SEGMENTS.map(({ mode, label, letter, activeBg }) => {
                const active = value === mode;
                const base =
                    'h-[30px] cursor-pointer border-none font-dio-ui text-[12.5px] font-semibold transition-colors';
                const skin = active ? `${activeBg} px-3 text-white` : `w-[30px] bg-transparent ${inactive}`;
                return (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => onChange(mode)}
                        title={label}
                        className={`${base} ${radius} ${skin}`}
                    >
                        {active ? label : letter}
                    </button>
                );
            })}
        </div>
    );
}
