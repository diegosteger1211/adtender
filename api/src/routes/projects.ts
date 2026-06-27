import { Hono } from 'hono'
import { requireAuth } from '../middleware'
import type { ProjectRow } from '../db'

type Bindings = { DB: D1Database; KV: KVNamespace; JWT_SECRET: string }
type Variables = { user: import('../auth').JwtPayload }

const projects = new Hono<{ Bindings: Bindings; Variables: Variables }>()

projects.use('*', requireAuth)

// GET /api/projects
projects.get('/', async c => {
  const user = c.get('user')
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, u.name as created_by_name,
      (SELECT COUNT(*) FROM project_suppliers ps WHERE ps.project_id = p.id) as supplier_count
     FROM projects p
     LEFT JOIN users u ON u.id = p.created_by
     WHERE p.tenant_id = ?
     ORDER BY p.created_at DESC`
  ).bind(user.tenantId).all<ProjectRow & { created_by_name: string; supplier_count: number }>()

  return c.json({ projects: results })
})

// GET /api/projects/:id
projects.get('/:id', async c => {
  const user = c.get('user')
  const id = c.req.param('id')

  const project = await c.env.DB.prepare(
    `SELECT p.*, u.name as created_by_name FROM projects p
     LEFT JOIN users u ON u.id = p.created_by
     WHERE p.id = ? AND p.tenant_id = ?`
  ).bind(id, user.tenantId).first<ProjectRow & { created_by_name: string }>()

  if (!project) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  const { results: suppliers } = await c.env.DB.prepare(
    `SELECT ps.*, s.company_name, s.contact_name, s.contact_email as supplier_email
     FROM project_suppliers ps
     JOIN suppliers s ON s.id = ps.supplier_id
     WHERE ps.project_id = ?
     ORDER BY ps.created_at DESC`
  ).bind(id).all()

  return c.json({ project, suppliers })
})

// POST /api/projects
projects.post('/', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const body = await c.req.json<{
    title: string
    category: string
    description?: string
    phase_start_erstellung?: string
    phase_end_erstellung?: string
    phase_start_ausschreibung?: string
    phase_end_ausschreibung?: string
    phase_start_bewertung?: string
    phase_end_bewertung?: string
    phase_start_entscheidung?: string
    phase_end_entscheidung?: string
  }>()

  if (!body.title?.trim() || !body.category?.trim()) {
    return c.json({ error: 'title and category required', code: 'VALIDATION_ERROR', status: 400 }, 400)
  }

  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    `INSERT INTO projects (
      id, tenant_id, title, category, description, created_by,
      phase_start_erstellung, phase_end_erstellung,
      phase_start_ausschreibung, phase_end_ausschreibung,
      phase_start_bewertung, phase_end_bewertung,
      phase_start_entscheidung, phase_end_entscheidung
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.tenantId, body.title.trim(), body.category.trim(), body.description || null, user.sub,
    body.phase_start_erstellung || null, body.phase_end_erstellung || null,
    body.phase_start_ausschreibung || null, body.phase_end_ausschreibung || null,
    body.phase_start_bewertung || null, body.phase_end_bewertung || null,
    body.phase_start_entscheidung || null, body.phase_end_entscheidung || null,
  ).run()

  const project = await c.env.DB.prepare(
    'SELECT * FROM projects WHERE id = ?'
  ).bind(id).first<ProjectRow>()

  return c.json({ project }, 201)
})

// PUT /api/projects/:id
projects.put('/:id', async c => {
  const user = c.get('user')
  const id = c.req.param('id')

  if (!['admin', 'berater'].includes(user.role)) {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND tenant_id = ?'
  ).bind(id, user.tenantId).first()

  if (!existing) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  const body = await c.req.json<Partial<ProjectRow>>()

  await c.env.DB.prepare(
    `UPDATE projects SET
      title = COALESCE(?, title),
      category = COALESCE(?, category),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      phase = COALESCE(?, phase),
      phase_start_erstellung = COALESCE(?, phase_start_erstellung),
      phase_end_erstellung = COALESCE(?, phase_end_erstellung),
      phase_start_ausschreibung = COALESCE(?, phase_start_ausschreibung),
      phase_end_ausschreibung = COALESCE(?, phase_end_ausschreibung),
      phase_start_bewertung = COALESCE(?, phase_start_bewertung),
      phase_end_bewertung = COALESCE(?, phase_end_bewertung),
      phase_start_entscheidung = COALESCE(?, phase_start_entscheidung),
      phase_end_entscheidung = COALESCE(?, phase_end_entscheidung),
      updated_at = datetime('now')
     WHERE id = ? AND tenant_id = ?`
  ).bind(
    body.title || null, body.category || null, body.description || null,
    body.status || null, body.phase || null,
    body.phase_start_erstellung || null, body.phase_end_erstellung || null,
    body.phase_start_ausschreibung || null, body.phase_end_ausschreibung || null,
    body.phase_start_bewertung || null, body.phase_end_bewertung || null,
    body.phase_start_entscheidung || null, body.phase_end_entscheidung || null,
    id, user.tenantId
  ).run()

  const project = await c.env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<ProjectRow>()

  return c.json({ project })
})

// DELETE /api/projects/:id
projects.delete('/:id', async c => {
  const user = c.get('user')
  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const id = c.req.param('id')
  const existing = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND tenant_id = ?'
  ).bind(id, user.tenantId).first()

  if (!existing) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  await c.env.DB.prepare('DELETE FROM projects WHERE id = ? AND tenant_id = ?').bind(id, user.tenantId).run()

  return c.json({ success: true })
})

export default projects
