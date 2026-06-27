import { Hono } from 'hono'
import { requireAuth, requireRole } from '../middleware'

type Env = { DB: D1Database }
type User = { id: string; tenantId: string; role: string }

const app = new Hono<{ Bindings: Env; Variables: { user: User } }>()
app.use('*', requireAuth)

const FULFILL_SCORE: Record<string, number> = {
  standard: 1.0,
  konfiguration: 0.9,
  customizing: 0.7,
  programmierung: 0.5,
  nicht_vorhanden: 0,
}

// GET /api/projects/:id/ranking
app.get('/:id/ranking', async c => {
  const { id: projectId } = c.req.param()
  const user = c.get('user')

  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND tenant_id = ?'
  ).bind(projectId, user.tenantId).first()
  if (!project) return c.json({ error: 'Not found' }, 404)

  const suppliers = await c.env.DB.prepare(`
    SELECT ps.id as ps_id, ps.status, ps.shortlisted,
           s.id as supplier_id, s.company_name, s.contact_name, s.description, s.website, s.logo_url,
           s.address_city, s.address_country
    FROM project_suppliers ps
    JOIN suppliers s ON s.id = ps.supplier_id
    WHERE ps.project_id = ? AND ps.is_active = 1
    ORDER BY s.company_name
  `).bind(projectId).all<{
    ps_id: string; status: string; shortlisted: number;
    supplier_id: string; company_name: string; contact_name: string;
    description: string | null; website: string | null; logo_url: string | null;
    address_city: string | null; address_country: string | null
  }>()

  const responses = await c.env.DB.prepare(`
    SELECT rr.project_supplier_id, rr.fulfillment, r.is_critical, r.weight
    FROM requirement_responses rr
    JOIN requirements r ON r.id = rr.requirement_id
    WHERE r.project_id = ?
  `).bind(projectId).all<{
    project_supplier_id: string; fulfillment: string; is_critical: number; weight: number
  }>()

  const prequalScores = await c.env.DB.prepare(`
    SELECT sp.project_supplier_id, sp.total_score
    FROM supplier_prequalifications sp
    JOIN project_suppliers ps ON ps.id = sp.project_supplier_id
    WHERE ps.project_id = ?
  `).bind(projectId).all<{ project_supplier_id: string; total_score: number }>()

  const prequalMap = new Map(prequalScores.results.map(p => [p.project_supplier_id, p.total_score]))

  const result = suppliers.results.map(s => {
    const psResponses = responses.results.filter(r => r.project_supplier_id === s.ps_id)
    const reqTotal = psResponses.length
    const reqFulfilled = psResponses.filter(r => r.fulfillment !== 'nicht_vorhanden').length
    const koViolations = psResponses.filter(r => r.is_critical === 1 && r.fulfillment === 'nicht_vorhanden').length

    const maxScore = psResponses.reduce((acc, r) => acc + (r.weight ?? 1), 0)
    const actualScore = psResponses.reduce((acc, r) => acc + (r.weight ?? 1) * (FULFILL_SCORE[r.fulfillment] ?? 0), 0)
    const reqScore = maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : 0

    return {
      psId: s.ps_id,
      supplierId: s.supplier_id,
      companyName: s.company_name,
      contactName: s.contact_name,
      description: s.description,
      website: s.website,
      logoUrl: s.logo_url,
      location: [s.address_city, s.address_country].filter(Boolean).join(', '),
      status: s.status,
      shortlisted: s.shortlisted === 1,
      prequalScore: prequalMap.get(s.ps_id) ?? null,
      reqTotal,
      reqFulfilled,
      koViolations,
      reqScore,
    }
  })

  return c.json({ suppliers: result })
})

// PUT /api/projects/:id/ranking/shortlist — bulk update shortlist flags
app.put('/:id/ranking/shortlist', requireRole('admin', 'berater'), async c => {
  const { id: projectId } = c.req.param()
  const user = c.get('user')
  const { updates } = await c.req.json<{ updates: Array<{ psId: string; shortlisted: boolean }> }>()

  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND tenant_id = ?'
  ).bind(projectId, user.tenantId).first()
  if (!project) return c.json({ error: 'Not found' }, 404)

  for (const u of updates) {
    await c.env.DB.prepare(
      'UPDATE project_suppliers SET shortlisted = ? WHERE id = ? AND project_id = ?'
    ).bind(u.shortlisted ? 1 : 0, u.psId, projectId).run()
  }

  return c.json({ success: true })
})

export { app as rankingRoutes }
