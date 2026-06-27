---
id: PKB-02-007
title: KnowledgeAsset — Domain Object Specification
version: 1.0
status: APPROVED
owner: Domain Architecture
domain: Knowledge Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
  - QA Engineer
depends_on:
  - PKB-00-MASTER
  - PKB-02-001
  - PKB-01-001
used_by:
  - Project
  - Tender
  - Evaluation
related_processes:
  - BP05_Library_Management
  - BP14_Lessons_Learned
  - BP15_Knowledge_Management
tags:
  - domain-model
  - aggregate
  - knowledge
  - library
  - ddd
---

# KnowledgeAsset — Domain Object Specification

## 1. Executive Summary

The KnowledgeAsset aggregate is the organizational layer's counterpart to the Requirement aggregate. Where Requirements are the atomic units of what a Supplier must fulfill, Knowledge Assets are the structured units of organizational wisdom about *how* to procure effectively — templates, playbooks, market maps, and compliance guides that make future projects faster, more consistent, and less risky.

Knowledge Assets are owned by the organizational layer, not by individual projects. They are versioned, published, consumed by many projects, and governed independently of any single procurement. A KnowledgeAsset is not created by a project — it is created *from* project experience, by the organizational Knowledge Management function (BP15).

Unlike the transactional aggregates (Tender, Decision), the KnowledgeAsset is a knowledge management aggregate: its primary behaviors are curation, versioning, and lifecycle governance. Its primary value is as an input to other aggregates (Project initialization, Tender evaluation model configuration), not as a workflow stage.

---

## 2. Purpose

The `KnowledgeAsset` aggregate:

1. Represents a single reusable organizational knowledge object (playbook, template, market map, etc.)
2. Manages the lifecycle of that knowledge object from creation through deprecation
3. Enforces version immutability for published content (GBR-003)
4. Tracks which projects and Tenders reference this asset — enabling impact analysis before changes
5. Provides structured content that can be consumed by project initialization, Tender configuration, or AI recommendation engines
6. Captures provenance: which project experiences and improvement proposals contributed to this asset's creation or revision

---

## 3. Business Motivation

**Why is KnowledgeAsset a separate aggregate from Requirement?**

A Requirement says "the Supplier must fulfill X." A Knowledge Asset says "when procuring Y, your organization should do Z." These are fundamentally different ontologies — one is a contractual obligation directed at a Supplier, the other is internal organizational guidance. Their governance models differ (Requirements are reviewed by Requirement Engineers; Knowledge Assets are reviewed by Domain Experts and Library Managers), their consumers differ (Requirements are in Tenders; Knowledge Assets feed project planning), and their content types differ (Requirements are structured text with acceptance criteria; Knowledge Assets can be rich documents, templates, or data models).

**Why must Knowledge Assets live at the organizational layer?**

If Knowledge Assets were owned by projects, their lifecycle would be tied to project lifecycles. When a project closes, that knowledge would be archived along with the project — making it unavailable to future projects. The organizational layer owns Knowledge Assets precisely so they survive any individual project and remain available as reusable assets across the organization.

**Why is versioning mandatory and published versions immutable?**

Organizations build processes on top of Knowledge Assets. A team that plans a procurement based on "ERP Evaluation Model v2" needs that version to remain stable throughout the procurement. If Knowledge Assets could be silently modified after publication, projects could unknowingly be using changed guidance mid-execution. GBR-003 prevents this: new content always appears in a new version with a new state transition. Projects can choose when to adopt the new version.

---

## 4. Responsibilities

- Managing the complete lifecycle of a Knowledge Asset from `Draft` through `Deprecated`
- Enforcing version immutability for `Published` assets (GBR-003)
- Recording provenance (which projects, Lessons Learned records, and Improvement Proposals contributed to this asset)
- Maintaining a usage registry (which projects and Tenders are currently referencing this asset version)
- Governing deprecation — assets cannot be deprecated without specifying a replacement if one exists
- Providing structured content accessible to AI recommendation and project initialization workflows
- Tracking Domain Expert review as a prerequisite to approval (BP15-BR-001)

---

## Scope

**In scope (owned by this aggregate):**
- KnowledgeAsset lifecycle (Draft → InReview → Approved → Published → Deprecated)
- Versioning: each version is a separate aggregate instance; `previousVersionId` links the chain
- Structured content typed by `KnowledgeAssetType` (Playbook, EvaluationModelTemplate, MarketMap, etc.)
- Provenance: references to Improvement Proposals, Project Archives, or External Sources that contributed to this asset
- Review records: Domain Expert review outcomes and notes
- Usage registry: which Projects and Tenders reference this version

**Out of scope (explicitly not owned):**
- Requirement Library content → Requirement aggregate (KnowledgeAsset may reference Requirements by ID)
- Project lifecycle → Project aggregate (references KnowledgeAsset at initialization, not the reverse)
- Tender EvaluationModel state → Tender aggregate (consumes EvaluationModelTemplate content as a seed; Tender owns the configured instance)
- Lessons Learned content → LessonsLearnedRecord aggregate (produces ImprovementProposals that feed KnowledgeAsset provenance)
- Library contribution governance at the library level → BP05 (governed by Library Manager per library)

---

## 5. Business Context

```
Project Experience (BP13/BP14)
         │
Improvement Proposals (BP15)
         │
         ▼
KnowledgeAsset ──────────────────────────────────────────────────► Project (initialization)
   (Published)                                                         │
         │                                                     Tender (EvaluationModel template)
         └───────────────────────────────────────────────────► Requirement Library (BP05 receives improvements)
```

The Knowledge Management bounded context (BP15) is the primary producer of Knowledge Assets. Projects (BP01-BP13) are the primary consumers. The Requirement domain is a sibling — Knowledge Assets can reference Requirements in the Library and vice versa, but neither owns the other.

The Knowledge Asset domain interacts with:
- **Organization Management:** Library Managers and Domain Experts are users with roles that govern KnowledgeAsset lifecycle
- **Project Management:** Projects reference Knowledge Assets during initialization
- **Tender Management:** Evaluation Model Templates are a Knowledge Asset type that can seed a Tender's EvaluationModel configuration
- **Knowledge Management (BP15):** The process that authors, reviews, approves, and maintains Knowledge Assets

---

## 6. Lifecycle

```
ImprovementProposalRouted / Organizational need identified
              │
              │ CreateKnowledgeAsset
              ▼
           Draft
              │
              │ SubmitForReview
              ▼
          InReview
              │
              │ RequestRevision ──── (back to Draft)
              │ ApproveKnowledgeAsset
              ▼
          Approved
              │
              │ PublishKnowledgeAsset
              ▼
         Published ────────────────────────── (immutable at this version; new version = CreateNewVersion)
              │
              │ DeprecateKnowledgeAsset
              ▼
         Deprecated ─────────────────────── (read-only; can still be referenced for historical lookup)
```

**Creating a new version of a Published asset:**
`CreateNewVersion` command creates a new `KnowledgeAsset` instance with:
- A new `KnowledgeAssetId`
- `previousVersionId` set to the current Published version
- `version` incremented
- State reset to `Draft`

The existing `Published` version remains available to projects that reference it until it is deprecated. Deprecation should reference the replacement version.

---

## 7. State Machine

### Permitted transitions

| From | To | Command | Guard |
|---|---|---|---|
| (new) | `Draft` | `CreateKnowledgeAsset` | Acting user has `KnowledgeAsset.Create` permission; asset type valid |
| `Draft` | `InReview` | `SubmitForReview` | At least one Domain Expert reviewer assigned; content non-empty |
| `InReview` | `Draft` | `RequestRevision` | Reviewer provides revision notes |
| `InReview` | `Approved` | `ApproveKnowledgeAsset` | At least one Domain Expert review recorded (BP15-BR-001); Library Manager authorization |
| `Approved` | `Published` | `PublishKnowledgeAsset` | Library Manager authorization |
| `Published` | `Deprecated` | `DeprecateKnowledgeAsset` | Library Manager authorization; deprecation reason provided; replacementAssetId specified if replacement exists |

### Forbidden transitions

| Forbidden | Reason |
|---|---|
| Any content mutation after `Published` | GBR-003: Published versions are immutable |
| `DeprecateKnowledgeAsset` without deprecation reason | Governance requirement |
| Direct `Draft` → `Approved` (skipping `InReview`) | BP15-BR-001 |
| `Approved` → `Draft` (rollback) | Once approved, revision requires `CreateNewVersion` |

---

## 8. Business Rules

| Rule ID | Rule | Enforcement Layer | When Active |
|---|---|---|---|
| KNA-BR-001 | Knowledge Asset content must have at least one Domain Expert review recorded before approval. Self-approval (Library Manager reviewing their own authored asset) is not permitted. | `ApproveKnowledgeAsset` guard | At approval |
| KNA-BR-002 | Published Knowledge Asset content is immutable. Any change to content — including wording changes — requires `CreateNewVersion`, which creates a new `Draft` instance. | Domain invariant; Repository write block | After `Published` |
| KNA-BR-003 | A Knowledge Asset may not be deprecated without a documented reason. If a replacement exists, the `replacementKnowledgeAssetId` must be specified. | `DeprecateKnowledgeAsset` guard | At deprecation |
| KNA-BR-004 | Projects and Tenders that reference a Knowledge Asset version must be notified when that version is deprecated. | Event-driven notification; not a hard block | At deprecation |
| KNA-BR-005 | Knowledge Assets must have a defined `type` that matches the Knowledge Asset type taxonomy. Custom types are not permitted without organizational configuration. | `CreateKnowledgeAsset` guard | At creation |
| KNA-BR-006 | A Knowledge Asset that is an `EvaluationModelTemplate` type must include a valid `EvaluationModelContent` with at least one group definition and weights that sum to 100%. | `SubmitForReview` / `ApproveKnowledgeAsset` guard | For EvaluationModelTemplate type |
| KNA-BR-007 | Provenance tracking is mandatory — a Knowledge Asset must reference at least one source (ImprovementProposalId, ProjectArchiveId, or ExternalSourceReference). | `SubmitForReview` guard | At review submission |
| GBR-003 | Published versions are immutable. | Domain invariant | Always after `Published` |
| GBR-005 | Reusable knowledge belongs to the organizational layer, independent of any project. | Ownership model: no TenderId or ProjectId as owner field | Always |
| GBR-001 | All actions are auditable. | Aggregate audit log | Always |

---

## 9. Relationships

```
Organization Management
    └── LibraryManager (UserId) ───────────────────────────────► KnowledgeAsset (owner)
    └── DomainExpert (UserId) ──────────────────────────────────► KnowledgeAsset (reviewer)

Lessons Learned (BP14)
    └── LessonsLearnedRecord ──────────────────────────────────► KnowledgeAsset (provenance)
    └── ImprovementProposal ───────────────────────────────────► KnowledgeAsset (provenance)

Requirement (PKB-02-001)
    └── Requirement (by RequirementId) ────────────────────────► KnowledgeAsset (references, optional)

KnowledgeAsset ─────────────────────────────────────────────────► Project (consumed at initialization)
KnowledgeAsset (EvaluationModelTemplate) ───────────────────────► Tender (seeds EvaluationModel)
```

The KnowledgeAsset does **not** own:
- Requirement content (it references Requirements by ID)
- Project or Tender data

---

## 10. Aggregate Design

```
KnowledgeAsset (Aggregate Root)
├── knowledgeAssetId: KnowledgeAssetId
├── tenantId: TenantId                      immutable
├── type: KnowledgeAssetType                immutable
├── status: KnowledgeAssetStatus
├── version: SemanticVersion                e.g. "1.0", "2.1"
├── previousVersionId: KnowledgeAssetId?    set by CreateNewVersion
├── title: string                           max 500 chars; required
├── description: string                     max 5000 chars; required
├── content: KnowledgeAssetContent          typed union based on KnowledgeAssetType
├── provenance: Provenance
│   ├── sources: ProvenanceSource[]
│   │   └── ProvenanceSource
│   │       ├── sourceType: ProvenanceSourceType  ImprovementProposal | ProjectArchive | ExternalReference | DirectAuthoring
│   │       ├── sourceId: string?                 ImprovementProposalId or ProjectArchiveId
│   │       └── description: string              required for ExternalReference and DirectAuthoring
│   └── authoredBy: UserId
├── reviewRecords: ReviewRecord[]            append-only; tracks domain expert reviews
│   └── ReviewRecord
│       ├── reviewId: ReviewId
│       ├── reviewerUserId: UserId
│       ├── outcome: ReviewOutcome           Approved | RevisionRequested
│       ├── notes: string?
│       └── reviewedAt: Timestamp
├── usageRegistry: KnowledgeAssetUsage[]    append-only; references from projects/tenders
│   └── KnowledgeAssetUsage
│       ├── usageId: UsageId
│       ├── consumerType: ConsumerType       Project | Tender
│       ├── consumerId: string              ProjectId or TenderId
│       └── registeredAt: Timestamp
├── publishedAt: Timestamp?
├── deprecatedAt: Timestamp?
├── deprecationReason: string?
├── replacementKnowledgeAssetId: KnowledgeAssetId?
└── auditLog: AuditEntry[]                  append-only
```

---

## 11. Entities

### ReviewRecord (Entity within KnowledgeAsset)

| Attribute | Type | Rules |
|---|---|---|
| `reviewId` | `ReviewId` | Immutable |
| `reviewerUserId` | `UserId` | Must be a Domain Expert; must not be the asset's `authoredBy` user (KNA-BR-001) |
| `outcome` | `ReviewOutcome` | `Approved \| RevisionRequested` |
| `notes` | `string?` | Mandatory when `outcome == RevisionRequested` |
| `reviewedAt` | `Timestamp` | Immutable |

### KnowledgeAssetUsage (Entity within KnowledgeAsset)

Append-only registry entry. Consumers register themselves when they adopt a Knowledge Asset version. This enables the platform to notify consumers when the version is deprecated.

---

## 12. Value Objects

| Value Object | Type | Constraints |
|---|---|---|
| `KnowledgeAssetId` | UUID | — |
| `KnowledgeAssetStatus` | enum | `Draft \| InReview \| Approved \| Published \| Deprecated` |
| `KnowledgeAssetType` | enum | See type taxonomy below |
| `SemanticVersion` | `{ major: int, minor: int }` | `major.minor` format; incremented at `CreateNewVersion` |
| `ReviewOutcome` | enum | `Approved \| RevisionRequested` |
| `ProvenanceSourceType` | enum | `ImprovementProposal \| ProjectArchive \| ExternalReference \| DirectAuthoring` |
| `ConsumerType` | enum | `Project \| Tender` |

### Knowledge Asset Type taxonomy

| Type | Content Shape | Consumed by |
|---|---|---|
| `ProcurementPlaybook` | Structured sections: objectives, scope, process steps, critical decisions, checklist | Project initialization |
| `EvaluationModelTemplate` | `EvaluationModelContent`: group definitions, weights (sum to 100%), scoring scale, scoring methods | Tender evaluation model configuration |
| `SupplierMarketMap` | Structured supplier landscape: categories, key vendors, evaluation dimensions, market trends | Project planning, Procurement Manager research |
| `ProjectTemplate` | Project setup: suggested phase plan, requirement groups to source, recommended Knowledge Assets, stakeholder roles | Project initialization |
| `RegulatoryComplianceGuide` | Compliance framework sections: applicable regulations, mandatory requirements, verification checklist | Requirement engineering (BP03/BP04), Tender review |
| `RiskRegisterTemplate` | Risk categories, standard risk entries with likelihood/impact/mitigation, procurement-specific risks | Project planning, Lessons Learned |

---

## 13. Commands

| Command | Actor | Preconditions | State Change | Events Produced |
|---|---|---|---|---|
| `CreateKnowledgeAsset` | Library Manager | Valid asset type; content non-empty | (new) → `Draft` | `KnowledgeAssetCreated` |
| `UpdateKnowledgeAssetDraft` | Library Manager | Status `Draft`; content validation passes | Updates content | `KnowledgeAssetDraftUpdated` |
| `SubmitForReview` | Library Manager | Status `Draft`; at least one reviewer assigned; provenance source present (KNA-BR-007) | `Draft` → `InReview` | `KnowledgeAssetSubmittedForReview` |
| `RecordReview` | Domain Expert | Status `InReview`; reviewer is assigned; reviewer ≠ author | Adds `ReviewRecord` | `KnowledgeAssetReviewed` |
| `RequestRevision` | Domain Expert | Status `InReview`; revision notes provided | `InReview` → `Draft` | `KnowledgeAssetRevisionRequested` |
| `ApproveKnowledgeAsset` | Library Manager | Status `InReview`; ≥1 Domain Expert review with `Approved` outcome (KNA-BR-001); reviewer ≠ approver | `InReview` → `Approved` | `KnowledgeAssetApproved` |
| `PublishKnowledgeAsset` | Library Manager | Status `Approved` | `Approved` → `Published` | `KnowledgeAssetPublished` |
| `RegisterUsage` | Platform (event-triggered when Project/Tender references this asset) | Status `Published` | Adds `KnowledgeAssetUsage` entry | `KnowledgeAssetUsageRegistered` |
| `DeprecateKnowledgeAsset` | Library Manager | Status `Published`; reason provided | `Published` → `Deprecated` | `KnowledgeAssetDeprecated` |
| `CreateNewVersion` | Library Manager | Status `Published` or `Deprecated`; new version valid | Creates new `KnowledgeAsset` (new ID, version incremented, state `Draft`); sets `previousVersionId` | `KnowledgeAssetNewVersionCreated` |

---

## 14. Events

| Event | Trigger | Critical Payload |
|---|---|---|
| `KnowledgeAssetCreated` | `CreateKnowledgeAsset` | `knowledgeAssetId`, `type`, `version`, `title`, `authoredBy`, `createdAt` |
| `KnowledgeAssetSubmittedForReview` | `SubmitForReview` | `knowledgeAssetId`, `submittedBy`, `submittedAt` |
| `KnowledgeAssetReviewed` | `RecordReview` | `knowledgeAssetId`, `reviewerUserId`, `outcome`, `reviewedAt` |
| `KnowledgeAssetApproved` | `ApproveKnowledgeAsset` | `knowledgeAssetId`, `approvedBy`, `approvedAt` |
| `KnowledgeAssetPublished` | `PublishKnowledgeAsset` | `knowledgeAssetId`, `type`, `version`, `publishedAt` |
| `KnowledgeAssetUsageRegistered` | `RegisterUsage` | `knowledgeAssetId`, `consumerType`, `consumerId`, `registeredAt` |
| `KnowledgeAssetDeprecated` | `DeprecateKnowledgeAsset` | `knowledgeAssetId`, `deprecatedAt`, `reason`, `replacementKnowledgeAssetId?`, `affectedUsageCount` |
| `KnowledgeAssetNewVersionCreated` | `CreateNewVersion` | `newKnowledgeAssetId`, `previousVersionId`, `newVersion`, `createdBy` |

**`KnowledgeAssetDeprecated` event** must trigger notifications to all registered consumers (`usageRegistry` entries) so that Projects and Tenders that reference this version are made aware of the deprecation.

---

## 15. API Considerations

**Base resource:** `/api/v1/knowledge-assets`

```
GET    /api/v1/knowledge-assets
       — List Knowledge Assets (filterable by type, status, version)
POST   /api/v1/knowledge-assets
       — CreateKnowledgeAsset
GET    /api/v1/knowledge-assets/{knowledgeAssetId}
       — Get Knowledge Asset detail (all authenticated users; status gates content access)
PATCH  /api/v1/knowledge-assets/{knowledgeAssetId}
       — UpdateKnowledgeAssetDraft (only when Draft; Library Manager only)
POST   /api/v1/knowledge-assets/{knowledgeAssetId}/submit-for-review
       — SubmitForReview
POST   /api/v1/knowledge-assets/{knowledgeAssetId}/reviews
       — RecordReview (Domain Expert actor)
POST   /api/v1/knowledge-assets/{knowledgeAssetId}/approve
       — ApproveKnowledgeAsset
POST   /api/v1/knowledge-assets/{knowledgeAssetId}/publish
       — PublishKnowledgeAsset
POST   /api/v1/knowledge-assets/{knowledgeAssetId}/deprecate
       — DeprecateKnowledgeAsset
POST   /api/v1/knowledge-assets/{knowledgeAssetId}/new-version
       — CreateNewVersion
GET    /api/v1/knowledge-assets/{knowledgeAssetId}/usage
       — Get usage registry (Library Manager; project/tender consumer count)

# Type-specific search
GET    /api/v1/knowledge-assets?type=EvaluationModelTemplate
GET    /api/v1/knowledge-assets?type=ProcurementPlaybook&status=Published
```

**Authorization rules:**

- `GET /knowledge-assets` with `status=Draft` or `status=InReview` returns only assets where the authenticated user is the author or an assigned reviewer.
- `PATCH` returns `409 KNOWLEDGE_ASSET_NOT_DRAFT` for any asset not in `Draft` state.
- `POST /approve` returns `403 SELF_APPROVAL_PROHIBITED` if the approver is the same user as the asset's `authoredBy`.
- `POST /deprecate` returns `400 DEPRECATION_REASON_REQUIRED` if the request body does not include a non-empty reason.

---

## Permissions

| Permission | Role(s) Required | Conditions |
|---|---|---|
| `KnowledgeAsset.Create` | Library Manager | Organizational role; own tenant |
| `KnowledgeAsset.UpdateDraft` | Library Manager (author) | Own asset; `Draft` state only; GBR-003 prevents mutation after `Published` |
| `KnowledgeAsset.SubmitForReview` | Library Manager (author) | Asset in `Draft`; provenance present (KNA-BR-007) |
| `KnowledgeAsset.RecordReview` | Domain Expert | Asset in `InReview`; reviewer ≠ author; assigned to review |
| `KnowledgeAsset.Approve` | Library Manager | Asset in `InReview`; ≥1 Domain Expert approval; approver ≠ author (KNA-BR-001) |
| `KnowledgeAsset.Publish` | Library Manager | Asset in `Approved` state |
| `KnowledgeAsset.Deprecate` | Library Manager | Asset in `Published`; reason required (KNA-BR-003) |
| `KnowledgeAsset.CreateNewVersion` | Library Manager | Asset in `Published` or `Deprecated` |
| `KnowledgeAsset.ViewPublished` | All authenticated users | `Published` assets only (general access) |
| `KnowledgeAsset.ViewDraft` | Author (Library Manager), assigned reviewer (Domain Expert) | `Draft` and `InReview` states |
| `KnowledgeAsset.ViewUsageRegistry` | Library Manager | Own organizational assets |
| `KnowledgeAsset.RegisterUsage` | Platform (event-triggered) | Called when Project or Tender references this asset |

**Organizational ownership restriction (GBR-005):** KnowledgeAssets are owned at the organizational layer. They may not be created within or transferred to a Project or Tender scope. The `tenantId` is mandatory; no `projectId` or `tenderId` ownership field exists on this aggregate.

---

## 16. UI Considerations

**Knowledge Asset library view:** A searchable, filterable library showing Published assets. Filter dimensions: type, domain, date range, version. Full-text search across title, description, and content. Draft and InReview assets are hidden from general users.

**Asset detail view:** Displays the full structured content for a Published asset. For `EvaluationModelTemplate` type, the content renders as an interactive preview of the evaluation groups and weights (not editable — display only). For `ProcurementPlaybook`, the sections render as a structured document with navigation.

**Version history:** Each asset detail view shows the version chain: current version, previous version link, deprecation indicator if current version is deprecated. Users can navigate to older versions for historical reference.

**Usage impact panel (Library Manager view):** Before deprecating an asset, the Library Manager is shown the full list of consumers (Projects and Tenders) currently referencing this version. This is the impact analysis view — it shows the business risk of deprecation.

**Project initialization:** When creating a new Project, the platform suggests relevant Knowledge Assets (Procurement Playbooks, Project Templates) based on the project's domain and procurement type. The Procurement Manager selects which assets to reference. This triggers `RegisterUsage`.

---

## 17. AI Guidance

**AI may assist with:**

- **Knowledge Asset discovery:** When a user is creating a Tender or Project, AI can search the Knowledge Asset library and recommend relevant assets based on the procurement type, domain, and historical project similarity
- **Gap detection:** AI can analyze project archive records and Lessons Learned data to identify recurring patterns not covered by any existing Knowledge Asset — producing a ranked list of Knowledge Asset creation opportunities
- **Draft content generation:** Given a set of source Improvement Proposals or project archive records, AI can produce a structured draft of a new Knowledge Asset for Library Manager review. The draft must be clearly marked as AI-generated and must go through the standard review process (it enters at `Draft` state, not `Approved`)
- **Cross-asset consistency analysis:** AI can detect contradictions between related Knowledge Assets and flag them for Library Manager review
- **Deprecation impact analysis:** Given a candidate for deprecation, AI can assess the breadth of the impact across projects and suggest timing recommendations

**AI must not:**

- Approve or publish Knowledge Assets
- Deprecate Knowledge Assets
- Modify content of a Published Knowledge Asset
- Register usage on behalf of a consumer without an explicit user action

**AI recommendation quality:** AI-recommended Knowledge Assets must display a confidence indicator and the specific matching criteria (e.g., "matched on procurement type: IT Software, and domain: Infrastructure"). Users must see why an asset was recommended, not just that it was.

---

## 18. Machine Context

```yaml
domain: Knowledge Management
bounded_context: KnowledgeManagement
aggregate_root: KnowledgeAsset

lifecycle: [Draft, InReview, Approved, Published, Deprecated]

versioning:
  strategy: explicit_version_instances  # each version is a new aggregate instance
  version_field: SemanticVersion
  immutable_when: [Published, Deprecated]
  new_version_command: CreateNewVersion  # creates new aggregate; sets previousVersionId

critical_invariants:
  - GBR-003: Published content is immutable; mutation attempts must fail at domain level
  - GBR-005: KnowledgeAsset has no ProjectId or TenderId as owner
  - KNA-BR-001: approval requires ≥1 Domain Expert review; reviewer ≠ author
  - KNA-BR-007: provenance source required at review submission
  - KNA-BR-006: EvaluationModelTemplate weights must sum to 100%

key_events:
  - KnowledgeAssetCreated
  - KnowledgeAssetPublished
  - KnowledgeAssetDeprecated    # triggers consumer notifications
  - KnowledgeAssetNewVersionCreated

integration:
  consumed_by: [Project (initialization), Tender (EvaluationModel seeding)]
  sources: [Lessons Learned (provenance), ImprovementProposal (provenance)]
  references_optionally: Requirement (by RequirementId)

never:
  - allow_content_mutation_after_published
  - allow_self_approval
  - allow_project_or_tender_to_own_knowledge_asset
  - allow_ai_to_approve_or_publish
  - skip_domain_expert_review_before_approval
```

---

## 19. Anti-Patterns

**Creating Knowledge Assets without provenance:**
A Knowledge Asset with no documented source cannot be evaluated for relevance or recency. KNA-BR-007 is not bureaucracy — it prevents the knowledge base from filling up with decontextualized content that future curators cannot assess. "The team felt this was useful" is not provenance.

**Treating the KnowledgeAsset type as an unstructured document store:**
Knowledge Assets must have structured, typed content. Storing a Word document or an unstructured rich-text blob as a Knowledge Asset defeats the platform's ability to search, recommend, and programmatically consume the asset content. The type taxonomy (EvaluationModelTemplate, ProcurementPlaybook, etc.) exists to enforce structured content.

**Allowing a project to own a Knowledge Asset:**
If a project owns a Knowledge Asset, the asset is retired when the project is archived. The whole point of a Knowledge Asset is that it outlives the project that created the experience behind it. Ownership must always be at the organizational layer (Library Manager), never at the Project or Tender level.

**Silently replacing a Published asset's content with a correction:**
Even a typo fix in a Published asset must go through `CreateNewVersion`. This seems like overhead, but it is the only way to ensure that projects using version 1 continue to get what they signed up for, while projects that want the correction can explicitly adopt version 2. Silent in-place corrections erode the immutability guarantee and create traceability gaps.

**Building a Knowledge Asset library and never governing its health:**
A knowledge base that grows but is never pruned becomes noise. The Library Health Oversight sub-process in BP15 (cross-library consistency review, gap analysis) is the organizational counterpart to this aggregate's lifecycle governance. Without BP15-D governance, the library will accumulate duplicate, contradictory, and stale Knowledge Assets.

---

## 20. Examples

### Example 1: EvaluationModelTemplate consumption by Tender

Library Manager creates a `KnowledgeAsset` of type `EvaluationModelTemplate` titled "IT Software Selection — Standard Weights v1.0". Content includes:
- Group: Security Architecture (weight: 30%)
- Group: Functional Requirements (weight: 40%)
- Group: Total Cost of Ownership (weight: 20%)
- Group: Vendor Viability (weight: 10%)
- Scoring scale: 0–5, step 1
- Method: WeightedAverage

When a Procurement Manager creates a new Tender for a software procurement, the platform suggests this template. The Procurement Manager selects it. The Tender's `EvaluationModel` is pre-populated with these groups and weights. The Procurement Manager adjusts the weights for this specific Tender (changing Security Architecture to 35% and Vendor Viability to 5%). `KnowledgeAssetUsageRegistered` event recorded — the Tender is now a consumer of version 1.0 of this asset.

### Example 2: Deprecation impact analysis

A Library Manager wants to deprecate "EU Public Procurement Compliance Guide v1.0" because it was superseded by the 2024 regulatory update. Before executing `DeprecateKnowledgeAsset`, the Library Manager views the usage registry: 12 Projects and 3 active Tenders reference this version.

The Library Manager first publishes "EU Public Procurement Compliance Guide v2.0" (the updated version). Then executes `DeprecateKnowledgeAsset` on v1.0 with `replacementKnowledgeAssetId: v2.0-ID`. `KnowledgeAssetDeprecated` event triggers notifications to all 15 consumers.

---

## 21. Implementation Guidance

Implement in this order:

1. **`KnowledgeAssetType`, `KnowledgeAssetStatus`, `SemanticVersion` value objects**
2. **`KnowledgeAssetContent` typed union** — define a content schema per `KnowledgeAssetType`; `EvaluationModelTemplate` requires weight-sum-to-100 validation (KNA-BR-006)
3. **`ProvenanceSource` value object**
4. **`KnowledgeAsset` aggregate root** with `CreateKnowledgeAsset` command
5. **`UpdateKnowledgeAssetDraft` command** with immutability check (must fail post-`Published`)
6. **`SubmitForReview` command** with provenance guard (KNA-BR-007)
7. **`RecordReview` command** with self-review guard (KNA-BR-001 precondition)
8. **`ApproveKnowledgeAsset` command** with Domain Expert review presence check and self-approval guard (KNA-BR-001)
9. **`PublishKnowledgeAsset` command** — after this, implement the Repository write block that prevents any content field mutation
10. **`RegisterUsage` command** — called by event consumers in Project and Tender domains when they reference this asset
11. **`DeprecateKnowledgeAsset` command** with reason and optional `replacementKnowledgeAssetId`; ensure `KnowledgeAssetDeprecated` event includes `affectedUsageCount` for consumer notification
12. **`CreateNewVersion` command** — creates a new aggregate instance; sets `previousVersionId`; version increment logic
13. **API layer** with status-gated read authorization (Draft/InReview hidden from general users)
14. **Consumer notification consumer** — subscribes to `KnowledgeAssetDeprecated` and sends notifications to all registered `usageRegistry` consumers

**Critical test:**
- Attempt `PATCH` content on a `Published` `KnowledgeAsset` → expect `KNOWLEDGE_ASSET_IMMUTABLE` error
- Attempt `ApproveKnowledgeAsset` with no `ReviewRecord` present → expect `DOMAIN_EXPERT_REVIEW_REQUIRED`
- Attempt `ApproveKnowledgeAsset` where the only reviewer is the same user as `authoredBy` → expect `SELF_APPROVAL_PROHIBITED`
- Create an `EvaluationModelTemplate` content where group weights sum to 95% → expect `EVALUATION_MODEL_WEIGHTS_INVALID` at `SubmitForReview`

---

## References

- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Knowledge Flywheel; organizational knowledge layer
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — AP-005 (versioning), AP-010 (knowledge layer), AP-016 (AI interactions)
- [`Business_Rules.md`](../01_Business/Business_Rules.md) — GBR-003, GBR-005, GBR-001
- [`BP05_Library_Management.md`](../01_Business/BP05_Library_Management.md) — Library governance; upstream of KnowledgeAsset creation
- [`BP14_Lessons_Learned.md`](../01_Business/BP14_Lessons_Learned.md) — Produces improvement proposals that feed KnowledgeAsset provenance
- [`BP15_Knowledge_Management.md`](../01_Business/BP15_Knowledge_Management.md) — The business process that governs KnowledgeAsset creation and maintenance
- [`Requirement.md`](./Requirement.md) — Sibling aggregate; Knowledge Assets may reference Requirements by ID
- [`Project.md`](./Project.md) — Consumes Knowledge Assets at initialization
- [`Tender.md`](./Tender.md) — Consumes `EvaluationModelTemplate` Knowledge Assets
- [`Decision.md`](./Decision.md) — Decision Records feed the Project Archive which provides provenance for future Knowledge Assets
