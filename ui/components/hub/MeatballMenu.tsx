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
    const buttonRef = useRef<HTMLButtonElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    // Move focus to the first item when the menu opens.
    useEffect(() => {
        if (open) itemRefs.current[0]?.focus();
    }, [open]);

    const close = (restoreFocus = true) => {
        setOpen(false);
        if (restoreFocus) buttonRef.current?.focus();
    };

    const focusItemAt = (index: number) => {
        const count = items.length;
        const next = ((index % count) + count) % count;
        itemRefs.current[next]?.focus();
    };

    const onMenuKeyDown = (e: React.KeyboardEvent, i: number) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                focusItemAt(i + 1);
                break;
            case "ArrowUp":
                e.preventDefault();
                focusItemAt(i - 1);
                break;
            case "Home":
                e.preventDefault();
                focusItemAt(0);
                break;
            case "End":
                e.preventDefault();
                focusItemAt(items.length - 1);
                break;
            case "Escape":
                e.preventDefault();
                close();
                break;
            case "Tab":
                close(false);
                break;
        }
    };

    return (
        <div className="hub-kebab-wrap" ref={ref}>
            <button
                ref={buttonRef}
                type="button"
                className="hub-kebab"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOpen((o) => !o);
                }}
            >
                <MoreHorizontal size={16} />
            </button>
            {open && (
                <div
                    className="hub-menu"
                    role="menu"
                    aria-label={label}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                >
                    {items.map((item, i) => (
                        <div key={item.label}>
                            {item.separatorBefore && <div className="hub-menu-sep" role="separator" />}
                            <button
                                ref={(el) => { itemRefs.current[i] = el; }}
                                type="button"
                                role="menuitem"
                                className={`hub-menu-item${item.danger ? " is-danger" : ""}`}
                                onKeyDown={(e) => onMenuKeyDown(e, i)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    close(false);
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
