---
id: PKB-02-010
title: Aggregate Relationships — adtender Platform
version: 1.1
status: APPROVED
owner: Domain Architecture
audience:
  - Software Architect
  - Developer
  - AI Development Agent
depends_on:
  - PKB-00-MASTER
  - PKB-00-003
  - PKB-02-000
tags:
  - aggregate-relationships
  - ddd
  - architecture
  - references
---

# Aggregate Relationships — adtender Platform

> This document catalogs every relationship between Aggregate Roots in the adtender domain model. For the aggregate ownership map, see [Domain_Model_Overview.md](./Domain_Model_Overview.md). For bounded context integration contracts, see [Bounded_Contexts.md](./Bounded_Contexts.md).

---

## Table of Contents

1. [Relationship Types](#1-relationship-types)
2. [Relationship Catalog](#2-relationship-catalog)
3. [Immutability Constraints](#3-immutability-constraints)
4. [Cross-Supplier Isolation Constraints](#4-cross-supplier-isolation-constraints)
5. [Versioned Reference Requirements](#5-versioned-reference-requirements)
6. [Cardinality Summary](#6-cardinality-summary)
7. [Prohibited Relationships](#7-prohibited-relationships)

---

## 1. Relationship Types

All aggregate-to-aggregate relationships in adtender are **reference relationships**, not ownership relationships. An aggregate never directly contains another aggregate. The reference types are:

| Type | Description | Example |
|---|---|---|
| **ID Reference** | References another aggregate by plain, stable ID | `SupplierResponse.tenderId` → `Tender.id` |
| **Versioned ID Reference** | References a specific immutable version of another aggregate | `SupplierResponse.responseItems[].requirementVersionId` |
| **Event Integration** | One aggregate triggers creation or state change of another via domain event | `EvaluationsLocked` → `ConsolidatedEvaluation` creation |
| **Synchronous Cross-Context Read** | One context reads display content from another via public API | Evaluation Management reads ResponseItems via SM API |
| **Lifecycle Gate** | One aggregate's state is a hard precondition for another aggregate's command | `LessonsLearnedRecord.status == Submitted` before `ArchiveProject` |

**Rule:** No relationship type other than the five above is permitted. Aggregates must never embed content from another aggregate, hold a direct object reference, or access another context's data store.

---

## 2. Relationship Catalog

### 2.1 Project → Tender

| Property | Value |
|---|---|
| **Source** | `Project` (PM) |
| **Target** | `Tender` (TM) |
| **Type** | ID Reference (via `Tender.projectId`) + Event Integration |
| **Cardinality** | 1 Project : many Tenders |
| **Direction** | Bidirectional via events |
| **Consistency** | Eventual |
| **Reference Field** | `Tender.projectId` (Tender holds the reference, not Project) |
| **Business Rule** | PROJ-BR-003: Every Tender belongs to one Project |
| **Events** | `TenderCreated` (TM → PM reference), `TenderAwarded` (TM → PM phase update) |
| **Notes** | Project does not store `tenderIds[]`. The relationship is navigated via `Tender Management API: getTendersForProject(projectId)`. |

---

### 2.2 Project → LessonsLearnedRecord

| Property | Value |
|---|---|
| **Source** | `Project` (PM) |
| **Target** | `LessonsLearnedRecord` (KM) |
| **Type** | Event Integration + Lifecycle Gate |
| **Cardinality** | 1 Project : 1 LessonsLearnedRecord (mandatory) |
| **Direction** | PM triggers KM creation; KM status gates PM archiving |
| **Consistency** | Strong (archiving gate), Eventual (record initiation) |
| **Reference Field** | `LessonsLearnedRecord.projectId` |
| **Business Rule** | GBR-018 (mandatory), PROJ-BR-005 |
| **Events** | `ProjectClosed` (PM → KM): initiates record creation |
| **Gate** | `ArchiveProject` reads `LessonsLearnedRecord.status` via KM API before executing |
| **Notes** | This is the only intentional synchronous cross-context state dependency in the domain model. It is enforced at the PM Application Service layer, not inside the Project aggregate. |

---

### 2.3 Requirement → RequirementLibrary

| Property | Value |
|---|---|
| **Source** | `Requirement` (RM) |
| **Target** | `RequirementLibrary` (RM) |
| **Type** | ID Reference (within same bounded context) |
| **Cardinality** | Many Requirements : many Libraries (M:N) |
| **Direction** | Bidirectional within RM |
| **Consistency** | Strong |
| **Reference Field** | `Requirement.libraryAssignments[].libraryId` |
| **Business Rule** | REQ-BR-005: A Requirement may belong to multiple Libraries |
| **Notes** | Both aggregates are in the same bounded context (RM). Cross-aggregate consistency is managed within the RM transaction boundary. |

---

### 2.4 Tender → Requirement

| Property | Value |
|---|---|
| **Source** | `Tender` (TM) |
| **Target** | `Requirement` (RM) |
| **Type** | Versioned ID Reference (frozen snapshot) |
| **Cardinality** | 1 Tender : many RequirementVersionIds |
| **Direction** | Unidirectional (TM → RM) |
| **Consistency** | Strong at publication (snapshot frozen); Eventual for display reads |
| **Reference Field** | `Tender.tenderRequirementSnapshot.requirementVersionIds[]` |
| **Business Rule** | GBR-009 (only Approved versions may be included), GBR-010 (versions frozen at publication) |
| **Integration** | Synchronous: TM reads Requirement content from RM API for display only; snapshot is ID-only |
| **Notes** | After publication the snapshot is immutable. Requirement changes after publication do not affect the Tender's requirement set. All downstream aggregates (SupplierResponse, Evaluation) use the same frozen `requirementVersionId` set. |

---

### 2.5 SupplierResponse → Tender

| Property | Value |
|---|---|
| **Source** | `SupplierResponse` (SM) |
| **Target** | `Tender` (TM) |
| **Type** | ID Reference + Synchronous Cross-Context Read (at creation) |
| **Cardinality** | Many SupplierResponses : 1 Tender (one per Supplier) |
| **Direction** | Unidirectional (SM → TM) |
| **Consistency** | Eventual (SupplierResponse created after `TenderPublished` event) |
| **Reference Field** | `SupplierResponse.tenderId` |
| **Business Rule** | GBR-012: Submission deadline from Tender is binding; one SupplierResponse per Supplier per Tender |
| **Integration** | SM reads Tender snapshot (RequirementVersionIds, response types) via TM API at SupplierResponse creation |
| **Notes** | The unique constraint (one response per Supplier per Tender) is enforced at the Repository level in SM. |

---

### 2.6 SupplierResponse → Requirement

| Property | Value |
|---|---|
| **Source** | `SupplierResponse` (SM) |
| **Target** | `Requirement` (RM) |
| **Type** | Versioned ID Reference |
| **Cardinality** | 1 SupplierResponse : many ResponseItems (one per RequirementVersionId in snapshot) |
| **Direction** | Unidirectional (SM → RM) |
| **Consistency** | Strong (reference established at SupplierResponse creation from Tender snapshot) |
| **Reference Field** | `SupplierResponse.responseItems[].requirementVersionId` |
| **Business Rule** | GBR-011: SupplierResponse references `RequirementVersionId`, not `RequirementId` |
| **Notes** | `requirementVersionId` values come from the Tender snapshot. SM never queries RM directly; the version IDs are already embedded in the Tender snapshot data read at creation. |

---

### 2.7 SupplierResponse → SupplierProfile

| Property | Value |
|---|---|
| **Source** | `SupplierResponse` (SM) |
| **Target** | `SupplierProfile` (OM) |
| **Type** | ID Reference |
| **Cardinality** | Many SupplierResponses : 1 SupplierProfile |
| **Direction** | Unidirectional (SM → OM) |
| **Consistency** | Strong |
| **Reference Field** | `SupplierResponse.supplierId` |
| **Business Rule** | Cross-Supplier visibility prohibition enforced at tenant + supplierId level |
| **Notes** | `SupplierProfile` (OM) is the Supplier's organizational identity. `SupplierResponse` (SM) is the Supplier's tender response. These are distinct aggregates in separate contexts. |

---

### 2.8 Evaluation → Tender

| Property | Value |
|---|---|
| **Source** | `Evaluation` (EM) |
| **Target** | `Tender` (TM) |
| **Type** | ID Reference |
| **Cardinality** | Many Evaluations : 1 Tender (one per Evaluator) |
| **Direction** | Unidirectional (EM → TM) |
| **Consistency** | Eventual (Evaluation created after `SubmissionPeriodClosed` event) |
| **Reference Field** | `Evaluation.tenderId` |
| **Business Rule** | One Evaluation per Evaluator per Tender; uniqueness enforced at Repository level |
| **Notes** | EM reads EvaluationModel weights from TM API at ConsolidatedEvaluation computation time. |

---

### 2.9 Evaluation → Requirement

| Property | Value |
|---|---|
| **Source** | `Evaluation` (EM) |
| **Target** | `Requirement` (RM) |
| **Type** | Versioned ID Reference |
| **Cardinality** | 1 Evaluation : many Scores (one per RequirementVersionId × SupplierId pair) |
| **Direction** | Unidirectional (EM → RM) |
| **Consistency** | Strong (Score references exact version) |
| **Reference Field** | `Evaluation.scores[].requirementVersionId` |
| **Business Rule** | Evaluation score must reference the same `requirementVersionId` as the SupplierResponse ResponseItem |
| **Notes** | Ensures every score is traceable to the exact Requirement version the Supplier answered. Enables decision traceability (GBR-015). |

---

### 2.10 Evaluation → SupplierResponse

| Property | Value |
|---|---|
| **Source** | `Evaluation` (EM) |
| **Target** | `SupplierResponse` (SM) |
| **Type** | Synchronous Cross-Context Read |
| **Cardinality** | Each Evaluator reads all relevant SupplierResponses for their Tender |
| **Direction** | Unidirectional read (EM → SM) |
| **Consistency** | Read-only; only Locked SupplierResponses are readable by EM |
| **Reference Field** | `SupplierResponse.id` referenced in Evaluator workspace |
| **Business Rule** | GBR-013 enforced at Repository query layer |
| **Integration** | EM reads via SM API; SM enforces cross-Supplier isolation |
| **Notes** | GBR-013 blind scoring: an Evaluator's workspace shows only the ResponseItem content they need to score. The SM API must not reveal other Evaluators' scores or cross-Supplier Response data in a single call. |

---

### 2.11 ConsolidatedEvaluation → Evaluation

| Property | Value |
|---|---|
| **Source** | `ConsolidatedEvaluation` (EM) |
| **Target** | `Evaluation` (EM) |
| **Type** | Event Integration + ID Reference (within same bounded context) |
| **Cardinality** | 1 ConsolidatedEvaluation : many Evaluations |
| **Direction** | Unidirectional read (CE reads from E after gate) |
| **Consistency** | Strong (CE created only after all Evaluations are Locked — EVL-BR-011) |
| **Reference Field** | `ConsolidatedEvaluation.evaluationIds[]` |
| **Business Rule** | EVL-BR-011: ConsolidatedEvaluation is platform-computed; no manual score override |
| **Events** | `EvaluationsLocked` event triggers CE creation |
| **Notes** | Both aggregates are in the same bounded context (EM). CE reads all Evaluation scores only after the `AllEvaluationsLocked` gate fires. |

---

### 2.12 ConsolidatedEvaluation → Tender

| Property | Value |
|---|---|
| **Source** | `ConsolidatedEvaluation` (EM) |
| **Target** | `Tender` (TM) |
| **Type** | ID Reference + Synchronous Cross-Context Read (at computation time) |
| **Cardinality** | 1 ConsolidatedEvaluation : 1 Tender |
| **Direction** | Unidirectional (EM → TM) |
| **Consistency** | Read at computation time; weights read once and applied |
| **Reference Field** | `ConsolidatedEvaluation.tenderId` |
| **Business Rule** | CE uses EvaluationModel weights from the Tender to compute weighted scores |
| **Notes** | EvaluationModel weights must be read at score computation time through the TM API. |

---

### 2.13 Decision → ConsolidatedEvaluation

| Property | Value |
|---|---|
| **Source** | `Decision` (DM) |
| **Target** | `ConsolidatedEvaluation` (EM) |
| **Type** | Versioned ID Reference + Lifecycle Gate |
| **Cardinality** | 1 Decision : 1 ConsolidatedEvaluation (per procurement) |
| **Direction** | Unidirectional (DM → EM) |
| **Consistency** | Strong (Decision cannot progress without Approved CE Report — GBR-015) |
| **Reference Field** | `Decision.consolidatedEvaluationReportId` |
| **Business Rule** | GBR-015: Decision must be based on Approved ConsolidatedEvaluationReport |
| **Events** | `ConsolidatedEvaluationReportApproved` enables `PrepareDecisionSession` |
| **Notes** | The reference is to `ConsolidatedEvaluationReportId` (not `ConsolidatedEvaluationId`) — the specific approved version of the report. DM reads report content via EM API. |

---

### 2.14 Decision → Tender

| Property | Value |
|---|---|
| **Source** | `Decision` (DM) |
| **Target** | `Tender` (TM) |
| **Type** | ID Reference |
| **Cardinality** | 1 Decision : 1 Tender (one decision per procurement) |
| **Direction** | Unidirectional (DM → TM) |
| **Consistency** | Strong |
| **Reference Field** | `Decision.tenderId` |
| **Business Rule** | Decision scope is always bounded to a specific Tender |
| **Notes** | `DecisionApproved` event triggers TM to initiate BP12 (standstill/handover). |

---

### 2.15 LessonsLearnedRecord → Project

| Property | Value |
|---|---|
| **Source** | `LessonsLearnedRecord` (KM) |
| **Target** | `Project` (PM) |
| **Type** | ID Reference + Lifecycle Gate |
| **Cardinality** | 1 LessonsLearnedRecord : 1 Project |
| **Direction** | Bidirectional: LLR references Project; Project checks LLR status before archiving |
| **Consistency** | Strong (archiving gate) |
| **Reference Field** | `LessonsLearnedRecord.projectId` |
| **Business Rule** | GBR-018: Mandatory for all closed projects |
| **Notes** | See 2.2 for full bidirectional lifecycle dependency detail. |

---

### 2.16 LessonsLearnedRecord → Requirement

| Property | Value |
|---|---|
| **Source** | `LessonsLearnedRecord` (KM) |
| **Target** | `Requirement` (RM) |
| **Type** | ID Reference |
| **Cardinality** | 1 LessonsLearnedRecord : many RequirementLessons |
| **Direction** | Unidirectional (KM → RM) |
| **Consistency** | Eventual (reference established during LLR authoring) |
| **Reference Field** | `LessonsLearnedRecord.requirementLessons[].requirementId` |
| **Business Rule** | LLR-BR-002: Every lesson must reference a specific Business Object |
| **Notes** | References `RequirementId` (not `RequirementVersionId`) — the lesson is about the Requirement concept across its lifetime, not a pinned version. This is an intentional design distinction from the Tender/SupplierResponse/Evaluation versioned references. |

---

### 2.17 LessonsLearnedRecord → Evaluation (anomaly read)

| Property | Value |
|---|---|
| **Source** | `LessonsLearnedRecord` (KM) |
| **Target** | `Evaluation` / `ConsolidatedEvaluation` (EM) |
| **Type** | Synchronous Cross-Context Read |
| **Cardinality** | 1 LessonsLearnedRecord reads from all Evaluations for its project |
| **Direction** | Unidirectional read (KM → EM) |
| **Consistency** | Read-only at LLR session preparation |
| **Business Rule** | EvaluationLesson and anomaly data feed LLR quality |
| **Notes** | Read-only. LLR never writes to EM. |

---

### 2.18 KnowledgeAsset → KnowledgeAsset (version chain)

| Property | Value |
|---|---|
| **Source** | `KnowledgeAsset` (KM) |
| **Target** | `KnowledgeAsset` (KM) |
| **Type** | Versioned ID Reference (within same bounded context) |
| **Cardinality** | 1 KnowledgeAsset version : 1 previous version (chain) |
| **Direction** | Unidirectional (new version → previous version) |
| **Consistency** | Strong |
| **Reference Field** | `KnowledgeAsset.previousVersionId` |
| **Business Rule** | GBR-003: Published versions immutable; mutation creates new aggregate instance |
| **Notes** | The version chain represents the evolution of organizational knowledge. Each version is a distinct aggregate instance; the chain enables navigation of the knowledge history. |

---

### 2.19 KnowledgeAsset → Requirement (optional)

| Property | Value |
|---|---|
| **Source** | `KnowledgeAsset` (KM) |
| **Target** | `Requirement` (RM) |
| **Type** | ID Reference (optional) |
| **Cardinality** | 1 KnowledgeAsset : 0–many Requirements |
| **Direction** | Unidirectional (KM → RM) |
| **Consistency** | Eventual |
| **Reference Field** | `KnowledgeAsset.relatedRequirementIds[]` |
| **Business Rule** | KnowledgeAsset may document provenance or relationships to specific Requirements |
| **Notes** | Optional. Not all KnowledgeAssets reference Requirements. The reference is informational, not a lifecycle gate. |

---

### 2.20 User → Tenant

| Property | Value |
|---|---|
| **Source** | `User` (OM) |
| **Target** | `Tenant` (OM) |
| **Type** | ID Reference |
| **Cardinality** | Many Users : 1 Tenant |
| **Direction** | Unidirectional (User → Tenant) |
| **Consistency** | Strong (resolved at login) |
| **Reference Field** | `User.tenantId` |
| **Business Rule** | USR-BR-001: A User belongs to exactly one Tenant; USR-BR-002: TenantId set at invitation and immutable |
| **Notes** | TenantId on User is the root scoping criterion for all User-initiated actions. All domain operations performed by the User inherit this TenantId. |

---

### 2.21 User → Organization

| Property | Value |
|---|---|
| **Source** | `User` (OM) |
| **Target** | `Organization` (OM) |
| **Type** | ID Reference |
| **Cardinality** | Many Users : 1 Organization |
| **Direction** | Unidirectional (User → Organization) |
| **Consistency** | Strong |
| **Reference Field** | `User.organizationId` |
| **Business Rule** | USR-BR-001: A User belongs to exactly one Organization (via its Tenant) |
| **Notes** | Organization and Tenant are 1:1 (ORG-BR-001). The User's `organizationId` and `tenantId` co-navigate to the same Tenant boundary. |

---

### 2.22 Organization → Tenant (provisioning)

| Property | Value |
|---|---|
| **Source** | `Organization` (OM) |
| **Target** | `Tenant` (OM) |
| **Type** | Lifecycle Gate + ID Reference |
| **Cardinality** | 1 Organization : 1 Tenant |
| **Direction** | Unidirectional (Organization triggers Tenant lifecycle) |
| **Consistency** | Strong |
| **Reference Field** | `Organization.tenantId` |
| **Business Rule** | ORG-BR-001: Every Organization has exactly one Tenant; ORG-BR-006: Organization creation automatically provisions Tenant; TNT-BR-005: Tenant provisioning triggered by Organization creation |
| **Notes** | Tenant lifecycle is driven entirely by Organization lifecycle (Registering → Provisioning, Active → Active, Suspended → Suspended, Archived → Archived). Organization commands trigger corresponding Tenant commands at the infrastructure layer. This is the only aggregate relationship where one aggregate's creation triggers another aggregate's creation. |

---

### 2.23 SupplierProfile → Tenant

| Property | Value |
|---|---|
| **Source** | `SupplierProfile` (OM) |
| **Target** | `Tenant` (OM) |
| **Type** | ID Reference |
| **Cardinality** | Many SupplierProfiles : 1 Tenant |
| **Direction** | Unidirectional (SupplierProfile → Tenant) |
| **Consistency** | Strong (enforced at creation) |
| **Reference Field** | `SupplierProfile.tenantId` |
| **Business Rule** | SPR-BR-001: A SupplierProfile belongs to one Buyer's Tenant; GBR-021 enforced |
| **Notes** | The same Supplier company may have independent SupplierProfiles in multiple Buyer tenants (SPR-BR-002). Each is a fully isolated record. There is no cross-tenant Supplier identity. |

---

### 2.24 Tender → SupplierProfile (InvitationList)

| Property | Value |
|---|---|
| **Source** | `Tender` (TM) |
| **Target** | `SupplierProfile` (OM) |
| **Type** | ID Reference (with Lifecycle Gate precondition) |
| **Cardinality** | 1 Tender : many SupplierProfiles |
| **Direction** | Unidirectional (TM → OM) |
| **Consistency** | Eventual (OM qualification status checked at invitation time) |
| **Reference Field** | `Tender.invitationList[].supplierProfileId` |
| **Business Rule** | SPR-BR-003: Only `Qualified` SupplierProfiles may be added to a Tender's InvitationList |
| **Notes** | The Tender Management Application Service queries the OM API to verify `Qualified` status before adding a Supplier to an InvitationList. If a SupplierProfile is suspended after invitation, the existing invitation is not automatically removed — this requires a Procurement Manager decision. |

---

### 2.25 SupplierResponse → SupplierProfile

| Property | Value |
|---|---|
| **Source** | `SupplierResponse` (SM) |
| **Target** | `SupplierProfile` (OM) |
| **Type** | ID Reference |
| **Cardinality** | Many SupplierResponses : 1 SupplierProfile |
| **Direction** | Unidirectional (SM → OM) |
| **Consistency** | Eventual (SupplierProfile identity resolvable at read time) |
| **Reference Field** | `SupplierResponse.supplierId` |
| **Business Rule** | SPR-BR-006: Archived SupplierProfiles remain resolvable for audit purposes |
| **Notes** | This relationship creates the long-lived audit trail from procurement response to Supplier identity. SupplierResponse retains `supplierId` even if the SupplierProfile is later archived. |

---

### 2.26 Decision → SupplierProfile

| Property | Value |
|---|---|
| **Source** | `Decision` (DM) |
| **Target** | `SupplierProfile` (OM) |
| **Type** | ID Reference |
| **Cardinality** | 1 Decision : 1 awarded SupplierProfile; 1 Decision : many COI-declared SupplierProfiles |
| **Direction** | Unidirectional (DM → OM) |
| **Consistency** | Eventual |
| **Reference Fields** | `Decision.outcome.awardedSupplierId`; `Decision.boardMembers[].coiDeclarations[].supplierId` |
| **Business Rule** | GBR-016: Decision Board members declare COI before accessing Supplier data; GBR-017: Approved Decision Records are immutable |
| **Notes** | Both references are frozen once the Decision is Approved (GBR-017). The COI declarations reference individual SupplierProfileIds to enable selective data hiding per board member. |

---

### 2.27 RequirementLibrary → Requirement (M:N via LibraryEntry)

| Property | Value |
|---|---|
| **Source** | `RequirementLibrary` (RM) |
| **Target** | `Requirement` (RM) |
| **Type** | Versioned ID Reference (via `LibraryEntry` entity) |
| **Cardinality** | Many RequirementLibraries : Many Requirements |
| **Direction** | Unidirectional (RequirementLibrary → Requirement version) |
| **Consistency** | Strong (within RM context) |
| **Reference Field** | `LibraryEntry.requirementVersionId` |
| **Business Rule** | LIB-BR-002: Only `Approved` Requirements may be added; LIB-BR-007: A Requirement may belong to multiple libraries; GBR-003: RequirementVersionId references a specific immutable version |
| **Notes** | The `LibraryEntry` entity joins library membership to a specific approved version. When the Library Manager updates an entry to a newer version, the old version remains accessible through its own `RequirementVersionId`. This is the versioned-reference pattern applied at the library layer. |

---

### 2.28 RequirementLibrary → Tenant

| Property | Value |
|---|---|
| **Source** | `RequirementLibrary` (RM) |
| **Target** | `Tenant` (OM) |
| **Type** | ID Reference |
| **Cardinality** | Many RequirementLibraries : 1 Tenant |
| **Direction** | Unidirectional (RequirementLibrary → Tenant) |
| **Consistency** | Strong (enforced at creation) |
| **Reference Field** | `RequirementLibrary.tenantId` |
| **Business Rule** | LIB-BR-001: A RequirementLibrary is an organizational asset with no cross-tenant scope; GBR-021 enforced |
| **Notes** | Library discovery for Projects and Tenders is always scoped to the authenticated User's Tenant. Library visibility settings (OrganizationWide, DepartmentScoped, TeamPrivate) further restrict discoverability within the Tenant. |

---

### 2.29 UserId attribution across all aggregates

| Property | Value |
|---|---|
| **Source** | All domain aggregates (PM, RM, TM, SM, EM, DM, KM) |
| **Target** | `User` (OM) |
| **Type** | ID Reference (attribution pattern) |
| **Cardinality** | Many aggregates : many Users |
| **Direction** | Unidirectional (domain aggregates → OM) |
| **Consistency** | Eventual (identity resolvable at display time) |
| **Reference Pattern** | `*.createdBy`, `*.updatedBy`, `*.assignedTo`, `*.reviewedBy`, `*.approvedBy`, `*.evaluatorId`, `*.boardMembers[].userId` |
| **Business Rule** | GBR-001: All actions auditable; USR-BR-003: Deactivated Users retain identity for audit resolution; USR-BR-006: Suspended/Deactivated Users may not initiate new actions |
| **Notes** | UserId is the attribution anchor for the entire platform. Every command that modifies domain state captures the `UserId` of the actor. `UserId` references are never removed from audit records even after User deactivation. This relationship is not a direct aggregate dependency — it is an attribution pattern enforced at the Application Service layer. |

---

## 3. Immutability Constraints

The following relationship references are **frozen** once the source aggregate reaches a specific state. Mutation attempts must be rejected at the domain level.

| Relationship | Frozen at State | Why |
|---|---|---|
| `Tender.tenderRequirementSnapshot.requirementVersionIds[]` | `Tender.Published` | Suppliers must respond to a stable, fixed set of requirements (GBR-010) |
| `SupplierResponse.responseItems[].requirementVersionId` | `SupplierResponse.Submitted` | Response must remain permanently traceable to exact criteria answered (GBR-011) |
| `Decision.consolidatedEvaluationReportId` | `Decision.Approved` | Approved Decision Record references specific approved report; immutable (GBR-017) |
| `ConsolidatedEvaluation.evaluationIds[]` | `ConsolidatedEvaluation.Created` | CE is created from a fixed set of Locked Evaluations; adding/removing would invalidate scores |

---

## 4. Cross-Supplier Isolation Constraints

The following relationships carry explicit cross-Supplier isolation requirements. Violating these is a security and compliance defect.

| Relationship | Isolation Requirement | Enforcement Layer |
|---|---|---|
| Evaluation reads SupplierResponse (2.10) | An Evaluator may not read SupplierResponse data belonging to a different Supplier in the same query | SM API + EM Repository query layer |
| ConsolidatedEvaluation score reveal | Individual Evaluator scores must not be visible until all Evaluations for the Tender are Locked (GBR-013) | EM Repository query layer (not just API) |
| Decision Board access to CE Report | A Board member with declared COI against Supplier X must not receive CE Report data for Supplier X | DM Application Service (AP-014) |

---

## 5. Versioned Reference Requirements

The following references **must** use versioned identifiers. Using plain IDs is an architectural violation (GBR-010, GBR-011).

| Source | Reference | Must Use | Must Not Use | Reason |
|---|---|---|---|---|
| `Tender` → `Requirement` | `tenderRequirementSnapshot.requirementVersionIds[]` | `RequirementVersionId` | `RequirementId` | Snapshot must be pinned to exact version at publication |
| `SupplierResponse` → `Requirement` | `responseItems[].requirementVersionId` | `RequirementVersionId` | `RequirementId` | Response must be traceable to exact requirement version answered |
| `Evaluation` → `Requirement` | `scores[].requirementVersionId` | `RequirementVersionId` | `RequirementId` | Score must reference same version as the ResponseItem scored |
| `Decision` → `ConsolidatedEvaluation` | `consolidatedEvaluationReportId` | Report-level ID | `ConsolidatedEvaluationId` | Decision references the approved report, not the parent aggregate |
| `KnowledgeAsset` version chain | `previousVersionId` | `KnowledgeAssetVersionId` | `KnowledgeAssetId` | Version chain navigates specific immutable versions |

**When a plain ID is correct:**
Use plain `ID` when the reference navigates to the current state of a stable, non-versioned concept — for example, `Tender.projectId` (a Tender always belongs to the same Project) or `SupplierResponse.tenderId` (a response always belongs to the same Tender).

---

## 6. Cardinality Summary

| Source | Target | Cardinality |
|---|---|---|
| `Project` | `Tender` | 1 : many |
| `Project` | `LessonsLearnedRecord` | 1 : 1 (mandatory per GBR-018) |
| `Requirement` | `RequirementLibrary` | many : many |
| `Tender` | `Requirement` (versions) | 1 : many (frozen snapshot) |
| `Tender` | `SupplierResponse` | 1 : many (one per Supplier) |
| `Tender` | `Evaluation` | 1 : many (one per Evaluator) |
| `Tender` | `ConsolidatedEvaluation` | 1 : 1 |
| `Tender` | `Decision` | 1 : 1 (per procurement) |
| `SupplierResponse` | `Requirement` (versions) | 1 : many (one per snapshot version) |
| `SupplierResponse` | `SupplierProfile` | many : 1 |
| `Evaluation` | `SupplierResponse` | many : many (read-only at scoring) |
| `ConsolidatedEvaluation` | `Evaluation` | 1 : many |
| `Decision` | `ConsolidatedEvaluation` (report) | 1 : 1 |
| `Decision` | `Tender` | 1 : 1 |
| `LessonsLearnedRecord` | `Project` | 1 : 1 |
| `LessonsLearnedRecord` | `Requirement` (lessons) | 1 : many |
| `KnowledgeAsset` | `KnowledgeAsset` (version chain) | 1 : 1 per version |
| `User` | `Tenant` | many : 1 |
| `User` | `Organization` | many : 1 |
| `Organization` | `Tenant` | 1 : 1 (provisioning) |
| `SupplierProfile` | `Tenant` | many : 1 |
| `Tender` | `SupplierProfile` (invitation) | many : many |
| `SupplierResponse` | `SupplierProfile` | many : 1 |
| `Decision` | `SupplierProfile` (award + COI) | 1 : 1 (award); 1 : many (COI) |
| `RequirementLibrary` | `Requirement` (version) | many : many |
| `RequirementLibrary` | `Tenant` | many : 1 |

---

## 7. Prohibited Relationships

The following relationships are explicitly prohibited by the platform's architecture and business rules. Any implementation of these is an architectural defect.

| Prohibited Pattern | Reason | Required Alternative |
|---|---|---|
| `SupplierResponse` as child entity of `Requirement` | Violates aggregate isolation; Requirement must not own response data | SupplierResponse is its own aggregate in SM; references `RequirementVersionId` |
| `Evaluation.score` stored as property of `Requirement` | Evaluation scores belong to the Evaluation aggregate | Scores in EM Evaluation aggregate; reference `RequirementVersionId` |
| `KnowledgeAsset.projectId` (project as owner) | GBR-005: KnowledgeAssets are organizational, not project-scoped | KnowledgeAssets have no `projectId`; owned by organizational layer |
| Direct DB query from one context to another context's store | AP-008: cross-context DB access | All cross-context reads via owning context's public API |
| Cross-evaluator score visibility before `EvaluationsLocked` | GBR-013: blind scoring invariant | Enforce at EM Repository query layer |
| AI-initiated state changes on any aggregate | ADR-005: AI advisory only | AI recommendations require human confirmation before any domain state change |
| `Evaluation.score` manual override in `ConsolidatedEvaluation` | EVL-BR-011: platform-computed scores only | ConsolidatedEvaluation scores are derived; `ReviseScore` on individual Evaluation triggers recomputation |
| Unqualified `SupplierProfile` in Tender InvitationList | SPR-BR-003: only `Qualified` Suppliers may be invited | TM Application Service must verify `Qualified` status via OM API before adding to InvitationList |
| Cross-tenant `SupplierProfile` access | GBR-021, SPR-BR-001: no cross-tenant Supplier identity | Each Buyer manages their own Supplier registry; no global Supplier identity synchronization |
| `RequirementLibrary` with ProjectId or TenderId as owner | GBR-005, LIB-BR-001: library is organizational layer | Libraries have no Project or Tender owner; multiple Projects and Tenders reference the same library |
| Unapproved `Requirement` added to `RequirementLibrary` | LIB-BR-002: only `Approved` Requirements in libraries | Requirement must reach `Approved` state in RM before it can be added to any library |
| Direct User object embedded in domain events | GBR-001 attribution pattern | Domain events carry `UserId` (reference); User profile data is resolved at display time via OM API |

---

## References

- [`Domain_Model_Overview.md`](./Domain_Model_Overview.md) — PKB-02-000 — aggregate catalog and reference pattern overview
- [`Bounded_Contexts.md`](./Bounded_Contexts.md) — PKB-02-009 — context integration contracts
- [`Business_Object_Lifecycle.md`](./Business_Object_Lifecycle.md) — PKB-02-011 — lifecycle dependency chain and cross-aggregate gates
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — AP-008, AP-010, AP-015
- [`User.md`](../02_Foundation/User.md) — PKB-02F-001 — User identity and attribution anchor
- [`Organization.md`](../02_Foundation/Organization.md) — PKB-02F-002 — Organization and Tenant provisioning
- [`Tenant.md`](../02_Foundation/Tenant.md) — PKB-02F-003 — Tenant data isolation boundary
- [`SupplierProfile.md`](../02_Foundation/SupplierProfile.md) — PKB-02F-004 — Supplier organizational identity
- [`RequirementLibrary.md`](../02_Foundation/RequirementLibrary.md) — PKB-02F-005 — Requirement curation and Knowledge Flywheel
