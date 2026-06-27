---
id: PKB-02-003
title: Tender — Domain Object Specification
version: 1.0
status: APPROVED
owner: Domain Architecture
domain: Tender Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
  - QA Engineer
depends_on:
  - PKB-00-MASTER
  - PKB-00-001
  - PKB-02-001
  - PKB-02-002
  - PKB-01-001
used_by:
  - SupplierResponse
  - Evaluation
  - Decision
  - KnowledgeAsset
related_processes:
  - BP06_Tender_Creation
  - BP07_Publication
  - BP08_Supplier_Collaboration
  - BP09_Evaluation
  - BP12_Contract_Handover
tags:
  - domain-model
  - aggregate
  - tender
  - procurement
  - ddd
---

# Tender — Domain Object Specification

## 1. Executive Summary

A Tender is the formal procurement instrument of adtender. It transforms a set of approved Requirements into a structured, published invitation for Suppliers to respond. Every evaluation, every decision, every award on the platform traces back to a Tender.

The Tender is not a document. It is a rich Aggregate Root that owns an Evaluation Model, a version-frozen Requirement snapshot, a Supplier invitation list, and the complete lifecycle state from draft through award. It is the central coordination object for the competitive selection phase of a business initiative.

**What distinguishes a Tender from a tender document:**
- A Tender is a structured Business Object with enforced invariants; a document is a rendered output.
- A Tender is the source of truth; a document is generated from it.
- A Tender enforces equal treatment constraints at the domain layer; a document cannot.
- A Tender is versioned; a document is a snapshot.

An experienced engineer implementing this aggregate must understand that publication is not a status change — it is an atomic operation that produces multiple irreversible effects, each of which is a domain invariant.

---

## 2. Purpose

The Tender serves three distinct purposes across its lifecycle:

**Pre-publication (Draft → Approved):** Structures the procurement by assembling approved Requirements, configuring the Evaluation Model, defining terms and conditions, and building the Supplier invitation list.

**Published phase:** Manages the external interaction boundary — Supplier access, clarification management, submission reception, equal treatment enforcement, amendment governance.

**Post-submission (Closed → Awarded):** Provides the immutable reference context for Evaluation, Decision, and Contract Handover. The Tender and its version-frozen Requirement snapshot are the evidentiary backbone of the entire procurement audit trail.

---

## 3. Business Motivation

**Why is Tender a separate aggregate from Project?**

A Project may run multiple Tenders (phased procurement, separate lots, re-tendering after rejection). The Tender has its own lifecycle, its own Suppliers, and its own rules that operate independently of the Project lifecycle. Embedding Tender state inside the Project aggregate would violate the single responsibility principle and create an aggregate that grows without bound.

**Why does the Tender own the Evaluation Model?**

The Evaluation Model is inseparable from a specific Tender. Different Tenders within the same project may use different evaluation weights. Once published, the Evaluation Model is immutable — evaluators must assess against the criteria that Suppliers saw when they submitted. Placing the Evaluation Model in the Tender ensures that this immutability is enforced at the correct boundary.

**Why does publication freeze Requirement versions?**

Suppliers respond to Requirements as they existed at publication. If Requirements could change after a Supplier submitted their response, the response would be evaluated against criteria the Supplier never saw. This is both legally indefensible and practically unfair. The version freeze is a domain invariant, not a technical convenience.

---

## 4. Responsibilities

The Tender aggregate is responsible for:

- Maintaining the Tender lifecycle from `Draft` through `Awarded` or `Cancelled`
- Owning the Evaluation Model: scoring scale, group weights, knock-out rules, mandatory comment thresholds
- Maintaining a pre-publication Requirement group structure (which Requirements appear in which groups)
- Executing the publication command atomically: freezing Requirement versions, granting Supplier portal access, recording the publication timestamp
- Enforcing that only Approved Requirements may be added (GBR-009)
- Enforcing that group weights sum to 100% before approval (TDR-BR-003)
- Owning the Supplier invitation list for this Tender
- Managing the amendment lifecycle post-publication
- Providing the authoritative Requirement version snapshot for Evaluation and Decision traceability

The Tender aggregate is **not** responsible for:

- Storing Supplier Response content (owned by SupplierResponse aggregate)
- Storing Evaluation scores (owned by Evaluation aggregate)
- Storing the Decision (owned by Decision aggregate)
- Storing the actual Requirement content (owned by Requirement aggregate)

---

## Scope

**In scope (owned by this aggregate):**
- Tender lifecycle state (Draft → Approved → Published → Closed → Awarded / Cancelled)
- EvaluationModel: scoring scale, group definitions, group weights, knock-out flags, scoring methods, mandatory comment thresholds
- TenderRequirementSnapshot: immutable version-frozen set of RequirementVersionIds, organized in evaluation groups
- InvitationList: Supplier identities authorized to submit a response
- TenderTerms: submission deadline, clarification window, minimum response period, standstill period
- TenderTimeline: key date milestones
- TenderAmendments: post-publication amendment records with Supplier notification tracking
- Publication atomicity: the single transactional operation that freezes all the above simultaneously

**Out of scope (explicitly not owned):**
- Supplier Response content → SupplierResponse aggregate
- Evaluation scores → Evaluation / ConsolidatedEvaluation aggregates
- Decision outcome → Decision aggregate
- Requirement content → Requirement aggregate (referenced by ID only)
- Contract Lifecycle Management → External CLM system
- Supplier portal authentication → Organization Management bounded context

---

## 5. Business Context

A Tender is created within a Project once all Requirements for the procurement have been approved (BP06). It is the formal operationalization of the project's procurement intent.

The relationship between Tender and Project is:
- A Project contains one or more Tenders
- A Tender belongs to exactly one Project
- The Project defines the business context; the Tender defines the selection process

The relationship between Tender and Requirement is:
- Pre-publication: a Tender holds references to specific `RequirementVersionId` values, organized in groups
- At publication: these references are frozen into an immutable `TenderRequirementSnapshot`
- Post-publication: the snapshot is the authoritative reference — the living Requirement aggregate may evolve independently

The relationship between Tender and Supplier is:
- A Tender has an invitation list of Suppliers
- Publication grants each invited Supplier read access to the published Tender and its Requirement snapshot
- A Supplier Contact can submit a SupplierResponse only if their Supplier is on the invitation list

The Tender is the central object consumed by the Evaluation domain. When Evaluators score SupplierResponses, they do so in the context of a Tender's Evaluation Model. When the Decision Board reviews consolidated results, they do so in the context of a Tender's published scope.

---

## 6. Lifecycle

```
Created
   │
   ▼
 Draft ──────────────────────────────────────────────────────► Cancelled
   │
   │ ApproveTender (Project Owner + Procurement Manager)
   ▼
Approved ────────────────────────────────────────────────────► Cancelled
   │
   │ PublishTender (Procurement Manager) — ATOMIC OPERATION
   ▼
Published ◄──────────────────── TenderAmended (preserves Published state)
   │
   │ CloseSubmissions (deadline passed)
   ▼
 Closed
   │
   │ ExecuteHandover (after Decision Approved + Standstill elapsed)
   ▼
Awarded
```

**State descriptions:**

| State | Description | Mutable? |
|---|---|---|
| `Draft` | Tender being assembled: Requirements being added, Evaluation Model being configured | Yes |
| `Approved` | Tender approved for publication; Evaluation Model complete; Supplier list confirmed | No; changes require returning to Draft |
| `Published` | Tender visible to Suppliers; Requirement versions frozen; clarification window open | Only via formal Amendment process |
| `Closed` | Submission deadline passed; all responses locked; no new submissions accepted | No |
| `Awarded` | Decision made, award notified, contract handover package sent | No |
| `Cancelled` | Procurement cancelled before award | No |

---

## 7. State Machine

### Permitted transitions

| From | To | Command | Guard |
|---|---|---|---|
| (new) | `Draft` | `CreateTender` | Project in `Planned` state; actor has `Tender.Create` permission |
| `Draft` | `Approved` | `ApproveTender` | All Requirements in snapshot are `Approved`; Evaluation Model weights sum to 100%; invitation list has ≥1 Supplier; at least one Requirement exists; Project Owner + Procurement Manager both approve |
| `Approved` | `Draft` | `RetractTenderApproval` | Changes required after approval; before publication |
| `Approved` | `Published` | `PublishTender` | All invited Suppliers have active portal accounts; submission deadline is in the future and meets minimum response period; clarification window dates are valid |
| `Published` | `Published` | `CreateTenderAmendment` | Amendment content approved; all Suppliers notified simultaneously |
| `Published` | `Closed` | `CloseSubmissions` | Submission deadline has passed or Procurement Manager manually closes |
| `Closed` | `Awarded` | `ExecuteHandover` | Decision Approved; Standstill period elapsed; no unresolved challenges |
| `Draft` | `Cancelled` | `CancelTender` | Project Owner authorization |
| `Approved` | `Cancelled` | `CancelTender` | Project Owner authorization |
| `Published` | `Cancelled` | `CancelTender` | Project Owner authorization; all Suppliers must be notified of cancellation |

### Forbidden transitions

- `Published` → `Draft`: not permitted. Amendments create a new version of the Tender within `Published` state.
- `Awarded` → any: the final state is terminal.
- `Closed` → `Published`: not permitted. A new Tender must be created for re-tendering.
- Any state → edit of Requirement content: Requirements are owned by the Requirement aggregate; the Tender only references versions.

---

## 8. Business Rules

| Rule ID | Rule | Enforcement Layer | When Active |
|---|---|---|---|
| TDR-BR-001 | A Tender must belong to exactly one Project. | Domain invariant | Always |
| TDR-BR-002 | A Tender must contain at least one Requirement before it can be approved. | `ApproveTender` precondition | On approval |
| TDR-BR-003 | All Evaluation Model group weights must sum to exactly 100%. A fractional tolerance of ±0.001 is permitted for floating-point rounding. | `ApproveTender` precondition | On approval |
| TDR-BR-004 | Only Requirements in `Approved` state may be added to a Tender. | `AddRequirementToTender` guard | When adding |
| TDR-BR-005 | Knock-out Requirements must have their knock-out flag documented in the Tender terms before approval. | `ApproveTender` precondition | On approval |
| TDR-BR-006 | The Supplier invitation list must contain at least one Supplier before the Tender can be approved. | `ApproveTender` precondition | On approval |
| TDR-BR-007 | Publication is atomic. The following must succeed or all must fail: version snapshot creation, state transition, portal access grant, clarification window open, publication timestamp record. | `PublishTender` transactional boundary | On publication |
| TDR-BR-008 | At publication, the submission deadline must be at least the configured minimum response period in the future (tenant-configurable; default: 10 business days). | `PublishTender` precondition | On publication |
| TDR-BR-009 | A Tender Amendment after publication must notify all invited Suppliers simultaneously. Partial notification is prohibited. | `CreateTenderAmendment` guard | Post-publication |
| TDR-BR-010 | A Tender Amendment that changes Requirement content must result in a new approved Requirement version being added to the snapshot. | Domain policy | Post-publication |
| TDR-BR-011 | If an amendment is material, the submission deadline must be extended to give Suppliers adequate time. Materiality is a Procurement Manager judgment, but the system must enforce that an extension is offered. | Amendment workflow | Post-publication |
| TDR-BR-012 | Once in `Published` state, the `TenderRequirementSnapshot` is immutable. No in-place mutation of the snapshot is permitted. | Domain invariant | Always (post-publication) |
| TDR-BR-013 | `CloseSubmissions` is permitted after the submission deadline. Early closure is permitted only with Procurement Manager authorization and a documented reason. | `CloseSubmissions` guard | On closure |
| TDR-BR-014 | A Tender may not transition to `Awarded` while a challenge to the Decision is pending. | `ExecuteHandover` guard | On award |
| GBR-009 | Only Approved Requirements may be included in a Tender. | `AddRequirementToTender` | When adding |
| GBR-010 | Requirement versions are frozen at Tender publication. | `PublishTender` | On publication |
| GBR-001 | All state transitions are auditable. | Aggregate audit log | Always |

---

## 9. Relationships

```
Project (1) ────────────────── (many) Tender
                                        │
              ┌─────────────────────────┼─────────────────────────────┐
              │                         │                             │
    TenderRequirementSnapshot    EvaluationModel              InvitationList
        │                               │                             │
    RequirementVersionId[]       GroupConfig[]                  SupplierRef[]
        │
        └── references ──► Requirement (owns content)

Tender (1) ─────────────────── (many) SupplierResponse
Tender (1) ─────────────────── (many) Evaluation
Tender (1) ─────────────────── (1)    Decision (via ConsolidatedEvaluationReport)
Tender (1) ─────────────────── (many) ClarificationRequest
Tender (1) ─────────────────── (many) ClarificationAnswer
Tender (1) ─────────────────── (many) TenderAmendment
```

**Cross-domain reference rules:**
- The Tender references `RequirementVersionId` — it does not embed Requirement content. Requirement content is fetched by the caller at read time.
- `SupplierResponse` carries a `TenderId` and a `RequirementVersionId[]` matching the snapshot.
- `Evaluation` carries a `TenderId` and evaluates against the same snapshot.
- `Decision` references the `TenderId` and the `ConsolidatedEvaluationReport` which was built from this Tender's data.

---

## 10. Aggregate Design

### Aggregate Root
`Tender`

### Aggregate Boundary

The Tender aggregate owns everything needed to govern the Tender lifecycle and enforce its invariants without querying other aggregates:

```
Tender (Aggregate Root)
├── TenderRequirementSnapshot            [Entity] — created at publication; immutable
│   └── TenderRequirementEntry[]         [Value Object] — requirementVersionId, groupId, displayOrder
├── EvaluationModel                      [Entity]
│   ├── scoringScale: ScoringScale       [Value Object] — min, max, step
│   ├── groups: EvaluationGroup[]        [Entity]
│   │   ├── groupId, name, weight
│   │   ├── scoringMethod: ScoringMethod [Value Object — WeightedAverage | Maximum | MinimumThreshold]
│   │   └── requirementEntries[]         [Value Object — requirementVersionId, weight, knockoutFlag, mandatoryCommentThreshold]
│   └── mandatoryCommentThreshold        [Value Object] — score level below which rationale is mandatory
├── TenderTerms                          [Value Object] — equalTreatmentStatement, confidentialityObligation, disqualificationConditions, reservedRights, standstillPeriodDays, governingLaw
├── InvitationList                       [Entity]
│   └── InvitationEntry[]               [Value Object — supplierId, invitationBasis, invitedAt, portalAccessGrantedAt]
├── TenderTimeline                       [Value Object] — publicationDate, clarificationWindowOpen, clarificationWindowClose, submissionDeadline, standstillEndDate
├── TenderAmendments[]                   [Entity — post-publication only]
│   ├── amendmentId, reason, createdAt
│   ├── affectedRequirementVersionIds[]
│   └── notificationsSentAt
└── AuditLog[]                           [Entity — append-only]
    ├── actorId, action, timestamp
    └── stateBefore, stateAfter
```

**Size constraint:** The aggregate does not store Supplier Response content, individual Evaluation scores, or Decision content. It stores references and the Evaluation Model configuration. This keeps the aggregate bounded and prevents unbounded growth.

**Consistency boundary:** All invariants enforced within the aggregate — group weights summing to 100%, Requirement approval state check, invitation list minimum — are checked against data owned by this aggregate. Checking Requirement approval state requires a read of the Requirement aggregate before the command is issued (handled at the Application Service layer).

---

## 11. Entities

### Tender (Aggregate Root)

| Attribute | Type | Rules |
|---|---|---|
| `tenderId` | `TenderId` (UUID) | Immutable after creation |
| `projectId` | `ProjectId` | Immutable after creation |
| `tenantId` | `TenantId` | Immutable after creation |
| `title` | `TenderTitle` (string, 1–200 chars) | Required |
| `tenderType` | `TenderType` (configurable) | Required |
| `language` | `LanguageCode[]` | 1+ languages |
| `status` | `TenderStatus` | State machine enforced |
| `confidentialityMode` | `ConfidentialityMode` (Anonymized \| Named) | Set at creation |
| `publishedAt` | `Timestamp?` | Set atomically with `PublishTender` |
| `closedAt` | `Timestamp?` | Set at `CloseSubmissions` |
| `awardedAt` | `Timestamp?` | Set at `ExecuteHandover` |
| `createdAt` | `Timestamp` | Immutable |
| `createdBy` | `ActorId` | Immutable |

### EvaluationGroup (Entity within EvaluationModel)

| Attribute | Type | Rules |
|---|---|---|
| `groupId` | `GroupId` (UUID) | Unique within Tender |
| `name` | `GroupName` (string) | Required |
| `weight` | `Percentage` (0–100) | Sum of all group weights must = 100 |
| `scoringMethod` | `ScoringMethod` | Required |
| `displayOrder` | `int` | Governs Tender structure display |

### TenderAmendment (Entity)

| Attribute | Type | Rules |
|---|---|---|
| `amendmentId` | `AmendmentId` | Immutable |
| `reason` | `string` | Required, non-empty |
| `materialFlag` | `boolean` | Drives deadline extension requirement |
| `createdAt` | `Timestamp` | Immutable |
| `notificationsSentAt` | `Timestamp?` | Must be set before Amendment is effective |
| `deadlineExtendedTo` | `Timestamp?` | Required if `materialFlag = true` |

---

## 12. Value Objects

| Value Object | Type | Constraints |
|---|---|---|
| `TenderId` | UUID | — |
| `TenderTitle` | string | 1–200 chars; non-empty |
| `TenderStatus` | enum | `Draft \| Approved \| Published \| Closed \| Awarded \| Cancelled` |
| `TenderType` | configurable enum | Tenant-defined; e.g., OpenTender, RestrictedTender, NegotiatedProcedure |
| `ScoringScale` | `{ min: int, max: int, step: decimal }` | `min < max`; `step > 0`; `max - min` must allow at least 3 distinct values |
| `ScoringMethod` | enum | `WeightedAverage \| MaximumScore \| MinimumThreshold` |
| `Percentage` | decimal | 0.000–100.000; three decimal places precision |
| `ConfidentialityMode` | enum | `Anonymized \| Named` | Anonymized: Supplier names hidden from Evaluators |
| `TenderTimeline` | compound VO | `publicationDate ≤ clarificationWindowOpen ≤ clarificationWindowClose ≤ submissionDeadline`; all future at publication |
| `InvitationBasis` | enum | `MarketKnowledge \| PriorRelationship \| QualificationResult \| OpenInvitation` |
| `TenderRequirementEntry` | `{ requirementVersionId, groupId, displayOrder }` | `requirementVersionId` must reference an `Approved` Requirement version |
| `MandatoryCommentThreshold` | `{ scoreBelow: decimal }` | Applied to the scoring scale; below this threshold, rationale is mandatory |

---

## 13. Commands

All commands are dispatched through the Application Service layer. The Tender aggregate validates preconditions before state changes.

| Command | Actor | Preconditions | State Change | Events Produced |
|---|---|---|---|---|
| `CreateTender` | Project Manager | Project in `Planned` state | (new) → `Draft` | `TenderCreated` |
| `AddRequirementToTender` | Requirement Engineer | Tender in `Draft`; Requirement version in `Approved` state | Adds entry to pre-snapshot group structure | `RequirementAddedToTender` |
| `RemoveRequirementFromTender` | Requirement Engineer | Tender in `Draft` | Removes entry | `RequirementRemovedFromTender` |
| `ConfigureEvaluationModel` | Procurement Manager | Tender in `Draft` | Updates EvaluationModel | `EvaluationModelConfigured` |
| `SetTenderTerms` | Procurement Manager | Tender in `Draft` | Updates TenderTerms | `TenderTermsSet` |
| `SetTenderTimeline` | Project Manager | Tender in `Draft` | Updates TenderTimeline | `TenderTimelineSet` |
| `AddSupplierToInvitationList` | Procurement Manager | Tender in `Draft` or `Approved` | Adds InvitationEntry | `SupplierAddedToInvitationList` |
| `RemoveSupplierFromInvitationList` | Procurement Manager | Tender in `Draft` or `Approved` | Removes InvitationEntry | `SupplierRemovedFromInvitationList` |
| `ApproveTender` | Project Owner + Procurement Manager | All Requirements Approved; weights = 100%; ≥1 Supplier; ≥1 Requirement | `Draft` → `Approved` | `TenderApproved` |
| `RetractTenderApproval` | Procurement Manager | Tender in `Approved`; not yet Published | `Approved` → `Draft` | `TenderApprovalRetracted` |
| `PublishTender` | Procurement Manager | Tender in `Approved`; all Suppliers have portal accounts; timeline valid | `Approved` → `Published` (atomic) | `TenderPublished`, `RequirementVersionsSnapshotCreated`, `SupplierPortalAccessGranted` (per Supplier) |
| `CreateTenderAmendment` | Procurement Manager | Tender in `Published` | Adds TenderAmendment; Supplier notifications required | `TenderAmended` |
| `CloseSubmissions` | Procurement Manager | Tender in `Published`; deadline passed or explicit authorization | `Published` → `Closed` | `SubmissionPeriodClosed` |
| `CancelTender` | Project Owner | Tender in `Draft`, `Approved`, or `Published` | → `Cancelled` | `TenderCancelled` |
| `ExecuteHandover` | Project Manager | Tender in `Closed`; Decision `Approved`; standstill elapsed; no pending challenges | `Closed` → `Awarded` | `TenderAwarded` |

---

## 14. Events

All events are immutable once produced. The event payload must contain all context a downstream consumer needs without additional queries.

| Event | Trigger | Critical Payload |
|---|---|---|
| `TenderCreated` | `CreateTender` | `tenderId`, `projectId`, `tenantId`, `tenderType`, `createdBy`, `createdAt` |
| `RequirementAddedToTender` | `AddRequirementToTender` | `tenderId`, `requirementVersionId`, `groupId`, `displayOrder` |
| `EvaluationModelConfigured` | `ConfigureEvaluationModel` | `tenderId`, `evaluationModel` (full snapshot), `configuredBy`, `configuredAt` |
| `TenderTermsSet` | `SetTenderTerms` | `tenderId`, `terms` (full VO snapshot) |
| `TenderApproved` | `ApproveTender` | `tenderId`, `approvedBy[]`, `approvedAt`, `requirementCount`, `supplierCount` |
| `TenderPublished` | `PublishTender` | `tenderId`, `publishedAt`, `submissionDeadline`, `clarificationWindowClose` |
| `RequirementVersionsSnapshotCreated` | Atomic with `TenderPublished` | `tenderId`, `snapshot[]` (all `requirementVersionId` values) |
| `SupplierPortalAccessGranted` | Atomic with `TenderPublished` (per Supplier) | `tenderId`, `supplierId`, `grantedAt` |
| `TenderAmended` | `CreateTenderAmendment` | `tenderId`, `amendmentId`, `reason`, `materialFlag`, `affectedRequirementVersionIds[]`, `newDeadline?` |
| `SubmissionPeriodClosed` | `CloseSubmissions` | `tenderId`, `closedAt`, `submittedResponseCount`, `nonRespondingSupplierCount` |
| `TenderAwarded` | `ExecuteHandover` | `tenderId`, `awardedSupplierId`, `awardedAt` |
| `TenderCancelled` | `CancelTender` | `tenderId`, `cancelledBy`, `cancelledAt`, `reason` |

---

## 15. API Considerations

**Base resource:** `/api/v1/tenders`

**Standard endpoints:**

```
GET    /api/v1/tenders                              — List tenders (tenant-scoped, filterable)
POST   /api/v1/tenders                              — CreateTender
GET    /api/v1/tenders/{tenderId}                   — Get Tender by ID (includes current state)
PATCH  /api/v1/tenders/{tenderId}                   — Update Draft Tender attributes
GET    /api/v1/tenders/{tenderId}/requirements      — List Requirements in Tender (pre-snapshot)
POST   /api/v1/tenders/{tenderId}/requirements      — AddRequirementToTender
DELETE /api/v1/tenders/{tenderId}/requirements/{reqVersionId}  — RemoveRequirementFromTender
GET    /api/v1/tenders/{tenderId}/evaluation-model  — Get EvaluationModel
PUT    /api/v1/tenders/{tenderId}/evaluation-model  — ConfigureEvaluationModel (replaces full model)
PUT    /api/v1/tenders/{tenderId}/terms             — SetTenderTerms
PUT    /api/v1/tenders/{tenderId}/timeline          — SetTenderTimeline
GET    /api/v1/tenders/{tenderId}/invitation-list   — List invited Suppliers
POST   /api/v1/tenders/{tenderId}/invitation-list   — AddSupplierToInvitationList
DELETE /api/v1/tenders/{tenderId}/invitation-list/{supplierId}  — RemoveSupplierFromInvitationList
POST   /api/v1/tenders/{tenderId}/approve           — ApproveTender
POST   /api/v1/tenders/{tenderId}/retract-approval  — RetractTenderApproval
POST   /api/v1/tenders/{tenderId}/publish           — PublishTender
POST   /api/v1/tenders/{tenderId}/amendments        — CreateTenderAmendment
POST   /api/v1/tenders/{tenderId}/close-submissions — CloseSubmissions
POST   /api/v1/tenders/{tenderId}/cancel            — CancelTender
POST   /api/v1/tenders/{tenderId}/execute-handover  — ExecuteHandover
GET    /api/v1/tenders/{tenderId}/snapshot          — Get frozen RequirementVersionSnapshot (Published+ only)
GET    /api/v1/tenders/{tenderId}/history           — Audit log
GET    /api/v1/tenders/{tenderId}/document          — Generate Tender document (PDF/DOCX)
```

**Design constraints:**

- The `publish` endpoint is idempotent: if the Tender is already `Published`, it returns 200 with current state rather than an error (enables safe retry).
- The `snapshot` endpoint is only available on Tenders in `Published`, `Closed`, or `Awarded` states. Calling it on `Draft` or `Approved` returns `409 TENDER_NOT_YET_PUBLISHED`.
- All list endpoints support filtering by `status`, `projectId`, `tenderType`, and creation date range.
- The EvaluationModel endpoint returns a 409 with error `EVALUATION_MODEL_LOCKED` if the Tender is in `Approved` or `Published` state without a retracted approval.
- The `document` endpoint is a synchronous generation endpoint. Documents are not stored as primary data; they are generated from the structured Tender state on demand.

**Authorization scopes required:**

| Operation | Required Permission |
|---|---|
| Read Tender | `Tender.Read` |
| Create/Edit Draft | `Tender.Create`, `Tender.Update` |
| Approve | `Tender.Approve` (Project Owner) |
| Publish | `Tender.Publish` (Procurement Manager) |
| Close/Cancel | `Tender.Close` (Procurement Manager) |
| Execute Handover | `Tender.Award` (Project Owner) |

---

## Permissions

| Permission | Role(s) Required | Conditions |
|---|---|---|
| `Tender.Create` | Procurement Manager, Project Manager | Own project; project in `Planned` state |
| `Tender.Read` | Procurement Manager, Project Manager, Project Owner, Requirement Engineer, Evaluator, Executive Sponsor | Own project; Suppliers read published Tender via Supplier Portal API |
| `Tender.Update` | Procurement Manager | Tender in `Draft` state only |
| `Tender.AddRequirement` | Requirement Engineer, Procurement Manager | Tender in `Draft` state only |
| `Tender.ConfigureEvaluationModel` | Procurement Manager | Tender in `Draft` state only |
| `Tender.ManageInvitationList` | Procurement Manager | Tender in `Draft` or `Approved` state |
| `Tender.Approve` | Project Owner | Requires Procurement Manager recommendation; both must authorize |
| `Tender.RetractApproval` | Procurement Manager | Tender in `Approved` state; before publication |
| `Tender.Publish` | Procurement Manager | Tender in `Approved` state |
| `Tender.CreateAmendment` | Procurement Manager | Tender in `Published` state |
| `Tender.CloseSubmissions` | Procurement Manager | Tender in `Published` state |
| `Tender.Cancel` | Project Owner | Tender in `Draft`, `Approved`, or `Published` state |
| `Tender.ExecuteHandover` | Project Manager, Project Owner | Tender in `Closed`; Decision `Approved`; standstill elapsed |
| `Tender.ViewSnapshot` | All internal roles; Supplier Contact (own Tender only) | Tender `Published` or later |
| `Tender.ViewAuditLog` | Project Owner, System Administrator, Auditor | Any state |

**Role definitions are managed in Organization Management.** Authorization is enforced at the Application Service layer (AP-014) and must not be implemented only at the API gateway.

---

## 16. UI Considerations

**State visibility:** The current `TenderStatus` must be displayed prominently at all times. Users must never be uncertain whether they are editing a draft or viewing a published Tender.

**Evaluation Model editor:** The group weight editor must provide live feedback showing the sum of all weights. The UI must make it visually clear when weights do not sum to 100%, and must disable the `ApproveTender` action until the condition is satisfied.

**Publication confirmation:** `PublishTender` is an irreversible action within the current context (requires Amendment to undo). The UI must require explicit confirmation with a clear statement of consequences: "Publishing this Tender will freeze all Requirement versions, grant Suppliers access to the portal, and open the clarification window. This action cannot be undone."

**Requirement snapshot vs. live Requirements:** After publication, the UI must clearly distinguish between "Requirements in this Tender (frozen at publication)" and "current state of these Requirements in the library." If a Requirement in the library has been updated since publication, the UI should surface this information but must make clear that the Tender still references the frozen version.

**Supplier portal access status:** A dashboard showing which Suppliers have accessed the portal, started responses, and submitted is critical for Procurement Manager situational awareness.

**Amendment workflow:** Amendments require a distinct UI flow that forces the user to specify a reason, select affected Requirements, review impacted Suppliers, and confirm simultaneous notification. The UI must block amendments that would result in partial notification.

---

## 17. AI Guidance

**AI may assist with:**

- Checking Evaluation Model weight consistency and surfacing discrepancies before approval
- Flagging Requirements in the Tender that have no knock-out designation when they commonly should (e.g., security compliance Requirements for IT system tenders)
- Suggesting minimum response periods based on Tender type and Requirement complexity
- Detecting Requirement groups where all Requirements are weighted equally (potential quality signal — may indicate weights were not configured deliberately)
- Generating a human-readable Tender structure summary for the Procurement Manager's review
- Comparing the Tender's Requirement scope against similar historical Tenders and surfacing potential gaps
- Recommending Supplier candidates from the organizational Supplier master based on the Tender's domain

**AI must not:**

- Approve the Tender (`ApproveTender` command requires human actors)
- Execute publication (`PublishTender` is an accountable, irreversible action)
- Modify the Evaluation Model weights without human confirmation
- Set Knock-out flags on Requirements without explicit user confirmation
- Send Supplier notifications autonomously

**AI transparency requirement (ADR-005, AP-016):**

All AI-generated content displayed in the Tender workspace must be visually distinguished from human-authored content. AI suggestions must be dismissible. AI interactions that result in changes to the Tender must be recorded in the audit log with `source: AI` and the model/invocation context.

---

## 18. Machine Context

```yaml
domain: Tender Management
bounded_context: TenderManagement
aggregate_root: Tender
versioned: true
auditable: true
publication_is_atomic: true
requirement_versions_frozen_at_publication: true

lifecycle_states:
  - Draft
  - Approved
  - Published
  - Closed
  - Awarded
  - Cancelled

immutable_when:
  - Published  # except via formal Amendment
  - Closed
  - Awarded
  - Cancelled

primary_relationships:
  owns:
    - EvaluationModel
    - TenderRequirementSnapshot     # created at publication; immutable
    - InvitationList
    - TenderTerms
    - TenderTimeline
    - TenderAmendments
  references:
    - Project (by ProjectId)
    - Requirement (by RequirementVersionId — never embeds content)
  consumed_by:
    - SupplierResponse (references TenderId + RequirementVersionId)
    - Evaluation (references TenderId + EvaluationModel)
    - Decision (references TenderId via ConsolidatedEvaluationReport)

key_commands:
  - CreateTender
  - AddRequirementToTender
  - ConfigureEvaluationModel
  - ApproveTender
  - PublishTender          # ATOMIC — multiple effects
  - CreateTenderAmendment
  - CloseSubmissions
  - ExecuteHandover

key_events:
  - TenderCreated
  - TenderApproved
  - TenderPublished                 # triggers SupplierPortalAccessGranted
  - RequirementVersionsSnapshotCreated
  - SubmissionPeriodClosed
  - TenderAwarded

critical_invariants:
  - EvaluationModel.groupWeights must sum to 100% before ApproveTender
  - Only Approved Requirements may be added (GBR-009)
  - TenderRequirementSnapshot is immutable after PublishTender (GBR-010)
  - PublishTender is transactional — all effects succeed or all fail

never:
  - embed_requirement_content       # reference by RequirementVersionId only
  - store_supplier_response_content # SupplierResponse is a separate aggregate
  - store_evaluation_scores         # Evaluation is a separate aggregate
  - allow_post_publication_mutation_of_snapshot
  - partial_supplier_notification   # all notifications must be simultaneous
  - ai_auto_approval_or_publication
```

---

## 19. Anti-Patterns

**Publishing a Tender with manually edited document content:**
The Tender document is generated from the structured Tender Business Object. Editing the document directly — without updating the structured object — creates a divergence where the authoritative data and the presented data differ. This is a governance failure. Every Tender content change must happen through the structured aggregate.

**Embedding Requirement content in the Tender aggregate:**
The Tender holds `RequirementVersionId` references, not Requirement content. Copying content into the Tender creates a duplication that diverges from the source of truth as Requirements evolve. The Requirement aggregate is the single source of Requirement content.

**Partially granting Supplier portal access:**
Granting access to some Suppliers before others is an equal treatment violation. The platform must ensure this is technically impossible — portal access must be granted to all invited Suppliers atomically with `PublishTender`.

**Approving a Tender with equal-weighted groups as a default:**
All groups weighted equally signals that the Evaluation Model was not configured deliberately. This produces evaluation results that do not reflect the actual business priorities of the procurement. The platform should flag this as a quality warning (not a hard block, since equal weighting may be legitimate in some cases).

**Storing the Decision inside the Tender aggregate:**
The Decision is a separate Aggregate Root in the Decision Management bounded context. It references the Tender by `TenderId`. Embedding it in the Tender would couple the Decision lifecycle to the Tender lifecycle and bloat the Tender aggregate beyond its responsibility boundary.

---

## 20. Examples

### Example 1: Software Selection Tender — Evaluation Model configuration

A project is selecting an ERP system. The Tender has four Requirement groups:

```
Group: Functional Scope      — weight: 35%   — method: WeightedAverage
Group: Technical Architecture — weight: 25%   — method: WeightedAverage
Group: Implementation Plan    — weight: 20%   — method: MinimumThreshold
Group: Commercial Terms       — weight: 20%   — method: WeightedAverage
                                         ─────
                                         100%  ✓
```

Scoring scale: 0–5, step 1. Mandatory comment threshold: score ≤ 1.
Two Requirements in "Functional Scope" are designated knock-out: `Data Migration Compliance` and `GDPR Module`.

At publication, the snapshot freezes all 127 Requirement versions (versionIds stored; content served from Requirement aggregate at read time).

### Example 2: Amendment after publication

After publication, a Supplier's clarification question reveals that a Requirement was ambiguous. The Procurement Manager creates a Tender Amendment:
- Reason: "Requirement REQ-042 v3 contained ambiguous acceptance criteria for API documentation format."
- Affected Requirement: `REQ-042` → new version `REQ-042 v4` approved in Requirement Management
- Amendment snapshot updated: `REQ-042-v3` replaced with `REQ-042-v4`
- Material flag: true → submission deadline extended by 5 business days
- All 8 invited Suppliers notified simultaneously

The amendment is recorded in `TenderAmendments[]`. The original `RequirementVersionsSnapshotCreated` event remains in the event log; a `TenderAmended` event is appended.

---

## 21. Implementation Guidance

Implement in this strict order:

1. **`TenderId`, `TenderStatus`, core Value Objects** — no logic yet, just types
2. **`Tender` aggregate root** with bare attributes and `CreateTender` command
3. **`EvaluationModel` entity** with `EvaluationGroup[]` and weight-sum invariant
4. **`AddRequirementToTender` command** with GBR-009 guard (Application Service fetches Requirement state before calling aggregate)
5. **`ApproveTender` command** with all precondition checks (weights, count, invitation list)
6. **`InvitationList` entity** with `AddSupplierToInvitationList` / `RemoveSupplierFromInvitationList`
7. **`PublishTender` command** — implement as explicit transactional method; all effects in one unit of work; test atomicity
8. **`TenderRequirementSnapshot` entity** — created by `PublishTender`; immutable after creation; test that post-creation mutation throws
9. **`CreateTenderAmendment` command** — test that notification tracking is enforced
10. **`CloseSubmissions` command** and `ExecuteHandover` command
11. **Audit log** on every state transition — verify append-only behavior
12. **Domain events** — emit for every significant state change; test event payload completeness
13. **Repository interface** — define `TenderRepository` in the domain; implement in infrastructure
14. **Application Service** — orchestrates: load Requirement state for validation, call aggregate, persist, publish events
15. **REST API** — after domain and Application Service are complete; test all happy paths and guard violations

**Do not start with the database schema.** Start with the aggregate and its invariants. Let the schema follow the domain model.

**Test the publication atomicity explicitly:** Write a test that simulates a failure between snapshot creation and portal access grant, and verify that the Tender reverts to `Approved` state with no orphaned snapshot.

**Test weight-sum invariant:** Write a test for TDR-BR-003 with both the positive case (exact 100%) and negative cases (99.9%, 100.1%, groups missing).

---

## References

- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Sections 6, 7, 17
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — AP-001 through AP-006, AP-015
- [`ADR-001`](../00_Product_DNA/ADR/ADR-001-business-objects-first.md), [`ADR-003`](../00_Product_DNA/ADR/ADR-003-event-driven-architecture.md), [`ADR-004`](../00_Product_DNA/ADR/ADR-004-api-first.md)
- [`Business_Rules.md`](../01_Business/Business_Rules.md) — GBR-009, GBR-010, GBR-001
- [`BP06_Tender_Creation.md`](../01_Business/BP06_Tender_Creation.md)
- [`BP07_Publication.md`](../01_Business/BP07_Publication.md)
- [`Requirement.md`](./Requirement.md) — BO referenced by RequirementVersionId
- [`SupplierResponse.md`](./SupplierResponse.md) — BO that references this aggregate
- [`Evaluation.md`](./Evaluation.md) — BO that references this aggregate's EvaluationModel
- [`Decision.md`](./Decision.md) — BO whose audit trail references this Tender
