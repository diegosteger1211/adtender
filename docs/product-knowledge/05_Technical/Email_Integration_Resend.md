---
id: PKB-05-005
title: Email Integration — Resend
version: 1.0
status: APPROVED
owner: Technical Architecture
depends_on:
  - PKB-05-002
  - PKB-05-003
tags:
  - technical
  - email
  - resend
  - transactional
---

# Email Integration — Resend

---

## 1. Purpose

Resend is the sole transactional email provider for adtender. All system-generated emails — invitations, notifications, clarification answers, decision approvals — are sent via Resend from the Cloudflare Worker.

Resend uses the standard HTTP REST API. The `resend` npm package wraps this API and works in Cloudflare Workers without Node.js dependencies.

---

## 2. Sender Domain Setup

All emails are sent from: `noreply@adtender.adesso-consulting.de`

### DNS Records Required

These must be added to the `adesso-consulting.de` DNS zone in Cloudflare:

| Type | Name | Value | Purpose |
|---|---|---|---|
| TXT | `resend._domainkey.adtender` | (provided by Resend) | DKIM signature — Resend provides the exact value |
| TXT | `@` or `adtender` | `v=spf1 include:amazonses.com ~all` | SPF record — confirm exact value in Resend dashboard |
| CNAME | `resend._domainkey.adtender` | (provided by Resend) | DKIM — Resend may use CNAME instead of TXT depending on setup |

> **Action required:** Go to Resend dashboard → Domains → Add domain → enter `adtender.adesso-consulting.de` → Resend provides the exact DNS records to add.

After adding DNS records, click "Verify" in Resend. Verification takes 5–30 minutes (DNS propagation).

---

## 3. API Key Setup

1. Resend dashboard → API Keys → Create API Key
2. Name: `adtender-production`
3. Permission: `Sending access` (not full access)
4. Domain: restrict to `adtender.adesso-consulting.de`
5. Copy the key immediately (shown only once)
6. Store in Cloudflare Worker secrets: `wrangler secret put RESEND_API_KEY`

For staging: create a separate key named `adtender-staging` and store it in the staging Worker secrets.

For local development: use a Resend test API key (emails are sent to the Resend test environment, not actually delivered).

---

## 4. Worker Integration

### Package installation

```bash
cd api && npm install resend
```

### Resend client (Worker)

```typescript
// api/src/lib/email.ts
import { Resend } from 'resend'

export function createResendClient(apiKey: string) {
  return new Resend(apiKey)
}

export async function sendEmail(
  resend: Resend,
  options: {
    to: string | string[]
    subject: string
    html: string
    replyTo?: string
  }
) {
  const { error } = await resend.emails.send({
    from: 'adtender <noreply@adtender.adesso-consulting.de>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
  })

  if (error) {
    // Log error; do not throw — email failure must not break the primary operation
    console.error('Resend email error:', error)
    return false
  }

  return true
}
```

---

## 5. Email Types Catalog

All transactional emails adtender sends:

| Email | Trigger | Recipient | Priority |
|---|---|---|---|
| **User invitation** | Org Admin invites a new user | New user (buyer) | Phase 1 |
| **Supplier portal invitation** | Tender published; supplier invited | Supplier contact | Phase 2 |
| **Supplier invitation resend** | PM clicks "Resend invitation" | Supplier contact | Phase 2 |
| **Clarification answer (private)** | PM publishes private answer | Asking supplier | Phase 3 |
| **Clarification answer (all suppliers)** | PM publishes answer to all | All invited suppliers | Phase 3 |
| **Amendment notice** | PM issues amendment | All invited suppliers | Phase 3 |
| **Evaluation task assigned** | Evaluator assigned to tender | Evaluator | Phase 3 |
| **Evaluation reminder** | PM sends reminder | Evaluator with incomplete scores | Phase 3 |
| **Decision board convened** | PM configures decision board | All board members | Phase 3 |
| **COI declaration reminder** | Board member has not declared | Board member | Phase 3 |
| **Decision approved** | All board members approved | PM, Project Manager | Phase 3 |
| **Password reset** | User requests reset | User | Phase 1 |
| **Submission deadline reminder** | 48h before deadline | All suppliers not yet submitted | Phase 2 |

---

## 6. Email Templates

Templates are HTML strings generated in the Worker. Keep templates simple and email-client-compatible:

- Use inline CSS only (no `<style>` blocks — many email clients strip them)
- Use table-based layouts for reliable rendering in Outlook
- No JavaScript in email HTML
- Test in at least: Gmail, Outlook, Apple Mail

**Template location:** `api/src/emails/` — one file per email type.

**Example — Supplier Invitation:**

```typescript
// api/src/emails/supplier-invitation.ts
export function supplierInvitationEmail(params: {
  supplierName: string
  tenderTitle: string
  deadline: string
  invitationUrl: string
  buyerName: string
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Tender Invitation: ${params.tenderTitle}</h2>
      <p>Dear ${params.supplierName},</p>
      <p>You have been invited to participate in the following tender:</p>
      <p style="font-weight: bold;">${params.tenderTitle}</p>
      <p>Submission deadline: <strong>${params.deadline}</strong></p>
      <p>
        <a href="${params.invitationUrl}"
           style="background: #2563eb; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Access Tender Portal
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        This invitation was sent by ${params.buyerName} via adtender.
      </p>
    </div>
  `
}
```

---

## 7. Error Handling

Email delivery is **best-effort** — a failed email must never block the primary operation.

Pattern:

```typescript
// Send email asynchronously — do not await in the critical path
// Use ctx.waitUntil() to send after the response is returned
ctx.waitUntil(
  sendEmail(resend, {
    to: supplier.email,
    subject: `Tender Invitation: ${tender.title}`,
    html: supplierInvitationEmail({ ... }),
  })
)

// Return the response immediately — user doesn't wait for email delivery
return new Response(JSON.stringify({ success: true }), { status: 200 })
```

**Monitoring:** Check Resend dashboard → Logs for delivery failures. Set up Resend webhook for bounce/complaint events if needed.

---

## 8. Equal Treatment — Bulk Sending

When publishing a clarification answer to all suppliers, emails are sent individually (not as BCC) to maintain equal treatment and allow per-supplier tracking:

```typescript
// Send to each supplier individually
await Promise.allSettled(
  invitedSuppliers.map(supplier =>
    sendEmail(resend, {
      to: supplier.email,
      subject: `Clarification Answer: ${tender.title}`,
      html: clarificationAnswerEmail({ ... }),
    })
  )
)
```

`Promise.allSettled` ensures one failed delivery doesn't block the others.

**Resend rate limits:** The standard plan supports 100 emails/second. For large tenders (50+ suppliers), batch sends with a small delay if needed.

---

## 9. Testing

**Local development:** Use `RESEND_API_KEY=re_test_xxxx` — emails are processed by Resend but not delivered to real inboxes. View in Resend dashboard under test mode.

**Staging:** Use a real but separate API key. Emails are delivered — use test email addresses only.

**Production:** Real delivery. Monitor in Resend dashboard.

---

## 10. Security Considerations

| Concern | Implementation |
|---|---|
| API key exposure | Key stored only in Cloudflare Worker secrets; never in code or git |
| Email spoofing | SPF + DKIM configured for sender domain |
| Invitation link security | Invitation tokens are single-use, time-limited (7 days), stored in KV; invalidated on activation |
| Unsubscribe (legal) | Transactional emails (invitations, system notifications) are exempt from unsubscribe requirements; marketing emails are out of scope |
| PII in email | Email subjects and bodies must not include sensitive procurement data (scores, decision rationale) — only contextual links |

---

## References

- [`Technology_Stack.md`](./Technology_Stack.md) — PKB-05-002
- [`Environment_Variables.md`](./Environment_Variables.md) — PKB-05-003
- [`Cloudflare_Deployment.md`](./Cloudflare_Deployment.md) — PKB-05-004
