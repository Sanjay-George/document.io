import { Mode, Tab } from '@/companion/types';
import { PanelOrientation } from '@/models/panelOrientation';
import BrandGlyph from '@/companion/BrandGlyph';
import SegmentedControl from '@/companion/SegmentedControl';
import ScopeTabs from '@/companion/ScopeTabs';
import { LayoutHorizontalIcon, LayoutVerticalIcon, MinimizeIcon } from '@/companion/icons';

type Props = {
    /** The active note-set title shown under the wordmark. */
    title: string;
    mode: Mode;
    onModeChange: (mode: Mode) => void;
    onMinimize: () => void;
    tab: Tab;
    onTabChange: (tab: Tab) => void;
    countAll: number;
    /** Read-only export view: hide the mode toggle and scope tabs. */
    readOnly?: boolean;
    /** Current dock orientation; omit to hide the orientation toggle. */
    orientation?: PanelOrientation;
    onOrientationChange?: (orientation: PanelOrientation) => void;
};

/**
 * Fixed header of the docked panel: brand row + title, then the mode toggle and
 * (in Read mode) the scope tabs (README §1).
 */
export default function CompanionPanelHeader({
    title,
    mode,
    onModeChange,
    onMinimize,
    tab,
    onTabChange,
    countAll,
    readOnly = false,
    orientation,
    onOrientationChange,
}: Props) {
    const iconBtn =
        'flex h-[30px] w-[30px] flex-none cursor-pointer items-center justify-center rounded-dio-chip border-none bg-transparent';

    return (
        <div className="px-[18px] pb-[13px] pt-4">
            <div className="flex items-start justify-between gap-[10px]">
                <div>
                    <div className="mb-[7px] flex items-center gap-[7px]">
                        <BrandGlyph size={8} className="text-dio-accent" />
                        <span className="font-dio-mono text-[11px] font-medium tracking-[.02em] text-dio-faint">
                            document.io
                        </span>
                    </div>
                    <div className="text-[16.5px] font-semibold leading-[1.25] tracking-[-.01em] text-dio-primary">
                        {title}
                    </div>
                </div>
                <div className="flex flex-none items-center gap-0.5">
                    {orientation && onOrientationChange && (
                        <>
                            <button
                                type="button"
                                onClick={() => onOrientationChange(PanelOrientation.VERTICAL)}
                                title="Dock right"
                                aria-pressed={orientation === PanelOrientation.VERTICAL}
                                className={`${iconBtn} ${
                                    orientation === PanelOrientation.VERTICAL
                                        ? 'bg-dio-subtle text-dio-primary'
                                        : 'text-dio-faint hover:bg-dio-subtle hover:text-dio-muted'
                                }`}
                            >
                                <LayoutVerticalIcon size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onOrientationChange(PanelOrientation.HORIZONTAL)}
                                title="Dock bottom"
                                aria-pressed={orientation === PanelOrientation.HORIZONTAL}
                                className={`${iconBtn} ${
                                    orientation === PanelOrientation.HORIZONTAL
                                        ? 'bg-dio-subtle text-dio-primary'
                                        : 'text-dio-faint hover:bg-dio-subtle hover:text-dio-muted'
                                }`}
                            >
                                <LayoutHorizontalIcon size={16} />
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={onMinimize}
                        title="Minimize"
                        className={`${iconBtn} text-dio-muted hover:bg-dio-subtle`}
                    >
                        <MinimizeIcon size={16} />
                    </button>
                </div>
            </div>

            {!readOnly && (
                <div className="mt-[14px] flex items-center justify-between">
                    <SegmentedControl value={mode} onChange={onModeChange} />
                    {mode === 'view' && <ScopeTabs value={tab} onChange={onTabChange} countAll={countAll} />}
                </div>
            )}
        </div>
    );
}
