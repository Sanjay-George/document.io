"use client";

export default function SectionHeader({ label, meta }: { label: string; meta?: React.ReactNode }) {
    return (
        <div className="hub-section-head">
            <span className="hub-section-label">{label}</span>
            {meta != null && <span className="hub-section-meta">{meta}</span>}
        </div>
    );
}
