import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware'
import type { Env } from '../index'

const app = new Hono<{ Bindings: Env; Variables: { user: { id: string; tenantId: string; role: string } } }>()

app.use('*', requireAuth)

// GET /api/projects/:projectId/scenarios
app.get('/:projectId/scenarios', async c => {
  const { projectId } = c.req.param()
  const user = c.get('user')

  const rows = await c.env.DB.prepare(
    `SELECT s.*, u.name as created_by_name
     FROM scenarios s
     LEFT JOIN users u ON u.id = s.created_by
     WHERE s.project_id = ? AND s.tenant_id = ?
     ORDER BY s.sort_order ASC, s.created_at ASC`
  ).bind(projectId, user.tenantId).all()

  return c.json({ scenarios: rows.results })
})

// POST /api/projects/:projectId/scenarios
app.post('/:projectId/scenarios', requireRole('admin', 'berater'), async c => {
  const { projectId } = c.req.param()
  const user = c.get('user')
  const { title, description, sort_order } = await c.req.json<{
    title: string; description?: string; sort_order?: number
  }>()

  if (!title?.trim()) return c.json({ error: 'Titel erforderlich.' }, 400)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO scenarios (id, project_id, tenant_id, title, description, sort_order, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, projectId, user.tenantId, title.trim(), description ?? null, sort_order ?? 0, user.id).run()

  const row = await c.env.DB.prepare('SELECT * FROM scenarios WHERE id = ?').bind(id).first()
  return c.json({ scenario: row }, 201)
})

// PUT /api/projects/:projectId/scenarios/:id
app.put('/:projectId/scenarios/:id', requireRole('admin', 'berater'), async c => {
  const { projectId, id } = c.req.param()
  const user = c.get('user')
  const { title, description, sort_order } = await c.req.json<{
    title?: string; description?: string; sort_order?: number
  }>()

  await c.env.DB.prepare(
    `UPDATE scenarios SET
      title = COALESCE(?, title),
      description = ?,
      sort_order = COALESCE(?, sort_order),
      updated_at = datetime('now')
     WHERE id = ? AND project_id = ? AND tenant_id = ?`
  ).bind(title ?? null, description ?? null, sort_order ?? null, id, projectId, user.tenantId).run()

  return c.json({ success: true })
})

// DELETE /api/projects/:projectId/scenarios/:id
app.delete('/:projectId/scenarios/:id', requireRole('admin', 'berater'), async c => {
  const { projectId, id } = c.req.param()
  const user = c.get('user')

  await c.env.DB.prepare(
    'DELETE FROM scenarios WHERE id = ? AND project_id = ? AND tenant_id = ?'
  ).bind(id, projectId, user.tenantId).run()

  return c.json({ success: true })
})

export { app as scenarioRoutes }
