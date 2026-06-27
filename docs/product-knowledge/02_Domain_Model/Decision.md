---
id: PKB-02-006
title: Decision — Domain Object Specification
version: 1.0
status: APPROVED
owner: Domain Architecture
domain: Decision Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
  - QA Engineer
depends_on:
  - PKB-00-MASTER
  - PKB-02-003
  - PKB-02-005
  - PKB-01-001
used_by:
  - KnowledgeAsset
  - BP12_Contract_Handover
related_processes:
  - BP11_Decision
  - BP12_Contract_Handover
tags:
  - domain-model
  - aggregate
  - decision
  - ddd
  - governance
---

# Decision — Domain Object Specification

## 1. Executive Summary

The Decision aggregate is the permanent, accountable record of the procurement decision taken by the authorized Decision Board. It captures who decided, on what evidence, by what process, and with what outcome — and it is immutable once approved.

The Decision domain sits at the end of the evaluation pipeline and serves as the gateway to the Contract Handover. No contract notification can be issued without an `Approved` Decision Record. No Decision Record can be approved without a corresponding `ConsolidatedEvaluationReport` in `Approved` state.

Unlike most aggregates in adtender, the Decision aggregate intentionally limits its commands to a small, auditable set. Its primary value is not workflow automation — it is **accountability traceability**. Every word in an approved Decision Record may be scrutinized in a legal challenge or an audit. The domain must make it technically impossible to approve a Decision without the full evidentiary chain being present and recorded.

---

## 2. Purpose

The `Decision` aggregate:

1. Captures the composition and authorization of the Decision Board for a specific Tender
2. Records and enforces Conflict of Interest declarations before any Supplier data is accessed
3. Documents the outcome type: `Award`, `RejectAllResponses`, or `CancelProcurement`
4. Records the selected Supplier (for `Award`), including override rationale if the selected Supplier is not rank 1
5. Records the deliberation summary and dissenting views
6. Enforces that all of this is based on an approved `ConsolidatedEvaluationReport` (GBR-015)
7. Produces an approved, immutable Decision Record that triggers the Contract Handover process

---

## 3. Business Motivation

**Why does the Decision need its own aggregate?**

The Decision is not a state of the Tender. It is a formal governance act performed by a different actor group (Decision Board), with different lifecycle rules (immutable once approved, with distinct COI prerequisites) and different accountability requirements (individual board members are recorded and can be referenced in a legal challenge). Embedding it in the Tender aggregate would violate the single-responsibility principle and blur the accountability model.

**Why is the Decision Record immutable after approval?**

An organization awarded a contract to Supplier X cannot later modify the Decision Record to add a rationale that was not present at the time of decision. GBR-017 reflects a legal and regulatory reality: procurement decisions in many jurisdictions become permanent records upon authorization. Immutability is not a technical preference — it is a governance requirement. If a decision must be reversed, a separate `DecisionRevocation` command is issued (which is itself a full audit event, not an edit to the original).

**Why enforce COI declarations at the domain level?**

Conflict of Interest declarations that exist only as a form on a UI can be bypassed. The domain must enforce that no COI-undeclared board member can access Supplier response data or cast a decision. This is AP-014 (Secure by Design) applied to a governance context, not just an authentication context.

---

## 4. Responsibilities

- Recording and validating Decision Board composition for a Tender
- Enforcing COI declaration by every Board member before granting access to the decision session
- Recording the deliberation process (summary notes, dissenting views)
- Capturing the outcome decision (type + selected supplier if Award + override rationale if applicable)
- Enforcing that the decision is based on an approved ConsolidatedEvaluationReport (GBR-015)
- Producing an approved, signed Decision Record
- Publishing the `DecisionApproved` event that triggers BP12 (Contract Handover)
- Enforcing immutability of the Decision Record after approval (GBR-017)

---

## Scope

**In scope (owned by this aggregate):**
- Decision Board composition: Board member identities, roles, COI declarations, disqualification status
- Session lifecycle state (SessionPreparing → SessionReady → InDeliberation → OutcomeRecorded → Approved)
- Deliberation notes and dissenting views
- Decision outcome: type (Award / RejectAllResponses / CancelProcurement), selected Supplier, override rationale
- The immutable Decision Record
- Link to the ConsolidatedEvaluationReport that forms the evidentiary basis

**Out of scope (explicitly not owned):**
- ConsolidatedEvaluationReport content → ConsolidatedEvaluation aggregate (referenced by ID only)
- Supplier Response content → SupplierResponse aggregate
- Evaluation scores → Evaluation / ConsolidatedEvaluation aggregates
- Contract Lifecycle Management → External CLM; adtender's role ends at `ExecuteHandover`
- Supplier notification and standstill management → BP12 process, triggered by `DecisionApproved` event

---

## 5. Business Context

```
Evaluation Management                     Decision Management                     Contract Handover
         │                                        │                                       │
ConsolidatedEvaluationReport        Decision aggregate                    BP12 is triggered by
  (Approved)          ──────────►    records outcome         ──────────►  DecisionApproved event
                                    based on this report
                                           │
                                    Decision Board
                                    (human actors)
```

The Decision Board is composed of individuals from the organizational structure, authorized per the organization's approval authority matrix. The Procurement Manager participates (as the process expert) but typically does not vote. The Project Owner may be a board member or may hold approval authority over the board's decision.

The Decision domain interacts with:
- **Evaluation Management:** reads the `ConsolidatedEvaluationReport` (its primary evidentiary input)
- **Organization Management:** reads user roles and authorization levels for Decision Board composition
- **Tender Management:** references the `TenderId`; triggers the `ExecuteHandover` process
- **Knowledge Management:** the approved Decision Record becomes an artifact that feeds the Project Archive and Lessons Learned

---

## 6. Lifecycle

```
ConsolidatedEvaluationReportApproved (BP10)
              │
              │ InitiateDecisionProcess
              ▼
        SessionPreparing
              │
              │ All Board members: DeclareConflictOfInterest
              ▼
         SessionReady  (all COI declarations present; no disqualified member)
              │
              │ OpenDecisionSession
              ▼
         InDeliberation
              │
              │ RecordDecisionOutcome
              ▼
         OutcomeRecorded
              │
              │ ApproveDecisionRecord
              ▼
           Approved ──────────────────────────── (immutable; triggers DecisionApproved event)
```

If a Board member declares an active COI, they are excluded from the session. If so many members are disqualified that quorum is lost, the session cannot proceed and `DecisionSessionBlocked` event is raised — requiring organizational escalation.

---

## 7. State Machine

### Permitted transitions

| From | To | Command | Guard |
|---|---|---|---|
| (new) | `SessionPreparing` | `InitiateDecisionProcess` | `ConsolidatedEvaluationReport` in `Approved` state; acting user has `Decision.Initiate` permission |
| `SessionPreparing` | `SessionReady` | (automatic after final COI declaration) | All Board members have declared COI; quorum is met after disqualification of COI-affected members |
| `SessionReady` | `InDeliberation` | `OpenDecisionSession` | Authorized Session Chair |
| `InDeliberation` | `OutcomeRecorded` | `RecordDecisionOutcome` | Outcome type set; if `Award`: `selectedSupplierId` set; if lower-ranked Supplier selected: `overrideRationale` non-empty (EVL-BR-BR-005) |
| `OutcomeRecorded` | `Approved` | `ApproveDecisionRecord` | Session Chair or Project Owner; Decision Board quorum present |

### Forbidden transitions

| Forbidden | Reason |
|---|---|
| Any mutation after `Approved` | GBR-017: Decision Records are immutable after approval |
| `OpenDecisionSession` with undeclared COI member | GBR-016 |
| `RecordDecisionOutcome` with `Award` + no `selectedSupplierId` | Structural invariant |
| `RecordDecisionOutcome` with `Award` + rank > 1 supplier + no `overrideRationale` | DEC-BR-005 |
| `ApproveDecisionRecord` without `ConsolidatedEvaluationReportId` present | GBR-015 |

---

## 8. Business Rules

| Rule ID | Rule | Enforcement Layer | When Active |
|---|---|---|---|
| DEC-BR-001 | The Decision Board must have at least one authorized Approver with `Decision.Approve` permission. Composition must be established before `SessionReady`. | `InitiateDecisionProcess` guard | At initiation |
| DEC-BR-002 | Every Board member must submit a COI declaration before the session opens. Undeclared members block session opening. | `OpenDecisionSession` guard | `SessionPreparing` |
| DEC-BR-003 | A Board member who declares an active COI for any Supplier in the Tender is excluded from accessing that Supplier's response data and from voting on the final decision. If only some Suppliers are affected, the member may participate in deliberations about non-COI Suppliers. | Data access control; Domain invariant | From declaration |
| DEC-BR-004 | The `ConsolidatedEvaluationReportId` must be present and the referenced report must be in `Approved` state at the time of `ApproveDecisionRecord`. | `ApproveDecisionRecord` guard | At approval |
| DEC-BR-005 | If the outcome is `Award` and the selected Supplier is not the highest-ranked qualifying Supplier, a written override rationale is mandatory. | `RecordDecisionOutcome` guard | Award with non-rank-1 |
| DEC-BR-006 | The deliberation summary must be a non-empty text. Token notes ("decision made") are technically permitted but operationally governed. | `RecordDecisionOutcome` guard | At outcome recording |
| DEC-BR-007 | Dissenting views must be captured if any Board member votes against the majority outcome. The dissenting member must provide a written dissent statement. | `RecordDecisionOutcome` | When dissent declared |
| DEC-BR-008 | Once `Approved`, the Decision Record cannot be modified. If a decision must be reversed, a `RevokeDecision` command must be issued — which itself produces a full audit event and requires re-entry of the Decision process. | Domain invariant; Repository write block | Always after `Approved` |
| GBR-015 | The Decision must be based on the Consolidated Evaluation Report. | `ApproveDecisionRecord` guard | At approval |
| GBR-016 | Decision Board members must declare COI before accessing Supplier data. | `OpenDecisionSession` guard | At session opening |
| GBR-017 | Approved Decision Records are immutable. | Domain invariant | Always after `Approved` |

---

## 9. Relationships

```
ConsolidatedEvaluation (1)
    └── ConsolidatedEvaluationReport (Approved) ──────────────► Decision
                                                                    │
                                                                    ├── TenderId ────────── references Tender
                                                                    ├── BoardMembers[] ──── references Users in Organization Management
                                                                    ├── SelectedSupplierId? references Supplier
                                                                    └── triggers ──────────► BP12 Contract Handover
```

The Decision aggregate does **not** embed:
- ConsolidatedEvaluationReport content (references by `ConsolidatedEvaluationReportId`)
- Supplier Response content
- Score data — this lives in the ConsolidatedEvaluation aggregate

---

## 10. Aggregate Design

```
Decision (Aggregate Root)
├── decisionId: DecisionId
├── tenderId: TenderId                          immutable
├── tenantId: TenantId                          immutable
├── consolidatedEvaluationReportId: ConsolidatedEvaluationReportId   immutable
├── status: DecisionStatus
├── decisionBoard: DecisionBoard               immutable once SessionReady
│   ├── members: BoardMember[]
│   │   └── BoardMember
│   │       ├── memberId: BoardMemberId
│   │       ├── userId: UserId
│   │       ├── role: BoardRole                Chair | Approver | Advisor | Observer
│   │       ├── coiDeclaration: COIDeclaration?
│   │       │   ├── declaredAt: Timestamp
│   │       │   ├── hasActiveConflict: boolean
│   │       │   ├── affectedSupplierIds: SupplierId[]  (empty if no conflict)
│   │       │   └── conflictDescription: string?      (mandatory if hasActiveConflict)
│   │       └── isDisqualified: boolean         computed from coiDeclaration
│   └── quorumRequired: int                    minimum voting members for valid session
├── sessionOpenedAt: Timestamp?
├── deliberation: Deliberation?                 set at RecordDecisionOutcome
│   ├── summary: string                         mandatory; max 10,000 chars
│   ├── dissentingViews: DissentingView[]
│   │   └── DissentingView
│   │       ├── memberUserId: UserId
│   │       └── statement: string               mandatory; non-empty
│   └── recordedAt: Timestamp
├── outcome: DecisionOutcome?                   set at RecordDecisionOutcome
│   ├── type: DecisionOutcomeType               Award | RejectAllResponses | CancelProcurement
│   ├── selectedSupplierId: SupplierId?         mandatory if type == Award
│   ├── selectedSupplierRank: int?              rank in the consolidated evaluation
│   ├── overrideRationale: string?              mandatory if selectedSupplierRank > 1
│   └── recordedAt: Timestamp
├── approvedAt: Timestamp?                      set at ApproveDecisionRecord
├── approvedBy: UserId?                         set at ApproveDecisionRecord
└── auditLog: AuditEntry[]                      append-only
```

---

## 11. Entities

### BoardMember (Entity within Decision)

| Attribute | Type | Rules |
|---|---|---|
| `memberId` | `BoardMemberId` | Immutable |
| `role` | `BoardRole` | `Chair \| Approver \| Advisor \| Observer` |
| `coiDeclaration` | `COIDeclaration?` | Required before session opens (GBR-016) |
| `isDisqualified` | `boolean` | Computed: `true` if `hasActiveConflict == true` |

### Deliberation (Entity within Decision)

| Attribute | Type | Rules |
|---|---|---|
| `summary` | `string` (max 10,000 chars) | Mandatory; non-empty |
| `dissentingViews` | `DissentingView[]` | Mandatory entry for each dissenting board member |
| `recordedAt` | `Timestamp` | Immutable |

---

## 12. Value Objects

| Value Object | Type | Constraints |
|---|---|---|
| `DecisionId` | UUID | — |
| `DecisionStatus` | enum | `SessionPreparing \| SessionReady \| InDeliberation \| OutcomeRecorded \| Approved` |
| `DecisionOutcomeType` | enum | `Award \| RejectAllResponses \| CancelProcurement` |
| `BoardRole` | enum | `Chair \| Approver \| Advisor \| Observer` |
| `COIDeclaration` | `{ declaredAt, hasActiveConflict, affectedSupplierIds, conflictDescription? }` | Immutable after creation |
| `DecisionOutcome` | `{ type, selectedSupplierId?, selectedSupplierRank?, overrideRationale?, recordedAt }` | Immutable after set |

---

## 13. Commands

| Command | Actor | Preconditions | State Change | Events Produced |
|---|---|---|---|---|
| `InitiateDecisionProcess` | Procurement Manager / Project Owner | `ConsolidatedEvaluationReport` in `Approved`; acting user has permission | (new) → `SessionPreparing` | `DecisionProcessInitiated` |
| `AddBoardMember` | Session Chair | Decision `SessionPreparing`; user exists; not already a member | Adds `BoardMember` | `BoardMemberAdded` |
| `DeclareConflictOfInterest` | Board Member (self-declaration) | Decision `SessionPreparing`; acting user is a Board member; no existing declaration | Adds `COIDeclaration`; may set `isDisqualified`; if all declared → auto-transitions to `SessionReady` | `COIDeclared` |
| `OpenDecisionSession` | Session Chair | Decision `SessionReady`; all members declared; quorum met | `SessionReady` → `InDeliberation` | `DecisionSessionOpened` |
| `RecordDecisionOutcome` | Session Chair | Decision `InDeliberation`; outcome type valid; guards per DEC-BR-005 | `InDeliberation` → `OutcomeRecorded` | `DecisionOutcomeRecorded` |
| `ApproveDecisionRecord` | Session Chair / Project Owner | Decision `OutcomeRecorded`; GBR-015 satisfied | `OutcomeRecorded` → `Approved` | `DecisionApproved` |
| `RevokeDecision` | Project Owner | Decision `Approved`; revocation reason documented | Does NOT mutate Decision; creates `DecisionRevocation` record | `DecisionRevoked` |

---

## 14. Events

| Event | Trigger | Critical Payload |
|---|---|---|
| `DecisionProcessInitiated` | `InitiateDecisionProcess` | `decisionId`, `tenderId`, `consolidatedEvaluationReportId`, `initiatedBy`, `initiatedAt` |
| `BoardMemberAdded` | `AddBoardMember` | `decisionId`, `userId`, `role`, `addedAt` |
| `COIDeclared` | `DeclareConflictOfInterest` | `decisionId`, `userId`, `hasActiveConflict`, `affectedSupplierIds`, `declaredAt` |
| `DecisionSessionOpened` | `OpenDecisionSession` | `decisionId`, `boardMemberCount`, `disqualifiedCount`, `openedAt` |
| `DecisionOutcomeRecorded` | `RecordDecisionOutcome` | `decisionId`, `outcomeType`, `selectedSupplierId?`, `selectedSupplierRank?`, `overrideRationale?`, `recordedAt` |
| `DecisionApproved` | `ApproveDecisionRecord` | `decisionId`, `tenderId`, `outcomeType`, `selectedSupplierId?`, `approvedBy`, `approvedAt` |
| `DecisionRevoked` | `RevokeDecision` | `decisionId`, `revokedBy`, `revocationReason`, `revokedAt` |

**The `DecisionApproved` event is the trigger for BP12 (Contract Handover).** The event consumer in the Tender Management or Notification bounded context subscribes to this event and initiates the notification preparation process.

---

## 15. API Considerations

**Base resource:** `/api/v1/decisions`

```
POST   /api/v1/tenders/{tenderId}/decisions
       — InitiateDecisionProcess; returns 201 with decisionId
GET    /api/v1/tenders/{tenderId}/decisions/{decisionId}
       — Get Decision (Procurement Manager, Board members, Executive Sponsor)
POST   /api/v1/tenders/{tenderId}/decisions/{decisionId}/board-members
       — AddBoardMember
POST   /api/v1/tenders/{tenderId}/decisions/{decisionId}/board-members/{memberId}/coi-declaration
       — DeclareConflictOfInterest (self-declaration only; authenticated user must match memberId)
GET    /api/v1/tenders/{tenderId}/decisions/{decisionId}/board-members
       — List board members and COI status (accessible only to board members and Procurement Manager)
POST   /api/v1/tenders/{tenderId}/decisions/{decisionId}/open-session
       — OpenDecisionSession
POST   /api/v1/tenders/{tenderId}/decisions/{decisionId}/outcome
       — RecordDecisionOutcome
POST   /api/v1/tenders/{tenderId}/decisions/{decisionId}/approve
       — ApproveDecisionRecord
POST   /api/v1/tenders/{tenderId}/decisions/{decisionId}/revoke
       — RevokeDecision
```

**Authorization rules:**

- `GET /decisions/{id}` returns `403 DECISION_ACCESS_RESTRICTED` to any user who is not a Board member, the Procurement Manager, or the Project Owner — until the Decision is `Approved`, at which point broader internal read access applies.
- `POST .../coi-declaration` only works when the authenticated user matches the `memberId`'s user. Proxy declarations are not permitted.
- `POST .../approve` requires `Decision.Approve` permission scope.

---

## Permissions

| Permission | Role(s) Required | Conditions |
|---|---|---|
| `Decision.Initiate` | Procurement Manager, Project Owner | ConsolidatedEvaluationReport in `Approved` state |
| `Decision.AddBoardMember` | Session Chair (Decision Board Chair) | Decision in `SessionPreparing` state |
| `Decision.DeclareCOI` | Board Member (self-declaration only) | Own declaration only; `SessionPreparing` state; GBR-016 |
| `Decision.OpenSession` | Session Chair | All Board members declared; quorum met |
| `Decision.RecordOutcome` | Session Chair | Decision in `InDeliberation`; deliberation summary non-empty |
| `Decision.Approve` | Session Chair, Project Owner | Decision in `OutcomeRecorded`; GBR-015 satisfied |
| `Decision.Revoke` | Project Owner | Decision in `Approved`; revocation reason documented |
| `Decision.ViewRecord` | Board members, Procurement Manager, Project Owner, Executive Sponsor | Restricted to internal users; COI-disqualified members cannot view COI-affected Supplier data |
| `Decision.ViewAuditLog` | Project Owner, System Administrator, Auditor | Any state |

**COI data access restriction:** A Board member who declared an active COI for Supplier X cannot read Supplier X's response data, evaluation scores, or any Decision content that specifically references Supplier X. This is enforced at the Application Service layer, not only at the UI layer (AP-014).

**Proxy COI declarations are prohibited.** Each Board member must perform their own COI declaration through their authenticated session. An administrator or Chair may not declare on behalf of a member.

---

## 16. UI Considerations

**COI declaration flow:** Each Board member receives a task notification when added to the board. Clicking the task opens a COI declaration form. The member must affirm: (a) I have no active conflict of interest, or (b) I declare a conflict with Supplier(s) [list]. No ability to proceed to the session view until declaration submitted.

**Session view — access gating:** Board members with an active COI for a specific Supplier must not see that Supplier's name, response data, or evaluation scores. The session view must mask this Supplier's data for the disqualified member. This is not a UX courtesy — it is a compliance control enforced at the API authorization layer.

**Outcome recording form:** The outcome recording form shows:
- The full Supplier ranking from the ConsolidatedEvaluationReport (pulled by reference)
- A "Select Outcome" selector (Award / Reject All / Cancel)
- If Award: a Supplier selector
- If the selected Supplier is not rank 1: a mandatory rationale field that must be completed before the form can be submitted

**Deliberation notes:** Free-text field with a character counter (max 10,000). A save-draft capability allows the Chair to start recording notes during the session before the outcome is finalized.

---

## 17. AI Guidance

**AI may assist with:**

- Pre-session preparation: generating a summary view of the ConsolidatedEvaluationReport for Board members — structured briefing, highlighted anomalies, knock-out outcomes
- COI screening: AI can flag potential COI risks based on organizational affiliation data, past project participation, and known Supplier relationships — as a screening prompt to the Board member, not as an automatic determination
- Decision record draft: after the Session Chair records the outcome and deliberation notes, AI can produce a formatted draft Decision document for review before approval

**AI must not:**

- Determine a COI outcome (the member must self-declare; AI may assist with screening, not determination)
- Record the decision outcome
- Approve the Decision Record
- Access Supplier data on behalf of a disqualified Board member
- Draft deliberation notes in a way that masks the actual deliberation content with generic language

**ADR-005 (Human-in-the-Loop AI):** The Decision aggregate is the most human-governed aggregate in adtender. AI has the most restricted role here — it is an information retrieval and summarization tool only.

---

## 18. Machine Context

```yaml
domain: Decision Management
bounded_context: DecisionManagement
aggregate_root: Decision

lifecycle: [SessionPreparing, SessionReady, InDeliberation, OutcomeRecorded, Approved]

critical_invariants:
  - GBR-015: ConsolidatedEvaluationReport must be Approved before Decision can be Approved
  - GBR-016: all Board members must declare COI before OpenDecisionSession
  - GBR-017: Decision is immutable after Approved; no mutation commands; RevokeDecision creates a separate record
  - DEC-BR-005: override rationale mandatory when non-rank-1 Supplier selected
  - COI-disqualified members must not access affected Supplier data

key_events:
  - DecisionProcessInitiated
  - COIDeclared
  - DecisionSessionOpened
  - DecisionApproved        # triggers BP12 Contract Handover
  - DecisionRevoked

integration:
  consumes: ConsolidatedEvaluationReport (by ConsolidatedEvaluationReportId)
  triggers: BP12 via DecisionApproved event
  references: Tender (TenderId), User/Organization (Board member IDs)

never:
  - allow_ai_to_record_outcome_or_approve
  - allow_mutation_after_approved
  - allow_coi_bypass_for_data_access
  - allow_decision_without_approved_consolidated_report
  - allow_proxy_coi_declarations
```

---

## 19. Anti-Patterns

**Approving a Decision without an approved ConsolidatedEvaluationReport:**
The report is the evidentiary basis. A Decision without it has no traceable foundation and cannot survive a legal challenge. GBR-015 is not waivable.

**Treating COI declarations as a UI checkbox:**
COI declarations that only live in a form and are not enforced at the data access layer are ineffective. A Board member who declared an active COI must be technically blocked from viewing the affected Supplier's data — not just warned about it.

**Recording a generic deliberation summary:**
"The Board reviewed the evaluation results and made a decision" is not a deliberation record. If the Decision is challenged, the deliberation record must show that the Board actually engaged with the evaluation evidence. Operationally, the platform should encourage substantive notes; technically, it must enforce non-empty notes.

**Revising a Decision by editing the Decision Record directly:**
If a decision must be reversed, the correct process is `RevokeDecision` followed by a new Decision process. Direct edits to an approved Decision Record are a data integrity violation.

---

## 20. Examples

### Example 1: Award with override

Tender has 3 qualifying Suppliers after knock-out. Ranking: Supplier A (92 pts), Supplier B (87 pts), Supplier C (79 pts).

Decision Board selects Supplier B. Override rationale: "Supplier A has an ongoing legal dispute with the organization as documented in the Risk Register. Despite the scoring difference, the Board assessed that the operational risk of engaging Supplier A outweighs the score differential of 5 points. Supplier B is the highest-ranking Supplier without disqualifying risk factors."

`RecordDecisionOutcome` command: `{ type: Award, selectedSupplierId: SupplierB, selectedSupplierRank: 2, overrideRationale: "..." }` — DEC-BR-005 satisfied.

### Example 2: COI disqualification and quorum maintenance

Decision Board: Chair, Approver A, Approver B, Approver C. Quorum required: 3.

Approver A declares an active COI with Supplier X. Board has 4 members; after disqualification 3 remain. Quorum met (3 ≥ 3). Session opens; Approver A is excluded from viewing Supplier X's data.

If Approver B also declared a COI: 2 active members remain. `DecisionSessionBlocked` event raised — quorum is lost. Organizational escalation required before process can continue.

---

## 21. Implementation Guidance

Implement in this order:

1. **`DecisionStatus`, `DecisionOutcomeType`, `BoardRole` value objects**
2. **`COIDeclaration` value object** — immutable; validate `conflictDescription` is present when `hasActiveConflict == true`
3. **`Decision` aggregate root** with `InitiateDecisionProcess` command — validate `ConsolidatedEvaluationReport` is in `Approved` state (cross-BC read via ACL)
4. **`AddBoardMember` command** — quorum tracking logic
5. **`DeclareConflictOfInterest` command** — auto-transition to `SessionReady` when all members have declared; quorum check after disqualification
6. **`OpenDecisionSession` command** — guard: all members declared; quorum met; GBR-016
7. **`RecordDecisionOutcome` command** — DEC-BR-005 override rationale guard; deliberation non-empty guard
8. **`ApproveDecisionRecord` command** — GBR-015 guard; produces `DecisionApproved` event
9. **`RevokeDecision` command** — immutability: Decision aggregate state does not change; `DecisionRevocation` domain event produced
10. **Data access guard for COI-disqualified members:** implement as a Domain Service or API middleware that intercepts any request for Supplier data from a user who has an active COI for that Supplier in the current Decision. Return `403 COI_DATA_ACCESS_BLOCKED`.
11. **`DecisionApproved` event consumer** in Contract Handover or Notification context — triggers BP12

**Critical test:**
- Attempt `ApproveDecisionRecord` without a corresponding `ConsolidatedEvaluationReportId` in `Approved` state → expect `MISSING_CONSOLIDATED_EVALUATION_REPORT` error
- Attempt `OpenDecisionSession` with one Board member who has not yet submitted a COI declaration → expect `PENDING_COI_DECLARATIONS` error
- Attempt `RecordDecisionOutcome` with `Award` + rank-2 Supplier + empty override rationale → expect `OVERRIDE_RATIONALE_REQUIRED` error
- Attempt any mutation command after `Approved` state → expect `DECISION_IMMUTABLE` error

---

## References

- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Section 7 (ADRs), Section 9 (AI constraints)
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — AP-005 (versioning), AP-006 (audit), AP-014 (secure by design), AP-016 (AI interactions)
- [`Business_Rules.md`](../01_Business/Business_Rules.md) — GBR-015, GBR-016, GBR-017, GBR-001
- [`BP11_Decision.md`](../01_Business/BP11_Decision.md) — Business process that this aggregate implements
- [`BP12_Contract_Handover.md`](../01_Business/BP12_Contract_Handover.md) — Triggered by `DecisionApproved`
- [`Evaluation.md`](./Evaluation.md) — Provides the `ConsolidatedEvaluationReport` this aggregate requires
- [`Tender.md`](./Tender.md) — The context within which this Decision occurs
- [`KnowledgeAsset.md`](./KnowledgeAsset.md) — Decision Records feed the organizational Project Archive
