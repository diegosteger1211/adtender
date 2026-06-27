---
id: PKB-00-005
title: Product Scope & UX Direction — adtender MVP+
version: 1.0
status: APPROVED
owner: Product Architecture
audience:
  - Product Management
  - UX Design
  - Software Architecture
  - AI Development Agent
  - Developer
depends_on:
  - PKB-00-MASTER
  - PKB-00-001
  - PKB-00-002
tags:
  - product-scope
  - mvp
  - ux
  - workspaces
  - out-of-scope
---

# Product Scope & UX Direction — adtender MVP+

> This document formally defines the scope of the adtender MVP+ release, the out-of-scope decisions for the first commercial release, the workspace-based UX architecture, and the UX quality principles. It is a product decision document within the `00_Product_DNA` layer and takes precedence over informal scope discussions.

---

## 1. Commercial Focus Declaration

The first commercial release of adtender is a **modern enterprise tender management platform**.

adtender is not a generic procurement platform and not a generic compliance platform for the first release.

Long-term extensibility as an Enterprise Decision & Knowledge Platform (as defined in [`Product_DNA.md`](./Product_DNA.md) and [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md)) remains an architectural commitment. All design decisions in the first release must honour the bounded context isolation, event-driven integration and configurable knowledge layer that make future expansion possible.

**However: all current design decisions shall prioritize the tender management platform.**

When a scope question arises, the evaluating question is:

> **Does this help us build the best enterprise tender management platform?**

If the answer is no, the item belongs on the future roadmap rather than in the first release.

---

## 2. UX Reference Direction

The UX target is an experience comparable to modern enterprise procurement platforms such as Ivalua, Jaggaer or SAP Ariba — without copying their features or design.

The following principles are derived from observing these platforms:

| Principle | Meaning |
|---|---|
| Wizard-based tender creation | Complex multi-step processes are guided, not free-form |
| Configurable workspaces | Each user role has a dedicated, configurable work environment |
| Dashboard-driven navigation | Users land on their dashboard, not on a generic menu |
| Minimal clicks | Every interaction is designed to reduce navigation steps |
| Contextual actions | Actions appear where and when they are relevant |
| Powerful filtering | All list views support multi-criteria, saved filters |
| Saved views | Users can save and share configured views |
| Reusable templates | Standard configurations are templated and reused |
| Library-driven configuration | Requirement and evaluation configuration draws from managed libraries |
| Complete traceability | Every action is traceable from its origin to its outcome |
| Collaboration | Multi-user review, comment, approval workflows built-in |
| Role-based access | Every screen and action respects the user's role and permissions |
| AI-assisted productivity | AI suggestions appear inline, are clearly marked, and require confirmation |

---

## 3. MVP+ Capability Scope

The following capabilities constitute the MVP+ release. Every capability in this list must be fully designed and implemented before the first commercial release.

| # | Capability | Bounded Context Reference |
|---|---|---|
| 1 | Project Management | PM |
| 2 | Requirement Libraries | RM |
| 3 | Requirement Management | RM |
| 4 | Tender Creation | TM |
| 5 | Tender Publication | TM |
| 6 | Supplier Invitation | TM / OM |
| 7 | Supplier Portal | SM |
| 8 | Supplier Responses | SM |
| 9 | Clarification Management | SM / TM |
| 10 | Evaluation Workspace | EM |
| 11 | Consolidated Evaluation | EM |
| 12 | Decision & Award | DM |
| 13 | Reporting & Export | RPT |
| 14 | Knowledge Reuse | KM |
| 15 | Dashboards | RPT |
| 16 | Notifications | WM |
| 17 | Audit Trail | All |
| 18 | AI Assistance | AI layer (advisory) |

**AI Assistance scope for MVP+:**
- Requirement creation and improvement support
- Tender generation assistance
- Supplier comparison summaries
- Evaluation summaries
- Executive report generation
- Recommendation generation

AI operates as an assistant in all cases. Human confirmation is required for any business-changing action (ADR-005, AI_MASTER_CONTEXT §10).

---

## 4. Workspace Architecture

The adtender MVP+ UI is organized into six primary workspaces. A workspace is a dedicated, role-appropriate work environment for a major phase of the tender lifecycle.

### 4.1 Requirement Workspace

**Purpose:** Creating, importing, structuring and reusing requirements.

Key capabilities:
- Browse and search Requirement Libraries
- Create new Requirements with AI assistance
- Import Requirements from templates or libraries
- Structure Requirement sets for a Project
- Manage Requirement lifecycle (Draft → Review → Approved)
- Reuse and adapt existing Requirements

**Primary users:** Requirement Engineers, Project Managers, Procurement Managers

---

### 4.2 Tender Workspace

**Purpose:** Wizard-based tender creation with reusable templates and libraries.

Key capabilities:
- Create Tenders from templates or from scratch (wizard flow)
- Assign Requirements from the Requirement Workspace
- Configure evaluation models and supplier invitation lists
- Preview and validate the Tender before publication
- Publish Tenders and manage the publication lifecycle

**Primary users:** Procurement Managers, Project Managers

---

### 4.3 Supplier Workspace

**Purpose:** Clear supplier communication, invitations, clarifications and submissions.

Two distinct environments within this workspace:
- **Buyer-facing:** manage invitation lists, clarification threads, monitor submission status
- **Supplier-facing (Supplier Portal):** receive invitations, submit clarification questions, upload structured responses

Key capabilities:
- Invite and manage qualified Suppliers
- Manage clarification Q&A threads
- Monitor submission deadlines and progress
- Lock submitted responses at deadline

**Primary users (Buyer):** Procurement Managers | **Primary users (Supplier):** Supplier contacts via portal

---

### 4.4 Evaluation Workspace

**Purpose:** Fast, transparent and traceable evaluation with scoring, comments and comparison.

Key capabilities:
- Individual Evaluator scoring interface per Requirement
- Evaluator comment and rationale capture
- Score submission and locking
- Consolidated Evaluation with side-by-side Supplier comparison
- AI-assisted scoring summaries and anomaly detection
- Evaluation report generation

**Primary users:** Evaluators, Procurement Managers, Evaluation Lead

---

### 4.5 Decision Workspace

**Purpose:** Management-ready decision preparation with reports and auditability.

Key capabilities:
- Decision Board configuration and COI declaration workflow
- Access to Consolidated Evaluation Report
- Decision rationale documentation
- Decision approval with full audit trail
- Award notification trigger
- Decision Record — immutable after approval

**Primary users:** Decision Board members, Procurement Director, Management

---

### 4.6 Dashboard

**Purpose:** Modern role-based dashboards for all user groups.

Every user role has a dashboard that answers: **"What do I need to do next?"**

| Role | Dashboard Focus |
|---|---|
| Project Manager | Project health, milestone status, open items |
| Procurement Manager | Active Tenders, submission status, evaluation progress |
| Evaluator | Assigned evaluations, pending scores, upcoming deadlines |
| Decision Board Member | Decision sessions pending, COI status, reports available |
| Supplier | Invitation status, clarification threads, submission progress |
| Organization Admin | User management, platform activity, audit summary |

---

## 5. UX Quality Principles

Every screen of the adtender UI must satisfy all of the following:

| Quality | Meaning |
|---|---|
| Intuitive | No training required for common workflows |
| Fast | Primary workflows complete in minimum clicks |
| Enterprise-grade | Suitable for regulated, high-stakes procurement environments |
| Visually clean | No information overload; progressive disclosure applied |
| Workflow-oriented | Screens guide the user through the current phase, not a generic form |
| Configurable | Key views and lists are configurable per user role |
| Highly searchable | All key lists are searchable and filterable |
| Keyboard-friendly | Power users can navigate without a mouse |
| Responsive | Usable on desktop and tablet form factors |
| Consistent | Component patterns and interactions are uniform across workspaces |

**The one-question test:** Every screen must answer:

> "What does the user want to achieve next?"

If a screen does not provide a clear answer to this question, it requires redesign.

---

## 6. Out of Scope — First Release

The following are formally excluded from the MVP+ release. They remain potential future roadmap items but must not be designed, scoped or implemented as part of the first release.

| Excluded Item | Reason | Roadmap Phase |
|---|---|---|
| Generic assessment platform | Outside tender management focus for MVP | Phase 4 (potential) |
| Compliance suite (IEC 62443, ISO, regulatory) | Specialist compliance workflows beyond tender scope | Future roadmap |
| IEC 62443 cybersecurity assessment workflows | Specific regulatory domain; not core tender management | Future roadmap |
| Full Contract Lifecycle Management | Post-award contract management; adtender handles handover only | Phase 2+ |
| Enterprise platform services unrelated to tender management | Platform expansion beyond tender scope | Phase 4+ |
| Investment Decision Management | Future platform expansion domain | Phase 4 |
| Strategic Partnership Decision workflows | Future platform expansion domain | Phase 4 |
| Technology Assessment workflows | Future platform expansion domain | Phase 4 |

**Design rule:** Any feature proposal that falls within the "Out of Scope" list above must be deferred to the relevant roadmap phase. If a proposal creates architectural dependencies that would block future inclusion, that dependency must be documented as an open architectural question.

---

## 7. Relationship to Platform Vision

This document defines MVP+ commercial scope. It does not revoke the long-term platform vision.

The Enterprise Decision & Knowledge Platform vision in [`AI_MASTER_CONTEXT.md §1`](./AI_MASTER_CONTEXT.md) and [`Product_DNA.md`](./Product_DNA.md) remains the target architecture. Every MVP+ implementation decision must preserve the architectural foundations that enable the platform to expand:

- Bounded context isolation (new domains addable without restructuring)
- Event-driven integration (new consumers addable independently)
- Knowledge layer independence (reusable across all future domains)
- Configuration layer (new behavior expressible without code forks)

**The architectural principle "Platform, Not Application" (P-008, AI_MASTER_CONTEXT §3.4) applies to architecture design and remains fully in force.**

The MVP+ commercial focus directive in §1 of this document governs feature scope and delivery priority for the first release. These two statements are not contradictory; they operate at different levels:

| Level | Directive |
|---|---|
| Architecture design | Domain-neutral, configurable, bounded context isolation — platform thinking always applies |
| Commercial delivery scope | Tender management first; all current design decisions prioritize this platform |

---

## 8. Open Questions

| # | Question | Impact |
|---|---|---|
| OQ-S005-001 | When does MVP+ scope evolve to include Knowledge Reuse as a named workspace? The current MVP+ lists it as a capability but no workspace is defined. | UX specification sprint needed |
| OQ-S005-002 | Clarification Management is in scope (item 9) but no domain model document exists for the Clarification aggregate. Which bounded context owns it — TM or SM? | Domain model sprint needed before Supplier Workspace UX design |
| OQ-S005-003 | Notification is in scope (item 16) but Workflow Management (WM) bounded context has no specification. | WM domain model sprint needed |

---

## References

- [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md) — PKB-00-MASTER — Constitutional document; platform vision; workspace architecture §14.2; AI principles §10
- [`Product_DNA.md`](./Product_DNA.md) — PKB-00-001 — Product identity, philosophy, long-term scope
- [`Product_Principles.md`](./Product_Principles.md) — PKB-00-002 — P-008 Domain Neutrality; P-009 Platform Thinking
- [`ADR-005-human-in-the-loop-ai.md`](./ADR/ADR-005-human-in-the-loop-ai.md) — AI advisory constraint
- [`Domain_Model_Overview.md`](../02_Domain_Model/Domain_Model_Overview.md) — PKB-02-000 — Bounded context map
