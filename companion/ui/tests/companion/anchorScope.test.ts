import { describe, expect, it } from 'vitest';
import {
    ANCHOR_LEVEL_COPY,
    anchorLevelOf,
    anchorPresets,
    anchorVerdict,
    describeAnchorScope,
    reanchorScope,
    scopeSignals,
} from '@/companion/helpers';
import { type AnchorMeta } from '@/utils/anchor';

/**
 * The chip-state ↔ strictness codec behind AnchorScopeEditor. Three presets sit
 * on one axis — how much has to still match for the note to keep its element:
 *   Exact  every signal          → breaks on the smallest edit
 *   Smart  the strongest one     → the default, and the only one stored as absent
 *   Loose  nothing               → may land on a lookalike
 * Anything else reads back as `custom`. See docs/anchoring.md.
 */

const START_ANALYSIS: AnchorMeta = {
    selector: '#start-analysis',
    tag: 'button',
    id: 'start-analysis',
    role: 'button',
    ariaLabel: 'Start Analysis',
    text: '📈 Start Analysis',
    attributes: { 'data-testid': 'analysis-btn' },
    context: [{ tag: 'section', id: 'analysis-toolbar', role: 'region' }],
};

const signals = scopeSignals(START_ANALYSIS);
const presets = anchorPresets(signals);

describe('signal keys come from the resolver', () => {
    it('names every captured signal once, position last', () => {
        expect(signals.map((s) => s.key)).toEqual([
            'id',
            'attr:data-testid',
            'aria',
            'text',
            'tag',
            'role',
            'ctx:0',
            'position',
        ]);
    });
});

describe('presets round-trip through anchorLevelOf', () => {
    it('reads each preset back as itself', () => {
        expect(anchorLevelOf(START_ANALYSIS, presets.exact)).toBe('exact');
        expect(anchorLevelOf(START_ANALYSIS, presets.smart)).toBe('smart');
        expect(anchorLevelOf(START_ANALYSIS, presets.loose)).toBe('loose');
    });

    it('reads an absent scope as Smart — the default is stored as nothing', () => {
        expect(anchorLevelOf(START_ANALYSIS, undefined)).toBe('smart');
    });

    it('reads one changed chip as custom', () => {
        const tweaked = { ...presets.smart, tag: 'required' as const };
        expect(anchorLevelOf(START_ANALYSIS, tweaked)).toBe('custom');
    });
});

describe('what each preset requires', () => {
    it('Exact requires every signal', () => {
        expect(Object.values(presets.exact).every((s) => s === 'required')).toBe(true);
    });

    it('Smart requires only the strongest — here the id', () => {
        const required = signals.filter((s) => presets.smart[s.key] === 'required');
        expect(required.map((s) => s.key)).toEqual(['id']);
    });

    it('Loose requires nothing and drops the structural signals', () => {
        expect(Object.values(presets.loose)).not.toContain('required');
        expect(presets.loose.position).toBe('ignored');
        expect(presets.loose['ctx:0']).toBe('ignored');
    });
});

describe('every mix states its own consequence', () => {
    it('names the one signal that must match', () => {
        expect(describeAnchorScope(signals, presets.smart)).toContain('Must match #start-analysis');
    });

    it('states a mostly-required mix by its exception, not its list', () => {
        const allButPosition = { ...presets.exact, position: 'hint' as const };
        expect(describeAnchorScope(signals, allButPosition)).toBe(
            'Everything has to still match except its exact place in the page.',
        );
    });

    it('warns on both ends of the axis and not in the middle', () => {
        expect(anchorVerdict(signals, presets.exact).risky).toBe(true);
        expect(anchorVerdict(signals, presets.loose).risky).toBe(true);
        expect(anchorVerdict(signals, presets.smart).risky).toBe(false);
    });

    it('has copy for every level the editor can show', () => {
        expect(Object.keys(ANCHOR_LEVEL_COPY)).toEqual(['exact', 'smart', 'loose', 'custom']);
    });
});

describe('re-anchoring drops the scope', () => {
    // The scope is keyed by the *old* element's signals; the new element has its
    // own, so carrying it over would gate on keys that no longer name anything.
    it('resets it even when the note stays on the same page', () => {
        const existing = { url: '/en/report/a', urlPattern: '/en/report/*' };
        const moved = reanchorScope(existing, '/en/report/b');

        expect(moved.movesPage).toBe(false);
        expect(moved.urlPattern).toBe('/en/report/*'); // still in its own family
        expect(moved.anchorScope).toBeUndefined(); // but the element changed
    });
});
