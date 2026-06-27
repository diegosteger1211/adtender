---
id: PKB-05-003
title: Environment Variables — adtender
version: 1.0
status: APPROVED
owner: Technical Architecture
depends_on:
  - PKB-05-002
tags:
  - technical
  - environment
  - secrets
  - configuration
---

# Environment Variables — adtender

---

## 1. Principles

1. **No secrets in git** — Ever. Not in `.env`, not in comments, not in test fixtures.
2. **Cloudflare secrets for Workers** — Set via `wrangler secret put <NAME>` or the Cloudflare dashboard.
3. **Cloudflare Pages secrets for frontend build-time vars** — Set in Pages project settings → Environment variables.
4. **`.env.local` for local development only** — Listed in `.gitignore`. Never committed.
5. **Every variable has an environment** — Some are the same across all envs; secrets differ per env.

---

## 2. Frontend Environment Variables (Build-Time)

Set in Cloudflare Pages → Settings → Environment Variables.  
Locally: `.env.local` in the `frontend/` folder.

| Variable | Example | Required | Description |
|---|---|---|---|
| `VITE_API_URL` | `/api` (prod) · `http://localhost:8787/api` (local) | Yes | Base URL for all API calls. In production: relative path (same domain). In local dev: Worker dev server port. |
| `VITE_APP_ENV` | `production` / `staging` / `development` | Yes | Controls feature flags and debug UI |
| `VITE_APP_VERSION` | `1.0.0` | No | Shown in admin panel / footer |

> **Rule:** Frontend variables are NOT secret — they are embedded in the JS bundle and visible to any user. Never put API keys, tokens, or passwords in `VITE_*` variables.

---

## 3. Worker (Backend) Variables and Secrets

Set via `wrangler secret put` for secrets, or in `wrangler.toml` `[vars]` for non-secret config.

### Non-secret configuration (`wrangler.toml [vars]`)

| Variable | Example | Description |
|---|---|---|
| `ENVIRONMENT` | `production` / `staging` / `development` | Controls logging verbosity, CORS origins |
| `CORS_ORIGIN` | `https://adtender.adesso-consulting.de` | Allowed CORS origin for API requests |
| `APP_URL` | `https://adtender.adesso-consulting.de` | Used in email links |
| `SUPPLIER_PORTAL_URL` | `https://adtender.adesso-consulting.de/portal` | Used in supplier invitation emails |

### Secrets (`wrangler secret put`)

| Secret | Description | How to obtain |
|---|---|---|
| `JWT_SECRET` | HMAC secret for signing/verifying JWT tokens | Generate: `openssl rand -hex 32` |
| `RESEND_API_KEY` | Resend API key for sending emails | Resend dashboard → API Keys |
| `SESSION_SECRET` | Secret for session token encryption (if using session-based auth) | Generate: `openssl rand -hex 32` |
| `INTERNAL_API_SECRET` | Secret for Worker-to-Worker calls (if used) | Generate: `openssl rand -hex 32` |

> Add any additional secrets as the application grows. Follow the same pattern: `wrangler secret put <NAME>`.

---

## 4. Cloudflare Bindings (`wrangler.toml`)

These are not environment variables but Cloudflare resource bindings. They are declared in `wrangler.toml` and accessed via the `env` object in the Worker.

```toml
[[d1_databases]]
binding = "DB"
database_name = "adtender-production"
database_id = "<D1_DATABASE_ID>"

[[kv_namespaces]]
binding = "KV"
id = "<KV_NAMESPACE_ID>"

[vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://adtender.adesso-consulting.de"
APP_URL = "https://adtender.adesso-consulting.de"
```

| Binding | Type | Purpose |
|---|---|---|
| `env.DB` | D1 Database | Primary application database |
| `env.KV` | KV Namespace | Session tokens, rate limiting, cache |

---

## 5. Local Development Setup

Create `frontend/.env.local`:

```bash
VITE_API_URL=http://localhost:8787/api
VITE_APP_ENV=development
VITE_APP_VERSION=dev
```

Create `api/.dev.vars` (Wrangler reads this for local Worker secrets):

```bash
JWT_SECRET=dev-secret-not-for-production
RESEND_API_KEY=re_test_xxxxxxxxxxxx
SESSION_SECRET=dev-session-secret
```

> `.dev.vars` must be in `.gitignore`. It mirrors production secrets for local use only.

Run both in parallel:

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev

# Terminal 2 — Worker
cd api && npx wrangler dev
```

Local D1 database is created automatically by `wrangler dev` in a `.wrangler/state/` folder (gitignored).

---

## 6. Staging Environment Variables

Staging is a separate Cloudflare Pages project (or a branch deploy of the same project). It has its own set of secrets:

| Variable | Staging value |
|---|---|
| `ENVIRONMENT` | `staging` |
| `CORS_ORIGIN` | `https://staging.adtender.adesso-consulting.de` |
| `APP_URL` | `https://staging.adtender.adesso-consulting.de` |
| `JWT_SECRET` | Different from production — set separately |
| `RESEND_API_KEY` | Use Resend test API key in staging |

---

## 7. Supplier Portal Authentication Variables

The Supplier Portal uses a separate authentication cookie/token to ensure buyer and supplier sessions are strictly isolated.

| Variable | Description |
|---|---|
| `SUPPLIER_JWT_SECRET` | Separate secret for signing supplier portal JWTs. Must not be the same as `JWT_SECRET`. |
| `SUPPLIER_PORTAL_URL` | Used in invitation email links |
| `SUPPLIER_INVITATION_EXPIRY_HOURS` | Default: `168` (7 days). Time before an invitation link expires. |

---

## 8. Environment Variable Checklist (Before First Deploy)

- [ ] `JWT_SECRET` set via `wrangler secret put JWT_SECRET` in production Worker
- [ ] `RESEND_API_KEY` set via `wrangler secret put RESEND_API_KEY` in production Worker
- [ ] `SUPPLIER_JWT_SECRET` set via `wrangler secret put SUPPLIER_JWT_SECRET` in production Worker
- [ ] D1 database created and `database_id` in `wrangler.toml`
- [ ] KV namespace created and `id` in `wrangler.toml`
- [ ] `VITE_API_URL` set in Cloudflare Pages environment variables (production)
- [ ] `VITE_API_URL` set in Cloudflare Pages environment variables (staging/preview)
- [ ] CORS_ORIGIN set correctly for production in `wrangler.toml`
- [ ] Resend sender domain DNS records configured (see `Email_Integration_Resend.md`)

---

## References

- [`Technology_Stack.md`](./Technology_Stack.md) — PKB-05-002
- [`Cloudflare_Deployment.md`](./Cloudflare_Deployment.md) — PKB-05-004
- [`Email_Integration_Resend.md`](./Email_Integration_Resend.md) — PKB-05-005
