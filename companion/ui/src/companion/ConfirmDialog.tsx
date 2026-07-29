type Props = {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

/**
 * Small centred confirmation modal for destructive actions (e.g. deleting a
 * note). Sits above the on-page badges so it is never occluded. Clicking the
 * backdrop cancels.
 */
export default function ConfirmDialog({
    title = 'Delete note',
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}: Props) {
    return (
        <div
            onClick={onCancel}
            className="fixed inset-0 z-[2147483003] flex items-center justify-center bg-[rgba(20,23,31,.35)] p-6 backdrop-blur-[1.5px]"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-dio-pop-lg w-[360px] max-w-full overflow-hidden rounded-dio-modal bg-white font-dio-ui shadow-dio-composer"
            >
                <div className="px-5 pb-[18px] pt-[18px]">
                    <div className="text-[15px] font-semibold text-dio-primary">{title}</div>
                    <div className="mt-2 break-words text-[13.5px] leading-[1.55] text-dio-muted">
                        {message}
                    </div>
                    <div className="mt-[18px] flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="h-[36px] cursor-pointer rounded-dio-button border-none bg-dio-subtle px-4 text-[13px] font-semibold text-dio-secondary hover:bg-dio-border-field"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="h-[36px] cursor-pointer rounded-dio-button border-none bg-dio-danger px-4 text-[13px] font-semibold text-white hover:bg-dio-danger-2"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
