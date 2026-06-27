---
id: PKB-04-006
title: Supplier Workspace — adtender UI Specification
version: 1.1
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Frontend Developer
  - Product Manager
  - AI Development Agent
depends_on:
  - PKB-04-003
  - PKB-02F-004
  - PKB-02-004
tags:
  - ui
  - workspace
  - supplier
  - portal
---

# Supplier Workspace — adtender UI Specification

---

## 1. Purpose

The Supplier Workspace covers two distinct environments that serve different users:

1. **Buyer-side Supplier Management** (`/suppliers`): The Procurement Manager's workspace for the organizational Supplier Registry — maintaining SupplierProfiles, managing qualification, controlling portal access, and tracking supplier participation across tenders.

2. **Supplier Portal** (separate application): The Supplier's own workspace — receiving tender invitations, submitting responses, managing clarification threads, and tracking their own participation.

This document covers both. Sections 2–13 describe the Buyer-side workspace. Sections 14–20 describe the Supplier Portal.

---

## 2. Target Users — Buyer Side

| Role | Primary Use |
|---|---|
| Procurement Manager | Manage supplier registry; qualify suppliers; control portal access |
| Organization Admin | Register suppliers; manage supplier base |
| Project Manager | View qualified suppliers; monitor supplier participation in tenders |

---

## 3. Navigation Entry (Buyer Side)

| Entry | URL |
|---|---|
| Global Supplier Registry | `/suppliers` |
| Supplier Profile detail | `/suppliers/:supplierId` |
| Supplier in tender context | Suppliers tab within Tender Workspace |

---

## 4. Supplier Registry — List View

```
┌──────────────────────────────────────────────────────────────────┐
│  Suppliers                              [+ Register Supplier]    │
│  Organizational supplier registry                                │
├──────────────────────────────────────────────────────────────────┤
│  [🔍 Search…]  [Status ▾]  [Category ▾]  [Qualification ▾]  [Export] │
├──────────────────────────────────────────────────────────────────┤
│  Active filters:  [Status: Qualified ✕]                         │
├──────────────────────────────────────────────────────────────────┤
│  Company         Category     Status          Portal    Last Act │
│  ─────────────────────────────────────────────────────────────── │
│  Acme Systems    IT / Cloud   ● Qualified     ✅ Active  2d ago  │
│  TechSolutions   IT           ● Qualified     ✅ Active  Today   │
│  DataSafe Ltd    Data / Sec   ○ Qual.Pending  📧 Invited  5d ago │
│  CyberShield     Security     ● Qualified     — None    30d ago  │
│  OldVendor AG    Services     ○ Registered    — None    90d ago  │
└──────────────────────────────────────────────────────────────────┘
```

### Table Columns

| Column | Sortable | Description |
|---|---|---|
| Company Name | Yes | Legal name |
| Category | Yes | Procurement categories (multi-value badge) |
| Status | Yes | SupplierProfile lifecycle state |
| Portal Access | No | NotInvited / InvitationSent / Active / Revoked |
| Active Tenders | No | Count of open tenders the supplier is invited to |
| Last Activity | Yes | Last portal login or response activity |
| COI Risk | No | AI: flagged if appears frequently in COI declarations |

---

## 5. Supplier Registration Dialog

Triggered by "+ Register Supplier".

```
Register Supplier                              [✕]
────────────────────────────────────────────────
Legal Name *       [________________________]
Company Reg. No.   [________________________]
Country *          [Germany ▾]
Primary Contact    [________________________]
Contact Email      [________________________]
Contact Phone      [________________________]

Procurement Categories
[+ Add category]  [IT ✕] [Cloud ✕]

AI:  ✦ "Acme Systems is already registered in this
        registry (Company Reg: DE12345678)"
────────────────────────────────────────────────
[Cancel]                         [Register Supplier]
```

Duplicate detection is run on company registration number. AI surfaces a warning if a matching supplier exists.

---

## 6. Supplier Profile — Detail View

Opened by clicking a supplier in the list.

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Suppliers  ›  Acme Systems AG                                │
│  SupplierProfile: SPR-2024-0014  ● Qualified                    │
│  [Start Qualification]  [Send Portal Invitation]  [Suspend ▾]   │
├──────────────────────────────────────────────────────────────────┤
│  [Overview] [Qualifications] [Certifications] [Tenders] [History]│
├──────────────────────────────────────────────────────────────────┤
│  OVERVIEW                                                        │
│  Legal Name:     Acme Systems AG                                │
│  Reg. No.:       DE78901234  (Germany)                          │
│  Categories:     IT Infrastructure  ·  Cloud Services           │
│  Primary Contact: Max Müller · max@acme.example                 │
│  Portal Status:  ✅ Access Active                                │
│  Registered:     12 Jan 2024 by Jane Doe                        │
│                                                                  │
│  QUALIFICATION HISTORY                                           │
│  ● Qualified  ·  15 Feb 2024  ·  Reviewed by: Anna Schmidt      │
│  ○ QualificationPending  ·  20 Jan 2024                         │
│  ○ Registered  ·  12 Jan 2024                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Overview Tab

Key profile data, qualification status, portal access status, contacts summary.

### Qualifications Tab

- Qualification history timeline
- Current qualification state with reviewer and date
- Qualification documents (attached)
- [Start Re-qualification], [Suspend Qualification] actions

### Certifications Tab

Table of certifications:
- Certification name, issuing body, certificate number, valid from, valid to, status
- Color-coded expiry: green (valid), amber (expiring in 90 days), red (expired)
- [Add Certification], [Revoke Certification]
- AI: "✦ 2 certifications expiring in the next 30 days" alert chip

### Tenders Tab

All tenders this supplier has been invited to:
- Tender name, project, date, response status, outcome

### History Tab

Complete audit trail of all actions on this SupplierProfile.

---

## 7. Qualification Workflow

The qualification process is a guided side panel flow.

```
Start Qualification — Acme Systems AG         [✕]
────────────────────────────────────────────────
Current status: ○ Registered

Step 1: Review qualification documents
  [Upload documents]
  [View uploaded: ISO-27001.pdf] [View]

Step 2: Confirm review complete
  ☑ Identity verified
  ☑ References checked
  ☑ Required certifications present

Step 3: Decision
  ○ Qualify Supplier
  ○ Request more information (returns to Registered)

Notes (visible in audit trail):
[_________________________________]

────────────────────────────────────────────────
[Cancel]                    [Complete Qualification]
```

---

## 8. Portal Access Management

Sending a Portal Invitation triggers an email to the primary contact with a secure link.

```
Send Portal Invitation — Acme Systems AG       [✕]
────────────────────────────────────────────────
Contact:  Max Müller  <max@acme.example>
Role:     SupplierContact

Invitation message (optional):
[You have been invited to access the...]

Portal access grants:
✅ View tender invitations
✅ Submit responses
✅ Post clarification questions
✅ Download tender documents

────────────────────────────────────────────────
[Cancel]                    [Send Invitation]
```

---

## 9. Filters (Buyer Supplier Workspace)

| Filter | Values |
|---|---|
| Status | Registered / QualificationPending / Qualified / Suspended / Archived |
| Category | Configured procurement categories |
| Portal Access | NotInvited / InvitationSent / Active / Revoked |
| Active Tenders | Has open tenders / No active tenders |
| Certifications | Has expiring certs (AI-assisted) |
| Last Activity | Time range |

---

## 10. Bulk Actions (Supplier Registry)

| Action | Condition |
|---|---|
| Export Selected | Any |
| Send Portal Invitations | Qualified suppliers without active portal access |
| Assign Category | Any |
| Archive | Qualified / Suspended; no open tender responses |

---

## 11. AI Assistant (Buyer Side)

| Feature | Trigger | Description |
|---|---|---|
| Duplicate detection | Registration | Warns if company reg. number matches existing profile |
| Certification expiry | Certifications tab | Flags suppliers with expiring certs |
| Inactivity alert | List view | Highlights suppliers inactive for >90 days |
| Suggestion for tender | Tender creation wizard | "Based on this category, these Qualified suppliers could be relevant" |
| COI risk flag | History tab | Flags suppliers frequently appearing in COI declarations |

---

## 12. Export Functions (Buyer Side)

| Export | Contents |
|---|---|
| Supplier List (CSV/XLSX) | All columns; respects active filters |
| Supplier Profile PDF | Full profile with certifications and qualification history |
| Certification Report (PDF) | Expiry overview for all suppliers |

---

## 13. Keyboard Shortcuts (Buyer Supplier Workspace)

| Shortcut | Action |
|---|---|
| `N` | Register new supplier |
| `Q` | Open qualification flow for selected supplier |
| `Space` | Preview supplier profile |
| `Enter` | Open full supplier profile |
| `F` | Focus filter search |
| `E` | Export visible list |

---

---

## 14. Supplier Portal — Overview

The Supplier Portal is a **separate application** with its own URL and simplified navigation. It shares the adtender design system.

**Entry point:** Email invitation link → Portal login → Supplier Dashboard

**Key difference from Buyer workspace:** Suppliers see only what relates to them. They have no access to other suppliers, the buyer's internal evaluation, or any other supplier's data.

---

## 15. Supplier Portal — Navigation

```
┌──────────────────────────────────────────────────────────────────┐
│  [▲ adtender]  Supplier Portal  ·  Acme Systems AG              │
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                       │
│  Dash.   │  MAIN CONTENT AREA                                   │
│          │                                                       │
│  My      │                                                       │
│  Tender  │                                                       │
│          │                                                       │
│  Clarif. │                                                       │
│          │                                                       │
│  Profile │                                                       │
│          │                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

| Section | Description |
|---|---|
| Dashboard | Open invitations, deadlines, action items |
| My Tender Responses | All tenders: invited / in-progress / submitted |
| Clarifications | Q&A threads for all tenders |
| My Profile | Portal access settings, contact info |

---

## 16. Supplier Dashboard (Portal)

```
My Tenders                                        [Acme Systems AG ▾]
────────────────────────────────────────────────────────────────────
ACTION REQUIRED
────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────┐
│  ⚠ IT Security Suite Evaluation (TND-2024-0007)                 │
│  Buyer: Procurement Corp AG  ·  Deadline: 15 Jul 2024            │
│  6 days remaining  ·  Response: In Progress (8/12 answered)      │
│  [Continue Response]                                             │
└──────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────
COMPLETED
────────────────────────────────────────────────────────────────────
  Cloud Infrastructure Selection  ·  Submitted 3 Jun 2024
  DataCenter Modernization  ·  Submitted 15 Feb 2024
```

---

## 17. Tender Response View (Supplier Portal)

The response interface is the most important screen in the Supplier Portal.

```
IT Security Suite Evaluation                      ● Published
────────────────────────────────────────────────────────────────────
Deadline: 15 Jul 2024, 18:00  |  6 days remaining
12 requirements  ·  8 answered  ·  4 remaining

[Download Tender Documents]       Progress: ████████░░░░  67%

REQUIREMENTS
────────────────────────────────────────────────────────────────────
REQ-0042  Data Encryption at Rest                   Critical
"All data stored by the system must be encrypted using AES-256..."
[Your Response ▾]
  ☑ Compliant       ○ Partially Compliant    ○ Non-Compliant
  Description:
  [We implement AES-256 encryption for all data at rest using...]
  Evidence / attachments:  [ISO-27001-Certificate.pdf ✕]  [+ Add]
  ────────────────────────────────────────────────────────────────
  ✅ Answered · Last saved 2 hours ago

REQ-0043  Access Control Policy                     High
"Role-based access control for all system functions..."
[Answer this requirement ▾]                         ← Not answered
```

### Response Form per Requirement

| Field | Type | Description |
|---|---|---|
| Compliance | Radio: Compliant / Partial / Non-Compliant | Mandatory |
| Description | Rich text | Free-text explanation of compliance |
| Evidence | File upload (multiple) | Supporting documents |
| Pricing (if applicable) | Currency field | Shown only if pricing is configured |

**Auto-save:** Response auto-saves every 30 seconds. Never loses work.

**Progress bar:** Updates in real-time as requirements are answered.

**Submit Response:** Available when all required fields are complete. Shows confirmation:
> "You are about to submit your response to IT Security Suite Evaluation. After submission, no changes are possible."

After submission: read-only view with submitted timestamp.

---

## 18. Clarifications (Supplier Portal)

```
Clarifications                               [+ New Question]
────────────────────────────────────────────────────────────────────
IT Security Suite Evaluation
────────────────────────────────────────────────────────────────────
  [Open: 1]  [Answered: 2]

  ○ Open  ·  Posted 15 Jun 2024
  "Can Requirement REQ-0042 be interpreted to exclude backup
   storage encrypted by the cloud provider?"
  
  ● Answered  ·  17 Jun 2024 (by Procurement Corp)
  Question: "Is there a mandatory response format for Section 4?"
  Answer:   "No specific format is required. Please describe your
             approach clearly and attach supporting evidence."
```

New questions are submitted through a simple form: text + optional attachment.

After the buyer answers, the supplier is notified. Published answers (shared with all suppliers) are clearly marked.

---

## 19. Supplier Profile (Portal)

Allows the supplier contact to update their contact information and view their portal access status.

- Legal name (read-only; managed by buyer)
- Contact name, email, phone (editable by supplier)
- Portal access status
- Active invitations list

---

## 20. Permissions (Supplier Portal)

| Action | Permission | Condition |
|---|---|---|
| View invitations | Authenticated Supplier contact | Own supplier only |
| Submit response | Authenticated Supplier contact | Before deadline; tender published |
| Edit response | Authenticated Supplier contact | Before submission |
| Post clarification | Authenticated Supplier contact | Published state; clarification enabled |
| Download tender documents | Authenticated Supplier contact | Any published tender |
| View other suppliers | — | Prohibited — architectural isolation |
| View evaluation scores | — | Prohibited — not available in portal |

---

## 21. Enhanced Supplier Offer Detail Panel (Tender Context)

> Added in v1.1 based on Reference_Video_Analysis.md §6 (Supplier / Offer Detail View pattern).

When a Procurement Manager opens a specific supplier row within the Tender's Suppliers tab (§10 of Tender_Workspace.md), a consolidated Supplier Offer Detail panel opens. This replaces the previous shallow supplier row — it consolidates all supplier-specific data for this tender in one view.

### Access

From the Tender Workspace → Suppliers tab → click any supplier row → right panel expands to full Offer Detail.

### Panel Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Acme Systems AG                                          [✕]   │
│  Supplier Code: SUP-2024-0042  ·  ● Qualified               │
│  TND-2024-0007  IT Security Suite Evaluation                │
│                                                              │
│  [Overview] [Response] [Documents] [Evaluation] [History]   │
└──────────────────────────────────────────────────────────────────┘
```

### Overview Tab

```
┌──────────────────────────────────────────────────────────────────┐
│  COMPANY                                                        │
│  Acme Systems AG · IT / Cloud Services                         │
│  Contact: Franz Huber  ·  franz.huber@acme.example             │
│  Qualified since: 12 Jan 2024                                   │
│                                                                  │
│  TENDER PARTICIPATION                                           │
│  Status: Response Submitted  ·  15 Jun 2024 18:32              │
│  Portal access: ✅ Active · Last login: 2 days ago              │
│                                                                  │
│  OPEN TASKS                                                      │
│  ✅ No open tasks for this supplier                             │
│                                                                  │
│  AI SUMMARY (post-lock only)                                     │
│  ✦ Acme Systems shows strong compliance on Security (avg 8.2)   │
│    but below-average on Integration (avg 5.9). Third highest    │
│    overall score.                                     [Dismiss] │
└──────────────────────────────────────────────────────────────────┘
```

### Response Tab

Shows a read-only summary of the supplier's submitted response:

| Column | Description |
|---|---|
| Requirement code + title | Requirement reference |
| Compliance | Compliant / Partially / Non-Compliant |
| Description (excerpt) | First 100 characters of supplier's description |
| Documents | Count of attached evidence files |
| [View] | Opens full response for this requirement |

Filter: All / Compliant / Non-Compliant / No Response

**Version note:** Responses reference the RequirementVersionId frozen at publication. A hover tooltip shows the version ID.

### Documents Tab

All files submitted by this supplier for this tender, classified:

| Column | Description |
|---|---|
| File name | Original file name |
| Type | Certification / Technical / Pricing / Other |
| Linked Requirement | If attached to a specific requirement |
| Uploaded | Date |
| [Download] | Direct download |

Bulk: [Download All as ZIP]

### Evaluation Tab (post-lock only)

Shows this supplier's evaluation summary in the context of all evaluators:

```
EVALUATION SUMMARY (Locked — 24 Jun 2024)
────────────────────────────────────────────────────────────
SECURITY           Acme: 8.2  ·  Market avg: 7.4
  REQ-0042 Data Encryption      ██████████ 8   (3/3 evaluators)
  REQ-0043 Access Control       ███████░░░ 7   (3/3 evaluators)
  REQ-0044 Audit Logging        █████████░ 9   (3/3 evaluators)

COMPLIANCE         Acme: 7.4  ·  Market avg: 6.9
  ...

OVERALL RANK: 🥈 2nd  ·  Weighted Score: 81%
────────────────────────────────────────────────────────────
[View in Matrix]
```

Before evaluations are locked: shows completeness only (no scores — GBR-013).

### History Tab

Audit trail for this supplier's participation in this tender:

| Date | Event | Actor |
|---|---|---|
| Jun 1 | Invitation sent | System |
| Jun 3 | Portal invite opened | Acme Systems |
| Jun 5 | Portal access activated | Franz Huber |
| Jun 15 | Response submitted | Franz Huber |
| Jun 24 | Evaluation locked | Procurement Manager |

---

## References

- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003
- [`Tender_Workspace.md`](./Tender_Workspace.md) — PKB-04-005 — Supplier tab in tender context
- [`SupplierProfile.md`](../02_Foundation/SupplierProfile.md) — PKB-02F-004 — Domain model
- [`SupplierResponse.md`](../02_Domain_Model/SupplierResponse.md) — PKB-02-004 — Response domain model
- [`Reference_Video_Analysis.md`](./Reference_Video_Analysis.md) — PKB-04-011 — Pattern origin (§6)
