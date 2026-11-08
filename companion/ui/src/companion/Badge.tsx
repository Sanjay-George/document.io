import { CSSProperties } from 'react';

type BadgeState = 'idle' | 'selected' | 'flashing';

type Props = {
    /** Displayed step number. */
    number: number;
    state?: BadgeState;
    onClick?: () => void;
    /** Absolute-position offsets for placing the pin over its target element. */
    style?: CSSProperties;
};

/**
 * On-page numbered annotation pin (README §4). Positioned absolutely over its
 * target element by the host integration; visual state is driven by `state`.
 */
export default function Badge({ number, state = 'idle', onClick, style }: Props) {
    const highlighted = state === 'selected' || state === 'flashing';
    const skin = highlighted
        ? 'bg-dio-accent text-white border-2 border-white shadow-dio-badge-selected'
        : 'bg-white text-dio-accent border-[1.5px] border-dio-accent shadow-dio-badge';
    const motion = state === 'flashing' ? 'animate-dio-pulse scale-[1.12]' : state === 'selected' ? 'scale-110' : '';

    return (
        <button
            type="button"
            onClick={onClick}
            style={style}
            className={`absolute z-[9] flex h-[22px] min-w-[22px] cursor-pointer items-center justify-center rounded-dio-badge px-[5px] font-dio-ui text-[12px] font-semibold ${skin} ${motion}`}
        >
            {number}
        </button>
    );
}
