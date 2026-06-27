---
id: PKB-02-005
title: Evaluation — Domain Object Specification
version: 1.0
status: APPROVED
owner: Domain Architecture
domain: Evaluation Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
  - QA Engineer
depends_on:
  - PKB-00-MASTER
  - PKB-02-001
  - PKB-02-003
  - PKB-02-004
  - PKB-01-001
used_by:
  - Decision
related_processes:
  - BP09_Evaluation
  - BP10_Consolidation
  - BP11_Decision
tags:
  - domain-model
  - aggregate
  - evaluation
  - scoring
  - ddd
---

# Evaluation — Domain Object Specification

## 1. Executive Summary

The Evaluation domain is responsible for transforming locked Supplier Responses into structured, traceable numerical scores — and for aggregating those scores into a defensible consolidated ranking that the Decision Board can act upon.

This document covers two closely related aggregates within the Evaluation Management bounded context:

- **`Evaluation`** — one instance per Evaluator assignment; owns the individual scoring work
- **`ConsolidatedEvaluation`** — one instance per Tender; owns the consolidated ranking produced after all individual Evaluations are locked

The design of these aggregates reflects a critical governance principle: **individual Evaluators must not see each other's scores until all Evaluations are locked** (GBR-013). This is not a UI rule — it is a domain constraint enforced at the data access layer. The aggregate design, the API authorization model, and the event sequence must all enforce this invariant.

A score without a rationale is not a score — it is an opinion. The Evaluation aggregate enforces rationale requirements at the command level, not as a UI suggestion.

---

## 2. Purpose

**`Evaluation` aggregate:** Captures one Evaluator's independent scoring of all assigned Supplier Responses against a defined set of Requirement groups. It is the atomic unit of evaluation work — owned by one Evaluator, scoped to one Tender, locked as a single immutable record.

**`ConsolidatedEvaluation` aggregate:** Aggregates all individual Evaluations after lock, performs anomaly detection, records the consolidation discussion outcomes (including score revisions), applies the Tender's Evaluation Model to compute final scores, produces the ranked Supplier list, and generates the Consolidated Evaluation Report that is the Decision Board's primary input.

---

## 3. Business Motivation

**Why is Evaluation a separate bounded context from Tender Management?**

The Tender defines *what* is evaluated (Requirements, weights, knock-out rules). The Evaluation defines *how well* a Supplier met what was asked. These are distinct concerns with distinct actors (Procurement Manager creates the Tender; Evaluators score responses) and distinct lifecycle constraints (the Tender is immutable at publication; Evaluations are active work up to lock). Separation allows Evaluation to evolve independently — new scoring methods, anomaly detection algorithms, and consolidation strategies can be introduced without touching the Tender domain.

**Why is the individual Evaluation a separate aggregate from the ConsolidatedEvaluation?**

The independence constraint (GBR-013) requires that individual Evaluation data be inaccessible until all Evaluations are locked. A single aggregate that contained both individual scores and the consolidated view could not enforce this isolation cleanly. The `ConsolidatedEvaluation` aggregate is created from individual `Evaluation` aggregates only after all are locked — this is an explicit domain event-triggered creation, not an in-place aggregation.

**Why must ConsolidatedEvaluation scores be computed by the platform?**

Manual score calculation (spreadsheets, hand-compiled rankings) is a governance failure in regulated procurement. The Evaluation Model weights, the scoring method per group, and the aggregation algorithm are all domain-enforced. Any human override of a calculated score is a BP10-BR-001 violation and must be technically prevented.

---

## 4. Responsibilities

### `Evaluation` aggregate responsibilities:

- Maintaining one Evaluator's scoring work for one Tender assignment
- Enforcing that an Evaluator cannot see other Evaluators' scores (data access scoping)
- Recording a `Score` per `(RequirementVersionId, SupplierId)` combination within scope
- Enforcing rationale requirements (mandatory for scores below threshold; mandatory for Knock-out Requirements)
- Recording knock-out determinations with justification
- Managing the Evaluator's submission (completion check) and lock

### `ConsolidatedEvaluation` aggregate responsibilities:

- Being created from all locked `Evaluation` instances for a Tender (event-triggered)
- Revealing all individual scores simultaneously to all Evaluators and the Procurement Manager
- Running anomaly detection across all scores and recording detected anomalies
- Recording post-discussion score revisions with mandatory justification
- Finalizing knock-out determinations (confirming or overriding)
- Computing consolidated scores using the Tender's Evaluation Model (platform calculation; not overridable)
- Producing the ranked Supplier list
- Generating and storing the Consolidated Evaluation Report
- Tracking approval of the Consolidated Evaluation Report by the Project Owner

---

## Scope

**In scope — `Evaluation` aggregate:**
- One Evaluator's scoring work: `Score` entities per (RequirementVersionId, SupplierId) combination
- `KnockoutDetermination` entities for Knock-out Requirements assessed as non-fulfilled
- Submission versioning (completeness check results per submission)
- Evaluator assignment and scope definition (which RequirementGroups and Suppliers are assigned)
- Blind scoring enforcement at data access layer (GBR-013)

**In scope — `ConsolidatedEvaluation` aggregate:**
- Read-only score matrix snapshot from all locked Evaluations
- Anomaly detection results
- Post-discussion score revisions with justification
- Knock-out finalization and override records
- Platform-computed consolidated scores and supplier ranking
- Consolidated Evaluation Report generation and approval

**Out of scope (explicitly not owned):**
- Supplier Response content → SupplierResponse aggregate (read at display time, not embedded)
- Evaluation Model weights → Tender aggregate (consumed at computation time, not copied)
- Decision outcome → Decision aggregate
- Requirement content → Requirement aggregate (referenced by RequirementVersionId only)

---

## 5. Business Context

The Evaluation domain sits between the Supplier Collaboration domain (output: locked SupplierResponses) and the Decision domain (input: approved ConsolidatedEvaluationReport).

```
Supplier Management                 Evaluation Management              Decision Management
       │                                    │                                 │
SupplierResponse[]                   Evaluation[]              ConsolidatedEvaluationReport
  (Locked)       ─── consumed by ──►   (individual)  ──────────────────────►  (approved)
                                             │                                 │
                                    ConsolidatedEvaluation          Decision aggregate
                                    (aggregated scores,                references it
                                     ranking, report)
```

The Evaluation domain reads SupplierResponse content (ResponseItems) at display time — Evaluators see the Supplier's actual answers while scoring. It does not copy ResponseItem content into the Evaluation aggregate; it holds only scores and rationale.

The Evaluation domain reads the Tender's EvaluationModel (scoring scale, group weights, scoring methods, knock-out rules) at the time of ConsolidatedEvaluation creation. The weights and methods used for consolidation are frozen from the Tender snapshot — they cannot be changed after the Tender is published.

---

## 6. Lifecycle

### `Evaluation` lifecycle:

```
EvaluationReadinessConfirmed (BP08)
              │
              │ AssignEvaluator
              ▼
         NotStarted
              │
              │ First ScoreRequirement
              ▼
          InProgress
              │
              │ SubmitEvaluation (completeness check passes)
              ▼
          Submitted
              │
              │ LockEvaluations (all Submitted → Locked; Procurement Manager command)
              ▼
            Locked ─────────────────────────────────────────────────────── (immutable)
```

### `ConsolidatedEvaluation` lifecycle:

```
All Evaluations Locked
              │
              │ CreateConsolidatedEvaluation (event-triggered)
              ▼
           Active
              │ (RevealScores → AnomalyDetection → Discussion → ScoreRevisions → KnockoutFinalization → Calculation)
              │
              │ ApproveConsolidatedEvaluationReport (Project Owner)
              ▼
           Approved ─────────────────────────────────────────────────────── (immutable)
```

---

## 7. State Machine

### `Evaluation` permitted transitions

| From | To | Command | Guard |
|---|---|---|---|
| (new) | `NotStarted` | `AssignEvaluator` | Tender in `Closed`; Evaluator has `Evaluation.Score` permission; no active conflict of interest for any Supplier in scope |
| `NotStarted` | `InProgress` | First `ScoreRequirement` | — |
| `InProgress` | `Submitted` | `SubmitEvaluation` | All required scores within scope are present; all Knock-out Requirements have rationale |
| `Submitted` | `InProgress` | `ReopenEvaluation` | All Evaluations not yet locked; Procurement Manager authorization |
| `Submitted` | `Locked` | `LockEvaluations` (batch) | All Evaluations in `Submitted` state; Procurement Manager command |

**Immutability after `Locked`:** Any `ScoreRequirement`, `RecordKnockout`, or modification command on a Locked Evaluation produces `EVALUATION_LOCKED_IMMUTABLE` error.

### `ConsolidatedEvaluation` permitted transitions

| From | To | Command | Guard |
|---|---|---|---|
| (new) | `Active` | `CreateConsolidatedEvaluation` | All Evaluations for this Tender are `Locked` |
| `Active` | `Approved` | `ApproveConsolidatedEvaluationReport` | Consolidated report generated; knock-outs finalized; Project Owner actor |

---

## 8. Business Rules

### Individual `Evaluation` rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| EVL-BR-001 | An Evaluator's assignment must be conflict-of-interest free. An Evaluator with an active conflict of interest for any Supplier in their scope must not be assigned. | `AssignEvaluator` guard |
| EVL-BR-002 | A `Score` value must fall within the Tender's configured `ScoringScale` (min ≤ score ≤ max, and score must be a valid step value). | `ScoreRequirement` guard |
| EVL-BR-003 | Score rationale is mandatory when the score value falls below the `mandatoryCommentThreshold` defined in the Tender's EvaluationModel. | `ScoreRequirement` guard |
| EVL-BR-004 | Score rationale is mandatory for all scores on Knock-out Requirements, regardless of value. | `ScoreRequirement` guard |
| EVL-BR-005 | An Evaluator may not submit their Evaluation if any required score within their scope is missing. | `SubmitEvaluation` guard |
| EVL-BR-006 | An Evaluator must not have read access to any other Evaluator's `Score` data until all Evaluations for the Tender are `Locked`. | Data access control (enforced at API authorization layer and Repository query layer) |
| EVL-BR-007 | A `KnockoutDetermination` must include a written justification. Empty justification is rejected. | `RecordKnockout` guard |
| GBR-013 | Evaluators cannot see each other's scores during the individual evaluation phase. | Data access control |
| GBR-014 | Non-fulfillment of a Knock-out Requirement disqualifies the Supplier. | `RecordKnockout`; ConsolidatedEvaluation knockout finalization |
| GBR-001 | All state transitions are auditable. | Aggregate audit log |

### `ConsolidatedEvaluation` rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| EVL-BR-008 | A `ConsolidatedEvaluation` may only be created when all `Evaluation` instances for the Tender are in `Locked` state. | `CreateConsolidatedEvaluation` guard |
| EVL-BR-009 | Score reveal must be simultaneous — all Evaluators' scores become visible to all participants at the same moment (`RevealScores` is a single atomic operation). | `RevealScores` domain behavior |
| EVL-BR-010 | Score revisions after anomaly discussion must include a written justification. Revisions without justification are rejected. | `ReviseScore` guard |
| EVL-BR-011 | Consolidated scores must be computed by the platform using the Tender's EvaluationModel. Direct write to `consolidatedScore` fields is not permitted. | Domain invariant — no public setter on consolidated score fields |
| EVL-BR-012 | Suppliers with confirmed Knock-out determinations must appear in the Consolidated Evaluation Report with their exclusion rationale. They are excluded from the ranking but must not be silently omitted. | Report generation logic |
| EVL-BR-013 | A Knock-out determination can only be overridden with a documented justification and explicit Project Owner approval. The override is recorded in the `ConsolidatedEvaluation` and in the Audit Log. | `OverrideKnockout` guard |
| EVL-BR-014 | The Consolidated Evaluation Report must be approved by the Project Owner before the Decision process (BP11) can begin. | `ApproveConsolidatedEvaluationReport`; Decision pre-condition checks this |
| GBR-015 | The Decision must be based on the Consolidated Evaluation Report. | Decision aggregate: requires `ConsolidatedEvaluationReportId` in `Approved` state |

---

## 9. Relationships

```
Tender (1)
    │
    ├── provides EvaluationModel → consumed by ConsolidatedEvaluation for score calculation
    │
    └── (1:many) Evaluation
            │
            ├── EvaluatorId ─────────────────── references User in Organization Management
            ├── TenderId ────────────────────── references Tender
            └── Score[] ─────────────────────── keyed on (requirementVersionId, supplierId)
                    │
                    └── requirementVersionId ─── reads Requirement content for display (cross-BC read)
                    └── supplierId ──────────── reads SupplierResponse content for display (cross-BC read)

ConsolidatedEvaluation (1 per Tender)
    │
    ├── TenderId ────────────────────────────── references Tender
    ├── Evaluation[] ────────────────────────── consumes all locked Evaluations for this Tender
    ├── ConsolidatedScore[] ─────────────────── computed; one per (supplierId, requirementVersionId)
    ├── SupplierRanking[] ───────────────────── computed; ordered by total score
    └── ConsolidatedEvaluationReport ──────────► referenced by Decision
```

---

## 10. Aggregate Design

### `Evaluation` Aggregate

```
Evaluation (Aggregate Root)
├── evaluationId: EvaluationId
├── tenderId: TenderId                        immutable
├── evaluatorId: EvaluatorId                  immutable (UserId)
├── tenantId: TenantId                        immutable
├── status: EvaluationStatus
├── scope: EvaluationScope                    assigned Requirement groups and Supplier ids
│   ├── assignedGroupIds: GroupId[]
│   └── assignedSupplierIds: SupplierId[]     (usually all Suppliers unless split evaluation)
├── scores: Score[]
│   └── Score
│       ├── scoreId: ScoreId
│       ├── requirementVersionId: RequirementVersionId
│       ├── supplierId: SupplierId
│       ├── value: ScoreValue                 decimal within ScoringScale
│       ├── rationale: Rationale?             mandatory per EVL-BR-003 and EVL-BR-004
│       ├── scoredAt: Timestamp
│       └── scoredBy: EvaluatorId             (same as aggregate evaluatorId — redundant but audit-valuable)
├── knockoutDeterminations: KnockoutDetermination[]
│   └── KnockoutDetermination
│       ├── requirementVersionId: RequirementVersionId
│       ├── supplierId: SupplierId
│       ├── justification: string             mandatory; non-empty
│       ├── determinedAt: Timestamp
│       └── determinedBy: EvaluatorId
├── submissionVersions: EvaluationSubmission[]  append-only
│   └── EvaluationSubmission
│       ├── submittedAt: Timestamp
│       ├── submittedBy: EvaluatorId
│       └── completenessCheckResult: EvaluationCompletenessResult
└── auditLog: AuditEntry[]                    append-only
```

### `ConsolidatedEvaluation` Aggregate

```
ConsolidatedEvaluation (Aggregate Root)
├── consolidatedEvaluationId: ConsolidatedEvaluationId
├── tenderId: TenderId                        immutable
├── tenantId: TenantId                        immutable
├── status: ConsolidatedEvaluationStatus      Active | Approved
├── scoresRevealedAt: Timestamp?              set by RevealScores
├── individualScores: EvaluatorScoreMatrix    read-only snapshot from locked Evaluations
│   └── (evaluatorId, requirementVersionId, supplierId) → ScoreValue
├── anomalies: AnomalyRecord[]                computed at CreateConsolidatedEvaluation
│   └── AnomalyRecord
│       ├── anomalyId: AnomalyId
│       ├── type: AnomalyType                 HighDivergence | ConsistentOutlier | ReversedRanking
│       ├── affectedRequirementVersionId?
│       ├── affectedSupplierId?
│       ├── affectedEvaluatorId?
│       └── resolutionStatus: AnomalyResolutionStatus
├── scoreRevisions: ScoreRevision[]           append-only; post-discussion revisions
│   └── ScoreRevision
│       ├── evaluatorId, requirementVersionId, supplierId
│       ├── previousValue: ScoreValue
│       ├── revisedValue: ScoreValue
│       ├── justification: string             mandatory; non-empty
│       ├── relatedAnomalyId: AnomalyId?
│       └── revisedAt: Timestamp
├── knockoutFinalizations: KnockoutFinalization[]
│   └── KnockoutFinalization
│       ├── requirementVersionId, supplierId
│       ├── outcome: KnockoutFinalOutcome     Confirmed | Overridden
│       ├── overrideJustification?: string    mandatory if Overridden
│       ├── overrideApprovedBy?: ActorId      Project Owner — mandatory if Overridden
│       └── finalizedAt: Timestamp
├── consolidatedScores: ConsolidatedScore[]   computed; immutable once computed
│   └── ConsolidatedScore
│       ├── requirementVersionId, supplierId
│       ├── aggregatedScore: ScoreValue       platform-computed
│       ├── computationMethod: ScoringMethod  from EvaluationModel
│       └── contributingEvaluatorCount: int
├── supplierRanking: SupplierRankEntry[]      computed; ordered descending by totalScore
│   └── SupplierRankEntry
│       ├── rank: int
│       ├── supplierId: SupplierId
│       ├── totalScore: decimal
│       ├── groupScores: { groupId, score }[]
│       └── isKnockedOut: boolean
├── consolidatedEvaluationReport: ConsolidatedEvaluationReport?
│   (generated; stored as value object once generated)
└── auditLog: AuditEntry[]
```

---

## 11. Entities

### Score (Entity within Evaluation)

| Attribute | Type | Rules |
|---|---|---|
| `scoreId` | `ScoreId` | Immutable |
| `requirementVersionId` | `RequirementVersionId` | Must be in Evaluator's assigned scope |
| `supplierId` | `SupplierId` | Must be in Evaluator's assigned scope |
| `value` | `ScoreValue` | Within `ScoringScale`; valid step value |
| `rationale` | `string` (max 5000 chars) | Mandatory per EVL-BR-003 and EVL-BR-004 |
| `scoredAt` | `Timestamp` | Immutable once set; updated on `ScoreRequirement` revision |

### AnomalyRecord (Entity within ConsolidatedEvaluation)

| Attribute | Type | Rules |
|---|---|---|
| `anomalyId` | `AnomalyId` | Immutable |
| `type` | `AnomalyType` | `HighDivergence \| ConsistentOutlier \| ReversedRanking` |
| `divergenceValue` | `decimal?` | For `HighDivergence`: the measured divergence from mean |
| `resolutionStatus` | `AnomalyResolutionStatus` | `Pending \| Reviewed \| Revised \| Accepted` |
| `resolvedAt` | `Timestamp?` | Set when status changes from Pending |

---

## 12. Value Objects

| Value Object | Type | Constraints |
|---|---|---|
| `EvaluationId` | UUID | — |
| `ConsolidatedEvaluationId` | UUID | — |
| `EvaluationStatus` | enum | `NotStarted \| InProgress \| Submitted \| Locked` |
| `ConsolidatedEvaluationStatus` | enum | `Active \| Approved` |
| `ScoreValue` | decimal | Must satisfy: `min ≤ value ≤ max` AND `(value - min) % step == 0` (within floating-point tolerance) |
| `Rationale` | `{ text: string }` | 1–5000 chars; non-empty |
| `AnomalyType` | enum | `HighDivergence \| ConsistentOutlier \| ReversedRanking` |
| `AnomalyResolutionStatus` | enum | `Pending \| Reviewed \| Revised \| Accepted` |
| `KnockoutFinalOutcome` | enum | `Confirmed \| Overridden` |
| `EvaluationScope` | `{ assignedGroupIds: GroupId[], assignedSupplierIds: SupplierId[] }` | Both arrays non-empty; set at assignment; immutable |
| `EvaluationCompletenessResult` | `{ totalRequired: int, scored: int, missingKnockoutRationale: int, allComplete: boolean }` | Computed at submission |

### Anomaly detection thresholds (configurable per tenant):

| Anomaly Type | Default Detection Rule |
|---|---|
| `HighDivergence` | A score deviates from the Evaluator group mean for that (requirement, supplier) pair by more than 30% of the scoring scale range |
| `ConsistentOutlier` | An Evaluator's mean score across all (requirement, supplier) pairs deviates from the all-Evaluator mean by more than 20% of scale range |
| `ReversedRanking` | Two Evaluators rank two Suppliers in opposite order on ≥60% of Requirements in a group |

These thresholds are configurable via the Organization Management domain's configuration. They are not hardcoded in the aggregate.

---

## 13. Commands

### `Evaluation` commands

| Command | Actor | Preconditions | State Change | Events Produced |
|---|---|---|---|---|
| `AssignEvaluator` | Procurement Manager | Tender in `Closed`; no conflict of interest | (new) → `NotStarted` | `EvaluatorAssigned` |
| `ScoreRequirement` | Evaluator | Evaluation in `InProgress` or `NotStarted`; (requirementVersionId, supplierId) in scope; value within ScoringScale; rationale present if required | Adds/updates `Score`; moves to `InProgress` if `NotStarted` | `RequirementScored` |
| `RecordKnockout` | Evaluator | Evaluation `InProgress`; Requirement is a knock-out; justification non-empty | Adds `KnockoutDetermination` | `KnockoutDetermined` |
| `SubmitEvaluation` | Evaluator | All required scores present; all Knock-out rationale present | `InProgress` → `Submitted` | `EvaluationSubmitted` |
| `ReopenEvaluation` | Procurement Manager | Evaluation `Submitted`; not yet `Locked`; reason documented | `Submitted` → `InProgress` | `EvaluationReopened` |
| `LockEvaluations` | Procurement Manager | All Evaluations `Submitted` | All → `Locked` | `EvaluationsLocked` |

### `ConsolidatedEvaluation` commands

| Command | Actor | Preconditions | State Change | Events Produced |
|---|---|---|---|---|
| `CreateConsolidatedEvaluation` | Platform (event-triggered after `EvaluationsLocked`) | All Evaluations for Tender are `Locked` | (new) → `Active` | `ConsolidatedEvaluationCreated`, `AnomalyDetected` (per anomaly) |
| `RevealScores` | Procurement Manager | ConsolidatedEvaluation `Active` | Sets `scoresRevealedAt`; scores become readable | `ScoresRevealed` |
| `FinalizeKnockout` | Procurement Manager | ConsolidatedEvaluation `Active`; KnockoutDetermination exists | Adds `KnockoutFinalization` | `KnockoutFinalized` |
| `OverrideKnockout` | Project Owner | ConsolidatedEvaluation `Active`; `overrideJustification` non-empty | Adds `KnockoutFinalization` with `Overridden` outcome | `KnockoutOverrideApproved` |
| `ReviseScore` | Evaluator (who owns the score) | ConsolidatedEvaluation `Active`; `scoresRevealedAt` is set; `justification` non-empty | Adds `ScoreRevision`; updates underlying Evaluation score | `ScoreRevisedAfterDiscussion` |
| `ComputeConsolidatedScores` | Platform (triggered after all knock-outs finalized) | All `AnomalyRecord` statuses are not `Pending`; all knock-outs finalized | Populates `consolidatedScores[]` and `supplierRanking[]` | `ConsolidatedScoresComputed` |
| `GenerateConsolidatedEvaluationReport` | Procurement Manager | `consolidatedScores` computed | Generates and stores `ConsolidatedEvaluationReport` | `ConsolidatedEvaluationReportGenerated` |
| `ApproveConsolidatedEvaluationReport` | Project Owner | Report generated; ConsolidatedEvaluation `Active` | `Active` → `Approved` | `ConsolidatedEvaluationReportApproved` |

---

## 14. Events

### `Evaluation` events

| Event | Trigger | Critical Payload |
|---|---|---|
| `EvaluatorAssigned` | `AssignEvaluator` | `evaluationId`, `tenderId`, `evaluatorId`, `scope`, `assignedAt` |
| `RequirementScored` | `ScoreRequirement` | `evaluationId`, `requirementVersionId`, `supplierId`, `value`, `rationale?`, `scoredAt` |
| `KnockoutDetermined` | `RecordKnockout` | `evaluationId`, `requirementVersionId`, `supplierId`, `justification`, `determinedAt` |
| `EvaluationSubmitted` | `SubmitEvaluation` | `evaluationId`, `submittedAt`, `completenessResult` |
| `EvaluationsLocked` | `LockEvaluations` | `tenderId`, `lockedAt`, `evaluationCount` |

### `ConsolidatedEvaluation` events

| Event | Trigger | Critical Payload |
|---|---|---|
| `ConsolidatedEvaluationCreated` | `CreateConsolidatedEvaluation` | `consolidatedEvaluationId`, `tenderId`, `evaluationIds[]`, `anomalyCount` |
| `ScoresRevealed` | `RevealScores` | `consolidatedEvaluationId`, `revealedAt`, `evaluatorCount` |
| `AnomalyDetected` | `CreateConsolidatedEvaluation` (per anomaly) | `consolidatedEvaluationId`, `anomalyId`, `type`, `affectedIds` |
| `ScoreRevisedAfterDiscussion` | `ReviseScore` | `consolidatedEvaluationId`, `evaluatorId`, `requirementVersionId`, `supplierId`, `previousValue`, `revisedValue`, `justification` |
| `KnockoutFinalized` | `FinalizeKnockout` | `consolidatedEvaluationId`, `requirementVersionId`, `supplierId`, `outcome` |
| `KnockoutOverrideApproved` | `OverrideKnockout` | `consolidatedEvaluationId`, `requirementVersionId`, `supplierId`, `justification`, `approvedBy` |
| `ConsolidatedScoresComputed` | `ComputeConsolidatedScores` | `consolidatedEvaluationId`, `supplierRanking[]` (supplierId + totalScore per entry) |
| `ConsolidatedEvaluationReportApproved` | `ApproveConsolidatedEvaluationReport` | `consolidatedEvaluationId`, `approvedBy`, `approvedAt` |

---

## 15. API Considerations

**Base resources:** `/api/v1/evaluations`, `/api/v1/consolidated-evaluations`

### Evaluation API

```
GET    /api/v1/tenders/{tenderId}/evaluations
       — List all Evaluations for Tender (Procurement Manager; filters by status)
POST   /api/v1/tenders/{tenderId}/evaluations
       — AssignEvaluator
GET    /api/v1/tenders/{tenderId}/evaluations/{evaluationId}
       — Get own Evaluation (Evaluator: own only; Procurement Manager: any)
GET    /api/v1/tenders/{tenderId}/evaluations/{evaluationId}/scores
       — Get Score list (own Evaluation only, until all Evaluations Locked)
POST   /api/v1/tenders/{tenderId}/evaluations/{evaluationId}/scores
       — ScoreRequirement
POST   /api/v1/tenders/{tenderId}/evaluations/{evaluationId}/knockout-determinations
       — RecordKnockout
POST   /api/v1/tenders/{tenderId}/evaluations/{evaluationId}/submit
       — SubmitEvaluation
POST   /api/v1/tenders/{tenderId}/evaluations/lock
       — LockEvaluations (all)
```

### Consolidated Evaluation API

```
GET    /api/v1/tenders/{tenderId}/consolidated-evaluation
       — Get ConsolidatedEvaluation (created after LockEvaluations)
POST   /api/v1/tenders/{tenderId}/consolidated-evaluation/reveal-scores
       — RevealScores
GET    /api/v1/tenders/{tenderId}/consolidated-evaluation/score-matrix
       — Get full individual score matrix (all evaluators × all requirements × all suppliers; only after RevealScores)
GET    /api/v1/tenders/{tenderId}/consolidated-evaluation/anomalies
       — List AnomalyRecords
POST   /api/v1/tenders/{tenderId}/consolidated-evaluation/scores/{evaluatorId}/{requirementVersionId}/{supplierId}/revise
       — ReviseScore
POST   /api/v1/tenders/{tenderId}/consolidated-evaluation/knockouts/{requirementVersionId}/{supplierId}/finalize
       — FinalizeKnockout
POST   /api/v1/tenders/{tenderId}/consolidated-evaluation/knockouts/{requirementVersionId}/{supplierId}/override
       — OverrideKnockout
POST   /api/v1/tenders/{tenderId}/consolidated-evaluation/compute-scores
       — ComputeConsolidatedScores
POST   /api/v1/tenders/{tenderId}/consolidated-evaluation/generate-report
       — GenerateConsolidatedEvaluationReport
GET    /api/v1/tenders/{tenderId}/consolidated-evaluation/report
       — Get/download ConsolidatedEvaluationReport
POST   /api/v1/tenders/{tenderId}/consolidated-evaluation/approve-report
       — ApproveConsolidatedEvaluationReport
GET    /api/v1/tenders/{tenderId}/consolidated-evaluation/ranking
       — Get SupplierRanking (post-computation)
```

**Critical authorization rules:**

- `GET /evaluations/{id}/scores` returns `403 SCORE_VISIBILITY_RESTRICTED` if the requesting Evaluator's Evaluation is not Locked and other Evaluations for the same Tender are not all Locked. This is GBR-013 enforced at the API layer.
- `GET /consolidated-evaluation/score-matrix` returns `403 SCORES_NOT_YET_REVEALED` if `scoresRevealedAt` is null.
- `POST revise` returns `409 SCORE_REVISION_REQUIRES_JUSTIFICATION` if `justification` is empty.
- Supplier identity in the consolidated ranking is masked if `Tender.confidentialityMode == Anonymized` — `supplierId` is replaced with an anonymization code until the Decision Board chooses to unmask (separate `unmask-suppliers` command).

---

## Permissions

| Permission | Role(s) Required | Conditions |
|---|---|---|
| `Evaluation.Assign` | Procurement Manager | Tender in `Closed` state; assigns an Evaluator to scope |
| `Evaluation.Score` | Evaluator | Own Evaluation only; `NotStarted` or `InProgress`; (requirementVersionId, supplierId) in assigned scope |
| `Evaluation.RecordKnockout` | Evaluator | Own Evaluation; Requirement is knock-out type |
| `Evaluation.Submit` | Evaluator | Own Evaluation; completeness check passes |
| `Evaluation.Reopen` | Procurement Manager | Any Submitted Evaluation; before all locked |
| `Evaluation.Lock` | Procurement Manager | All Evaluations `Submitted` |
| `Evaluation.ViewOwn` | Evaluator | Own scores only (GBR-013: cross-evaluator scores hidden until all Locked) |
| `Evaluation.ViewAll` | Procurement Manager | All Evaluation statuses and progress; scores only after all Locked |
| `ConsolidatedEvaluation.RevealScores` | Procurement Manager | After all Locked |
| `ConsolidatedEvaluation.ReviseScore` | Evaluator (own scores) | After `RevealScores`; justification mandatory |
| `ConsolidatedEvaluation.FinalizeKnockout` | Procurement Manager | Active ConsolidatedEvaluation |
| `ConsolidatedEvaluation.OverrideKnockout` | Project Owner | Requires written justification (EVL-BR-013) |
| `ConsolidatedEvaluation.ComputeScores` | Platform (automated) / Procurement Manager | After all knock-outs finalized |
| `ConsolidatedEvaluation.GenerateReport` | Procurement Manager | After scores computed |
| `ConsolidatedEvaluation.ApproveReport` | Project Owner | Report generated |
| `ConsolidatedEvaluation.ViewRanking` | Procurement Manager, Project Owner, Executive Sponsor | After scores computed |
| `Evaluation.ViewAuditLog` | Project Owner, System Administrator, Auditor | Any state |

**GBR-013 enforced in permission layer:** `Evaluation.ViewOwn` returns only the requesting Evaluator's own scores until the Platform determines all Evaluations for the Tender are `Locked`. Cross-evaluator score visibility is blocked at the repository query level, not only at the API authorization layer.

---

## 16. UI Considerations

**Evaluator scoring workspace:** One pane showing the Requirement text (from Requirement aggregate); another pane showing the Supplier's ResponseItem (from SupplierResponse aggregate); a scoring panel with the score input and rationale field. The UI must never show another Evaluator's score in this workspace until the Evaluation is locked.

**Completeness indicator:** A live completeness indicator per group shows how many scores are outstanding. The `Submit` button is disabled until completeness is achieved. The UI must not allow partial submission.

**Rationale enforcement at input time:** When the Evaluator selects a score below the mandatory comment threshold or scores a Knock-out Requirement, the rationale field must become required (indicated visually) before the score can be saved. This is a UI convenience; the domain also enforces it.

**Knock-out candidate highlighting:** When a score of 0 (or the minimum value, if that semantically means non-fulfillment) is entered for a Knock-out Requirement, the UI must prompt the Evaluator to confirm a knock-out determination.

**Consolidation workspace:** After `RevealScores`, the Procurement Manager workspace shows the full score matrix. Anomalies are highlighted with the anomaly type and magnitude. The facilitator can view the individual score history and navigate to specific anomaly discussions.

**Score revision flow:** Revising a score requires an explicit "Revise" action (not an in-place edit), a justification field, and a confirmation step. The revised score is shown alongside the original to make the revision transparent.

---

## 17. AI Guidance

**AI may assist with:**

- **Automated anomaly detection:** Running anomaly computations and producing a ranked list of anomalies by severity before the consolidation session
- **Scoring aid for Evaluators:** Highlighting specific sections of a Supplier's ResponseItem that are directly relevant to a Requirement's acceptance criteria — as a reading aid; not as a score suggestion
- **Response summarization:** Producing a structured summary of a Supplier's ResponseItem for Evaluators who need to process large responses efficiently — clearly marked as AI-generated
- **Score consistency analysis:** After lock, AI may analyze whether an Evaluator's scores are internally consistent (e.g., scoring a sub-Requirement highly while scoring its parent Requirement lowly)
- **Generating the Consolidated Evaluation Report draft:** AI can structure the report sections from the structured data; the Procurement Manager reviews before generating the official document

**AI must not:**

- Score Requirements (EVL-BR-001 through EVL-BR-005 must be enforced against human actors only)
- Determine knock-out outcomes
- Approve the Consolidated Evaluation Report
- Revise scores without an Evaluator's explicit action and justification
- Generate summaries that Evaluators could mistake for the Supplier's actual response content

**Explainability requirement:** Any AI-produced scoring aid must clearly indicate which sections of the Supplier Response it is highlighting and why. If an AI summary omits content, the Evaluator must be able to see the full response without additional navigation.

---

## 18. Machine Context

```yaml
domain: Evaluation Management
bounded_context: EvaluationManagement

aggregates:
  Evaluation:
    root: Evaluation
    versioned: false          # SubmissionVersions capture state snapshots
    auditable: true
    immutable_when: [Locked]
    lifecycle: [NotStarted, InProgress, Submitted, Locked]
    critical_invariant: GBR-013 — score isolation until all Locked

  ConsolidatedEvaluation:
    root: ConsolidatedEvaluation
    versioned: false
    auditable: true
    immutable_when: [Approved]
    lifecycle: [Active, Approved]
    critical_invariant: EVL-BR-011 — platform-computed scores; no manual override

primary_relationships:
  Evaluation:
    references: [Tender (TenderId), User (EvaluatorId), SupplierResponse (reads ResponseItems for display)]
  ConsolidatedEvaluation:
    consumes: Evaluation[] (all Locked instances for Tender)
    references: Tender (for EvaluationModel)
    referenced_by: Decision (via ConsolidatedEvaluationReportId)

key_events:
  - EvaluatorAssigned
  - RequirementScored
  - KnockoutDetermined
  - EvaluationsLocked
  - ConsolidatedEvaluationCreated
  - ScoresRevealed
  - ConsolidatedScoresComputed
  - ConsolidatedEvaluationReportApproved

critical_invariants:
  - GBR-013: score cross-visibility prohibited before all Locked
  - GBR-014: confirmed Knock-out disqualifies Supplier from ranking
  - EVL-BR-011: consolidated scores are platform-computed; no direct write
  - EVL-BR-003/004: rationale mandatory below threshold and on all Knock-out scores
  - Score values must conform to Tender's ScoringScale

never:
  - allow_score_access_before_all_locked
  - allow_manual_consolidated_score_write
  - allow_score_revision_without_justification
  - allow_ai_to_score_or_determine_knockouts
  - allow_evaluation_creation_before_all_responses_locked
```

---

## 19. Anti-Patterns

**Revealing individual scores before all Evaluations are locked:**
Even revealing scores from *completed* Evaluators while others are still in progress violates GBR-013. The anchoring effect is real: knowing that Evaluator A gave Supplier X a score of 4 will influence Evaluator B's independent assessment. This must be technically prevented — not just discouraged.

**Computing consolidated scores in a spreadsheet outside the platform:**
The platform must perform the score aggregation. An externally computed consolidation — even one that uses the correct weights — cannot be verified, reproduced from audit data, or defended in a legal challenge. All calculations must be traceable to the platform's computation record.

**Allowing score revisions that chase the group mean without justification:**
After the consolidation discussion, some Evaluators will naturally want to align their score with the group to reduce conflict. Score revisions without justification remove the information value of independent scoring. Revisions that simply move toward the mean without substantive reasoning should be flagged — and the platform must capture the original and revised values alongside the justification.

**Silently omitting Knock-out excluded Suppliers from the report:**
A procurement that excluded a Supplier via Knock-out must document that exclusion explicitly. An unsuccessful Supplier can challenge a procurement if they cannot see the grounds for their exclusion. The ConsolidatedEvaluationReport must show all invited Suppliers, with excluded Suppliers clearly marked and their exclusion ground documented.

---

## 20. Examples

### Example 1: Anomaly detection trigger

Tender has 3 Evaluators (A, B, C). Scoring scale: 0–5. Requirement `REQ-042-v4` (Security Architecture) scored for Supplier X:

| Evaluator | Score |
|---|---|
| A | 5 |
| B | 5 |
| C | 1 |

Mean = 3.67. Evaluator C's score deviates by 2.67 from mean. Scale range = 5. Threshold = 30% of 5 = 1.5. Deviation (2.67) > threshold (1.5) → `AnomalyDetected` with type `HighDivergence`.

During discussion, Evaluator C explains they missed the evidence attachment. After reviewing, they revise to 4. `ScoreRevisedAfterDiscussion` event recorded with justification: "Missed evidence attachment REQ-042-v4-cert.pdf during initial scoring."

### Example 2: Knock-out override scenario

Evaluator A scored `REQ-089-v2` (GDPR Module) for Supplier Y as non-fulfilled. `KnockoutDetermined` event recorded.

During consolidation, Evaluator A presents their rationale. Evaluator B confirms. The Procurement Manager reviews. However, the Procurement Manager notes the Supplier provided a roadmap for GDPR compliance within 3 months of contract signature.

The Project Owner decides to override the knock-out, accepting the roadmap commitment. `OverrideKnockout` command executed with justification: "Supplier Y provided a contractually binding GDPR implementation roadmap. Project Owner approved override per BP10-BR-003."

`KnockoutFinalization` recorded with `outcome: Overridden`, `overrideJustification` set, `overrideApprovedBy: ProjectOwner-ID`.

---

## 21. Implementation Guidance

Implement in this order:

1. **`ScoreValue` value object** with `ScoringScale` validation — most important constraint; test all edge cases including step validation and floating-point tolerance
2. **`EvaluationScope` value object** — defines what an Evaluator may score
3. **`Evaluation` aggregate root** with `AssignEvaluator` command
4. **`ScoreRequirement` command** with EVL-BR-002, EVL-BR-003, EVL-BR-004 guards
5. **`RecordKnockout` command** with mandatory justification guard (EVL-BR-007)
6. **`SubmitEvaluation` command** with completeness check
7. **GBR-013 enforcement at Repository level:** `EvaluationRepository.getScoresForEvaluator(evaluatorId, tenderId)` must check that all Evaluations for the Tender are `Locked` before returning scores belonging to other Evaluators. This is not optional UI logic — it is a data access guard.
8. **`LockEvaluations` command** (batch) — verify atomicity; all or none lock
9. **`ConsolidatedEvaluation` aggregate** with `CreateConsolidatedEvaluation` command (event-triggered by `EvaluationsLocked`)
10. **Anomaly detection algorithms** — implement as Domain Service; test each anomaly type with threshold cases
11. **`RevealScores`, `FinalizeKnockout`, `OverrideKnockout`, `ReviseScore` commands** with their respective guards
12. **`ComputeConsolidatedScores` command** — implement as pure function of `individualScores + scoreRevisions + evaluationModel + knockoutFinalizations`; test reproducibility (same inputs always produce same outputs)
13. **`GenerateConsolidatedEvaluationReport`** — reads structured data; test that report contains excluded Suppliers (EVL-BR-012)
14. **`ApproveConsolidatedEvaluationReport`** command
15. **API layer** with authorization rules — especially GBR-013 enforcement on score endpoints

**Critical test:**
Write a test that creates 3 Evaluations, submits 2 of them, and verifies that `getScoresForEvaluator` on the third Evaluator for a different evaluator's scores returns `403`. Then lock all 3 and verify the same call succeeds. This is GBR-013 in code.

---

## References

- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Sections 6, 7, 9
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — AP-002 (domain logic), AP-006 (audit), AP-014 (security)
- [`Business_Rules.md`](../01_Business/Business_Rules.md) — GBR-013, GBR-014, GBR-015, GBR-001
- [`BP09_Evaluation.md`](../01_Business/BP09_Evaluation.md)
- [`BP10_Consolidation.md`](../01_Business/BP10_Consolidation.md)
- [`Tender.md`](./Tender.md) — Provides EvaluationModel; is the scoring context
- [`SupplierResponse.md`](./SupplierResponse.md) — Provides ResponseItems for display during scoring
- [`Decision.md`](./Decision.md) — References this aggregate's approved ConsolidatedEvaluationReport
