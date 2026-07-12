"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type MenuItem = {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    separatorBefore?: boolean;
};

export default function KebabMenu({ items, label = "More actions" }: { items: MenuItem[]; label?: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div className="hub-kebab-wrap" ref={ref}>
            <button
                type="button"
                className="hub-kebab"
                aria-label={label}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOpen((o) => !o);
                }}
            >
                <MoreHorizontal size={16} />
            </button>
            {open && (
                <div className="hub-menu" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                    {items.map((item, i) => (
                        <div key={item.label}>
                            {item.separatorBefore && <div className="hub-menu-sep" />}
                            <button
                                type="button"
                                className={`hub-menu-item${item.danger ? " is-danger" : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setOpen(false);
                                    item.onClick();
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
