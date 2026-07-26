# CLAUDE.md

Guidance for working in this repo.

## Companion UI (`ui/src/companion/`)

The in-context annotation companion is built from a design-accurate component
library. `CompanionContainer` (data-connected root) and `HostOverlay` (on-page
badges/rings/popover) wire the presentational components to the SWR data layer.

### Tasks / conventions

- **Keep Storybook in sync with the UI.** Every presentational companion
  component has a `*.stories.tsx` under **Companion/** in Storybook. When you
  add or change a companion UI component, update its story too — add a story for
  a new component, and add/adjust variants when you introduce a prop or visual
  state.
  - Follow **KISS / YAGNI**: cover the states that matter, don't enumerate every
    prop combination.
  - Data-connected / host-integration components (`CompanionContainer`,
    `HostOverlay`) and non-visual utility modules (`icons`, `markdown`) are
    intentionally **not** storybooked.
