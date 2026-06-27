import { Hono } from 'hono'
import { requireAuth } from '../middleware'

type Bindings = { DB: D1Database; KV: KVNamespace; JWT_SECRET: string }
type Variables = { user: import('../auth').JwtPayload }

const ps = new Hono<{ Bindings: Bindings; Variables: Variables }>()

ps.use('*', requireAuth)

// POST /api/projects/:id/suppliers — invite a supplier to a project
ps.post('/:id/suppliers', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const projectId = c.req.param('id')
  const { supplier_id } = await c.req.json<{ supplier_id: string }>()

  if (!supplier_id) {
    return c.json({ error: 'supplier_id required', code: 'VALIDATION_ERROR', status: 400 }, 400)
  }

  // verify both belong to this tenant
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND tenant_id = ?'
  ).bind(projectId, user.tenantId).first()

  if (!project) return c.json({ error: 'Project not found', code: 'NOT_FOUND', status: 404 }, 404)

  const supplier = await c.env.DB.prepare(
    'SELECT id, contact_email FROM suppliers WHERE id = ? AND tenant_id = ?'
  ).bind(supplier_id, user.tenantId).first<{ id: string; contact_email: string }>()

  if (!supplier) return c.json({ error: 'Supplier not found', code: 'NOT_FOUND', status: 404 }, 404)

  const existing = await c.env.DB.prepare(
    'SELECT id FROM project_suppliers WHERE project_id = ? AND supplier_id = ?'
  ).bind(projectId, supplier_id).first()

  if (existing) {
    return c.json({ error: 'Supplier already added to this project', code: 'DUPLICATE', status: 409 }, 409)
  }

  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    `INSERT INTO project_suppliers (id, project_id, supplier_id, contact_email, status)
     VALUES (?, ?, ?, ?, 'pending')`
  ).bind(id, projectId, supplier_id, supplier.contact_email).run()

  return c.json({ success: true, id }, 201)
})

// DELETE /api/projects/:id/suppliers/:supplierId — remove supplier from project
ps.delete('/:id/suppliers/:supplierId', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const projectId = c.req.param('id')
  const supplierId = c.req.param('supplierId')

  await c.env.DB.prepare(
    'DELETE FROM project_suppliers WHERE project_id = ? AND supplier_id = ?'
  ).bind(projectId, supplierId).run()

  return c.json({ success: true })
})

export default ps
