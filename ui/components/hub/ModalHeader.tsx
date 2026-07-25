"use client";

import { X } from "lucide-react";

export default function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <div className="hub-modal-head">
            <span className="hub-modal-title">{title}</span>
            <button className="hub-modal-x" onClick={onClose} aria-label="Close">
                <X size={16} />
            </button>
        </div>
    );
}
