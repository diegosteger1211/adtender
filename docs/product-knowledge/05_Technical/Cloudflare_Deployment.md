---
id: PKB-05-004
title: Cloudflare Deployment — adtender
version: 1.0
status: APPROVED
owner: Technical Architecture
depends_on:
  - PKB-05-001
  - PKB-05-002
tags:
  - technical
  - cloudflare
  - deployment
  - github-actions
  - ci-cd
---

# Cloudflare Deployment — adtender

---

## 1. Deployment Components

adtender uses two Cloudflare products simultaneously:

| Component | Product | What it serves |
|---|---|---|
| Frontend | Cloudflare Pages | React SPA static assets, CDN-delivered globally |
| Backend | Cloudflare Workers | REST API at `/api/*`, database access, email |

These are deployed independently but accessed under the same domain via Cloudflare routing rules.

---

## 2. Cloudflare Pages — Frontend

### Project Setup

1. In the Cloudflare dashboard → Pages → Create a project → Connect to GitHub
2. Select repository: `diegosteger1211/adtender`
3. Set build configuration:

| Setting | Value |
|---|---|
| Framework preset | None (custom) |
| Build command | `cd frontend && npm run build` |
| Build output directory | `frontend/dist` |
| Root directory | `/` (repository root) |

4. Add environment variables (see `Environment_Variables.md` §5 and §6)
5. Add custom domain: `adtender.adesso-consulting.de`

### Preview Deployments

Every pull request automatically gets a preview URL:
`https://<commit-hash>.adtender.pages.dev`

This is handled by Cloudflare Pages natively — no GitHub Action needed. The preview URL is posted as a comment on the PR.

Preview deployments use the same `VITE_API_URL` pointing to the staging/development Worker.

---

## 3. Cloudflare Workers — Backend API

### Project Setup

The Worker is deployed with Wrangler CLI. The `wrangler.toml` in `api/` defines the full Worker configuration.

```toml
name = "adtender-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://adtender.adesso-consulting.de"
APP_URL = "https://adtender.adesso-consulting.de"

[[d1_databases]]
binding = "DB"
database_name = "adtender-production"
database_id = "REPLACE_WITH_ACTUAL_ID"

[[kv_namespaces]]
binding = "KV"
id = "REPLACE_WITH_ACTUAL_ID"

[env.staging]
vars = { ENVIRONMENT = "staging", CORS_ORIGIN = "https://staging.adtender.adesso-consulting.de" }

[[env.staging.d1_databases]]
binding = "DB"
database_name = "adtender-staging"
database_id = "REPLACE_WITH_STAGING_ID"
```

### Worker Routes

The Worker must be configured to handle `/api/*` requests on the custom domain. In Cloudflare dashboard → Workers & Pages → your Worker → Triggers → Routes:

```
adtender.adesso-consulting.de/api/*
```

Or, if using a Cloudflare Pages Functions approach (functions in `frontend/functions/api/`), the routing is automatic.

---

## 4. GitHub Actions Workflows

### Production Deploy (`.github/workflows/deploy.yml`)

Triggers on push to `main`. Deploys Worker first, then Pages (Pages deployment is triggered by the Cloudflare GitHub integration automatically, so the workflow only needs to deploy the Worker).

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-worker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: api/package-lock.json

      - name: Install API dependencies
        run: cd api && npm ci

      - name: Run D1 migrations
        run: cd api && npx wrangler d1 migrations apply adtender-production --remote
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Deploy Worker
        run: cd api && npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Required GitHub Secrets

| Secret name | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create token (use "Edit Cloudflare Workers" template) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar when logged in |

> Cloudflare Pages is deployed automatically via the GitHub integration — no GitHub Action needed for the frontend.

---

## 5. Database Migrations

All schema changes are SQL migration files. The workflow is:

```bash
# Create a new migration file
npx wrangler d1 migrations create adtender-production "add_users_table"
# → Creates api/migrations/0001_add_users_table.sql

# Apply locally
npx wrangler d1 migrations apply adtender-production --local

# Apply to production (run in CI only, not manually)
npx wrangler d1 migrations apply adtender-production --remote
```

**Rules:**
- Never edit a migration file after it has been applied to any environment
- Never apply migrations to production manually — only via the GitHub Actions workflow
- Migration files are committed to git
- Applied migration state is tracked by D1 internally

---

## 6. Local Development

### Prerequisites

```bash
npm install -g wrangler
```

### Start local Worker

```bash
cd api
npx wrangler dev
# Worker runs at http://localhost:8787
# D1 database: local SQLite in .wrangler/state/
```

### Start frontend dev server

```bash
cd frontend
npm run dev
# Vite serves at http://localhost:5173
# API calls proxy to http://localhost:8787
```

### Apply local migrations

```bash
cd api
npx wrangler d1 migrations apply adtender-production --local
```

### Seed local database

```bash
cd api
npx wrangler d1 execute adtender-production --local --file=./seed.sql
```

---

## 7. Staging Environment

Staging uses a separate Cloudflare Pages project connected to the `staging` branch of the same repository.

| Setting | Value |
|---|---|
| Branch | `staging` |
| Pages project | `adtender-staging` |
| Custom domain | `staging.adtender.adesso-consulting.de` |
| Worker | `adtender-api` deployed with `--env staging` |
| D1 database | Separate `adtender-staging` database |

To deploy to staging manually:

```bash
cd api && npx wrangler deploy --env staging
```

---

## 8. Rollback Procedure

**Frontend (Pages):** In Cloudflare Pages → Deployments → select previous deployment → click "Rollback to this deployment". Instant.

**Worker:** Re-deploy the previous git commit:

```bash
git checkout <previous-commit>
cd api && npx wrangler deploy
```

**Database:** D1 does not support point-in-time restore on the free/paid plan — migrations are forward-only. Design migrations to be additive (add columns, new tables) rather than destructive (drop columns). Include compensating migration files for rollbacks.

---

## 9. Security Considerations

| Concern | Implementation |
|---|---|
| API token scope | Cloudflare API token for GitHub Actions should have minimum scope: Workers edit + D1 edit |
| Secrets never in `wrangler.toml` | All secrets via `wrangler secret put` — they are stored encrypted in Cloudflare, not in the repo |
| CORS enforcement | Worker rejects requests from origins not in the `CORS_ORIGIN` env var |
| HTTPS only | Cloudflare enforces HTTPS; HTTP → HTTPS redirect is automatic |
| HTTP security headers | Set in Worker response: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy` |
| Rate limiting | Cloudflare Rate Limiting rules on `/api/auth/*` routes to prevent brute force |
| D1 SQL injection | Use prepared statements exclusively; never string-interpolate into SQL |

---

## References

- [`Deployment_Target.md`](./Deployment_Target.md) — PKB-05-001
- [`Technology_Stack.md`](./Technology_Stack.md) — PKB-05-002
- [`Environment_Variables.md`](./Environment_Variables.md) — PKB-05-003
