import { Hono } from 'hono'
import { requireAuth } from '../middleware'

type Bindings = { DB: D1Database; KV: KVNamespace; JWT_SECRET: string }
type Variables = { user: import('../auth').JwtPayload }

type CapabilityRow = {
  id: string; project_id: string; tenant_id: string
  name: string; type: string; sort_order: number
  created_at: string; updated_at: string
  requirement_count?: number; total_weight?: number
}

type RequirementRow = {
  id: string; capability_id: string; project_id: string; tenant_id: string
  requirement_id: string | null; requirement_type: string | null
  category1: string | null; category2: string | null; category3: string | null; category4: string | null
  requirement: string; description: string | null
  priority: string | null; weight: number; is_critical: number
  acceptance_criteria: string | null; source: string | null
  demo_scenario: string | null; comment: string | null
  sort_order: number; created_at: string; updated_at: string
}

const r = new Hono<{ Bindings: Bindings; Variables: Variables }>()
r.use('*', requireAuth)

// ── Capabilities ──────────────────────────────────────────────

// GET /api/projects/:projectId/capabilities
r.get('/:projectId/capabilities', async c => {
  const user = c.get('user')
  const projectId = c.req.param('projectId')

  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND tenant_id = ?'
  ).bind(projectId, user.tenantId).first()
  if (!project) return c.json({ error: 'Not found', code: 'NOT_FOUND', status: 404 }, 404)

  const { results } = await c.env.DB.prepare(
    `SELECT cap.*,
      COUNT(req.id) as requirement_count,
      COALESCE(SUM(req.weight), 0) as total_weight
     FROM capabilities cap
     LEFT JOIN requirements req ON req.capability_id = cap.id
     WHERE cap.project_id = ? AND cap.tenant_id = ?
     GROUP BY cap.id
     ORDER BY cap.sort_order ASC, cap.created_at ASC`
  ).bind(projectId, user.tenantId).all<CapabilityRow>()

  return c.json({ capabilities: results })
})

// POST /api/projects/:projectId/capabilities
r.post('/:projectId/capabilities', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)

  const projectId = c.req.param('projectId')
  const body = await c.req.json<{ name: string; type?: string }>()
  if (!body.name?.trim()) return c.json({ error: 'name required', code: 'VALIDATION_ERROR', status: 400 }, 400)

  const { results: existing } = await c.env.DB.prepare(
    'SELECT sort_order FROM capabilities WHERE project_id = ? ORDER BY sort_order DESC LIMIT 1'
  ).bind(projectId).all<{ sort_order: number }>()
  const nextOrder = (existing[0]?.sort_order ?? -1) + 1

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO capabilities (id, project_id, tenant_id, name, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, projectId, user.tenantId, body.name.trim(), body.type || 'functional', nextOrder).run()

  const cap = await c.env.DB.prepare('SELECT * FROM capabilities WHERE id = ?').bind(id).first()
  return c.json({ capability: cap }, 201)
})

// PUT /api/projects/:projectId/capabilities/:id
r.put('/:projectId/capabilities/:id', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)

  const id = c.req.param('id')
  const body = await c.req.json<{ name?: string; type?: string }>()

  await c.env.DB.prepare(
    `UPDATE capabilities SET name = COALESCE(?, name), type = COALESCE(?, type), updated_at = datetime('now') WHERE id = ? AND tenant_id = ?`
  ).bind(body.name || null, body.type || null, id, user.tenantId).run()

  const cap = await c.env.DB.prepare('SELECT * FROM capabilities WHERE id = ?').bind(id).first()
  return c.json({ capability: cap })
})

// DELETE /api/projects/:projectId/capabilities/:id
r.delete('/:projectId/capabilities/:id', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)

  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM capabilities WHERE id = ? AND tenant_id = ?').bind(id, user.tenantId).run()
  return c.json({ success: true })
})

// ── Requirements ──────────────────────────────────────────────

// GET /api/projects/:projectId/requirements  (optionally ?capability_id=)
r.get('/:projectId/requirements', async c => {
  const user = c.get('user')
  const projectId = c.req.param('projectId')
  const capabilityId = c.req.query('capability_id')

  let query = `SELECT req.*, cap.name as capability_name FROM requirements req
    JOIN capabilities cap ON cap.id = req.capability_id
    WHERE req.project_id = ? AND req.tenant_id = ?`
  const params: unknown[] = [projectId, user.tenantId]

  if (capabilityId) { query += ' AND req.capability_id = ?'; params.push(capabilityId) }
  query += ' ORDER BY req.sort_order ASC, req.created_at ASC'

  const { results } = await c.env.DB.prepare(query).bind(...params).all<RequirementRow & { capability_name: string }>()
  return c.json({ requirements: results })
})

// POST /api/projects/:projectId/requirements
r.post('/:projectId/requirements', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)

  const projectId = c.req.param('projectId')
  const body = await c.req.json<Partial<RequirementRow> & { capability_id: string }>()

  if (!body.requirement?.trim() || !body.capability_id) {
    return c.json({ error: 'requirement and capability_id required', code: 'VALIDATION_ERROR', status: 400 }, 400)
  }

  const { results: existing } = await c.env.DB.prepare(
    'SELECT sort_order FROM requirements WHERE capability_id = ? ORDER BY sort_order DESC LIMIT 1'
  ).bind(body.capability_id).all<{ sort_order: number }>()
  const nextOrder = (existing[0]?.sort_order ?? -1) + 1

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO requirements (
      id, capability_id, project_id, tenant_id,
      requirement_id, requirement_type, category1, category2, category3, category4,
      requirement, description, priority, weight, is_critical,
      acceptance_criteria, source, demo_scenario, comment, sort_order
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, body.capability_id, projectId, user.tenantId,
    body.requirement_id || null, body.requirement_type || null,
    body.category1 || null, body.category2 || null, body.category3 || null, body.category4 || null,
    body.requirement.trim(), body.description || null,
    body.priority || null, body.weight ?? 1.0, body.is_critical ? 1 : 0,
    body.acceptance_criteria || null, body.source || null,
    body.demo_scenario || null, body.comment || null, nextOrder
  ).run()

  const req = await c.env.DB.prepare('SELECT * FROM requirements WHERE id = ?').bind(id).first()
  return c.json({ requirement: req }, 201)
})

// PUT /api/projects/:projectId/requirements/:id
r.put('/:projectId/requirements/:id', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)

  const id = c.req.param('id')
  const body = await c.req.json<Partial<RequirementRow>>()

  await c.env.DB.prepare(
    `UPDATE requirements SET
      requirement_id = COALESCE(?, requirement_id),
      requirement_type = COALESCE(?, requirement_type),
      category1 = COALESCE(?, category1), category2 = COALESCE(?, category2),
      category3 = COALESCE(?, category3), category4 = COALESCE(?, category4),
      requirement = COALESCE(?, requirement), description = COALESCE(?, description),
      priority = COALESCE(?, priority), weight = COALESCE(?, weight),
      is_critical = COALESCE(?, is_critical),
      acceptance_criteria = COALESCE(?, acceptance_criteria),
      source = COALESCE(?, source), demo_scenario = COALESCE(?, demo_scenario),
      comment = COALESCE(?, comment),
      updated_at = datetime('now')
     WHERE id = ? AND tenant_id = ?`
  ).bind(
    body.requirement_id || null, body.requirement_type || null,
    body.category1 || null, body.category2 || null, body.category3 || null, body.category4 || null,
    body.requirement || null, body.description || null,
    body.priority || null, body.weight ?? null,
    body.is_critical !== undefined ? (body.is_critical ? 1 : 0) : null,
    body.acceptance_criteria || null, body.source || null,
    body.demo_scenario || null, body.comment || null,
    id, user.tenantId
  ).run()

  const req = await c.env.DB.prepare('SELECT * FROM requirements WHERE id = ?').bind(id).first()
  return c.json({ requirement: req })
})

// DELETE /api/projects/:projectId/requirements/:id
r.delete('/:projectId/requirements/:id', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)

  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM requirements WHERE id = ? AND tenant_id = ?').bind(id, user.tenantId).run()
  return c.json({ success: true })
})

// ── Bulk import ───────────────────────────────────────────────

// POST /api/projects/:projectId/requirements/import
r.post('/:projectId/requirements/import', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)

  const projectId = c.req.param('projectId')
  const body = await c.req.json<{ rows: Partial<RequirementRow & { capability_name: string }>[] }>()

  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    return c.json({ error: 'rows array required', code: 'VALIDATION_ERROR', status: 400 }, 400)
  }

  // auto-create capabilities by name
  const capCache: Record<string, string> = {}
  const { results: existingCaps } = await c.env.DB.prepare(
    'SELECT id, name FROM capabilities WHERE project_id = ? AND tenant_id = ?'
  ).bind(projectId, user.tenantId).all<{ id: string; name: string }>()
  for (const cap of existingCaps) capCache[cap.name.toLowerCase()] = cap.id

  let imported = 0
  let sortBase = 0

  for (const row of body.rows) {
    if (!row.requirement?.trim()) continue

    const capName = (row.capability_name || row.category1 || 'Allgemein').trim()
    const capKey = capName.toLowerCase()

    if (!capCache[capKey]) {
      const capId = crypto.randomUUID()
      const capOrder = Object.keys(capCache).length
      await c.env.DB.prepare(
        'INSERT INTO capabilities (id, project_id, tenant_id, name, sort_order) VALUES (?, ?, ?, ?, ?)'
      ).bind(capId, projectId, user.tenantId, capName, capOrder).run()
      capCache[capKey] = capId
    }

    const capabilityId = capCache[capKey]
    const id = crypto.randomUUID()

    await c.env.DB.prepare(
      `INSERT INTO requirements (
        id, capability_id, project_id, tenant_id,
        requirement_id, requirement_type, category1, category2, category3, category4,
        requirement, description, priority, weight, is_critical,
        acceptance_criteria, source, demo_scenario, comment, sort_order
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      id, capabilityId, projectId, user.tenantId,
      row.requirement_id || null, row.requirement_type || null,
      row.category1 || null, row.category2 || null, row.category3 || null, row.category4 || null,
      row.requirement.trim(), row.description || null,
      row.priority || null, row.weight ?? 1.0, row.is_critical ? 1 : 0,
      row.acceptance_criteria || null, row.source || null,
      row.demo_scenario || null, row.comment || null, sortBase++
    ).run()
    imported++
  }

  return c.json({ imported, capabilities_created: Object.keys(capCache).length - existingCaps.length })
})

// ── Supplier responses ────────────────────────────────────────

// PUT /api/projects/:projectId/requirements/:reqId/response
r.put('/:projectId/requirements/:reqId/response', async c => {
  const user = c.get('user')
  const reqId = c.req.param('reqId')
  const projectId = c.req.param('projectId')

  const body = await c.req.json<{ project_supplier_id: string; fulfillment?: string; comment?: string }>()
  if (!body.project_supplier_id) return c.json({ error: 'project_supplier_id required', code: 'VALIDATION_ERROR', status: 400 }, 400)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO requirement_responses (id, requirement_id, project_supplier_id, fulfillment, comment)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(requirement_id, project_supplier_id) DO UPDATE SET
       fulfillment = excluded.fulfillment,
       comment = excluded.comment,
       updated_at = datetime('now')`
  ).bind(id, reqId, body.project_supplier_id, body.fulfillment || null, body.comment || null).run()

  return c.json({ success: true })
})

// GET /api/projects/:projectId/requirements/:reqId/responses
r.get('/:projectId/requirements/:reqId/responses', async c => {
  const user = c.get('user')
  const reqId = c.req.param('reqId')

  const { results } = await c.env.DB.prepare(
    `SELECT rr.*, s.company_name FROM requirement_responses rr
     JOIN project_suppliers ps ON ps.id = rr.project_supplier_id
     JOIN suppliers s ON s.id = ps.supplier_id
     WHERE rr.requirement_id = ?`
  ).bind(reqId).all()

  return c.json({ responses: results })
})

export default r
