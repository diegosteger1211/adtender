---
id: PKB-02-001
title: Requirement Domain Object
version: 2.0
status: APPROVED
owner: Domain Architecture
domain: Requirement Management
bounded_context: Requirement Management
audience:
  - Product Owner
  - Software Architect
  - Developer
  - AI Development Agent
  - UX Designer
  - QA Engineer
depends_on:
  - PKB-00-000
  - PKB-00-001
  - PKB-01-001
used_by:
  - Tender
  - SupplierResponse
  - Evaluation
  - Decision
  - KnowledgeAsset
tags:
  - domain-model
  - aggregate
  - requirement
  - knowledge
  - ddd
---

# Requirement Domain Object

---

## Bounded Context

**Context:** Requirement Management (RM)

**Role:** Primary knowledge creation context. Requirements are organizational assets — they outlive any project, tender, or evaluation that references them. Requirement Management enforces this through aggregate ownership and library governance.

**Owns:** `Requirement` aggregate, `RequirementLibrary` aggregate.

**Does not own:** Supplier Response content, Evaluation scores, Tender composition, Project scope management. All downstream aggregates reference Requirements by `RequirementVersionId`, not by embedding content.

**Critical rule (GBR-011):** All cross-aggregate references to Requirements must use `RequirementVersionId`, not `RequirementId`. A versioned reference is immutable and traceable to the exact business expectation that was evaluated.

---

## 1. Executive Summary

A Requirement is one of the most important Business Objects in adtender.

It represents a reusable, versioned and assessable business expectation that can be used in projects, tenders, supplier responses, evaluations and decisions.

A Requirement is not a document paragraph, not an Excel row and not a simple text field. It is a structured knowledge asset with identity, lifecycle, governance, traceability and business relationships.

In adtender, Requirements are the foundation for:

- tender creation
- structured supplier responses
- objective evaluation
- decision traceability
- library reuse
- knowledge growth
- AI-assisted recommendations

The platform must therefore treat Requirements as first-class domain objects.

---

## 2. Core Definition

A Requirement describes what a product, system, service, supplier or solution must provide, support, fulfill, prove, deliver or comply with.

A Requirement can express:

- functional expectations
- non-functional expectations
- organizational expectations
- commercial expectations
- service expectations
- implementation expectations
- operational expectations
- documentation expectations
- quality expectations
- project-specific constraints

The platform must remain domain-neutral.

Examples may come from IT systems, manufacturing systems, ERP, MES, WMS, LIMS, CRM, HR, cloud platforms, consulting services, logistics systems, monitoring tools or other procurement objects.

No industry-specific assumption may be hardcoded into the Requirement model.

---

## 3. Product Philosophy

Requirements are knowledge.

Projects use Requirements.

Tenders publish Requirements.

Suppliers respond to Requirements.

Evaluations assess Supplier Responses against Requirements.

Decisions are justified using evaluated Requirements.

Lessons Learned improve Requirements.

Libraries preserve Requirements for future reuse.

This makes Requirement Management the primary knowledge engine of adtender.

---

## 4. What a Requirement Is Not

A Requirement is not:

- a Word paragraph
- an Excel row
- a static tender text
- a supplier answer
- an evaluation score
- a contract clause by default
- a project-only text fragment
- a UI form field
- a database-only record

Documents may render Requirements, but documents are not the source of truth.

---

## 5. Business Purpose

The purpose of a Requirement is to make business expectations:

- explicit
- structured
- reusable
- comparable
- assessable
- traceable
- versioned
- explainable

Requirements create the bridge between business needs and supplier evaluation.

Without structured Requirements, supplier responses cannot be compared objectively and decisions cannot be explained reliably.

---

## 6. Business Value

Requirements create value by enabling:

### Better tender quality
Clear Requirements reduce ambiguity and improve supplier understanding.

### Better supplier comparability
Structured Requirements allow structured supplier responses and direct comparison.

### Better evaluation
Evaluators can assess each Requirement against defined criteria.

### Better decision traceability
Decisions can reference the exact Requirements and response versions they are based on.

### Better reuse
Approved Requirements become reusable organizational knowledge.

### Better AI support
AI can detect duplicates, inconsistencies, missing information and improvement opportunities.

---

## 7. Requirement Scope

A Requirement may be used in several contexts.

### Library Context
The Requirement exists as reusable organizational knowledge.

### Project Context
The Requirement is selected, adapted or created for a specific business initiative.

### Tender Context
The Requirement is published to suppliers as part of a tender.

### Response Context
Suppliers provide structured answers to the Requirement.

### Evaluation Context
Supplier responses are evaluated against the Requirement.

### Decision Context
The Requirement contributes to business decision rationale.

### Knowledge Context
The Requirement may be improved after project completion and returned to libraries.

---

## Scope

**In scope (Requirement Management context):**
- Requirement creation, classification, and lifecycle governance
- RequirementVersion management (immutable version snapshots)
- Requirement Library assignment and governance
- Requirement relationships (depends-on, conflicts-with, derived-from, etc.)
- Evaluation configuration properties on the Requirement (weight, knock-out flag, response type, minimum acceptance level) — these are defined on the Requirement but applied in Evaluation Management
- Improvement proposal intake from LessonsLearnedRecord
- AI-assisted suggestions (duplicate detection, completeness checks, wording improvement) with mandatory human confirmation

**Out of scope:**
- Supplier Response content (Supplier Management)
- Evaluation scores (Evaluation Management)
- Tender composition and RequirementSnapshot management (Tender Management)
- Project scope management (Project Management)
- Contract clause derivation from Requirements (Integration)
- Document export/rendering of Requirements (Integration)

---

## 8. Requirement Types

The platform must support configurable Requirement types.

Typical examples:

- Functional Requirement
- Non-Functional Requirement
- Technical Requirement
- Organizational Requirement
- Commercial Requirement
- Service Requirement
- Operational Requirement
- Documentation Requirement
- Compliance Requirement
- Implementation Requirement
- Training Requirement
- Support Requirement
- Interface Requirement
- Migration Requirement
- Reporting Requirement
- Usability Requirement
- Performance Requirement
- Availability Requirement

The list must be configurable. It must not be hardcoded.

---

## 9. Requirement Attributes

A Requirement should support at least the following business attributes.

### Identity
- Requirement ID
- Human-readable code
- Title
- Short title
- Version

### Content
- Description
- Business rationale
- Acceptance expectation
- Notes
- Examples
- Clarifications

### Classification
- Type
- Category
- Domain
- Business area
- Tags
- Priority
- Criticality
- Reuse level

### Governance
- Owner
- Author
- Reviewer
- Approver
- Status
- Approval date
- Validity

### Evaluation
- Evaluation relevance
- Weighting
- Knock-out flag
- Minimum acceptance level
- Response type
- Evidence requirement

### Traceability
- Source
- Origin project
- Origin library
- Related Requirements
- Derived from
- Used in projects
- Used in tenders

### Lifecycle
- Created at
- Updated at
- Published at
- Deprecated at
- Archived at

---

## 10. Lifecycle

A Requirement has a lifecycle.

Typical lifecycle:

1. Draft
2. In Review
3. Approved
4. Published
5. Used
6. Evaluated
7. Improved
8. Deprecated
9. Archived

The lifecycle may be configured per organization.

---

## 11. State Model

| State | Meaning | Editable |
|---|---|---|
| Draft | Initial creation state | Yes |
| In Review | Submitted for quality review | Limited |
| Approved | Approved for reuse | No, new version required |
| Published | Published in a tender | No |
| Used | Used in project or tender | No, new version required |
| Deprecated | Should not be used in new projects | No |
| Archived | Retained for history | No |

Published Requirements are immutable.

If a published Requirement changes, a new version must be created.

---

## 12. Versioning

Versioning is mandatory.

Every material change creates a new Requirement version.

A Requirement version records:

- version number
- author
- timestamp
- changed fields
- change reason
- approval state
- source version
- related project or library
- publication status

### Versioning Rules

Approved Requirement versions are immutable.

Published Requirement versions are immutable.

Supplier Responses must reference the exact published Requirement version (`RequirementVersionId`).

Evaluations must reference the exact Requirement version used in the Supplier Response.

Project-specific adaptations must keep traceability to the source version.

For the formal business rule codes, see Section 26 (Business Rules).

---

## 13. Requirement Libraries

Requirement Libraries store reusable Requirements.

A Library may represent:

- organization-wide standard Requirements
- domain-specific Requirements
- project templates
- industry knowledge
- supplier-neutral best practices
- internal standards

A Requirement may belong to multiple libraries.

Libraries are not document folders. They are structured knowledge repositories.

---

## 14. Requirement Reuse

A Project may use a Requirement in different ways.

### Reference
The Project references the Requirement without changing it.

### Copy with Traceability
The Project creates a local adaptation but keeps source traceability.

### Derive
The Project derives a more specific Requirement from a generic source.

### Improve
After the project, improvements are proposed back to the library.

Reuse must always be traceable.

---

## 15. Requirement Relationships

Requirements may relate to other Requirements.

Relationship types include:

- depends on
- conflicts with
- duplicates
- refines
- generalizes
- replaces
- is replaced by
- derived from
- similar to
- grouped with
- evaluated together with

Relationships must support navigation, impact analysis and AI-assisted recommendations.

---

## 16. Requirement Groups

Requirements may be organized into groups.

Groups may represent:

- functional areas
- process areas
- modules
- sections
- work packages
- evaluation categories
- tender chapters

A Requirement Group is not the same as a Requirement Library.

A Library stores reusable knowledge.

A Group structures Requirements in a specific context.

---

## 17. Response Types

Each Requirement may define expected response types.

Examples:

- Yes / No
- Fulfilled / Partially Fulfilled / Not Fulfilled
- Free text
- Number
- Percentage
- Date
- Single choice
- Multiple choice
- Price value
- URL
- File evidence
- Structured table
- Comment
- Custom response type

Response types must be configurable.

---

## 18. Evidence Requirements

A Requirement may require evidence.

Evidence may include:

- document
- screenshot
- certificate
- reference project
- architecture diagram
- price sheet
- process description
- product sheet
- signed statement
- demo result
- workshop protocol

Evidence must be linked to the Requirement or the Supplier Response, not stored as unrelated documents.

---

## 19. Evaluation Integration

A Requirement can influence evaluation.

Evaluation-related properties may include:

- weight
- category
- scoring method
- mandatory flag
- knock-out criterion
- minimum required score
- evaluator group
- required comment
- required evidence

The platform must allow different evaluation models per tender.

The Requirement defines what is assessed.

The Evaluation Model defines how it is assessed.

---

## 20. Tender Integration

When a Tender is created, it includes a defined set of Requirement versions.

A published Tender must not reference mutable Requirement drafts.

Tender publication freezes the relevant Requirement versions.

If Requirements change after publication, the Tender must manage this as:

- amendment
- clarification
- new tender version
- updated Requirement version

Suppliers must always know which Requirement version they answered.

---

## 21. Supplier Response Integration

Supplier Responses must reference:

- Tender
- Supplier
- Requirement version
- Response value
- Response text
- Attachments
- Comments
- Submission version
- Response status

Supplier Responses are not stored inside the Requirement aggregate.

They belong to the Supplier Response domain.

---

## 22. Decision Integration

Decisions may cite Requirements as decision evidence.

A Decision may reference:

- critical Requirements
- unmet Requirements
- high-risk Requirements
- differentiating Requirements
- accepted deviations
- fulfilled knock-out Requirements

Decision rationale must remain explainable through Requirement-level traceability.

---

## 23. Workflow Integration

Common Requirement workflows:

### Requirement Creation Workflow
Draft → Review → Approval

### Requirement Change Workflow
Change Request → Impact Analysis → New Version → Approval

### Requirement Library Workflow
Draft → Library Review → Published to Library

### Requirement Deprecation Workflow
Deprecated → Replacement Suggested → Archived

### Requirement Improvement Workflow
Project Feedback → Improvement Proposal → Library Review → New Version

---

## 24. Commands

| Command | Preconditions / Guards | State Transition |
|---|---|---|
| `CreateRequirement` | Title, type, and description provided | — → `Draft` |
| `UpdateRequirement` | Requirement in `Draft` state | No state change |
| `SubmitRequirementForReview` | Required fields populated (type, response type, description) | `Draft` → `InReview` |
| `ApproveRequirement` | Reviewer ≠ Author; review completed | `InReview` → `Approved` |
| `RejectRequirement` | Rejection reason mandatory | `InReview` → `Draft` |
| `CreateRequirementVersion` | Requirement in `Approved` or `Published` state; change reason provided | Creates new `Draft` version with `previousVersionId` |
| `DeprecateRequirement` | Replacement Requirement ID provided | `Approved` / `Published` → `Deprecated` |
| `ArchiveRequirement` | No active references in Draft or Published Tenders | `Deprecated` → `Archived` |
| `LinkRequirement` | Both Requirements exist; relationship type specified | No state change |
| `UnlinkRequirement` | Relationship exists | No state change |
| `AssignRequirementToLibrary` | Requirement in `Approved` or later state; Library exists | No state change |
| `ProposeRequirementImprovement` | Requirement exists; improvement text and rationale provided; AI proposals require human confirmation (REQ-BR-011) | No state change; produces event |
| `ClassifyRequirement` | Requirement exists and is not Archived | No state change |
| `ChangeRequirementEvaluationProperties` | Requirement in `Draft` state | No state change |

Commands must validate all business rules before executing state transitions.

---

## 25. Events

| Event | Trigger | Key Payload Fields | Consumers |
|---|---|---|---|
| `RequirementCreated` | `CreateRequirement` | `requirementId`, `tenantId`, `type`, `createdAt` | Reporting |
| `RequirementUpdated` | `UpdateRequirement` | `requirementId`, `changedFields`, `updatedAt` | Reporting |
| `RequirementSubmittedForReview` | `SubmitRequirementForReview` | `requirementId`, `reviewerId`, `submittedAt` | Notification |
| `RequirementApproved` | `ApproveRequirement` | `requirementId`, `requirementVersionId`, `approvedAt` | Tender Management (eligibility signal) |
| `RequirementRejected` | `RejectRequirement` | `requirementId`, `rejectionReason`, `rejectedAt` | Notification |
| `RequirementVersionCreated` | `CreateRequirementVersion` | `requirementId`, `newVersionId`, `previousVersionId`, `createdAt` | Tender Management, Project Management |
| `RequirementDeprecated` | `DeprecateRequirement` | `requirementId`, `replacementRequirementId?`, `deprecatedAt` | Project Management, Tender Management |
| `RequirementArchived` | `ArchiveRequirement` | `requirementId`, `archivedAt` | Reporting |
| `RequirementAssignedToLibrary` | `AssignRequirementToLibrary` | `requirementId`, `libraryId`, `assignedAt` | Reporting |
| `RequirementImprovementProposed` | `ProposeRequirementImprovement` | `requirementId`, `proposalText`, `sourceLessonsLearnedRecordId?`, `proposedAt` | Knowledge Management |

Events are immutable business facts and must carry sufficient context for all consumers.

---

## 26. Business Rules

REQ-BR-001 Every Requirement has a unique identifier.

REQ-BR-002 Every Requirement has exactly one current version.

REQ-BR-003 Approved versions are immutable.

REQ-BR-004 Published versions are immutable.

REQ-BR-005 A Requirement may belong to multiple Libraries.

REQ-BR-006 A Requirement may be used in multiple Projects.

REQ-BR-007 Project-specific adaptations must keep source traceability.

REQ-BR-008 Supplier Responses must reference a published Requirement version.

REQ-BR-009 Evaluations must reference the same Requirement version as the Supplier Response.

REQ-BR-010 Requirement deletion is not allowed after usage. Archive instead.

REQ-BR-011 AI-generated changes require human confirmation.

REQ-BR-012 Requirement categories must be configurable.

REQ-BR-013 Requirement response types must be configurable.

REQ-BR-014 Requirement approval may require workflow.

REQ-BR-015 Requirement improvement proposals must preserve original version history.

---

## 27. Permissions

| Action | Required Role | Condition |
|---|---|---|
| View Requirement | Any authenticated user | Tenant isolation enforced (GBR-021) |
| Create Requirement | Requirement Author, Library Manager, Project Manager | — |
| Update Requirement | Requirement Author, Library Manager | Requirement in `Draft` state only |
| Submit for Review | Requirement Author | Required fields populated |
| Approve Requirement | Library Manager, Requirement Reviewer | Reviewer ≠ Author |
| Reject Requirement | Library Manager, Requirement Reviewer | Rejection reason mandatory |
| Create New Version | Requirement Author, Library Manager | Requirement in `Approved` or `Published` state |
| Deprecate Requirement | Library Manager | Replacement ID provided |
| Archive Requirement | Library Manager | No active Tender references |
| Manage Library Assignment | Library Manager | — |
| Manage Classification | Requirement Author, Library Manager | Requirement not Archived |
| Propose Improvement | Project Manager, Evaluator, Library Manager | Human confirmation required for AI-generated proposals (REQ-BR-011) |
| Export | Any authenticated user with read access | — |
| Import | Library Manager, Organization Admin | — |

Permissions are role-based and enforced at the Application Service layer. Tenant isolation (GBR-021) is enforced at the data layer.

---

## 28. Aggregate Design

Suggested aggregate root:

- Requirement

Contained entities:

- RequirementVersion
- RequirementClassification
- RequirementRelation
- RequirementApproval
- RequirementComment
- RequirementAttachmentReference
- RequirementHistoryEntry

Referenced aggregates:

- RequirementLibrary
- Project
- Tender
- SupplierResponse
- Evaluation
- Decision
- KnowledgeAsset
- Workflow

Important rule:

Supplier Response is not a child of Requirement.

Evaluation is not a child of Requirement.

They reference the relevant Requirement version.

---

## 29. Value Objects

Possible value objects:

- RequirementCode
- RequirementTitle
- RequirementDescription
- RequirementPriority
- RequirementCriticality
- RequirementStatus
- RequirementVersionNumber
- RequirementCategory
- RequirementTag
- ResponseType
- EvaluationWeight
- EvidenceRequirement
- ValidityPeriod

---

## 30. API Guidelines

APIs should expose Requirement operations explicitly.

Example resources:

- GET /requirements
- GET /requirements/{id}
- POST /requirements
- PATCH /requirements/{id}
- POST /requirements/{id}/versions
- POST /requirements/{id}/submit-review
- POST /requirements/{id}/approve
- POST /requirements/{id}/archive
- GET /requirements/{id}/history
- GET /requirements/{id}/relations
- POST /requirements/{id}/relations
- GET /requirements/{id}/usage

APIs must not expose database structure directly.

---

## 31. AI Support

AI may support:

- duplicate detection
- wording improvement
- ambiguity detection
- completeness checks
- classification suggestions
- missing Requirement suggestions
- similar Requirement recommendations
- translation
- summarization
- risk detection
- consistency checks
- library reuse recommendations

AI must not:

- approve Requirements
- publish Requirements
- delete Requirements
- change approved versions without confirmation
- remove traceability
- decide whether a Requirement is mandatory without user confirmation

---

## 32. Search and Discovery

Requirements must be searchable by:

- title
- description
- type
- category
- tags
- library
- project usage
- tender usage
- status
- priority
- criticality
- owner
- version
- similarity
- related Requirements

Search must support reuse.

---

## 33. KPIs

Potential KPIs:

- number of Requirements
- reuse rate
- duplicate rate
- average approval time
- number of Requirements per project
- number of deprecated Requirements
- library contribution rate
- AI improvement acceptance rate
- Requirement quality score
- response completeness rate
- evaluation coverage rate

---

## 34. UI Implications

Requirement UI should support:

- list view
- detail view
- version history
- relations graph
- library assignment
- usage overview
- comments
- approval workflow
- AI suggestions
- quality checks
- response configuration
- evaluation configuration

UI must not hide version context.

Users must always know whether they are editing a draft, viewing an approved version or using a published version.

---

## 35. Anti-Patterns

Do not:

- store Requirements only in Word or Excel
- create project copies without traceability
- allow editing of published Requirements
- mix Supplier Response into Requirement
- mix Evaluation Score into Requirement
- hardcode domain-specific categories
- make documents the primary source of truth
- create UI before lifecycle is modeled
- remove history
- allow AI to overwrite approved content automatically

---

## 36. Example

A Project needs a new system.

The team searches the Requirement Library and finds 350 reusable Requirements.

280 Requirements are reused unchanged.

50 are adapted with traceability.

20 new Requirements are created.

The Tender publishes a frozen Requirement set.

Suppliers respond to each Requirement.

Evaluators score responses.

The Decision cites 15 key Requirements as decisive.

After project closing, 12 improved Requirements are proposed back to the Library.

This is the intended knowledge cycle.

---

## 37. Machine Context

```yaml
domain: Requirement Management
aggregate_root: Requirement
bounded_context: RM
versioned: true
auditable: true
reusable: true
library_enabled: true

lifecycle_states:
  - Draft
  - InReview
  - Approved
  - Published
  - Deprecated
  - Archived

critical_invariants:
  - Approved and Published versions are immutable (GBR-003)
  - All cross-aggregate references must use RequirementVersionId, not RequirementId (GBR-011)
  - Reviewer must not be the same as the Author

versioned_references_used_by:
  Tender: RequirementVersionId (frozen in TenderRequirementSnapshot at publication)
  SupplierResponse: RequirementVersionId (per ResponseItem)
  Evaluation: RequirementVersionId (per Score)

commands:
  - CreateRequirement
  - UpdateRequirement
  - SubmitRequirementForReview
  - ApproveRequirement
  - RejectRequirement
  - CreateRequirementVersion
  - DeprecateRequirement
  - ArchiveRequirement
  - AssignRequirementToLibrary
  - ProposeRequirementImprovement

events_produced:
  - RequirementCreated
  - RequirementApproved
  - RequirementVersionCreated
  - RequirementDeprecated
  - RequirementImprovementProposed

events_subscribed:
  - ImprovementProposalsSubmitted (KM — intake for library review)

never:
  - document_as_source_of_truth
  - mutable_approved_or_published_requirement
  - supplier_response_as_child_of_requirement
  - evaluation_score_as_child_of_requirement
  - ai_auto_approve_or_publish
  - cross_context_db_access_from_rm
  - reference_requirement_by_id_instead_of_version_id_in_downstream_aggregates
```

## 38. Implementation Guidance for Claude

Implement in this order:

1. Requirement aggregate
2. RequirementVersion entity
3. Requirement lifecycle
4. Versioning rules
5. Classification
6. Library relationships
7. Project usage references
8. Tender publication references
9. Supplier response references
10. Evaluation references
11. Audit history
12. AI suggestion workflow

Do not start with UI.

Do not start with database tables.

Do not implement supplier response inside the Requirement aggregate.
