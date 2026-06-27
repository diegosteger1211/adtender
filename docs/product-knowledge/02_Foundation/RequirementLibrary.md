---
id: PKB-02F-005
title: RequirementLibrary — Foundation Aggregate
version: 1.0
status: APPROVED
owner: Domain Architecture
bounded_context: Requirement Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
  - Knowledge Architect
depends_on:
  - PKB-00-MASTER
  - PKB-00-001
  - PKB-02-000
  - PKB-02F-003
  - PKB-02-001
tags:
  - foundation
  - aggregate
  - requirement-library
  - requirement-management
  - knowledge
  - ddd
---

# RequirementLibrary — Foundation Aggregate

---

## Bounded Context

**Context:** Requirement Management (RM)

**Role:** RequirementLibrary is the organizational curation layer for Requirements. It groups approved Requirements into named, governed collections that Projects and Tenders can discover and reuse. Without libraries, Requirements would exist as an ungrouped mass with no discovery surface.

**Layer:** Foundation — RequirementLibrary is an organizational asset. It outlives any Project or Tender. All Projects reference libraries to seed their scope; all Tenders draw Requirements from approved library content.

---

## 1. Purpose

RequirementLibrary provides the organizational mechanism for managing, discovering, and reusing Requirements. It is a named, curated collection of approved Requirements, maintained by Library Managers, and made available to all Projects and Tenders within the Tenant.

Libraries make the Knowledge Flywheel operational: Requirements improved through Lessons Learned flow back into libraries, from where they are reused in future Projects.

---

## 2. Responsibilities

- Group approved Requirements into named, discoverable collections
- Enforce library-level governance (only approved Requirements may be assigned)
- Provide the discovery surface for Requirement reuse across Projects and Tenders
- Track library ownership and visibility scope
- Receive improvement proposals from LessonsLearnedRecord and route them to the appropriate library
- Track library-level metrics (reuse rate, contribution rate, coverage)

---

## 3. Business Context

When a Project starts, the first action is selecting Requirements from the Requirement Library. Without a well-maintained library, every Project would start from scratch — creating duplicate Requirements, inconsistent standards, and wasted effort.

The RequirementLibrary is the primary tool through which the platform's reuse-by-design principle is delivered. A high library reuse rate is a direct indicator of knowledge maturity in the organization.

---

## 4. Ownership

RequirementLibrary is owned by the Requirement Management (RM) bounded context. It is an organizational-layer asset (GBR-005): no ProjectId or TenderId may be its owner. Multiple Projects and Tenders across the Tenant reference the same libraries.

**Key distinction:**
- `RequirementLibrary` — the curated collection (organizational layer; owned by RM)
- `Requirement` — the individual versioned business expectation (organizational layer; owned by RM)
- A Tender's `TenderRequirementSnapshot` — a frozen set of RequirementVersionIds used in one specific Tender (project layer; owned by TM)

---

## 5. Aggregate Root

**Aggregate Root:** `RequirementLibrary`

The RequirementLibrary aggregate is the root for library identity, membership governance, and organizational visibility.

---

## 6. Entities

| Entity | Description |
|---|---|
| `LibraryEntry` | Links one `RequirementVersionId` to this library, with metadata (added by, added at, inclusion rationale) |
| `LibraryGovernanceRecord` | An audit record of a governance action (approval, removal, major update) at the library level |

---

## 7. Value Objects

| Value Object | Description |
|---|---|
| `LibraryCode` | Human-readable unique code within the Tenant (e.g., `RM-IT-CORE-2024`) |
| `LibraryType` | Configurable type: `DomainLibrary`, `FunctionLibrary`, `TemplateLibrary`, `ComplianceLibrary`, `IndustryStandard` — extensible |
| `LibraryStatus` | Enum: `Draft`, `Active`, `Archived` |
| `LibraryVisibility` | Enum: `OrganizationWide`, `DepartmentScoped`, `TeamPrivate` |
| `LibraryDescription` | Purpose description; not a prose document |

---

## 8. Lifecycle

```
Draft → Active → Archived
```

| State | Meaning | Requirements Assignable | Discoverable by Projects |
|---|---|---|---|
| `Draft` | Library being set up; not yet published for use | Yes (setup phase) | No |
| `Active` | Published; available for Project and Tender use | Yes (via Library Manager) | Yes |
| `Archived` | No longer maintained; historical reference only | No | Read-only |

**Archiving rule (LIB-BR-005):** Archiving a library does not deprecate the Requirements it contains. Requirements exist independently of libraries. A Requirement archived from a library continues to exist in the RM context.

---

## 9. Business Rules

| ID | Rule |
|---|---|
| LIB-BR-001 | A RequirementLibrary is an organizational asset; it has no ProjectId or TenderId owner (GBR-005) |
| LIB-BR-002 | Only `Approved` Requirements may be added to an `Active` library |
| LIB-BR-003 | A Library Manager must approve all library membership changes (addition and removal) |
| LIB-BR-004 | A RequirementLibrary may contain Requirements from multiple domains and categories |
| LIB-BR-005 | Archiving a library does not deprecate its Requirements |
| LIB-BR-006 | LibraryCode must be unique within a Tenant |
| LIB-BR-007 | A Requirement may belong to multiple libraries simultaneously |
| LIB-BR-008 | An archived library may not receive new Requirements |
| LIB-BR-009 | All library membership changes are auditable (GBR-001) |
| LIB-BR-010 | RequirementLibrary visibility may be scoped to an organizational unit (department or team); visibility does not restrict read access to existing Tenders |

---

## 10. Relationships

| Relationship | Direction | Type | Cardinality | Notes |
|---|---|---|---|---|
| `RequirementLibrary` → `Tenant` | N:1 | ID Reference | Library belongs to one Tenant | GBR-021 enforced |
| `RequirementLibrary` → `Requirement` | M:N | Versioned ID Reference (via `LibraryEntry`) | Library has many Requirements; Requirement may be in many libraries | `LibraryEntry.requirementVersionId` |
| `Project` → `RequirementLibrary` | External reference | ID Reference | Projects discover and select from libraries | Navigated via RM API |
| `Tender` → `RequirementLibrary` | External reference | ID Reference | Tenders source Requirements from library entries | Via RM API; not embedded |
| `LessonsLearnedRecord.improvementProposals[].targetLibraryId` → `RequirementLibrary` | External reference | ID Reference | Proposals may target a specific library for intake | Optional field |

---

## 11. Commands

| Command | Preconditions | State Transition |
|---|---|---|
| `CreateLibrary` | Library Manager role; LibraryCode unique in Tenant; type and description provided | — → `Draft` |
| `PublishLibrary` | Library Manager; library has at least one LibraryEntry; description complete | `Draft` → `Active` |
| `AddRequirementToLibrary` | Library Manager; Requirement is `Approved`; library is `Active` or `Draft` (LIB-BR-002) | No state change; LibraryEntry created |
| `RemoveRequirementFromLibrary` | Library Manager; removal reason provided | No state change; LibraryEntry removed |
| `UpdateLibraryDescription` | Library Manager; library not `Archived` | No state change |
| `UpdateLibraryVisibility` | Library Manager; library not `Archived` | No state change |
| `ArchiveLibrary` | Library Manager; no active Tenders currently drawing from this library | `Active` → `Archived` |
| `ReviewLibraryContent` | Library Manager; library is `Active`; periodic governance review | No state change; GovernanceRecord created |

---

## 12. Events

| Event | Trigger | Key Payload Fields |
|---|---|---|
| `RequirementLibraryCreated` | `CreateLibrary` | `libraryId`, `tenantId`, `libraryCode`, `type`, `createdAt` |
| `RequirementLibraryPublished` | `PublishLibrary` | `libraryId`, `tenantId`, `publishedAt` |
| `RequirementAddedToLibrary` | `AddRequirementToLibrary` | `libraryId`, `requirementId`, `requirementVersionId`, `addedBy`, `addedAt` |
| `RequirementRemovedFromLibrary` | `RemoveRequirementFromLibrary` | `libraryId`, `requirementId`, `reason`, `removedAt` |
| `RequirementLibraryArchived` | `ArchiveLibrary` | `libraryId`, `tenantId`, `archivedAt` |
| `LibraryContentReviewed` | `ReviewLibraryContent` | `libraryId`, `reviewedBy`, `reviewedAt`, `findingsSummary` |

---

## Permissions

| Action | Required Role | Condition |
|---|---|---|
| Create Library | Library Manager, Organization Admin | Within own Tenant |
| View Library and contents | Any authenticated User | Own Tenant; GBR-021 |
| Add Requirement to Library | Library Manager | Requirement must be `Approved` |
| Remove Requirement from Library | Library Manager | Reason required |
| Update Library description / visibility | Library Manager | Library not `Archived` |
| Publish Library | Library Manager | At least one entry; description complete |
| Archive Library | Library Manager | No active Tender dependencies |
| Review Library content | Library Manager | — |

---

## 13. Multi-Tenant Considerations

- A RequirementLibrary belongs to one Tenant (LIB-BR-001, GBR-021). Libraries are not shared across Tenants.
- Library discovery for Projects and Tenders is always scoped to the authenticated User's Tenant.
- Library visibility (`OrganizationWide`, `DepartmentScoped`, `TeamPrivate`) controls discoverability within the Tenant, but does not restrict access to Requirements already included in published Tenders.

---

## 14. Versioning

RequirementLibrary is not versioned as a whole. Individual Requirements within the library are versioned. When a newer version of a Requirement is published, the Library Manager may update the `LibraryEntry` to point to the new version, while the old version remains accessible through its own RequirementVersionId.

The library itself evolves through auditable membership changes (LibraryGovernanceRecord) without creating snapshot versions of the entire library.

---

## 15. API Considerations

| Endpoint | Method | Description |
|---|---|---|
| `/requirement-libraries` | GET | List libraries for the Tenant |
| `/requirement-libraries` | POST | Create a new library |
| `/requirement-libraries/{id}` | GET | Get library detail and entry count |
| `/requirement-libraries/{id}` | PATCH | Update library description or visibility |
| `/requirement-libraries/{id}/publish` | POST | Publish library |
| `/requirement-libraries/{id}/archive` | POST | Archive library |
| `/requirement-libraries/{id}/requirements` | GET | List Requirements in library |
| `/requirement-libraries/{id}/requirements` | POST | Add Requirement to library |
| `/requirement-libraries/{id}/requirements/{reqId}` | DELETE | Remove Requirement from library |
| `/requirement-libraries/search` | GET | Search across all libraries by keyword, type, or category |

The search endpoint is the primary reuse surface for Project Managers and Procurement Managers selecting Requirements.

---

## 16. AI Guidance

**AI may:**
- Detect duplicate or near-duplicate Requirements across libraries and flag them for Library Manager consolidation
- Suggest library assignment for newly approved Requirements based on content classification
- Identify Requirements with low reuse rates as candidates for review or deprecation
- Surface relevant library Requirements when a Project Manager begins scoping a new Project
- Detect library coverage gaps (e.g., a domain that has few or no approved Requirements)

**AI must not:**
- Add, remove, or reclassify Requirements in a library without human confirmation (ADR-005, LIB-BR-003)
- Archive libraries or deprecate Requirements
- Change library visibility settings

---

## 17. Machine Context

```yaml
domain: Requirement Management
aggregate_root: RequirementLibrary
bounded_context: RM
layer: Foundation
versioned: false
auditable: true

lifecycle_states:
  - Draft
  - Active
  - Archived

critical_invariants:
  - No ProjectId or TenderId as owner (GBR-005, LIB-BR-001)
  - Only Approved Requirements may be added to library (LIB-BR-002)
  - LibraryCode unique within Tenant (LIB-BR-006)
  - Archiving library does not deprecate its Requirements (LIB-BR-005)

referenced_by:
  - Project (discovers and selects Requirements via library)
  - Tender (sources Requirements from library for TenderRequirementSnapshot)
  - LessonsLearnedRecord.improvementProposals[].targetLibraryId (optional)

commands:
  - CreateLibrary
  - PublishLibrary
  - AddRequirementToLibrary
  - RemoveRequirementFromLibrary
  - UpdateLibraryDescription
  - UpdateLibraryVisibility
  - ArchiveLibrary
  - ReviewLibraryContent

events_produced:
  - RequirementLibraryCreated
  - RequirementLibraryPublished
  - RequirementAddedToLibrary
  - RequirementRemovedFromLibrary
  - RequirementLibraryArchived
  - LibraryContentReviewed

never:
  - allow_draft_or_unapproved_requirements_in_active_library
  - assign_project_id_as_library_owner
  - delete_library
  - cascade_deprecation_to_requirements_on_archive
  - ai_auto_add_or_remove_library_entries
```
