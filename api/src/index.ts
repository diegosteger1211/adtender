import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  ENVIRONMENT: string
  CORS_ORIGIN: string
  APP_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CORS_ORIGIN || 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  return corsMiddleware(c, next)
})

app.get('/api/health', c => {
  return c.json({
    status: 'ok',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  })
})

app.post('/api/auth/login', async c => {
  const body = await c.req.json<{ email: string; password: string }>()

  // Placeholder — real auth with D1 in Sprint 2
  const DEMO: Record<string, { name: string; role: string }> = {
    'admin@adtender.de': { name: 'Admin User', role: 'admin' },
    'berater@adtender.de': { name: 'Diego Steger', role: 'berater' },
    'kunde@adtender.de': { name: 'Kunde Mustermann', role: 'kunde' },
    'anbieter@adtender.de': { name: 'Anbieter GmbH', role: 'anbieter' },
  }

  const user = DEMO[body.email?.toLowerCase()]
  if (!user || body.password !== 'demo1234') {
    return c.json({ error: 'Invalid credentials', code: 'AUTH_FAILED', status: 401 }, 401)
  }

  return c.json({
    user: { id: crypto.randomUUID(), email: body.email, ...user, tenantId: 'adesso' },
    token: 'demo-token',
  })
})

app.notFound(c => c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404))

export default app
