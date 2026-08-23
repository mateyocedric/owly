# syntax=docker/dockerfile:1
FROM oven/bun:1.4
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN bun install --frozen-lockfile

RUN apt-get update \
  && apt-get install -y --no-install-recommends redis-server \
  && rm -rf /var/lib/apt/lists/*

COPY . .
RUN bun run --filter @owly/web build

ENV NODE_ENV=production
ENV WEB_DIST_PATH=/app/apps/web/dist
ENV REDIS_URL=redis://127.0.0.1:6379
EXPOSE 3001

# Seed is idempotent; it creates the admin user and interest tags on first boot.
CMD ["bun", "run", "scripts/start-api.ts"]
