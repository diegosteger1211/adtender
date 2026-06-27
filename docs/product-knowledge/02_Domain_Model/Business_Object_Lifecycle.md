---
id: PKB-02-011
title: Business Object Lifecycle — adtender Platform
version: 1.1
status: APPROVED
owner: Domain Architecture
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
depends_on:
  - PKB-00-MASTER
  - PKB-02-000
  - PKB-02-009
  - PKB-02-010
  - PKB-02F-001
  - PKB-02F-002
  - PKB-02F-003
  - PKB-02F-004
  - PKB-02F-005
tags:
  - lifecycle
  - state-machine
  - ddd
  - domain-model
---

# Business Object Lifecycle — adtender Platform

> This document specifies the individual lifecycle of every Aggregate Root and describes how those lifecycles interact. For aggregate relationship definitions, see [Aggregate_Relationships.md](./Aggregate_Relationships.md). For bounded context integration contracts, see [Bounded_Contexts.md](./Bounded_Contexts.md).

---

## Table of Contents

1. [Lifecycle Design Principles](#1-lifecycle-design-principles)
2. [Project Lifecycle](#2-project-lifecycle)
3. [Requirement Lifecycle](#3-requirement-lifecycle)
4. [Tender Lifecycle](#4-tender-lifecycle)
5. [SupplierResponse Lifecycle](#5-supplierresponse-lifecycle)
6. [Evaluation Lifecycle](#6-evaluation-lifecycle)
7. [ConsolidatedEvaluation Lifecycle](#7-consolidatedevaluation-lifecycle)
8. [Decision Lifecycle](#8-decision-lifecycle)
9. [KnowledgeAsset Lifecycle](#9-knowledgeasset-lifecycle)
10. [LessonsLearnedRecord Lifecycle](#10-lessonslearnedrecord-lifecycle)
11. [Cross-Aggregate Lifecycle Gates](#11-cross-aggregate-lifecycle-gates)
12. [End-to-End Procurement Lifecycle](#12-end-to-end-procurement-lifecycle)
13. [Failure Scenarios and Recovery](#13-failure-scenarios-and-recovery)
14. [Foundation Aggregate Lifecycles](#14-foundation-aggregate-lifecycles)

---

## 1. Lifecycle Design Principles

**State is a business fact.** Every state represents a distinct and meaningful business condition. Every transition must be a named command producing a named domain event. States must not be flags or computed properties.

**States are immutable in the past.** Once an aggregate has transitioned out of a state, it does not return to a previous state except through an explicitly modeled recovery path (e.g., the `SupplierResponse` reopen loop or `Decision` revocation).

**Approved and Published content is immutable.** Once an aggregate reaches `Approved` or `Published` state, its content cannot be modified. Modification requires creating a new version (GBR-003).

**Lifecycle gates protect invariants.** Some state transitions require preconditions in other aggregates. These **lifecycle gates** are enforced by the Application Service as pre-command guards — the domain aggregate does not call into other contexts directly.

**Terminal states are irreversible.** `Archived`, `Cancelled`, and `Deprecated` are terminal states. No further transitions are possible from these states at the domain level.

---

## 2. Project Lifecycle

### State Machine

```
Idea → Initiated → Planned → Active → TenderRunning → Evaluation → Decision → Award → Closing → Archived
                                             │
                                         Cancelled (terminal — from any non-Archived state)
```

### State Definitions

| State | Meaning | Content Mutable |
|---|---|---|
| `Idea` | Pre-initiation concept; Project Owner not yet assigned | Yes |
| `Initiated` | Formally started; Project Owner assigned | Yes |
| `Planned` | Scope and milestones defined | Yes |
| `Active` | Execution underway; Tenders may be created | Yes |
| `TenderRunning` | At least one Tender is in `Published` state | Limited |
| `Evaluation` | Submission period closed; evaluation underway | Limited |
| `Decision` | Decision Board convened | Limited |
| `Award` | Decision approved; handover underway | Limited |
| `Closing` | Post-award activities; LessonsLearnedRecord in progress | Limited |
| `Archived` | All obligations fulfilled; read-only historical record | No |
| `Cancelled` | Project terminated before successful completion | No |

### Key Transitions

| Command | From State | To State | Guard |
|---|---|---|---|
| `InitiateProject` | `Idea` | `Initiated` | Project Owner assigned |
| `PlanProject` | `Initiated` | `Planned` | Scope defined |
| `ActivateProject` | `Planned` | `Active` | Milestones created |
| `CloseProject` | `Award` | `Closing` | At least one Tender in `Awarded` state |
| `ArchiveProject` | `Closing` | `Archived` | `LessonsLearnedRecord.status == Submitted` (GBR-018) |
| `CancelProject` | any (except `Archived`) | `Cancelled` | Project Owner authority; cancellation reason mandatory |

### Domain Events Produced

| Event | Trigger | Consumers |
|---|---|---|
| `ProjectCreated` | `CreateProject` | Reporting |
| `ProjectActivated` | `ActivateProject` | All contexts (readiness signal) |
| `ProjectClosed` | `CloseProject` | Knowledge Management (GBR-018 trigger) |
| `ProjectArchived` | `ArchiveProject` | Reporting |

---

## 3. Requirement Lifecycle

### State Machine

```
Draft → InReview → Approved → Published → Deprecated → Archived
            ↓
         Rejected → (revision cycle back to Draft via new version)
```

### State Definitions

| State | Meaning | Content Mutable |
|---|---|---|
| `Draft` | Being authored or revised | Yes |
| `InReview` | Submitted for quality review by designated reviewer | Limited (comments only) |
| `Approved` | Reviewed and approved for library reuse | No — new version required |
| `Published` | Included in at least one Published Tender | No |
| `Deprecated` | Superseded; should not be used in new work | No |
| `Archived` | Retained for historical traceability; no active use | No |

### Key Transitions

| Command | From State | To State | Guard |
|---|---|---|---|
| `SubmitRequirementForReview` | `Draft` | `InReview` | Title, description, type, and response type populated |
| `ApproveRequirement` | `InReview` | `Approved` | Reviewer ≠ Author (KNA-pattern: independent review) |
| `RejectRequirement` | `InReview` | `Draft` | Rejection reason mandatory; triggers version revision |
| `DeprecateRequirement` | `Approved` or `Published` | `Deprecated` | Replacement Requirement ID suggested |
| `ArchiveRequirement` | `Deprecated` | `Archived` | No active references in Draft or Published Tenders |

**Publication note:** A Requirement transitions to `Published` automatically when included in a Published Tender. This transition is triggered by `TenderPublished` event consumption, not a direct command.

### Versioning Rule

When an `Approved` or `Published` Requirement must be modified, the `CreateRequirementVersion` command creates a new version of the aggregate (with `previousVersionId` set). The new version starts as `Draft`. The prior version remains immutable in its current state (GBR-003).

### Domain Events Produced

| Event | Trigger | Consumers |
|---|---|---|
| `RequirementApproved` | `ApproveRequirement` | Tender Management (eligibility signal) |
| `RequirementVersionCreated` | `CreateRequirementVersion` | Tender Management, Project Management |
| `RequirementDeprecated` | `DeprecateRequirement` | Project Management, Tender Management |
| `RequirementImprovementProposed` | `ProposeRequirementImprovement` | Knowledge Management |

---

## 4. Tender Lifecycle

### State Machine

```
Draft → Approved → Published → Closed → Awarded
                         │
                     Cancelled (terminal — from Draft, Approved, or Published)
```

### State Definitions

| State | Meaning | Content Mutable |
|---|---|---|
| `Draft` | Under construction by Procurement Manager | Yes |
| `Approved` | Internal approval complete; not yet visible to Suppliers | No — new version required |
| `Published` | Live on Supplier Portal; submission window open | No |
| `Closed` | Submission deadline passed; no more Responses accepted | No |
| `Awarded` | Contract handover initiated; procurement complete | No |
| `Cancelled` | Tender terminated before completion | No |

### Key Transitions

| Command | From State | To State | Guard |
|---|---|---|---|
| `ApproveTender` | `Draft` | `Approved` | EvaluationModel weights sum to 100%; all RequirementVersionIds reference `Approved` versions (GBR-009) |
| `PublishTender` | `Approved` | `Published` | InvitationList non-empty; submission deadline is in the future |
| `CloseSubmissions` | `Published` | `Closed` | Submission deadline has passed |
| `ExecuteHandover` | `Closed` | `Awarded` | `Decision.status == Approved` (GBR-015 downstream) |
| `CancelTender` | `Draft` / `Approved` / `Published` | `Cancelled` | Cancellation reason mandatory |

### Publication Atomicity

`PublishTender` is a multi-effect atomic operation within the single `Tender` aggregate:
1. State transition: `Approved → Published`
2. `TenderRequirementSnapshot` created (RequirementVersionIds frozen)
3. Submission deadline and TenderTimeline frozen
4. Clarification window period set
5. Portal access records created for all invited Suppliers
6. `publishedAt` timestamp recorded
7. `TenderPublished` event emitted

All seven effects succeed or none do. This is a single-aggregate transaction — all effects are within the Tender aggregate boundary.

### Domain Events Produced

| Event | Trigger | Consumers |
|---|---|---|
| `TenderCreated` | `CreateTender` | Project Management (reference), Reporting |
| `TenderApproved` | `ApproveTender` | Reporting |
| `TenderPublished` | `PublishTender` (7-effect atomic) | Supplier Management (portal access), Notification |
| `TenderAmended` | `CreateTenderAmendment` | Supplier Management (re-notification) |
| `SubmissionPeriodClosed` | `CloseSubmissions` | Evaluation Management (readiness trigger) |
| `TenderAwarded` | `ExecuteHandover` | Project Management (phase update) |
| `TenderCancelled` | `CancelTender` | Supplier Management (close portal), Project Management |

---

## 5. SupplierResponse Lifecycle

### State Machine

```
Draft ⇌ Submitted   (reopen loop — only before submission deadline)
              │
            Locked   (automatic at submission deadline)
              │
           Rejected  (terminal — after Evaluation determination)
```

### State Definitions

| State | Meaning | Content Mutable |
|---|---|---|
| `Draft` | Being authored by Supplier through portal | Yes |
| `Submitted` | Formally submitted; may be reopened before deadline | Yes (via reopen) |
| `Locked` | Submission deadline passed; sealed for evaluation | No |
| `Rejected` | Formally excluded by Evaluation after knockout determination | No |

### Key Transitions

| Command | From State | To State | Guard |
|---|---|---|---|
| `SubmitResponse` | `Draft` | `Submitted` | All mandatory ResponseItems present |
| `ReopenResponse` | `Submitted` | `Draft` | Submission deadline not yet passed (GBR-012) |
| `LockResponse` | `Submitted` | `Locked` | Submission deadline has passed (GBR-012); event-triggered |
| `RejectResponse` | `Locked` | `Rejected` | Formal knockout determination by Evaluation Management |

**Deadline enforcement:** `LockResponse` is triggered automatically by the `SubmissionPeriodClosed` event consumed from Tender Management. A SupplierResponse in `Draft` state at the deadline is not `Locked`; it is abandoned (treated as non-submission). A SupplierResponse in `Submitted` state at the deadline is automatically Locked.

### Domain Events Produced

| Event | Trigger | Consumers |
|---|---|---|
| `SupplierResponseSubmitted` | `SubmitResponse` | Evaluation Management (readiness tracking) |
| `SupplierResponseLocked` | `LockResponse` | Evaluation Management |

---

## 6. Evaluation Lifecycle

### State Machine

```
Assigned → Scoring → Submitted → Locked
```

### State Definitions

| State | Meaning | Scores Mutable |
|---|---|---|
| `Assigned` | Evaluator assigned; access granted; scoring not started | No scores yet |
| `Scoring` | Evaluator is actively entering scores and rationale | Yes |
| `Submitted` | Evaluator has formally submitted; revision still possible before Lock | Limited (revision via `ReviseScore`) |
| `Locked` | Evaluation finalized; contributes to ConsolidatedEvaluation | No |

### GBR-013 Invariant

No Evaluator may view another Evaluator's scores at any point before all Evaluations for a given Tender have reached `Locked`. This invariant is enforced at the **Repository query layer** — any query that would expose cross-evaluator scores before the `AllEvaluationsLocked` gate is prohibited, even for users with otherwise sufficient permissions.

### Key Transitions

| Command | From State | To State | Guard |
|---|---|---|---|
| `AssignEvaluator` | — | `Assigned` | Evaluator exists; not already assigned to same Tender |
| `BeginScoring` | `Assigned` | `Scoring` | — |
| `SubmitEvaluation` | `Scoring` | `Submitted` | All mandatory (RequirementVersionId, SupplierId) pairs scored |
| `LockEvaluations` | `Submitted` (all) | `Locked` (all) | All Evaluations for the Tender are in `Submitted` state (batch operation) |

### `LockEvaluations` Atomicity

`LockEvaluations` is a batch operation across multiple `Evaluation` aggregate instances. All Evaluations for the same Tender must transition to `Locked` simultaneously. Partial lock violates GBR-013. The implementation pattern (distributed transaction, saga, or optimistic batch) requires a dedicated ADR (Open Question OQ-002).

### Domain Events Produced

| Event | Trigger | Consumers |
|---|---|---|
| `EvaluatorAssigned` | `AssignEvaluator` | Notification |
| `EvaluationsLocked` | `LockEvaluations` (batch) | Evaluation Management (ConsolidatedEvaluation creation trigger) |

---

## 7. ConsolidatedEvaluation Lifecycle

### State Machine

```
[Created via EvaluationsLocked event] → Computing → Computed → ScoresRevealed → ReportDraft → ReportApproved
```

### State Definitions

| State | Meaning |
|---|---|
| `Created` | Aggregate instantiated in response to `EvaluationsLocked` event |
| `Computing` | Platform is computing weighted scores, anomaly detection, and supplier rankings |
| `Computed` | Scores available internally; not yet revealed to authorized viewers |
| `ScoresRevealed` | Individual scores visible to authorized viewers (post-Lock) |
| `ReportDraft` | Consolidated Evaluation Report drafted |
| `ReportApproved` | Report formally approved; Decision Board may convene (GBR-015) |

### No Manual Score Override

EVL-BR-011: ConsolidatedEvaluation scores are platform-computed from all Locked Evaluations. No manual override of computed consolidated scores is permitted. If a score revision is needed, an authorized `ReviseScore` command must be applied to the original `Evaluation` aggregate, followed by a full recomputation of the `ConsolidatedEvaluation`.

### Domain Events Produced

| Event | Trigger | Consumers |
|---|---|---|
| `ConsolidatedEvaluationCreated` | `EvaluationsLocked` event consumed | Notification (readiness signal) |
| `ConsolidatedEvaluationReportApproved` | `ApproveConsolidatedEvaluationReport` | Decision Management (pre-condition satisfied) |

---

## 8. Decision Lifecycle

### State Machine

```
SessionPreparing → SessionReady → InDeliberation → OutcomeRecorded → Approved
                                                           │
                                              Revoked (does NOT revert Approved state)
                                              Creates a separate revocation record (GBR-017)
```

### State Definitions

| State | Meaning |
|---|---|
| `SessionPreparing` | Decision Board being composed; COI declarations being collected |
| `SessionReady` | All Board members have declared COI; session may formally begin |
| `InDeliberation` | Board is reviewing the ConsolidatedEvaluationReport and deliberating |
| `OutcomeRecorded` | Board has reached consensus; outcome written to record |
| `Approved` | Decision formally approved; Decision Record is immutable (GBR-017) |

### Key Transitions

| Command | From State | To State | Guard |
|---|---|---|---|
| `PrepareDecisionSession` | — | `SessionPreparing` | `ConsolidatedEvaluationReport.status == Approved` (GBR-015) |
| `OpenDecisionSession` | `SessionReady` | `InDeliberation` | All Board members have declared COI (GBR-016) |
| `RecordOutcome` | `InDeliberation` | `OutcomeRecorded` | Outcome type set; override rationale present if non-rank-1 Supplier selected (DEC-BR-005) |
| `ApproveDecision` | `OutcomeRecorded` | `Approved` | Authorized approver; all required fields complete |
| `RevokeDecision` | `Approved` | `Approved` (unchanged) | Creates separate immutable revocation record; original record is preserved and unchanged (GBR-017) |

### Domain Events Produced

| Event | Trigger | Consumers |
|---|---|---|
| `DecisionSessionOpened` | `OpenDecisionSession` | Notification |
| `DecisionApproved` | `ApproveDecision` | Tender Management (BP12 trigger), Reporting |
| `DecisionRevoked` | `RevokeDecision` | Tender Management, Reporting |

---

## 9. KnowledgeAsset Lifecycle

### State Machine

```
Draft → InReview → Approved → Published → Deprecated
            ↓
         Rejected → (revision cycle via new version)
```

### State Definitions

| State | Meaning | Content Mutable |
|---|---|---|
| `Draft` | Being authored by Knowledge Contributor | Yes |
| `InReview` | Submitted for Domain Expert review | Limited (comments only) |
| `Approved` | Review complete; ready to publish for organizational use | No |
| `Published` | Available for organizational consumption | No |
| `Deprecated` | Superseded by a newer version; consumers notified | No |

### Key Transitions

| Command | From State | To State | Guard |
|---|---|---|---|
| `SubmitKnowledgeAssetForReview` | `Draft` | `InReview` | Required fields populated; provenance source provided (KNA-BR-007) |
| `ApproveKnowledgeAsset` | `InReview` | `Approved` | At least one Domain Expert review; reviewer ≠ author (KNA-BR-001) |
| `RejectKnowledgeAsset` | `InReview` | `Draft` | Rejection reason mandatory |
| `PublishKnowledgeAsset` | `Approved` | `Published` | — |
| `DeprecateKnowledgeAsset` | `Published` | `Deprecated` | Replacement `KnowledgeAssetId` provided |

### Versioning Rule

A new version of a KnowledgeAsset creates a new aggregate instance. The new instance is a `Draft` with `previousVersionId` referencing the current Published version. The prior version remains `Published` until the new version is also `Published`, at which point the prior version transitions to `Deprecated` (GBR-003).

### Domain Events Produced

| Event | Trigger | Consumers |
|---|---|---|
| `KnowledgeAssetApproved` | `ApproveKnowledgeAsset` | Notification |
| `KnowledgeAssetPublished` | `PublishKnowledgeAsset` | All registered consumers (discoverability) |
| `KnowledgeAssetDeprecated` | `DeprecateKnowledgeAsset` (or new version published) | Project Management, Tender Management |

---

## 10. LessonsLearnedRecord Lifecycle

### State Machine

```
Initiated → InProgress → AwaitingApproval → Approved → Submitted
```

### State Definitions

| State | Meaning |
|---|---|
| `Initiated` | Record created by `ProjectClosed` event; author notified (GBR-018) |
| `InProgress` | Author is capturing lessons, process deviations, and improvement proposals |
| `AwaitingApproval` | Author has submitted the record for approval by a designated approver |
| `Approved` | Approver has reviewed and approved the record |
| `Submitted` | Record formally submitted; ImprovementProposals dispatched to BP15 |

### Key Transitions

| Command | From State | To State | Guard |
|---|---|---|---|
| `BeginLessonsLearned` | `Initiated` | `InProgress` | — |
| `SubmitForApproval` | `InProgress` | `AwaitingApproval` | At minimum `RequirementQuality` and `ProcessDeviation` categories populated (LLR-BR-004) |
| `ApproveLessonsLearnedRecord` | `AwaitingApproval` | `Approved` | Approver ≠ submitter (LLR-BR-008) |
| `SubmitLessonsLearnedRecord` | `Approved` | `Submitted` | — |

### Lifecycle Gate

`LessonsLearnedRecord.status == Submitted` is a hard precondition for `Project.ArchiveProject`. The Project Management Application Service checks this status through the Knowledge Management API before executing the `ArchiveProject` command.

### Domain Events Produced

| Event | Trigger | Consumers |
|---|---|---|
| `LessonsLearnedRecordInitiated` | `ProjectClosed` event consumed | Notification (author assignment) |
| `LessonsLearnedRecordApproved` | `ApproveLessonsLearnedRecord` | Project Management (archiving readiness) |
| `ImprovementProposalsSubmitted` | `SubmitLessonsLearnedRecord` | Knowledge Management (BP15 intake), Requirement Management |

---

## 11. Cross-Aggregate Lifecycle Gates

A lifecycle gate is a hard precondition enforced by the Application Service before a command is delivered to the target aggregate. The aggregate itself does not call into other contexts — the Application Service performs the cross-context check and rejects the command if the precondition is not met.

| Gate ID | Blocked Command | Required Pre-State | Enforced By | Rule |
|---|---|---|---|---|
| LG-001 | `ApproveTender` | All `RequirementVersionIds` in the configuration must be in `Approved` state | TM Application Service | GBR-009 |
| LG-002 | `PublishTender` | `ApproveTender` must have been executed; EvaluationModel complete | TM Application Service | Tender state |
| LG-003 | `CreateConsolidatedEvaluation` | All `Evaluation` aggregates for the Tender must be in `Locked` state | EM Application Service | EVL-BR-011 |
| LG-004 | `PrepareDecisionSession` | `ConsolidatedEvaluationReport.status == Approved` | DM Application Service | GBR-015 |
| LG-005 | `ArchiveProject` | `LessonsLearnedRecord.status == Submitted` | PM Application Service | GBR-018 |
| LG-006 | `LockResponse` | Submission deadline must have passed | SM Application Service | GBR-012 |
| LG-007 | `OpenDecisionSession` | All Board members must have declared COI | DM Application Service | GBR-016 |

---

## 12. End-to-End Procurement Lifecycle

The following sequence describes the complete lifecycle of a single procurement initiative. Each step is a hard dependency on the previous steps. Failure at any step is contained within that step's bounded context.

```
══════════════════════════════════════════════════════════════════════════════════
STEP 1 — Project Initiated
══════════════════════════════════════════════════════════════════════════════════
Context:   Project Management
State:     Project: Idea → Active
Event:     ProjectActivated
Gate out:  None
─────────────────────────────────────────────────────────────────────────────────

STEP 2 — Requirements Prepared
══════════════════════════════════════════════════════════════════════════════════
Context:   Requirement Management
State:     Requirement[]: Draft → Approved (N times)
Event:     RequirementApproved (N)
Gate out:  LG-001: All required Requirements must be Approved before ApproveTender
─────────────────────────────────────────────────────────────────────────────────

STEP 3 — Tender Created and Published
══════════════════════════════════════════════════════════════════════════════════
Context:   Tender Management
State:     Tender: Draft → Approved → Published
Events:    TenderApproved, TenderPublished (7 atomic effects)
Gate out:  TenderPublished event consumed by Supplier Management
─────────────────────────────────────────────────────────────────────────────────

STEP 4 — Supplier Responses Submitted
══════════════════════════════════════════════════════════════════════════════════
Context:   Supplier Management
State:     SupplierResponse[]: Draft → Submitted (per Supplier, during window)
Event:     SupplierResponseSubmitted (per Supplier)
Gate out:  SubmissionPeriodClosed (Tender.CloseSubmissions triggers step 5)
─────────────────────────────────────────────────────────────────────────────────

STEP 5 — Responses Locked
══════════════════════════════════════════════════════════════════════════════════
Context:   Supplier Management
State:     SupplierResponse[]: Submitted → Locked
Event:     SubmissionPeriodClosed (from TM), SupplierResponseLocked (per Supplier)
Gate out:  Evaluation Management enabled (LG-003 pre-condition counting begins)
─────────────────────────────────────────────────────────────────────────────────

STEP 6 — Individual Evaluations
══════════════════════════════════════════════════════════════════════════════════
Context:   Evaluation Management
State:     Evaluation[]: Assigned → Scoring → Submitted → Locked (all simultaneous)
Event:     EvaluationsLocked (batch; all must reach Locked simultaneously)
Gate:      GBR-013 — no cross-evaluator score visibility until all Locked
Gate out:  LG-003 satisfied; ConsolidatedEvaluation creation triggered
─────────────────────────────────────────────────────────────────────────────────

STEP 7 — Consolidated Evaluation
══════════════════════════════════════════════════════════════════════════════════
Context:   Evaluation Management
State:     ConsolidatedEvaluation: Created → Computing → Computed → ReportDraft → ReportApproved
Event:     ConsolidatedEvaluationReportApproved
Gate out:  LG-004: ConsolidatedEvaluationReport.Approved required for Decision session
─────────────────────────────────────────────────────────────────────────────────

STEP 8 — Decision
══════════════════════════════════════════════════════════════════════════════════
Context:   Decision Management
State:     Decision: SessionPreparing → SessionReady → InDeliberation → OutcomeRecorded → Approved
Event:     DecisionApproved → triggers Tender.ExecuteHandover (BP12)
Gate:      LG-007: All Board members must have declared COI (GBR-016)
Gate out:  DecisionApproved enables Tender Handover
─────────────────────────────────────────────────────────────────────────────────

STEP 9 — Tender Awarded
══════════════════════════════════════════════════════════════════════════════════
Context:   Tender Management
State:     Tender: Closed → Awarded
Event:     TenderAwarded → Project Management phase update
Gate out:  Project may advance to Closing
─────────────────────────────────────────────────────────────────────────────────

STEP 10 — Project Closed; Lessons Learned Initiated
══════════════════════════════════════════════════════════════════════════════════
Context:   Project Management → Knowledge Management
State:     Project: Award → Closing; LessonsLearnedRecord: Initiated
Event:     ProjectClosed (PM → KM, GBR-018)
Gate out:  LG-005: LessonsLearnedRecord.Submitted required for ArchiveProject
─────────────────────────────────────────────────────────────────────────────────

STEP 11 — Lessons Learned Completed
══════════════════════════════════════════════════════════════════════════════════
Context:   Knowledge Management
State:     LessonsLearnedRecord: InProgress → AwaitingApproval → Approved → Submitted
Event:     ImprovementProposalsSubmitted → BP15 intake
Gate out:  LG-005 satisfied; ArchiveProject may proceed
─────────────────────────────────────────────────────────────────────────────────

STEP 12 — Project Archived; Knowledge Flywheel Completes
══════════════════════════════════════════════════════════════════════════════════
Context:   Project Management → Knowledge Management → Requirement Management
State:     Project: Closing → Archived
Event:     ProjectArchived
Flywheel:  ImprovementProposals → Requirement Library improvements → new KnowledgeAsset versions
══════════════════════════════════════════════════════════════════════════════════
```

**Failure isolation:** A failure at any step is contained within that step's bounded context. Steps are separated by domain events, which decouple producers from consumers. If the Evaluation step is delayed, the Tender remains in `Closed` state. This does not block other Projects or other Tenders running concurrently.

---

## 13. Failure Scenarios and Recovery

### 13.1 Tender Approval Blocked (Requirements Not Approved)

**Scenario:** `ApproveTender` is attempted but some Requirements in the configuration are still in `Draft` state.

**Prevention:** Gate LG-001 — TM Application Service checks all `RequirementVersionIds` resolve to `Approved` status via RM API. Command is rejected with a list of non-approved Requirements.

**Recovery:** Approve the flagged Requirements in Requirement Management, then re-attempt `ApproveTender`.

---

### 13.2 Supplier Did Not Submit Before Deadline

**Scenario:** `SubmissionPeriodClosed` fires but a Supplier's `SupplierResponse` is still in `Draft` state.

**Prevention:** Not preventable from platform side. Draft Responses at deadline are treated as non-submissions.

**Recovery:** If a formal deadline extension is needed, a `TenderAmendment` may extend the submission deadline. Otherwise, the process continues with only the Locked (formerly Submitted) Responses.

---

### 13.3 Evaluator Does Not Submit Before LockEvaluations

**Scenario:** `LockEvaluations` is attempted but one Evaluator's `Evaluation` is still in `Scoring` state (not `Submitted`).

**Prevention:** Gate LG-003 requires all Evaluations to be in `Submitted` state. Command is rejected if any Evaluation is not ready.

**Recovery:** Procurement Manager must either wait for the Evaluator to submit or use the `ReassignEvaluator` command (if the Evaluator is unavailable) to reassign and restart the incomplete Evaluation.

---

### 13.4 Project Cannot Be Archived — LessonsLearnedRecord Not Submitted

**Scenario:** `ArchiveProject` is attempted but `LessonsLearnedRecord` is in `InProgress` state (not `Submitted`).

**Prevention:** Gate LG-005 — PM Application Service checks `LessonsLearnedRecord.status` via KM API. Command is rejected if the record is not in `Submitted` state.

**Recovery:** Complete the LessonsLearnedRecord workflow in Knowledge Management. The Project remains in `Closing` state until LG-005 is satisfied.

---

### 13.5 Decision Revocation After Approval

**Scenario:** An Approved Decision must be reconsidered (e.g., new COI discovered post-approval, or procurement outcome challenged).

**Recovery:** `RevokeDecision` creates a new, separate revocation record. The original `Approved` Decision Record is preserved and unchanged (GBR-017). A new Decision aggregate is created to restart the decision process. The procurement may need to return to the Evaluation step depending on the reason for revocation.

---

### 13.6 ConsolidatedEvaluation Score Revision Required

**Scenario:** After `ConsolidatedEvaluation` is in `ReportDraft` state, an authorized reviewer identifies a scoring error in an individual `Evaluation`.

**Recovery:** `ReviseScore` command applied to the original `Evaluation` aggregate. This resets the `ConsolidatedEvaluation` to `Computing` state and triggers a full recomputation. The report must be re-approved before the Decision session may proceed.

---

## 14. Foundation Aggregate Lifecycles

Foundation Aggregates are infrastructure and organizational-layer aggregates. Their lifecycles underpin all Domain Aggregates. No domain business object can exist without a valid, active Tenant, and no procurement action can be performed without an active User.

---

### 14.1 User Lifecycle

**Bounded Context:** Organization Management (OM) | **Spec:** [User.md](../02_Foundation/User.md) — PKB-02F-001

```
Invited → Active → Suspended → Deactivated
```

| State | Meaning | Can Perform Actions |
|---|---|---|
| `Invited` | Invitation sent; User has not yet accepted | No |
| `Active` | Email confirmed; fully operational | Yes |
| `Suspended` | Temporarily blocked (compliance or security) | No |
| `Deactivated` | Permanently removed from active roster | No |

**Key Transitions:**

| Command | From | To | Guard |
|---|---|---|---|
| `InviteUser` | — | `Invited` | Organization Admin; unique email within Tenant (USR-BR-004) |
| `AcceptInvitation` | `Invited` | `Active` | Email confirmed; invitation not expired |
| `SuspendUser` | `Active` | `Suspended` | Admin role; reason required |
| `ReactivateUser` | `Suspended` | `Active` | Admin role |
| `DeactivateUser` | `Active` / `Suspended` | `Deactivated` | Admin role; identity preserved for audit (USR-BR-003) |

**Invariant:** Deactivated Users retain their `UserId` as a resolvable identity reference. All historical audit records referencing the `UserId` remain valid. Deactivation does not cascade to owned Business Objects — those remain intact (USR-BR-003).

**Cross-context impact:** All domain aggregates that carry `UserId` for attribution (createdBy, approvedBy, evaluatorId, etc.) resolve the name at display time from OM. If the User is deactivated, the `UserId` remains resolvable but the display layer must reflect the deactivated state.

---

### 14.2 Organization Lifecycle

**Bounded Context:** Organization Management (OM) | **Spec:** [Organization.md](../02_Foundation/Organization.md) — PKB-02F-002

```
Registering → Active → Suspended → Archived
```

| State | Meaning | Tenant Effect |
|---|---|---|
| `Registering` | Onboarding in progress; TenantId allocated | Tenant: `Provisioning` |
| `Active` | Onboarding complete; fully operational | Tenant: `Active` |
| `Suspended` | All user access blocked; data preserved | Tenant: `Suspended` |
| `Archived` | Relationship ended; read-only compliance record | Tenant: `Archived` |

**Key Transitions:**

| Command | From | To | Guard |
|---|---|---|---|
| `RegisterOrganization` | — | `Registering` | OrganizationCode unique platform-wide (ORG-BR-002); automatically provisions Tenant (ORG-BR-006) |
| `CompleteOnboarding` | `Registering` | `Active` | Onboarding checklist complete; activates Tenant |
| `SuspendOrganization` | `Active` | `Suspended` | Platform Operator; reason required; cascades to Tenant suspension |
| `ReactivateOrganization` | `Suspended` | `Active` | Platform Operator; cascades to Tenant reactivation |
| `ArchiveOrganization` | `Active` / `Suspended` | `Archived` | Platform Operator; cascades to Tenant archiving |

**Invariant:** Organization cannot be deleted — only archived (ORG-BR-007). `OrganizationCode` is immutable once set (ORG-BR-009). Organization suspension cascades to Tenant suspension, blocking all User logins and data writes for the entire Organization.

---

### 14.3 Tenant Lifecycle

**Bounded Context:** Organization Management (OM) | **Spec:** [Tenant.md](../02_Foundation/Tenant.md) — PKB-02F-003

```
Provisioning → Active → Suspended → Archived
```

| State | Meaning | Data Access |
|---|---|---|
| `Provisioning` | TenantId allocated; infrastructure being set up | No reads or writes |
| `Active` | Fully operational; all data reads and writes permitted | Full |
| `Suspended` | All User logins blocked; no writes | Read-only (Platform Operator) |
| `Archived` | No further business activity; compliance reads only | Read-only |

**Key Transitions:** Tenant commands are **infrastructure-level only**. They are triggered by Organization commands, not by business user actions directly.

| Command | Triggered By | From | To |
|---|---|---|---|
| `ProvisionTenant` | `RegisterOrganization` | — | `Provisioning` |
| `ActivateTenant` | `CompleteOnboarding` | `Provisioning` | `Active` |
| `SuspendTenant` | `SuspendOrganization` | `Active` | `Suspended` |
| `ReactivateTenant` | `ReactivateOrganization` | `Suspended` | `Active` |
| `ArchiveTenant` | `ArchiveOrganization` | `Active` / `Suspended` | `Archived` |

**Invariant:** TenantId is immutable once set (TNT-BR-002). Tenant cannot be deleted — only archived (TNT-BR-004). Every Business Object created while the Tenant is `Active` carries the immutable TenantId. Archived Tenant data must remain readable for compliance (TNT-BR-008).

---

### 14.4 SupplierProfile Lifecycle

**Bounded Context:** Organization Management (OM) | **Spec:** [SupplierProfile.md](../02_Foundation/SupplierProfile.md) — PKB-02F-004

```
Registered → QualificationPending → Qualified → Suspended → Archived
                                        ↑              ↓
                                   (requalification from Suspended)
```

| State | Meaning | Can Be Invited to Tender |
|---|---|---|
| `Registered` | Basic identity created; not yet qualified | No |
| `QualificationPending` | Qualification review underway | No |
| `Qualified` | Approved for Tender participation | Yes |
| `Suspended` | Temporarily blocked (compliance issue) | No |
| `Archived` | No longer active in Buyer's Supplier base | No |

**Key Transitions:**

| Command | From | To | Guard |
|---|---|---|---|
| `RegisterSupplier` | — | `Registered` | Procurement Manager; company not already in Tenant registry |
| `StartQualification` | `Registered` | `QualificationPending` | Procurement Manager |
| `QualifySupplier` | `QualificationPending` | `Qualified` | Procurement Manager; qualification review complete |
| `RejectQualification` | `QualificationPending` | `Registered` | Procurement Manager; rejection reason required |
| `SuspendSupplier` | `Qualified` | `Suspended` | Procurement Manager; reason required |
| `RequalifySupplier` | `Suspended` | `QualificationPending` | Procurement Manager; suspension resolved |
| `ArchiveSupplier` | `Qualified` / `Suspended` | `Archived` | No open Tenders with Locked responses (SPR-BR-010) |

**Lifecycle Gate (LG-SPR-001):** The Tender Management Application Service must verify `SupplierProfile.status == Qualified` via the OM API before adding a Supplier to a Tender's InvitationList. This check is enforced at the Application Service layer (SPR-BR-003). If a SupplierProfile is suspended after being added to an InvitationList, the invitation is not automatically removed — this requires explicit Procurement Manager action.

**Invariant:** SupplierProfile cannot be deleted — only archived (SPR-BR-010). Archived profiles retain historical data for audit, including references to prior SupplierResponses (SPR-BR-006).

---

### 14.5 RequirementLibrary Lifecycle

**Bounded Context:** Requirement Management (RM) | **Spec:** [RequirementLibrary.md](../02_Foundation/RequirementLibrary.md) — PKB-02F-005

```
Draft → Active → Archived
```

| State | Meaning | Requirements Assignable | Discoverable |
|---|---|---|---|
| `Draft` | Being set up; not yet available for Project use | Yes (setup) | No |
| `Active` | Published; available for Project and Tender use | Yes (Library Manager) | Yes |
| `Archived` | Historical; no longer maintained | No | Read-only |

**Key Transitions:**

| Command | From | To | Guard |
|---|---|---|---|
| `CreateLibrary` | — | `Draft` | Library Manager; LibraryCode unique within Tenant (LIB-BR-006) |
| `PublishLibrary` | `Draft` | `Active` | At least one LibraryEntry; description complete |
| `ArchiveLibrary` | `Active` | `Archived` | No active Tenders drawing from this library |

**Library-Requirement Lifecycle Interaction:**
- Only `Approved` Requirements may be added to a library in `Draft` or `Active` state (LIB-BR-002).
- Archiving a library does **not** deprecate its Requirements (LIB-BR-005). Requirements are organizational assets independent of any library membership.
- A Requirement may belong to multiple Active libraries simultaneously (LIB-BR-007).
- When a newer version of a Requirement is published, the `LibraryEntry` may be updated to point to the new version. The old version remains resolvable through its `RequirementVersionId`.

**Knowledge Flywheel connection:** `LessonsLearnedRecord.improvementProposals[].targetLibraryId` may reference a specific Active library for intake of improved Requirements. This is the mechanism by which experience from completed procurements flows back into the shared knowledge base.

---

### 14.6 Foundation Lifecycle Gates Summary

| Gate ID | Precondition | Guarded Action | Enforcement Layer |
|---|---|---|---|
| LG-F-001 | `Organization.status == Active` | Any business operation in the Tenant | Infrastructure (TenantId validation — TNT-BR-009) |
| LG-F-002 | `User.status == Active` | Any command that modifies domain state | Application Service (USR-BR-006) |
| LG-F-003 | `SupplierProfile.status == Qualified` | Add Supplier to Tender InvitationList | TM Application Service via OM API (SPR-BR-003) |
| LG-F-004 | `RequirementLibrary.status == Active` | Discover library for Project/Tender use | RM Query layer (LIB-BR-008) |
| LG-F-005 | `Requirement.status == Approved` | Add Requirement to RequirementLibrary | RM Application Service (LIB-BR-002) |

---

## References

- [`Domain_Model_Overview.md`](./Domain_Model_Overview.md) — PKB-02-000 — aggregate map and lifecycle dependency chain overview
- [`Aggregate_Relationships.md`](./Aggregate_Relationships.md) — PKB-02-010 — all cross-aggregate references and gates
- [`Bounded_Contexts.md`](./Bounded_Contexts.md) — PKB-02-009 — bounded context integration contracts
- [`Project.md`](./Project.md) — PKB-02-002
- [`Requirement.md`](./Requirement.md) — PKB-02-001
- [`Tender.md`](./Tender.md) — PKB-02-003
- [`SupplierResponse.md`](./SupplierResponse.md) — PKB-02-004
- [`Evaluation.md`](./Evaluation.md) — PKB-02-005
- [`Decision.md`](./Decision.md) — PKB-02-006
- [`KnowledgeAsset.md`](./KnowledgeAsset.md) — PKB-02-007
- [`LessonsLearnedRecord.md`](./LessonsLearnedRecord.md) — PKB-02-008
- [`User.md`](../02_Foundation/User.md) — PKB-02F-001
- [`Organization.md`](../02_Foundation/Organization.md) — PKB-02F-002
- [`Tenant.md`](../02_Foundation/Tenant.md) — PKB-02F-003
- [`SupplierProfile.md`](../02_Foundation/SupplierProfile.md) — PKB-02F-004
- [`RequirementLibrary.md`](../02_Foundation/RequirementLibrary.md) — PKB-02F-005
