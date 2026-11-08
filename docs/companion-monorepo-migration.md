# Move the companion app into document.io (monorepo, step 1)

## Context

The companion app currently lives in its own repo at `document.io-companion`
(a browser-extension UI: Vite 6 + React 18 + Storybook, plus an `extensions/`
wrapper and a `design/` token folder). The main dashboard lives in this
`document.io` repo (Express/MongoDB backend at the root + a Next.js 15 dashboard
in `ui/`).

The goal is to co-locate both projects in a single repo so design assets and, in
time, UI components can be shared — easing development. This plan does **step 1
only**: physically relocate the companion into `document.io` on a new branch.
Deeper integration (npm workspaces, extracting a shared component/design package,
reconciling React 18 vs 19) is intentionally deferred.

### Decisions
- **Layout:** drop the companion in as a single `companion/` folder. Leave the
  existing backend (root) and dashboard (`ui/`) untouched.
- **History:** clean copy of the current working tree (not a git-history merge).
  Old history stays in the companion repo.
- **Workspaces:** none yet. Each project keeps installing independently
  (`companion/`, `companion/ui/`, `ui/` each have their own `node_modules`).
- **Design tokens:** keep under `companion/design/`, remain gitignored (untracked),
  as they are today. Files are still copied to disk for local use.

### Why a subfolder copy is safe
- The companion has **no filesystem coupling** to the dashboard — the extension
  talks to the backend over HTTP (API host in `ui/.env`), so nesting it changes
  nothing at runtime.
- Putting everything under `companion/` means **no filename collisions** with
  document.io's root files (`package.json`, `tsconfig.json`, `README.md`,
  `LICENSE`, `.vscode/`, etc.).
- `design/` is untracked in the source repo, so only a working-tree file copy
  (not `git archive`/subtree) brings it across — which matches the clean-copy choice.
- Copying the working tree also preserves the companion's current **uncommitted
  changes**, so nothing in progress is lost.

## Target structure (after this change)

```
document.io/
├── server.ts, libs/, swagger/, package.json …   (backend — unchanged)
├── ui/                                           (Next.js dashboard — unchanged)
└── companion/                                    (NEW — the whole companion project)
    ├── package.json, package-lock.json, tsconfig.json
    ├── CLAUDE.md, coding-convention.md, README.md, LICENSE, .nvmrc, .env.example
    ├── .gitignore            (nested — keeps design/ + build output ignored)
    ├── .vscode/, .github/, .claude/
    ├── ui/                   (Vite + React + Storybook app)
    ├── extensions/           (manifest.json, background.js, content.js, popup/, scripts/)
    └── design/               (tokens — on disk, gitignored)
```

## Steps

1. **Create the branch in document.io.**
   `git checkout -b feat/companion-monorepo`.

2. **Copy the companion working tree into `document.io/companion/`** using `rsync`
   (captures untracked `design/` and uncommitted edits), excluding installs,
   build output, git metadata, and OS cruft:
   ```
   rsync -a \
     --exclude '.git/' \
     --exclude 'node_modules/' \
     --exclude 'dist/' \
     --exclude 'ui/dist/' \
     --exclude 'ui/storybook-static/' \
     --exclude 'extensions/dist/' \
     --exclude '.DS_Store' \
     ../document.io-companion/ \
     ./companion/
   ```
   Keep the `package-lock.json` files (root + `ui/`) for reproducible installs.
   Keep `.env` files if present (they're gitignored; copied only for local dev).

3. **Sanity-check the nested `.gitignore`.** The copied `companion/.gitignore`
   already ignores `design`, `dist/`, `node_modules`, `*.zip`, `*.txt` relative to
   `companion/`, so `design/` and build artifacts stay untracked. document.io's
   root `.gitignore` also ignores `dist/` and `node_modules` globally — no change
   needed there. No root config edits.

4. **(Optional, low-risk) Fix in-file path references.** `companion/CLAUDE.md` and
   `companion/ui/README.md` mention `ui/src/companion/`; these remain correct
   relative to `companion/`. Leave as-is unless a reference is now wrong. Do **not**
   touch document.io's root files.

5. **Commit on the new branch** (only after verification passes):
   `git add companion docs && git commit`.
   Confirm the staged set excludes `node_modules/`, `dist/`, and `design/`.

6. **Leave the original repo in place.** Do not delete `document.io-companion` — it
   remains the source of truth / backup until the move is verified and pushed.

## Verification

- **Install + build the companion UI in its new home:**
  ```
  cd companion/ui && npm install && npm run build
  ```
  Expect `companion/ui/dist/assets/*.js` to be produced (Vite build succeeds).
- **Storybook still builds:** `npm run build-storybook` in `companion/ui/`
  (produces `storybook-static/`).
- **Extension orchestration works from the new root:**
  ```
  cd companion && npm install && npm run build
  ```
  Expect `clean → build:ui → copy:ui` to run and populate `companion/extensions/dist/assets/`.
- **Dashboard is untouched:** `git status` shows only the new `companion/` folder
  (and this `docs/` file) added; no changes to `ui/`, `libs/`, `server.ts`, or root
  configs. Confirm `companion/design/`, `node_modules/`, and `dist/` are **not** staged.
- Optionally load the built `companion/extensions/` as an unpacked extension to
  confirm it runs, though the build succeeding is sufficient for this step.

## Out of scope (future steps)
- npm/pnpm workspaces + a root orchestrator.
- Extracting `ui/src/companion` and `design/` into shared `packages/*`.
- Reconciling React 18 (companion) vs React 19 (dashboard) for real component sharing.
- Tracking `design/` in git.
- Deleting or archiving the old `document.io-companion` repo.
