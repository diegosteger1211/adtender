---
id: PKB-05-002
title: Technology Stack — adtender
version: 1.0
status: APPROVED
owner: Technical Architecture
depends_on:
  - PKB-05-001
tags:
  - technical
  - stack
  - react
  - cloudflare
  - typescript
---

# Technology Stack — adtender

> This document defines the mandatory technology stack for adtender. This is a standalone new project. No existing codebase exists to derive from — every decision here is a deliberate first choice.

---

## 1. Stack Overview

| Layer | Technology | Version target | Notes |
|---|---|---|---|
| Frontend framework | React | 18.x | SPA, no SSR framework |
| Frontend build | Vite | 5.x | Fast dev server; static build output |
| Frontend language | TypeScript | 5.x | Strict mode enabled |
| Frontend styling | Tailwind CSS | 3.x | Utility-first; enterprise UI components |
| Frontend component library | shadcn/ui | latest | Built on Radix UI primitives; accessible; unstyled base |
| Frontend state / data | TanStack Query | 5.x | Server state; API calls; caching |
| Frontend routing | React Router | 6.x | Client-side routing |
| Backend runtime | Cloudflare Workers | latest | TypeScript on V8 isolates; no Node.js |
| Backend framework | Hono | 4.x | Lightweight, Worker-native, typed routes |
| Database | Cloudflare D1 | latest | SQLite-compatible; bound to Worker |
| ORM | Drizzle ORM | latest | Type-safe SQL; D1-compatible; migrations |
| Key-Value store | Cloudflare KV | latest | Sessions, rate limiting, invitation tokens |
| Authentication | JWT (HTTP-only cookie) | — | Worker signs/verifies; no third-party auth service |
| Email | Resend | latest | Transactional emails only |
| Source control | GitHub | — | `github.com/diegosteger1211/adtender` |
| CI/CD | GitHub Actions + Cloudflare Pages | — | See `Cloudflare_Deployment.md` |
| Package manager | pnpm | 9.x | Faster installs; workspace support for monorepo |

---

## 2. Frontend Stack Detail

### React Application (Vite SPA)

The frontend is a **Single Page Application** built with React and TypeScript. It is built by Vite and deployed as static assets to Cloudflare Pages.

**What this means in practice:**
- All routing is client-side (React Router or equivalent)
- The build output is a set of HTML/JS/CSS files in `dist/`
- Cloudflare Pages serves these files from its global CDN
- API calls go to `/api/*` — these are handled by the Cloudflare Worker, not the static host

**Stack decisions:**
- React 18 + TypeScript (strict mode)
- Vite 5 build (not webpack, not CRA, not Next.js)
- Tailwind CSS for styling
- shadcn/ui component library (Radix UI primitives — accessible, unstyled base)
- TanStack Query for server state / API data fetching
- React Router v6 for client-side routing
- pnpm as package manager

---

## 3. Backend Stack Detail

### Cloudflare Workers

The backend is a **Cloudflare Worker** — a TypeScript function running on Cloudflare's V8 isolate runtime. It is not a Node.js server. Key constraints:

- **No Node.js APIs**: `fs`, `path`, `os`, `child_process` are not available
- **No long-running processes**: Workers have a CPU time limit (~50ms per request on free plan; higher on paid)
- **No native modules**: No binaries, no native addons
- **Cold start**: Near-zero (V8 isolates, not containers)
- **Global distribution**: Worker runs at the Cloudflare edge nearest to the user

**Request lifecycle:**
```
Browser → Cloudflare Edge → Worker (TypeScript) → D1 / KV → Response
```

**Stack decisions:**
- Hono as HTTP router (Worker-native, typed, middleware support)
- Zod for request/response validation
- Drizzle ORM for database queries (type-safe, D1-compatible)
- Standard error response shape: `{ error: string, code: string, status: number }`

---

## 4. Database

### Cloudflare D1

D1 is Cloudflare's serverless SQLite-compatible database, accessible only from Workers. Key characteristics:

- SQLite syntax (not Postgres, not MySQL)
- Accessed via the Worker binding `env.DB` — not a network connection string
- No direct external access (no GUI tools that connect externally without a Worker proxy)
- `wrangler d1 execute` for local migrations and seeding
- D1 supports read replicas for global distribution

**Migration strategy:**
- SQL migration files in `api/migrations/`
- Applied with `wrangler d1 migrations apply` in CI
- Never apply migrations manually in production

---

## 5. Authentication

**Approach:** JWT tokens stored in HTTP-only cookies. The Worker signs tokens on login and validates them on every protected API request. No third-party auth service.

| Token type | Cookie name | Purpose |
|---|---|---|
| Buyer JWT | `adtender_session` | Buyer application users (PM, Evaluator, Admin, etc.) |
| Supplier JWT | `adtender_supplier_session` | Supplier Portal users — isolated from buyer sessions |

Both tokens are signed with separate secrets (`JWT_SECRET` and `SUPPLIER_JWT_SECRET`). A supplier token is never valid for a buyer route and vice versa — enforced at the Worker middleware layer.

**Supplier Portal auth note:** The Supplier Portal is an isolated route (`/portal/*`). Supplier session cookies are scoped to `/portal` path to prevent cross-access. See `Environment_Variables.md`.

---

## 6. Email — Resend

Resend is the sole transactional email provider. All emails are sent from the Cloudflare Worker using the Resend REST API.

**Sender domain:** `noreply@adtender.adesso-consulting.de` (requires DNS TXT record for SPF/DKIM — see `Email_Integration_Resend.md`)

**Package:** `resend` npm package (Worker-compatible — uses fetch internally, no Node.js deps)

---

## 7. What Is Explicitly Excluded

The following technologies must NOT be introduced:

| Technology | Reason excluded |
|---|---|
| Next.js | adtender is a pure SPA — no SSR needed |
| Supabase | Stack is Cloudflare-native; no external BaaS |
| Firebase | Stack is Cloudflare-native; no external BaaS |
| Vercel | Hosting is Cloudflare Pages only |
| Netlify | Hosting is Cloudflare Pages only |
| Node.js server (Express, Fastify) | Backend is Cloudflare Workers, not Node.js |
| Docker containers for production | Cloudflare Workers/Pages only; no containers |
| Any SQL database other than D1 | adtender uses Cloudflare D1 exclusively |

---

## 8. Implementation Constraints for All Future Sprints

Every sprint producing code must respect:

1. **Worker CPU budget**: No blocking loops, no heavy computation in the Worker. Offload to background Workers if needed.
2. **D1 query patterns**: Use prepared statements. Never string-interpolate SQL. Prevent SQL injection.
3. **TypeScript strict mode**: `"strict": true` in tsconfig. No `any` types in production code.
4. **No secrets in code**: All secrets via `wrangler secret put` or Cloudflare Pages secrets UI. Never committed to git.
5. **Tenant isolation**: Every DB query includes `WHERE tenant_id = ?`. This is the multi-tenancy enforcement layer.
6. **Worker bundle size**: Keep the Worker bundle under 1MB (Cloudflare limit). Lazy-load where possible.
7. **CORS**: API must only accept requests from `adtender.adesso-consulting.de` in production (configurable per environment).

---

## References

- [`Deployment_Target.md`](./Deployment_Target.md) — PKB-05-001
- [`Cloudflare_Deployment.md`](./Cloudflare_Deployment.md) — PKB-05-004
- [`Environment_Variables.md`](./Environment_Variables.md) — PKB-05-003
- [`Email_Integration_Resend.md`](./Email_Integration_Resend.md) — PKB-05-005
