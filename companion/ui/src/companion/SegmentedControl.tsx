import { Mode } from '@/companion/types';

type Props = {
    value: Mode;
    onChange: (mode: Mode) => void;
    /** `panel` = light track (docked header); `pill` = dark track (minimized pill). */
    variant?: 'panel' | 'pill';
};

const SEGMENTS: { mode: Mode; label: string }[] = [
    { mode: 'view', label: 'Read' },
    { mode: 'edit', label: 'Annotate' },
];

/**
 * Read / Annotate segmented toggle (README §2). Two skins share one behaviour.
 */
export default function SegmentedControl({ value, onChange, variant = 'panel' }: Props) {
    const isPill = variant === 'pill';
    const track = isPill
        ? 'gap-0.5 rounded-[18px] bg-white/[.06] p-0.5'
        : 'gap-0.5 rounded-dio-control bg-dio-subtle p-[3px]';

    return (
        <div className={`flex ${track}`}>
            {SEGMENTS.map(({ mode, label }) => {
                const active = value === mode;
                const base = 'h-[30px] cursor-pointer border-none font-dio-ui text-[12.5px] font-semibold';
                const skin = isPill
                    ? active
                        ? 'rounded-[16px] bg-dio-accent px-3 text-white'
                        : 'rounded-[16px] bg-transparent px-3 text-dio-muted'
                    : active
                        ? 'rounded-dio-tab bg-white px-[14px] text-dio-primary shadow-dio-seg'
                        : 'rounded-dio-tab bg-transparent px-[14px] text-[#8A93A0]';
                return (
                    <button key={mode} type="button" onClick={() => onChange(mode)} className={`${base} ${skin}`}>
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
