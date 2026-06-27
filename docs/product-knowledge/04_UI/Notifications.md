---
id: PKB-04-010
title: Notifications — adtender UI Specification
version: 1.0
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Frontend Developer
  - Product Manager
  - AI Development Agent
depends_on:
  - PKB-04-001
  - PKB-04-003
tags:
  - ui
  - notifications
  - workflow
  - alerts
---

# Notifications — adtender UI Specification

---

## 1. Purpose

Notifications keep users informed about events that require their attention — workflow assignments, deadline alerts, status changes, and collaborative actions. They are the primary mechanism by which the workflow layer communicates with users.

Notifications are action-oriented. Every notification either informs the user of something that happened, or requests an action. Purely informational notifications are kept to a minimum.

---

## 2. Notification Channels

adtender uses three delivery channels:

| Channel | Description | Use |
|---|---|---|
| **In-app Notification Panel** | Right-side panel accessible from the bell icon | All notifications; primary channel |
| **Email** | Email to the user's registered address | High-priority events; configurable |
| **In-app Toast** | Non-blocking pop-up in lower-right corner | Immediate feedback for completed actions in the current session |

---

## 3. In-App Notification Panel

Opened by clicking the bell icon in the Top Bar.

```
┌────────────────────────────────────────┐
│  Notifications  (5 unread)  [Mark all read] [Settings] │
│  [All ▾]  [Unread]  [Action Required]                  │
├────────────────────────────────────────────────────────┤
│  ⚠ ACTION REQUIRED                                     │
│  🔴 COI Declaration Required                           │
│  IT Security Suite — Decision Board Session            │
│  Today, 09:30  ·  [Declare COI →]                      │
│  ─────────────────────────────────────                 │
│  🔴 Evaluation Deadline Tomorrow                        │
│  Score 4 remaining requirements by 22 Jul 18:00        │
│  [Continue Evaluation →]                               │
├────────────────────────────────────────────────────────┤
│  ℹ INFO                                                │
│  ✅ Requirement REQ-0042 approved                       │
│  Approved by Anna Schmidt  ·  Today, 11:15             │
│  [View Requirement →]                                  │
│  ─────────────────────────────────────                 │
│  📧 Supplier Acme Systems has submitted response       │
│  IT Security Suite  ·  Today, 10:02                   │
│  [View Response →]                                     │
│  ─────────────────────────────────────                 │
│  🤖 AI Insight: 2 requirements may be duplicates       │
│  REQ-0042 ≈ REQ-0091  ·  Yesterday                    │
│  [Compare →]  [Dismiss]                               │
└────────────────────────────────────────────────────────┘
```

### Panel Controls

| Control | Behavior |
|---|---|
| Filter: All / Unread / Action Required | Filters visible notifications |
| Mark all read | Marks all as read; no deletion |
| Settings | Opens notification preferences |
| Each notification | Clicking navigates to the referenced record |
| [Action] button | Direct action deep link (e.g., "Declare COI →") |
| [Dismiss] | Available on AI insights and informational notifications |

### Unread Badge

The bell icon in the Top Bar shows an unread count badge. Badge disappears when all notifications are read. Maximum displayed: 99+.

---

## 4. Notification Types

### 4.1 Action Required (Red indicator)

High-priority notifications that block a workflow step or have a deadline.

| Notification | Trigger | Action Link |
|---|---|---|
| COI Declaration Required | Decision Board session convened for this user | "Declare COI" → Decision Workspace |
| Evaluation Deadline Approaching | <24 hours to evaluation submission deadline | "Continue Evaluation" |
| Evaluation Overdue | Evaluation submission deadline passed; not submitted | "Submit Evaluation Now" |
| Requirement Review Assigned | User assigned as reviewer for a Requirement | "Review Requirement" |
| Clarification Awaiting Answer | Supplier posted a clarification question; user is Procurement Manager | "Answer" → Clarification thread |
| Tender Publication Approval | Tender requires approval before publication | "Review and Approve" |
| Decision Approval Required | Decision record in Draft; user is on the Board | "Review Decision" |

### 4.2 Informational (Blue indicator)

Events relevant to the user's context but requiring no immediate action.

| Notification | Trigger |
|---|---|
| Requirement approved | A Requirement the user owns was approved |
| Supplier response submitted | A supplier submitted a response to a tender the user manages |
| Evaluation submitted | An Evaluator submitted their evaluation |
| Evaluation locked | All evaluations locked; CE computation started |
| Consolidated report approved | CE Report approved; Decision phase can begin |
| Decision approved | Procurement decision has been made |
| Supplier qualified | A supplier qualification was completed |
| Project status changed | A project the user is on changed lifecycle state |
| Library published | A Requirement Library was published |

### 4.3 AI Insights (Purple indicator)

Proactive suggestions from the AI assistant. Always dismissible. Never mandatory.

| Notification | Trigger |
|---|---|
| Duplicate requirement detected | AI detected near-duplicate Requirements |
| Certification expiring | AI found supplier certifications expiring in 30 days |
| Low-response supplier | AI detected a supplier who has not viewed their invitation with <7 days to deadline |
| Scoring anomaly | AI detected an evaluator's scores are significantly out of range |
| Reuse opportunity | AI found Library Requirements relevant to the current project |

### 4.4 System Alerts (Orange indicator)

Platform-level events requiring attention.

| Notification | Trigger |
|---|---|
| Storage quota approaching | Tenant storage at >80% |
| Pending user invitation expired | A user invitation older than 30 days |
| New platform version available | (Admin only) |

---

## 5. Email Notifications

Email is sent for high-priority events. Users can configure email preferences.

**Always sent via email (non-configurable):**
- COI Declaration Required
- Evaluation Deadline Approaching (24h before)
- Evaluation Overdue
- Decision Approval Required

**Configurable (on/off per event type):**
- Requirement approved
- Supplier response submitted
- Evaluation submitted
- Decision approved

**Email format:**
- Subject: `[adtender] {EventTitle} — {TenderName}`
- Body: Context (what happened, where), direct deep link to the record
- No sensitive data in email body (score values, supplier comparisons)
- Footer: link to notification preferences

---

## 6. In-App Toast Notifications

Non-blocking, temporary messages for completed actions in the current session.

```
  ┌─────────────────────────────────────┐
  │  ✅ Requirement saved as Draft      │
  │  REQ-0042  ·  [Undo]               │
  └─────────────────────────────────────┘
```

Appears in the lower-right corner. Disappears after 4 seconds. "Undo" available for reversible actions (within 10 seconds).

| Type | Color | Use |
|---|---|---|
| Success | Green | Action completed: "Evaluation submitted" |
| Info | Blue | Status update: "Auto-saved at 14:35" |
| Warning | Amber | Partial success: "2 of 3 suppliers notified (1 failed)" |
| Error | Red | Failure: "Failed to submit — check required fields" |

---

## 7. Notification Preferences

Users configure notification preferences at:
`/admin/notifications` (admin) or user profile → Notifications

```
Notification Preferences
────────────────────────────────────────────────────────────────────
In-App Notifications
  ✅ Action Required (always on)
  ✅ Status changes on my records
  ☑ AI Insights
  ☑ Platform announcements

Email Notifications
  ✅ COI Declaration Required (always on)
  ✅ Evaluation deadlines (always on)
  ☑ Requirement approvals
  ☑ Supplier response submissions
  ☑ Decision approvals

  Email frequency:
  ○ Immediately  ●  Daily digest  ○ Weekly digest

────────────────────────────────────────────────────────────────────
[Cancel]                                         [Save Preferences]
```

---

## 8. Notification Center (Full Page)

Accessible via "View All" from the notification panel.

Full-page notification history with:
- All notifications (not just recent)
- Advanced filters: type, date range, tender, status
- Bulk actions: mark as read, dismiss all AI insights
- Export: notification log (CSV)

URL: `/notifications`

---

## 9. Notification Delivery Architecture

Notifications are generated by the Workflow Management bounded context (WM) in response to domain events. 

| Domain Event | Notification Generated |
|---|---|
| `EvaluationAssigned` | Action Required: "Evaluation assigned to you" |
| `TenderPublished` | Info: "Tender published" (to project team) |
| `SupplierResponseSubmitted` | Info: "Supplier response received" (to Procurement Manager) |
| `DecisionBoardConvened` | Action Required: "COI declaration required" (to each Board Member) |
| `EvaluationDeadlineApproaching` | Action Required (to all evaluators with unsubmitted evaluations) |
| `RequirementApproved` | Info (to requirement owner) |

**Design principle:** Notifications are derived from domain events. They are never hardcoded in the UI. Adding a new workflow step that needs to notify users requires a new domain event.

---

## 10. Permissions

| Notification Type | Recipients |
|---|---|
| Action Required | The specific user assigned the action |
| Informational | Users with view access to the referenced record |
| AI Insights | The user whose records are affected |
| System Alerts | Organization Admin |
| Tender-level notifications | All users assigned to the tender |

---

## References

- [`Navigation.md`](./Navigation.md) — PKB-04-001 — Bell icon placement in Top Bar
- [`Dashboard.md`](./Dashboard.md) — PKB-04-002 — Recent notifications widget
- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003 — Toast pattern
