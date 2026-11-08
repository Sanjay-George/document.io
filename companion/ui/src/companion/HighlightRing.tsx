type Props = {
    selected?: boolean;
    /** Match the target element's border radius, e.g. "8px" or "50%". */
    radius?: string;
};

/**
 * Inset ring that traces the target element (README §4). Rendered absolutely
 * inside a positioned wrapper over the element; never intercepts pointer events.
 * The inset box-shadow is a computed value, so it stays in an inline style.
 */
export default function HighlightRing({ selected = false, radius = '8px' }: Props) {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[4]"
            style={{
                borderRadius: radius,
                boxShadow: selected
                    ? 'inset 0 0 0 2.5px rgba(221,98,52,.9)'
                    : 'inset 0 0 0 1.5px rgba(221,98,52,.3)',
                background: selected ? 'rgba(221,98,52,.05)' : 'transparent',
            }}
        />
    );
}
