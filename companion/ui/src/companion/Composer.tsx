import { useEffect, useRef, useState } from 'react';
import { Draft } from '@/companion/types';
import { contextLabel } from '@/companion/helpers';
import FormatToolbar, { type FormatToken } from '@/companion/FormatToolbar';
import PageScopeEditor from '@/companion/PageScopeEditor';
import { CloseIcon, ComponentIcon, FormatIcon, PageIcon } from '@/companion/icons';

type Props = {
    /** `new` titles the modal "New note"; `edit` titles it "Edit note". */
    mode: 'new' | 'edit';
    draft: Draft;
    onChange: (patch: Partial<Draft>) => void;
    onSave: () => void;
    onClose: () => void;
};

const SNIPPETS = new Map<FormatToken, string>([
    ['h', '\n## Heading\n'],
    ['b', '**bold**'],
    ['i', '*italic*'],
    ['list', '\n- item\n'],
    ['quote', '\n> quote\n'],
    ['code', '`code`'],
]);

/**
 * New / Edit note composer (README §7). Surfaces the real anchor target, the
 * page-scope editor, a title + body, and an optional Markdown toolbar.
 */
export default function Composer({ mode, draft, onChange, onSave, onClose }: Props) {
    const [showFmt, setShowFmt] = useState(false);
    const isPage = draft.type === 'page';

    // Focus the title on open so stray keystrokes land here, not on host-page
    // keyboard shortcuts (e.g. GitHub's "s"/"/" search) that would re-pick the anchor.
    const titleRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    const insert = (token: FormatToken) => {
        const body = draft.body;
        const sep = body && !body.endsWith('\n') && !body.endsWith(' ') ? ' ' : '';
        onChange({ body: body + sep + (SNIPPETS.get(token) ?? '') });
    };

    return (
        <div
            className="fixed inset-0 z-[2147483002] flex items-center justify-center bg-[rgba(20,23,31,.25)] p-6 pr-[400px] backdrop-blur-[1.5px]"
        >
            <div
                className="animate-dio-pop-lg w-[436px] max-w-full overflow-hidden rounded-dio-modal bg-white font-dio-ui shadow-dio-composer"
            >
                <div className="flex items-center justify-between px-[18px] pb-[14px] pt-4">
                    <span className="text-[15px] font-semibold text-dio-primary">
                        {mode === 'edit' ? 'Edit note' : 'New note'}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-dio-tab border-none bg-transparent text-dio-muted hover:bg-dio-subtle"
                    >
                        <CloseIcon size={16} />
                    </button>
                </div>

                <div className="px-[18px] pb-[18px]">
                    {/* real anchor target */}
                    <div className="flex items-center gap-[9px] rounded-dio-banner bg-dio-tint-orange px-[13px] py-[11px]">
                        {isPage ? (
                            <PageIcon size={15} className="flex-none text-dio-accent" />
                        ) : (
                            <ComponentIcon size={15} className="flex-none text-dio-accent" />
                        )}
                        <code
                            title={contextLabel(draft)}
                            className="min-w-0 flex-1 truncate font-dio-mono text-[11.5px] leading-[1.5] text-dio-accent-ink-mono"
                        >
                            {contextLabel(draft)}
                        </code>
                    </div>

                    {/* page scope — click segments to wildcard which URL(s) apply */}
                    <div className="mt-3">
                        <PageScopeEditor
                            url={draft.url}
                            value={draft.urlPattern}
                            onChange={(urlPattern) => onChange({ urlPattern })}
                        />
                    </div>

                    <input
                        ref={titleRef}
                        value={draft.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="Title"
                        className="mt-4 h-[42px] w-full border-none border-b-[1.5px] border-dio-border-field px-0.5 text-[16px] font-semibold text-dio-primary outline-none focus:border-dio-accent"
                    />

                    <textarea
                        value={draft.body}
                        onChange={(e) => onChange({ body: e.target.value })}
                        placeholder="Write the note…"
                        className="h-[110px] w-full resize-none border-none px-0.5 pt-3 text-[14px] leading-[1.6] text-dio-body outline-none"
                    />

                    {showFmt && <FormatToolbar onInsert={insert} />}

                    <div className="mt-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setShowFmt((v) => !v)}
                            className="inline-flex cursor-pointer items-center gap-[5px] border-none bg-transparent p-0 font-dio-ui text-[12.5px] font-semibold text-dio-muted hover:text-dio-secondary"
                        >
                            <FormatIcon size={15} />
                            Format
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            className="h-[38px] cursor-pointer rounded-dio-button border-none bg-dio-accent px-[18px] text-[13.5px] font-semibold text-white hover:bg-dio-accent-hover"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
