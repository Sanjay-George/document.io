import { Fragment, type ReactNode } from 'react';
import { safeUrl } from '@/companion/helpers';

/**
 * Minimal Markdown renderer for note bodies. Supports the subset documented in
 * design/README.md — inline **bold**, *italic*, `code`, [link](url); block
 * `## heading`, `- list`, `> quote`, and paragraphs. Output is built as React
 * nodes (never raw HTML), so it is safe by construction.
 */

const INLINE = /(\*\*(.+?)\*\*)|(`(.+?)`)|(\*(.+?)\*)|(\[(.+?)\]\((.+?)\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    let i = 0;
    INLINE.lastIndex = 0;
    while ((match = INLINE.exec(text)) !== null) {
        if (match.index > last) {
            nodes.push(<Fragment key={`${keyPrefix}-t${i}`}>{text.slice(last, match.index)}</Fragment>);
        }
        const key = `${keyPrefix}-m${i}`;
        // Capture groups are typed as `string` but are `undefined` when their
        // alternative didn't match, so widen before probing which one hit.
        const groups: (string | undefined)[] = match;
        if (groups[2] !== undefined) {
            nodes.push(<strong key={key} className="font-semibold text-dio-primary">{groups[2]}</strong>);
        } else if (groups[4] !== undefined) {
            nodes.push(
                <code key={key} className="rounded-dio-checkbox bg-dio-subtle px-[5px] py-px font-dio-mono text-[.86em] text-dio-accent-deep">
                    {groups[4]}
                </code>,
            );
        } else if (groups[6] !== undefined) {
            nodes.push(<em key={key}>{groups[6]}</em>);
        } else if (groups[8] !== undefined) {
            const href = safeUrl(groups[9] ?? '');
            nodes.push(
                href !== null ? (
                    <a
                        key={key}
                        href={href}
                        className="border-b border-dio-accent/35 text-dio-accent no-underline"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {groups[8]}
                    </a>
                ) : (
                    <Fragment key={key}>{groups[8]}</Fragment>
                ),
            );
        }
        last = match.index + match[0].length;
        i += 1;
    }
    if (last < text.length) {
        nodes.push(<Fragment key={`${keyPrefix}-t${i}`}>{text.slice(last)}</Fragment>);
    }
    return nodes;
}

export function renderMarkdown(text: string): ReactNode {
    if (!text) return null;
    const lines = text.split('\n');
    const blocks: ReactNode[] = [];
    let list: ReactNode[] | null = null;
    let key = 0;

    const flushList = () => {
        if (list) {
            blocks.push(<ul key={`b${key++}`} className="my-[7px] list-disc pl-[18px]">{list}</ul>);
            list = null;
        }
    };

    lines.forEach((line, idx) => {
        if (/^\s*$/.test(line)) {
            flushList();
        } else if (/^##\s+/.test(line)) {
            flushList();
            blocks.push(
                <div key={`b${key++}`} className="mb-1 mt-[10px] text-[12.5px] font-semibold text-dio-primary">
                    {renderInline(line.replace(/^##\s+/, ''), `h${idx}`)}
                </div>,
            );
        } else if (/^>\s+/.test(line)) {
            flushList();
            blocks.push(
                <blockquote key={`b${key++}`} className="my-[9px] border-l-[3px] border-[#E4C4B4] py-1.5 pl-3 italic text-[#7A7266]">
                    {renderInline(line.replace(/^>\s+/, ''), `q${idx}`)}
                </blockquote>,
            );
        } else if (/^[-*]\s+/.test(line)) {
            if (!list) list = [];
            list.push(
                <li key={`l${idx}`} className="my-[3px]">
                    {renderInline(line.replace(/^[-*]\s+/, ''), `li${idx}`)}
                </li>,
            );
        } else {
            flushList();
            blocks.push(
                <p key={`b${key++}`} className="mb-[10px]">
                    {renderInline(line, `p${idx}`)}
                </p>,
            );
        }
    });
    flushList();
    return blocks;
}

/** Strip Markdown syntax down to a single line for collapsed-card snippets. */
export function snippet(text: string): string {
    return (text || '')
        .replace(/[#>*`\-]/g, '')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        .replace(/\n+/g, ' ')
        .trim();
}
