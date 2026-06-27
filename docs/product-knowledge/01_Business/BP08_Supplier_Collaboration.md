---
id: PKB-01-BP08
title: BP08 — Supplier Collaboration
version: 2.0
status: APPROVED
owner: Product Architecture
audience:
  - Product Management
  - Business Architecture
  - Software Architecture
  - Developers
  - AI Development Agents
depends_on:
  - PKB-01-001
  - PKB-00-MASTER
---

# BP08 — Supplier Collaboration

## Purpose

This process manages the interaction between the procuring organization and the invited Suppliers during the active Tender period — from publication until submission deadline. It covers clarification management and the collection of structured Supplier Responses.

The output of BP08 is a complete set of locked Supplier Responses ready for Evaluation.

---

## Business Context

The Supplier Collaboration phase is the most externally visible part of the process. It is governed by strict equal treatment rules: any clarification, amendment or information shared with one Supplier must be shared with all Suppliers simultaneously.

Suppliers interacting with the platform through the Supplier Portal must have a structured, professional experience. Their Responses must be captured as structured Business Objects — not as uploaded documents — to enable structured Evaluation in BP09.

The Procurement Manager is the central governance actor throughout this process. They control information flow between the organization and Suppliers, ensuring that internal deliberations and Supplier identities (where anonymized) remain confidential.

---

## Scope

**In scope:**
- Receiving and reviewing Supplier clarification requests
- Authoring and publishing clarification answers to all Suppliers simultaneously
- Managing Tender amendments triggered by material clarifications
- Monitoring Supplier Response progress
- Receiving and validating Supplier Response submissions
- Locking all Supplier Responses after the submission deadline

**Out of scope:**
- Evaluation of Supplier Responses (BP09)
- Content changes to Requirements after publication without amendment process (governed by BP07)
- Commercial negotiations (post-Decision; BP12)

---

## Entry Criteria

- Tender in `Published` state (`TenderPublished` event)
- Clarification window is open
- All invited Suppliers have portal access

---

## Exit Criteria

BP08 is complete when:

- Submission deadline has passed
- All submitted Supplier Responses are in `Locked` state
- All clarification requests have been answered or formally closed
- The response completeness check has been performed
- Procurement Manager has confirmed Evaluation readiness

---

## Actors

| Role | Responsibility in BP08 |
|---|---|
| Supplier Contact | Reviews Tender; submits clarification requests; builds and submits Supplier Response |
| Procurement Manager | Manages clarification process; authors answers; enforces equal treatment; locks submissions |
| Project Manager | Monitors progress; coordinates with Procurement Manager on timeline |
| Domain Expert | Consulted for technical clarification answers (not directly visible to Suppliers) |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Published Tender | BP07 output | `Published` |
| Supplier portal access | BP07 | Active |
| Clarification window dates | `Project.tenderTimeline` | Active |
| Submission deadline | `Project.tenderTimeline` | Future (at process start) |

---

## Sub-Process A: Clarification Management

### A1 — Supplier Reviews Tender and Submits Clarification Request

**Actor:** Supplier Contact  
**Command:** `SubmitClarificationRequest`  
**Action:** The Supplier Contact reviews the published Tender and published Requirements. Where the Supplier has a question — about a Requirement's intent, about an evaluation criterion, about a procedural rule — they submit a structured clarification request:
- Which Requirement or Tender section the question relates to
- The question text
- Whether the question is procedural or substantive

**Constraint:** Clarification requests may only be submitted during the clarification window (between `clarificationWindowOpen` and `clarificationWindowClose` dates).

**Business rule:** GBR-011 — Supplier Responses reference published Requirement versions; clarification requests reference Requirements by their published version ID.

**Events produced:** `ClarificationRequestReceived`

---

### A2 — Procurement Manager Reviews Clarification Requests

**Actor:** Procurement Manager  
**Action:** Each incoming clarification request is reviewed:
- Is the question substantive (relates to Requirement content) or procedural (relates to process rules)?
- Does the answer require Domain Expert consultation?
- Does the answer reveal internal information that should not be disclosed?
- Does the question identify an error in the Tender that requires a formal amendment?

If the question requires Domain Expert input, the Procurement Manager consults internally without sharing the Supplier's identity (equal treatment requires that questions be treated as anonymous where possible).

---

### A3 — Author and Publish Clarification Answer

**Actor:** Procurement Manager  
**Command:** `PublishClarificationAnswer`  
**Action:** The Procurement Manager authors the clarification answer. Before publishing, the answer is reviewed to ensure:
- It does not reveal competitive information about other Suppliers
- It does not reveal the identity of the asking Supplier (unless unavoidable)
- It is accurate and complete

The answer is published simultaneously to ALL invited Suppliers — not just the Supplier who asked the question. This is the equal treatment requirement.

**Business rule enforced:** BP08-BR-001 — clarification answers must be published to all invited Suppliers simultaneously.

**Events produced:** `ClarificationAnswerPublished`, `SupplierNotificationSent` (per Supplier — all)

---

### A4 — Material Clarification Triggers Amendment

**Actor:** Procurement Manager (identifies need), follows BP07 amendment process  
**Action:** If a clarification answer requires a change to the Tender content (e.g., a Requirement was ambiguous and the clarification constitutes a correction), the formal amendment process from BP07 is invoked:
1. A Tender Amendment is created
2. The affected Requirement is updated in Requirement Management and approved
3. The new Requirement version is added to the Tender snapshot
4. All Suppliers are notified of the amendment
5. The submission deadline may be extended if the amendment is material

**Events produced:** `TenderAmended` (from BP07 amendment process)

---

## Sub-Process B: Supplier Response Collection

### B1 — Supplier Builds Response

**Actor:** Supplier Contact  
**Command:** `CreateSupplierResponse`, `UpdateSupplierResponseItem` (per Requirement)  
**Action:** The Supplier Contact creates a Supplier Response in the platform. The response is structured: for each Requirement in the Tender, the Supplier must provide a response item matching the configured response type:
- Yes/No compliance indication
- Free text response
- Score or percentage
- File evidence attachment
- Any other configured response type

The Supplier Response is in `Draft` state while being built. The Supplier Contact can save progress and return. The response is not visible to the organization until submitted.

**Events produced:** `SupplierResponseCreated`, `SupplierResponseItemUpdated`

---

### B2 — Supplier Submits Response

**Actor:** Supplier Contact  
**Command:** `SubmitSupplierResponse`  
**Action:** When the Supplier Contact is satisfied with their response, they formally submit it. Submission:
- Performs a completeness check: are all required response items completed?
- Records the submission timestamp
- Sets the Supplier Response to `Submitted` state
- Makes the response visible to the Procurement Manager for receipt confirmation

**Business rule enforced:** GBR-012 — submission after the deadline is rejected.

The Supplier Contact may still update a submitted response and resubmit before the deadline. Each resubmission is a new submission version in the history.

**Events produced:** `SupplierResponseSubmitted`

---

### B3 — Monitor Response Progress

**Actor:** Procurement Manager, Project Manager  
**Action:** Throughout the submission period, the Procurement Manager monitors:
- Which Suppliers have accessed the portal
- Which Suppliers have started a response
- Which Suppliers have submitted
- Whether any Supplier has contacted the organization outside the platform (which would require an equal treatment response)

The platform provides a response status dashboard per Supplier (Invited / Portal Accessed / Response Draft / Submitted).

Automated reminders may be sent to Suppliers who have not yet started their response as the deadline approaches (configurable).

---

### B4 — Close Submission Period and Lock Responses

**Actor:** Procurement Manager  
**Command:** `CloseSubmissions`  
**Action:** After the submission deadline, the Procurement Manager closes the submission period:
- No further Supplier Responses may be submitted
- No further updates to existing responses are permitted
- All submitted Supplier Responses are moved to `Locked` state
- Suppliers who did not submit a response are recorded as non-responding

**Business rule enforced:** GBR-012 — any response submitted after deadline is rejected.

**Events produced:** `SubmissionPeriodClosed`, `SupplierResponseLocked` (per submitted Response), `SupplierNonResponseRecorded` (per non-responding Supplier)

---

### B5 — Response Completeness Check

**Actor:** Procurement Manager  
**Action:** After locking, the Procurement Manager performs a completeness check:
- Are all mandatory response fields completed for each submitted response?
- Are all required evidence attachments present?
- Are there any responses that are structurally incomplete (missing required items)?

Incomplete responses may be formally rejected (Supplier excluded from Evaluation) or sent back for completion within a defined late-completion window (only permissible if organizational policy allows it and equal treatment is maintained).

**Events produced:** `ResponseCompletenessCheckCompleted`, `SupplierResponseRejected` (if applicable)

---

### B6 — Confirm Evaluation Readiness

**Actor:** Procurement Manager  
**Command:** `ConfirmEvaluationReadiness`  
**Action:** The Procurement Manager formally confirms that:
- All submissions are locked
- Completeness checks are complete
- Any non-responding or rejected Suppliers are documented
- The Evaluation team may proceed to BP09

**Events produced:** `EvaluationReadinessConfirmed`

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP08-BR-001 | Clarification answers must be published simultaneously to ALL invited Suppliers, regardless of which Supplier asked the question. No private answers are permitted. |
| BP08-BR-002 | Clarification requests may only be submitted during the defined clarification window. Requests received after the window closes must be formally rejected with a documented response. |
| BP08-BR-003 | Supplier Responses that reference Requirement versions not in the Tender's published snapshot must be rejected. |
| BP08-BR-004 | After the submission deadline, no new submissions or modifications to existing submissions are permitted, except through a formally documented late submission exception approved by the Project Owner (only where organizational policy permits). |
| BP08-BR-005 | The Procurement Manager must not share one Supplier's Response, identity or commercial position with any other Supplier during the collaboration phase. |
| BP08-BR-006 | All Supplier clarification requests are recorded in the platform, even if answered verbally. The platform record is the authoritative record. |
| GBR-011 | Supplier Responses reference published Requirement versions. |
| GBR-012 | Submission deadline is binding. |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Business Object | Transition | Trigger |
|---|---|---|
| `SupplierResponse` | `Draft` (created) | `CreateSupplierResponse` |
| `SupplierResponse` | `Draft` → `Submitted` | `SubmitSupplierResponse` |
| `SupplierResponse` | `Submitted` → `Draft` (revision) | `ReopenSupplierResponse` (before deadline) |
| `SupplierResponse` | `Submitted` → `Locked` | `CloseSubmissions` (deadline passed) |
| `SupplierResponse` | `Submitted` → `Rejected` | `RejectSupplierResponse` (completeness failure) |
| `Tender` | `Published` → `Closed` | `CloseSubmissions` |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `ClarificationRequestReceived` | `SubmitClarificationRequest` |
| `ClarificationAnswerPublished` | `PublishClarificationAnswer` |
| `SupplierResponseCreated` | `CreateSupplierResponse` |
| `SupplierResponseSubmitted` | `SubmitSupplierResponse` |
| `SubmissionPeriodClosed` | `CloseSubmissions` |
| `SupplierResponseLocked` | `CloseSubmissions` (per Response) |
| `SupplierNonResponseRecorded` | `CloseSubmissions` (per non-responding Supplier) |
| `ResponseCompletenessCheckCompleted` | Completeness check activity |
| `EvaluationReadinessConfirmed` | `ConfirmEvaluationReadiness` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Locked Supplier Responses | `SupplierResponse[]` | `Locked` |
| Clarification record | `ClarificationRequest[]`, `ClarificationAnswer[]` | Published |
| Non-response records | Per non-responding Supplier | Documented |
| Closed Tender | `Tender` | `Closed` (for submissions) |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| Response rate | Percentage of invited Suppliers who submitted a response |
| Clarification question count | Total clarification requests per Tender |
| Amendment rate | Number of Tenders requiring amendment during the collaboration phase |
| Average response submission lead time | Days before deadline that Suppliers typically submit |
| Response completeness rate | Percentage of submitted responses passing completeness check without remediation |

---

## AI Guidance

AI may assist in BP08 by:
- Detecting Supplier clarification questions that appear to be strategic (seeking competitive intelligence about other Suppliers' expected responses)
- Drafting clarification answer templates for common question types
- Monitoring response progress and alerting the Project Manager when Suppliers appear inactive
- Performing an automated completeness pre-check on submitted responses before the Procurement Manager's manual review

AI must not:
- Answer Supplier clarification questions autonomously
- Publish clarification answers without Procurement Manager review and approval
- Lock submissions without Procurement Manager command

---

## Anti-Patterns

- Answering a Supplier's question via email outside the platform — breaks the audit trail and equal treatment; must be recorded in the platform regardless of the communication channel used.
- Allowing a Supplier to submit after the deadline without formal exception approval — creates legal challenge risk.
- Publishing a clarification answer to only the asking Supplier — violates equal treatment; this must be technically prevented by the platform.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-011, GBR-012, GBR-001
- [BP07_Publication.md](./BP07_Publication.md) — Predecessor process (amendment process referenced)
- [BP09_Evaluation.md](./BP09_Evaluation.md) — Next process
