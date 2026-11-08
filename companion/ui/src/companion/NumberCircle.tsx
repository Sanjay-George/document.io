type Variant = 'idle' | 'selected' | 'broken' | 'other';

type Props = {
    number: number;
    variant?: Variant;
};

/**
 * 24px numbered circle used on annotation cards and the popover header.
 * Broken notes show a "!" instead of the number.
 */
function skinFor(variant: Variant): string {
    switch (variant) {
        case 'idle':
            return 'bg-white text-dio-accent border-[1.5px] border-dio-accent/50';
        case 'selected':
            return 'bg-dio-accent text-white';
        case 'broken':
            return 'bg-dio-danger-bg text-dio-danger-2';
        case 'other':
            return 'bg-white text-dio-faint border-[1.5px] border-[#DDE0E6]';
    }
}

export default function NumberCircle({ number, variant = 'idle' }: Props) {
    return (
        <span
            className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[12px] font-semibold ${skinFor(variant)}`}
        >
            {variant === 'broken' ? '!' : number}
        </span>
    );
}
