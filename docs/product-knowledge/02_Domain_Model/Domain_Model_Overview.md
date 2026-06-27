---
id: PKB-02-000
title: Domain Model Overview — adtender Platform
version: 1.0
status: APPROVED
owner: Domain Architecture
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
  - QA Engineer
depends_on:
  - PKB-00-MASTER
  - PKB-00-003
tags:
  - domain-model
  - overview
  - bounded-contexts
  - architecture
  - ddd
---

# Domain Model Overview — adtender Platform

> **This is the authoritative map of all Aggregate Roots, Bounded Contexts, ownership boundaries, and integration contracts in the adtender domain model.**
>
> Read this document when you need to understand how aggregates relate, which context owns what, or where the consistency and transaction boundaries lie. For the full specification of any individual aggregate, follow the links in the Aggregate Catalog section.

---

## Table of Contents

1. [Platform Identity](#1-platform-identity)
2. [Bounded Contexts](#2-bounded-contexts)
3. [Aggregate Catalog](#3-aggregate-catalog)
4. [Aggregate Relationship Map](#4-aggregate-relationship-map)
5. [Ownership Model](#5-ownership-model)
6. [Reference Patterns](#6-reference-patterns)
7. [Transaction Boundaries](#7-transaction-boundaries)
8. [Consistency Boundaries](#8-consistency-boundaries)
9. [Cross-Context Integration Contracts](#9-cross-context-integration-contracts)
10. [Lifecycle Dependency Chain](#10-lifecycle-dependency-chain)
11. [Event Integration Map](#11-event-integration-map)
12. [The Knowledge Flywheel](#12-the-knowledge-flywheel)
13. [Anti-Patterns and Boundary Violations](#13-anti-patterns-and-boundary-violations)
14. [Implementation Sequence](#14-implementation-sequence)

---

## 1. Platform Identity

adtender is an **Enterprise Decision & Knowledge Platform**. Tender Management is the first domain implemented. The architecture is designed to support future decision-centric domains (investment decisions, strategic sourcing, technology assessments) without restructuring existing bounded contexts.

**Core design commitments:**
- Domain logic is in the domain layer (AP-002)
- Contexts communicate only through APIs and domain events (AP-008)
- Knowledge is separated from project-specific execution (AP-010)
- Every significant state change produces an immutable domain event (AP-004)
- AI assists but does not govern; human approval is required for all accountable decisions (ADR-005)

---

## 2. Bounded Contexts

The platform is composed of eleven bounded contexts. Each context owns its aggregates, its data store, and its integration contracts.

| Bounded Context | Abbreviation | Primary Responsibility | Primary Aggregates |
|---|---|---|---|
| Project Management | PM | Project lifecycle and stakeholder governance | `Project` |
| Requirement Management | RM | Requirement creation, versioning, and library governance | `Requirement`, `RequirementLibrary` |
| Tender Management | TM | Tender creation, publication, and supplier access governance | `Tender` |
| Supplier Management | SM | Supplier response collection and portal management | `SupplierResponse` |
| Evaluation Management | EM | Individual and consolidated scoring | `Evaluation`, `ConsolidatedEvaluation` |
| Decision Management | DM | Decision Board governance and outcome recording | `Decision` |
| Knowledge Management | KM | Reusable knowledge and organizational learning | `KnowledgeAsset`, `LessonsLearnedRecord` |
| Workflow Management | WM | Configurable approval and task orchestration | `WorkflowInstance`, `WorkflowDefinition` |
| Organization Management | OM | Users, roles, permissions, tenants, Supplier profiles | `User`, `Organization`, `Tenant`, `SupplierProfile` |
| Reporting | RPT | Aggregated views, dashboards, and analytics | Read models (no mutable aggregates) |
| Integration | INT | External system connectors | Connector configurations |

**Rule (AP-007):** Each bounded context has exactly one authoritative store for each aggregate it owns. No other context may write to that store directly.

---

## 3. Aggregate Catalog

All Aggregate Roots, their owning context, document ID, and status. Foundation Aggregates (Sprint 004) are in `docs/product-knowledge/02_Foundation/`.

### Domain Aggregates (`02_Domain_Model/`)

| Aggregate | Bounded Context | PKB ID | Document | Status |
|---|---|---|---|---|
| `Project` | Project Management | PKB-02-002 | [Project.md](./Project.md) | APPROVED |
| `Requirement` | Requirement Management | PKB-02-001 | [Requirement.md](./Requirement.md) | APPROVED |
| `Tender` | Tender Management | PKB-02-003 | [Tender.md](./Tender.md) | APPROVED |
| `SupplierResponse` | Supplier Management | PKB-02-004 | [SupplierResponse.md](./SupplierResponse.md) | APPROVED |
| `Evaluation` | Evaluation Management | PKB-02-005 | [Evaluation.md](./Evaluation.md) | APPROVED |
| `ConsolidatedEvaluation` | Evaluation Management | PKB-02-005 | [Evaluation.md](./Evaluation.md) | APPROVED |
| `Decision` | Decision Management | PKB-02-006 | [Decision.md](./Decision.md) | APPROVED |
| `KnowledgeAsset` | Knowledge Management | PKB-02-007 | [KnowledgeAsset.md](./KnowledgeAsset.md) | APPROVED |
| `LessonsLearnedRecord` | Knowledge Management | PKB-02-008 | [LessonsLearnedRecord.md](./LessonsLearnedRecord.md) | APPROVED |

### Foundation Aggregates (`02_Foundation/`)

Foundation Aggregates are the infrastructure layer that all Domain Aggregates depend on. They are specified in a separate folder to reflect their cross-cutting role.

| Aggregate | Bounded Context | PKB ID | Document | Status |
|---|---|---|---|---|
| `User` | Organization Management | PKB-02F-001 | [User.md](../02_Foundation/User.md) | APPROVED |
| `Organization` | Organization Management | PKB-02F-002 | [Organization.md](../02_Foundation/Organization.md) | APPROVED |
| `Tenant` | Organization Management | PKB-02F-003 | [Tenant.md](../02_Foundation/Tenant.md) | APPROVED |
| `SupplierProfile` | Organization Management | PKB-02F-004 | [SupplierProfile.md](../02_Foundation/SupplierProfile.md) | APPROVED |
| `RequirementLibrary` | Requirement Management | PKB-02F-005 | [RequirementLibrary.md](../02_Foundation/RequirementLibrary.md) | APPROVED |

**Sprint history:** Sprint 003 brought all Domain Aggregates to APPROVED and created Bounded_Contexts.md (PKB-02-009), Aggregate_Relationships.md (PKB-02-010), Business_Object_Lifecycle.md (PKB-02-011). Sprint 004 defined all Foundation Aggregates.

---

## 4. Aggregate Relationship Map

This diagram shows all cross-aggregate references in the platform. An arrow means "A references B by identity" — not ownership.

```
                                    ┌─────────────────────────────────────────────────────────────────┐
                                    │                  Knowledge Management                            │
                                    │  KnowledgeAsset ◄────── LessonsLearnedRecord                    │
                                    │       ▲                       │                                  │
                                    │       │ feeds provenance      │ produces proposals               │
                                    └───────┼───────────────────────┼──────────────────────────────────┘
                                            │                       │
Organization Management                     │                       │
  User, SupplierProfile ──────────────────────────────────────┐    │
                                                               │    │
┌──────────────────────────────────────────────────────────────┼────┼──────────────────────────────────────────┐
│                              Project Management               │    │                                          │
│                                Project ──────────────────────┤    │                                          │
│                                    │                          │    │                                          │
│                                    │ owns context of          │    │                                          │
└────────────────────────────────────┼──────────────────────────┼───┼──────────────────────────────────────────┘
                                     │                          │   │
┌────────────────────────────────────┼──────────────────────────┼───┼──────────────────────────────────────────┐
│                    Requirement Management                      │   │                                          │
│                       Requirement ◄────────────────────────────────────────────────────┐                     │
│                         (versioned)                           │   │                    │                      │
└───────────────────────────────────────────────────────────────┼───┼────────────────────┼──────────────────────┘
                                     │                          │   │                    │
┌────────────────────────────────────▼──────────────────────────┼───┼────────────────────┼──────────────────────┐
│                     Tender Management                          │   │                    │                      │
│   Tender ◄── references RequirementVersionId[]                │   │                    │                      │
│       │       (frozen at publication into snapshot)           │   │                    │                      │
│       │                                                        │   │                    │                      │
└───────┼────────────────────────────────────────────────────────┼───┼────────────────────┼──────────────────────┘
        │                                                        │   │                    │
        │ (TenderId)                                             │   │ (projectId)        │ (requirementId)
┌───────▼──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    Supplier Management                                                                         │
│   SupplierResponse ──── per Supplier, per Tender ──────── ResponseItems (requirementVersionId refs)           │
└──────────────────────────────────────┬────────────────────────────────────────────────────────────────────────┘
                                       │ (SupplierResponseId, read at scoring time)
┌──────────────────────────────────────▼────────────────────────────────────────────────────────────────────────┐
│                    Evaluation Management                                                                        │
│   Evaluation (per Evaluator) ──► ConsolidatedEvaluation ──► ConsolidatedEvaluationReport                       │
│                                         (1 per Tender)                                                         │
└──────────────────────────────────────┬────────────────────────────────────────────────────────────────────────┘
                                       │ (ConsolidatedEvaluationReportId)
┌──────────────────────────────────────▼────────────────────────────────────────────────────────────────────────┐
│                    Decision Management                                                                          │
│   Decision ──────────────────────────────────────────────────── DecisionApproved ──► BP12                      │
│   (references Tender, ConsolidatedEvaluationReport, Suppliers)                                                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                         │             │             │
                 ProjectClosed  LessonsLearnedInitiated  ImprovementProposalsSubmitted
                         │                                          │
┌────────────────────────▼──────────────────────────────────────────▼──────────────────────────────────────────┐
│                    Knowledge Management                                                                         │
│   LessonsLearnedRecord ─────────────► ImprovementProposal[] ──► KnowledgeAsset (new/improved)                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Ownership Model

**Core rule (AP-010):** Reusable knowledge belongs to the organizational layer. Project-specific execution belongs to the project layer.

### Organizational layer (tenant-owned, project-independent)

| Asset | Owner | Lifecycle independent of any project? |
|---|---|---|
| `Requirement` | Requirement Management | Yes — versioned independently |
| `KnowledgeAsset` | Knowledge Management | Yes — outlives any project |
| `SupplierProfile` | Organization Management | Yes |
| Workflow definitions | Workflow Management | Yes |

### Project layer (project-scoped)

| Asset | Owner | Lifecycle tied to |
|---|---|---|
| `Project` | Project Management | Organization unit |
| `Tender` | Tender Management | Project |
| `SupplierResponse` | Supplier Management | Tender |
| `Evaluation` | Evaluation Management | Tender |
| `ConsolidatedEvaluation` | Evaluation Management | Tender |
| `Decision` | Decision Management | Tender |
| `LessonsLearnedRecord` | Knowledge Management | Project (but produces org-layer outputs) |

### Ownership boundaries

```
Organization (tenant)
  └── KnowledgeAsset   ← organizational layer; no projectId owner
  └── Requirement      ← organizational layer; projects reference, not own
  └── Project
        └── Tender
              └── SupplierResponse (per Supplier)
              └── Evaluation (per Evaluator)
              └── ConsolidatedEvaluation
              └── Decision
        └── LessonsLearnedRecord → produces → KnowledgeAsset (org layer)
```

---

## 6. Reference Patterns

adtender uses explicit reference patterns to maintain aggregate isolation. No aggregate embeds content from another aggregate — it references by versioned identity.

### Reference table

| Source Aggregate | Referenced Aggregate | Reference Type | Why versioned? |
|---|---|---|---|
| `Tender` | `Requirement` | `RequirementVersionId[]` (frozen snapshot) | Suppliers respond to exact version in force at publication |
| `SupplierResponse` | `Requirement` | `RequirementVersionId` per ResponseItem | Response must be traceable to exact criteria |
| `Evaluation` | `Requirement` | `RequirementVersionId` per Score | Scores must reference the same version as the Response |
| `ConsolidatedEvaluation` | `Tender` | `TenderId` | Reads EvaluationModel weights from Tender at computation time |
| `Decision` | `ConsolidatedEvaluation` | `ConsolidatedEvaluationReportId` | GBR-015: Decision must be based on approved report |
| `Decision` | `Tender` | `TenderId` | Scope context for Decision Board |
| `LessonsLearnedRecord` | `Project` | `ProjectId` | One record per project |
| `LessonsLearnedRecord` | `Requirement` | `RequirementId` per lesson | Lessons reference the Requirement that was problematic |
| `KnowledgeAsset` | `KnowledgeAsset` | `previousVersionId` | Version chain for knowledge evolution |
| `KnowledgeAsset` | `Requirement` (optional) | `RequirementId` | Assets may reference related Requirements |

### Reference resolution rule

When an aggregate needs to display content from a referenced aggregate, it reads through the public API of that aggregate's context — not directly from the database. This cross-context read is the Anti-Corruption Layer pattern (AP-008).

---

## 7. Transaction Boundaries

A transaction boundary is the set of state changes that must succeed or fail atomically. In a DDD architecture, a transaction boundary maps to one aggregate (or a small, well-justified set of aggregates).

### Single-aggregate transactions (common case)

| Operation | Transaction Boundary | Why single aggregate |
|---|---|---|
| `CreateTender` | `Tender` | All state is within Tender |
| `ScoreRequirement` | `Evaluation` | Score state is within the Evaluator's Evaluation |
| `ApproveLessonsLearnedRecord` | `LessonsLearnedRecord` | Approval state is within the record |
| `ApproveKnowledgeAsset` | `KnowledgeAsset` | Approval state is within the asset |

### Multi-effect transactions (exceptional; explicitly documented)

| Operation | Transaction Boundary | Why multi-effect |
|---|---|---|
| `PublishTender` | `Tender` aggregate (single) | The 7 effects of publication (snapshot, state change, portal access, timestamp, clarification window) are all within the Tender aggregate. Portal access records are entities within the Tender. The transaction is single-aggregate despite multi-effect. |
| `LockEvaluations` | `Evaluation[]` (batch) | All Evaluations for a Tender must transition to `Locked` atomically. Partial lock violates GBR-013 consistency. This is a batch command across multiple `Evaluation` aggregates. Implementation must use a distributed transaction or compensating pattern. |
| `SubmitImprovementProposals` → BP15 intake | `LessonsLearnedRecord` + event publish | The record transitions to `Submitted` and publishes `ImprovementProposalsSubmitted`. BP15 intake is eventual (event consumer). Not a distributed transaction. |

### Cross-context eventual consistency patterns

| Trigger | Consumer Context | Pattern | Consistency Lag |
|---|---|---|---|
| `TenderPublished` | Supplier Management | Event → Supplier portal access granted | Near-real-time |
| `EvaluationsLocked` | Evaluation Management | Event → `ConsolidatedEvaluation` created | Near-real-time |
| `DecisionApproved` | Tender Management (Handover) | Event → BP12 initiated | Near-real-time |
| `ProjectClosed` | Knowledge Management | Event → Lessons Learned initiation notification | Background |
| `ImprovementProposalsSubmitted` | Knowledge Management (BP15) | Event → Proposal intake | Background |
| `KnowledgeAssetDeprecated` | Project Management, Tender Management | Event → Consumer notifications | Background |

---

## 8. Consistency Boundaries

A consistency boundary defines what must be in a consistent state at any given moment, versus what is eventually consistent.

### Strong consistency requirements

| Invariant | Enforced within | Mechanism |
|---|---|---|
| EvaluationModel weights sum to 100% | Tender aggregate | Pre-approval guard |
| Publication is atomic (7 effects) | Tender aggregate | Single transaction |
| One SupplierResponse per Supplier per Tender | SupplierResponse aggregate + Repository | Unique constraint at creation |
| Score value within ScoringScale | Evaluation aggregate | Value object validation |
| ConsolidatedEvaluation created only when all Evaluations Locked | ConsolidatedEvaluation aggregate | Creation guard |
| Decision requires Approved ConsolidatedEvaluationReport | Decision aggregate | Approval guard |
| LessonsLearnedRecord required before Project archived | Project aggregate | Cross-aggregate state check at archival |

### Eventual consistency accepted

| State | Eventually consistent with | Max acceptable lag |
|---|---|---|
| Supplier portal access | `TenderPublished` event | < 30 seconds |
| `ConsolidatedEvaluation` creation | `EvaluationsLocked` event | < 60 seconds |
| BP15 proposal intake | `ImprovementProposalsSubmitted` event | Minutes (asynchronous workflow) |
| Knowledge Asset deprecation notifications | `KnowledgeAssetDeprecated` event | Minutes |
| Reporting read models | Source aggregate state | Minutes (acceptable for reporting) |

---

## 9. Cross-Context Integration Contracts

All cross-context communication is explicit: either through API calls (synchronous) or domain events (asynchronous).

### Published domain events (producers → consumers)

| Event | Producer | Consumer(s) | Payload Contract |
|---|---|---|---|
| `TenderPublished` | Tender Management | Supplier Management (portal access) | `tenderId`, `submissionDeadline`, `invitedSupplierIds[]` |
| `SubmissionPeriodClosed` | Tender Management | Evaluation Management (readiness) | `tenderId`, `closedAt` |
| `EvaluationsLocked` | Evaluation Management | Evaluation Management (ConsolidatedEvaluation creation) | `tenderId`, `evaluationIds[]` |
| `ConsolidatedEvaluationReportApproved` | Evaluation Management | Decision Management (pre-condition satisfied) | `consolidatedEvaluationReportId`, `tenderId` |
| `DecisionApproved` | Decision Management | Tender Management (BP12 trigger) | `decisionId`, `tenderId`, `outcomeType`, `selectedSupplierId?`, `approvedAt` |
| `ProjectClosed` | Project Management | Knowledge Management (Lessons Learned prompt) | `projectId`, `closedAt` |
| `ImprovementProposalsSubmitted` | Knowledge Management | Knowledge Management (BP15 intake) | `recordId`, `projectId`, `proposals[]` |
| `KnowledgeAssetPublished` | Knowledge Management | All consumers (discoverability) | `knowledgeAssetId`, `type`, `version` |
| `KnowledgeAssetDeprecated` | Knowledge Management | All registered consumers | `knowledgeAssetId`, `replacementId?`, `affectedConsumerCount` |
| `TenderAwarded` | Tender Management | Project Management (project state update) | `tenderId`, `awardedSupplierId`, `awardedAt` |

### Synchronous cross-context reads

| Consumer | Reads from | What | When |
|---|---|---|---|
| Tender Management | Requirement Management | Requirement version content (for display) | Tender creation/editing |
| Supplier Management | Tender Management | Tender snapshot (RequirementVersionIds, response types) | SupplierResponse creation |
| Evaluation Management | Supplier Management | ResponseItem content | Evaluator scoring workspace |
| Evaluation Management | Tender Management | EvaluationModel weights | ConsolidatedEvaluation computation |
| Decision Management | Evaluation Management | ConsolidatedEvaluationReport | Decision session preparation |
| LessonsLearnedRecord | Evaluation Management | Anomaly records, divergence data | Session preparation |

---

## 10. Lifecycle Dependency Chain

For a complete tender procurement to succeed, the following lifecycle sequence must be satisfied. Each step is a hard dependency on the previous step.

```
1. Project (Active) ────────────────────────────────────── Project Management
       │
       │ Requirements defined and approved
       ▼
2. Requirement[] (Approved) ─────────────────────────────── Requirement Management
       │
       │ Tender created and configured
       ▼
3. Tender (Draft → Approved → Published) ───────────────── Tender Management
       │
       │ Suppliers respond
       ▼
4. SupplierResponse[] (Locked) ─────────────────────────── Supplier Management
       │
       │ Evaluators assigned and score
       ▼
5. Evaluation[] (Locked) ───────────────────────────────── Evaluation Management
       │
       │ ConsolidatedEvaluation created + report approved
       ▼
6. ConsolidatedEvaluation (Approved report) ────────────── Evaluation Management
       │
       │ Decision Board convenes
       ▼
7. Decision (Approved) ─────────────────────────────────── Decision Management
       │
       │ Contract handover executed
       ▼
8. Tender (Awarded) ────────────────────────────────────── Tender Management
       │
       │ Project closes
       ▼
9. Project (Closing) ───────────────────────────────────── Project Management
       │
       │ Lessons Learned captured and approved
       ▼
10. LessonsLearnedRecord (Submitted) ───────────────────── Knowledge Management
       │
       │ Project archived
       ▼
11. Project (Archived) + KnowledgeAsset improvements ───── Knowledge Management
```

**Failure semantics:** A failure at any step is contained within that step's bounded context. Steps are separated by domain events, which decouple producers from consumers. If evaluation is delayed, the Tender remains in `Closed` state — it does not block concurrent projects or other Tenders.

---

## 11. Event Integration Map

Key domain events and their downstream effects:

```
TenderPublished ─────────────────────────────────────────────────────────────────────────────────────────
    ├── → Supplier Management: grant portal access to all invited Suppliers
    └── → Notification service: send Tender notification to Suppliers

SubmissionPeriodClosed ──────────────────────────────────────────────────────────────────────────────────
    ├── → Evaluation Management: trigger evaluation readiness notification
    └── → Notification service: notify Procurement Manager to assign Evaluators

EvaluationsLocked ───────────────────────────────────────────────────────────────────────────────────────
    └── → Evaluation Management: create ConsolidatedEvaluation aggregate (event-triggered)

ConsolidatedEvaluationReportApproved ────────────────────────────────────────────────────────────────────
    └── → Decision Management: pre-condition satisfied; notify Project Owner to initiate Decision

DecisionApproved ────────────────────────────────────────────────────────────────────────────────────────
    ├── → Tender Management: initiate standstill period tracking
    ├── → Notification service: award notification preparation (BP12)
    └── → Reporting: update decision outcome metrics

TenderAwarded ───────────────────────────────────────────────────────────────────────────────────────────
    └── → Project Management: update project status to Award phase

ProjectClosed ───────────────────────────────────────────────────────────────────────────────────────────
    └── → Knowledge Management: prompt initiation of LessonsLearnedRecord (GBR-018)

ImprovementProposalsSubmitted ───────────────────────────────────────────────────────────────────────────
    └── → Knowledge Management (BP15): create intake records for each proposal

KnowledgeAssetDeprecated ────────────────────────────────────────────────────────────────────────────────
    └── → All registered consumers (Projects, Tenders): deprecation notification
```

---

## 12. The Knowledge Flywheel

The platform's long-term value comes from its Knowledge Flywheel — the continuous cycle by which completed projects improve the organizational knowledge base.

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Knowledge Flywheel                                       │
│                                                                                             │
│   Requirement Library ──────────────────────────────────────────────────────────────┐      │
│         ▲                                                                            │      │
│         │ improved Requirements                                               Project│      │
│         │                                                                       uses │      │
│   KnowledgeAsset ──────────────────────────────────────────────┐                    │      │
│         ▲                                                       │                    ▼      │
│         │ created/improved from                          Project Template        Tender     │
│         │                                                    seeds              (Published) │
│   LessonsLearnedRecord ─────────────────────────────────────────────────────────────│      │
│         ▲                                                                            │      │
│         │ produced by                                                          SupplierResponse
│         │                                                                            │      │
│       Project ◄──────────────────────── Decision ◄──── ConsolidatedEvaluation ◄─────┘      │
│       (Closing)                         (Approved)       (Approved report)                  │
│                                                                                             │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Flywheel metrics** (platform-level KPIs):
- Library reuse rate: % of Requirements in Tenders sourced from library (not newly created)
- Improvement proposal acceptance rate: % of LessonsLearnedRecord proposals accepted into library
- Knowledge Asset utilization: # projects referencing each Knowledge Asset
- Time-to-tender: measures whether Knowledge Assets reduce Tender setup time

---

## 13. Anti-Patterns and Boundary Violations

### Cross-aggregate content embedding

**Prohibited:** `Tender` stores Requirement text directly.
**Required:** `Tender` stores `RequirementVersionId` and reads content through the Requirement Management API.

**Why:** A Tender that embeds Requirement text creates a divergent copy. If the Requirement is later corrected, the Tender and all its downstream objects (Evaluations, Decisions) would reference stale data with no synchronization mechanism.

### Cross-context database access

**Prohibited:** `EvaluationManagement` service queries the `tender_responses` table directly.
**Required:** `EvaluationManagement` reads SupplierResponse data through the Supplier Management API.

**Why:** Direct cross-context database access couples the schema of one context to the code of another. Any schema change in Supplier Management would silently break Evaluation Management queries.

### Project owning Knowledge Assets

**Prohibited:** A `Requirement` created for a specific project is only accessible within that project.
**Required:** Requirements are organizational assets. A project references them; it does not own them.

**Why:** GBR-005 and AP-010 — knowledge created in one project must survive that project and be reusable in future projects. Project-scoped knowledge is destroyed when the project is archived.

### Bypassing the Aggregate Root

**Prohibited:** An API endpoint reads a `Score` entity directly by querying the `evaluation_scores` table.
**Required:** All access to `Score` data passes through the `Evaluation` aggregate root, which enforces GBR-013 visibility rules.

**Why:** The aggregate root enforces all invariants — including cross-evaluator visibility restrictions. Bypassing it creates a path through which invariants can be violated without detection.

### Non-idempotent event consumers

**Prohibited:** A Supplier notification service sends an email every time it receives `TenderPublished`, without deduplication.
**Required:** Event consumers check whether they have already processed a given event ID before acting. AP-015.

---

## 14. Implementation Sequence

The domain model must be implemented in the following order. Each layer depends on the ones before it.

### Phase 1: Foundation (implement first)

1. **Organization Management** — Users, roles, tenants, Supplier profiles. Everything else depends on identity.
2. **Requirement Management** — `Requirement` aggregate and versioning. Referenced by everything downstream.
3. **Project Management** — `Project` aggregate. Context for all transactional aggregates.

### Phase 2: Core Transaction Chain (implement second)

4. **Tender Management** — `Tender` aggregate. Depends on Project and Requirement.
5. **Supplier Management** — `SupplierResponse` aggregate. Depends on Tender (snapshot reference).
6. **Evaluation Management** — `Evaluation` and `ConsolidatedEvaluation`. Depends on Tender and SupplierResponse.
7. **Decision Management** — `Decision` aggregate. Depends on ConsolidatedEvaluation.

### Phase 3: Knowledge Layer (implement third)

8. **Knowledge Management** — `KnowledgeAsset` aggregate. Can be developed in parallel with Phase 2.
9. **Knowledge Management** — `LessonsLearnedRecord` aggregate. Depends on Phase 2 completion (references Evaluation and Decision).

### Phase 4: Supporting Infrastructure

10. **Workflow Management** — Configurable approval and task orchestration.
11. **Reporting** — Read models and dashboards derived from domain events.
12. **Integration** — External connectors (ERP, CLM, DMS).

**Rule:** Do not begin implementing Phase 2 aggregates before the Phase 1 aggregates' domain model documents are in APPROVED status. This is the PKB gate enforced by ADR-001.

---

## References

- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Sections 5, 6, 7, 8 — full architectural context
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — AP-001 through AP-016
- [`Bounded_Contexts.md`](./Bounded_Contexts.md) — PKB-02-009 — full bounded context specifications
- [`Aggregate_Relationships.md`](./Aggregate_Relationships.md) — PKB-02-010 — all aggregate-to-aggregate relationships
- [`Business_Object_Lifecycle.md`](./Business_Object_Lifecycle.md) — PKB-02-011 — individual lifecycles, cross-aggregate gates, end-to-end procurement lifecycle
- [`Project.md`](./Project.md) — PKB-02-002
- [`Requirement.md`](./Requirement.md) — PKB-02-001
- [`Tender.md`](./Tender.md) — PKB-02-003
- [`SupplierResponse.md`](./SupplierResponse.md) — PKB-02-004
- [`Evaluation.md`](./Evaluation.md) — PKB-02-005
- [`Decision.md`](./Decision.md) — PKB-02-006
- [`KnowledgeAsset.md`](./KnowledgeAsset.md) — PKB-02-007
- [`LessonsLearnedRecord.md`](./LessonsLearnedRecord.md) — PKB-02-008
- [`Business_Process_Architecture.md`](../01_Business/Business_Process_Architecture.md)

**Foundation Aggregates (`02_Foundation/`):**
- [`User.md`](../02_Foundation/User.md) — PKB-02F-001
- [`Organization.md`](../02_Foundation/Organization.md) — PKB-02F-002
- [`Tenant.md`](../02_Foundation/Tenant.md) — PKB-02F-003
- [`SupplierProfile.md`](../02_Foundation/SupplierProfile.md) — PKB-02F-004
- [`RequirementLibrary.md`](../02_Foundation/RequirementLibrary.md) — PKB-02F-005
