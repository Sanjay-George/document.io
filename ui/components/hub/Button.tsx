"use client";

import Link from "next/link";

export type HubButtonVariant = "primary" | "dark" | "ghost" | "cancel" | "save";

const VARIANT_CLASS: Record<HubButtonVariant, string> = {
    primary: "hub-btn-primary",
    dark: "hub-btn-dark",
    ghost: "hub-btn-ghost",
    cancel: "hub-btn-cancel",
    save: "hub-btn-save",
};

type CommonProps = {
    variant?: HubButtonVariant;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

type ButtonProps = CommonProps & {
    href?: undefined;
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
};

type LinkProps = CommonProps & {
    href: string;
    target?: string;
};

export default function Button(props: ButtonProps | LinkProps) {
    const { variant = "primary", icon, children, className = "", style } = props;
    const cls = `${VARIANT_CLASS[variant]}${className ? ` ${className}` : ""}`;

    if ("href" in props && props.href !== undefined) {
        const external = props.target === "_blank";
        const content = (
            <>
                {icon}
                {children}
            </>
        );
        if (external) {
            return (
                <a href={props.href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
                    {content}
                </a>
            );
        }
        return (
            <Link href={props.href} className={cls} style={style}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={props.type ?? "button"}
            onClick={props.onClick}
            disabled={props.disabled}
            className={cls}
            style={style}
        >
            {icon}
            {children}
        </button>
    );
}
