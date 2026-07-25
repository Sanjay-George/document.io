# CLAUDE.md

Guidance for working in the `ui/` app (Next.js App Router + HeroUI + Tailwind).

## Colors: tokens only — no custom colors

**All theme colors live in a single source of truth: [`app/tokens.css`](app/tokens.css).**
Never hardcode a color anywhere else.

- **No custom/arbitrary colors.** Do not use hex, `rgb()`, `rgba()`, or `hsl()`
  literals in components, CSS, or config. Do not use Tailwind arbitrary color
  values (`bg-[#DD6234]`, `text-[rgb(...)]`) or off-palette default utilities
  (`text-slate-400`, `bg-zinc-100`).
- **Use semantic Tailwind classes** that map to tokens: `bg-primary`,
  `hover:bg-primary-hover`, `text-primary-foreground`, `bg-background`,
  `text-foreground`, `text-muted-foreground`, `border-border`, `bg-destructive`,
  etc. These are wired in [`tailwind.config.ts`](tailwind.config.ts).
- **In scoped CSS** (`landing.css`, `hub.css`) reference tokens directly:
  `hsl(var(--brand))`, `hsl(var(--ink))`, or with alpha `hsl(var(--brand) / .4)`.

### Adding or changing a color

1. Add/adjust the token in `app/tokens.css` only. Values are HSL channel
   triplets (`--brand: 16.3 71.3% 53.5%`) so Tailwind's `<alpha-value>` slot
   works (`bg-primary/90` → `hsl(var(--primary) / 0.9)`).
2. If it needs a Tailwind utility, map it in `tailwind.config.ts` as
   `hsl(var(--token) / <alpha-value>)` — never a raw hex.
3. `tokens.css` is plain CSS (no `@tailwind`), so it is also imported by
   Storybook's `.storybook/preview.css`. Keep it that way.

The token file has two tiers: a **design palette** (primitives like `--brand`,
`--sand-*`, `--gray-*`) and **semantic tokens** (`--primary`, `--background`,
`--border`, …) that reference the palette. Component-scoped aliases (hub.css's
`--dio-*`) must resolve back to these tokens, not define new color values.
