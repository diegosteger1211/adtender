---
id: PKB-02-009
title: Bounded Contexts — adtender Platform
version: 1.0
status: APPROVED
owner: Domain Architecture
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
depends_on:
  - PKB-00-MASTER
  - PKB-00-003
  - PKB-02-000
tags:
  - bounded-contexts
  - architecture
  - ddd
  - integration
---

# Bounded Contexts — adtender Platform

> This document is the authoritative specification of all Bounded Contexts in the adtender domain model. For the aggregate-level map and cross-context integration contract overview, see [Domain_Model_Overview.md](./Domain_Model_Overview.md).

---

## Table of Contents

1. [Context Map Overview](#1-context-map-overview)
2. [BC-PM: Project Management](#2-bc-pm-project-management)
3. [BC-RM: Requirement Management](#3-bc-rm-requirement-management)
4. [BC-TM: Tender Management](#4-bc-tm-tender-management)
5. [BC-SM: Supplier Management](#5-bc-sm-supplier-management)
6. [BC-EM: Evaluation Management](#6-bc-em-evaluation-management)
7. [BC-DM: Decision Management](#7-bc-dm-decision-management)
8. [BC-KM: Knowledge Management](#8-bc-km-knowledge-management)
9. [BC-WM: Workflow Management](#9-bc-wm-workflow-management)
10. [BC-OM: Organization Management](#10-bc-om-organization-management)
11. [BC-RPT: Reporting](#11-bc-rpt-reporting)
12. [BC-INT: Integration](#12-bc-int-integration)
13. [Context Map: Relationships and Dependencies](#13-context-map-relationships-and-dependencies)
14. [Cross-Context Rules](#14-cross-context-rules)

---

## 1. Context Map Overview

The adtender platform is decomposed into eleven Bounded Contexts. Each context:
- Has exclusive write authority over the aggregates it owns
- Communicates with other contexts exclusively through published domain events or explicit APIs
- Enforces its own invariants without relying on another context to enforce them
- Defines its own Ubiquitous Language — the same word may carry a different meaning in a different context

**Constitutional rule (AP-008):** No bounded context may read from or write to another bounded context's data store. All cross-context reads go through the owning context's public API. All cross-context state changes are triggered through domain events or command APIs.

| Context | Abbreviation | Layer | Mutable Aggregates |
|---|---|---|---|
| Project Management | PM | Application | `Project` |
| Requirement Management | RM | Organizational | `Requirement`, `RequirementLibrary` |
| Tender Management | TM | Application | `Tender` |
| Supplier Management | SM | Application | `SupplierResponse` |
| Evaluation Management | EM | Application | `Evaluation`, `ConsolidatedEvaluation` |
| Decision Management | DM | Application | `Decision` |
| Knowledge Management | KM | Organizational | `KnowledgeAsset`, `LessonsLearnedRecord` |
| Workflow Management | WM | Infrastructure | `WorkflowInstance`, `WorkflowDefinition` |
| Organization Management | OM | Infrastructure | `User`, `Organization`, `Tenant`, `SupplierProfile` |
| Reporting | RPT | Read Layer | Read models only (no mutable aggregates) |
| Integration | INT | Infrastructure | Connector configurations |

**Layers:**
- **Organizational** — Aggregates that outlive any single project and are reusable across the platform.
- **Application** — Aggregates scoped to a specific project or tender execution.
- **Infrastructure** — Platform services consumed by all application contexts.
- **Read Layer** — No mutable state; derived from domain events.

---

## 2. BC-PM: Project Management

### Responsibility

Project Management provides the organizational context in which business initiatives are executed. It coordinates the end-to-end lifecycle from project initiation through closure and archiving.

Project Management does **not** own domain knowledge (Requirements, Knowledge Assets). It is the coordination hub that connects the platform's other contexts to a specific business initiative.

### Aggregates Owned

| Aggregate | Description |
|---|---|
| `Project` | Business initiative context; coordinates lifecycle |

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| **Project** | An organizational unit for a specific business initiative (e.g., ERP selection) |
| **Project Owner** | Accountable individual with ultimate authority over the project |
| **Project Member** | Participant with an assigned role within the project |
| **Milestone** | A defined checkpoint in the project lifecycle |
| **Closing** | The deliberate act of formally ending a project after completion |
| **Archived** | Closed projects in read-only historical state; still searchable |

### Integration Contracts

#### Published Events

| Event | Consumers | Trigger |
|---|---|---|
| `ProjectCreated` | Organization Management (member onboarding) | `CreateProject` command |
| `ProjectActivated` | All contexts | Project moves to Active state |
| `ProjectClosed` | Knowledge Management (GBR-018) | `CloseProject` command |
| `ProjectArchived` | Reporting | `ArchiveProject` command |

#### Subscribed Events

| Event | Producer | Action |
|---|---|---|
| `TenderAwarded` | Tender Management | Update project phase to Award |

#### Synchronous Cross-Context Reads

| Reads | From Context | When |
|---|---|---|
| `LessonsLearnedRecord.status` | Knowledge Management | `ArchiveProject` guard (GBR-018) |

### Anti-Corruption Layer Notes

When `ArchiveProject` is executed, Project Management reads `LessonsLearnedRecord.status` through the Knowledge Management API. It does not query the KM data store directly. This is the only intentional synchronous cross-aggregate dependency in the platform domain model (see Domain_Model_Overview §7).

### Context Boundaries

**In scope:** Project lifecycle, Project membership, Project milestones, cross-domain lifecycle coordination.

**Out of scope:** Requirement content, Tender content, Supplier data, Evaluation scores, Decision rationale. Project references these by ID; it does not own or render them.

---

## 3. BC-RM: Requirement Management

### Responsibility

Requirement Management is the primary knowledge creation engine of the platform. It governs the lifecycle of Requirements from creation through library approval, usage in Tenders, and eventual archiving.

Requirements are organizational assets. They outlive any project that uses them. Requirement Management enforces this principle through aggregate ownership and library governance.

### Aggregates Owned

| Aggregate | Description | Specification |
|---|---|---|
| `Requirement` | Versioned, reusable business expectation | [Requirement.md](./Requirement.md) — PKB-02-001 |
| `RequirementLibrary` | Named collection of approved, reusable Requirements | [RequirementLibrary.md](../02_Foundation/RequirementLibrary.md) — PKB-02F-005 |

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| **Requirement** | A structured, versioned business expectation |
| **RequirementVersion** | An immutable snapshot of a Requirement at a specific version number |
| **Library** | A named, curated collection of approved Requirements for reuse |
| **Knock-out** | A Requirement whose non-fulfillment disqualifies a Supplier |
| **Response Type** | The expected format of a Supplier's answer to this Requirement |
| **Improvement Proposal** | A post-project suggestion to improve an existing Requirement |

**Boundary note:** "Requirement" in this context means the organizational business expectation. In Tender Management, the same concept appears as `TenderRequirementSnapshot` — the frozen set of version IDs pinned to a specific Tender publication. These are distinct representations with distinct purposes.

### Integration Contracts

#### Published Events

| Event | Consumers | Trigger |
|---|---|---|
| `RequirementApproved` | Tender Management (eligibility for inclusion) | `ApproveRequirement` command |
| `RequirementVersionCreated` | Tender Management, Project Management | `CreateRequirementVersion` command |
| `RequirementDeprecated` | Project Management, Tender Management | `DeprecateRequirement` command |
| `RequirementImprovementProposed` | Knowledge Management | `ProposeRequirementImprovement` command |

#### Subscribed Events

| Event | Producer | Action |
|---|---|---|
| `ImprovementProposalsSubmitted` | Knowledge Management | Intake improvement proposals for library review |

#### Synchronous Cross-Context Reads (by others from RM)

| Read by | Reads | When |
|---|---|---|
| Tender Management | `RequirementVersion` content | Tender creation/editing/display |
| Evaluation Management | `RequirementVersion` content | Evaluator scoring workspace |
| Project Management | Approved Requirement list | Requirement selection for project scope |

### Anti-Corruption Layer Notes

Contexts that reference Requirements must use `RequirementVersionId`, not `RequirementId`. The version ID is stable and immutable. Reading content by version ID through the RM API guarantees consistency (GBR-010, GBR-011).

### Context Boundaries

**In scope:** Requirement lifecycle, RequirementVersion creation, Library assignment and governance, Requirement relationships, improvement proposal intake.

**Out of scope:** Tender composition (which Requirements appear in which Tender), Supplier Response content, Evaluation scoring configuration, Project scope management.

---

## 4. BC-TM: Tender Management

### Responsibility

Tender Management governs the formal procurement document lifecycle — from draft creation through supplier publication, response collection window management, and contract handover. It is the central orchestrator of the supplier-facing side of the platform.

### Aggregates Owned

| Aggregate | Description |
|---|---|
| `Tender` | The formal procurement instrument and its full lifecycle |

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| **Tender** | The formal procurement document published to invited Suppliers |
| **TenderRequirementSnapshot** | Immutable set of `RequirementVersionIds` frozen at Tender publication |
| **EvaluationModel** | The weighting and grouping model defining how Suppliers will be scored |
| **InvitationList** | The set of Suppliers invited to respond to this Tender |
| **Amendment** | A formal modification to a published Tender, with mandatory Supplier notification |
| **Submission Deadline** | The binding datetime after which no new Supplier Responses are accepted |
| **Handover** | The formal act of transferring an awarded Tender to contract management |

**Boundary note:** "Evaluation" in Tender Management means the `EvaluationModel` (weights, groups, scoring structure). The actual scoring happens in Evaluation Management. These must not be confused.

### Integration Contracts

#### Published Events

| Event | Consumers | Trigger |
|---|---|---|
| `TenderCreated` | Project Management (reference), Reporting | `CreateTender` command |
| `TenderApproved` | Reporting | `ApproveTender` command |
| `TenderPublished` | Supplier Management (portal access grant), Notification | `PublishTender` command |
| `TenderAmended` | Supplier Management (re-notification), Reporting | `CreateTenderAmendment` command |
| `SubmissionPeriodClosed` | Evaluation Management (readiness trigger) | `CloseSubmissions` command |
| `TenderAwarded` | Project Management (phase update) | `ExecuteHandover` command |
| `TenderCancelled` | Supplier Management (close portal), Project Management | `CancelTender` command |

#### Subscribed Events

| Event | Producer | Action |
|---|---|---|
| `DecisionApproved` | Decision Management | Initiate BP12 standstill period tracking |
| `RequirementDeprecated` | Requirement Management | Notify affected Draft Tenders |

#### Synchronous Cross-Context Reads

| Reads | From | When |
|---|---|---|
| Requirement version content | Requirement Management | Tender creation/editing display only |

### Anti-Corruption Layer Notes

Tender stores `RequirementVersionId[]` in the `TenderRequirementSnapshot` — never the Requirement content itself. Content is read through the RM API for display purposes only. After publication, the snapshot is frozen; no further RM reads affect Tender integrity (GBR-009, GBR-010).

### Context Boundaries

**In scope:** Tender lifecycle, EvaluationModel configuration, TenderRequirementSnapshot, InvitationList, TenderTimeline, TenderAmendments, supplier access window management.

**Out of scope:** Supplier Response content, actual Evaluation scores, Decision rationale, Requirement Library content, contract management (CLM).

---

## 5. BC-SM: Supplier Management

### Responsibility

Supplier Management owns the complete lifecycle of each Supplier's response to a Tender. It manages the Supplier Portal's data surface — what each Supplier can see, submit, and retrieve.

Supplier Management enforces strict cross-Supplier isolation: Suppliers must never see each other's responses at any point during or after the submission window.

### Aggregates Owned

| Aggregate | Description |
|---|---|
| `SupplierResponse` | One Supplier's complete, versioned response to one Tender |

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| **SupplierResponse** | A Supplier's complete submission to a specific Tender |
| **ResponseItem** | One structured answer to one `RequirementVersionId` |
| **SubmissionVersion** | An immutable snapshot of the SupplierResponse at one submission act |
| **KnockoutCandidateFlag** | A flag indicating a ResponseItem may disqualify the Supplier |
| **Locked** | Final, non-editable state post-deadline; sealed for evaluation |
| **ResponseValue** | The typed union holding the actual answer content (yes/no, text, file, etc.) |

### Integration Contracts

#### Published Events

| Event | Consumers | Trigger |
|---|---|---|
| `SupplierResponseSubmitted` | Evaluation Management (readiness tracking) | `SubmitResponse` command |
| `SupplierResponseLocked` | Evaluation Management | Automatic at submission deadline |

#### Subscribed Events

| Event | Producer | Action |
|---|---|---|
| `TenderPublished` | Tender Management | Grant Supplier portal access; create SupplierResponse record |
| `SubmissionPeriodClosed` | Tender Management | Lock all SupplierResponses for the Tender |
| `TenderCancelled` | Tender Management | Close Supplier portal access |

#### Synchronous Cross-Context Reads

| Reads | From | When |
|---|---|---|
| Tender snapshot (RequirementVersionIds, response types) | Tender Management | SupplierResponse creation |

### Anti-Corruption Layer Notes

Evaluation Management reads SupplierResponse content through the SM API — never directly from the SM data store (AP-008). The SM API enforces cross-Supplier visibility isolation. The Evaluation Management API additionally enforces GBR-013 blind scoring isolation.

### Context Boundaries

**In scope:** Per-Supplier, per-Tender response lifecycle, ResponseItems, SubmissionVersions, KnockoutCandidateFlags, Supplier Portal data surface.

**Out of scope:** Requirement content, Tender terms, Evaluation scores, Supplier identity/profile governance (Organization Management), portal authentication.

---

## 6. BC-EM: Evaluation Management

### Responsibility

Evaluation Management owns the individual scoring phase and the consolidated evaluation phase. It enforces the most critical isolation invariant in the platform: no Evaluator may see another Evaluator's scores until all Evaluations for a Tender are Locked (GBR-013).

It produces the `ConsolidatedEvaluationReport` — the only input a Decision Board is authorized to use when making an award decision (GBR-015).

### Aggregates Owned

| Aggregate | Description |
|---|---|
| `Evaluation` | One Evaluator's scores for all Suppliers in one Tender |
| `ConsolidatedEvaluation` | Platform-computed aggregation of all individual Evaluations; produces the report |

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| **Evaluation** | One Evaluator's complete scoring record for a Tender |
| **Score** | A numerical or categorical value for one (RequirementVersionId, SupplierId) pair |
| **KnockoutDetermination** | An official finding that a Supplier failed a mandatory Requirement |
| **ConsolidatedEvaluation** | Platform-computed aggregation of all individual Evaluations |
| **Anomaly** | A statistically significant divergence between individual Evaluator scores |
| **Blind scoring** | The GBR-013 invariant: no score is visible to other Evaluators until all are Locked |
| **Locked** | Final, non-revisable state for an individual Evaluation |

**Critical invariant:** GBR-013 blind scoring is enforced at the **Repository query layer** — not only the API layer. Any data store query that would reveal cross-evaluator scores before the `AllEvaluationsLocked` gate is an architectural violation.

### Integration Contracts

#### Published Events

| Event | Consumers | Trigger |
|---|---|---|
| `EvaluatorAssigned` | Notification | `AssignEvaluator` command |
| `EvaluationsLocked` | Evaluation Management (ConsolidatedEvaluation creation) | All Evaluations for Tender reach Locked |
| `ConsolidatedEvaluationReportApproved` | Decision Management (pre-condition satisfied) | `ApproveConsolidatedEvaluationReport` command |

#### Subscribed Events

| Event | Producer | Action |
|---|---|---|
| `SubmissionPeriodClosed` | Tender Management | Trigger evaluation readiness; notify Procurement Manager |
| `EvaluationsLocked` | Evaluation Management (self-consume) | Trigger `CreateConsolidatedEvaluation` |

#### Synchronous Cross-Context Reads

| Reads | From | When |
|---|---|---|
| ResponseItem content | Supplier Management | Evaluator scoring workspace |
| EvaluationModel weights | Tender Management | ConsolidatedEvaluation score computation |

### Context Boundaries

**In scope:** Evaluator assignment, individual scoring, knockout determination, LockEvaluations coordination, ConsolidatedEvaluation computation, anomaly detection, score revisions before Lock, ConsolidatedEvaluationReport generation and approval.

**Out of scope:** Decision outcome, Board composition, COI declarations, Supplier Response content, Tender terms, Requirement content.

---

## 7. BC-DM: Decision Management

### Responsibility

Decision Management governs the formal decision process that determines procurement outcomes. It is the final human-governance step before contract award. It enforces:
- Conflict of Interest (COI) declarations before any Board member accesses Supplier data (GBR-016)
- Exclusive use of the approved Consolidated Evaluation Report as the decision basis (GBR-015)
- Decision Record immutability after approval (GBR-017)
- A complete audit trail from deliberation through outcome to approval

### Aggregates Owned

| Aggregate | Description |
|---|---|
| `Decision` | The Decision Board lifecycle, deliberation record, and approved procurement outcome |

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| **Decision Board** | The group of authorized individuals convened to reach an award decision |
| **COI Declaration** | A Conflict of Interest declaration by a Board member before accessing Supplier data |
| **Disqualification** | Removal of a Board member from Supplier-specific deliberation due to declared COI |
| **Outcome** | The Board's final determination: Award, RejectAllResponses, or CancelProcurement |
| **Override Rationale** | Mandatory documentation when the Decision deviates from the rank-1 Supplier |
| **Deliberation** | The formal session in which the Board reviews the report and reaches consensus |

**Boundary note:** "Evaluation" in Decision Management means reading the `ConsolidatedEvaluationReport` — a read-only artifact from Evaluation Management. Decision Management has no write access to Evaluation state.

### Integration Contracts

#### Published Events

| Event | Consumers | Trigger |
|---|---|---|
| `DecisionSessionOpened` | Notification | `OpenDecisionSession` command |
| `DecisionApproved` | Tender Management (BP12), Reporting | `ApproveDecision` command |
| `DecisionRevoked` | Tender Management, Reporting | `RevokeDecision` command |

#### Subscribed Events

| Event | Producer | Action |
|---|---|---|
| `ConsolidatedEvaluationReportApproved` | Evaluation Management | Pre-condition satisfied; enable `PrepareDecisionSession` |

#### Synchronous Cross-Context Reads

| Reads | From | When |
|---|---|---|
| `ConsolidatedEvaluationReport` content | Evaluation Management | Decision session preparation, Board member access |

### Anti-Corruption Layer Notes

COI enforcement: when a Board member declares a COI against a specific Supplier, the DM Application Service blocks that member from receiving `ConsolidatedEvaluationReport` data for that Supplier. Enforcement is at the Application Service layer (AP-014).

### Context Boundaries

**In scope:** Decision Board composition, COI declarations and enforcement, session lifecycle, deliberation record, outcome recording, Decision Record, revocation.

**Out of scope:** ConsolidatedEvaluationReport content (read-only from EM), Supplier Response content, Evaluation scores (read-only), contract management (CLM), notification delivery.

---

## 8. BC-KM: Knowledge Management

### Responsibility

Knowledge Management is the organizational memory layer of the platform. It has two distinct but related responsibilities:

1. **Proactive knowledge governance** — `KnowledgeAsset`: reusable organizational artifacts (templates, playbooks, market maps, regulatory guides)
2. **Reactive organizational learning** — `LessonsLearnedRecord`: structured post-project retrospectives that produce improvement proposals for the library layer

Knowledge Management aggregates outlive any individual project. Their content belongs to the organization, never to a project.

### Aggregates Owned

| Aggregate | Description |
|---|---|
| `KnowledgeAsset` | Versioned, curated organizational knowledge artifact |
| `LessonsLearnedRecord` | Post-project structured retrospective and improvement proposals |

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| **KnowledgeAsset** | A curated, versioned organizational artifact (playbook, template, guide, etc.) |
| **Provenance** | The documented source of a KnowledgeAsset version (research, experience, standard) |
| **Deprecation** | The deliberate act of marking a KnowledgeAsset as superseded |
| **LessonsLearnedRecord** | A structured post-project retrospective tied to a specific Project |
| **ImprovementProposal** | A specific, actionable suggestion to improve a Requirement or KnowledgeAsset |
| **Library Manager** | The role responsible for maintaining the quality and relevance of organizational knowledge |

### Integration Contracts

#### Published Events

| Event | Consumers | Trigger |
|---|---|---|
| `KnowledgeAssetPublished` | All registered consumers (discoverability) | `PublishKnowledgeAsset` command |
| `KnowledgeAssetDeprecated` | Project Management, Tender Management | `DeprecateKnowledgeAsset` command |
| `LessonsLearnedRecordApproved` | Project Management (archiving readiness) | `ApproveLessonsLearnedRecord` command |
| `ImprovementProposalsSubmitted` | Knowledge Management (BP15 intake), Requirement Management | `SubmitLessonsLearnedRecord` command |

#### Subscribed Events

| Event | Producer | Action |
|---|---|---|
| `ProjectClosed` | Project Management | Initiate `LessonsLearnedRecord` for the project (GBR-018) |
| `ImprovementProposalsSubmitted` | Knowledge Management (self) | BP15 intake workflow trigger |
| `RequirementImprovementProposed` | Requirement Management | Queue improvement proposal for Library Manager review |

#### Synchronous Cross-Context Reads

| Reads | From | When |
|---|---|---|
| Anomaly records, divergence data | Evaluation Management | LessonsLearnedRecord session preparation |

### Context Boundaries

**In scope:** KnowledgeAsset lifecycle and versioning, LessonsLearnedRecord lifecycle, ImprovementProposal management, library governance, provenance tracking.

**Out of scope:** Requirement Library content governance (Requirement Management), Project lifecycle management, Tender EvaluationModel state, delivery of lessons to CLM.

---

## 9. BC-WM: Workflow Management

### Responsibility

Workflow Management provides a configurable approval and task orchestration engine consumed by other bounded contexts. It externalizes multi-step approval flows, review chains, and task assignments from the domain aggregates.

Workflow Management is an **infrastructure context** — it serves the application contexts but does not own domain business objects.

### Aggregates Owned

| Aggregate | Description |
|---|---|
| `WorkflowInstance` | A running instance of a workflow definition for one business object |
| `WorkflowDefinition` | A reusable, configurable workflow template |

### Integration Notes

Workflow Management is consumed by:
- Requirement Management (approval workflow)
- Knowledge Management (KnowledgeAsset review workflow, LessonsLearnedRecord approval)
- Tender Management (Tender approval workflow)
- Decision Management (Decision Board session orchestration)

**Constraint:** Workflow Management must not embed domain business logic. Approval gates are configured by the consuming context; WM orchestrates the steps and delivers task results. Domain validity is always enforced by the domain aggregate — not by WM.

---

## 10. BC-OM: Organization Management

### Responsibility

Organization Management provides the identity, authorization, and multi-tenancy foundation for the platform. All other contexts depend on it for user identity, role resolution, and tenant data isolation (GBR-021).

### Aggregates Owned

| Aggregate | Description | Specification |
|---|---|---|
| `User` | Platform user with identity, roles, and tenant membership | [User.md](../02_Foundation/User.md) — PKB-02F-001 |
| `Organization` | A tenant organization on the platform | [Organization.md](../02_Foundation/Organization.md) — PKB-02F-002 |
| `Tenant` | The data isolation boundary (GBR-021) | [Tenant.md](../02_Foundation/Tenant.md) — PKB-02F-003 |
| `SupplierProfile` | A Supplier's organizational identity (distinct from SupplierResponse) | [SupplierProfile.md](../02_Foundation/SupplierProfile.md) — PKB-02F-004 |

### Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| **Tenant** | An isolated organizational data scope; no cross-tenant data access |
| **SupplierProfile** | A Supplier's persistent organizational identity (company data, certifications, qualification status) |
| **Qualified** | The SupplierProfile status that permits inclusion in a Tender's InvitationList |
| **Portal Access** | A Supplier's authenticated access to the Supplier-facing side of the platform |

**Boundary note:** `SupplierProfile` (OM) is the Supplier's organizational identity. `SupplierResponse` (SM) is the Supplier's response to a specific Tender. These are distinct aggregates in different bounded contexts.

### Integration Notes

Organization Management is a **shared kernel**: all other contexts depend on `UserId`, `TenantId`, and `SupplierProfileId` for authorization and isolation. Changes to OM's authorization model affect all contexts and must be reviewed across team leads before deployment.

**Qualification gate:** Before a SupplierProfile may be added to a Tender's InvitationList, Tender Management reads the SupplierProfile's qualification status through the OM API (SPR-BR-003).

---

## 11. BC-RPT: Reporting

### Responsibility

Reporting provides aggregated views, dashboards, and analytics derived from domain events. It has no mutable aggregates and is never the source of truth.

**Design rule:** Reporting read models are projections. Any discrepancy between a Reporting read model and the source aggregate is resolved in favor of the source aggregate.

### Aggregates Owned

None. Reporting consumes domain events from all contexts and builds read models.

### Subscribed Events

Reporting subscribes to a broad set of events from all contexts to maintain dashboard state. All consumers must be idempotent (AP-015).

---

## 12. BC-INT: Integration

### Responsibility

Integration manages external system connectors — ERP systems, Contract Lifecycle Management (CLM), Document Management Systems (DMS), and other third-party tools.

**Design rule:** Integration connectors must go through the public APIs of the relevant bounded context. They do not access domain data stores directly. The Integration context acts as an **Anti-Corruption Layer** between external systems and the platform's domain model.

External concepts (ERP supplier record, CLM contract event) are adapted to platform domain concepts (`SupplierProfile`, `TenderAwarded`) — not the other way around.

---

## 13. Context Map: Relationships and Dependencies

### Dependency directions

```
Organization Management (OM)
  └── consumed by all contexts for identity and authorization

Requirement Management (RM)
  └── upstream of: Tender Management, Project Management
  └── downstream of: Knowledge Management (improvement proposals)

Project Management (PM)
  └── upstream of: Tender Management, Knowledge Management
  └── downstream of: Tender Management (TenderAwarded), Knowledge Management (LessonsLearnedRecord gate)

Tender Management (TM)
  └── upstream of: Supplier Management, Evaluation Management
  └── downstream of: Project Management, Decision Management (trigger), Requirement Management

Supplier Management (SM)
  └── upstream of: Evaluation Management
  └── downstream of: Tender Management

Evaluation Management (EM)
  └── upstream of: Decision Management
  └── downstream of: Supplier Management, Tender Management

Decision Management (DM)
  └── upstream of: Tender Management (via DecisionApproved)
  └── downstream of: Evaluation Management

Knowledge Management (KM)
  └── upstream of: Requirement Management (improvement proposals)
  └── downstream of: Project Management (LessonsLearnedRecord trigger)
```

### Integration patterns in use

| Pattern | Contexts | Description |
|---|---|---|
| Published Language | All contexts | Domain events with defined schema contracts |
| Customer–Supplier | TM → SM | TM publishes events; SM adapts portal access |
| Customer–Supplier | SM → EM | SM exposes locked responses; EM reads for scoring |
| Customer–Supplier | EM → DM | EM produces approved report; DM consumes for deliberation |
| Shared Kernel | OM → All | All contexts share User, Tenant, SupplierProfile identity primitives |
| Anti-Corruption Layer | INT → All | External connectors adapt foreign models to domain concepts |
| Open Host Service | RM → TM, PM | RM exposes well-defined public API for Requirement version access |

---

## 14. Cross-Context Rules

The following rules govern all cross-context interactions. Violations are architectural defects, not style issues.

| Rule | Description | Reference |
|---|---|---|
| **No cross-context DB access** | A context must never query another context's data store directly | AP-008 |
| **No embedded content** | Aggregates reference by versioned ID; they never copy content from another aggregate | ADR-001 |
| **Event ownership** | Only the owning context may emit authoritative state-change events for its aggregates | AP-004 |
| **Idempotent consumers** | All event consumers must check for duplicate event IDs before acting | AP-015 |
| **API-first cross-context reads** | All synchronous cross-context reads go through the owning context's public API | ADR-004 |
| **Tenant isolation** | No query may return data across TenantId boundaries without explicit authorization | GBR-021 |
| **AI non-governance** | AI may assist cross-context flows (suggestions, summaries) but may not change aggregate state | ADR-005 |

---

## References

- [`Domain_Model_Overview.md`](./Domain_Model_Overview.md) — PKB-02-000 — aggregate map and cross-context integration contracts
- [`Aggregate_Relationships.md`](./Aggregate_Relationships.md) — PKB-02-010 — all aggregate-to-aggregate relationships
- [`Business_Object_Lifecycle.md`](./Business_Object_Lifecycle.md) — PKB-02-011 — lifecycle dependency chain
- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — §8 Bounded Context definitions; §10 AI constraints
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — AP-008, AP-010, AP-015, AP-016
