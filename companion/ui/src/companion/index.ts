// document.io in-context annotation companion — component library.
// Built from design/ (design-tokens.json + Companion v2.dc.html prototype).

export { default as Companion } from '@/companion/Companion';
export type { CompanionHandle, PickedTarget } from '@/companion/Companion';
export { default as CompanionPanel } from '@/companion/CompanionPanel';
export { default as CompanionPanelHeader } from '@/companion/CompanionPanelHeader';
export { default as AnnotationCard } from '@/companion/AnnotationCard';
export { default as AnnotationBanner } from '@/companion/AnnotationBanner';
export { default as Composer } from '@/companion/Composer';
export { default as ConfirmDialog } from '@/companion/ConfirmDialog';
export { default as FormatToolbar } from '@/companion/FormatToolbar';
export { default as Popover } from '@/companion/Popover';
export { default as MinimizedPill } from '@/companion/MinimizedPill';
export { default as Toast } from '@/companion/Toast';
export { default as EmptyState } from '@/companion/EmptyState';
export { default as Badge } from '@/companion/Badge';
export { default as HighlightRing } from '@/companion/HighlightRing';
export { default as SegmentedControl } from '@/companion/SegmentedControl';
export { default as ScopeTabs } from '@/companion/ScopeTabs';
export { default as Checkbox } from '@/companion/Checkbox';
export { default as NumberCircle } from '@/companion/NumberCircle';
export { default as NoteBody } from '@/companion/NoteBody';
export { default as BrandGlyph } from '@/companion/BrandGlyph';
export { default as TextButton } from '@/companion/TextButton';
export { renderMarkdown, snippet } from '@/companion/markdown';
export { contextLabel } from '@/companion/helpers';
export { toNote, toNotes, draftFromAnnotation, draftToAnnotationInput } from '@/companion/adapter';
export type { NoteFlags, AnnotationInput } from '@/companion/adapter';
export type { Note, NoteType, Mode, Tab, Tone, Placement, Draft } from '@/companion/types';
