# changelog.sh

Self-hosted changelog platform with an embeddable Web Component widget.

Free forever if self-hosted. Paid cloud version for teams that don't want to manage infrastructure.

```bash
# Run with Docker (coming soon)
docker run -p 3456:3456 -v ./data:/app/data ghcr.io/your-org/changelog-sh
```

## Stack

- **Runtime:** Bun 1.x
- **API:** Hono v4
- **DB:** SQLite (self-host) / Turso (cloud)
- **ORM:** Drizzle
- **Auth:** Better Auth v1
- **Dashboard:** Vue 3 + Vite 6 + Tailwind v4
- **Widget:** Vanilla TS Web Component (<4kb gzipped)

## Development

```bash
bun install
make dev          # server on :3456, dashboard on :5173
make test         # all tests
make build        # production build
make compile      # standalone binary
```

Copy `.env.example` to `.env` and fill in the required values before starting.

## Contributing

See [CLAUDE.md](./CLAUDE.md) for architecture rules and code conventions.
