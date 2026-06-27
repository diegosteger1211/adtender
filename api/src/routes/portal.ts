// Supplier portal API — activation, login, requirements, financial data
import { Hono } from 'hono'
import { verifyPassword, hashPassword, signJwt, verifyJwt } from '../auth'
import type { JwtPayload } from '../auth'

type Bindings = { DB: D1Database; KV: KVNamespace; JWT_SECRET: string; APP_URL: string }
type Variables = { portalUser: JwtPayload; projectSupplierId: string }

const portal = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ── Auth middleware for portal routes ──
async function portalAuth(c: { req: { header: (k: string) => string | undefined }; env: Bindings; set: (k: string, v: unknown) => void }, next: () => Promise<void>) {
  const auth = (c.req as { header: (k: string) => string | undefined }).header('Authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED', status: 401 }, { status: 401 })
  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  const payload = await verifyJwt(token, secret)
  if (!payload || payload.role !== 'anbieter') return Response.json({ error: 'Forbidden', code: 'PORTAL_ONLY', status: 403 }, { status: 403 })
  c.set('portalUser', payload)
  await next()
}

// ── GET /api/portal/activate/:token — check token ──
portal.get('/activate/:token', async c => {
  const token = c.req.param('token')
  const ps = await c.env.DB.prepare(
    `SELECT ps.*, s.company_name, s.contact_name, s.contact_email,
            p.title as project_title
     FROM project_suppliers ps
     JOIN suppliers s ON s.id = ps.supplier_id
     JOIN projects p ON p.id = ps.project_id
     WHERE ps.activation_token = ?`
  ).bind(token).first<{
    id: string; project_id: string; portal_user_id: string | null
    company_name: string; contact_name: string; contact_email: string
    project_title: string; activation_token_expires_at: string
  }>()

  if (!ps) return c.json({ error: 'Invalid or expired token', code: 'TOKEN_INVALID', status: 400 }, 400)

  const expires = new Date(ps.activation_token_expires_at)
  if (expires < new Date()) return c.json({ error: 'Token expired', code: 'TOKEN_EXPIRED', status: 400 }, 400)

  const hasAccount = !!ps.portal_user_id
  return c.json({
    valid: true,
    hasAccount,
    company_name: ps.company_name,
    contact_name: ps.contact_name,
    contact_email: ps.contact_email,
    project_title: ps.project_title,
  })
})

// ── POST /api/portal/activate/:token — set password + activate ──
portal.post('/activate/:token', async c => {
  const token = c.req.param('token')
  const { password } = await c.req.json<{ password: string }>()

  if (!password || password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters', code: 'VALIDATION_ERROR', status: 400 }, 400)
  }

  const ps = await c.env.DB.prepare(
    `SELECT ps.*, s.contact_name, s.contact_email, p.tenant_id
     FROM project_suppliers ps
     JOIN suppliers s ON s.id = ps.supplier_id
     JOIN projects p ON p.id = ps.project_id
     WHERE ps.activation_token = ?`
  ).bind(token).first<{
    id: string; project_id: string; portal_user_id: string | null
    contact_name: string; contact_email: string; tenant_id: string
    activation_token_expires_at: string
  }>()

  if (!ps) return c.json({ error: 'Invalid token', code: 'TOKEN_INVALID', status: 400 }, 400)
  if (new Date(ps.activation_token_expires_at) < new Date()) {
    return c.json({ error: 'Token expired', code: 'TOKEN_EXPIRED', status: 400 }, 400)
  }

  const passwordHash = await hashPassword(password)
  let userId = ps.portal_user_id

  if (!userId) {
    // Create new anbieter user
    userId = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO users (id, tenant_id, email, name, role, password_hash) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(userId, ps.tenant_id, ps.contact_email.toLowerCase(), ps.contact_name, 'anbieter', passwordHash).run()
  } else {
    // Update existing user password
    await c.env.DB.prepare(
      "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(passwordHash, userId).run()
  }

  // Link user to project_supplier, clear token
  await c.env.DB.prepare(
    `UPDATE project_suppliers SET
       portal_user_id = ?,
       activation_token = NULL,
       activation_token_expires_at = NULL,
       status = 'portal_opened',
       portal_opened_at = datetime('now')
     WHERE id = ?`
  ).bind(userId, ps.id).run()

  // Issue JWT
  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  const jwtToken = await signJwt(
    { sub: userId, email: ps.contact_email, name: ps.contact_name, role: 'anbieter', tenantId: ps.tenant_id },
    secret
  )

  return c.json({ token: jwtToken, project_supplier_id: ps.id })
})

// ── POST /api/portal/login ──
portal.post('/login', async c => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()
  if (!email || !password) return c.json({ error: 'Email and password required', code: 'VALIDATION_ERROR', status: 400 }, 400)

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE email = ? AND role = 'anbieter' AND is_active = 1"
  ).bind(email.toLowerCase().trim()).first<{ id: string; email: string; name: string; role: string; tenant_id: string; password_hash: string }>()

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: 'Invalid credentials', code: 'AUTH_FAILED', status: 401 }, 401)
  }

  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  const token = await signJwt(
    { sub: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenant_id },
    secret
  )

  // Get all project_suppliers for this user
  const { results: projects } = await c.env.DB.prepare(
    `SELECT ps.id as project_supplier_id, ps.status, p.id, p.title, p.category, p.phase
     FROM project_suppliers ps
     JOIN projects p ON p.id = ps.project_id
     WHERE ps.portal_user_id = ?`
  ).bind(user.id).all()

  return c.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role }, projects })
})

// ── GET /api/portal/projects — supplier's projects ──
portal.get('/projects', portalAuth as never, async c => {
  const user = c.get('portalUser')
  const { results } = await c.env.DB.prepare(
    `SELECT ps.id as project_supplier_id, ps.status,
            p.id, p.title, p.category, p.phase, p.description,
            (SELECT COUNT(*) FROM requirements r WHERE r.project_id = p.id) as requirement_count
     FROM project_suppliers ps
     JOIN projects p ON p.id = ps.project_id
     WHERE ps.portal_user_id = ?`
  ).bind(user.sub).all()

  return c.json({ projects: results })
})

// ── GET /api/portal/projects/:psId — project detail for supplier ──
portal.get('/projects/:psId', portalAuth as never, async c => {
  const user = c.get('portalUser')
  const psId = c.req.param('psId')

  const ps = await c.env.DB.prepare(
    `SELECT ps.*, p.title, p.category, p.description, p.phase,
            s.company_name, s.contact_name
     FROM project_suppliers ps
     JOIN projects p ON p.id = ps.project_id
     JOIN suppliers s ON s.id = ps.supplier_id
     WHERE ps.id = ? AND ps.portal_user_id = ?`
  ).bind(psId, user.sub).first()

  if (!ps) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)
  return c.json({ project: ps })
})

// ── GET /api/portal/projects/:psId/requirements ──
portal.get('/projects/:psId/requirements', portalAuth as never, async c => {
  const user = c.get('portalUser')
  const psId = c.req.param('psId')

  // Verify access
  const ps = await c.env.DB.prepare(
    'SELECT id, project_id FROM project_suppliers WHERE id = ? AND portal_user_id = ?'
  ).bind(psId, user.sub).first<{ id: string; project_id: string }>()
  if (!ps) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  // Load capabilities
  const { results: capabilities } = await c.env.DB.prepare(
    `SELECT * FROM capabilities WHERE project_id = ? ORDER BY sort_order ASC`
  ).bind(ps.project_id).all()

  // Load requirements with existing response
  const { results: requirements } = await c.env.DB.prepare(
    `SELECT r.*,
            rr.fulfillment, rr.comment as response_comment,
            rr.cost_amount, rr.cost_currency, rr.cost_note
     FROM requirements r
     LEFT JOIN requirement_responses rr ON rr.requirement_id = r.id AND rr.project_supplier_id = ?
     WHERE r.project_id = ?
     ORDER BY r.sort_order ASC`
  ).bind(psId, ps.project_id).all()

  return c.json({ capabilities, requirements })
})

// ── PUT /api/portal/projects/:psId/requirements/:reqId/response ──
portal.put('/projects/:psId/requirements/:reqId/response', portalAuth as never, async c => {
  const user = c.get('portalUser')
  const { psId, reqId } = c.req.param()

  const ps = await c.env.DB.prepare(
    'SELECT id FROM project_suppliers WHERE id = ? AND portal_user_id = ?'
  ).bind(psId, user.sub).first()
  if (!ps) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  const body = await c.req.json<{ fulfillment?: string; comment?: string; cost_amount?: number; cost_currency?: string; cost_note?: string }>()
  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    `INSERT INTO requirement_responses (id, requirement_id, project_supplier_id, fulfillment, comment, cost_amount, cost_currency, cost_note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(requirement_id, project_supplier_id) DO UPDATE SET
       fulfillment = excluded.fulfillment,
       comment = excluded.comment,
       cost_amount = excluded.cost_amount,
       cost_currency = excluded.cost_currency,
       cost_note = excluded.cost_note,
       updated_at = datetime('now')`
  ).bind(id, reqId, psId, body.fulfillment || null, body.comment || null, body.cost_amount || null, body.cost_currency || 'EUR', body.cost_note || null).run()

  return c.json({ success: true })
})

// ── GET /api/portal/projects/:psId/financial ──
portal.get('/projects/:psId/financial', portalAuth as never, async c => {
  const user = c.get('portalUser')
  const psId = c.req.param('psId')

  const ps = await c.env.DB.prepare(
    'SELECT id FROM project_suppliers WHERE id = ? AND portal_user_id = ?'
  ).bind(psId, user.sub).first()
  if (!ps) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  const fin = await c.env.DB.prepare(
    'SELECT * FROM financial_data WHERE project_supplier_id = ?'
  ).bind(psId).first()

  return c.json({ financial: fin || null })
})

// ── PUT /api/portal/projects/:psId/financial ──
portal.put('/projects/:psId/financial', portalAuth as never, async c => {
  const user = c.get('portalUser')
  const psId = c.req.param('psId')

  const ps = await c.env.DB.prepare(
    'SELECT id FROM project_suppliers WHERE id = ? AND portal_user_id = ?'
  ).bind(psId, user.sub).first()
  if (!ps) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  const body = await c.req.json<Record<string, number | string>>()
  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    `INSERT INTO financial_data (id, project_supplier_id, currency,
       ops_one_time, ops_license_per_month, ops_maintenance_per_month, ops_other_per_month,
       adapt_rate_pm, adapt_rate_consulting, adapt_rate_development,
       impl_interfaces, impl_data_migration, impl_training, impl_project_mgmt, impl_consulting, impl_other,
       submitted_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
     ON CONFLICT(project_supplier_id) DO UPDATE SET
       currency = excluded.currency,
       ops_one_time = excluded.ops_one_time,
       ops_license_per_month = excluded.ops_license_per_month,
       ops_maintenance_per_month = excluded.ops_maintenance_per_month,
       ops_other_per_month = excluded.ops_other_per_month,
       adapt_rate_pm = excluded.adapt_rate_pm,
       adapt_rate_consulting = excluded.adapt_rate_consulting,
       adapt_rate_development = excluded.adapt_rate_development,
       impl_interfaces = excluded.impl_interfaces,
       impl_data_migration = excluded.impl_data_migration,
       impl_training = excluded.impl_training,
       impl_project_mgmt = excluded.impl_project_mgmt,
       impl_consulting = excluded.impl_consulting,
       impl_other = excluded.impl_other,
       submitted_at = datetime('now'),
       updated_at = datetime('now')`
  ).bind(
    id, psId, body.currency || 'EUR',
    body.ops_one_time || null, body.ops_license_per_month || null, body.ops_maintenance_per_month || null, body.ops_other_per_month || null,
    body.adapt_rate_pm || null, body.adapt_rate_consulting || null, body.adapt_rate_development || null,
    body.impl_interfaces || null, body.impl_data_migration || null, body.impl_training || null,
    body.impl_project_mgmt || null, body.impl_consulting || null, body.impl_other || null
  ).run()

  return c.json({ success: true })
})

export default portal
