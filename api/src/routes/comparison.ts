import { Hono } from 'hono'
import { requireAuth } from '../middleware'

type Env = { DB: D1Database }
type User = { id: string; tenantId: string; role: string }

const app = new Hono<{ Bindings: Env; Variables: { user: User } }>()
app.use('*', requireAuth)

const FULFILL_SCORE: Record<string, number> = {
  standard: 1.0, konfiguration: 0.9, customizing: 0.7, programmierung: 0.5, nicht_vorhanden: 0,
}

// GET /api/projects/:id/comparison
app.get('/:id/comparison', async c => {
  const { id: projectId } = c.req.param()
  const user = c.get('user')

  const project = await c.env.DB.prepare(
    'SELECT id, title FROM projects WHERE id = ? AND tenant_id = ?'
  ).bind(projectId, user.tenantId).first<{ id: string; title: string }>()
  if (!project) return c.json({ error: 'Not found' }, 404)

  const [suppliersRes, capsRes, responsesRes, financialsRes] = await Promise.all([
    c.env.DB.prepare(`
      SELECT ps.id as ps_id, ps.status, ps.shortlisted,
             s.company_name, s.contact_name, s.logo_url
      FROM project_suppliers ps
      JOIN suppliers s ON s.id = ps.supplier_id
      WHERE ps.project_id = ? AND ps.is_active = 1
      ORDER BY s.company_name
    `).bind(projectId).all<{
      ps_id: string; status: string; shortlisted: number;
      company_name: string; contact_name: string; logo_url: string | null
    }>(),

    c.env.DB.prepare(
      'SELECT id, name, sort_order FROM capabilities WHERE project_id = ? ORDER BY sort_order'
    ).bind(projectId).all<{ id: string; name: string; sort_order: number }>(),

    c.env.DB.prepare(`
      SELECT rr.project_supplier_id, rr.fulfillment, rr.cost_amount,
             r.capability_id, r.weight, r.is_critical
      FROM requirement_responses rr
      JOIN requirements r ON r.id = rr.requirement_id
      WHERE r.project_id = ?
    `).bind(projectId).all<{
      project_supplier_id: string; fulfillment: string; cost_amount: number | null;
      capability_id: string; weight: number; is_critical: number
    }>(),

    c.env.DB.prepare(`
      SELECT fd.*
      FROM financial_data fd
      JOIN project_suppliers ps ON ps.id = fd.project_supplier_id
      WHERE ps.project_id = ?
    `).bind(projectId).all<{
      project_supplier_id: string; submitted_at: string | null;
      ops_one_time: number | null; ops_license_per_month: number | null;
      ops_maintenance_per_month: number | null; ops_other_per_month: number | null;
      adapt_rate_pm: number | null; adapt_rate_consulting: number | null; adapt_rate_development: number | null;
      impl_interfaces: number | null; impl_data_migration: number | null; impl_training: number | null;
      impl_project_mgmt: number | null; impl_consulting: number | null; impl_other: number | null;
    }>(),
  ])

  const financialMap = new Map(financialsRes.results.map(f => [f.project_supplier_id, f]))

  // Per-supplier totals
  const suppliers = suppliersRes.results.map(s => {
    const psResponses = responsesRes.results.filter(r => r.project_supplier_id === s.ps_id)
    const reqTotal = psResponses.length
    const reqFulfilled = psResponses.filter(r => r.fulfillment !== 'nicht_vorhanden').length
    const koViolations = psResponses.filter(r => r.is_critical === 1 && r.fulfillment === 'nicht_vorhanden').length
    const maxScore = psResponses.reduce((a, r) => a + (r.weight ?? 1), 0)
    const actualScore = psResponses.reduce((a, r) => a + (r.weight ?? 1) * (FULFILL_SCORE[r.fulfillment] ?? 0), 0)
    const reqScore = maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : 0

    // Per-capability scores
    const capScores: Record<string, { score: number; koViolations: number; reqCount: number; costAmount: number }> = {}
    for (const cap of capsRes.results) {
      const capResponses = psResponses.filter(r => r.capability_id === cap.id)
      const capMax = capResponses.reduce((a, r) => a + (r.weight ?? 1), 0)
      const capActual = capResponses.reduce((a, r) => a + (r.weight ?? 1) * (FULFILL_SCORE[r.fulfillment] ?? 0), 0)
      const costAmount = capResponses.reduce((a, r) => a + (r.cost_amount ?? 0), 0)
      capScores[cap.id] = {
        score: capMax > 0 ? Math.round((capActual / capMax) * 100) : 0,
        koViolations: capResponses.filter(r => r.is_critical === 1 && r.fulfillment === 'nicht_vorhanden').length,
        reqCount: capResponses.length,
        costAmount,
      }
    }

    const fin = financialMap.get(s.ps_id)

    return {
      psId: s.ps_id,
      companyName: s.company_name,
      contactName: s.contact_name,
      logoUrl: s.logo_url,
      status: s.status,
      shortlisted: s.shortlisted === 1,
      reqTotal, reqFulfilled, koViolations, reqScore,
      capScores,
      financial: fin ? {
        submitted: !!fin.submitted_at,
        ops_one_time: fin.ops_one_time ?? 0,
        ops_license_per_month: fin.ops_license_per_month ?? 0,
        ops_maintenance_per_month: fin.ops_maintenance_per_month ?? 0,
        ops_other_per_month: fin.ops_other_per_month ?? 0,
        adapt_rate_pm: fin.adapt_rate_pm ?? 0,
        adapt_rate_consulting: fin.adapt_rate_consulting ?? 0,
        adapt_rate_development: fin.adapt_rate_development ?? 0,
        impl_interfaces: fin.impl_interfaces ?? 0,
        impl_data_migration: fin.impl_data_migration ?? 0,
        impl_training: fin.impl_training ?? 0,
        impl_project_mgmt: fin.impl_project_mgmt ?? 0,
        impl_consulting: fin.impl_consulting ?? 0,
        impl_other: fin.impl_other ?? 0,
      } : null,
    }
  })

  return c.json({
    projectTitle: project.title,
    suppliers,
    capabilities: capsRes.results,
  })
})

export { app as comparisonRoutes }
