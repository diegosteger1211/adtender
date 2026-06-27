import { Hono } from 'hono'
import { requireAuth } from '../middleware'

type Bindings = { DB: D1Database; KV: KVNamespace; JWT_SECRET: string }
type Variables = { user: import('../auth').JwtPayload }

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', requireAuth)

// ─── Notes ────────────────────────────────────────────────────────────────────

// GET /api/apps/notes
app.get('/notes', async c => {
  const user = c.get('user')
  const projectId = c.req.query('project_id')

  let query = `SELECT * FROM notes WHERE tenant_id = ? AND user_id = ?`
  const bindings: unknown[] = [user.tenantId, user.id]

  if (projectId) {
    query += ` AND project_id = ?`
    bindings.push(projectId)
  }

  query += ` ORDER BY pinned DESC, updated_at DESC`

  const rows = await c.env.DB.prepare(query).bind(...bindings).all()
  return c.json({ notes: rows.results })
})

// POST /api/apps/notes
app.post('/notes', async c => {
  const user = c.get('user')
  const { title, content, color, project_id, pinned } = await c.req.json<{
    title?: string; content?: string; color?: string; project_id?: string; pinned?: boolean
  }>()

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO notes (id, tenant_id, user_id, project_id, title, content, color, pinned)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.tenantId, user.id,
    project_id ?? null,
    title?.trim() || 'Neue Notiz',
    content ?? null,
    color ?? 'default',
    pinned ? 1 : 0
  ).run()

  const row = await c.env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first()
  return c.json({ note: row }, 201)
})

// PUT /api/apps/notes/:id
app.put('/notes/:id', async c => {
  const user = c.get('user')
  const { id } = c.req.param()
  const { title, content, color, project_id, pinned } = await c.req.json<{
    title?: string; content?: string; color?: string; project_id?: string; pinned?: boolean
  }>()

  await c.env.DB.prepare(
    `UPDATE notes SET
      title = COALESCE(?, title),
      content = ?,
      color = COALESCE(?, color),
      project_id = ?,
      pinned = COALESCE(?, pinned),
      updated_at = datetime('now')
     WHERE id = ? AND tenant_id = ? AND user_id = ?`
  ).bind(
    title ?? null, content ?? null, color ?? null,
    project_id ?? null, pinned !== undefined ? (pinned ? 1 : 0) : null,
    id, user.tenantId, user.id
  ).run()

  return c.json({ success: true })
})

// DELETE /api/apps/notes/:id
app.delete('/notes/:id', async c => {
  const user = c.get('user')
  const { id } = c.req.param()

  await c.env.DB.prepare(
    'DELETE FROM notes WHERE id = ? AND tenant_id = ? AND user_id = ?'
  ).bind(id, user.tenantId, user.id).run()

  return c.json({ success: true })
})

// ─── Custom Templates ──────────────────────────────────────────────────────────

// GET /api/apps/custom-templates
app.get('/custom-templates', async c => {
  const user = c.get('user')
  const type = c.req.query('type')

  let query = `SELECT * FROM custom_templates
               WHERE tenant_id = ? AND (created_by = ? OR is_public = 1)`
  const bindings: unknown[] = [user.tenantId, user.id]

  if (type) {
    query += ` AND type = ?`
    bindings.push(type)
  }
  query += ` ORDER BY created_at DESC`

  const rows = await c.env.DB.prepare(query).bind(...bindings).all()
  return c.json({ templates: rows.results })
})

// POST /api/apps/custom-templates
app.post('/custom-templates', async c => {
  const user = c.get('user')
  const { type, category, name, description, data, is_public } = await c.req.json<{
    type: string; category?: string; name: string; description?: string; data: unknown; is_public?: boolean
  }>()

  if (!type || !name) return c.json({ error: 'type und name sind erforderlich.' }, 400)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO custom_templates (id, tenant_id, created_by, type, category, name, description, data, is_public)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.tenantId, user.id, type, category ?? null,
    name, description ?? null, JSON.stringify(data), is_public ? 1 : 0
  ).run()

  const row = await c.env.DB.prepare('SELECT * FROM custom_templates WHERE id = ?').bind(id).first()
  return c.json({ template: row }, 201)
})

// DELETE /api/apps/custom-templates/:id
app.delete('/custom-templates/:id', async c => {
  const user = c.get('user')
  const { id } = c.req.param()

  await c.env.DB.prepare(
    'DELETE FROM custom_templates WHERE id = ? AND tenant_id = ? AND created_by = ?'
  ).bind(id, user.tenantId, user.id).run()

  return c.json({ success: true })
})

// ─── Fit-Gap ───────────────────────────────────────────────────────────────────

// GET /api/apps/fit-gap/:projectId
app.get('/fit-gap/:projectId', async c => {
  const user = c.get('user')
  const { projectId } = c.req.param()

  const project = await c.env.DB.prepare(
    `SELECT id, title FROM projects WHERE id = ? AND tenant_id = ?`
  ).bind(projectId, user.tenantId).first<{ id: string; title: string }>()

  if (!project) return c.json({ error: 'Projekt nicht gefunden.' }, 404)

  const capabilitiesResult = await c.env.DB.prepare(
    `SELECT id, name, type FROM capabilities WHERE project_id = ? AND tenant_id = ? ORDER BY sort_order ASC`
  ).bind(projectId, user.tenantId).all()

  const requirementsResult = await c.env.DB.prepare(
    `SELECT id, capability_id, requirement, priority, weight, is_critical
     FROM requirements WHERE project_id = ? AND tenant_id = ? ORDER BY sort_order ASC`
  ).bind(projectId, user.tenantId).all()

  const suppliersResult = await c.env.DB.prepare(
    `SELECT s.id, s.company_name, ps.status, ps.id as project_supplier_id
     FROM project_suppliers ps
     JOIN suppliers s ON s.id = ps.supplier_id
     WHERE ps.project_id = ? AND ps.tenant_id = ?
     ORDER BY s.company_name ASC`
  ).bind(projectId, user.tenantId).all()

  // Get requirement responses (supplier answers)
  const responsesResult = await c.env.DB.prepare(
    `SELECT rr.requirement_id, rr.project_supplier_id, rr.fulfillment
     FROM requirement_responses rr
     JOIN project_suppliers ps ON ps.id = rr.project_supplier_id
     WHERE ps.project_id = ? AND ps.tenant_id = ?`
  ).bind(projectId, user.tenantId).all()

  return c.json({
    project,
    capabilities: capabilitiesResult.results,
    requirements: requirementsResult.results,
    suppliers: suppliersResult.results,
    responses: responsesResult.results,
  })
})

// ─── Prequalifications ────────────────────────────────────────────────────────

// GET /api/apps/prequalifications/suppliers
app.get('/prequalifications/suppliers', async c => {
  const user = c.get('user')

  const rows = await c.env.DB.prepare(
    `SELECT id, company_name, status FROM suppliers WHERE tenant_id = ? ORDER BY company_name ASC`
  ).bind(user.tenantId).all()

  return c.json({ suppliers: rows.results })
})

// GET /api/apps/prequalifications
app.get('/prequalifications', async c => {
  const user = c.get('user')

  const rows = await c.env.DB.prepare(
    `SELECT sp.*, s.company_name, u.name as evaluator_name
     FROM supplier_prequalifications sp
     JOIN suppliers s ON s.id = sp.supplier_id
     JOIN users u ON u.id = sp.evaluator_id
     WHERE sp.tenant_id = ?
     ORDER BY sp.evaluated_at DESC`
  ).bind(user.tenantId).all()

  return c.json({ prequalifications: rows.results })
})

// POST /api/apps/prequalifications
app.post('/prequalifications', async c => {
  const user = c.get('user')
  const { supplier_id, template_name, scores, total_score, recommendation, notes } = await c.req.json<{
    supplier_id: string; template_name?: string; scores: unknown[]; total_score: number; recommendation: string; notes?: string
  }>()

  if (!supplier_id || !scores || !recommendation) {
    return c.json({ error: 'supplier_id, scores und recommendation sind erforderlich.' }, 400)
  }

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO supplier_prequalifications
      (id, tenant_id, supplier_id, evaluator_id, template_name, scores, total_score, recommendation, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.tenantId, supplier_id, user.id,
    template_name ?? 'Standard',
    JSON.stringify(scores),
    total_score,
    recommendation,
    notes ?? null
  ).run()

  const row = await c.env.DB.prepare('SELECT * FROM supplier_prequalifications WHERE id = ?').bind(id).first()
  return c.json({ prequalification: row }, 201)
})

export { app as appRoutes }
