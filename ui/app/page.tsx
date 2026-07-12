"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import "./landing.css";

const COMPANION_URL = "https://github.com/Sanjay-George/document.io-companion";

const steps = [
    {
        num: "01",
        title: "Click an element",
        body: "On any live page, point at the button or field you want to explain.",
    },
    {
        num: "02",
        title: "Write the note",
        body: "The composer opens with the element’s selector. It anchors the moment you save.",
    },
    {
        num: "03",
        title: "Read it in place",
        body: "Open the panel anywhere and step through notes beside the real UI. Stale ones flag themselves.",
    },
];

function ArrowIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    );
}

export default function Home() {
    const stepsRef = useRef<HTMLDivElement>(null);

    // Reveal the three steps on scroll (ported from the design's IntersectionObserver).
    useEffect(() => {
        const root = stepsRef.current;
        if (!root) return;
        const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
        els.forEach((el) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(16px)";
            el.style.transition = "opacity .55s ease, transform .55s ease";
        });
        if (!("IntersectionObserver" in window)) {
            els.forEach((el) => {
                el.style.opacity = "1";
                el.style.transform = "none";
            });
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (!e.isIntersecting) return;
                    const el = e.target as HTMLElement;
                    const i = els.indexOf(el) % 3;
                    setTimeout(() => {
                        el.style.opacity = "1";
                        el.style.transform = "none";
                    }, i * 90);
                    io.unobserve(el);
                });
            },
            { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <div className="lp-page">
            {/* ============ NAV ============ */}
            <header className="lp-header">
                <div className="lp-brand">
                    <span className="lp-logo"><i /></span>
                    <span className="lp-brand-name">document.io</span>
                </div>
                <div className="lp-spacer" />
                <Link href="/projects" className="lp-nav-ghost" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                    Open the Hub
                </Link>
                <a href={COMPANION_URL} target="_blank" rel="noopener noreferrer" className="lp-nav-dark">
                    Get the app
                </a>
            </header>

            {/* ============ HERO ============ */}
            <section className="lp-hero">
                <div className="lp-hero-copy">
                    <h1 className="lp-h1">
                        Notes pinned to the <span className="accent">real interface</span>.
                    </h1>
                    <p className="lp-sub">
                        Annotate a live web app. Notes stay anchored to the actual elements — and follow along when the UI changes.
                    </p>
                    <div className="lp-cta-row">
                        <a href={COMPANION_URL} target="_blank" rel="noopener noreferrer" className="lp-btn-primary">
                            Add to Chrome
                            <ArrowIcon />
                        </a>
                        <Link href="/projects" className="lp-btn-ghost">
                            Open the Hub
                        </Link>
                    </div>
                </div>

                {/* animated pin demo */}
                <div className="lp-demo">
                    <div className="lp-window">
                        <div className="lp-window-bar">
                            <div className="lp-dots">
                                <span className="lp-dot" />
                                <span className="lp-dot" />
                                <span className="lp-dot" />
                            </div>
                            <div className="lp-url">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#B0A99E" strokeWidth="2">
                                    <rect x="4" y="10" width="16" height="11" rx="2" />
                                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                </svg>
                                <span>halyard.app/deployments</span>
                            </div>
                        </div>
                        <div className="lp-canvas">
                            <div className="lp-skel-1" />
                            <div className="lp-skel-2" />
                            <div className="lp-skel-grid">
                                <div className="lp-skel-card" />
                                <div className="lp-skel-card" />
                            </div>

                            <div className="lp-actions">
                                <div className="lp-promote-wrap">
                                    <div className="lp-promote">Promote build</div>
                                    <div className="lp-ring" />
                                    <div className="lp-badge">3</div>
                                </div>
                                <div className="lp-rollback">Roll back</div>
                            </div>

                            <div className="lp-note">
                                <div className="lp-note-head">
                                    <span className="lp-note-badge">3</span>
                                    <span className="lp-note-title">Promoting to Production</span>
                                </div>
                                <div className="lp-note-sel">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="M3 12h18" />
                                    </svg>
                                    button.promote
                                </div>
                                <div className="lp-note-bar"><i /></div>
                                <div className="lp-note-bar2" />
                            </div>

                            <div className="lp-cursor">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#14171F" stroke="#fff" strokeWidth="1.5">
                                    <path d="M5 3l6 16 2-6 6-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="lp-toolbar">
                            <span className="lp-toolbar-logo"><i /></span>
                            <div className="lp-toolbar-tabs">
                                <span className="lp-tab active">Read</span>
                                <span className="lp-tab inactive">Annotate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ THREE QUIET STEPS ============ */}
            <section className="lp-steps">
                <div className="lp-steps-grid" ref={stepsRef}>
                    {steps.map((s) => (
                        <div className="lp-step" data-reveal key={s.num}>
                            <div className="lp-step-num">{s.num}</div>
                            <div className="lp-step-title">{s.title}</div>
                            <div className="lp-step-body">{s.body}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ FOOTER ============ */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-brand" style={{ gap: 9 }}>
                        <span className="lp-footer-logo"><i /></span>
                        <span className="lp-footer-name">document.io</span>
                    </div>
                    <span className="lp-footer-tag">Documenting websites at the source</span>
                    <div className="lp-spacer" />
                    <Link href="/projects" className="lp-footer-link">Open the Hub</Link>
                </div>
            </footer>
        </div>
    );
}
