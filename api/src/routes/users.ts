import { Hono } from 'hono'
import { requireAuth } from '../middleware'
import { hashPassword } from '../auth'
import type { UserRow } from '../db'

type Bindings = { DB: D1Database; KV: KVNamespace; JWT_SECRET: string }
type Variables = { user: import('../auth').JwtPayload }

const users = new Hono<{ Bindings: Bindings; Variables: Variables }>()

users.use('*', requireAuth)

// GET /api/users
users.get('/', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const { results } = await c.env.DB.prepare(
    `SELECT id, tenant_id, email, name, role, is_active, created_at, updated_at
     FROM users WHERE tenant_id = ? ORDER BY name ASC`
  ).bind(user.tenantId).all<Omit<UserRow, 'password_hash'>>()

  return c.json({ users: results })
})

// POST /api/users
users.post('/', async c => {
  const user = c.get('user')
  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const body = await c.req.json<{
    email: string
    name: string
    role: string
    password: string
  }>()

  if (!body.email?.trim() || !body.name?.trim() || !body.role || !body.password) {
    return c.json({ error: 'email, name, role and password required', code: 'VALIDATION_ERROR', status: 400 }, 400)
  }

  const validRoles = ['admin', 'berater', 'kunde', 'anbieter']
  if (!validRoles.includes(body.role)) {
    return c.json({ error: 'Invalid role', code: 'VALIDATION_ERROR', status: 400 }, 400)
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ? AND tenant_id = ?'
  ).bind(body.email.toLowerCase().trim(), user.tenantId).first()

  if (existing) {
    return c.json({ error: 'Email already in use', code: 'DUPLICATE_EMAIL', status: 409 }, 409)
  }

  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(body.password)

  await c.env.DB.prepare(
    'INSERT INTO users (id, tenant_id, email, name, role, password_hash) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, user.tenantId, body.email.toLowerCase().trim(), body.name.trim(), body.role, passwordHash).run()

  const created = await c.env.DB.prepare(
    'SELECT id, tenant_id, email, name, role, is_active, created_at FROM users WHERE id = ?'
  ).bind(id).first()

  return c.json({ user: created }, 201)
})

// PUT /api/users/:id
users.put('/:id', async c => {
  const user = c.get('user')
  const id = c.req.param('id')

  // Users can update their own profile; admin can update anyone
  if (user.role !== 'admin' && user.sub !== id) {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE id = ? AND tenant_id = ?'
  ).bind(id, user.tenantId).first()

  if (!existing) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  const body = await c.req.json<{ name?: string; password?: string; is_active?: boolean }>()

  let passwordHash: string | null = null
  if (body.password) {
    passwordHash = await hashPassword(body.password)
  }

  await c.env.DB.prepare(
    `UPDATE users SET
      name = COALESCE(?, name),
      password_hash = COALESCE(?, password_hash),
      is_active = COALESCE(?, is_active),
      updated_at = datetime('now')
     WHERE id = ? AND tenant_id = ?`
  ).bind(
    body.name || null,
    passwordHash,
    body.is_active !== undefined ? (body.is_active ? 1 : 0) : null,
    id, user.tenantId
  ).run()

  const updated = await c.env.DB.prepare(
    'SELECT id, tenant_id, email, name, role, is_active, created_at, updated_at FROM users WHERE id = ?'
  ).bind(id).first()

  return c.json({ user: updated })
})

export default users
