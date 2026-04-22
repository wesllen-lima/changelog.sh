# SPRINTS.md

Sprint cadence: **1 week**. Each sprint delivers something runnable. No sprint ends with broken state on `main`.

---

## Sprint 0 — Foundation ✅ CONCLUÍDA (2026-04-21)

- [x] Bootstrap monorepo — `apps/server`, `apps/dashboard`, `packages/widget`, `packages/types`
- [x] pnpm workspaces + `tsconfig.json` per package (`strict: true`, `moduleResolution: bundler`)
- [x] ESLint flat config + Prettier + lint-staged + husky pre-commit hook
- [x] GitHub Actions CI: typecheck + lint + test on every PR
- [x] `.env.example` + `apps/server/src/config.ts` (Zod-validated, throws on missing vars)
- [x] `apps/server/src/lib/logger.ts` + `apps/server/src/lib/id.ts` (nanoid wrapper)
- [x] Root `Makefile` + `README.md` skeleton

---

## Sprint 1 — Data layer ✅ CONCLUÍDA (2026-04-21)

- [x] `apps/server/src/db/schema.ts` — tables: `projects`, `entries`, `apiKeys` + Better Auth tables
- [x] `apps/server/src/db/index.ts` — Bun.sqlite adapter, Drizzle on top
- [x] `apps/server/src/db/queries/entries.ts` — getEntries, getEntry, createEntry, updateEntry, deleteEntry, publishEntry, unpublishEntry
- [x] `apps/server/src/db/queries/projects.ts` — getProject, getProjectsByOwner, createProject, updateProject, deleteProject
- [x] `apps/server/src/db/queries/api-keys.ts` — createApiKey (hash before store), validateApiKey, listApiKeys, revokeApiKey
- [x] `bun run db:push` + `bun run db:studio`
- [x] 29 tests, all passing, in-memory SQLite

---

## Sprint 2 — Server API ✅ CONCLUÍDA (2026-04-21)

- [x] Middleware: error, auth (session + API key fallback), cors
- [x] Better Auth: email/password, Drizzle adapter, sessions table
- [x] Routes: auth, projects, entries, api-keys, widget (public)
- [x] Zod validation on every boundary — rejects with `422`
- [x] 63 integration tests, all passing

---

## Sprint 3 — Public surface + RSS ✅ CONCLUÍDA (2026-04-21)

- [x] `GET /:slug` — SSR changelog page (Hono JSX), markdown rendered server-side
- [x] `GET /:slug/rss.xml` — valid RSS 2.0 feed
- [x] `packages/widget/src/index.ts` — Web Component, Shadow DOM, localStorage badge, <4kb (1849 bytes gzipped)
- [x] Widget build + CI size check + static route with long-lived cache headers
- [x] 12 tests for public routes

---

## Sprint 4 — Dashboard (Claude Design → Vue implementation)

**Goal:** Admins can create, edit, publish, and delete entries. Dashboard is fully functional and visually complete.

### Step 1 — Claude Design prototype (before writing Vue code)

Open **claude.ai/design**, point it at this repository, and use this prompt:

> "Read CLAUDE.md in this repository. Build the complete admin dashboard for changelog.sh following the design system defined in the Design system section exactly. Build all 6 screens: Login, Entries list, Entry editor, Projects list, Settings, and the WidgetPreview component. Use the color tokens, fonts, and interaction rules from CLAUDE.md. The API contracts are documented in CLAUDE.md — use those exact endpoints for all fetch calls. The shared types are in packages/types/src/index.ts. Output as Vue 3 SFC files with <script setup lang='ts'>, Tailwind v4, and the composable pattern documented in CLAUDE.md."

Iterate on the prototype in Claude Design until all 6 screens look right. Then use **Export → Handoff to Claude Code** to pass to the implementation step.

### Step 2 — Vue implementation tasks

- [ ] `apps/dashboard/src/styles/tokens.css` — all CSS variables from CLAUDE.md design system
- [ ] `apps/dashboard/src/composables/useAuth.ts` — wraps Better Auth session, exposes `user`, `login()`, `logout()`, `isAuthenticated`
- [ ] `apps/dashboard/src/composables/useApi.ts` — typed fetch wrapper, attaches session cookie, returns `Result<T>`
- [ ] Vue Router: `/login`, `/entries`, `/entries/:id`, `/entries/new`, `/projects`, `/settings`
- [ ] Auth guard — redirects unauthenticated requests to `/login`
- [ ] `AppLayout.vue` — sidebar + main area shell
- [ ] `LoginView.vue`
- [ ] `EntriesView.vue` — list with filter pills, status badges, inline publish/unpublish
- [ ] `EntryEditorView.vue` — title input, tag pills, markdown + preview split
- [ ] `MarkdownPreview.vue` — renders markdown via `marked` + `sanitize-html`, styles match public page exactly
- [ ] `ProjectsView.vue`
- [ ] `SettingsView.vue` — project config, widget section with embed snippet, API keys, danger zone
- [ ] `WidgetPreview.vue` — iframe wrapping actual `<changelog-widget>` Web Component
- [ ] `useClipboard.ts` — copy to clipboard with 2s "✓ Copied" feedback
- [ ] Unsaved changes warning on editor navigate away (`beforeRouteLeave`)
- [ ] Keyboard shortcut: `⌘+S` saves in editor

### Acceptance criteria

Create an entry, publish it, verify it appears on `GET /:slug`. Unpublish, verify it disappears. Delete, verify DB is clean. No full-page reloads — all actions update state in-place.

---

## Sprint 5 — Dashboard: projects + settings

**Goal:** Users can manage multiple projects and configure the widget.

### Step 1 — Claude Design (continue in same Design session from Sprint 4)

> "Refine the Settings screen to include: live widget preview inside an iframe, one-time API key display banner, accent color picker with hex input, and delete project confirmation modal that requires typing the project slug. Also add the project switcher dropdown in the sidebar."

### Step 2 — Implementation tasks

- [ ] Project selector dropdown in sidebar — `localStorage` persists last selected
- [ ] Create project modal — name field, slug auto-derived (editable), description, accent color picker
- [ ] Settings: project section with slug change warning
- [ ] Settings: API key creation → one-time plaintext banner with copy
- [ ] Settings: delete project → modal requiring slug confirmation
- [ ] `WidgetPreview.vue` — iframe renders actual Web Component with real project data
- [ ] Accent color change → widget preview updates in real time

### Acceptance criteria

Create two projects, switch between them. Change accent color — widget preview updates immediately. Generate API key, copy it, verify it works against `POST /api/projects/:slug/entries`. Revoke the key, verify `401`.

---

## Sprint 6 — Distribution

**Goal:** Anyone can install changelog.sh in under 2 minutes. GitHub page is ready to ship.

- [ ] `Dockerfile` multi-stage: dashboard build (node:22-alpine) → server binary (oven/bun:1-alpine) → final image <80MB
- [ ] `.dockerignore` + `docker-compose.yml`
- [ ] `install.sh` — detects OS + arch, downloads binary from GitHub Releases
- [ ] GitHub Actions `release.yml` — matrix: `linux-amd64`, `linux-arm64`, `darwin-arm64` → binaries as release assets + Docker image to `ghcr.io`
- [ ] `README.md` final — hero sentence, Docker command, embed snippet, screenshots, comparison table vs Beamer/Headway
- [ ] GitHub repo: description, topics (`self-hosted`, `changelog`, `open-source`, `vue`, `hono`, `bun`, `typescript`), social preview image

### Acceptance criteria

`docker run -p 3456:3456 -v ./data:/data ghcr.io/user/changelog-sh` starts on a machine with only Docker. Binary runs on Linux ARM64. `curl -fsSL changelog.sh/install.sh | sh && changelog serve` works on macOS arm64.

---

## Backlog (post-v1, evaluate after traction)

- Webhook on entry publish
- Slack / Discord notification integration
- Scheduled publish (future `publishedAt`)
- GitHub Release sync — auto-creates draft entry from Release body
- `changelog-sh` CLI — `changelog new`, `changelog publish`, `changelog list`
- Read receipts (privacy-preserving)
- Team members + roles
- I18n widget — `data-locale="pt-BR"`
- Export all entries as Markdown files
- Cloud version — only after 5k GitHub stars
