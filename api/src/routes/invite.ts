// Invitation endpoint — generates activation token and sends email via Resend
import { Hono } from 'hono'
import { requireAuth } from '../middleware'

type Bindings = { DB: D1Database; KV: KVNamespace; JWT_SECRET: string; RESEND_API_KEY: string; APP_URL: string }
type Variables = { user: import('../auth').JwtPayload }

const invite = new Hono<{ Bindings: Bindings; Variables: Variables }>()

invite.use('*', requireAuth)

// POST /api/projects/:id/invite/:projectSupplierId
invite.post('/:projectId/invite/:projectSupplierId', async c => {
  const user = c.get('user')
  if (!['admin', 'berater'].includes(user.role)) {
    return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE', status: 403 }, 403)
  }

  const { projectId, projectSupplierId } = c.req.param()

  // Load project + project_supplier + supplier
  const project = await c.env.DB.prepare(
    'SELECT id, title FROM projects WHERE id = ? AND tenant_id = ?'
  ).bind(projectId, user.tenantId).first<{ id: string; title: string }>()
  if (!project) return c.json({ error: 'Project not found', code: 'NOT_FOUND', status: 404 }, 404)

  const ps = await c.env.DB.prepare(
    `SELECT ps.*, s.company_name, s.contact_name, s.contact_email
     FROM project_suppliers ps
     JOIN suppliers s ON s.id = ps.supplier_id
     WHERE ps.id = ? AND ps.project_id = ?`
  ).bind(projectSupplierId, projectId).first<{
    id: string; supplier_id: string; contact_email: string | null
    company_name: string; contact_name: string
  }>()
  if (!ps) return c.json({ error: 'Project supplier not found', code: 'NOT_FOUND', status: 404 }, 404)

  const email = ps.contact_email
  if (!email) return c.json({ error: 'No email for this supplier', code: 'VALIDATION_ERROR', status: 400 }, 400)

  // Generate activation token (48-byte random hex, 7 days TTL)
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32))
  const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Check if portal user already exists for this email + tenant
  const existingUser = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ? AND tenant_id = ?'
  ).bind(email.toLowerCase(), user.tenantId).first<{ id: string }>()

  // Store activation token on project_supplier
  await c.env.DB.prepare(
    `UPDATE project_suppliers SET
       activation_token = ?,
       activation_token_expires_at = ?,
       portal_user_id = ?,
       status = 'invited',
       invitation_sent_at = datetime('now')
     WHERE id = ?`
  ).bind(token, expiresAt, existingUser?.id || null, projectSupplierId).run()

  const appUrl = c.env.APP_URL || 'https://adtender.adesso-consulting.de'
  const activationUrl = `${appUrl}/portal/activate/${token}`

  // Send email via Resend
  const resendKey = c.env.RESEND_API_KEY
  if (resendKey) {
    const emailBody = {
      from: 'adtender <noreply@adtender.adesso-consulting.de>',
      to: [email],
      subject: `Einladung zur Ausschreibung: ${project.title}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="background: #1e40af; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">adtender</h1>
            <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">Ausschreibungsplattform</p>
          </div>

          <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Einladung zur Ausschreibung</h2>
          <p style="color: #6b7280; margin: 0 0 24px;">
            Sehr geehrte/r ${ps.contact_name},<br><br>
            Sie wurden zur Teilnahme an folgender Ausschreibung eingeladen:
          </p>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${project.title}</p>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Unternehmen: ${ps.company_name}</p>
          </div>

          <p style="color: #374151; margin: 0 0 20px;">
            Um an der Ausschreibung teilzunehmen, klicken Sie bitte auf den folgenden Link und ${existingUser ? 'melden Sie sich an' : 'legen Sie Ihr Passwort fest'}:
          </p>

          <a href="${activationUrl}"
             style="display: inline-block; background: #1e40af; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            ${existingUser ? 'Zur Ausschreibung' : 'Konto aktivieren & starten'}
          </a>

          <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0;">
            Dieser Link ist 7 Tage gültig. Bei Fragen wenden Sie sich bitte an Ihren Ansprechpartner.
          </p>
        </div>
      `,
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(emailBody),
    })
  }

  return c.json({ success: true, token, activation_url: activationUrl })
})

export default invite
