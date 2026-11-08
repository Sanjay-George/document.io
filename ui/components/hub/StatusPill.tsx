"use client";

export default function StatusPill({ active, onClick }: { active: boolean; onClick?: () => void }) {
    const cls = `hub-status hub-status--${active ? "active" : "inactive"}${onClick ? " is-btn" : ""}`;
    const inner = (
        <>
            <span className="hub-status-dot" />
            {active ? "Active" : "Inactive"}
        </>
    );
    return onClick ? (
        <button className={cls} onClick={onClick}>
            {inner}
        </button>
    ) : (
        <span className={cls}>{inner}</span>
    );
}
