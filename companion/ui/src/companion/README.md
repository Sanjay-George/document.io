# Companion component library

React implementation of the **document.io in-context annotation companion**,
built from the hi-fi design in [`design/`](../../../design) (`design-tokens.json`
+ the `Companion v2.dc.html` prototype). These are new, self-contained
components intended to replace the current `src/components` companion pieces.

> The demo "Halyard" host page in the prototype is **not** reproduced here — only
> the companion itself.

## Design tokens

Tokens live in the Tailwind config under the `dio-*` namespace
(`tailwind.config.js` → `theme.extend`), so components style themselves with
utility classes: `bg-dio-accent`, `text-dio-primary`, `rounded-dio-card`,
`shadow-dio-popover`, `animate-dio-pop`, `font-dio-ui`, `font-dio-mono`, … The
webfonts (Instrument Sans + JetBrains Mono) are imported from
[`fonts.css`](./fonts.css).

## Components

| Component | Role (README §) |
|---|---|
| `Companion` | Stateful orchestrator: mode/scope/minimize, note CRUD, composer, toasts, re-anchor flow |
| `CompanionPanel` | Docked 376px panel — header + scrolling card list (§1) |
| `CompanionPanelHeader` | Brand row, title, mode toggle, scope tabs (§1) |
| `SegmentedControl` | Read / Annotate toggle, panel + pill skins (§2) |
| `ScopeTabs` | "This page" / "All N" scope filter (§3) |
| `Badge` | On-page numbered pin — idle / selected / flashing (§4) |
| `HighlightRing` | Inset ring tracing the target element (§4) |
| `AnnotationCard` | List item — collapsed / expanded / broken (§5) |
| `Popover` | In-context popover next to the selected element (§6) |
| `Composer` | New / Edit note modal with Markdown toolbar (§7) |
| `FormatToolbar` | Markdown insert controls |
| `Checkbox` | "Whole page" scope checkbox |
| `MinimizedPill` | Collapsed companion pill (§8) |
| `Toast` | Success / warn toast (§9) |
| `EmptyState` | "Nothing here yet" (§10) |
| `AnnotationBanner` | Annotate / re-anchor prompt banner |
| `NoteBody`, `NumberCircle`, `BrandGlyph`, `TextButton` | Shared primitives |
| `renderMarkdown`, `snippet` | Note-body Markdown rendering |

Everything is re-exported from [`index.ts`](./index.ts).

## Anchoring (host integration)

Resolving selectors to live DOM elements — positioning badges/rings/popovers and
detecting stale notes — is the host's responsibility (see README §Anchoring).
The host drives note creation and re-anchoring through the `Companion` ref:

```tsx
const ref = useRef<CompanionHandle>(null);
// when the user clicks an element on the page in Annotate mode:
ref.current?.pickTarget({ selector, url, type: 'component' });
```

## Replacing the existing components

These components are designed to drop in over the current routed views. The
[`adapter`](./adapter.ts) maps the persisted `Annotation` model to the `Note`
view-model, so the container keeps using `data_access/annotations`:

```tsx
import { toNotes, draftToAnnotationInput } from '@/companion';

// Annotation[] (SWR) → Note[] the panel renders, numbered + flagged for the page
const notes = toNotes(annotations, (a) => ({
  onPage: isOnPage(a),          // reuse AnnotationListView's inPageFilter
  broken: !elementExists(a.target),
}));
```

| Existing | Replaced by |
|---|---|
| `AnnotationListView` + `AnnotationList` | container using `CompanionPanel` |
| `AnnotationCard` (routed, per-card highlight) | `AnnotationCard` (collapsed/expanded/broken) |
| `AnnotationPopup` (draggable, add/edit/view) | `Popover` (view) + `Composer` (add/edit) |
| `AnnotationEditor` (MDEditor) | `Composer` + `FormatToolbar` |
| `AnnotationFilterTabs` | `ScopeTabs` |
| `EditModeTabs` | `SegmentedControl` |
| `SidePanelHeader` | `CompanionPanelHeader` |
| `MinimizedPill` (existing) | `MinimizedPill` (new) |

Field mapping: `Annotation.target → selector`, `value → body`,
`title`/`value → title` (derived when absent), `type` unchanged
(`'page' | 'component'`). `n`, `onPage` and `broken` are resolved by the
container, not stored.

**Dock orientation** is supported: `CompanionPanel` takes an `orientation`
(`PanelOrientation.VERTICAL` = dock right, `HORIZONTAL` = dock bottom) plus
`onOrientationChange`, and `Companion` owns the state (`initialOrientation`). The
header shows the toggle, and the body switches to a responsive multi-column grid
(via container queries) when docked bottom.

**Not carried over from the current UI** (intentionally dropped in the redesign):
drag-to-reorder (`AnnotationListReorderable`), `comments`, and the popover's
prev/next stepper. The redesign also introduces a dedicated note **title** (added
as optional `Annotation.title`); until the backend stores it, the adapter derives
the title from `value`.

## Storybook

Every component has a story under **Companion/** in Storybook.

```bash
npm run storybook        # dev server on :6006
npm run build-storybook  # static build
```
