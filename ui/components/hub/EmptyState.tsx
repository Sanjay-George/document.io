"use client";

export default function EmptyState({
    title,
    body,
    action,
    showIcon = true,
    variant,
}: {
    title: string;
    body?: string;
    action?: React.ReactNode;
    showIcon?: boolean;
    variant?: "detail";
}) {
    return (
        <div className={`hub-empty${variant === "detail" ? " hub-empty--detail" : ""}`}>
            {showIcon && (
                <div className="hub-empty-icon">
                    <i />
                </div>
            )}
            <div className="hub-empty-title">{title}</div>
            {body && <div className="hub-empty-body">{body}</div>}
            {action && <div className="hub-empty-action">{action}</div>}
        </div>
    );
}
