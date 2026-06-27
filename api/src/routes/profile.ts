import { Hono } from 'hono'
import { requireAuth } from '../middleware'
import { hashPassword, verifyPassword } from '../auth'
import type { Env } from '../index'

const app = new Hono<{ Bindings: Env; Variables: { user: { id: string; tenantId: string; role: string; email: string; name: string } } }>()

app.use('*', requireAuth)

// GET /api/profile/me
app.get('/me', async c => {
  const user = c.get('user')
  const row = await c.env.DB.prepare(
    'SELECT id, email, name, first_name, last_name, phone, role FROM users WHERE id = ? AND tenant_id = ?'
  ).bind(user.id, user.tenantId).first<{
    id: string; email: string; name: string
    first_name: string | null; last_name: string | null; phone: string | null; role: string
  }>()
  if (!row) return c.json({ error: 'Not found' }, 404)

  const tenant = await c.env.DB.prepare(
    'SELECT name, address, city, postal_code, country, org_phone, org_email FROM tenants WHERE id = ?'
  ).bind(user.tenantId).first<{
    name: string; address: string | null; city: string | null
    postal_code: string | null; country: string | null; org_phone: string | null; org_email: string | null
  }>()

  return c.json({ user: row, organisation: tenant })
})

// PUT /api/profile/me
app.put('/me', async c => {
  const user = c.get('user')
  const { first_name, last_name, phone, email } = await c.req.json<{
    first_name?: string; last_name?: string; phone?: string; email?: string
  }>()

  const name = [first_name, last_name].filter(Boolean).join(' ') || user.name

  await c.env.DB.prepare(
    `UPDATE users SET first_name = ?, last_name = ?, phone = ?, email = COALESCE(?, email), name = ? WHERE id = ? AND tenant_id = ?`
  ).bind(
    first_name ?? null,
    last_name ?? null,
    phone ?? null,
    email?.trim().toLowerCase() || null,
    name,
    user.id,
    user.tenantId
  ).run()

  return c.json({ success: true })
})

// PUT /api/profile/me/password
app.put('/me/password', async c => {
  const user = c.get('user')
  const { current_password, new_password } = await c.req.json<{
    current_password: string; new_password: string
  }>()

  if (!new_password || new_password.length < 8) {
    return c.json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' }, 400)
  }

  const row = await c.env.DB.prepare(
    'SELECT password_hash FROM users WHERE id = ? AND tenant_id = ?'
  ).bind(user.id, user.tenantId).first<{ password_hash: string }>()

  if (!row) return c.json({ error: 'Not found' }, 404)

  const valid = await verifyPassword(current_password, row.password_hash)
  if (!valid) return c.json({ error: 'Aktuelles Passwort ist falsch.' }, 400)

  const hash = await hashPassword(new_password)
  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ? WHERE id = ? AND tenant_id = ?'
  ).bind(hash, user.id, user.tenantId).run()

  return c.json({ success: true })
})

// PUT /api/profile/organisation (admin only)
app.put('/organisation', async c => {
  const user = c.get('user')
  if (user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)

  const { name, address, city, postal_code, country, org_phone, org_email } = await c.req.json<{
    name?: string; address?: string; city?: string; postal_code?: string
    country?: string; org_phone?: string; org_email?: string
  }>()

  await c.env.DB.prepare(
    `UPDATE tenants SET
      name = COALESCE(?, name),
      address = ?, city = ?, postal_code = ?, country = ?, org_phone = ?, org_email = ?
     WHERE id = ?`
  ).bind(
    name ?? null,
    address ?? null, city ?? null, postal_code ?? null,
    country ?? null, org_phone ?? null, org_email ?? null,
    user.tenantId
  ).run()

  return c.json({ success: true })
})

export { app as profileRoutes }
