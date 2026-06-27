---
id: PKB-01-005
title: Global Business Rules
version: 2.0
status: APPROVED
owner: Product Architecture
audience:
  - Business Architecture
  - Software Architecture
  - Developers
  - QA Engineers
  - AI Development Agents
depends_on:
  - PKB-00-MASTER
  - PKB-00-001
  - PKB-00-002
---

# Global Business Rules

## Purpose

This document defines the **global business rules** of the adtender platform — rules that apply universally across all domains and all business processes. These are platform invariants: they cannot be disabled by configuration, overridden by tenant settings, or bypassed by any actor, including System Administrators.

Process-specific business rules are defined in their respective BP documents using the pattern `BP{nn}-BR-{sequence}`. Domain-specific rules are defined in `02_Domain_Model/` documents using `{ObjectCode}-BR-{sequence}`. This document contains only rules that apply platform-wide.

Each rule carries: its identifier, scope, rationale, and implementation constraint for developers.

---

## Audit Rules

### GBR-001 — Universal Auditability

Every significant business action on the platform must produce an immutable audit record.

**Scope:** All domains, all Business Objects, all lifecycle transitions.

**Rationale:** Enterprise procurement and decision processes operate under legal, regulatory and internal governance requirements. The ability to reconstruct "who did what, when, and in what state" must exist for any Business Object at any time during and after its lifecycle.

**Implementation constraint:** Every Aggregate Root must maintain an append-only audit log from creation. Audit records capture: actor identity, action name, timestamp, previous state, new state, and contextual metadata. No application-level path may exist to delete or modify audit records.

---

### GBR-002 — Audit Record Immutability

Audit records must not be modifiable or deletable by any actor, including System Administrators.

**Scope:** All audit records across all domains.

**Implementation constraint:** Audit records are stored in an append-only store. The data model must not expose update or delete operations for audit records. Administrative access to audit records is read-only. All access to audit records is itself logged.

---

## Versioning Rules

### GBR-003 — Immutability of Approved and Published Versions

Business Object versions in `Approved` or `Published` state are immutable. Any change requires creating a new version.

**Scope:** Requirement, Tender, Evaluation Criteria, Decision, Knowledge Asset, Workflow Definition.

**Rationale:** A Supplier who responds to a Requirement must be evaluated against the same version they answered. If Requirements could be modified post-approval, the chain of evidence for evaluation and decision is broken and legally indefensible.

**Implementation constraint:** The domain layer must reject any mutation attempt on an Approved or Published Business Object version. The rejection produces a named domain error: `{ObjectType}VersionIsImmutable`. The only permitted action on an immutable version is creating a new version in Draft state.

---

### GBR-004 — Versioned References for Traceability

Where traceability is required, inter-aggregate references must use versioned identifiers.

**Scope:** SupplierResponse → Requirement (must reference `RequirementVersionId`), Evaluation score → Requirement (must reference `RequirementVersionId`), Evaluation score → SupplierResponse (must reference `SupplierResponseVersionId`).

**Implementation constraint:** Domain model documents specify which versioned identifier is required for each cross-aggregate reference. API contracts must expose and accept versioned identifiers wherever this rule applies.

---

## Knowledge and Data Rules

### GBR-005 — Knowledge Independence from Projects

Reusable knowledge must be stored independently of any project. A Project references knowledge; it does not own it.

**Scope:** Requirements, Requirement Libraries, Knowledge Assets, Templates.

**Rationale:** Knowledge stored only inside a project is inaccessible to future projects and effectively destroyed when the project is archived. Platform value grows only if organizational knowledge accumulates in governed, shared libraries.

**Implementation constraint:** Requirements used in a Project are referenced by `RequirementVersionId`, not embedded in the Project aggregate. Project-specific adaptations retain traceability to the source library version. The canonical library version is never moved into or mutated by the project.

---

### GBR-006 — Documents Are Secondary to Structured Data

Documents may be generated from Business Objects, attached as evidence, or used as data import sources. They must not be the primary record of business information.

**Scope:** All domains.

**Rationale:** See [ADR-002](../00_Product_DNA/ADR/ADR-002-knowledge-before-documents.md).

**Implementation constraint:** No feature may use a document as the definitive record of evaluation scores, decision rationale, approved requirements, or supplier responses. Where documents are generated, the underlying structured Business Objects must exist independently of the document.

---

## Project Rules

### GBR-007 — Single Project Owner

Every Project must have exactly one Project Owner at any point in its lifecycle.

**Implementation constraint:** The Project aggregate enforces that exactly one member holds the `ProjectOwner` role at any time. `TransferProjectOwnership` atomically removes the current owner and assigns the new one. A Project without an owner is an invalid state that the domain must prevent.

---

### GBR-008 — Project Belongs to One Organization

Every Project belongs to exactly one Organization (tenant) and is immutably bound to it.

**Implementation constraint:** `Project.organizationId` is set at creation and is immutable. All data associated with a Project is isolated within the tenant boundary. Cross-tenant access to Project data is prohibited at the data layer.

---

## Tender Rules

### GBR-009 — Approved Requirements Only in Published Tenders

A Tender may only be published if all referenced Requirements are in `Approved` state.

**Rationale:** Publishing a Tender with Draft Requirements communicates unvalidated content to Suppliers, creating quality risk and potential legal uncertainty.

**Implementation constraint:** The `PublishTender` command validates that all referenced Requirement versions are in `Approved` state. If any Requirement is not Approved, the command is rejected with error `TenderContainsDraftRequirements`, listing the offending Requirement IDs.

---

### GBR-010 — Requirement Version Freeze at Publication

When a Tender is published, the included Requirement versions are frozen as an immutable snapshot.

**Implementation constraint:** Tender publication captures a `TenderRequirementSnapshot` containing all `RequirementVersionId` values at publication time. Subsequent changes to Requirements in Requirement Management do not affect the published Tender. Changes to a published Tender require a formal amendment process producing a new Tender version.

---

## Supplier Response Rules

### GBR-011 — Supplier Responses Reference Published Requirement Versions

A Supplier Response must reference the specific published Requirement version from the Tender it responds to.

**Implementation constraint:** `SupplierResponseItem.requirementVersionId` is mandatory and must match a `RequirementVersionId` in the Tender's published snapshot. The API rejects a response that references a version not in the published Tender.

---

### GBR-012 — Submission Deadline Enforcement

A Supplier Response may not be submitted after the submission deadline defined in the published Tender.

**Implementation constraint:** The `SubmitSupplierResponse` command validates the submission timestamp against `Tender.submissionDeadline`. If the deadline has passed, the command is rejected with error `SubmissionDeadlineExpired`. Deadline enforcement occurs in the domain layer. Extensions require a formal Tender amendment.

---

## Evaluation Rules

### GBR-013 — Blind Evaluation

Evaluators must not have visibility into other Evaluators' scores during the individual evaluation phase.

**Rationale:** Cross-evaluator visibility before score submission introduces bias and compromises evaluation integrity and defensibility.

**Implementation constraint:** The Evaluation aggregate tracks its phase. During `InProgress` state, the API returns only an Evaluator's own scores. Score visibility for all Evaluators opens only when the Evaluation moves to `UnderReview` state after individual evaluation is complete. This is enforced at the API and data layer.

---

### GBR-014 — Knock-out Criterion Enforcement

A Supplier whose response does not fulfill a Knock-out Criterion is automatically excluded from the Evaluation.

**Rationale:** Knock-out criteria represent absolute minimum standards. Non-fulfillment is disqualifying regardless of scores on other Requirements.

**Implementation constraint:** The Evaluation domain enforces Knock-out exclusion as a domain rule during consolidation. Exclusion is recorded as a domain event `KnockoutApplied` with the specific Knock-out Requirement reference. Excluded Suppliers remain visible in the Evaluation result with the exclusion reason stated.

---

## Decision Rules

### GBR-015 — Decision Requires Completed Evaluation

A Decision may not be created without a Completed Evaluation as its prerequisite.

**Implementation constraint:** The `CreateDecision` command validates that the referenced Evaluation is in `Completed` state. Evaluations in any other state are not valid Decision prerequisites.

---

### GBR-016 — Decision Requires Decision Board Approval

A Decision must be explicitly approved by the Decision Board before Contract Handover may begin.

**Implementation constraint:** The `ApproveDecision` command is restricted to actors holding the `DecisionBoard` role on the Project. The BP12 workflow entry condition validates that the Decision is in `Approved` state. No Contract Handover action may proceed without this gateway.

---

### GBR-017 — Decision Immutability After Approval

A Decision is immutable after approval.

**Implementation constraint:** After `ApproveDecision`, the Decision aggregate rejects all mutation commands. Changes require creating a new Decision version with an explicit reference to the superseded decision and a stated reason.

---

## Project Lifecycle Rules

### GBR-018 — Lessons Learned Is Mandatory on Project Close

Project closure must trigger the Lessons Learned workflow. A Project cannot reach `Archived` state without a completed Lessons Learned record.

**Rationale:** The organizational knowledge flywheel depends on experience being captured from every project. Making this mandatory prevents the pattern of closing projects without transferring institutional learning.

**Implementation constraint:** The `CloseProject` command triggers the Lessons Learned workflow. The `ArchiveProject` command validates that a Lessons Learned record for this Project exists in `Completed` state. If not, `ArchiveProject` is rejected with error `LessonsLearnedRequired`.

---

## AI Rules

### GBR-019 — AI as Advisory Only

AI recommendations must not be applied to Business Objects without explicit human confirmation.

**Scope:** All domains, all AI-assisted operations.

**Rationale:** See [ADR-005](../00_Product_DNA/ADR/ADR-005-human-in-the-loop-ai.md).

**Implementation constraint:** No AI process may invoke a domain command that produces a state change without a human actor confirming the action. The human actor's identity is recorded as the actor for the confirmed domain action. The AI suggestion is logged separately.

---

### GBR-020 — AI Interaction Logging

All AI interactions with platform data must be logged with sufficient context to reconstruct what the AI was asked, what data it accessed, and what it produced.

**Implementation constraint:** AI interaction logs capture: AI model identifier, input context (source Business Object references), output (suggestion or analysis), invocation timestamp, and disposition (accepted/modified/rejected by the human actor). AI interaction logs are part of the audit trail and must not be deletable.

---

## Security and Data Isolation Rules

### GBR-021 — Tenant Data Isolation

No actor within one tenant may access, query or influence Business Objects belonging to another tenant.

**Implementation constraint:** Tenant isolation is enforced at the data layer. Repository queries include the tenant identifier as a mandatory filter applied at the repository level, not as an optional application-level condition.

---

### GBR-022 — Deletion Prohibition for Governance-Relevant Objects

Business Objects in `Approved`, `Published`, `Completed` or `Archived` state must not be deletable.

**Rationale:** Deletion of governance-relevant data removes the ability to reconstruct historical decision context, which may be required for audit, legal discovery or regulatory review years after the project closes.

**Implementation constraint:** Delete operations on Business Objects validate lifecycle state. An attempt to delete an object in a protected state is rejected with error `{ObjectType}CannotBeDeleted`. Archiving is the correct end-of-life action.

---

## References

- [`Product_Principles.md`](../00_Product_DNA/Product_Principles.md) — Principles grounding these rules
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — Architectural enforcement of these rules
- [`ADR-002`](../00_Product_DNA/ADR/ADR-002-knowledge-before-documents.md) — Grounds GBR-006
- [`ADR-005`](../00_Product_DNA/ADR/ADR-005-human-in-the-loop-ai.md) — Grounds GBR-019, GBR-020
- [`02_Domain_Model/`](../02_Domain_Model/) — Domain-specific business rules
