"use client";

export default function Toggle({
    on,
    onChange,
    label,
}: {
    on: boolean;
    onChange: (next: boolean) => void;
    label?: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            className="hub-toggle-label"
            onClick={() => onChange(!on)}
        >
            <span className={`hub-toggle-track${on ? " on" : ""}`}>
                <span className="hub-toggle-knob" />
            </span>
            {label !== undefined && <span className="hub-toggle-text">{label}</span>}
        </button>
    );
}
