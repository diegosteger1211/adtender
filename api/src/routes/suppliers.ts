import { Hono } from 'hono'
import { requireAuth } from '../middleware'
import type { SupplierRow } from '../db'

type Bindings = { DB: D1Database; KV: KVNamespace; JWT_SECRET: string }
type Variables = { user: import('../auth').JwtPayload }

const suppliers = new Hono<{ Bindings: Bindings; Variables: Variables }>()

suppliers.use('*', requireAuth)

// GET /api/suppliers
suppliers.get('/', async c => {
  const user = c.get('user')
  const { results } = await c.env.DB.prepare(
    `SELECT s.*,
      (SELECT COUNT(*) FROM project_suppliers ps WHERE ps.supplier_id = s.id) as project_count
     FROM suppliers s
     WHERE s.tenant_id = ? AND s.is_active = 1
     ORDER BY s.company_name ASC`
  ).bind(user.tenantId).all<SupplierRow & { project_count: number }>()

  return c.json({ suppliers: results })
})

// GET /api/suppliers/:id
suppliers.get('/:id', async c => {
  const user = c.get('user')
  const id = c.req.param('id')

  const supplier = await c.env.DB.prepare(
    'SELECT * FROM suppliers WHERE id = ? AND tenant_id = ?'
  ).bind(id, user.tenantId).first<SupplierRow>()

  if (!supplier) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  return c.json({ supplier })
})

// POST /api/suppliers
suppliers.post('/', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const body = await c.req.json<{
    company_name: string
    contact_name: string
    contact_email: string
    contact_phone?: string
    address_street?: string
    address_city?: string
    address_zip?: string
    address_country?: string
    description?: string
    website?: string
  }>()

  if (!body.company_name?.trim() || !body.contact_name?.trim() || !body.contact_email?.trim()) {
    return c.json({ error: 'company_name, contact_name and contact_email required', code: 'VALIDATION_ERROR', status: 400 }, 400)
  }

  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    `INSERT INTO suppliers (id, tenant_id, company_name, contact_name, contact_email, contact_phone,
      address_street, address_city, address_zip, address_country, description, website)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.tenantId,
    body.company_name.trim(), body.contact_name.trim(), body.contact_email.trim().toLowerCase(),
    body.contact_phone || null,
    body.address_street || null, body.address_city || null, body.address_zip || null,
    body.address_country || 'Deutschland',
    body.description || null, body.website || null,
  ).run()

  const supplier = await c.env.DB.prepare('SELECT * FROM suppliers WHERE id = ?').bind(id).first<SupplierRow>()

  return c.json({ supplier }, 201)
})

// PUT /api/suppliers/:id
suppliers.put('/:id', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const id = c.req.param('id')
  const existing = await c.env.DB.prepare(
    'SELECT id FROM suppliers WHERE id = ? AND tenant_id = ?'
  ).bind(id, user.tenantId).first()

  if (!existing) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  const body = await c.req.json<Partial<SupplierRow>>()

  await c.env.DB.prepare(
    `UPDATE suppliers SET
      company_name = COALESCE(?, company_name),
      contact_name = COALESCE(?, contact_name),
      contact_email = COALESCE(?, contact_email),
      contact_phone = COALESCE(?, contact_phone),
      address_street = COALESCE(?, address_street),
      address_city = COALESCE(?, address_city),
      address_zip = COALESCE(?, address_zip),
      address_country = COALESCE(?, address_country),
      description = COALESCE(?, description),
      website = COALESCE(?, website),
      updated_at = datetime('now')
     WHERE id = ? AND tenant_id = ?`
  ).bind(
    body.company_name || null, body.contact_name || null, body.contact_email || null,
    body.contact_phone || null, body.address_street || null, body.address_city || null,
    body.address_zip || null, body.address_country || null,
    body.description || null, body.website || null,
    id, user.tenantId
  ).run()

  const supplier = await c.env.DB.prepare('SELECT * FROM suppliers WHERE id = ?').bind(id).first<SupplierRow>()

  return c.json({ supplier })
})

// DELETE /api/suppliers/:id (soft delete)
suppliers.delete('/:id', async c => {
  const user = c.get('user')
  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const id = c.req.param('id')
  const existing = await c.env.DB.prepare(
    'SELECT id FROM suppliers WHERE id = ? AND tenant_id = ?'
  ).bind(id, user.tenantId).first()

  if (!existing) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  await c.env.DB.prepare(
    'UPDATE suppliers SET is_active = 0, updated_at = datetime(\'now\') WHERE id = ? AND tenant_id = ?'
  ).bind(id, user.tenantId).run()

  return c.json({ success: true })
})

export default suppliers
