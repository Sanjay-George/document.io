"use client";

import { User } from "lucide-react";

export default function GuestBadge() {
    return (
        <span className="hub-guest" title="Guest" aria-label="Guest">
            <User size={15} strokeWidth={2} />
        </span>
    );
}
