import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware'
import type { Env } from '../index'

const app = new Hono<{ Bindings: Env; Variables: { user: { id: string; tenantId: string; role: string } } }>()

app.use('*', requireAuth)
app.use('*', requireRole('admin', 'berater'))

// GET /api/projects/:projectId/settings
app.get('/:projectId/settings', async c => {
  const { projectId } = c.req.param()
  const user = c.get('user')

  const project = await c.env.DB.prepare(
    `SELECT p.*, u.name as created_by_name
     FROM projects p LEFT JOIN users u ON u.id = p.created_by
     WHERE p.id = ? AND p.tenant_id = ?`
  ).bind(projectId, user.tenantId).first()

  if (!project) return c.json({ error: 'Not found' }, 404)

  const suppliers = await c.env.DB.prepare(
    `SELECT ps.id, ps.supplier_id, ps.status, ps.shortlisted,
            ps.access_anforderungen, ps.access_szenarien, ps.access_finanzen,
            s.company_name, s.contact_name, s.contact_email
     FROM project_suppliers ps
     JOIN suppliers s ON s.id = ps.supplier_id
     WHERE ps.project_id = ?
     ORDER BY s.company_name ASC`
  ).bind(projectId).all()

  const members = await c.env.DB.prepare(
    `SELECT pm.id, pm.user_id, pm.role, pm.added_at,
            u.name, u.email
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = ?
     ORDER BY u.name ASC`
  ).bind(projectId).all()

  const allUsers = await c.env.DB.prepare(
    `SELECT id, name, email, role FROM users
     WHERE tenant_id = ? AND role IN ('admin','berater','kunde')
     ORDER BY name ASC`
  ).bind(user.tenantId).all()

  return c.json({ project, suppliers: suppliers.results, members: members.results, allUsers: allUsers.results })
})

// PUT /api/projects/:projectId/settings — update project metadata + phases
app.put('/:projectId/settings', async c => {
  const { projectId } = c.req.param()
  const user = c.get('user')
  const body = await c.req.json<{
    title?: string; description?: string; status?: string; category?: string
    phase_start_erstellung?: string; phase_end_erstellung?: string
    phase_start_ausschreibung?: string; phase_end_ausschreibung?: string
    phase_start_bewertung?: string; phase_end_bewertung?: string
    phase_start_entscheidung?: string; phase_end_entscheidung?: string
  }>()

  await c.env.DB.prepare(
    `UPDATE projects SET
      title = COALESCE(?, title),
      description = ?,
      status = COALESCE(?, status),
      category = COALESCE(?, category),
      phase_start_erstellung = ?,
      phase_end_erstellung = ?,
      phase_start_ausschreibung = ?,
      phase_end_ausschreibung = ?,
      phase_start_bewertung = ?,
      phase_end_bewertung = ?,
      phase_start_entscheidung = ?,
      phase_end_entscheidung = ?,
      updated_at = datetime('now')
     WHERE id = ? AND tenant_id = ?`
  ).bind(
    body.title ?? null,
    body.description ?? null,
    body.status ?? null,
    body.category ?? null,
    body.phase_start_erstellung ?? null,
    body.phase_end_erstellung ?? null,
    body.phase_start_ausschreibung ?? null,
    body.phase_end_ausschreibung ?? null,
    body.phase_start_bewertung ?? null,
    body.phase_end_bewertung ?? null,
    body.phase_start_entscheidung ?? null,
    body.phase_end_entscheidung ?? null,
    projectId, user.tenantId
  ).run()

  return c.json({ success: true })
})

// PUT /api/projects/:projectId/settings/suppliers/:psId — update supplier access & shortlist
app.put('/:projectId/settings/suppliers/:psId', async c => {
  const { projectId, psId } = c.req.param()
  const user = c.get('user')
  const { access_anforderungen, access_szenarien, access_finanzen, shortlisted } = await c.req.json<{
    access_anforderungen?: number; access_szenarien?: number; access_finanzen?: number; shortlisted?: number
  }>()

  await c.env.DB.prepare(
    `UPDATE project_suppliers SET
      access_anforderungen = COALESCE(?, access_anforderungen),
      access_szenarien = COALESCE(?, access_szenarien),
      access_finanzen = COALESCE(?, access_finanzen),
      shortlisted = COALESCE(?, shortlisted)
     WHERE id = ? AND project_id = ?`
  ).bind(
    access_anforderungen ?? null,
    access_szenarien ?? null,
    access_finanzen ?? null,
    shortlisted ?? null,
    psId, projectId
  ).run()

  // Verify belongs to tenant
  const ps = await c.env.DB.prepare(
    `SELECT ps.id FROM project_suppliers ps
     JOIN projects p ON p.id = ps.project_id
     WHERE ps.id = ? AND p.tenant_id = ?`
  ).bind(psId, user.tenantId).first()
  if (!ps) return c.json({ error: 'Not found' }, 404)

  return c.json({ success: true })
})

// POST /api/projects/:projectId/settings/members — add user to project
app.post('/:projectId/settings/members', async c => {
  const { projectId } = c.req.param()
  const user = c.get('user')
  const { user_id, role } = await c.req.json<{ user_id: string; role: string }>()

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT OR IGNORE INTO project_members (id, project_id, user_id, role) VALUES (?, ?, ?, ?)`
  ).bind(id, projectId, user_id, role ?? 'berater').run()

  return c.json({ success: true })
})

// DELETE /api/projects/:projectId/settings/members/:memberId
app.delete('/:projectId/settings/members/:memberId', async c => {
  const { projectId, memberId } = c.req.param()
  await c.env.DB.prepare(
    'DELETE FROM project_members WHERE id = ? AND project_id = ?'
  ).bind(memberId, projectId).run()
  return c.json({ success: true })
})

export { app as projectSettingsRoutes }
