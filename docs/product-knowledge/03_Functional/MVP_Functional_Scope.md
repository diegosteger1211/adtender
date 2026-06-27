---
id: PKB-03-001
title: MVP Functional Scope — adtender
version: 1.0
status: APPROVED
owner: Product Architecture
audience:
  - UX Designer
  - Frontend Developer
  - Backend Developer
  - AI Development Agent
  - Product Manager
depends_on:
  - PKB-00-005
  - PKB-02-001
  - PKB-02-002
  - PKB-02-003
  - PKB-02-004
  - PKB-02-005
  - PKB-02-006
  - PKB-02F-001
  - PKB-02F-002
  - PKB-02F-003
  - PKB-02F-004
  - PKB-02F-005
tags:
  - functional
  - mvp
  - scope
  - product
---

# MVP Functional Scope — adtender

---

## 1. Purpose

This document defines the complete functional scope of adtender MVP+. It translates the business capability list from [`Product_Scope_MVP.md`](../00_Product_DNA/Product_Scope_MVP.md) (PKB-00-005) into functional specifications — describing what the system does, what the user does, and what the system enforces. It is not a UI specification (see `04_UI/`) and not a domain model (see `02_Domain_Model/`).

**Scope test:** "Does this help us build the best enterprise tender management platform?" (PKB-00-005 §1)

---

## 2. Functional Areas

| # | Functional Area | Domain Model | UI Specification |
|---|---|---|---|
| F-01 | Project Management | Project (PKB-02-001) | — |
| F-02 | Requirement Library | RequirementLibrary (PKB-02F-005) | Requirement_Workspace.md |
| F-03 | Requirement Editor | Requirement (PKB-02-002) | Requirement_Workspace.md |
| F-04 | Tender Wizard | Tender (PKB-02-003) | Tender_Workspace.md §7 |
| F-05 | Supplier Invitation | Tender + SupplierProfile | Tender_Workspace.md §10 |
| F-06 | Supplier Portal | SupplierResponse (PKB-02-004) | Supplier_Workspace.md §14–20 |
| F-07 | Supplier Response Handling | SupplierResponse | Supplier_Workspace.md §17 |
| F-08 | Clarification / Q&A | Tender domain + Clarification | Clarification_Workspace.md |
| F-09 | Evaluation Matrix | Evaluation (PKB-02-005) | Evaluation_Workspace.md, Requirement_Evaluation_Matrix.md |
| F-10 | Consolidated Evaluation | Evaluation | Evaluation_Workspace.md §7+ |
| F-11 | Decision Board | Decision (PKB-02-006) | Decision_Workspace.md |
| F-12 | Task / Deadline Management | Cross-cutting | Task_Deadline_Workspace.md |
| F-13 | Dashboard | Cross-cutting | Dashboard_Concept.md |
| F-14 | Export / Reporting | Cross-cutting | All workspaces |

---

## 3. F-01: Project Management

### Description

A Project is the top-level organizing unit. It groups one or more Tenders that address a common procurement need. Projects provide the lifecycle context within which tenders run.

### User Actions

| Action | Actor | Description |
|---|---|---|
| Create Project | Project Manager | Name, description, category, team members |
| View Project Overview | Project Manager, PM | Dashboard view of all tenders, requirements, milestones |
| Add Tender to Project | Procurement Manager | Initiate a new Tender within the project |
| Archive Project | Project Manager | Marks project as closed; all tenders must be Awarded or Archived |
| View Project Lessons Learned | Project Manager | Knowledge captured at project close |

### System Enforcements

- A Tender cannot exist without a parent Project
- Archiving a Project requires all tenders to be in a terminal state (Awarded, Archived, Cancelled)
- Project TenantId is inherited by all child Tenders

### Out of Scope (MVP)

- Portfolio management / program hierarchy above Project
- Budget tracking / financial aggregation at project level
- Resource planning

---

## 4. F-02: Requirement Library

### Description

The Requirement Library is a reusable collection of standardized requirements. It is the starting point for building tender requirement sets. Requirements in the library are versioned, categorized, and can be used across multiple tenders.

### User Actions

| Action | Actor | Description |
|---|---|---|
| Browse Library | Any authenticated user | Search and filter library by category, priority, status |
| Create Library Entry | Requirement Owner | Draft a new requirement and submit for approval |
| Approve Requirement | Approver | Move a requirement from Draft to Approved status |
| Version Requirement | Approver | Create a new version of an existing requirement |
| Deprecate Requirement | Approver | Mark as no longer preferred for new tenders |
| Archive Library | Library Owner | Close a library to new entries (existing entries unaffected) |
| Import Requirement to Tender | Procurement Manager | Select requirements from library for inclusion in a tender |

### System Enforcements

- Only Approved requirements may be added to the library (LIB-BR-003)
- When a requirement is imported into a tender, the current RequirementVersionId is captured (GBR-010)
- Archiving a library does NOT change the status of its requirements (LIB-BR-005)
- RequirementLibrary is scoped to Tenant (LIB-BR-001)

### Knowledge Flywheel Connection

Lessons Learned from closed tenders feed back into the library as new or revised requirements, completing the improvement cycle: Library → Tender → Evaluation → LessonsLearned → Library.

---

## 5. F-03: Requirement Editor

### Description

The Requirement Editor is the workspace for creating and maintaining individual requirements — within a project (project-specific) or within the library (reusable). Requirements have a lifecycle: Draft → Review → Approved → Deprecated.

### User Actions

| Action | Actor | Description |
|---|---|---|
| Create Requirement | Requirement Author | Title, description, category, priority, acceptance criteria |
| Edit Requirement | Author, Reviewer | Full edit in Draft; limited edit in Review |
| Submit for Review | Author | Sends requirement to assigned Reviewer |
| Approve Requirement | Reviewer | Advances to Approved; creates immutable version |
| Reject with Comments | Reviewer | Returns to Draft with feedback |
| Duplicate Requirement | Author | Creates new Draft based on an existing requirement |
| Import from Library | Author | Pre-fills new requirement from library entry |

### System Enforcements

- A requirement cannot be added to a tender until it is Approved (GBR-009)
- Once published in a tender, the RequirementVersionId is frozen (GBR-011)
- Title, description, and category are required fields
- Acceptance Criteria field (structured or free text) is required for Approval

### AI Integration

- Quality score (1–10) computed in real-time as author types
- Duplicate detection: warns if a similar requirement exists in the library
- Wording improvement suggestions: clarity, specificity
- Category auto-suggestion

---

## 6. F-04: Tender Wizard

### Description

The Tender Wizard guides the Procurement Manager through creating a complete, publication-ready tender in 5 structured steps. It prevents incomplete tenders from being published.

### Steps

| Step | Description | System Validation |
|---|---|---|
| 1. Basics | Title, code, type (RFP/RFQ/RFI/ITT), description, template | Title required; code unique within tenant |
| 2. Requirements | Select and assign Approved requirements; set evaluation weights | Minimum 1 requirement; all weights must be set; weights need not sum to 100% |
| 3. Suppliers | Invite Qualified SupplierProfiles | Minimum 1 supplier; all must be Qualified (SPR-BR-003) |
| 4. Settings | Submission deadline, evaluation deadline, clarification settings, anonymization | Submission deadline > today; evaluation deadline > submission deadline |
| 5. Review | Read-only checklist; publish or save draft | All required sections complete before Publish |

### System Enforcements

- Publish action triggers `TenderPublished` domain event
- All invited suppliers are notified immediately on Publish
- Requirements are version-frozen at Publish (GBR-011)
- Tender must be in Published state for suppliers to access the portal

### Out of Scope (MVP)

- Multi-round tenders (clarification of offer, negotiation phase)
- Electronic sealing / cryptographic submission integrity
- Reverse auction

---

## 7. F-05: Supplier Invitation

### Description

Supplier Invitation connects a Tender to a set of SupplierProfiles from the Supplier Registry. Only Qualified suppliers may be invited. Invited suppliers receive portal access credentials.

### User Actions

| Action | Actor | Description |
|---|---|---|
| Invite Supplier | Procurement Manager | Add Qualified SupplierProfile to tender's InvitationList |
| Resend Invitation | Procurement Manager | Resend portal access email if supplier has not activated |
| Revoke Portal Access | Procurement Manager | Remove supplier access before deadline |
| Monitor Response Status | Procurement Manager | Track which suppliers have viewed, started, or submitted responses |

### System Enforcements

- Only SupplierProfiles with status `Qualified` may be added to an InvitationList (SPR-BR-003, LG-SPR-001)
- A supplier's portal access is scoped to their own tender response — no cross-supplier visibility
- Revoked access persists as an audit record even if the supplier re-qualifies later

---

## 8. F-06: Supplier Portal

### Description

The Supplier Portal is a separate, simplified application serving invited suppliers. It provides access to tender details, response submission, and clarification management. It is architecturally isolated from the buyer application.

### Capabilities

| Capability | Description |
|---|---|
| Dashboard | Open invitations, in-progress responses, upcoming deadlines |
| Tender Detail | View tender documents, requirements, published Q&A |
| Response Editor | Per-requirement response: compliance, description, evidence |
| Clarification Q&A | Post questions; view buyer answers (own + published to all) |
| Profile | Update supplier contact details |

### System Enforcements

- Supplier can only see their own data — no other supplier's responses, no evaluation data
- Response is editable until submitted; once submitted, read-only
- Auto-save every 30 seconds prevents data loss
- Submission deadline enforced by system — no late submissions

---

## 9. F-07: Supplier Response Handling

### Description

SupplierResponse records the supplier's answer to each requirement in a tender. The response is structured (per-requirement compliance + description + evidence) and immutable once submitted.

### User Actions

| Action | Actor | Description |
|---|---|---|
| Answer Requirement | Supplier | Compliance radio + description + evidence upload |
| Submit Response | Supplier | Final submission; triggers confirmation dialog |
| View Response Summary | Procurement Manager | After deadline; side-by-side comparison available |
| Export Response Comparison | Procurement Manager | XLSX with all responses side-by-side |

### System Enforcements

- Response captures RequirementVersionId at submission (GBR-010)
- Submitted SupplierResponse is immutable (SupplierResponse domain rule)
- Evidence files are stored linked to the specific RequirementVersionId in the response
- TenderId and SupplierProfileId are preserved on the response for audit (SPR-BR-006)

---

## 10. F-08: Clarification / Q&A

### Description

The Clarification system manages structured Q&A between suppliers and the buyer during the publication period. All communication is traceable. The equal treatment principle requires that answers materially relevant to all suppliers be published to everyone, anonymized.

### User Actions

| Action | Actor | Description |
|---|---|---|
| Post Question | Supplier | Submit clarification question; optionally link to a requirement |
| Draft Answer | Procurement Manager | Write a response to a supplier question |
| Publish Answer (Private) | Procurement Manager | Answer sent only to the asking supplier |
| Publish Answer (All) | Procurement Manager | Answer sent to all invited suppliers; anonymized |
| Issue Amendment Notice | Procurement Manager | Formal change notice if answer materially affects a requirement; optionally extends deadline |
| Export Clarification Log | Procurement Manager | PDF of all Q&A for procurement documentation |

### System Enforcements

- New supplier questions are blocked after the clarification deadline
- Publishing to all creates an immutable audit record
- Amendment notices trigger notifications to all suppliers
- Answers cannot be deleted once published (audit requirement)

### Business Rules

- Equal treatment: buyer's default should be "publish to all" for requirement-related answers
- Anonymization: supplier name removed from published answers by default

---

## 11. F-09: Evaluation Matrix

### Description

The Evaluation Matrix is the primary analytical tool for managing and reviewing the evaluation of supplier responses. It presents a Requirements × Suppliers comparison grid, supporting both active scoring management (pre-lock) and post-lock analysis.

### User Actions — Pre-lock

| Action | Actor | Description |
|---|---|---|
| Assign Evaluators | Evaluation Lead | Assign evaluators to suppliers (and requirements if needed) |
| Monitor Completeness | Evaluation Lead | Matrix shows completeness per cell; overdue cells highlighted |
| Send Reminder | Evaluation Lead | Notify an evaluator about incomplete scoring |
| Lock Evaluations | Evaluation Lead | Finalizes all scores; triggers score reveal |

### User Actions — Post-lock

| Action | Actor | Description |
|---|---|---|
| View Consolidated Matrix | Evaluation Lead, PM | Score heatmap; supplier ranking |
| Review Score Variance | Evaluation Lead | Identify requirements where evaluators disagree significantly |
| Revise Score | Evaluation Lead | Score revision flow with justification (preserves audit trail) |
| Export Matrix | Evaluation Lead, PM | XLSX / PDF for decision board materials |

### System Enforcements

- GBR-013 (Blind Scoring): scores and heatmap hidden until all evaluations are locked
- Scores are computed by the platform; not manually editable in the matrix
- Score revision requires a justification note and creates an audit event
- Evaluation deadline enforced (deadline visible in stage bar and task list)

---

## 12. F-10: Consolidated Evaluation

### Description

After evaluations are locked, the consolidated view provides a full side-by-side comparison of all suppliers across all requirements. This is the primary input for the Decision Board.

### Capabilities

| Capability | Description |
|---|---|
| Score Heatmap | Color-coded cells revealing relative supplier performance |
| Weighted Rankings | Total score per supplier computed from requirement weights |
| Per-Evaluator Breakdown | See which evaluator scored what (and detect calibration bias) |
| AI Analysis | Variance alerts, calibration suggestions, differentiating requirements |
| Calibration Session | Flag requirements for discussion; document calibration decisions |
| Decision Prep Report | Formatted report suitable for presenting to the Decision Board |

### Output

The consolidated evaluation produces two outputs for the Decision Board:
1. Evaluation Report (PDF/XLSX) — the full comparison
2. AI Narrative — natural language summary of findings, differences, and risks

---

## 13. F-11: Decision Board

### Description

The Decision Board manages the formal approval process for the procurement decision. It includes board configuration, Conflict of Interest declarations, record keeping, and approval.

### User Actions

| Action | Actor | Description |
|---|---|---|
| Configure Board | Procurement Manager | Set board members and chair |
| Declare COI | Each Board Member | Declare conflict or none for each supplier |
| Review Evaluation Report | Board Member (non-conflicted) | Access redacted or full report based on COI |
| Record Decision | Board Chair | Award to supplier; justification; conditions |
| Approve Decision | Board Members | Sign off; all required approvals trigger final state |
| Revoke Decision | Board Chair | Create new Decision aggregate; original preserved (GBR-017) |

### System Enforcements

- Board members with declared COI receive a redacted report (conflicted supplier's data hidden)
- Decision is immutable once all approvals are collected (GBR-017)
- Revocation creates a new Decision; the original is archived, not deleted
- Award date, justification, and approving members are all part of the permanent record

---

## 14. F-12: Task / Deadline Management

### Description

Tasks are work items tied to workflow events. They are primarily system-generated (created automatically when domain events occur) and supplemented by manual tasks. Tasks surface in the Dashboard, in the Task Workspace, and in notifications.

### Task Generation Model

| Domain Event | Generated Task | Assignee |
|---|---|---|
| `EvaluationAssigned` | Score [Supplier] for [Tender] | Assigned Evaluator |
| `DecisionBoardConvened` | Declare COI for [Tender] | Each Board Member |
| `RequirementSubmittedForReview` | Review [Requirement] | Assigned Reviewer |
| `ClarificationPosted` | Answer clarification Q-YYYY-NNNN | Procurement Manager |
| `DecisionDraftReady` | Approve Decision for [Tender] | Board Chair |

### Manual Tasks

Supplemental tasks that users create for work not covered by system workflow. Fields: title, due date, assignee, optional related record, priority.

### System Enforcements

- System-generated tasks cannot be deleted; they complete when the underlying action is taken
- Overdue tasks are surfaced prominently in the dashboard
- Task reassignment is logged with reason

---

## 15. F-13: Dashboard

### Description

The Dashboard is the user's primary orientation and action hub. It aggregates the state of all work the user is involved in across projects and tenders, and surfaces the highest-priority actions.

### Capabilities by Role

| Role | Primary Dashboard Content |
|---|---|
| Procurement Manager | Active tenders (stage bar per tender); open clarifications; deadlines |
| Project Manager | My Projects; active tenders; requirement approval queue |
| Evaluator | My evaluation tasks; scoring progress; deadlines |
| Decision Board Member | Pending COI declaration; decision approvals |
| Org Admin | User management; system alerts; audit summary |

### Navigation Hub Behavior

Every dashboard element is a navigation entry point. Users navigate to workspaces primarily from the dashboard, not from the sidebar alone.

---

## 16. F-14: Export / Reporting

### Description

Export functions are available in every workspace. All exports are version-aware — they capture the exact business object versions (RequirementVersionId, evaluation version, decision state) at the time of export for audit traceability.

### Export Catalog

| Export | Source Workspace | Format | Contents |
|---|---|---|---|
| Tender Document | Tender | PDF | Full tender: requirements, terms, supplier instructions |
| Requirement Snapshot | Tender | CSV | Frozen requirement list with versions |
| Supplier Response Comparison | Tender | XLSX | Side-by-side all supplier responses |
| Clarification Log | Clarification | PDF | All Q&A; amendment notices |
| Evaluation Matrix | Evaluation | XLSX / PDF | Full matrix with scores and evaluator breakdown |
| Gap Report | Evaluation | XLSX | Incomplete cells only |
| Calibration Report | Evaluation | XLSX | High-variance requirements |
| Decision Report | Decision | PDF | Evaluation summary + decision + approvals |
| Audit Trail | Tender | PDF | Full event history |
| My Tasks | Tasks | CSV / XLSX | Personal task list |
| Deadline Summary | Tasks | PDF | Upcoming deadlines for team meetings |
| Calendar Export | Tasks | .ics | Import tasks into calendar app |

### Business Rules

- Export includes metadata: exporter, export date, document version IDs
- Audit Trail exports are read-only and cannot be edited
- Decision Report is the formal procurement record and includes all approval signatures

---

## 17. Open Questions

| ID | Question | Impact |
|---|---|---|
| OQ-F-001 | Does the Clarification aggregate live in the Tender Bounded Context or a separate BC? | Domain model split vs. tender-centric ownership |
| OQ-F-002 | How is the Knowledge Workspace (Lessons Learned) structured? Is it a separate workspace or part of Project close? | Affects F-01 and Library feedback loop |
| OQ-F-003 | Is the Supplier Portal a separate deploy (subdomain) or a route in the main app with isolated auth? | Infrastructure decision; affects Supplier BC design |
| OQ-F-004 | Are evaluation weights additive constraints (must sum to 100%) or relative? | Affects scoring algorithm in F-09 |
| OQ-F-005 | Does the Decision Board require a formal quorum or simply all-member approval? | Affects F-11 approval flow |

---

## References

- [`Product_Scope_MVP.md`](../00_Product_DNA/Product_Scope_MVP.md) — PKB-00-005 — MVP commercial scope
- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Constitutional document
- [`INDEX.md`](../INDEX.md) — Document catalog
- Domain Model: PKB-02-001 through PKB-02-006
- Foundation Aggregates: PKB-02F-001 through PKB-02F-005
- UI Specifications: PKB-04-001 through PKB-04-016
