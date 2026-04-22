# SPRINTS.md

Sprint cadence: **1 week**. Each sprint delivers something runnable. No sprint ends with broken state on `main`.

---

## Sprint 0 — Foundation ✅ CONCLUÍDA (2026-04-21)

- [x] Bootstrap monorepo — `apps/server`, `apps/dashboard`, `packages/widget`, `packages/types`
- [x] pnpm workspaces + `tsconfig.json` per package (`strict: true`, `moduleResolution: bundler`)
- [x] ESLint flat config + Prettier + lint-staged + husky pre-commit hook
- [x] GitHub Actions CI: typecheck + lint + test on every PR
- [x] `apps/server/src/config.ts` — Zod-validated env vars, throws on missing
- [x] `apps/server/src/lib/id.ts` — nanoid wrapper
- [x] `README.md` com quick start, tabela de surfaces, env vars e stack

---

## Sprint 1 — Data layer ✅ CONCLUÍDA (2026-04-21)

- [x] `apps/server/src/db/schema.ts` — tables: `projects`, `entries`, `apiKeys` + Better Auth tables
- [x] `apps/server/src/db/index.ts` — Bun.sqlite adapter, Drizzle on top
- [x] `apps/server/src/db/queries/entries.ts` — CRUD completo + publish/unpublish, tags como `string[]`
- [x] `apps/server/src/db/queries/projects.ts` — CRUD completo
- [x] `apps/server/src/db/queries/api-keys.ts` — hash antes de armazenar, validate, list, revoke
- [x] `bun run db:push` + `bun run db:studio`
- [x] 29 testes, todos passando, SQLite in-memory

---

## Sprint 2 — Server API ✅ CONCLUÍDA (2026-04-21)

- [x] Middleware: error handler, auth (session + API key fallback), CORS
- [x] Better Auth: email/senha + magic link opcional (Resend), Drizzle adapter
- [x] Bootstrap automático do admin na inicialização (`ADMIN_EMAIL` + `ADMIN_PASSWORD`)
- [x] Rotas: projects, entries, api-keys, widget (público), config
- [x] Zod em todas as fronteiras — rejeita com `422`
- [x] Auth bypass de CSRF via `auth.api.*` interno (sign-in, sign-out, magic link)
- [x] 63 testes de integração, todos passando

---

## Sprint 3 — Public surface + RSS ✅ CONCLUÍDA (2026-04-21)

- [x] `GET /:slug` — página SSR (Hono JSX), markdown renderizado server-side com sanitização
- [x] `GET /:slug/rss.xml` — RSS 2.0 válido com categorias por tag
- [x] `packages/widget/src/index.ts` — Web Component, Shadow DOM, badge de não-lidos via localStorage, <4kb gzipped
- [x] Build do widget + rota estática com cache de longa duração
- [x] 12 testes para rotas públicas

---

## Sprint 4 — Dashboard ✅ CONCLUÍDA (2026-04-22)

**Goal:** Admins podem criar, editar, publicar e deletar entries. Dashboard funcional e visualmente completo.

- [x] `apps/dashboard/src/styles/tokens.css` — todos os CSS custom properties do design system
- [x] `useAuth.ts` — sessão, signIn, signOut, sendMagicLink, fetchMe, fetchConfig
- [x] `useApi.ts` — fetch tipado com `Result<T>`, extração de erros Zod legível
- [x] `useEntries.ts`, `useProjects.ts`, `useApiKeys.ts` — composables com estado compartilhado
- [x] Vue Router: `/login`, `/onboarding`, `/entries`, `/entries/new`, `/entries/:id`, `/projects`, `/settings`, `/auth/callback`
- [x] Auth guard — redireciona não-autenticados para `/login`
- [x] Onboarding guard — redireciona usuários sem projetos para `/onboarding`
- [x] `AppLayout.vue` — sidebar 216px, seletor de projeto, nav groups, user card
- [x] `LoginView.vue` — modo email+senha ou magic link (detectado via `/api/config`)
- [x] `AuthCallbackView.vue` — recebe redirect do magic link, verifica sessão
- [x] `OnboardingView.vue` — wizard 2 passos: criar projeto → escrever primeira entry
- [x] `EntriesView.vue` — tabela com filtros All/Published/Drafts, publish/unpublish inline
- [x] `EntryEditorView.vue` — título, tag pills com menu, markdown + preview side-by-side, feedback de erro inline
- [x] `ProjectsView.vue` — tabela com confirmação de delete
- [x] `SettingsView.vue` — configuração do projeto, snippet de embed com copy, API keys, danger zone
- [x] `WidgetPreview.vue` — simulação visual do popover do widget com entries reais
- [x] `TagPill.vue`, `StatusBadge.vue` — componentes reutilizáveis
- [ ] Unsaved changes warning ao sair do editor sem salvar (`beforeRouteLeave`)
- [ ] Atalho `⌘+S` salva no editor

### Acceptance criteria ✅

Criar entry, publicar, verificar em `GET /:slug`. Despublicar, verificar que some. Deletar, DB limpo. Sem reloads — estado atualizado in-place.

---

## Sprint 5 — Magic link + polish ✅ CONCLUÍDA (2026-04-22)

- [x] Magic link via Resend — opcional, ativado por `RESEND_API_KEY` no `.env`
- [x] `GET /api/config` — feature flags para o dashboard (`magicLinkEnabled`)
- [x] Login adapta UI automaticamente: campo de senha some quando magic link está ativo
- [x] `POST /api/auth/magic-link/send` — bypass CSRF, mesmo padrão do sign-in
- [x] Email HTML responsivo enviado via Resend com link de acesso
- [x] Fallback gracioso para email+senha quando `RESEND_API_KEY` não está configurado

---

## Sprint 6 — Distribuição

**Goal:** Qualquer pessoa instala o changelog.sh em menos de 2 minutos.

- [ ] `Dockerfile` multi-stage: build do dashboard → binary do servidor → imagem final <80MB
- [ ] `.dockerignore` + `docker-compose.yml`
- [ ] `.env.example` com todas as variáveis documentadas
- [ ] `install.sh` — detecta OS + arch, baixa binary do GitHub Releases
- [ ] GitHub Actions `release.yml` — matrix: `linux-amd64`, `linux-arm64`, `darwin-arm64` → binaries + Docker image em `ghcr.io`
- [ ] `README.md` final — screenshots, comparação vs Beamer/Headway, Docker one-liner em destaque
- [ ] GitHub repo: description, topics (`self-hosted`, `changelog`, `open-source`, `vue`, `hono`, `bun`, `typescript`), social preview image

### Acceptance criteria

`docker run -p 3456:3456 -v ./data:/data ghcr.io/user/changelog-sh` funciona numa máquina com só Docker. Binary roda em Linux ARM64. Dashboard abre em `localhost:3456`.

---

## Backlog (pós-v1, avaliar com tração)

- **CI/CD publish via `curl`** — exemplo documentado de publicar uma entry via API key num pipeline de deploy (GitHub Actions, Bitbucket, etc.)
- **WidgetPreview real** — iframe carregando o Web Component real apontado para o projeto atual
- **`⌘+S`** no editor + unsaved changes warning
- **Busca/filtro de texto** na lista de entries
- **Webhook** on entry publish
- **Slack / Discord** notification integration
- **Scheduled publish** — `publishedAt` no futuro
- **GitHub Release sync** — cria draft entry a partir do body de uma Release
- **`changelog-sh` CLI** — `changelog new`, `changelog publish`, `changelog list`
- **Read receipts** (privacy-preserving)
- **Team members + roles**
- **I18n widget** — `data-locale="pt-BR"`
- **Export** — todas as entries como arquivos Markdown
- **OAuth** — GitHub/Google via Better Auth plugins
- **Cloud version** — só após 5k GitHub stars
