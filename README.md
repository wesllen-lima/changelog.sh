# changelog.sh

Self-hosted changelog platform with an embeddable Web Component widget.

One command to run. One `<script>` tag to embed. No accounts, no vendor lock-in, no $49/month for a markdown renderer.

## What you get

| Surface     | URL                                          | Description                                              |
| ----------- | -------------------------------------------- | -------------------------------------------------------- |
| Dashboard   | `http://localhost:5173`                      | Admin panel — create projects, write and publish entries |
| Public page | `http://localhost:3456/:slug`                | SSR changelog page for your users                        |
| RSS feed    | `http://localhost:3456/:slug/rss.xml`        | Feed readers and integrations                            |
| Widget      | `<changelog-widget>`                         | Embeddable Web Component for any site                    |
| Widget API  | `http://localhost:3456/widget/:slug/entries` | Public JSON endpoint used by the widget                  |

## Quick start

```bash
git clone https://github.com/your-org/changelog-sh
cd changelog-sh
bun install

# Copy and fill in the required env vars
cp apps/server/.env.example apps/server/.env

# Start server (port 3456) and dashboard (port 5173)
bun run dev:server   # terminal 1
bun run dev:dash     # terminal 2
```

Sign in at `http://localhost:5173` with the credentials from your `.env`.

## Embed the widget

Build the widget once, then drop two lines into any HTML page:

```bash
cd packages/widget && bun run build
```

```html
<script src="http://your-server/widget.js"></script>
<changelog-widget project-id="your-project-slug"></changelog-widget>
```

That's it. The widget fetches the latest entries from your server and renders a "What's new" popover with an unread badge.

## Environment variables

Create `apps/server/.env`:

```env
PORT=3456                                    # optional, default 3456
DB_PATH=./data/changelog.db                  # optional, default ./data/changelog.db
BETTER_AUTH_SECRET=<32+ char random string>  # required
ADMIN_EMAIL=admin@example.com                # required — first admin account
ADMIN_PASSWORD=changeme123                   # required — at least 8 characters
```

For cloud deployments with Turso:

```env
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=your-token
```

## Stack

| Layer          | Choice                             |
| -------------- | ---------------------------------- |
| Runtime        | Bun 1.x                            |
| HTTP           | Hono v4                            |
| ORM            | Drizzle                            |
| DB (self-host) | SQLite via `bun:sqlite`            |
| DB (cloud)     | Turso (libSQL)                     |
| Auth           | Better Auth v1                     |
| Dashboard      | Vue 3 + Vite 6 + Tailwind v4       |
| Widget         | Vanilla TS Web Component (&lt;4kb) |

## Development

```bash
bun install

bun run dev:server   # Hono on :3456 with --watch and auto-migrate
bun run dev:dash     # Vite on :5173 with HMR

cd apps/server
bun run db:push      # sync schema to DB
bun run db:studio    # Drizzle Studio GUI

bun test             # server tests
cd apps/dashboard && bun run test   # dashboard tests
```

## Contributing

See [CLAUDE.md](./CLAUDE.md) for architecture rules, design system, and code conventions.
