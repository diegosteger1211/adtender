import { Hono } from 'hono'
import { requireAuth } from '../middleware'

type Env = { DB: D1Database; R2: R2Bucket }
type User = { id: string; tenantId: string; role: string }

const app = new Hono<{ Bindings: Env; Variables: { user: User } }>()
app.use('*', requireAuth)

// Verify project belongs to tenant, return project row
async function getProject(db: D1Database, projectId: string, tenantId: string) {
  return db.prepare('SELECT id FROM projects WHERE id = ? AND tenant_id = ?')
    .bind(projectId, tenantId).first<{ id: string }>()
}

// GET /api/projects/:projectId/checklists
app.get('/:projectId/checklists', async c => {
  const { projectId } = c.req.param()
  const user = c.get('user')

  if (!await getProject(c.env.DB, projectId, user.tenantId))
    return c.json({ error: 'Not found' }, 404)

  const checklists = await c.env.DB.prepare(
    `SELECT cl.*,
       (SELECT json_group_array(json_object('sheet_name', sc.sheet_name, 'classification', sc.classification))
        FROM checklist_sheet_classifications sc WHERE sc.checklist_id = cl.id) as classifications
     FROM project_checklists cl
     WHERE cl.project_id = ?
     ORDER BY cl.uploaded_at DESC`
  ).bind(projectId).all()

  return c.json({ checklists: checklists.results })
})

// POST /api/projects/:projectId/checklists — multipart upload
app.post('/:projectId/checklists', async c => {
  const { projectId } = c.req.param()
  const user = c.get('user')

  if (!await getProject(c.env.DB, projectId, user.tenantId))
    return c.json({ error: 'Not found' }, 404)

  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  if (!file) return c.json({ error: 'No file provided' }, 400)

  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream',
  ]
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['xlsx', 'xls'].includes(ext ?? ''))
    return c.json({ error: 'Only .xlsx and .xls files are accepted' }, 400)

  if (file.size > 20 * 1024 * 1024)
    return c.json({ error: 'File too large (max 20 MB)' }, 400)

  const id = crypto.randomUUID()
  const r2Key = `checklists/${projectId}/${id}.${ext}`

  await c.env.R2.put(r2Key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  })

  await c.env.DB.prepare(
    `INSERT INTO project_checklists (id, project_id, filename, file_size, r2_key, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, projectId, file.name, file.size, r2Key, user.id).run()

  return c.json({ success: true, id })
})

// PUT /api/projects/:projectId/checklists/:id/classify — save sheet classifications
app.put('/:projectId/checklists/:id/classify', async c => {
  const { projectId, id } = c.req.param()
  const user = c.get('user')

  if (!await getProject(c.env.DB, projectId, user.tenantId))
    return c.json({ error: 'Not found' }, 404)

  const cl = await c.env.DB.prepare(
    'SELECT id FROM project_checklists WHERE id = ? AND project_id = ?'
  ).bind(id, projectId).first()
  if (!cl) return c.json({ error: 'Checklist not found' }, 404)

  const { classifications } = await c.req.json<{ classifications: { sheet_name: string; classification: string }[] }>()
  if (!Array.isArray(classifications)) return c.json({ error: 'Invalid payload' }, 400)

  for (const { sheet_name, classification } of classifications) {
    const scId = crypto.randomUUID()
    await c.env.DB.prepare(
      `INSERT INTO checklist_sheet_classifications (id, checklist_id, sheet_name, classification, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(checklist_id, sheet_name) DO UPDATE SET classification = excluded.classification, updated_at = excluded.updated_at`
    ).bind(scId, id, sheet_name, classification).run()
  }

  return c.json({ success: true })
})

// DELETE /api/projects/:projectId/checklists/:id
app.delete('/:projectId/checklists/:id', async c => {
  const { projectId, id } = c.req.param()
  const user = c.get('user')

  if (!await getProject(c.env.DB, projectId, user.tenantId))
    return c.json({ error: 'Not found' }, 404)

  const cl = await c.env.DB.prepare(
    'SELECT r2_key FROM project_checklists WHERE id = ? AND project_id = ?'
  ).bind(id, projectId).first<{ r2_key: string }>()
  if (!cl) return c.json({ error: 'Not found' }, 404)

  await c.env.R2.delete(cl.r2_key)
  await c.env.DB.prepare('DELETE FROM project_checklists WHERE id = ?').bind(id).run()

  return c.json({ success: true })
})

// GET /api/projects/:projectId/checklists/:id/download
app.get('/:projectId/checklists/:id/download', async c => {
  const { projectId, id } = c.req.param()
  const user = c.get('user')

  if (!await getProject(c.env.DB, projectId, user.tenantId))
    return c.json({ error: 'Not found' }, 404)

  const cl = await c.env.DB.prepare(
    'SELECT filename, r2_key FROM project_checklists WHERE id = ? AND project_id = ?'
  ).bind(id, projectId).first<{ filename: string; r2_key: string }>()
  if (!cl) return c.json({ error: 'Not found' }, 404)

  const obj = await c.env.R2.get(cl.r2_key)
  if (!obj) return c.json({ error: 'File not found in storage' }, 404)

  const headers = new Headers()
  headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(cl.filename)}"`)
  return new Response(obj.body, { headers })
})

export { app as checklistRoutes }
