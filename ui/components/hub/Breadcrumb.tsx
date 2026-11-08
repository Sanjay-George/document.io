"use client";

import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string; current?: boolean };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
    return (
        <div className="hub-crumbs">
            {items.map((item, i) => (
                <Fragment key={i}>
                    {i > 0 && <span className="hub-crumb-sep">/</span>}
                    {item.href ? (
                        <Link href={item.href} className="hub-crumb-root">
                            {item.label}
                        </Link>
                    ) : (
                        <span className={item.current ? "hub-crumb-cur" : "hub-crumb-root"}>{item.label}</span>
                    )}
                </Fragment>
            ))}
        </div>
    );
}
