---
id: PKB-01-BP06
title: BP06 — Tender Creation
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

# BP06 — Tender Creation

## Purpose

This process assembles the approved Requirement set into a structured, governed Tender — ready for compliance review, approval and publication to Suppliers.

The output of BP06 is a Tender in `Approved` state, with a defined Evaluation Model, a finalized Supplier invitation list and a configured Tender structure.

---

## Business Context

BP04 answers "what do we need from Suppliers?" BP06 answers "how do we formally ask for it?"

The Tender is the formal procurement instrument. It defines the structure of the procurement, the rules under which Suppliers respond, the evaluation criteria against which responses will be scored, and the timeline that governs the process. The quality of a Tender directly determines the comparability and defensibility of the subsequent evaluation.

The Tender is not a document — it is a structured Business Object from which a document can be generated. The primary source of truth is the structured Tender and its Requirement set.

---

## Scope

**In scope:**
- Creating the Tender and configuring its structure
- Adding approved Requirements to the Tender with group assignments
- Configuring the Evaluation Model: scoring method, category weights, Knock-out enforcement
- Defining Tender-level terms and conditions
- Preparing the Supplier invitation list
- Internal compliance review
- Tender approval for publication

**Out of scope:**
- Requirement content changes (changes must happen in Requirement Management; the new version must be approved before it can be referenced in the Tender)
- Publication to Suppliers (BP07)
- Supplier Response collection (BP08)

---

## Entry Criteria

- Project in `Planned` state
- All Requirements intended for this Tender are in `Approved` state
- Evaluation approach defined (from BP03)
- Supplier longlist prepared (from BP03)

---

## Exit Criteria

BP06 is complete when:

- Tender is in `Approved` state
- All Requirement groups and their Requirements are correctly structured in the Tender
- Evaluation Model is configured (scoring method, weights per group, knock-out rules)
- Tender terms and conditions are defined
- Supplier invitation list is confirmed
- Tender has passed compliance review
- Tender has been approved by the Project Owner and Procurement Manager

---

## Actors

| Role | Responsibility in BP06 |
|---|---|
| Project Manager | Coordinates the Tender creation process; owns timeline |
| Requirement Engineer | Adds Requirements to Tender; verifies grouping and structure |
| Procurement Manager | Configures compliance terms; reviews for procurement law compliance; approves |
| Project Owner | Reviews the complete Tender; gives final approval |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Approved Requirement set with groups | BP04 output | All `Approved` |
| Evaluation approach | BP03 — `Project.evaluationApproach` | Configured |
| Tender timeline | BP03 — `Project.tenderTimeline` | Configured |
| Potential Supplier list | BP03 — `Project.potentialSuppliers[]` | Recorded |
| Organizational procurement policy | Organization Management | Active |
| Tender template (if available) | Knowledge Management | `Published` |

---

## Activities

### Activity 1 — Create Tender Record

**Actor:** Project Manager  
**Command:** `CreateTender`  
**Action:** A Tender record is created and linked to the Project:
- Title
- Tender type (reference to project's procurement strategy)
- Tender language(s)
- Publication target date (from project timeline)
- Submission deadline (from project timeline)
- Clarification window: open date and close date
- Confidentiality settings (Supplier anonymization during evaluation: yes/no)

If a Tender template is available and applicable, it can be used as a starting configuration.

**Tender state after this activity:** `Draft`

**Events produced:** `TenderCreated`

---

### Activity 2 — Add Requirements to Tender

**Actor:** Requirement Engineer  
**Command:** `AddRequirementToTender` (per Requirement group)  
**Action:** The approved Requirements are added to the Tender, organized into the groups defined in BP04.

Each Requirement is referenced by its specific `RequirementVersionId`. The Tender maintains a snapshot: the specific version of each Requirement at the time it was added.

**Business rule enforced:** GBR-009 — only Requirements in `Approved` state may be added.

If a Requirement needs to be changed at this stage, the change must go through the Requirement Management approval process first, producing a new version. The new version is then added to the Tender.

**Events produced:** `RequirementAddedToTender` (per Requirement)

---

### Activity 3 — Configure Evaluation Model

**Actor:** Procurement Manager, Project Manager, Domain Expert (consulted)  
**Command:** `ConfigureEvaluationModel`  
**Action:** The Evaluation Model defines precisely how Supplier Responses will be assessed:

- **Scoring scale:** The scoring range applied to each Requirement (e.g., 0–5, 0–10, percentage)
- **Group weights:** The relative weight of each Requirement group in the overall Tender score (must sum to 100%)
- **Scoring method per group:** Weighted average, maximum score, minimum threshold
- **Knock-out rules:** Which Requirements carry automatic exclusion on non-fulfillment (referencing BP04 knock-out flags)
- **Mandatory comments:** Which score levels require written Evaluator rationale (typically low scores and knock-outs)

**Events produced:** `EvaluationModelConfigured`

---

### Activity 4 — Define Tender Terms and Conditions

**Actor:** Procurement Manager  
**Command:** `SetTenderTerms`  
**Action:** The procedural terms governing the Tender process are documented:
- Equal treatment statement
- Confidentiality obligations for Suppliers
- Conditions for disqualification
- Rights reserved (to cancel, reject all responses, conduct negotiations)
- Standstill period reference
- Governing law and jurisdiction (for regulated or international procurement)

These terms become part of the published Tender and are visible to Suppliers.

**Events produced:** `TenderTermsSet`

---

### Activity 5 — Finalize Supplier Invitation List

**Actor:** Procurement Manager, Project Manager  
**Command:** `AddSupplierToInvitationList` (per Supplier)  
**Action:** The potential Supplier list from BP03 is reviewed and finalized as the formal invitation list. For each Supplier:
- Verify Supplier record exists in the system (create if new)
- Verify no active conflict of interest flags from BP02 declarations
- Record the Supplier's invitation basis (market knowledge, prior relationship, qualification result)

The invitation list is reviewed and confirmed. This is the list of Suppliers who will receive access to the Supplier Portal when the Tender is published.

**Business rule:** For open tenders, all qualified Suppliers may participate; the invitation list is the mechanism for notifying them. For restricted tenders, the invitation list is the exclusionary boundary.

**Events produced:** `SupplierAddedToInvitationList` (per Supplier)

---

### Activity 6 — Generate and Review Draft Tender Document

**Actor:** Project Manager, Procurement Manager  
**Command:** `GenerateTenderDocument`  
**Action:** A draft Tender document is generated from the structured Tender record. This document serves as a human-readable review artifact — it is not the source of truth. The structured Tender Business Object is the source of truth.

The review identifies formatting issues, missing sections or structural problems. Any content issues are addressed by updating the structured Tender record (not by editing the document directly).

**Events produced:** `TenderDocumentGenerated`

---

### Activity 7 — Compliance Review

**Actor:** Procurement Manager  
**Action:** The Tender is reviewed against applicable procurement rules:
- Does the Tender structure comply with organizational procurement policy?
- If public procurement rules apply: are mandatory sections, minimum notice periods and equal treatment provisions included?
- Are the evaluation criteria and weights proportionate and non-discriminatory?
- Are the Knock-out criteria justifiable and non-exclusionary of valid market participants?

Compliance issues are logged as Tender comments and must be resolved before approval.

---

### Activity 8 — Tender Approval

**Actor:** Project Owner, Procurement Manager  
**Command:** `ApproveTender`  
**Action:** The Project Owner reviews the complete Tender — structure, Requirements, Evaluation Model, terms, Supplier list — and approves it for publication.

The Procurement Manager co-approves for compliance.

**Tender state transition:** `Draft` → `Approved`

**Events produced:** `TenderApproved`

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP06-BR-001 | A Tender must contain at least one Requirement before it can be approved. |
| BP06-BR-002 | All Requirements in the Tender must be in `Approved` state at the time of Tender approval. |
| BP06-BR-003 | Evaluation Model group weights must sum to 100%. A Tender with weights that do not sum to 100% cannot be approved. |
| BP06-BR-004 | Each Requirement group must have at least one assigned Evaluator defined before the Evaluation can begin (this is configured in BP09, but the assignment model is defined here). |
| BP06-BR-005 | Knock-out Requirements must be documented in the Tender terms so Suppliers are aware of the automatic exclusion consequences. |
| BP06-BR-006 | The Tender invitation list must contain at least one Supplier before the Tender can be approved for publication. |
| GBR-009 | Only Approved Requirements may be included in a Tender. |
| GBR-010 | Requirement versions are frozen at Tender publication (not at Tender approval — the snapshot is taken at the point of publication). |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Transition | Trigger | Actor |
|---|---|---|
| `Draft` (created) | `CreateTender` | Project Manager |
| `Draft` → `Approved` | `ApproveTender` | Project Owner + Procurement Manager |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `TenderCreated` | `CreateTender` |
| `RequirementAddedToTender` | `AddRequirementToTender` |
| `EvaluationModelConfigured` | `ConfigureEvaluationModel` |
| `TenderTermsSet` | `SetTenderTerms` |
| `SupplierAddedToInvitationList` | `AddSupplierToInvitationList` |
| `TenderDocumentGenerated` | `GenerateTenderDocument` |
| `TenderApproved` | `ApproveTender` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Approved Tender | `Tender` | `Approved` |
| Evaluation Model | `Tender.evaluationModel` | Configured |
| Supplier invitation list | `Tender.invitationList[]` | Confirmed |
| Tender document (for review) | Document | Generated artifact |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| BP06 cycle time | Calendar days from all Requirements Approved to Tender Approved |
| Evaluation Model completeness | 100% of groups have weights summing to 100% at approval |
| Invitation list coverage | Number of invited Suppliers vs. known market participants |
| Tender document readability | Subjective review score from Procurement Manager compliance review |

---

## AI Guidance

AI may assist in BP06 by:
- Checking Evaluation Model weight consistency (group weights summing to 100%)
- Flagging Requirements without evaluation weight configuration
- Detecting Requirement groups with no Knock-out Requirements where they would normally be expected (e.g., security compliance for software)
- Suggesting Supplier candidates from CRM or organizational Supplier master based on project domain
- Generating a readable Tender document structure preview from the structured data
- Checking Tender terms for completeness against a configurable compliance template

AI must not:
- Approve the Tender
- Add or remove Requirements from the Tender
- Set Knock-out flags

---

## Anti-Patterns

- Adding Requirements to the Tender that are still in Draft state — violates GBR-009 and must be caught by the platform's approval validation.
- Configuring Evaluation Model weights informally (e.g., "everything is equal") — produces an Evaluation that does not reflect business priorities.
- Inviting only one Supplier to a Tender — unless a sole-source justification is documented, this undermines the competitive integrity of the process.
- Generating the Tender document first and editing it — the structured Tender Business Object is the source of truth; document edits that are not reflected in the structured data create a dangerous divergence.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-009, GBR-010, GBR-001
- [`02_Domain_Model/Requirement.md`](../02_Domain_Model/Requirement.md) — Requirement specification
- [BP04_Requirement_Engineering.md](./BP04_Requirement_Engineering.md) — Predecessor process
- [BP07_Publication.md](./BP07_Publication.md) — Next process
