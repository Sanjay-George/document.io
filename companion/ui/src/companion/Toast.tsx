import { Tone } from '@/companion/types';

type Props = {
    text: string;
    tone?: Tone;
};

/**
 * Fixed top-centre toast (README §9). The default (ok) tone auto-dismisses in
 * the orchestrator; the warn tone persists until the state changes.
 */
export default function Toast({ text, tone = 'ok' }: Props) {
    const warn = tone === 'warn';
    return (
        <div
            className={`animate-dio-toast fixed left-1/2 top-5 z-[2147483004] flex -translate-x-1/2 items-center gap-[9px] rounded-dio-button px-4 py-2.5 font-dio-ui text-[13px] font-medium shadow-dio-toast ${
                warn ? 'border border-dio-danger-border bg-dio-danger-bg text-dio-danger' : 'bg-dio-ink text-white'
            }`}
        >
            <span className={`h-2 w-2 flex-none rounded-full ${warn ? 'bg-dio-danger-2' : 'bg-dio-success'}`} />
            {text}
        </div>
    );
}
