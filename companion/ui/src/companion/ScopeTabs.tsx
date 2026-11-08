import { Tab } from '@/companion/types';

type Props = {
    value: Tab;
    onChange: (tab: Tab) => void;
    /** Total annotation count shown next to "All". */
    countAll: number;
};

/**
 * "This page" / "All N" scope tabs shown in Read mode (README §3).
 */
export default function ScopeTabs({ value, onChange, countAll }: Props) {
    const tab = (active: boolean) =>
        `cursor-pointer border-none bg-transparent p-0 font-dio-ui text-[12.5px] ${
            active ? 'font-semibold text-dio-primary' : 'font-medium text-dio-faint'
        }`;

    return (
        <div className="flex items-center gap-3">
            <button type="button" onClick={() => onChange('page')} className={tab(value === 'page')}>
                This page
            </button>
            <button type="button" onClick={() => onChange('all')} className={tab(value === 'all')}>
                All {countAll}
            </button>
        </div>
    );
}
