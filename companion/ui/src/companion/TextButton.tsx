import { MouseEvent, ReactNode } from 'react';

type Props = {
    label: string;
    onClick?: (e: MouseEvent) => void;
    icon?: ReactNode;
    /** Colour/hover utility classes, e.g. "text-dio-tertiary hover:text-dio-primary". */
    className?: string;
};

/**
 * Borderless text action (Edit / Delete / Re-anchor / Dismiss) used on cards and
 * the popover. Colour is supplied by the caller via `className`.
 */
export default function TextButton({ label, onClick, icon, className = '' }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex cursor-pointer items-center gap-[5px] border-none bg-transparent p-0 font-dio-ui text-[12.5px] font-semibold transition-colors ${className}`}
        >
            {icon}
            {label}
        </button>
    );
}
