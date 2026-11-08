# Coding Conventions

These conventions reflect the actual patterns in this codebase. Follow them when adding or modifying code. When in doubt, look at existing code first — the answer is probably already there.

---

## Core Principles

**KISS — Keep It Simple, Silly**  
Every piece of code should do one thing and be easy to understand at a glance. Avoid clever abstractions, unnecessary layers of indirection, and over-engineered solutions. If you need a long comment to explain what code does, simplify the code instead.

**YAGNI — You Ain't Gonna Need It**  
Only build what is needed right now. Do not add props, configuration options, utility helpers, or abstractions for hypothetical future use cases. If a need arises later, add it then.

**Reuse before you write**  
Before creating a new component, hook, utility, or type — search the codebase. There is likely something that already does what you need, or can be extended minimally. Duplicate code is a last resort, not a starting point.

---

## File & Folder Structure

```
ui/src/
  components/   # Reusable, presentational UI pieces
  views/        # Routed, container-style pages
  data_access/  # SWR hooks and fetch/mutate functions
  models/       # TypeScript interfaces and enums
  utils/        # Pure helper functions and constants
```

- **Components** are reusable and presentational. They do not fetch data.
- **Views** are page-level containers. They own state, data fetching, and routing logic.
- When something belongs in `utils/`, check whether it belongs in `utils/index.ts`, `utils/annotations.ts`, or `utils/constants.ts` before creating a new file.

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `AnnotationCard.tsx` |
| View files | PascalCase + `View` suffix | `AnnotationListView.tsx` |
| Icon components | PascalCase + `Icon` suffix | `AddIcon.tsx` |
| Data access files | lowercase, singular domain | `annotations.ts` |
| Model files | lowercase | `annotations.ts` |
| Utility files | lowercase | `constants.ts` |

---

## Components

All components are plain functions with `export default`. Use `type` for props.

```tsx
type Props = {
    label: string;
    onClick?: () => void;
};

export default function MyComponent({ label, onClick }: Props) {
    return <button onClick={onClick}>{label}</button>;
}
```

- Prefer `type` over `interface` for component props.
- Use `interface` for data model shapes (e.g., in `models/`).
- Do not add an explicit return type to components — let TypeScript infer it.
- Do not create a new base component when an existing one can be reused or composed. Check `ButtonBase`, `Card`, `ButtonPrimary`, `ButtonDanger` before writing new buttons or containers.

---

## Styling

In `ui/src` (the React UI), Tailwind utility classes are the primary styling mechanism. Do not use inline `style=` objects or CSS Modules there unless computing a value that Tailwind cannot express (e.g., a dynamic pixel value).

```tsx
// Good
<div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">

// Bad
<div style={{ display: 'flex', gap: '8px' }}>
```

**Conditional classes** use template literals with ternary operators:

```tsx
className={`px-3 py-1 rounded-md ${isActive ? 'bg-white' : 'hover:bg-gray-100'}`}
```

Use the `!` prefix to override specificity when needed (`!bg-white`, `!text-primary`), but prefer specificity through class ordering first.

---

## Imports

- Use the `@/` path alias for all local imports. Never use relative `../../` paths.
- External library imports come first, then `@/` imports. No blank lines between groups.

```ts
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Annotation } from '@/models/annotations';
import ButtonPrimary from '@/components/ButtonPrimary';
```

---

## State Management

Use React's built-in hooks. Do not introduce a state management library.

- `useState` — local component state
- `useContext` — consuming `DocumentationContext`, `PanelOrientationContext`, `PanelSizeContext`
- `useEffect` — side effects with cleanup
- `useMemo` — memoize expensive derived values only (not premature optimization)
- React Router hooks (`useNavigate`, `useParams`, `useSearchParams`) — for routing and URL state

Keep state as local as possible. Only lift state if two or more components genuinely need it.

---

## Data Fetching

Use SWR via the custom hooks in `data_access/`. Do not call `fetch` directly inside components.

```ts
// data_access/annotations.ts
export const useAnnotations = (documentationId: string) => {
    if (!documentationId) {
        useSWR(null);
        return { data: [], isLoading: false, error: 'Documentation ID not provided' };
    }
    return useSWR(ALL_ANNOTATIONS_KEY(documentationId), fetcher);
};
```

- Cache keys are exported functions: `ALL_ANNOTATIONS_KEY(id)`, `SINGLE_ANNOTATION_KEY(id)`.
- Mutations call `mutate(cacheKey)` after the fetch to invalidate.
- The API URL is resolved once via `import.meta.env.VITE_APP_ENV`, not repeated inline.

---

## Models

Define data shapes in `models/` as interfaces. Use union string literals for bounded variants; use enums for named constants with semantic meaning.

```ts
// models/annotations.ts
export interface Annotation {
    id?: string;
    value: string;
    type: 'page' | 'component';
    // ...
}

// models/panelOrientation.ts
export enum PanelOrientation {
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal',
}
```

Do not duplicate type definitions across files. If a type already exists in `models/`, import it.

---

## Utilities

- `utils/constants.ts` — string/value constants shared across the app (DOM class names, IDs)
- `utils/annotations.ts` — DOM manipulation helpers specific to annotation highlighting
- `utils/index.ts` — general-purpose helpers (`sortAnnotations`, `renderTitleFromValue`, etc.)

Add to an existing utils file before creating a new one. A new utils file is only justified when its domain is clearly distinct from all existing files.

Document non-obvious utility functions with a JSDoc comment:

```ts
/**
 * Highlights the annotated element and optionally adds a view icon.
 * @param element - Element to highlight
 * @param showIcon - If true, attaches an icon for viewing the annotation
 */
export function highlight(element: Element, showIcon: boolean) { ... }
```

---

## What to Avoid

- Do not add props, state, or configuration "just in case" — YAGNI.
- Do not create a new component for something that renders in one place — inline it.
- Do not abstract two things that happen to look similar. Wait until the pattern is clear and the third instance appears.
- Do not add error handling for cases that cannot realistically occur in the current architecture.
- Do not use `any` — type things properly or use `unknown` with a guard.
- Do not bypass the data access layer by fetching from inside a component.
