import { useMemo } from 'react';
import { pageMatches, toRelativeUrl } from '@/companion/helpers';

type Props = {
    /** Original captured URL — the source of truth for segment labels, so a
     *  wildcarded segment can always be toggled back to its real value. */
    url: string;
    /** Current pattern; `undefined` means an exact match on `url`. */
    value?: string;
    onChange: (pattern: string | undefined) => void;
};

/** Split a relative URL into path segments and a (search/hash) remainder. */
function splitPath(relative: string): { segments: string[]; rest: string } {
    const cut = relative.search(/[?#]/);
    const path = cut === -1 ? relative : relative.slice(0, cut);
    const rest = cut === -1 ? '' : relative.slice(cut);
    return { segments: path.split('/').filter((s) => s.length > 0), rest };
}

/**
 * Click-to-wildcard page scope (README §7). The captured path is shown as a row
 * of segment chips; clicking one toggles it between its real value and `*`, which
 * builds the `urlPattern`. With no wildcards the note matches its exact page;
 * wildcarding the volatile segment (e.g. a document id) makes one note cover a
 * family of pages without blindly matching unrelated ones.
 *
 * Fully controlled: `value` is the single source of truth, so a toggle survives
 * save/reload — the real segment labels always come from `url`.
 */
export default function PageScopeEditor({ url, value, onChange }: Props) {
    const relativeUrl = toRelativeUrl(url);
    const { segments, rest } = useMemo(() => splitPath(relativeUrl), [relativeUrl]);

    // Which segments are wildcarded right now, aligned to the real segments.
    const wild = useMemo(() => {
        if (!value) return segments.map(() => false);
        const patternSegs = splitPath(toRelativeUrl(value)).segments;
        return segments.map((_, i) => patternSegs[i] === '*');
    }, [value, segments]);

    const here = typeof window !== 'undefined' ? toRelativeUrl(window.location.href) : '';
    const matchesHere = pageMatches(here, url, value);
    const anyWild = wild.some(Boolean);

    const emit = (next: boolean[]) => {
        if (!next.some(Boolean)) return onChange(undefined); // back to exact match
        onChange('/' + segments.map((s, i) => (next[i] ? '*' : s)).join('/') + rest);
    };
    const toggle = (i: number) => emit(wild.map((w, idx) => (idx === i ? !w : w)));
    const reset = () => onChange(undefined);

    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[.04em] text-dio-muted">
                    Applies to page
                </span>
                {anyWild && (
                    <button
                        type="button"
                        onClick={reset}
                        className="cursor-pointer border-none bg-transparent p-0 text-[11.5px] font-semibold text-dio-tertiary hover:text-dio-primary"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center rounded-dio-tab border border-dio-border-field bg-dio-subtle px-2 py-[7px] font-dio-mono text-[12px] leading-[1.6]">
                {segments.length === 0 ? (
                    <span className="text-dio-body">{relativeUrl || '/'}</span>
                ) : (
                    <>
                        <span className="text-dio-faint">/</span>
                        {segments.map((seg, i) => (
                            <span key={i} className="flex items-center">
                                {i > 0 && <span className="text-dio-faint">/</span>}
                                <button
                                    type="button"
                                    onClick={() => toggle(i)}
                                    title={
                                        wild[i]
                                            ? `Matches any value here — was “${seg}”. Click to require “${seg}”.`
                                            : `“${seg}” — click to match any value here`
                                    }
                                    className={
                                        'mx-[1px] cursor-pointer rounded-[5px] border-none px-1.5 py-0.5 transition-colors ' +
                                        (wild[i]
                                            ? 'bg-dio-accent font-semibold text-white'
                                            : 'bg-transparent text-dio-body hover:bg-white hover:shadow-dio-card')
                                    }
                                >
                                    {wild[i] ? '∗' : seg}
                                </button>
                            </span>
                        ))}
                        {rest && <span className="ml-0.5 text-dio-faint">{rest}</span>}
                    </>
                )}
            </div>

            <p className="mt-1.5 text-[11px] leading-[1.5] text-dio-muted">
                Click a segment to toggle its match status.{' '}
                {matchesHere ? (
                    <span className="font-semibold text-dio-accent">Matches this page.</span>
                ) : (
                    <span className="font-semibold text-dio-danger">Won’t show on this page.</span>
                )}
            </p>
        </div>
    );
}
