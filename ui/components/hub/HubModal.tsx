"use client";

import { useEffect } from "react";

export default function HubModal({
    open,
    onClose,
    children,
    variant = "modal",
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    variant?: "modal" | "install";
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="hub-overlay" onClick={onClose}>
            <div className={variant === "install" ? "hub-install" : "hub-modal"} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
