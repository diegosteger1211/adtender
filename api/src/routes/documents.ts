import { Hono } from 'hono'
import { requireAuth } from '../middleware'
type DocEnv = { DB: D1Database; R2: R2Bucket }

const app = new Hono<{ Bindings: DocEnv; Variables: { user: { id: string; tenantId: string; role: string } } }>()

app.use('*', requireAuth)

// GET /api/projects/:projectId/suppliers/:psId/documents
app.get('/:projectId/suppliers/:psId/documents', async c => {
  const { psId } = c.req.param()
  const user = c.get('user')

  // Verify project belongs to tenant
  const ps = await c.env.DB.prepare(
    `SELECT ps.id FROM project_suppliers ps
     JOIN projects p ON p.id = ps.project_id
     WHERE ps.id = ? AND p.tenant_id = ?`
  ).bind(psId, user.tenantId).first()
  if (!ps) return c.json({ error: 'Not found' }, 404)

  const docs = await c.env.DB.prepare(
    'SELECT * FROM supplier_documents WHERE project_supplier_id = ? ORDER BY uploaded_at DESC'
  ).bind(psId).all()

  return c.json({ documents: docs.results })
})

// DELETE /api/documents/:docId
app.delete('/documents/:docId', async c => {
  const { docId } = c.req.param()
  const user = c.get('user')

  const doc = await c.env.DB.prepare(
    `SELECT sd.*, p.tenant_id FROM supplier_documents sd
     JOIN project_suppliers ps ON ps.id = sd.project_supplier_id
     JOIN projects p ON p.id = ps.project_id
     WHERE sd.id = ?`
  ).bind(docId).first<{ r2_key: string; tenant_id: string }>()

  if (!doc || doc.tenant_id !== user.tenantId) return c.json({ error: 'Not found' }, 404)

  await c.env.R2.delete(doc.r2_key)
  await c.env.DB.prepare('DELETE FROM supplier_documents WHERE id = ?').bind(docId).run()

  return c.json({ success: true })
})

// GET /api/documents/:docId/download — stream from R2
app.get('/documents/:docId/download', async c => {
  const { docId } = c.req.param()
  const user = c.get('user')

  const doc = await c.env.DB.prepare(
    `SELECT sd.*, p.tenant_id FROM supplier_documents sd
     JOIN project_suppliers ps ON ps.id = sd.project_supplier_id
     JOIN projects p ON p.id = ps.project_id
     WHERE sd.id = ?`
  ).bind(docId).first<{ r2_key: string; filename: string; content_type: string; tenant_id: string }>()

  if (!doc || doc.tenant_id !== user.tenantId) return c.json({ error: 'Not found' }, 404)

  const obj = await c.env.R2.get(doc.r2_key)
  if (!obj) return c.json({ error: 'File not found in storage' }, 404)

  const headers = new Headers()
  headers.set('Content-Type', doc.content_type || 'application/octet-stream')
  headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.filename)}"`)

  return new Response(obj.body, { headers })
})

export { app as documentRoutes }
