# CLAUDE.md

## Project

**changelog.sh** — self-hosted changelog platform with an embeddable Web Component widget. Free forever if self-hosted.

One Docker command to run. One script tag to embed the widget. No accounts, no vendor lock-in, no $49/month for a markdown renderer.

## Monorepo layout

```
apps/server      Hono v4 API + public SSR routes (Bun runtime)
apps/dashboard   Vue 3 SPA — admin panel (Vite 6 + Tailwind v4)
packages/widget  Vanilla TS Web Component compiled to <4kb
packages/types   Shared TypeScript types — source of truth for contracts
```

## Stack

| Layer           | Choice              | Reason                                                                |
| --------------- | ------------------- | --------------------------------------------------------------------- |
| Runtime         | Bun 1.x             | `bun build --compile` produces a standalone binary — no Node required |
| HTTP            | Hono v4             | Runtime-agnostic, typed routes, minimal overhead                      |
| ORM             | Drizzle ORM         | SQL-level control, typed queries, no codegen                          |
| DB (self-host)  | `Bun.sqlite`        | Built into Bun — zero native dependencies                             |
| DB (cloud)      | Turso (libSQL)      | Same Drizzle interface, drop-in swap via env var                      |
| Auth            | Better Auth v1      | Hono + Drizzle plugins, email/password + API keys                     |
| Validation      | Zod                 | Schema → type inference at every API boundary                         |
| Dashboard       | Vue 3 + Vite 6      | Composition API, `<script setup>`                                     |
| Styles          | Tailwind CSS v4     | CSS-native, no config file                                            |
| Package manager | pnpm workspaces     | Shared types across packages                                          |
| Testing         | `bun test` + Vitest | Native, zero config                                                   |

---

## Design system

> This section is the single source of truth for every visual decision in the dashboard. Claude Design must read this before generating any screen.

### Aesthetic

**Editorial precision minimalism.** Linear, Vercel, Stripe. Light, restrained. No decoration. Every element earns its place.

### Fonts

Add to `apps/dashboard/index.html`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Geist:wght@300;400;500;600&display=swap"
  rel="stylesheet"
/>
```

| Role    | Family             | Usage                                                     |
| ------- | ------------------ | --------------------------------------------------------- |
| Display | `Instrument Serif` | Page titles only — italic variant for impact              |
| UI      | `Geist`            | All interface text — weights 400 and 500 only, never 600+ |
| Mono    | `DM Mono`          | Slugs, dates, badges, labels, API keys, code              |

### Color tokens — `apps/dashboard/src/styles/tokens.css`

```css
:root {
  --bg: #f9f8f6;
  --surface: #ffffff;
  --bg2: #f3f2f0;
  --bg3: #eceae6;

  --border: rgba(0, 0, 0, 0.07);
  --border-md: rgba(0, 0, 0, 0.11);
  --border-dk: rgba(0, 0, 0, 0.17);

  --text: #111110;
  --muted: #706d68;
  --dimmed: #a8a49d;

  --accent: #0a6640;
  --accent-bg: #e8f5ee;
  --accent-lt: #f2faf6;

  --red: #b91c1c;
  --red-bg: #fef2f2;
  --blue: #1d4ed8;
  --blue-bg: #eff6ff;
  --amber: #92400e;
  --amber-bg: #fffbeb;
  --purple: #6d28d9;
  --purple-bg: #f5f3ff;
  --teal: #0e7490;
  --teal-bg: #ecfeff;

  --sh-sm: 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.055);
  --sh-md: 0 4px 12px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.055);
  --sh-lg: 0 12px 32px rgba(0, 0, 0, 0.09), 0 0 0 1px rgba(0, 0, 0, 0.055);
  --sh-xl: 0 24px 64px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.07);

  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 20px;
}
```

### Interaction rules

- All clickable elements: `transform: translateY(-1px)` on hover, `transition: 150ms ease`
- Button primary: `background: var(--text)`, white text, `opacity: 0.87` on hover
- Button ghost: `border: 1px solid var(--border-md)`, `var(--border-dk)` on hover, `var(--sh-sm)`
- Focus ring: `box-shadow: 0 0 0 2px var(--accent)` — never default browser outline
- Disabled: `opacity: 0.4`, `cursor: not-allowed`

### Tag pills

`border-radius: 99px`, `font-family: DM Mono`, `font-size: 11px`, `font-weight: 500`. Color dot (4px circle) before text.

| Tag                        | Background         | Text            |
| -------------------------- | ------------------ | --------------- |
| `new` / `novo`             | `var(--accent-bg)` | `var(--accent)` |
| `fix` / `correção`         | `var(--red-bg)`    | `var(--red)`    |
| `improvement` / `melhoria` | `var(--blue-bg)`   | `var(--blue)`   |
| `performance`              | `var(--amber-bg)`  | `var(--amber)`  |

### Status badges

Same pill shape. `published`: `var(--accent-bg)` / `var(--accent)`. `draft`: `var(--bg2)` / `var(--dimmed)` + `1px solid var(--border-md)`.

---

## Dashboard screens

> Build these screens using the design system above. All screens share `AppLayout.vue`.

### `AppLayout.vue` — shared sidebar + main

Sidebar 216px fixed, background `#faf9f7`, right border `1px solid var(--border)`.

Top: logo mark (20×20 black rounded square, white horizontal lines SVG) + `changelog.sh` in DM Mono 13px 500.

Project selector card (margin 0 10px 14px): white bg, `var(--sh-sm)`, `var(--r-md)`. Shows project name bold + slug in DM Mono dimmed + `⌄` chevron. Clicking opens project switcher.

Nav groups. Group label: DM Mono 10px uppercase dimmed. Nav items: SVG icon 14px + label 13px. Active: slightly darker bg (`rgba(0,0,0,.05)`), font-weight 500. Count badge for entries: DM Mono 10px dimmed, `var(--bg)` bg, 4px border-radius.

### Screen 1 — `/login`

Centered card (max-width 380px, `var(--sh-md)`, `var(--r-xl)`, 32px padding).
Logo + name centered. Email input. Password input. "Sign in" button full width black. No sign-up (admin creates account via env var).

### Screen 2 — `/entries` — entries list

Top bar: "Entries" in 20px Geist 600 + "New entry" button (black, with `+` icon, top right).

Filter pill toggle below top bar: Todas / Publicadas / Rascunhos. Active pill: white bg + `var(--sh-sm)` + 1px border.

Table in white card `var(--sh-sm)` `var(--r-lg)`. Header row `var(--bg2)`, DM Mono 10px uppercase dimmed. Four columns: Title (flex 1, truncated ellipsis) · Status badge · Date (DM Mono 11px dimmed) · Actions (edit icon + more icon, 28×28 icon buttons). Row hover `#fafaf8`. Last row no bottom border.

### Screen 3 — `/entries/:id` and `/entries/new` — editor

Top bar: "Edit entry" 20px 600 + buttons right: "Save draft" (ghost) + "Publish" (black).

Title: unstyled `<input>` 22px Geist 600, full width. Placeholder "Entry title…"

Tags row: removable pills (DM Mono 12px, `var(--bg2)`) with `×` button + dimmed "+ tag" link.

`<hr>` divider.

Two equal columns:

- Left — label `MARKDOWN` (DM Mono 10px uppercase dimmed) + textarea (`var(--bg)` bg, border darkens on focus, `var(--r-md)`, `var(--mono)` 13px, min-height 240px)
- Right — label `PREVIEW` + rendered div (white bg, 1px border, `var(--r-md)`, same styles as public page: h2 16px 600, p line-height 1.75, ul indent, strong `var(--text)`)

### Screen 4 — `/projects` — projects list

Same table pattern. Columns: Name · Slug (DM Mono) · Entry count · Created date (DM Mono dimmed) · Actions.

### Screen 5 — `/settings` — settings

Sections with 16px 600 headings, separated by `<hr>` dividers.

**Project:** Name input · Slug input (warning inline: "Changing the slug breaks existing embeds") · Description textarea · Accent color: color swatch picker + hex input.

**Widget:** Live `WidgetPreview.vue` showing the popover with real data. Dark code block (`#1a1a1a` bg, syntax highlighted in amber/blue/green) with the 2-line embed snippet. "Copy snippet" button → "✓ Copied" for 2s.

**API Keys:** Table: Label · Created (DM Mono) · Last used (DM Mono) · Revoke button. "Generate new key" → shows plaintext key in a one-time banner with copy button. "This key will not be shown again."

**Danger zone:** `var(--red-bg)` tinted section, `1px solid var(--red-bg)` border-bottom. "Delete project" → confirmation modal requiring user to type project slug.

### Screen 6 — `WidgetPreview.vue`

Rendered inside `<iframe>` to isolate CSS. Loads actual `<changelog-widget>` Web Component pointing at current project API. Displays as it would in a real product: bell button with unread badge → popover with last 3 entries.

---

## API contracts

> Exact endpoints the dashboard calls. Use these for composables and fetch wrappers.

```
POST /auth/sign-in/email    { email, password }  → session cookie
POST /auth/sign-out
GET  /auth/me               → { user: { id, email, name } } | 401

GET    /api/projects
POST   /api/projects        { name, description?, accentColor? }
PATCH  /api/projects/:id    Partial<{ name, description, accentColor }>
DELETE /api/projects/:id

GET    /api/projects/:slug/entries   ?published=true
POST   /api/projects/:slug/entries   { title, body, tags? }
PATCH  /api/entries/:id              Partial<{ title, body, tags }>
DELETE /api/entries/:id
POST   /api/entries/:id/publish
POST   /api/entries/:id/unpublish

GET    /api/projects/:slug/keys
POST   /api/projects/:slug/keys     { label }  → { key: string }  (plaintext once)
DELETE /api/keys/:id

GET    /widget/:slug/entries        (public, no auth)
```

---

## Shared types — `packages/types/src/index.ts`

```ts
export interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  accentColor: string | null
  ownerId: string
  createdAt: string
}

export interface Entry {
  id: string
  projectId: string
  title: string
  body: string
  tags: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiKey {
  id: string
  projectId: string
  label: string
  lastUsedAt: string | null
  createdAt: string
}

export interface WidgetEntry {
  id: string
  title: string
  body: string
  tags: string[]
  publishedAt: string
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number }
```

---

## Architecture rules

### Layering

```
Route handler → Service → Query → DB
```

Handlers are thin — validate input with Zod, call one service function, return. No business logic in routes. No queries in services.

### Error handling

No `throw` in business logic. Services return `Result<T>`. `onError` middleware handles unexpected throws.

### Configuration

All env vars accessed through `apps/server/src/config.ts`. No `process.env.X` elsewhere. Throws at startup on missing required vars.

### IDs

`nanoid(21)` everywhere. Never auto-increment integers.

### Dates

ISO 8601 strings in SQLite. `Date` objects only at response boundary.

---

## Code conventions

- Files: `kebab-case.ts` · Functions/vars: `camelCase` · Types: `PascalCase` · DB columns: `snake_case`
- `strict: true` everywhere · `unknown` over `any` · Explicit return types on exports
- Vue: `<script setup lang="ts">` only · composables for shared stateful logic · no Pinia for local state
- No Prisma · no Express · no `try/catch` in handlers · no `console.log` · no barrel files · no magic strings · no comments — rename instead · no `// TODO` in committed code

---

## Environment variables

| Variable              | Required   | Description                         |
| --------------------- | ---------- | ----------------------------------- |
| `PORT`                | no         | Defaults to `3456`                  |
| `DB_PATH`             | no         | Defaults to `./data/changelog.db`   |
| `BETTER_AUTH_SECRET`  | yes        | 32+ char random string              |
| `ADMIN_EMAIL`         | yes        | Email for the initial admin account |
| `DATABASE_URL`        | cloud only | Turso libSQL connection string      |
| `DATABASE_AUTH_TOKEN` | cloud only | Turso auth token                    |

---

## Running the project

```bash
bun run dev:server      # Hono :3456 --watch
bun run dev:dash        # Vite :5173 HMR

cd apps/server
bun run db:push
bun run db:studio

bun test
cd apps/dashboard && bun run test

bun run build
cd apps/server && bun run compile  # → dist/changelog
```

## Git conventions

`feat | fix | chore | refactor | perf | test | docs` — imperative present tense. One logical change per commit. PRs squash-merged.

## Key files

```
apps/server/src/index.ts
apps/server/src/config.ts
apps/server/src/db/index.ts
apps/server/src/db/schema.ts
apps/server/src/db/queries/
apps/server/src/services/
apps/server/src/routes/
apps/server/src/lib/
apps/server/src/middleware/
packages/types/src/index.ts
packages/widget/src/index.ts
apps/dashboard/src/views/
apps/dashboard/src/components/
apps/dashboard/src/composables/
apps/dashboard/src/styles/tokens.css
```
