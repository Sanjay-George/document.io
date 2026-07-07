import { CheckIcon } from '@/companion/icons';

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
};

/**
 * Small labelled checkbox used for the composer's "Whole page" toggle (README §7).
 * Checked = accent fill + white tick.
 */
export default function Checkbox({ checked, onChange, label }: Props) {
    return (
        <label
            onClick={() => onChange(!checked)}
            className="flex cursor-pointer select-none items-center gap-[7px] text-[12.5px] text-dio-tertiary"
        >
            <span
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-dio-checkbox border-[1.5px] ${
                    checked ? 'border-dio-accent bg-dio-accent text-white' : 'border-[#D4D7DE] bg-white'
                }`}
            >
                {checked && <CheckIcon size={12} />}
            </span>
            <span>{label}</span>
        </label>
    );
}
