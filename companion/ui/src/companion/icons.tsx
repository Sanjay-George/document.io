/**
 * Feather-style stroked icons used across the companion, reproduced inline from
 * the design prototype so the shapes match pixel-for-pixel. Colour comes from
 * `currentColor`; size and stroke width are adjustable per usage.
 */

type IconProps = {
    size?: number;
    strokeWidth?: number;
    className?: string;
};

function Icon({
    size = 16,
    strokeWidth = 2,
    className,
    children,
}: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

export function MinimizeIcon(props: IconProps) {
    return <Icon {...props}><path d="M5 12h14" /></Icon>;
}

export function ExpandIcon(props: IconProps) {
    return <Icon {...props}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></Icon>;
}

export function CloseIcon(props: IconProps) {
    return <Icon {...props}><path d="M18 6L6 18M6 6l12 12" /></Icon>;
}

export function TargetIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="7" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </Icon>
    );
}

export function PlusCircleIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v8M8 12h8" />
        </Icon>
    );
}

export function ChevronRightIcon(props: IconProps) {
    return <Icon {...props}><path d="M9 18l6-6-6-6" /></Icon>;
}

export function ChevronLeftIcon(props: IconProps) {
    return <Icon {...props}><path d="M15 18l-6-6 6-6" /></Icon>;
}

export function ChevronUpIcon(props: IconProps) {
    return <Icon {...props}><path d="M18 15l-6-6-6 6" /></Icon>;
}

export function ChevronDownIcon(props: IconProps) {
    return <Icon {...props}><path d="M6 9l6 6 6-6" /></Icon>;
}

export function LinkIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
            <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
        </Icon>
    );
}

export function DownloadIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5M12 15V3" />
        </Icon>
    );
}

export function ExternalLinkIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M15 3h6v6M10 14L21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </Icon>
    );
}

export function EditIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </Icon>
    );
}

export function AlertTriangleIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 3l9.5 17H2.5z" />
            <path d="M12 9v5M12 17.5v.5" />
        </Icon>
    );
}

export function PageIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
        </Icon>
    );
}

export function ComponentIcon(props: IconProps) {
    return <Icon {...props}><path d="M4 4h6v6H4zM14 14h6v6h-6zM14 4h6v6h-6zM4 14h6v6H4z" /></Icon>;
}

export function ListIcon(props: IconProps) {
    return <Icon {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Icon>;
}

export function CodeIcon(props: IconProps) {
    return <Icon {...props}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></Icon>;
}

export function FormatIcon(props: IconProps) {
    return <Icon {...props}><path d="M4 7V5h16v2M9 19h6M12 5v14" /></Icon>;
}

export function CheckIcon(props: IconProps) {
    return <Icon strokeWidth={3} {...props}><path d="M5 12l5 5L20 7" /></Icon>;
}

/** Dock-right / vertical orientation — panel filled on the right edge. */
export function LayoutVerticalIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4z" fill="currentColor" stroke="none" />
        </Icon>
    );
}

/** Dock-bottom / horizontal orientation — panel filled on the bottom edge. */
export function LayoutHorizontalIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M4 14h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="currentColor" stroke="none" />
        </Icon>
    );
}
