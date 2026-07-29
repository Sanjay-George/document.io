import { useMemo } from 'react';
import { AnchorMeta, AnchorScope, SignalState } from '@/utils/anchor';
import {
    ANCHOR_LEVELS,
    ANCHOR_LEVEL_COPY,
    AnchorLevel,
    anchorPresets,
    anchorVerdict,
    describeAnchorScope,
    levelOfScope,
    scopeSignals,
} from '@/companion/helpers';

type Props = {
    /** Fingerprint captured when the element was picked — the source of truth for
     *  chip labels, so a demoted signal can always be toggled back. */
    anchor: AnchorMeta;
    /** Current per-signal states; `undefined` means the `smart` default. */
    value?: AnchorScope;
    onChange: (scope: AnchorScope | undefined) => void;
};

const NEXT_STATE: Record<SignalState, SignalState> = {
    required: 'hint',
    hint: 'ignored',
    ignored: 'required',
};

/** Tooltips name the *next* click, so the third state is discoverable by hover. */
const HINT: Record<SignalState, string> = {
    required: 'Must match — click to use it only for ranking',
    hint: 'Only breaks ties between near-matches — click to ignore it',
    ignored: 'Ignored — click to require it',
};

/**
 * Click-to-loosen anchor scope — the element-level twin of `PageScopeEditor`.
 * The fingerprint captured with the note is shown as a row of chips; clicking one
 * cycles it through being required, only ranking near-matches, and ignored, which
 * is what moves a note between a strict and a fuzzy match.
 *
 * The three presets set every chip at once; the line underneath restates the
 * result and ends in a coloured verdict. Tuning a single chip reads back as
 * `Custom`.
 *
 * Fully controlled: `value` is the single source of truth and `undefined` is the
 * `smart` default (which the resolver treats as "no stored scope"), so chip
 * labels always come from `anchor`.
 */
export default function AnchorScopeEditor({ anchor, value, onChange }: Props) {
    const signals = useMemo(() => scopeSignals(anchor), [anchor]);
    const presets = useMemo(() => anchorPresets(signals), [signals]);

    const scope = value ?? presets.smart;
    const level = levelOfScope(signals, presets, scope);
    const verdict = anchorVerdict(signals, scope);

    // `smart` is the default, so it emits `undefined` rather than a stored copy.
    const pickLevel = (next: AnchorLevel) => onChange(next === 'smart' ? undefined : presets[next]);
    const cycleSignal = (key: string) =>
        onChange({ ...scope, [key]: NEXT_STATE[scope[key]] });

    const chip = (state: SignalState) =>
        'mx-[1px] my-[1px] max-w-[190px] cursor-pointer truncate rounded-[5px] px-1.5 py-0.5 transition-colors ' +
        (state === 'required'
            ? 'border-none bg-dio-accent font-semibold text-white'
            : state === 'hint'
                ? 'border border-dio-border-field bg-white text-dio-body hover:shadow-dio-card'
                : 'border-none bg-transparent text-dio-muted line-through opacity-60 hover:opacity-100');

    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[.04em] text-dio-muted">
                    Anchors to element
                </span>
                {level !== 'smart' && (
                    <button
                        type="button"
                        onClick={() => onChange(undefined)}
                        className="cursor-pointer border-none bg-transparent p-0 text-[11.5px] font-semibold text-dio-tertiary hover:text-dio-primary"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="flex gap-0.5 rounded-dio-control bg-dio-subtle p-[3px]">
                {ANCHOR_LEVELS.map((option) => {
                    const active = level === option;
                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => pickLevel(option)}
                            title={ANCHOR_LEVEL_COPY[option].meaning}
                            className={
                                'h-[28px] flex-1 cursor-pointer border-none text-[12.5px] font-semibold transition-colors ' +
                                (active
                                    ? 'rounded-dio-tab bg-white text-dio-primary shadow-dio-seg'
                                    : 'rounded-dio-tab bg-transparent text-[#8A93A0] hover:text-dio-body')
                            }
                        >
                            {ANCHOR_LEVEL_COPY[option].label}
                        </button>
                    );
                })}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center rounded-dio-tab border border-dio-border-field bg-dio-subtle px-1.5 py-1 font-dio-mono text-[11.5px] leading-[1.6]">
                {signals.map((signal) => (
                    <button
                        key={signal.key}
                        type="button"
                        onClick={() => cycleSignal(signal.key)}
                        title={`${signal.label} — ${HINT[scope[signal.key]]}`}
                        className={chip(scope[signal.key])}
                    >
                        {signal.label}
                    </button>
                ))}
            </div>

            <p className="mt-1.5 text-[11px] leading-[1.5] text-dio-muted">
                {ANCHOR_LEVEL_COPY[level].meaning} {describeAnchorScope(signals, scope)}{' '}
                <span className={`font-semibold ${verdict.risky ? 'text-dio-danger' : 'text-dio-accent'}`}>
                    {verdict.text}
                </span>
            </p>
        </div>
    );
}
