---
id: PKB-04-011
title: Reference Video Analysis — UX & Workflow Patterns
version: 1.0
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Product Manager
  - Frontend Developer
  - AI Development Agent
depends_on:
  - PKB-00-005
  - PKB-04-003
tags:
  - ui
  - ux-research
  - reference-analysis
  - inspiration
---

# Reference Video Analysis — UX & Workflow Patterns

> This document records conceptual UX and workflow observations from reference enterprise procurement platform videos. It is **not** a copy specification. Every observation is translated into an adtender-specific design principle or pattern, improving on what was observed rather than replicating it.

---

## 1. Purpose of this Document

When reviewing reference enterprise tender platforms, the goal is to understand what makes experienced procurement users productive — and where current tools fall short. This document captures those observations, rates their relevance, and translates them into adtender design decisions.

**Ground rule:** Observation → Principle → adtender pattern. Never observation → copy.

---

## 2. Observed Pattern: Requirement / Evaluation Matrix

### Observation

A table-based comparison view places requirements as rows (grouped by categories/chapters) and suppliers as columns. Each cell shows a completion or evaluation status indicator. The matrix provides an at-a-glance overview of evaluation completeness and quality across all supplier/requirement combinations.

### What works

- Immediate visual comprehension of where gaps exist (empty cells, red status)
- Grouping requirements by chapter reflects how procurement teams actually think
- Horizontal scrolling allows unlimited supplier columns without changing row structure

### What to improve in adtender

- Reference platform: cells are static status indicators only
- adtender: cells should be interactive — click to score inline, expand for detail, show evaluator progress split
- Reference platform: no AI layer
- adtender: AI quality indicators per cell; anomaly detection per row

### adtender Design Decision

→ **Requirement Evaluation Matrix** as a first-class workspace view within the Evaluation Workspace. See [`Requirement_Evaluation_Matrix.md`](./Requirement_Evaluation_Matrix.md).

---

## 3. Observed Pattern: Tender Workflow Navigation

### Observation

A top-of-screen process navigation shows the current tender stage visually (e.g., Draft → Published → Evaluation → Decision). Left-side navigation provides module access. The two levels work together: stage shows WHERE in the lifecycle; module shows WHAT to work on.

### What works

- Users always know what phase they are in without reading status text
- Stage-based navigation reduces confusion about what actions are available when
- The separation of "lifecycle stage" from "content module" is clean

### What to improve in adtender

- Reference platform: stage navigation is passive (informational only)
- adtender: stage bar should be active — clicking a completed stage navigates to a read-only view of that phase; future stages are locked (greyed, not clickable)
- Reference platform: stage labels are generic
- adtender: stage labels reflect actual business meaning and include progress indicators

### adtender Design Decision

→ **Tender Stage Progress Bar** in the Tender Workspace header, above the tab navigation. See [`Application_Navigation.md`](./Application_Navigation.md) §4 and [`Tender_Workspace.md`](./Tender_Workspace.md) §6.

---

## 4. Observed Pattern: Task and Deadline Management

### Observation

A dedicated task/action list shows open responsibilities with due dates, assignees and status. Some implementations include a calendar-style deadline view.

### What works

- Centralizing all open tasks in one place prevents things from being forgotten
- Due-date visibility alongside task names is more useful than separate deadline views
- Grouping by tender/project gives context without removing cross-project overview

### What to improve in adtender

- Reference platform: tasks are manually created and managed
- adtender: tasks should be auto-generated from workflow assignments (system-created) but allow supplemental manual tasks
- Reference platform: no smart deadline recommendations
- adtender: AI can flag tasks at risk of missing deadline based on historical velocity

### adtender Design Decision

→ **Task & Deadline Workspace** as a platform-level workspace (not nested in a single tender). Tasks from all projects and tenders visible in one place. See [`Task_Deadline_Workspace.md`](./Task_Deadline_Workspace.md).

---

## 5. Observed Pattern: Supplier Communication (Clarification / Q&A)

### Observation

A structured Q&A area allows suppliers to ask clarification questions. Buyer answers are tracked per question. Some implementations support "publish to all" (equal treatment) and maintain a history of all communications.

### What works

- Structuring clarifications as threaded Q&A (not email threads) keeps them findable
- Equal treatment publishing (sending one answer to all suppliers) is an important legal principle
- Separate views for "open questions" vs "answered" vs "published to all"

### What to improve in adtender

- Reference platform: clarification management buried inside tender as a minor section
- adtender: Clarification is a first-class workspace with its own navigation entry within the tender context
- Reference platform: no draft/preview before publishing answer to all
- adtender: draft answer → internal review → publish to all workflow

### adtender Design Decision

→ **Clarification Workspace** as a dedicated tab/sub-workspace within the Tender, not a minor section. See [`Clarification_Workspace.md`](./Clarification_Workspace.md).

---

## 6. Observed Pattern: Supplier / Offer Detail View

### Observation

A supplier detail card shows: key company information, offer metadata, assigned tasks, submitted documents, evaluation summary, and status indicators — all on one screen.

### What works

- Consolidating all supplier-specific data on one screen prevents switching between views
- Showing evaluation summary alongside submission detail is powerful for decision support
- Document list with download links provides quick access to evidence

### What to improve in adtender

- Reference platform: evaluation summary is a static score; no drill-down
- adtender: evaluation summary on supplier card links directly to the detailed score matrix
- Reference platform: documents listed as raw files
- adtender: documents classified by type (certification, technical response, pricing) with metadata

### adtender Design Decision

→ Enhanced **Supplier Offer Detail Panel** in the Tender context. See [`Supplier_Workspace.md`](./Supplier_Workspace.md) §17–21.

---

## 7. Observed Pattern: Document / Export Handling

### Observation

Export/download actions are prominent. Procurement package preparation (bundling related documents for external use) is a specific workflow.

### What works

- Export is a high-frequency action for procurement teams; hiding it is a usability failure
- Contextual export (export this tender's requirements, export this evaluation matrix) is more useful than a global export

### What to improve in adtender

- Reference platform: export creates static snapshots
- adtender: export is version-aware — exports reference the exact Business Object versions (RequirementVersionId, Evaluation version) for audit traceability

### adtender Design Decision

→ **Export** button prominently placed in every workspace toolbar (top-right zone). Version metadata included in all exports. See [`Workspace_Concept.md`](./Workspace_Concept.md) §3.2.

---

## 8. Observed Pattern: Administration / Configuration

### Observation

Configuration forms use structured field groups with clear section titles, save/cancel actions, and role-based access control.

### What works

- Grouping related settings reduces cognitive load
- Explicit save/cancel prevents accidental changes
- Role-based visibility (admin-only fields hidden from non-admins)

### What to improve in adtender

- Reference platform: changes take effect immediately on save (no audit trail for config changes)
- adtender: all configuration changes are auditable (GBR-001); changes that affect active tenders show an impact warning

### adtender Design Decision

→ Configuration forms follow the structured field group pattern. All configuration changes emit an audit event. Config changes affecting active tenders show a confirmation dialog with impact summary.

---

## 9. Cross-Cutting Principles Derived

The following principles are derived from the full set of reference observations:

| Principle | Source Observation | adtender Application |
|---|---|---|
| **Stage clarity** | Stage navigation bars | Every workspace shows the lifecycle stage prominently; stage drives available actions |
| **Matrix thinking** | Evaluation matrix | Requirements × Suppliers comparison is a first-class view, not an export |
| **Equal treatment** | Clarification publishing | All buyer answers are publishable to all suppliers simultaneously |
| **Tasks as derived objects** | Task list | Tasks are generated from workflow events, not created manually by default |
| **Document traceability** | Document export | All exports include version metadata for audit compliance |
| **Context consolidation** | Supplier offer detail | Supplier card shows evaluation, documents, tasks, and status in one view |
| **Process navigation** | Workflow stages | Top stage bar + left module navigation = two-level navigation hierarchy |

---

## References

- [`Application_Navigation.md`](./Application_Navigation.md) — PKB-04-012 — Two-level navigation pattern
- [`Requirement_Evaluation_Matrix.md`](./Requirement_Evaluation_Matrix.md) — PKB-04-013 — Matrix workspace
- [`Task_Deadline_Workspace.md`](./Task_Deadline_Workspace.md) — PKB-04-014 — Task management
- [`Clarification_Workspace.md`](./Clarification_Workspace.md) — PKB-04-015 — Q&A workspace
- [`Product_Scope_MVP.md`](../00_Product_DNA/Product_Scope_MVP.md) — PKB-00-005 — UX principles
