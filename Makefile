.PHONY: dev test build compile lint typecheck

dev:
	bun run dev:server & bun run dev:dash

test:
	bun test
	cd apps/dashboard && bun run test

build:
	bun run build

compile:
	cd apps/server && bun run compile

lint:
	bun run lint

typecheck:
	bun run typecheck
