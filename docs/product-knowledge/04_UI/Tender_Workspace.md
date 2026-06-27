---
id: PKB-04-005
title: Tender Workspace — adtender UI Specification
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
  - PKB-02-003
  - PKB-02F-004
tags:
  - ui
  - workspace
  - tender
  - wizard
---

# Tender Workspace — adtender UI Specification

---

## 1. Purpose

The Tender Workspace is the center of the procurement process. It provides a structured, wizard-based environment for creating tenders, assigning requirements, inviting suppliers, publishing, and managing the active tender period.

A Tender is one of the most complex business objects in adtender. The workspace is designed to guide users through each phase without overwhelming them — showing only what is relevant for the current tender state.

---

## 2. Target Users

| Role | Primary Use |
|---|---|
| Procurement Manager | Create, configure, publish and manage tenders |
| Project Manager | Initiate tender creation; monitor status |
| Legal / Compliance | Review tender content before publication |
| Evaluators | Access tender during evaluation phase (read-only in this workspace) |

---

## 3. Navigation Entry

| Context | Entry | URL |
|---|---|---|
| Project context | Tenders (under current project) | `/projects/:id/tenders` |
| Tender detail | Click a tender from list | `/projects/:id/tenders/:tenderId` |

---

## 4. Tender List View

```
┌──────────────────────────────────────────────────────────────────┐
│  ← IT Modernization 2024  ›  Tenders                            │
│  Tenders (4)                        [+ New Tender]              │
├──────────────────────────────────────────────────────────────────┤
│  [Search…] [Status ▾] [Category ▾]                 [⊞ Table] [⊟ Cards] │
├──────────────────────────────────────────────────────────────────┤
│  TENDER CARDS                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ TND-2024-0007  IT Security Suite Evaluation                 │ │
│  │ ● Published  |  Deadline: 15 Jul 2024  |  6 days left      │ │
│  │ 12 requirements  ·  5 suppliers invited  ·  3 responded    │ │
│  │ [View]  [Manage Suppliers]  [View Responses]                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ TND-2024-0008  Cloud Infrastructure Selection               │ │
│  │ ✏️ Draft  |  Owner: Jane Doe  |  8 requirements assigned    │ │
│  │ [Continue Setup]  [Preview]                                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Tender Detail — Tab Structure

When a tender is opened, it uses a tabbed layout. Tabs available depend on tender lifecycle state.

| Tab | Available from | Description |
|---|---|---|
| **Overview** | Always | Summary, status, key dates, completion checklist |
| **Requirements** | Always | Assigned requirements; snapshot management |
| **Suppliers** | Always | Invitation list; qualification status; portal access |
| **Clarifications** | Published | Q&A threads between suppliers and buyer |
| **Responses** | After deadline | Submitted supplier responses |
| **Evaluation** | Evaluation phase | Evaluators, scoring, progress |
| **Decision** | Decision phase | Decision Board, report, approval |
| **History** | Always | Full audit trail |

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Tenders  ›  IT Security Suite Evaluation  (TND-2024-0007)   │
│  ● Published  ·  Deadline: 15 Jul 2024                          │
│  [Close Submissions]  [Manage ▾]                                │
├──────────────────────────────────────────────────────────────────┤
│  [Overview] [Requirements] [Suppliers] [Clarifications] [History]│
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Stage Progress Bar

Every Tender Workspace screen shows a stage progress bar directly below the workspace header, above the tab navigation. This is the primary lifecycle orientation element for the tender context.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  STAGE PROGRESS                                                                  │
│                                                                                  │
│   ✅ Setup ──── ✅ Published ──── ✅ Responses ──── 🔄 Evaluation ──── ⬜ Decision │
│      Jun 1          Jun 1           Jun 15            Jul 22 →             —    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

See [`Application_Navigation.md`](./Application_Navigation.md) §3 for full specification of stage states, click behavior, and mobile adaptation.

**Stage-aware tab availability:** Tabs in §5 are locked/unlocked according to the current stage. Locked tabs show a tooltip: "Available after [prerequisite]."

**Stage-driven primary CTA:** The primary action button in the workspace header changes with each stage (see §11).

---

## 7. Tender Creation Wizard

Triggered by "+ New Tender". A 5-step guided wizard in a full-panel overlay.

```
New Tender                                                 [✕]
────────────────────────────────────────────────────────────────
  Step 1 of 5
  ① Basics  ──  ② Requirements  ──  ③ Suppliers  ──  ④ Settings  ──  ⑤ Review
────────────────────────────────────────────────────────────────
```

### Step 1: Basics

| Field | Type | Required |
|---|---|---|
| Tender Title | Text | Yes |
| Tender Code | Auto-generated (editable) | Yes |
| Category | Dropdown (configured) | Yes |
| Tender Type | Dropdown (RFP / RFQ / RFI / ITT) | Yes |
| Description | Rich text | No |
| Template | Dropdown: "Start from template" | No |

AI assistance: "✦ AI: Suggest a title based on project scope"

### Step 2: Requirements

Library browser embedded in the wizard.

- Left: Browse from Requirement Libraries
- Right: Selected requirements for this tender (reorderable)
- Shows count: X requirements selected
- AI: "✦ AI: Suggest requirements based on tender category"

Minimum 1 requirement required to proceed.

### Step 3: Suppliers

Supplier picker from the SupplierProfile registry.

- Search / filter qualified suppliers
- Add to invitation list
- Shows qualification status inline
- Warning if a supplier is not `Qualified`
- AI: "✦ AI: Suggest suppliers based on tender category and past tender history"

### Step 4: Settings

| Field | Type |
|---|---|
| Submission Deadline | Date + time picker |
| Evaluation Deadline | Date |
| Currency | Dropdown |
| Response Language | Dropdown |
| Anonymous Evaluation | Toggle |
| Clarification Allowed | Toggle |
| Clarification Deadline | Date (shown if above is enabled) |
| Attachments | File upload (tender documents, specifications) |

### Step 5: Review

Summary of all settings. Read-only checklist:
- ✅ Title and description complete
- ✅ 12 requirements assigned
- ✅ 5 suppliers invited (all Qualified)
- ✅ Submission deadline set: 15 Jul 2024
- ⚠️ No attachments uploaded (optional)

Actions: [Save as Draft] [Publish Tender]

Publishing shows a confirmation dialog explaining that Suppliers will be notified immediately.

---

## 8. Overview Tab

```
┌──────────────────────────────────────────────────────────────────┐
│  STATUS: ● Published                                             │
│  Submission Deadline: 15 Jul 2024, 18:00  (6 days remaining)   │
│                                                                  │
│  PROGRESS SUMMARY                                               │
│  Suppliers:    5 invited  ·  4 viewed  ·  3 responded          │
│  Responses:    3 / 5  ██████████░░░░░░░░  60%                  │
│  Clarif.:      2 open  ·  5 answered                           │
│                                                                  │
│  TIMELINE                                                        │
│  ──●──────────────────●──────────────────●──                   │
│  Published          Deadline           Evaluation               │
│  1 Jun              15 Jul             16 Jul                   │
│                                                                  │
│  CHECKLIST FOR NEXT PHASE                                        │
│  ☑ All suppliers notified                                       │
│  ☑ Clarification period open                                    │
│  ☐ 2 suppliers have not responded                               │
│  ☐ Close submissions (manual when deadline reached)             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Requirements Tab

Displays the Tender Requirement Snapshot — the frozen set of requirement versions at publication.

Before publication: shows assigned requirements (editable).
After publication: shows frozen snapshot (read-only, version-pinned).

| Column | Description |
|---|---|
| Code | Requirement code |
| Title | Requirement title |
| Category | Category badge |
| Priority | Priority badge |
| Version | RequirementVersionId (shown after publication) |
| Weight | Evaluation weight (configurable) |

Actions (before publication): Reorder, Remove, Add, Set weights
Actions (after publication): View requirement detail, Export snapshot

**Version freeze notice (published):**
> 🔒 This requirement set was frozen at publication on 1 Jun 2024. Requirements cannot be changed after publication.

---

## 10. Suppliers Tab

```
┌──────────────────────────────────────────────────────────────────┐
│  Suppliers (5)                    [+ Invite Supplier]  [Export] │
├──────────────────────────────────────────────────────────────────┤
│  Company Name      Status      Portal     Response   Last Active │
│  ─────────────────────────────────────────────────────────────── │
│  Acme Systems      ● Qualified  ✅ Active  Submitted  2 days ago  │
│  TechSolutions     ● Qualified  ✅ Active  Submitted  Today       │
│  CyberShield AG    ● Qualified  📧 Invited  In Progress 3 days ago│
│  DataSafe Ltd      ● Qualified  📧 Invited  Not started —        │
│  SecureCo          ● Qualified  ✅ Active  Submitted  Yesterday   │
├──────────────────────────────────────────────────────────────────┤
│  ⚠ DataSafe Ltd has not opened their invitation.                │
│  [Resend invitation]                                             │
└──────────────────────────────────────────────────────────────────┘
```

Supplier row actions (hover): View Profile, Resend Invitation, Revoke Access, View Response

---

## 11. Clarifications Tab

```
┌──────────────────────────────────────────────────────────────────┐
│  Clarifications                   [Open threads: 2] [Closed: 5] │
├──────────────────────────────────────────────────────────────────┤
│  THREADS                                                         │
│  ● Open  |  Acme Systems  |  15 Jun 2024                        │
│  "Can Requirement REQ-0042 be interpreted to exclude backup..."  │
│  [Answer]  [Publish to All]  [Archive]                          │
│  ─────────────────────────────────────────────────────────────── │
│  ● Open  |  TechSolutions  |  14 Jun 2024                       │
│  "Is there a mandatory response format for Section 4?"          │
│  [Answer]  [Publish to All]  [Archive]                          │
└──────────────────────────────────────────────────────────────────┘
```

**Publish to All:** Sends a clarification answer to all invited suppliers (anonymized — supplier name hidden). This ensures all suppliers have equal information access.

**Answer dialog:** Rich text editor + option to attach a document.

---

## 12. Lifecycle Actions (State Transitions)

Shown as the primary CTA in the workspace header, changing with each state.

| State | Primary CTA | Secondary Actions |
|---|---|---|
| `Draft` | Publish Tender | Preview, Save, Discard |
| `Published` | Close Submissions (after deadline) | Extend Deadline, Recall Tender |
| `SubmissionClosed` | Start Evaluation | Review Responses |
| `Evaluation` | Lock Evaluations | Manage Evaluators |
| `Decision` | Open Decision Board | View Report |
| `Awarded` | Archive Tender | Generate Award Notice |

Every lifecycle action shows a confirmation dialog with clear consequences.

---

## 13. AI Assistant Integration

| Feature | Trigger | Description |
|---|---|---|
| Template recommendation | Step 1 of wizard | Suggests a template based on project type and category |
| Requirement gap detection | Requirements tab | "You have no Data Privacy requirements — relevant for this category" |
| Supplier suggestions | Step 3 of wizard | Based on category and past successful tenders |
| Clarification auto-draft | Answer thread | AI drafts a response to a clarification question |
| Supplier response summary | Responses tab | AI summarizes key differences across supplier responses |
| Deadline risk | Overview tab | "3 of 5 suppliers have not started their response. Deadline in 6 days." |

---

## 14. Drag and Drop

- Wizard Step 2: drag requirements between library panel (left) and selected list (right)
- Requirements tab: reorder requirements by dragging rows (before publication only)
- Attachments: drag files to upload area

---

## 15. Inline Editing

Available in Draft state:
- Tender title (click to edit in header)
- Supplier invitation list (remove inline)
- Requirement weights (click the weight cell in Requirements tab)
- Submission deadline (click the date)

---

## 16. Bulk Actions (Requirements tab)

| Action | Condition |
|---|---|
| Remove from Tender | Draft state |
| Set Weight | Draft state; numeric input |
| Reorder | Draft state; drag handles |

---

## 17. Export Functions

| Export | Contents |
|---|---|
| Tender Document (PDF) | Full tender including requirements, terms, supplier instructions |
| Requirement Snapshot (CSV) | Frozen requirement list with versions |
| Supplier Response Comparison (XLSX) | Side-by-side supplier responses per requirement |
| Clarification Log (PDF) | All answered clarifications |
| Audit Trail (PDF) | Full history of tender |

---

## 18. Keyboard Shortcuts (Tender Workspace)

| Shortcut | Action |
|---|---|
| `N` | New Tender |
| `Tab` | Navigate wizard steps forward |
| `Shift + Tab` | Navigate wizard steps backward |
| `P` | Preview tender (draft) |
| `F` | Focus requirement filter |
| `R` | Go to Requirements tab |
| `S` | Go to Suppliers tab |
| `C` | Go to Clarifications tab |
| `Cmd/Ctrl + Enter` | Publish Tender (from wizard step 5) |

---

## 19. Permissions

| Action | Role | Condition |
|---|---|---|
| Create Tender | Procurement Manager, Project Manager | Within own project |
| Edit Draft Tender | Procurement Manager, Owner | Draft state |
| Publish Tender | Procurement Manager | All required fields complete |
| Invite Suppliers | Procurement Manager | Published or Draft state |
| Answer Clarification | Procurement Manager | Published state |
| Close Submissions | Procurement Manager | After deadline or manual |
| Start Evaluation | Procurement Manager | Submissions closed |
| Export Tender | Procurement Manager, Project Manager, Evaluator | Any state |
| View Supplier Responses | Procurement Manager, Evaluator | After submission deadline |

---

## References

- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003
- [`Application_Navigation.md`](./Application_Navigation.md) — PKB-04-012 — Stage progress bar specification
- [`Supplier_Workspace.md`](./Supplier_Workspace.md) — PKB-04-006 — Supplier management
- [`Evaluation_Workspace.md`](./Evaluation_Workspace.md) — PKB-04-007 — Evaluation phase
- [`Clarification_Workspace.md`](./Clarification_Workspace.md) — PKB-04-015 — Clarification workspace
- [`Tender.md`](../02_Domain_Model/Tender.md) — PKB-02-003 — Tender domain model
