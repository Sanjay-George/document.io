type Props = {
    /** Size of the rotated diamond in px. */
    size?: number;
    className?: string;
};

/**
 * The document.io brand mark — a single rotated square. The only bespoke glyph
 * in the companion (README §Assets). Colour is inherited via `currentColor`.
 */
export default function BrandGlyph({ size = 8, className }: Props) {
    return (
        <span
            className={`inline-block rotate-45 rounded-[2px] bg-current ${className ?? ''}`}
            style={{ width: size, height: size }}
        />
    );
}
