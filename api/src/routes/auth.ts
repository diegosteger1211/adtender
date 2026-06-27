import { Hono } from 'hono'
import { verifyPassword, signJwt } from '../auth'
import { requireAuth } from '../middleware'
import type { UserRow } from '../db'

type Bindings = { DB: D1Database; KV: KVNamespace; JWT_SECRET: string }
type Variables = { user: import('../auth').JwtPayload }

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>()

auth.post('/login', async c => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()

  if (!email || !password) {
    return c.json({ error: 'Email and password required', code: 'VALIDATION_ERROR', status: 400 }, 400)
  }

  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1'
  ).bind(email.toLowerCase().trim()).first<UserRow>()

  if (!user) {
    return c.json({ error: 'Invalid credentials', code: 'AUTH_FAILED', status: 401 }, 401)
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return c.json({ error: 'Invalid credentials', code: 'AUTH_FAILED', status: 401 }, 401)
  }

  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  const token = await signJwt(
    { sub: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenant_id },
    secret
  )

  return c.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenant_id },
  })
})

auth.get('/me', requireAuth, c => {
  const user = c.get('user')
  return c.json({ user })
})

export default auth
