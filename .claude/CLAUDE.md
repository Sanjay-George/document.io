## The North Star

Following these strictly:

### Don't overdocument (FOLLOW THIS STRICTLY!!!)
Don't write lengthy paragraph style documentation, over-explaining the code. The target user is developers. Prefer documentation in the following order of precedence:
- Well named methods, classes, variables. (best!)
- docstrings explaining method signature, especially for public / exported methods. Maybe a one-liner about what the method does.
- Short, concise comments (not more than 1 line, 10-15 words) for parts of code that NEEDs explanation (eg: complex / weird logic).

## Storybook

Reference: `companion/ui/src/companion/*.stories.tsx` and `ui/components/hub/*.stories.tsx`.

- **Keep stories in sync.** Every presentational component has a co-located `*.stories.tsx`. Add/adjust stories when you add a component, prop, or visual state.
- **Cover states that matter (KISS/YAGNI)** — not every prop combination.
- **1–3 stories per component. Never one story per prop value:**
  - `Default` — the canonical instance, args-driven so `argTypes` controls reach the other states. A state reachable by flipping a control does not get its own story.
  - `Variants` — only when seeing states *side by side* is the point (a variant set that must stay consistent, a tone scale).
  - At most one more, for a genuinely distinct mode that can't share a frame (`ReadOnly`, an integration-seam harness).
- **Titles are hierarchical:** `<Area>/Primitives/*` (small pieces) and `<Area>/Components/*` (e.g. `Hub/`, `Companion/`).
- **Type it:** `const meta = { ... } satisfies Meta<typeof C>` + `type Story = StoryObj<typeof meta>`.
- **Document via JSDoc** on `meta` and individual stories (feeds `autodocs`); expose props with `argTypes` controls.
- **Interactive states use a `render` harness with `useState`** — never `alert()` or no-op handlers; echo the resulting state instead.
- **Use decorators to stage** the component (relative host, surface, dock). In `ui/` all colors come from tokens (`var(--dio-*)`), never hardcoded hex.
- **Share realistic sample data** via a `fixtures.ts` (see companion).
- **Don't storybook** data-connected/host-integration roots or non-visual utilities (icons, markdown, adapters).