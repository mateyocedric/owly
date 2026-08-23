# 🦉 Owly — Anonymous Random Chat Platform

Owly is a production-minded anonymous random chat platform designed for safe, respectful, and ephemeral one-to-one text conversations.

---

## 🏗 Architecture Overview

```
                          ┌──────────────────────────┐
                          │   React + Vite Frontend  │
                          │        (apps/web)        │
                          └─────────────┬────────────┘
                                        │ HTTP + WebSocket
                                        ▼
                          ┌──────────────────────────┐
                          │     Hono + Bun.serve     │
                          │        (apps/api)        │
                          └──────┬────────────┬──────┘
                                 │            │
             ┌───────────────────┘            └───────────────────┐
             ▼                                                    ▼
┌──────────────────────────┐                             ┌──────────────────────────┐
│   MongoDB 7 (Mongoose)   │                             │         Redis 7          │
│   • Anonymous Sessions   │                             │   • Matchmaking Queues   │
│   • Moderation Reports   │                             │   • Atomic Lua Scripts   │
│   • Ban Records & Audits │                             │   • Rate Limiting        │
│   • Admin Credentials    │                             │   • Active Presence      │
└──────────────────────────┘                             └──────────────────────────┘
             ▲
             │
┌──────────────────────────┐
│  Background Jobs Worker  │
│      (apps/worker)       │
└──────────────────────────┘
```

---

## 🚀 Tech Stack

- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Monorepo:** Bun Workspaces
- **Backend API & WebSockets:** [Hono](https://hono.dev/) on `Bun.serve`
- **Frontend:** [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/), Radix UI / shadcn-style components
- **Database:** [MongoDB 7](https://www.mongodb.com/) via Mongoose
- **Queue & Real-time State:** [Redis 7](https://redis.io/) with atomic Lua pairing scripts
- **Schema & Validation:** [Zod](https://zod.dev/)
- **Testing:** [Vitest](https://vitest.dev/) (unit) and [Playwright](https://playwright.dev/) (E2E)

---

## 📂 Monorepo Structure

```
owl/
├── apps/
│   ├── api/          # Hono REST API & Bun native WebSocket matchmaking server
│   ├── web/          # React + Vite frontend application
│   └── worker/       # Periodic cleanup and auto-moderation background worker
├── packages/
│   ├── config/       # Shared TypeScript and linter configurations
│   ├── database/     # Mongoose models, database client, and seed scripts
│   ├── shared/       # Shared types, Zod schemas, constants, and event contracts
│   └── ui/           # Reusable UI component library (shadcn-style)
├── e2e/              # Playwright end-to-end user journey tests
├── docker-compose.yml# Local MongoDB 7 and Redis 7 services
└── package.json      # Workspace root manifest
```

---

## ⚡ Quick Start

### 1. Prerequisites
- [Bun](https://bun.sh/) v1.1+ installed
- [Docker](https://www.docker.com/) & Docker Compose

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Start Infrastructure (MongoDB + Redis)
```bash
docker compose up -d
```

### 4. Install Dependencies & Seed Database
```bash
bun install
bun run db:seed
```
*Seed script creates the default super_admin account (`admin` / `change-me-admin-password`) and popular interest tags.*

### 5. Run the Application
In separate terminal windows (or run `bun run dev`):
```bash
# Start API & WebSocket server on http://localhost:3001
bun run dev:api

# Start Web Frontend on http://localhost:5173
bun run dev:web

# Start Background Worker
bun run dev:worker
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 WebSocket Event Contract

All WebSocket events are strictly validated on both client and server using Zod schemas.

### Client → Server Events

| Event Type | Payload | Description |
|---|---|---|
| `queue.join` | `{ data: { interests?: string[] } }` | Enter matching queue with optional topics |
| `queue.leave` | `{}` | Leave queue without connecting |
| `chat.message` | `{ data: { content: string } }` | Send a text message (max 2000 chars) |
| `chat.typing` | `{}` | Notify partner that user is typing |
| `chat.next` | `{}` | Disconnect from current room and instantly requeue |
| `chat.stop` | `{}` | Disconnect and return to idle screen |
| `chat.report` | `{ data: { category: string, description?: string } }` | Report partner and terminate session |
| `chat.block` | `{}` | Bidirectionally block partner from future matching |
| `ping` | `{}` | Heartbeat keep-alive (returns `pong`) |

### Server → Client Events

| Event Type | Payload | Description |
|---|---|---|
| `queue.waiting` | `{ data: { position?: number } }` | Confirms user is queued and returns position |
| `match.found` | `{ data: { roomId: string, commonInterests?: string[] } }` | Match established with partner |
| `chat.message` | `{ data: { content: string, timestamp: string } }` | Partner's incoming message |
| `chat.typing` | `{}` | Partner typing indicator |
| `chat.partner_left`| `{ data: { reason: string } }` | Partner skipped or disconnected |
| `chat.ended` | `{ data: { reason: string } }` | Chat room terminated |
| `moderation.warning`| `{ data: { message: string } }` | Safety filter warning notice |
| `error` | `{ data: { code: string, message: string } }` | Server error notification |

---

## 🛡️ Safety, Privacy & Moderation System

1. **Age Gate:** Requires explicit 18+ verification and consent to community guidelines before queue entry.
2. **Zero PII Exposure:** IP addresses, hardware IDs, and real names are never transmitted to chat partners.
3. **Cryptographic Hashing:** IP addresses and session tokens are salted and hashed via HMAC-SHA256.
4. **Ephemeral Message Lifecycles:** Chat messages are retained only in temporary Redis memory during an active room. When closed without reports, messages are erased completely.
5. **Auditable Reports:** When a user reports a partner, recent messages are captured into MongoDB for review by staff.
6. **Rate Limiting & Anti-Abuse:** Sliding-window rate limiters prevent spam flooding, automated bots, and rapid skipping abuse.
7. **Moderator Portal:** Access `/admin` to review pending reports with message context, issue warnings, temporary bans, or permanent IP bans, and configure custom banned keywords.

---

## 🧪 Testing

```bash
# Run API unit tests (matching contracts, tokens, filters)
bun run --filter @owly/api test

# Run Playwright E2E tests
bun run test:e2e
```

---

## 📋 Production Readiness & External Service Dependencies

The core architecture is production-minded and hardened. The following features are marked for external integrations in a live cloud deployment:

- **ML Content Moderation:** Built-in keyword and regex filters are active; production deployment should connect to Perspective API or AWS Rekognition for deep ML moderation.
- **TLS / WSS Termination:** In production, route traffic through a reverse proxy (Cloudflare, Nginx, or Traefik) for HTTPS/WSS SSL termination.
- **Multi-Instance WebSockets:** For multi-server horizontal scaling, attach Redis Pub/Sub between Bun instances.
