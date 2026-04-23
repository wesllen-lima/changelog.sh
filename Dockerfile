FROM oven/bun:1.2-alpine AS builder
WORKDIR /build

# Install deps (cache-friendly layer)
COPY package.json bun.lock ./
COPY apps/server/package.json apps/server/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY packages/widget/package.json packages/widget/package.json
COPY packages/types/package.json packages/types/package.json
RUN bun install --frozen-lockfile

# Copy all sources
COPY packages/ packages/
COPY apps/ apps/

# Build widget, dashboard, and compile server binary
RUN cd packages/widget && bun run build
RUN cd apps/dashboard && bun run build
RUN bun build apps/server/src/index.ts --compile --outfile /tmp/changelog

# ── Final image ───────────────────────────────────────────────────────────────
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata && \
    addgroup -S changelog && adduser -S changelog -G changelog

WORKDIR /app
COPY --from=builder /tmp/changelog              ./changelog
COPY --from=builder /build/packages/widget/dist/widget.js ./widget.js
COPY --from=builder /build/apps/dashboard/dist/ ./public/

RUN mkdir /data && chown -R changelog:changelog /app /data

USER changelog
VOLUME ["/data"]
EXPOSE 3456

ENV WIDGET_PATH=/app/widget.js \
    DASHBOARD_DIR=/app/public \
    NODE_ENV=production \
    DB_PATH=/data/changelog.db

CMD ["/app/changelog"]
