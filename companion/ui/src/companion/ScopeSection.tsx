import { useState } from 'react';
import { Draft } from '@/companion/types';
import { AnchorLevel, anchorLevelOf, anchorName, contextLabel, toRelativeUrl } from '@/companion/helpers';
import PageScopeEditor from '@/companion/PageScopeEditor';
import AnchorScopeEditor from '@/companion/AnchorScopeEditor';
import { ChevronDownIcon, ComponentIcon, PageIcon } from '@/companion/icons';

type Props = {
    draft: Pick<Draft, 'type' | 'selector' | 'url' | 'urlPattern' | 'anchor' | 'anchorScope'>;
    onChange: (patch: Partial<Draft>) => void;
    /** Start expanded — for stories and for a future "edit scope" entry point. */
    initialOpen?: boolean;
};

/** What each preset means for the digest, in words that need no prior reading.
 *  `smart` is the default and says nothing — a line only earns space by being a
 *  deliberate choice. */
const MATCH_NOTE: Record<AnchorLevel | 'custom', string | undefined> = {
    smart: undefined,
    exact: 'exact match only',
    loose: 'closest match',
    custom: 'custom match',
};

/** Elide leading path segments — the tail is where the wildcards live. */
function shortPath(path: string, keep = 3): string {
    const [pathname, query] = path.split('?');
    const segments = pathname.split('/').filter(Boolean);
    const head = segments.length > keep ? `…/${segments.slice(-keep).join('/')}` : `/${segments.join('/')}`;
    return head + (query ? `?${query}` : '');
}

/**
 * The composer's "where does this note apply" section: what the note is anchored
 * to, which pages it covers, and how strictly it re-finds its element.
 *
 * Both editors are tall and both are correct by default, so they collapse into
 * the anchor banner, which doubles as the disclosure. The digest labels each of
 * its values and hides again while open, where the editors state them in full.
 */
export default function ScopeSection({ draft, onChange, initialOpen = false }: Props) {
    const [open, setOpen] = useState(initialOpen);
    const isPage = draft.type === 'page';

    // A reader recognises the element by its own words, not by its tag name.
    const name = anchorName(draft.anchor);
    const target = isPage ? 'the whole page' : name ? `“${name}”` : contextLabel(draft);
    const Target = isPage || name ? 'span' : 'code';
    // The glob reads with the same `∗` the chips use; params show only when required.
    const pages = shortPath((draft.urlPattern ?? toRelativeUrl(draft.url)).replace(/\*/g, '∗'));
    const level = draft.anchor ? anchorLevelOf(draft.anchor, draft.anchorScope) : undefined;
    const matchNote = level && MATCH_NOTE[level];

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                title={open ? 'Hide scope' : 'Change which pages and elements this note applies to'}
                className="flex w-full cursor-pointer items-center gap-[9px] rounded-dio-banner border-none bg-dio-tint-orange px-[13px] py-[10px] text-left hover:bg-dio-tint-orange-2"
            >
                {isPage ? (
                    <PageIcon size={15} className="flex-none text-dio-accent" />
                ) : (
                    <ComponentIcon size={15} className="flex-none text-dio-accent" />
                )}

                <span className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-1.5 text-[12px] leading-[1.55]">
                    <span className="text-dio-accent-ink-soft">Pinned to</span>
                    <span className="flex min-w-0 items-baseline gap-1.5">
                        {/* Mono is for identifiers — a name the user can read is prose. */}
                        <Target title={target} className={`truncate text-dio-accent-ink ${Target === 'code' ? 'font-dio-mono text-[11.5px]' : ''}`}>
                            {target}
                        </Target>
                        {matchNote && (
                            <span className="flex-none text-[11px] text-dio-accent-ink-mono">· {matchNote}</span>
                        )}
                    </span>

                    {!open && (
                        <>
                            <span className="text-dio-accent-ink-soft">Shows on</span>
                            <span
                                title={pages}
                                className={`truncate font-dio-mono text-[11.5px] text-dio-accent-ink-mono ${
                                    draft.urlPattern ? 'font-semibold' : ''
                                }`}
                            >
                                {pages}
                            </span>
                        </>
                    )}
                </span>

                <ChevronDownIcon
                    size={14}
                    className={`flex-none text-dio-accent-ink-soft transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="mt-1.5 space-y-3 rounded-dio-banner border border-dio-border-field p-3">
                    <PageScopeEditor
                        url={draft.url}
                        value={draft.urlPattern}
                        onChange={(urlPattern) => onChange({ urlPattern })}
                    />
                    {draft.anchor && (
                        <AnchorScopeEditor
                            anchor={draft.anchor}
                            value={draft.anchorScope}
                            onChange={(anchorScope) => onChange({ anchorScope })}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
