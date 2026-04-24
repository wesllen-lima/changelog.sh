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
- [x] Unsaved changes warning ao sair do editor sem salvar (`beforeRouteLeave`)
- [x] Atalho `⌘+S` / `Ctrl+S` salva no editor

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

## Sprint 6 — Distribuição ✅ CONCLUÍDA (2026-04-22)

**Goal:** Qualquer pessoa instala o changelog.sh em menos de 2 minutos.

- [x] `Dockerfile` multi-stage: build do dashboard → binary do servidor → imagem final <80MB
- [x] `.dockerignore` + `docker-compose.yml`
- [x] `.env.example` com todas as variáveis documentadas
- [x] `install.sh` — detecta OS + arch, baixa binary do GitHub Releases
- [x] GitHub Actions `release.yml` — matrix: `linux-amd64`, `linux-arm64`, `darwin-arm64` → binaries + Docker image em `ghcr.io`
- [x] `README.md` final — screenshots placeholder, comparação vs Beamer/Headway, Docker one-liner em destaque
- [ ] GitHub repo: description, topics (`self-hosted`, `changelog`, `open-source`, `vue`, `hono`, `bun`, `typescript`), social preview image (manual)

### Acceptance criteria

`docker run -p 3456:3456 -v ./data:/data ghcr.io/user/changelog-sh` funciona numa máquina com só Docker. Binary roda em Linux ARM64. Dashboard abre em `localhost:3456`.

---

## Backlog — UI/UX (prioridade alta)

- [ ] **Cadastro de tags customizadas** — hoje as tags são hardcoded (`new`, `fix`, `improvement`, `performance`); permitir que o usuário crie, edite e remova suas próprias tags por projeto, com cor personalizada
- [ ] **Settings funcional** — a maioria das seções da tela de configurações não persiste nem chama a API corretamente: salvar nome/descrição/accentColor, revogar API keys, deletar projeto e copiar snippet precisam ser validados end-to-end
- [ ] **Dark mode na página pública** — `changelog-page.tsx` (SSR) não tem suporte a dark mode; implementar via `prefers-color-scheme` no CSS e opcionalmente um toggle persistido em cookie para respeitar a preferência do usuário
- [ ] **Área do usuário no sidebar** — o bloco com avatar + nome + email + botões de tema e logout está apertado e pouco legível; redesenhar com melhor hierarquia visual e mais espaço

---

## Backlog — Widget (prioridade alta)

O widget (`packages/widget/src/index.ts`) está funcional mas básico. Lacunas identificadas no código:

- [ ] **Dark mode no widget** — STYLES hardcoded com `#fff`, `#111`, `#f0f0f0`; sem respeito a `prefers-color-scheme` nem variável CSS `--cl-theme`
- [ ] **Theming via atributos** — hoje só `data-project` e `data-api` são lidos; adicionar `data-theme="dark|light|auto"`, `data-position="bottom-left|bottom-right|top-right"`, `data-locale`
- [ ] **Markdown no widget** — `entry.body` é truncado como texto puro (`truncate(e.body, 80)`); renderizar pelo menos negrito, inline-code e listas no painel
- [ ] **Posição configurável** — botão fixo em `bottom: 24px; right: 24px`; expor via atributo ou CSS custom properties
- [ ] **Fechar com Escape** — sem listener de teclado; adicionar `keydown` para acessibilidade
- [ ] **`observedAttributes`** — sem `attributeChangedCallback`; mudanças em `data-project` após mount não re-carregam entradas
- [ ] **Loading e erro no painel** — sem estado de carregamento nem mensagem de erro quando fetch falha; painel abre vazio silenciosamente

---

## Backlog — Servidor / API (prioridade média)

Lacunas identificadas em `apps/server/src/`:

- [ ] **Paginação** — `listEntries` retorna tudo sem limit/offset; projetos com muitas entries vão degradar performance e o widget já limita a 5 no cliente
- [ ] **Rate limiting** — nenhum middleware de rate limit em nenhuma rota; `/api/auth/sign-in` e `/api/auth/magic-link/send` estão abertos a brute-force
- [ ] **Duplicar entry** — sem rota `POST /api/entries/:id/duplicate`; funcionalidade útil que exige só uma query
- [ ] **Reordenar entries** — publishedAt é imutável após publish; sem forma de ajustar a ordem de exibição
- [ ] **Publicação agendada** — schema não tem campo `scheduledAt`; adicionar coluna + job de publicação via `setInterval` no boot
- [ ] **Webhook on publish** — sem tabela `webhooks` nem dispatch; útil para integrar com Slack, CI, etc.
- [ ] **Busca server-side** — `GET /api/projects/:slug/entries?q=` não existe; hoje o filtro é só no cliente
- [ ] **Slug editável** — `PATCH /api/projects/:id` não aceita `slug`; não há como renomear um projeto sem afetar URLs

---

## Backlog — Auth / Segurança (prioridade média)

- [ ] **Password reset** — Better Auth suporta, mas não está configurado nem exposto no dashboard
- [ ] **Email verification** — campo `emailVerified` existe no schema mas nunca é checado; qualquer email pode logar sem verificar
- [ ] **Rotação de API keys** — só há `DELETE`; adicionar `POST /api/keys/:id/rotate` que revoga e cria em uma operação atômica
- [ ] **Audit log** — sem registro de ações (quem publicou, quem deletou); relevante para multi-usuário futuro
- [ ] **CORS restritivo em produção** — `ALLOWED_ORIGIN` já existe mas não há validação que impeça `*` em `NODE_ENV=production`

---

## Backlog — DX / Qualidade (prioridade baixa)

- [ ] **Cobertura de testes do dashboard** — zero testes em `apps/dashboard`; adicionar testes de composables com Vitest + `@vue/test-utils`
- [ ] **Testes E2E** — sem Playwright ou similar; fluxo crítico (login → criar entry → publicar → verificar página pública) sem cobertura automatizada
- [ ] **Storybook ou catálogo de componentes** — `TagPill`, `StatusBadge`, `WidgetPreview`, `Toast`, `CommandPalette` sem documentação visual isolada
- [ ] **Healthcheck endpoint** — sem `GET /health`; Docker e load balancers precisam de um endpoint de liveness/readiness
- [ ] **Métricas de uso** — sem logging estruturado de eventos (entry publicada, widget carregado, etc.); dificulta entender adoção

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
