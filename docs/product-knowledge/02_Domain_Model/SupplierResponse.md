---
id: PKB-02-004
title: SupplierResponse — Domain Object Specification
version: 1.0
status: APPROVED
owner: Domain Architecture
domain: Supplier Management
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
  - PKB-01-001
used_by:
  - Evaluation
  - Decision
related_processes:
  - BP08_Supplier_Collaboration
  - BP09_Evaluation
  - BP12_Contract_Handover
tags:
  - domain-model
  - aggregate
  - supplier-response
  - evaluation
  - ddd
---

# SupplierResponse — Domain Object Specification

## 1. Executive Summary

A SupplierResponse is a structured, versioned answer to a published Tender, submitted by a Supplier through the Supplier Portal. It is the data artifact that connects the Supplier's claims to the organization's Requirements — and therefore the foundation on which every Evaluation score and every Decision is built.

A SupplierResponse is not a document upload. It is an aggregate of structured `ResponseItem` objects, one per Requirement in the Tender's frozen snapshot, each typed to the Requirement's configured response format. A SupplierResponse that is a document upload cannot be compared. A structured SupplierResponse can be scored, aggregated, referenced by Decision rationale, and searched years after the Tender closes.

**Three properties make this aggregate critical:**

1. **Version-pinned references:** Every ResponseItem references the exact `RequirementVersionId` from the Tender's publication snapshot — not the current version of the Requirement. This ensures that Evaluation scores can be reconstructed against the criteria in force at submission time, years later.

2. **Submission immutability:** Once locked, a SupplierResponse and all its ResponseItems are immutable. This is a legal and governance requirement — the record must reflect exactly what the Supplier submitted before the deadline.

3. **Knock-out pre-computation:** The aggregate maintains a `knockoutCandidateFlags` collection tracking which Knock-out Requirements the Supplier marked as non-fulfilled. This enables fast knock-out checks during Evaluation consolidation without re-scanning the entire response.

---

## 2. Purpose

The SupplierResponse aggregate serves three purposes across its lifecycle:

**During the Tender phase (Draft → Submitted):** Provides a structured data entry interface for the Supplier Contact — per-Requirement response items, evidence attachments, progress persistence, and resubmission before the deadline.

**After submission lock (Locked):** Provides an immutable evidentiary record for Evaluators. Each Evaluator scores against the exact content the Supplier committed to at submission time.

**Post-Decision (reference context):** Provides the awarded Supplier's complete response as part of the Contract Handover package. Provides all responses as the permanent audit trail for procurement defensibility.

---

## 3. Business Motivation

**Why is SupplierResponse a separate aggregate from Tender?**

A Tender has multiple Suppliers; each Supplier has one SupplierResponse. The SupplierResponse has a distinct lifecycle, distinct ownership (the Supplier Contact initiates and submits it), and distinct mutability rules (it can be modified before the deadline; the Tender cannot). Embedding responses inside the Tender aggregate would prevent the Supplier from accessing their draft independently and would make the Tender aggregate unbounded in size.

**Why must ResponseItems reference `RequirementVersionId` rather than `RequirementId`?**

Requirements can evolve. If a SupplierResponse stored only `RequirementId`, a subsequent update to the Requirement would silently change the criteria against which the response is evaluated — even after submission. Pinning to `RequirementVersionId` ensures that the evaluation context is fixed at the moment the Supplier responded. This is GBR-011.

**Why are multiple submission versions retained?**

A Supplier may submit, update, and resubmit before the deadline. Each submission creates a new `SubmissionVersion`. The final locked version is the authoritative response. Prior versions are retained for audit — they prove that the final submission was voluntary and deliberate, and that no changes occurred after the deadline.

---

## 4. Responsibilities

The SupplierResponse aggregate is responsible for:

- Maintaining a per-Supplier, per-Tender response lifecycle
- Storing structured `ResponseItem` objects per Requirement in the Tender snapshot
- Validating that all required ResponseItems are completed before submission is accepted
- Tracking submission history (each `Submit` creates a new `SubmissionVersion`)
- Recording the final lock timestamp and confirming immutability
- Tracking knock-out pre-assessment flags (Supplier's own non-fulfillment indications)
- Enforcing that no modifications are accepted after the submission deadline (GBR-012)
- Recording completion status per ResponseItem (complete, partial, missing)

The SupplierResponse aggregate is **not** responsible for:

- Storing the Requirement content (owned by Requirement aggregate)
- Storing Evaluation scores (owned by Evaluation aggregate)
- Enforcing the Tender timeline (the Tender aggregate records the deadline; the SupplierResponse checks against it)
- Managing Supplier portal authentication (handled by Organization Management)

---

## Scope

**In scope (owned by this aggregate):**
- Per-Supplier, per-Tender response lifecycle (Draft → Submitted → Locked / Rejected)
- ResponseItem collection: one structured answer per RequirementVersionId in the Tender's frozen snapshot
- SubmissionVersion history: append-only record of each submission act
- KnockoutCandidateFlags: pre-computed flags for Knock-out Requirements marked non-fulfilled
- Supplier Contact collaboration metadata (who submitted, when)
- Completeness tracking (which ResponseItems are complete, partial, or missing)

**Out of scope (explicitly not owned):**
- Requirement content → Requirement aggregate (read by reference)
- Tender terms and deadlines → Tender aggregate (the SupplierResponse reads the deadline; it does not own it)
- Evaluation scores → Evaluation aggregate
- Supplier profile data → Supplier Management bounded context
- Portal authentication → Organization Management
- Non-submission outcome recording → recorded as `SupplierNonResponseRecorded` event on the Tender; no SupplierResponse aggregate instance is created

---

## 5. Business Context

A SupplierResponse exists only within the context of a specific Tender. When a Tender is published, the Supplier Contact can create a SupplierResponse in the Supplier Portal. The response lifecycle runs in parallel with the Supplier Collaboration phase (BP08).

The relationship structure:

```
Tender (1) ────────────────────────────── (many) SupplierResponse
                                                         │
                                             one per invited Supplier
                                                         │
                                             TenderRequirementSnapshot
                                                         │
                                          ResponseItem[] (one per RequirementVersionId)
```

A Supplier has exactly one SupplierResponse per Tender. Multiple Supplier Contacts at the same Supplier organization collaborate on one SupplierResponse (the response belongs to the Supplier, not to an individual contact).

The SupplierResponse is consumed by:
- **Evaluation aggregate:** Each ResponseItem is read by Evaluators and scored per Requirement
- **Decision aggregate:** The awarded SupplierResponse is included in the Contract Handover package
- **AI services:** Response summarization, completeness analysis, knock-out pre-screening

---

## 6. Lifecycle

```
(Tender Published → Supplier granted access)
              │
              │ CreateSupplierResponse
              ▼
            Draft ◄──────────────────────────── (Supplier saves progress)
              │
              │ SubmitSupplierResponse
              ▼
          Submitted ──► (Supplier updates and resubmits: Draft → Submitted cycle)
              │
              │ CloseSubmissions (deadline passed — all Submitted → Locked)
              ▼
            Locked ─────────────────────────────────────────────────────► (immutable)
              │                              or
              │ RejectSupplierResponse (completeness failure)
              ▼
           Rejected ──────────────────────────────────────────────────────► (excluded from Evaluation)
```

**State descriptions:**

| State | Who may modify? | Visible to evaluating org? |
|---|---|---|
| `Draft` | Supplier Contact only | No (in progress) |
| `Submitted` | Supplier Contact (may update + resubmit before deadline) | Procurement Manager (receipt confirmation only) |
| `Locked` | Nobody | Yes — all Evaluators in their assigned scope |
| `Rejected` | Nobody | Procurement Manager documents rejection reason |

---

## 7. State Machine

### Permitted transitions

| From | To | Command | Guard |
|---|---|---|---|
| (none) | `Draft` | `CreateSupplierResponse` | Supplier on Tender invitation list; Tender in `Published`; Supplier portal access active |
| `Draft` | `Submitted` | `SubmitSupplierResponse` | All required ResponseItems completed; submission deadline not yet passed |
| `Submitted` | `Draft` | `ReopenSupplierResponse` | Submission deadline not yet passed; Supplier Contact actor |
| `Submitted` | `Locked` | `CloseSubmissions` (batch — Tender command, applied to all Submitted responses) | Tender transitions to `Closed` |
| `Submitted` | `Rejected` | `RejectSupplierResponse` | Completeness check failure after `CloseSubmissions`; Procurement Manager authorization |
| `Locked` | `Rejected` | `RejectSupplierResponse` | Completeness check failure after `CloseSubmissions`; Procurement Manager authorization |

### Forbidden transitions

- `Locked` → `Draft` or `Submitted`: absolute prohibition. No modification after lock.
- `Rejected` → any: terminal state.
- `Draft` → `Locked`: a Draft response that was never submitted is recorded as `NonSubmitted` (a distinct administrative outcome, not a state of the SupplierResponse aggregate).

### Non-submission outcome

A Supplier who was invited but did not submit a response by the deadline is recorded via a `SupplierNonResponseRecorded` event on the Tender aggregate. There is no SupplierResponse aggregate instance in this case. The platform records the non-submission as a fact on the Tender, not as a SupplierResponse in `Draft` state (a Draft is always a live, in-progress response).

---

## 8. Business Rules

| Rule ID | Rule | Enforcement Layer | When Active |
|---|---|---|---|
| SRS-BR-001 | A Supplier may have at most one SupplierResponse per Tender. | `CreateSupplierResponse` guard | On creation |
| SRS-BR-002 | A SupplierResponse may only be created if the Supplier is on the Tender's invitation list and the Tender is in `Published` state. | `CreateSupplierResponse` guard | On creation |
| SRS-BR-003 | Every ResponseItem must reference a `RequirementVersionId` that is in the Tender's published `TenderRequirementSnapshot`. ResponseItems for Requirements outside the snapshot are rejected. | `UpdateResponseItem` guard | During editing |
| SRS-BR-004 | Submission is rejected if required ResponseItems are incomplete. "Required" is determined by the Requirement's `completionRequirement` flag. | `SubmitSupplierResponse` guard | On submission |
| SRS-BR-005 | Submission after the `submissionDeadline` recorded on the Tender is rejected. | `SubmitSupplierResponse` guard | On submission |
| SRS-BR-006 | Once locked, no attribute of the SupplierResponse or its ResponseItems may be changed. Any mutation attempt produces a domain error. | Domain invariant | Always (post-lock) |
| SRS-BR-007 | Each `SubmitSupplierResponse` produces a new `SubmissionVersion`. The sequence of submission versions must be retained and immutable. | Domain behavior | On submission |
| SRS-BR-008 | A ResponseItem's response value must conform to the `ResponseType` configured on the corresponding Requirement version. A Yes/No response item must not carry a numeric value. | `UpdateResponseItem` guard | During editing |
| SRS-BR-009 | Evidence attachments are permitted only for RequirementVersionIds where the Requirement's `evidenceRequirement` is `Optional` or `Mandatory`. | `AttachEvidence` guard | During editing |
| SRS-BR-010 | A `Rejection` after lock requires a documented reason. Rejections without a reason are not permitted. | `RejectSupplierResponse` guard | Post-lock |
| GBR-011 | Supplier Responses reference published Requirement versions (RequirementVersionId, not RequirementId). | Domain model structure | Always |
| GBR-012 | Submission after the deadline is rejected. | `SubmitSupplierResponse` guard | On submission |
| GBR-001 | All state transitions are auditable. | Aggregate audit log | Always |

---

## 9. Relationships

```
SupplierResponse
    │
    ├── TenderId ──────────────────────────────► Tender (aggregate)
    │   └── reads TenderRequirementSnapshot     [cross-aggregate read at Application Service level]
    │
    ├── SupplierId ─────────────────────────────► Supplier (aggregate in Supplier Management BC)
    │
    ├── ResponseItem[] ─────────────────────────► RequirementVersionId (in snapshot)
    │   └── RequirementVersionId ─────────────── → Requirement (aggregate — read for display only)
    │
    ├── EvidenceAttachment[] ──────────────────► DocumentManagement (external, by reference)
    │
    └── SubmissionVersion[] ───────────────────► immutable history; latest = authoritative

Consumed by:
    Evaluation ──── reads ResponseItem[] for scoring (by RequirementVersionId)
    Decision   ──── references awarded SupplierResponse by SupplierResponseId
```

**Consistency boundary notes:**
- The Tender aggregate is not directly modified when a SupplierResponse is submitted. The submission triggers a `SupplierResponseSubmitted` event; the Tender's response progress dashboard is a read model projection, not aggregate state.
- Evaluation reads ResponseItem content at read time (for display to Evaluators). It does not copy content into the Evaluation aggregate.

---

## 10. Aggregate Design

### Aggregate Root
`SupplierResponse`

### Aggregate Boundary

```
SupplierResponse (Aggregate Root)
├── supplierId: SupplierId                    immutable
├── tenderId: TenderId                        immutable
├── tenantId: TenantId                        immutable
├── status: SupplierResponseStatus            state machine
├── submissionVersions: SubmissionVersion[]   append-only; latest = authoritative
│   └── SubmissionVersion
│       ├── versionNumber: int                monotonically increasing from 1
│       ├── submittedAt: Timestamp
│       ├── submittedBy: ActorId (SupplierContact)
│       └── completenessCheckResult: CompletenessCheckResult
├── responseItems: ResponseItem[]             one per RequirementVersionId in snapshot
│   └── ResponseItem
│       ├── requirementVersionId: RequirementVersionId    immutable per item
│       ├── responseType: ResponseType                    copied from Requirement at item creation
│       ├── value: ResponseValue                          typed union per ResponseType
│       ├── textNarrative: string?                        Supplier's free-text explanation
│       ├── knockoutSelfAssessment: KnockoutSelfAssessment?   Did Supplier indicate non-fulfillment?
│       ├── lastUpdatedAt: Timestamp
│       └── completionStatus: ResponseItemCompletionStatus
├── evidenceAttachments: EvidenceAttachment[] one attachment collection per response
│   └── EvidenceAttachment
│       ├── attachmentId: AttachmentId
│       ├── requirementVersionId: RequirementVersionId    which Requirement this supports
│       ├── fileName, mimeType, sizeBytes
│       ├── uploadedAt: Timestamp
│       └── uploadedBy: ActorId
├── knockoutCandidateFlags: KnockoutCandidateFlag[]
│   └── KnockoutCandidateFlag
│       ├── requirementVersionId: RequirementVersionId
│       └── selfAssessedNonFulfillment: boolean
│           (true if Supplier's own response indicates non-fulfillment on a Knock-out Requirement)
└── auditLog: AuditEntry[]                    append-only
```

**Size constraint:** ResponseItems are scoped to the Tender's Requirement snapshot. A Tender with 200 Requirements produces a SupplierResponse with 200 ResponseItems. This is bounded by the Tender's content and does not grow unboundedly.

**Knock-out candidate pre-computation:** The `knockoutCandidateFlags` collection is maintained incrementally as ResponseItems are updated. When a ResponseItem for a Knock-out Requirement is updated to a non-fulfillment value, the corresponding flag is set. This enables the Evaluation domain to quickly identify knock-out candidates without scanning all ResponseItems.

---

## 11. Entities

### SupplierResponse (Aggregate Root)

| Attribute | Type | Rules |
|---|---|---|
| `supplierResponseId` | `SupplierResponseId` (UUID) | Immutable |
| `tenderId` | `TenderId` | Immutable |
| `supplierId` | `SupplierId` | Immutable |
| `tenantId` | `TenantId` | Immutable |
| `status` | `SupplierResponseStatus` | State machine enforced |
| `createdAt` | `Timestamp` | Immutable |
| `createdBy` | `ActorId` | Supplier Contact who initiated the response |
| `lockedAt` | `Timestamp?` | Set at lock; immutable thereafter |

### ResponseItem (Entity)

| Attribute | Type | Rules |
|---|---|---|
| `responseItemId` | `ResponseItemId` (UUID) | Immutable |
| `requirementVersionId` | `RequirementVersionId` | Immutable; must be in Tender snapshot |
| `responseType` | `ResponseType` | Copied from Requirement version at item creation; immutable |
| `value` | `ResponseValue` | Typed per `responseType`; see Value Objects |
| `textNarrative` | `string?` (max 5000 chars) | Optional additional Supplier explanation |
| `knockoutSelfAssessment` | `KnockoutSelfAssessment?` | Only populated for Knock-out Requirements |
| `completionStatus` | `ResponseItemCompletionStatus` | Computed; `Complete \| Partial \| Missing` |
| `lastUpdatedAt` | `Timestamp` | Updated on every value change |
| `lastUpdatedBy` | `ActorId` | Supplier Contact actor |

### SubmissionVersion (Entity — append-only)

| Attribute | Type | Rules |
|---|---|---|
| `versionNumber` | `int` | Monotonically increasing from 1 |
| `submittedAt` | `Timestamp` | Immutable |
| `submittedBy` | `ActorId` | Immutable |
| `completenessCheckResult` | `CompletenessCheckResult` | Snapshot of completeness at submission time |

---

## 12. Value Objects

| Value Object | Type | Constraints |
|---|---|---|
| `SupplierResponseId` | UUID | — |
| `SupplierResponseStatus` | enum | `Draft \| Submitted \| Locked \| Rejected` |
| `ResponseType` | enum | `YesNo \| FulfilledPartiallyFulfilledNotFulfilled \| FreeText \| Number \| Percentage \| Date \| SingleChoice \| MultipleChoice \| PriceValue \| Url \| FileEvidence \| StructuredTable` |
| `ResponseValue` | typed union | Value must match `ResponseType`: `YesNo` → `boolean`; `Number` → `decimal`; `Date` → ISO 8601; `FreeText` → `string` (max 10,000 chars); `PriceValue` → `{ amount: decimal, currency: CurrencyCode }`; `FileEvidence` → `AttachmentId`; `StructuredTable` → `{ rows: { columnId: string, value: string }[] }` |
| `KnockoutSelfAssessment` | `{ isFulfilled: boolean, justification: string? }` | If `isFulfilled = false`, justification recommended |
| `ResponseItemCompletionStatus` | enum | `Complete \| Partial \| Missing` — `Complete`: value provided and matches ResponseType; `Partial`: value provided but optional fields missing; `Missing`: required value not provided |
| `CompletenessCheckResult` | `{ totalItems: int, completeItems: int, partialItems: int, missingItems: int, allRequiredComplete: boolean }` | Snapshot at time of submission |
| `KnockoutCandidateFlag` | `{ requirementVersionId: RequirementVersionId, selfAssessedNonFulfillment: boolean }` | Maintained by aggregate as ResponseItems are updated |

### ResponseValue type mapping

This mapping is critical for implementation correctness:

| ResponseType | Value Storage Type | Validation Rule |
|---|---|---|
| `YesNo` | `boolean` | Exactly `true` or `false` |
| `FulfilledPartiallyFulfilledNotFulfilled` | `enum { Fulfilled, Partially, NotFulfilled }` | One of three values |
| `FreeText` | `string` | 1–10,000 chars; non-empty to be `Complete` |
| `Number` | `decimal` | Tenant-configurable min/max range validation |
| `Percentage` | `decimal` | 0.0–100.0 inclusive |
| `Date` | `ISO8601Date` | Must be valid date; not necessarily future |
| `SingleChoice` | `string` | Must be one of the configured options for this Requirement version |
| `MultipleChoice` | `string[]` | Each value must be from configured options; at least one selection for `Complete` |
| `PriceValue` | `{ amount: decimal, currency: CurrencyCode }` | `amount ≥ 0`; `currency` must be valid ISO 4217 code |
| `Url` | `string` | Valid URL; max 2000 chars |
| `FileEvidence` | `AttachmentId` | Must reference a SupplierResponse-owned attachment |
| `StructuredTable` | `{ columns: ColumnDef[], rows: Row[] }` | Column count must match configured table schema |

---

## 13. Commands

| Command | Actor | Preconditions | State Change | Events Produced |
|---|---|---|---|---|
| `CreateSupplierResponse` | Supplier Contact | Supplier on invitation list; Tender `Published`; no existing response for this Supplier+Tender | (new) → `Draft` | `SupplierResponseCreated` |
| `UpdateResponseItem` | Supplier Contact | Response in `Draft` or `Submitted`; deadline not passed; ResponseItem belongs to this response; value matches ResponseType | Updates ResponseItem value | `SupplierResponseItemUpdated` |
| `AttachEvidence` | Supplier Contact | Response in `Draft` or `Submitted`; deadline not passed; Requirement allows evidence | Adds EvidenceAttachment | `EvidenceAttached` |
| `RemoveEvidence` | Supplier Contact | Response in `Draft` or `Submitted`; deadline not passed | Removes EvidenceAttachment | `EvidenceRemoved` |
| `SubmitSupplierResponse` | Supplier Contact | Response in `Draft` or `Submitted`; all required items complete; deadline not passed | `Draft/Submitted` → `Submitted`; new SubmissionVersion created | `SupplierResponseSubmitted` |
| `ReopenSupplierResponse` | Supplier Contact | Response in `Submitted`; deadline not passed | `Submitted` → `Draft` | `SupplierResponseReopened` |
| `LockSupplierResponse` | Platform (batch, triggered by `CloseSubmissions`) | Response in `Submitted`; Tender transitioned to `Closed` | `Submitted` → `Locked` | `SupplierResponseLocked` |
| `RejectSupplierResponse` | Procurement Manager | Response in `Locked` or `Submitted`; reason provided | → `Rejected` | `SupplierResponseRejected` |

---

## 14. Events

| Event | Trigger | Critical Payload |
|---|---|---|
| `SupplierResponseCreated` | `CreateSupplierResponse` | `supplierResponseId`, `tenderId`, `supplierId`, `createdAt`, `createdBy` |
| `SupplierResponseItemUpdated` | `UpdateResponseItem` | `supplierResponseId`, `requirementVersionId`, `previousValue`, `newValue`, `updatedBy`, `updatedAt` |
| `EvidenceAttached` | `AttachEvidence` | `supplierResponseId`, `attachmentId`, `requirementVersionId`, `fileName`, `uploadedBy` |
| `SupplierResponseSubmitted` | `SubmitSupplierResponse` | `supplierResponseId`, `versionNumber`, `submittedAt`, `submittedBy`, `completenessCheckResult` |
| `SupplierResponseReopened` | `ReopenSupplierResponse` | `supplierResponseId`, `reopenedAt`, `reopenedBy` |
| `SupplierResponseLocked` | `LockSupplierResponse` | `supplierResponseId`, `lockedAt`, `submissionVersionCount`, `knockoutCandidateCount` |
| `SupplierResponseRejected` | `RejectSupplierResponse` | `supplierResponseId`, `rejectedAt`, `rejectedBy`, `reason` |

---

## 15. API Considerations

**Base resource:** `/api/v1/supplier-responses`

Note: The Supplier Portal and the internal platform have different API surfaces for this aggregate. Supplier Contacts access through the portal API (scoped to their Supplier's responses); internal users access through the procurement platform API.

**Supplier Portal API (external surface):**

```
GET    /api/v1/supplier-portal/tenders/{tenderId}/response
       — Get own SupplierResponse for this Tender
POST   /api/v1/supplier-portal/tenders/{tenderId}/response
       — CreateSupplierResponse (creates on first access)
PATCH  /api/v1/supplier-portal/tenders/{tenderId}/response/items/{requirementVersionId}
       — UpdateResponseItem
POST   /api/v1/supplier-portal/tenders/{tenderId}/response/items/{requirementVersionId}/evidence
       — AttachEvidence (multipart)
DELETE /api/v1/supplier-portal/tenders/{tenderId}/response/items/{requirementVersionId}/evidence/{attachmentId}
       — RemoveEvidence
POST   /api/v1/supplier-portal/tenders/{tenderId}/response/submit
       — SubmitSupplierResponse
POST   /api/v1/supplier-portal/tenders/{tenderId}/response/reopen
       — ReopenSupplierResponse
GET    /api/v1/supplier-portal/tenders/{tenderId}/response/completeness
       — Get CompletenessCheckResult (live, without submitting)
```

**Internal platform API (procurement team):**

```
GET    /api/v1/tenders/{tenderId}/supplier-responses
       — List all SupplierResponses for a Tender (Locked+ state; Procurement Manager access)
GET    /api/v1/tenders/{tenderId}/supplier-responses/{supplierResponseId}
       — Get SupplierResponse detail
POST   /api/v1/tenders/{tenderId}/supplier-responses/{supplierResponseId}/reject
       — RejectSupplierResponse
GET    /api/v1/tenders/{tenderId}/supplier-responses/{supplierResponseId}/items
       — List all ResponseItems
GET    /api/v1/tenders/{tenderId}/supplier-responses/{supplierResponseId}/items/{requirementVersionId}
       — Get specific ResponseItem (for Evaluation display)
GET    /api/v1/tenders/{tenderId}/supplier-responses/{supplierResponseId}/history
       — Audit log and SubmissionVersion history
```

**Design constraints:**

- Supplier Portal endpoints enforce that a Supplier Contact can only access their own Supplier's response. Cross-Supplier access is a security violation.
- The `PATCH items/{requirementVersionId}` endpoint validates `ResponseType` conformance before persisting. Returns `400 RESPONSE_TYPE_MISMATCH` if value does not match the configured type.
- Evidence upload uses multipart/form-data. Max file size is tenant-configurable (default: 25 MB per file, 200 MB per response). File type restrictions are tenant-configurable.
- The `completeness` endpoint is a read-only check that runs the same completeness logic as submission but does not persist or produce events. It is safe to call frequently.
- Internal evaluation access to ResponseItems is available only after the response is `Locked`. Returning ResponseItem content before lock to internal users is a security violation (equal treatment requirement).

---

## Permissions

| Permission | Role(s) Required | Conditions |
|---|---|---|
| `SupplierResponse.Create` | Supplier Contact | Tender in `Published` state; Supplier is on invitation list |
| `SupplierResponse.UpdateItem` | Supplier Contact | Own response; `Draft` or `Submitted` state; before submission deadline (GBR-012) |
| `SupplierResponse.AttachEvidence` | Supplier Contact | Own response; before submission deadline |
| `SupplierResponse.Submit` | Supplier Contact | Own response; all required items complete; before deadline |
| `SupplierResponse.Reopen` | Supplier Contact | Own response; before deadline; previously submitted |
| `SupplierResponse.ViewOwn` | Supplier Contact | Own response only; scoped to Supplier identity |
| `SupplierResponse.ViewAll` | Procurement Manager, Evaluator (read-only) | All locked responses for a Tender; only after `Locked` state |
| `SupplierResponse.ViewItem` | Evaluator | Individual ResponseItems; only after `Locked`; GBR-013 compliance context |
| `SupplierResponse.Reject` | Procurement Manager | Non-compliant responses after lock |
| `SupplierResponse.ViewAuditLog` | Procurement Manager, Project Owner, Auditor | Any state |

**Cross-Supplier visibility is prohibited.** A Supplier Contact may only read their own Supplier's response. The API enforces this at the tenant + supplier identity level. Internal users (Evaluators, Procurement Manager) may not view response content until the response is `Locked` — equal treatment requirement.

---

## 16. UI Considerations

**Supplier Portal response editor:** The UI must present one ResponseItem per Requirement, grouped according to the Tender's group structure. Progress is shown per group and overall. Items must clearly indicate their completion status (`Complete` / `Partial` / `Missing`).

**ResponseType rendering:** Each ResponseType requires a specific UI control:
- `YesNo`: radio buttons labeled "Yes" / "No"
- `FulfilledPartiallyFulfilledNotFulfilled`: three-way radio
- `FreeText`: textarea with character counter
- `PriceValue`: currency-aware number input with currency selector
- `FileEvidence`: file upload with drag-and-drop, showing previously uploaded files
- `StructuredTable`: dynamic row/column table editor
- `SingleChoice` / `MultipleChoice`: dropdown or checkbox list rendered from Requirement's option list

**Deadline countdown:** The Supplier Portal must display a prominent deadline countdown throughout the response workflow. On submission confirmation, the UI must state the exact remaining time until the deadline.

**Submission history:** Suppliers should be able to view their own submission history — timestamps and completeness snapshots for each submission version — so they can confirm their final submission was recorded.

**Internal view after lock:** For Evaluators, the ResponseItem display must clearly show "Supplier's response as submitted — locked" and display the `lockedAt` timestamp. There must be no possibility of confusing a locked historical response with a live draft.

**Knock-out candidate highlighting:** In the internal evaluation view, ResponseItems where the Supplier self-assessed as non-fulfilled on a Knock-out Requirement must be visually flagged. This is a reading aid for Evaluators.

---

## 17. AI Guidance

**AI may assist with:**

- **Completeness analysis:** Detecting ResponseItems where the Supplier provided a technically compliant value but the textNarrative is empty for a complex Requirement where explanation is expected
- **Summarizing Supplier Responses:** For Evaluators who need to read a large response quickly, AI can produce a structured summary per Requirement group — clearly marked as AI-generated
- **Knock-out pre-screening:** Automatically highlighting Responses where self-assessed non-fulfillment on Knock-out Requirements is detected
- **Detecting contradictions within a response:** A Supplier may claim "Yes" to a Requirement in one group while claiming non-compliance in a related Requirement in another group — AI can surface these for Evaluator attention
- **Automated completeness checking before submission:** Surface potential gaps to the Supplier Contact before they submit

**AI must not:**

- Modify a Supplier's ResponseItem values — any change to a response must be made by the Supplier Contact
- Mark a response as complete, submit it, or lock it
- Provide any AI-generated content to Evaluators as if it were Supplier-authored content — the distinction between "AI summary" and "Supplier's actual response" must be unambiguous at all times
- Access a response while it is in `Draft` or `Submitted` state for internal analysis — AI may only analyze responses after `Locked` (preventing any risk of internal scoring bias before lock)

---

## 18. Machine Context

```yaml
domain: Supplier Management
bounded_context: SupplierManagement
aggregate_root: SupplierResponse
versioned: true      # via SubmissionVersion[]
auditable: true
immutable_when:
  - Locked
  - Rejected

lifecycle_states:
  - Draft
  - Submitted
  - Locked
  - Rejected

primary_relationships:
  references:
    - Tender (by TenderId — never embeds Tender content)
    - Requirement (by RequirementVersionId — never embeds content)
    - Supplier (by SupplierId)
  consumed_by:
    - Evaluation (reads ResponseItem[] for scoring)
    - Decision (references awarded SupplierResponse by ID)

key_commands:
  - CreateSupplierResponse
  - UpdateResponseItem
  - SubmitSupplierResponse
  - LockSupplierResponse   # batch-triggered by Tender.CloseSubmissions
  - RejectSupplierResponse

key_events:
  - SupplierResponseCreated
  - SupplierResponseSubmitted
  - SupplierResponseLocked
  - SupplierResponseRejected

critical_invariants:
  - ResponseItem.requirementVersionId must be in Tender's published snapshot (GBR-011)
  - No submission after submissionDeadline (GBR-012)
  - No mutation after Locked state (SRS-BR-006)
  - ResponseValue must conform to ResponseType (SRS-BR-008)
  - One SupplierResponse per Supplier per Tender (SRS-BR-001)

never:
  - embed_requirement_content        # reference RequirementVersionId only
  - embed_evaluation_scores          # Evaluation is a separate aggregate
  - allow_post_lock_mutation
  - share_draft_response_with_internal_users  # before lock
  - allow_ai_to_modify_response_values
```

---

## 19. Anti-Patterns

**Allowing Evaluators to see Draft or Submitted responses before lock:**
Before `CloseSubmissions`, only the Procurement Manager has visibility of submission status (who has submitted). No one in the evaluating organization should be able to read a Supplier's Response content until it is locked. Reading draft responses before lock introduces scoring bias.

**Storing a copy of the Requirement content inside the ResponseItem:**
The ResponseItem holds the `RequirementVersionId` and the `ResponseType` (copied as a snapshot at item creation to avoid re-fetching). It does not copy the Requirement title or description. Those are fetched from the Requirement aggregate at display time. Copying content creates duplication that diverges over time.

**Using RequirementId instead of RequirementVersionId:**
This is the most critical implementation mistake. If a ResponseItem stores `RequirementId` and the Requirement is later updated, the item becomes ambiguous — was it answering version 3 or version 4? The `RequirementVersionId` is the precise pinning required by GBR-011.

**Treating a Supplier who did not submit as having an empty SupplierResponse:**
A non-submitting Supplier has no SupplierResponse aggregate instance. Their absence is recorded as a `SupplierNonResponseRecorded` event on the Tender. Creating an empty SupplierResponse for them conflates "intentional empty response" with "did not respond" — these are different business facts with different legal implications.

**Generating narrative summaries that Evaluators may mistake for Supplier-authored content:**
If AI generates a summary of a Supplier's Response, it must be visually and structurally impossible to confuse with the Supplier's actual answer. An Evaluator who scores based on an AI summary rather than the Supplier's actual response produces an evaluation that is not legally defensible.

---

## 20. Examples

### Example 1: A Supplier submits and revises before the deadline

```
T+0d: CreateSupplierResponse           → status: Draft
T+3d: UpdateResponseItem (×80 items)   → status: Draft (progress saved)
T+5d: SubmitSupplierResponse           → status: Submitted; SubmissionVersion 1
T+6d: Supplier reviews; finds an error
T+6d: ReopenSupplierResponse           → status: Draft
T+6d: UpdateResponseItem (×3 items)    → corrections applied
T+6d: SubmitSupplierResponse           → status: Submitted; SubmissionVersion 2
T+10d: CloseSubmissions (deadline)     → LockSupplierResponse → status: Locked
                                         SubmissionVersion 2 is the authoritative locked version
                                         SubmissionVersion 1 is retained in history
```

### Example 2: Knock-out pre-computation

The Tender has 2 Knock-out Requirements: `REQ-042-v4` (Security Certification) and `REQ-089-v2` (GDPR Module).

Supplier A updates ResponseItem for `REQ-042-v4`:
```
value: YesNo = false
knockoutSelfAssessment: { isFulfilled: false, justification: "We have SOC2 not ISO 27001" }
```

The aggregate automatically sets:
```
knockoutCandidateFlags: [
  { requirementVersionId: "REQ-042-v4", selfAssessedNonFulfillment: true }
]
```

At Evaluation, the Evaluator assigned to the Security group sees the knock-out candidate flag highlighted. They score the ResponseItem and confirm the `KnockoutDetermined` record.

---

## 21. Implementation Guidance

Implement in this order:

1. **`SupplierResponseId`, `SupplierResponseStatus`, `ResponseType`** — core value objects
2. **`ResponseValue` typed union** — this is the most complex value object; implement and test each ResponseType variant before proceeding
3. **`ResponseItem` entity** with `UpdateResponseItem` command and ResponseType validation
4. **`SupplierResponse` aggregate root** with `CreateSupplierResponse` guard (Application Service verifies Tender invitation list before calling aggregate)
5. **`SubmitSupplierResponse` command** with completeness check and deadline guard
6. **`ReopenSupplierResponse` command** with deadline guard
7. **`KnockoutCandidateFlag` maintenance** — update incrementally in `UpdateResponseItem` for Knock-out Requirements
8. **`LockSupplierResponse` command** — called by Application Service after `Tender.CloseSubmissions`; test that post-lock mutation throws
9. **`RejectSupplierResponse` command** with mandatory reason enforcement
10. **Evidence attachment sub-aggregate** (`AttachEvidence`, `RemoveEvidence`)
11. **Audit log** on every state transition
12. **Domain events** for all commands
13. **Repository interface** — `SupplierResponseRepository`
14. **Application Service** — enforce cross-aggregate validation (Tender snapshot check, deadline check from Tender timeline)
15. **Portal API** and **Internal API** — separate routes with separate authorization scopes

**Key test cases to implement:**

- SRS-BR-001: Attempt to create a second SupplierResponse for the same Supplier+Tender → expect `DUPLICATE_SUPPLIER_RESPONSE` domain error
- SRS-BR-003: Attempt to update a ResponseItem with a `requirementVersionId` not in the Tender snapshot → expect `REQUIREMENT_NOT_IN_TENDER` error
- SRS-BR-005: Attempt to submit after the deadline → expect `SUBMISSION_DEADLINE_PASSED` error
- SRS-BR-006: Attempt to update a ResponseItem on a Locked response → expect `RESPONSE_LOCKED_IMMUTABLE` error
- SRS-BR-008: Attempt to set a `PriceValue` on a `YesNo` ResponseItem → expect `RESPONSE_TYPE_MISMATCH` error
- Knock-out flag maintenance: update a Knock-out Requirement to non-fulfilled → verify flag is set; update to fulfilled → verify flag is cleared

---

## References

- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Sections 6, 7, 17
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — AP-005 (versioning), AP-006 (audit), AP-014 (security)
- [`Business_Rules.md`](../01_Business/Business_Rules.md) — GBR-011, GBR-012, GBR-001
- [`BP08_Supplier_Collaboration.md`](../01_Business/BP08_Supplier_Collaboration.md)
- [`Requirement.md`](./Requirement.md) — Source of ResponseType configuration and RequirementVersionId
- [`Tender.md`](./Tender.md) — Contains the TenderRequirementSnapshot and invitation list
- [`Evaluation.md`](./Evaluation.md) — Consumes this aggregate's ResponseItems for scoring
- [`Decision.md`](./Decision.md) — References awarded SupplierResponse in handover package
