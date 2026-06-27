---
id: PKB-02-002
title: Project Domain Object
version: 2.0
status: APPROVED
owner: Domain Architecture
domain: Project Management
bounded_context: Project Management
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
used_by:
  - Tender
  - LessonsLearnedRecord
  - KnowledgeAsset
tags:
  - domain-model
  - aggregate
  - project
  - ddd
---

# Project Domain Object

---

## Bounded Context

**Context:** Project Management (PM)

**Role:** Coordination context — Project is the root organizational unit that provides context for all downstream execution aggregates (Tender, SupplierResponse, Evaluation, Decision, LessonsLearnedRecord). Project Management does not own business knowledge. It coordinates the lifecycle of a business initiative by referencing aggregates in other bounded contexts.

**Owns:** `Project` aggregate only.

**Does not own:** Requirements, Tenders, SupplierResponses, Evaluations, Decisions, KnowledgeAssets. All of these are referenced by `ProjectId`; they are not children of the Project aggregate.

---

## 1. Executive Summary

A Project is the organizational context in which a business initiative is executed.

Unlike many project management systems, a Project in adtender does **not** own reusable knowledge. It references reusable Business Objects such as Requirements, Templates and Knowledge Assets.

The Project coordinates the end-to-end business process from the initial idea to the transfer of lessons learned back into the organizational knowledge base.

---

## 2. Purpose

The Project provides:

- business context
- governance
- stakeholders
- scope
- schedule
- referenced knowledge
- tender execution
- decision documentation

A Project is the central coordination object of a business initiative.

---

## 3. Core Principle

Projects consume knowledge.

Projects create experience.

Projects do not own reusable knowledge.

Reusable knowledge always belongs to organizational libraries.

---

## 4. Typical Project Types

- Software Selection
- IT Procurement
- Manufacturing System Selection
- Supplier Qualification
- Investment Decision
- Technology Assessment
- Framework Agreement
- Strategic Sourcing

Project types must be configurable.

---

## 5. Lifecycle

1. Idea
2. Initiated
3. Planned
4. Active
5. TenderRunning
6. Evaluation
7. Decision
8. Award
9. Closing
10. Archived

---

## 6. State Model

| State | Meaning | Editable |
|---|---|---|
| `Idea` | Pre-initiation concept; Project Owner not yet assigned | Yes |
| `Initiated` | Formally started; Project Owner assigned | Yes |
| `Planned` | Scope and milestones defined; ready for execution | Yes |
| `Active` | Execution underway; Tenders may be created | Yes |
| `TenderRunning` | At least one Tender is in `Published` state | Limited |
| `Evaluation` | Submission period closed; evaluation underway | Limited |
| `Decision` | Decision Board convened | Limited |
| `Award` | Decision approved; handover underway | Limited |
| `Closing` | Post-award activities; LessonsLearnedRecord in progress | Limited |
| `Archived` | All obligations fulfilled; read-only historical record | No |
| `Cancelled` | Project terminated before successful completion | No |

---

## Core Business Objects

A Project references:

- Requirement
- Requirement Library
- Tender
- Supplier
- Supplier Response
- Evaluation
- Decision
- Contract
- Knowledge Asset
- Workflow
- Document

---

## 7. Responsibilities

The Project is responsible for:

- defining objectives
- defining scope
- assigning stakeholders
- managing milestones
- coordinating tenders
- documenting decisions
- capturing lessons learned

---

## Scope

**In scope (Project Management context):**
- Project lifecycle governance (Idea through Archived)
- Project membership and role assignments
- Project milestones and timeline
- Cross-domain lifecycle coordination (triggering Tender creation, initiating Lessons Learned)
- Cross-aggregate gate enforcement at archiving (checking LessonsLearnedRecord status)

**Out of scope:**
- Requirement content or lifecycle (Requirement Management)
- Tender content or evaluation model (Tender Management)
- Supplier Response data (Supplier Management)
- Evaluation scores (Evaluation Management)
- Decision rationale (Decision Management)
- KnowledgeAsset content (Knowledge Management)
- Contract management (Integration/CLM)

---

## 8. Business Rules

PROJ-BR-001 Every Project has exactly one Project Owner.

PROJ-BR-002 Every Project belongs to one Organization.

PROJ-BR-003 Every Tender belongs to one Project; every Decision is scoped to a Tender.

PROJ-BR-004 Requirements are referenced by Projects, not owned by them. Reusable knowledge belongs to organizational libraries.

PROJ-BR-005 Closing a Project initiates the Lessons Learned workflow (GBR-018).

PROJ-BR-006 Archived Projects remain searchable and auditable.

PROJ-BR-007 A Project cannot be archived while its LessonsLearnedRecord is not in `Submitted` state (GBR-018 enforcement via lifecycle gate LG-005).

PROJ-BR-008 Project types must be configurable; no industry-specific type may be hardcoded.

PROJ-BR-009 A cancelled Project must record a cancellation reason.

PROJ-BR-010 All Project actions are auditable (GBR-001).

---

## 9. Commands

| Command | Preconditions | State Transition |
|---|---|---|
| `CreateProject` | Project Owner assigned; Organization identified | — → `Initiated` |
| `UpdateProject` | Project not in `Archived` or `Cancelled` state | No state change |
| `AssignProjectOwner` | User exists in Organization Management | No state change |
| `AddProjectMember` | Project not in `Archived` or `Cancelled`; User exists | No state change |
| `ActivateProject` | Scope and milestones defined | `Planned` → `Active` |
| `CloseProject` | At least one Tender in `Awarded` state | `Award` → `Closing` |
| `ArchiveProject` | `LessonsLearnedRecord.status == Submitted` (LG-005, GBR-018) | `Closing` → `Archived` |
| `CancelProject` | Cancellation reason provided; Project Owner authority | any → `Cancelled` |
| `InitiateTender` | Project in `Active` or later state | Delegates to Tender Management |

---

## 10. Events

**Events produced by Project Management:**

| Event | Trigger | Payload |
|---|---|---|
| `ProjectCreated` | `CreateProject` | `projectId`, `tenantId`, `ownerId`, `createdAt` |
| `ProjectUpdated` | `UpdateProject` | `projectId`, `changedFields`, `updatedAt` |
| `ProjectActivated` | `ActivateProject` | `projectId`, `activatedAt` |
| `ProjectClosed` | `CloseProject` | `projectId`, `closedAt` |
| `ProjectArchived` | `ArchiveProject` | `projectId`, `archivedAt` |
| `ProjectCancelled` | `CancelProject` | `projectId`, `reason`, `cancelledAt` |

**Events subscribed to (produced by other contexts):**

| Event | Producer | Action in PM |
|---|---|---|
| `TenderCreated` | Tender Management | Update project state tracking |
| `TenderAwarded` | Tender Management | Advance project to Award phase |
| `LessonsLearnedRecordApproved` | Knowledge Management | Signal readiness for archiving |

---

## 11. AI Support

AI may assist with:

- project planning
- missing stakeholder detection
- requirement completeness
- schedule risk
- project health
- executive summaries
- lessons learned extraction

AI must never close, archive, or cancel a project automatically.

AI recommendations require human confirmation before any project state change (ADR-005).

---

## 12. Aggregate Design

**Aggregate Root:** `Project`

**Entities within the Project aggregate:**

| Entity | Description |
|---|---|
| `ProjectMember` | User with an assigned role within the Project |
| `ProjectMilestone` | A named, dated checkpoint in the project timeline |
| `ProjectObjective` | A defined goal or success criterion for the Project |

**Referenced aggregates (by ID, not owned):**

| Referenced Aggregate | Context | Reference Type |
|---|---|---|
| `Tender` | Tender Management | `TenderId` — navigated via TM API |
| `Requirement` | Requirement Management | `RequirementId` — requirements referenced in scope |
| `LessonsLearnedRecord` | Knowledge Management | `ProjectId` — LLR holds the reference; PM reads status via KM API |
| `KnowledgeAsset` | Knowledge Management | `KnowledgeAssetId` — referenced templates |
| `User` | Organization Management | `UserId` — Project Owner and Members |

---

## 13. Value Objects

| Value Object | Description |
|---|---|
| `ProjectType` | Configurable type enum (Software Selection, IT Procurement, etc.) |
| `ProjectStatus` | State machine value (Idea, Initiated, Planned, Active, …, Archived) |
| `ProjectObjective` | Title + description; no identity |
| `MilestoneDate` | Date + milestone name; date must be in future at creation |
| `CancellationReason` | Free text; mandatory when Project is cancelled |

---

## 14. API Guidelines

| Endpoint | Method | Description |
|---|---|---|
| `/projects` | GET | List projects for tenant |
| `/projects` | POST | Create new project |
| `/projects/{id}` | GET | Get project detail |
| `/projects/{id}` | PATCH | Update project |
| `/projects/{id}/activate` | POST | Activate project |
| `/projects/{id}/close` | POST | Close project |
| `/projects/{id}/archive` | POST | Archive project (gate: LessonsLearnedRecord.Submitted) |
| `/projects/{id}/cancel` | POST | Cancel project |
| `/projects/{id}/members` | GET | List project members |
| `/projects/{id}/members` | POST | Add project member |
| `/projects/{id}/milestones` | GET | List milestones |
| `/projects/{id}/milestones` | POST | Add milestone |
| `/projects/{id}/tenders` | GET | List Tenders for project (delegates to TM API) |

APIs must not expose database structure directly. All responses include `projectId` and `tenantId` for isolation.

---

## Permissions

| Action | Required Role | Condition |
|---|---|---|
| Create Project | Project Manager, Organization Admin | — |
| View Project | Any authenticated member | Must be member of the project or have tenant-level read role |
| Update Project | Project Owner, Project Manager | Project not Archived or Cancelled |
| Assign Project Owner | Organization Admin | — |
| Add Project Member | Project Owner, Project Manager | — |
| Activate Project | Project Owner | Project in Planned state |
| Close Project | Project Owner | At least one Tender in Awarded state |
| Archive Project | Project Owner | LessonsLearnedRecord in Submitted state (GBR-018) |
| Cancel Project | Project Owner, Organization Admin | Cancellation reason mandatory |
| View all Projects (tenant) | Organization Admin, Reporting role | Tenant-level access only; GBR-021 enforced |

---

## 15. KPIs

- Project duration
- Budget variance
- Requirement reuse rate
- Tender duration
- Evaluation duration
- Decision lead time
- Lessons learned completion

---

## 16. Anti-Patterns

Do not:

- duplicate Requirements into Projects
- store reusable knowledge only inside Projects
- couple Projects tightly to one industry
- make Project the owner of Business Rules
- embed Tender content, Evaluation scores, or Decision rationale inside the Project aggregate
- allow `ArchiveProject` to bypass the LessonsLearnedRecord gate (GBR-018)

---

## 17. Machine Context

```yaml
domain: Project Management
aggregate_root: Project
bounded_context: PM
versioned: true
auditable: true

lifecycle_states:
  - Idea
  - Initiated
  - Planned
  - Active
  - TenderRunning
  - Evaluation
  - Decision
  - Award
  - Closing
  - Archived
  - Cancelled

references:
  by_id:
    - Requirement (RM)
    - Tender (TM — navigated via TM API)
    - User (OM)
    - KnowledgeAsset (KM)
  lifecycle_gate:
    - LessonsLearnedRecord.status == Submitted (KM API) — required before ArchiveProject

commands:
  - CreateProject
  - UpdateProject
  - AssignProjectOwner
  - AddProjectMember
  - ActivateProject
  - CloseProject
  - ArchiveProject
  - CancelProject
  - InitiateTender

events_produced:
  - ProjectCreated
  - ProjectUpdated
  - ProjectActivated
  - ProjectClosed
  - ProjectArchived
  - ProjectCancelled

events_subscribed:
  - TenderCreated (TM)
  - TenderAwarded (TM)
  - LessonsLearnedRecordApproved (KM)

never:
  - own_global_knowledge
  - duplicate_requirements
  - embed_tender_content
  - bypass_lessons_learned_gate
  - ai_auto_close_or_archive
```

---

## 18. Implementation Guidance

Implement in this order:

1. Project aggregate with lifecycle state machine
2. ProjectMember entities
3. ProjectMilestone entities
4. Lifecycle commands and transitions
5. Cross-context relationships (TenderId references, LessonsLearnedRecord gate)
6. Domain events
7. Audit history
8. API endpoints

UI comes after the domain model is complete and tested.

Do not implement Project as a simple CRUD entity. The lifecycle state machine and cross-aggregate gate at archiving are non-negotiable domain constraints.
