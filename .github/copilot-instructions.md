# Coding Conventions

## Core Principles

- **KISS** — simplest solution that works. No clever abstractions, no unnecessary indirection.
- **YAGNI** — only build what is needed right now.
- **Reuse before building** — always search the codebase first. Duplication is a last resort.
- **Keep files short** — target ~100–150 lines. Beyond ~200 lines, split the file.

---

## Project Structure

```
/                        # Backend — Node.js + Express + TypeScript
  libs/
    models/              # TypeScript interfaces only (no logic)
    database/            # DB class per resource (wraps MongoDB collection)
    controllers/         # Express router per resource

ui/                      # Frontend — Next.js 15 + React 19 + TypeScript
  app/                   # App Router pages and layouts
  components/            # Shared UI components
  data_access/
    models/              # Frontend TypeScript interfaces
    api/                 # Plain async fetch functions
    swr/                 # SWR hooks wrapping API functions
```

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Backend controller files | plural | `assets.ts` |
| Backend database files | singular | `asset.ts` |
| Backend model files | singular | `asset.ts` |
| Frontend API files | plural | `assets.ts` |
| Frontend SWR files | plural | `assets.ts` |
| React components | PascalCase | `ContentList.tsx` |
| Custom icon files | snake_case | `delete_icon.tsx` |
| Page-level components | PascalCase + suffix | `ProjectsView.tsx` |

---

## Backend

### Pattern
Every resource follows: **Model → DB class → Controller → Register in `server.ts`**

```ts
// libs/database/asset.ts
import { dbName, getClient } from './db_client';
const client = getClient();
export default class AssetDB {
    private collection = client.db(dbName).collection('assets');
    constructor() { client.connect(); }
}
```

- Never create a new `MongoClient` outside `db_client.ts`.
- Always use `new ObjectId(id)` for `_id` queries.
- Set `created` and `updated` on insert; only `updated` on mutation.

### Routes
- Every route has a JSDoc comment (params, returns, throws).
- All handlers use `try/catch` — log with `console.error`, respond with `res.sendStatus(500)`.
- Respond with `res.send(JSON.stringify(data))`, never `res.json()`.
- Send `res.sendStatus(400)` for missing required params.

```ts
/**
 * Gets an asset by ID
 * @param {string} req.params.id
 * @returns {Asset}
 * @throws {Error} if retrieval fails
 */
router.get("/:id", async (req, res) => {
    try {
        const result = await db.get(req.params.id);
        res.send(JSON.stringify(result));
    } catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});
```

### File Uploads
- Use `multer({ storage: multer.memoryStorage() })` — never write temp files to disk.
- Blob name format: `<projectId>/<timestamp>-<originalname>`.
- Call `createIfNotExists({ access: 'blob' })` before uploading.

---

## Frontend

### Data Access
Three-layer pattern — never call `fetch` directly inside a component.

```
API functions (data_access/api/) → SWR hooks (data_access/swr/) → Components
```

```ts
// data_access/swr/assets.ts
export const ALL_ASSETS_KEY = (projectId: string) => `/assets/${projectId}`;
export const useAssets = (projectId: string) =>
    useSWR(projectId ? ALL_ASSETS_KEY(projectId) : null, fetcher);
```

- After mutations, call `mutate(ALL_ASSETS_KEY(id))` to invalidate.
- Always check `res.ok` in API functions and throw on failure.
- For file uploads, use `FormData` — do not set `Content-Type` manually.

### Components
- Functional components, named with PascalCase, `export default`.
- `"use client"` only when the component uses hooks, browser APIs, or event handlers.
- Page-specific components live in `ui/app/<route>/components/`. Shared components in `ui/components/`.
- Use `type` for component props, `interface` for data models.

```tsx
type Props = { label: string; onClick?: () => void };
export default function MyButton({ label, onClick }: Props) {
    return <button onClick={onClick}>{label}</button>;
}
```

### Styling
- Tailwind utility classes only. No inline `style=` objects unless computing a dynamic value Tailwind cannot express.
- UI components: **HeroUI** (`@heroui/...`). Icons: **Lucide React** (`lucide-react`).
- Notifications: **Sonner** (`toast` from `"sonner"`).
- Conditional classes use template literals: `` className={`base ${active ? 'bg-white' : 'hover:bg-gray-100'}`} ``

### Imports
- Always use the `@/` path alias. Never use relative `../../` paths.
- External imports first, then `@/` imports. No blank line between groups.

---

## What to Avoid

- No `any` — use proper types or `unknown` with a guard.
- No speculative props, state, or abstractions — YAGNI.
- No new components for things that render in one place — inline it.
- No new utilities without checking `utils/` first.
- No hardcoded URLs or credentials — always use environment variables.
- Never commit `.env` files — only commit `.env.example`.

---

## Adding a New Resource (Checklist)

**Backend:**
- [ ] `libs/models/<resource>.ts` — interface
- [ ] `libs/database/<resource>.ts` — DB class
- [ ] `libs/controllers/<resource>.ts` — router with JSDoc
- [ ] `server.ts` — register router

**Frontend:**
- [ ] `data_access/models/<resource>.ts` — interface
- [ ] `data_access/api/<resource>s.ts` — API functions
- [ ] `data_access/swr/<resource>s.ts` — SWR hook + cache key
- [ ] Components wired to the relevant page