import { useMemo } from 'react';
import {
    PageScope,
    SegmentState,
    buildPageScope,
    describePageScope,
    pageMatches,
    parsePageScope,
} from '@/companion/helpers';

type Props = {
    /** Original captured URL — the source of truth for chip labels, so a
     *  wildcarded segment can always be toggled back to its real value. */
    url: string;
    /** Current pattern; `undefined` means an exact match on `url`. */
    value?: string;
    onChange: (pattern: string | undefined) => void;
};

const NEXT_STATE: Record<SegmentState, SegmentState> = { exact: 'any', any: 'deep', deep: 'exact' };

/** Each state's chip label. The depth chip draws its own slashes so it visibly
 *  spans them — that, not the extra `∗`, is what distinguishes it at a glance. */
const LABEL: Record<SegmentState, (seg: string) => string> = {
    exact: (seg) => seg,
    any: () => '∗',
    deep: () => '/ ∗∗ /',
};

/** Tooltips name the *next* click, so the third state is discoverable by hover. */
const HINT: Record<SegmentState, (seg: string) => string> = {
    exact: (seg) => `“${seg}” — click to match any value here`,
    any: () => 'Matches any single value here — click again to match any number of levels',
    deep: (seg) => `Matches any number of levels here — click to require “${seg}”`,
};

/**
 * Click-to-wildcard page scope (README §7). The captured path is shown as a row
 * of chips; clicking one cycles it through matching its real value, any single
 * value (`∗`), and any number of levels (`∗∗`), which builds the `urlPattern`.
 * Query params captured with the page get their own chips, ignored until clicked.
 *
 * The two wildcards are told apart by shape rather than by glyph: `∗` sits in one
 * slot between two slashes, while `∗∗` renders its own slashes and so visibly
 * spans more than one. A plain-English line under the row restates the result, so
 * nothing here requires knowing glob syntax.
 *
 * Fully controlled: `value` is the single source of truth, so a toggle survives
 * save/reload — the real chip labels always come from `url`.
 */
export default function PageScopeEditor({ url, value, onChange }: Props) {
    const scope = useMemo(() => parsePageScope(url, value), [url, value]);
    const { segments, states, params } = scope;

    const here = typeof window !== 'undefined' ? window.location.href : '';
    const matchesHere = pageMatches(here, url, value);
    const isScoped = states.some((s) => s !== 'exact') || params.some((p) => p.required);

    const emit = (next: Partial<PageScope>) => onChange(buildPageScope({ ...scope, ...next }));
    const cycleSegment = (i: number) =>
        emit({ states: states.map((s, idx) => (idx === i ? NEXT_STATE[s] : s)) });
    const toggleParam = (i: number) =>
        emit({ params: params.map((p, idx) => (idx === i ? { ...p, required: !p.required } : p)) });

    const chip = (active: boolean) =>
        'mx-[1px] cursor-pointer rounded-[5px] border-none px-1.5 py-0.5 transition-colors ' +
        (active
            ? 'bg-dio-accent font-semibold text-white'
            : 'bg-transparent text-dio-body hover:bg-white hover:shadow-dio-card');

    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[.04em] text-dio-muted">
                    Applies to page
                </span>
                {isScoped && (
                    <button
                        type="button"
                        onClick={() => onChange(undefined)}
                        className="cursor-pointer border-none bg-transparent p-0 text-[11.5px] font-semibold text-dio-tertiary hover:text-dio-primary"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center rounded-dio-tab border border-dio-border-field bg-dio-subtle px-2 py-[7px] font-dio-mono text-[12px] leading-[1.6]">
                {segments.length === 0 ? (
                    <span className="text-dio-body">/</span>
                ) : (
                    segments.map((seg, i) => {
                        // The depth chip carries its own slashes, so the row skips
                        // the separators it would otherwise duplicate either side.
                        const spansSlashes = states[i] === 'deep' || states[i - 1] === 'deep';
                        return (
                            <span key={i} className="flex items-center">
                                {!spansSlashes && <span className="text-dio-faint">/</span>}
                                <button
                                    type="button"
                                    onClick={() => cycleSegment(i)}
                                    title={HINT[states[i]](seg)}
                                    className={chip(states[i] !== 'exact')}
                                >
                                    {LABEL[states[i]](seg)}
                                </button>
                            </span>
                        );
                    })
                )}
                {params.map((param, i) => (
                    <button
                        key={param.key}
                        type="button"
                        onClick={() => toggleParam(i)}
                        title={
                            param.required
                                ? `Requires ${param.key}=${param.value} — click to ignore it`
                                : `${param.key}=${param.value} is ignored — click to require it`
                        }
                        className={
                            chip(param.required) + (param.required ? '' : ' !text-dio-muted opacity-60')
                        }
                    >
                        {/* `?` then `&`, so a row of param chips reads like a query string. */}
                        {`${i === 0 ? '?' : '&'}${param.key}=${param.value}`}
                    </button>
                ))}
            </div>

            <p className="mt-1.5 text-[11px] leading-[1.5] text-dio-muted">
                {describePageScope(scope)}{' '}
                {matchesHere ? (
                    <span className="font-semibold text-dio-accent">Matches this page.</span>
                ) : (
                    <span className="font-semibold text-dio-danger">Won’t show on this page.</span>
                )}
            </p>
        </div>
    );
}
