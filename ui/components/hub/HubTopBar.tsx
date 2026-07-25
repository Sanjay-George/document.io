"use client";

import Link from "next/link";
import GuestBadge from "./GuestBadge";

const COMPANION_URL = "https://github.com/Sanjay-George/document.io-companion";

export default function HubTopBar() {
    return (
        <header className="hub-topbar">
            <Link href="/projects" className="hub-brand">
                <span className="hub-logo"><i /></span>
                <span className="hub-brand-name">document.io</span>
                <span className="hub-brand-tag">/ hub</span>
            </Link>
            <div className="hub-spacer" />
            <a href={COMPANION_URL} target="_blank" rel="noopener noreferrer" className="hub-companion-btn">
                <i />
                Get Companion App
            </a>
            <GuestBadge />
        </header>
    );
}
