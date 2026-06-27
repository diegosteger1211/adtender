---
id: PKB-00-MASTER
title: AI Master Context — adtender Platform Constitutional Document
version: 1.0
status: APPROVED
owner: Product Architecture
audience:
  - Product Owner
  - Architect
  - Developer
  - AI Coding Agent
depends_on:
  - PKB-00-000
  - PKB-00-001
  - PKB-00-002
  - PKB-00-003
  - PKB-00-004
tags:
  - constitutional
  - master-context
  - ai
  - architecture
  - platform
---

# AI Master Context — adtender Platform

> **This is the constitutional document of the adtender platform.**
>
> Every AI agent, architect, developer and product owner working on adtender must read this document before contributing. It supersedes informal conventions and provides the authoritative foundation for all decisions, implementations and extensions on the platform.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Product Mission](#2-product-mission)
3. [Product Philosophy](#3-product-philosophy)
4. [Product Principles](#4-product-principles)
5. [Architecture Principles](#5-architecture-principles)
6. [Domain Driven Design Principles](#6-domain-driven-design-principles)
7. [Business Object Philosophy](#7-business-object-philosophy)
8. [Knowledge Management Philosophy](#8-knowledge-management-philosophy)
9. [Decision Management Philosophy](#9-decision-management-philosophy)
10. [AI Principles](#10-ai-principles)
11. [Repository Structure](#11-repository-structure)
12. [Naming Conventions](#12-naming-conventions)
13. [Coding Principles](#13-coding-principles)
14. [UI Principles](#14-ui-principles)
15. [API Principles](#15-api-principles)
16. [Event Driven Principles](#16-event-driven-principles)
17. [Versioning Principles](#17-versioning-principles)
18. [Configuration vs Customization](#18-configuration-vs-customization)
19. [Business Rules Philosophy](#19-business-rules-philosophy)
20. [Product Roadmap Vision](#20-product-roadmap-vision)

---

## 1. Product Vision

adtender is an **Enterprise Decision & Knowledge Platform**.

The vision is an organizational intelligence layer where every completed business process enriches the institutional knowledge base, and every new initiative benefits from accumulated structured knowledge.

Tender Management is the first business domain implemented on the platform. It is not the totality of the platform. The architecture must remain open for any future decision-centric domain: investment decisions, strategic sourcing, vendor qualification, partnership selection, technology assessments, and beyond.

The long-term vision has three dimensions:

### 1.1 Organizational Memory

Organizations forget what they know. People change jobs. Decisions get buried in email threads. Tender documents sit in shared drives. adtender replaces this institutional amnesia with structured, searchable, reusable organizational memory. Knowledge accumulated in one project becomes a resource for the next.

### 1.2 Structured Decision Intelligence

Most enterprise decisions are poorly documented. The path to a decision is rarely preserved. adtender captures not just the outcome but the complete rationale: which requirements were evaluated, how suppliers responded, how scores were derived, which trade-offs were accepted, who approved what and why.

### 1.3 Human-Governed AI Augmentation

AI assists every stage of the process — detecting requirement gaps, identifying duplicates, summarizing complex evaluation data, recommending reuse — but human judgment and human accountability remain non-negotiable. The platform improves over time as AI learns from structured historical data, not from unstructured documents.

---

## 2. Product Mission

adtender supports organizations in making **structured, transparent and reusable business decisions**.

The mission translates into four operational commitments:

**Structure** — Business expectations, supplier responses, evaluations and decisions are captured as structured data objects, not prose documents.

**Transparency** — Every recommendation, scoring result and decision is explainable and traceable to its source data.

**Reuse** — Knowledge created in one project is made available for future projects. Requirements, templates, lessons learned and best practices are organizational assets, not project waste.

**Governance** — No business-critical action is taken without human authorization. AI augments; it does not govern.

---

## 3. Product Philosophy

### 3.1 Decisions, Not Documents

Documents are outputs, attachments and evidence. They are the residue of structured decisions, not the decisions themselves. adtender captures structured Business Objects — Requirements, Evaluations, Decisions — and can generate documents from them. Documents may never become the primary source of truth.

A document cannot be compared. A document cannot be scored. A document cannot be reused reliably. A structured Business Object can do all three.

### 3.2 Knowledge, Not Archives

Closed projects are not dead projects. Every project produces experience that the organization should be able to reuse. adtender transforms project outcomes into institutional knowledge: improved Requirements, better templates, lessons learned, baseline evaluation criteria. Archiving is the beginning of knowledge, not the end of it.

### 3.3 Reuse, Not Recreation

Before any new content is created, the platform must surface relevant existing knowledge. Requirement Libraries, historical evaluation criteria, approved templates, and documented lessons learned should be the first resource, not the last resort. Every unnecessary recreation of existing knowledge is a measurable organizational inefficiency.

### 3.4 Platform, Not Application

adtender is not a vertical application for one industry or one use case. The architecture must remain neutral with respect to domain, industry, procurement category and decision type. Business rules, workflows, categories, response types and evaluation models must all be configurable, not hardcoded.

### 3.5 Human Accountability

AI makes suggestions. Humans make decisions. This is not a limitation; it is a design principle. In regulated environments, public procurement contexts and high-stakes commercial decisions, accountability cannot be delegated to an algorithm. adtender is built to amplify human judgment, not to replace it.

---

## 4. Product Principles

These principles govern all product decisions. When in doubt, return to these principles.

| ID | Principle | Meaning |
|---|---|---|
| P-001 | Business Objects First | Business Objects define the platform. Screens, APIs and database structures are derived from them, not the reverse. |
| P-002 | Knowledge by Design | Every feature must either contribute to structured knowledge or improve decision quality. Features that do neither must be justified. |
| P-003 | Reuse by Default | The platform must always prompt users toward reuse before creation. |
| P-004 | Configuration before Programming | Business behavior — categories, workflows, validation rules, evaluation models — must be configurable. Hardcoded behavior is a technical debt. |
| P-005 | Human in the Loop | AI recommendations require human confirmation before they become business actions. |
| P-006 | Explainability | Every recommendation, evaluation score and decision must be traceable to the structured data that produced it. |
| P-007 | Traceability | Important business information must remain traceable across its full lifecycle. Deletions are not permitted where traceability is required. |
| P-008 | Domain Neutrality | No industry-specific assumption may be hardcoded. The platform must support IT procurement, manufacturing selection, logistics decisions and any other domain equally. |
| P-009 | Platform Thinking | Every capability must be designed as a reusable component of the platform, not as a one-off feature for one use case. |
| P-010 | Decision Documentation | The path to a decision is as important as the decision itself. Rationale, evidence, deliberation and approval are all first-class data. |

---

## 5. Architecture Principles

These principles govern all technical architecture decisions.

| ID | Principle | Meaning |
|---|---|---|
| AP-001 | Domain Driven Design | The technical architecture mirrors the business domain model. Technology follows domain, never the reverse. |
| AP-002 | Business Logic in Domain Layer | Business rules must live in domain objects and domain services. Controllers, handlers and UI components must remain thin. |
| AP-003 | API First | Every business capability must be exposed through a versioned, stable API before any UI is built on top of it. |
| AP-004 | Event Driven Business Facts | Relevant state transitions produce immutable, named domain events. These events are the integration contract between domains. |
| AP-005 | Version Everything Important | Business Objects with lifecycle relevance must support explicit versioning. A version is an immutable snapshot of truth at a point in time. |
| AP-006 | Audit Everything Relevant | Every action with business significance must be auditable. Audit records are immutable and must not be deletable. |
| AP-007 | Single Source of Truth | Every Business Object has one authoritative owner. Duplicate representations across services are prohibited without explicit synchronization contracts. |
| AP-008 | Loose Coupling | Domains interact through explicit APIs, events and clearly defined relationship references. Direct cross-domain database queries are prohibited. |
| AP-009 | Configuration Layer | Customer-specific and tenant-specific behavior must be expressed as configuration, not as code branches or forks. |
| AP-010 | Knowledge Layer | Reusable knowledge (Requirements, Templates, Libraries, Lessons Learned) must be architecturally separated from project-specific usage. A project references knowledge; it does not own it. |
| AP-011 | No Logic in UI | No business rule, validation logic or data transformation may be implemented in a UI component. |
| AP-012 | No Logic in Controllers | API controllers and handlers route and translate. They do not implement business decisions. |
| AP-013 | Fail Explicitly | The system must communicate clear, structured error states. Silent failures and uncommunicated data loss are prohibited. |
| AP-014 | Secure by Design | Authentication, authorization and data isolation must be addressed at the architecture level, not added as afterthoughts. |

---

## 6. Domain Driven Design Principles

adtender is built on Domain Driven Design. The following DDD concepts apply across the entire platform.

### 6.1 Ubiquitous Language

A single shared vocabulary applies across all layers — domain model, API, UI, database, events and documentation. The terms Project, Requirement, Tender, Evaluation, Decision, Supplier, Knowledge Asset and Workflow have precise meanings defined in the Product Glossary. These terms must not be casually renamed, abbreviated or replaced in code, APIs or documentation.

All code identifiers — class names, method names, variable names, API resources, event names — must use the ubiquitous language. Using `procurementItem` where `requirement` is the correct term is a violation.

### 6.2 Bounded Contexts

The platform is composed of bounded contexts. Each context has clear ownership, defined interfaces and its own internal model. Cross-context communication happens only through explicit APIs or domain events. The primary bounded contexts are:

- **Project Management** — Project lifecycle, stakeholders, milestones
- **Requirement Management** — Requirement creation, versioning, library management, reuse
- **Tender Management** — Tender creation, publication, supplier invitation
- **Supplier Management** — Supplier profiles, collaboration, communication
- **Evaluation Management** — Structured evaluation of supplier responses
- **Decision Management** — Decision documentation, rationale, approval
- **Knowledge Management** — Libraries, templates, lessons learned, knowledge assets
- **Workflow Management** — Configurable process orchestration
- **Organization Management** — Users, roles, permissions, tenants
- **Reporting** — Aggregated views, analytics, dashboards
- **Integration** — External system connectors

### 6.3 Aggregate Roots

Each bounded context exposes Aggregate Roots as its primary access point. The Aggregate Root enforces all business invariants within its boundary. External contexts reference the Aggregate Root by identity only; they never access internal entities directly.

Example: `SupplierResponse` references a `Requirement` by its `RequirementVersionId`. It does not embed or directly mutate the `Requirement` aggregate.

### 6.4 Aggregates, Entities and Value Objects

- **Aggregates** own the consistency boundary. All mutations enter through the Aggregate Root.
- **Entities** have identity and lifecycle within an aggregate.
- **Value Objects** are immutable, identity-free descriptors. Priority, Status, VersionNumber, RequirementCode are Value Objects.

### 6.5 Domain Events

A Domain Event describes something that happened in the domain. It is always named in the past tense. It is immutable. It carries all context needed to react to it.

Examples: `RequirementApproved`, `TenderPublished`, `EvaluationCompleted`, `DecisionRecorded`.

### 6.6 Domain Services

Cross-aggregate business logic that does not naturally belong to a single aggregate lives in a Domain Service. Domain Services are stateless, named after business operations and operate on domain objects.

### 6.7 Repositories

A Repository provides collection-like access to Aggregates. It abstracts persistence. Business logic must not depend on a specific persistence technology.

---

## 7. Business Object Philosophy

Business Objects are the primary unit of platform value. This is not a technical preference — it is a product philosophy.

### 7.1 What Is a Business Object

A Business Object is a domain concept that has:

- **Identity** — it exists independently and can be referenced
- **Lifecycle** — it transitions through defined states
- **Governance** — it has an owner, an approval state and traceability
- **Relationships** — it connects meaningfully to other Business Objects
- **Business Rules** — constraints and invariants govern its behavior

The primary Business Objects of adtender are:

| Business Object | Domain | Description |
|---|---|---|
| Project | Project Management | The governing context for a business initiative |
| Requirement | Requirement Management | A structured, reusable, versioned business expectation |
| Requirement Library | Requirement Management | A curated collection of reusable Requirements |
| Tender | Tender Management | A structured procurement or selection process |
| Supplier | Supplier Management | An external organization participating in a tender |
| Tender Response | Supplier Management | A structured supplier answer to published Requirements |
| Evaluation | Evaluation Management | A structured assessment of supplier responses |
| Decision | Decision Management | An accountable business decision with documented rationale |
| Knowledge Asset | Knowledge Management | Reusable organizational knowledge derived from experience |
| Workflow | Workflow Management | A configurable orchestration of business tasks and approvals |

### 7.2 Business Objects Are Not Tables

A Business Object is not defined by a database schema. The domain model drives the data model, not the reverse. Implementation starts with the domain object — its attributes, lifecycle, business rules, commands and events — before any persistence mechanism is chosen.

### 7.3 Business Objects Are Not Forms

A Business Object is not defined by a UI form. Forms render Business Objects. They do not define them.

### 7.4 Business Objects Are Not Documents

Documents may render Business Objects as output. A generated PDF of a Tender is an export, not the source of truth. The structured Tender object, with its Requirements, Suppliers, Evaluation Criteria and Governance properties, is the truth.

### 7.5 Lifecycle Is Mandatory

Every Business Object with governance relevance must have an explicit lifecycle. Lifecycle states are not cosmetic labels; they determine what operations are permitted, what data is mutable, and what workflows are triggered.

### 7.6 The Implementation Order

For every new Business Object, implementation follows this sequence:

1. Define the domain concept and its ubiquitous language term
2. Define attributes, types and value objects
3. Define the lifecycle and state model
4. Define business rules
5. Define commands and their preconditions
6. Define events produced by commands
7. Define relationships to other Business Objects
8. Define the aggregate boundary
9. Define the API contract
10. Define the persistence model
11. Define the UI representation

**Steps 1–8 must be complete before steps 9–11 begin.**

---

## 8. Knowledge Management Philosophy

Knowledge Management is not a supporting feature of adtender. It is a core design objective of the platform.

### 8.1 Knowledge Is Structural, Not Documentary

Organizational knowledge in adtender is encoded as structured Business Objects. A Requirement Library is not a document library. It is a structured collection of reusable, versioned, classified Requirements with metadata, relationships and governance.

### 8.2 The Knowledge Lifecycle

Knowledge flows through a continuous cycle on the platform:

```
Library → Project → Tender → Evaluation → Decision → Lessons Learned → Improved Library
```

Every completed project is an opportunity to improve the knowledge base. This must be supported explicitly by the platform, not treated as an optional afterthought.

### 8.3 Reuse Is a First-Class Workflow

When a user creates a Requirement, the first action the platform must take is to search for existing relevant Requirements in accessible libraries. Reuse is not a nice-to-have; it is the primary workflow. Creation is the secondary workflow.

### 8.4 Knowledge Assets

Beyond Requirements, the platform supports Knowledge Assets — structured records of organizational learning that do not fit other object types. A Knowledge Asset may represent a risk pattern, a lessons learned insight, a supplier profile, a technology assessment, a market observation or a decision precedent.

### 8.5 Library Architecture

Libraries are not project-owned. They belong to the organizational layer. A project references library content; it does not own it. When a project improves library content, it proposes a change back to the library, which undergoes its own approval workflow.

This separation ensures that library quality is maintained independently of project-specific adaptations.

### 8.6 The Anti-Pattern: Knowledge Silos

The most damaging organizational pattern is knowledge accumulation within projects that is never transferred to the organizational knowledge base. adtender must structurally prevent this by making the Lessons Learned and Knowledge Contribution workflows a required step in the Project Closing process.

---

## 9. Decision Management Philosophy

Decisions are the primary output of every business process on adtender. All other activities — requirement engineering, tender creation, supplier collaboration, evaluation — are in service of producing a high-quality, explainable, defensible decision.

### 9.1 Decisions Are Business Objects

A Decision is not a free-text approval note or a signed document. It is a structured Business Object with:

- identity
- the question or problem being decided
- the Business Objects it references (Requirements, Evaluations, Supplier Responses)
- the rationale
- accepted risks and trade-offs
- the approver(s)
- the approval date
- the lifecycle state

### 9.2 Traceability Is Non-Negotiable

A Decision must be fully traceable to the data that justified it. At minimum, this means:

- which Requirement versions were evaluated
- which Supplier Responses were assessed
- which Evaluation Scores contributed
- which trade-offs were explicitly accepted
- who approved and when

Decisions that cannot be reconstructed from platform data have failed their governance obligation.

### 9.3 Decisions Are Immutable After Approval

Once a Decision is approved, it must become immutable. If circumstances change and a decision must be revised, a new Decision version must be created with an explicit reference to the superseded decision.

### 9.4 AI Must Not Make Decisions

AI may produce scoring summaries, risk analysis, consistency checks, and recommendation signals. It must never directly set a Decision status to Approved, select a winner, or take any action that constitutes the actual business decision. A human must perform the final accountable action.

### 9.5 The Decision Audit Trail

The platform must maintain a complete audit trail of everything that contributed to a decision. This includes AI recommendations that were accepted or rejected, evaluator comments, scoring revisions, and stakeholder approvals. This audit trail must remain accessible after the project is archived.

---

## 10. AI Principles

AI is a first-class architectural component of adtender, not an optional feature module.

### 10.1 AI Role Definition

AI on adtender acts as an **intelligent assistant**. Its role is to improve the quality of human work, surface relevant knowledge, identify gaps and risks, and reduce unnecessary cognitive load. It must never act autonomously in ways that produce binding business outcomes.

### 10.2 Non-Negotiable AI Rules

The following rules are absolute and may not be overridden by configuration, product decisions or development shortcuts:

- AI must not approve Business Objects.
- AI must not publish Business Objects.
- AI must not delete or archive Business Objects.
- AI must not modify approved or published versions of Business Objects.
- AI must not remove or alter audit records.
- AI must not remove traceability.
- AI must not make or record accountable Decisions.
- AI must not assign or change access permissions.
- AI recommendations that affect business state must be displayed as suggestions requiring explicit human confirmation.
- Every AI-assisted change must be logged with its source (AI model, prompt type, confidence context).

### 10.3 AI Capabilities by Domain

AI may assist in the following areas:

| Domain | AI Capabilities |
|---|---|
| Requirement Management | Duplicate detection, wording improvement, ambiguity detection, completeness analysis, classification suggestions, reuse recommendations, translation, summarization |
| Tender Management | Template recommendations, scope gap detection, regulatory compliance hints, supplier matching suggestions |
| Evaluation Management | Scoring summaries, anomaly detection, evaluator consistency analysis, risk flag highlighting, executive briefing generation |
| Decision Management | Rationale summarization, missing evidence detection, decision precedent recommendations, risk analysis |
| Knowledge Management | Knowledge gap detection, library enrichment suggestions, lessons learned extraction, deduplication |
| Project Management | Timeline risk detection, missing stakeholder alerts, requirement completeness scoring, health dashboard generation |

### 10.4 Explainability Requirement

Every AI-generated recommendation must carry:

- the data sources it was based on
- the confidence level or rationale
- the ability to inspect and challenge the reasoning
- a clear UI distinction from human-authored content

### 10.5 AI Context Loading

AI agents working on adtender must load context in the following order before performing any implementation task:

1. `00_Product_DNA/AI_MASTER_CONTEXT.md` (this document)
2. `00_Product_DNA/AI_BOOTSTRAP.md`
3. `00_Product_DNA/Product_DNA.md`
4. `00_Product_DNA/Product_Principles.md`
5. `00_Product_DNA/Architecture_Principles.md`
6. The relevant `02_Domain_Model/*.md` for the objects being implemented
7. The relevant `01_Business/BP*.md` for the business process being supported

Implementing without reading the domain model is a violation of the mandatory platform rule: **no implementation starts before the related business object is described**.

### 10.6 AI Coding Agent Directives

When an AI coding agent implements code for adtender:

- Start from the domain model, not the database schema or UI mockup.
- Use the ubiquitous language defined in the Product Glossary in all identifiers.
- Place business logic in the domain layer.
- Implement business rules as explicit, named, testable rule objects.
- Never implement business rules in controllers, handlers or UI components.
- Produce domain events for every significant state change.
- Make audit records part of every aggregate's design.
- Never implement UI before the domain model and API are complete.
- When uncertain about domain intent, consult the relevant Domain Model document before making assumptions.

---

## 11. Repository Structure

The adtender repository follows a layered documentation and source structure.

### 11.1 Product Knowledge Base

```
docs/
└── product-knowledge/
    ├── README.md                  — Knowledge base entry point
    ├── INDEX.md                   — Document index and reading order
    ├── 00_Product_DNA/            — Platform identity, principles, ADRs
    │   ├── AI_MASTER_CONTEXT.md   — THIS DOCUMENT (read first)
    │   ├── AI_BOOTSTRAP.md        — AI agent bootstrap directives
    │   ├── Product_DNA.md         — Vision, mission, philosophy
    │   ├── Product_Principles.md  — Product principles (P-001 to P-010)
    │   ├── Architecture_Principles.md — Architecture principles (AP-001+)
    │   ├── Product_Glossary.md    — Ubiquitous language definitions
    │   └── ADR/                   — Architecture Decision Records
    ├── 01_Business/               — Business domains, processes, roles, rules
    ├── 02_Domain_Model/           — Business Object specifications
    ├── 03_Functional/             — Functional capability specifications
    ├── 04_UI/                     — Workspace, navigation and UX specifications
    ├── 05_Technical/              — Technical service, API and infrastructure specs
    ├── 06_AI/                     — AI guidelines, prompting and model behavior
    └── 07_Development/            — Coding guidelines, patterns and implementation rules
```

### 11.2 Folder Ownership

| Folder | Owner | Purpose |
|---|---|---|
| `00_Product_DNA` | Product Architecture | Constitutional documents — not changed without formal review |
| `01_Business` | Business Architecture | Business process and domain knowledge |
| `02_Domain_Model` | Domain Architecture | Business Object definitions — authoritative model |
| `03_Functional` | Product Management | Functional specifications per capability |
| `04_UI` | UX / Product | Workspace and interaction specifications |
| `05_Technical` | Software Architecture | Technical architecture and infrastructure |
| `06_AI` | AI Architecture | AI behavior, prompting and model guidelines |
| `07_Development` | Engineering | Coding patterns, testing, tooling |

### 11.3 Document Metadata Standard

Every document in the Product Knowledge Base must carry a YAML frontmatter block:

```yaml
---
id: PKB-{section}-{sequence}
title: {Full Document Title}
version: {major.minor}
status: DRAFT | REVIEW | APPROVED | DEPRECATED
owner: {Team or Role}
audience:
  - {Audience}
depends_on:
  - {Document ID}
---
```

---

## 12. Naming Conventions

Consistent naming is a platform-wide discipline. Inconsistent naming breaks the ubiquitous language and creates cognitive friction for every reader and AI agent.

### 12.1 Domain Object Naming

- Use **PascalCase** for all domain concepts: `Requirement`, `TenderResponse`, `KnowledgeAsset`.
- Use the exact terms defined in the Product Glossary. Never abbreviate or paraphrase in code.
- Aggregate Roots use their singular domain name: `Project`, `Requirement`, `Tender`.
- Collections use the plural: `requirements`, `tenders`, `suppliers`.

### 12.2 Event Naming

Domain Events use **PascalCase** and are always **past tense**, describing what happened:

- `RequirementCreated`
- `TenderPublished`
- `EvaluationCompleted`
- `DecisionApproved`
- `ProjectArchived`

Events must never be named in the present tense (`RequirementCreate`) or imperative (`CreateRequirement`).

### 12.3 Command Naming

Commands use **PascalCase** and are always **imperative**, expressing intent:

- `CreateRequirement`
- `PublishTender`
- `SubmitResponse`
- `RecordDecision`
- `ArchiveProject`

### 12.4 API Resource Naming

REST API resources use **lowercase kebab-case** in plural:

- `/projects`
- `/requirements`
- `/tender-responses`
- `/knowledge-assets`
- `/requirement-libraries`

Sub-resources follow the parent:

- `/projects/{id}/tenders`
- `/requirements/{id}/versions`
- `/requirements/{id}/relations`

Action endpoints use a verb suffix when the operation is not a standard CRUD action:

- `POST /requirements/{id}/submit-review`
- `POST /requirements/{id}/approve`
- `POST /tenders/{id}/publish`

### 12.5 File and Document Naming

- Product Knowledge Base documents: `PascalCase.md` (e.g., `Product_DNA.md`)
- Business process documents: `BP{nn}_{Name}.md` (e.g., `BP06_Tender_Creation.md`)
- ADRs: `ADR-{nnn}-{short-title}.md` (e.g., `ADR-001-business-objects-first.md`)
- Domain Model documents: `{ObjectName}.md` (e.g., `Requirement.md`, `Project.md`)

### 12.6 Code File Naming

- Domain entities: `{ObjectName}.ts` / `{ObjectName}.java` / `{ObjectName}.cs`
- Aggregate roots: `{ObjectName}Aggregate.ts`
- Repositories: `{ObjectName}Repository.ts`
- Domain services: `{OperationName}Service.ts`
- Commands: `{CommandName}Command.ts` or `{CommandName}.command.ts`
- Events: `{EventName}Event.ts` or `{EventName}.event.ts`
- Value objects: `{ObjectName}.ts` (no suffix needed; placement in a `value-objects/` folder signals intent)

### 12.7 Database Naming

- Tables use `snake_case` in plural: `requirements`, `tender_responses`, `knowledge_assets`
- Columns use `snake_case`: `created_at`, `requirement_version_id`, `approval_state`
- Foreign keys use `{referenced_table_singular}_id`: `requirement_id`, `project_id`
- No abbreviations: `req` is not a substitute for `requirement`

---

## 13. Coding Principles

### 13.1 Domain Layer Is Authoritative

Business logic lives in the domain layer. No exceptions. The persistence layer, the API layer and the UI layer are all consumers of the domain layer. They must not duplicate, override or bypass domain logic.

### 13.2 Rich Domain Models

Prefer rich domain models over anemic models. A `Requirement` object must not be a simple data bag. It must expose business-meaningful operations, enforce its own invariants and emit events when its state changes.

```
// Anemic — prohibited
requirement.status = 'Approved'

// Rich — required
requirement.approve(approvedBy, timestamp)
// internally validates preconditions, updates state, records history, emits RequirementApproved
```

### 13.3 Explicit Business Rules

Business rules must be implemented as explicit, named, testable constructs — not as inline conditionals buried in service methods. A rule should be identifiable by its ID (e.g., `REQ-BR-003`) in the codebase.

### 13.4 No Cross-Aggregate Direct Access

An aggregate must never directly mutate another aggregate. Cross-aggregate communication happens through:

- Domain Events (preferred for eventual consistency)
- Application Service orchestration (for synchronous coordination)
- Explicit API calls between bounded contexts

### 13.5 Immutability of Published and Approved Objects

Once a Business Object reaches `Approved` or `Published` state, it must become immutable in the domain layer. Any attempt to mutate an approved version must produce a domain error. New versions must be created instead.

### 13.6 Audit by Default

Every Aggregate Root with business relevance must maintain an audit log. The audit log records who performed what action, when, with what input, and what the resulting state was. Audit records must not be deletable.

### 13.7 Test Strategy

- **Unit tests** cover aggregate logic, business rules and value objects in isolation.
- **Integration tests** cover repository behavior, event publication and API contract correctness.
- **End-to-end tests** cover critical user journeys across bounded contexts.
- Business rules must have explicit test coverage with test names that reference the rule ID.

### 13.8 No Silent Failures

Every operation that fails must communicate its failure explicitly. No swallowed exceptions, no silent no-ops, no undefined returned where an error is expected. Structured error responses with domain-meaningful error codes are required.

### 13.9 Dependency Direction

Dependencies must flow inward: UI → Application → Domain. The domain layer must have zero dependencies on infrastructure, persistence or UI frameworks.

### 13.10 Configuration over Hardcoding

Enumerated values with business meaning — requirement types, evaluation methods, workflow step types, response formats — must be configurable. Hardcoding such values creates upgrade debt and breaks domain neutrality.

---

## 14. UI Principles

### 14.1 UI Follows Domain

UI is built after the domain model and API are stable. UI components do not define business logic. They render it.

### 14.2 Workspace Architecture

The adtender UI is organized into **Workspaces** — dedicated environments for each major user role and business process phase. A Workspace is not a collection of menus; it is a coherent work environment tailored to a specific user job to be done.

### 14.3 Progressive Disclosure

Complex business objects (Requirements, Evaluations, Decisions) have multiple facets. The UI must progressively disclose complexity — essential attributes first, detailed governance and history available but not overwhelming.

### 14.4 State Visibility

Users must always know the state of the Business Object they are viewing or editing. The lifecycle state (Draft, Approved, Published, etc.) must be unambiguously visible at all times. There must be no ambiguity between viewing a draft and viewing an approved version.

### 14.5 AI Transparency

AI-generated content must be visually distinct from human-authored content. Users must be able to identify at a glance which fields, suggestions or summaries were AI-generated. AI suggestions must be dismissible without accepting them.

### 14.6 Version Awareness

When a user accesses a Business Object that has multiple versions, the UI must make the active version context explicit. Users must understand whether they are viewing the current version, a historical version, or a draft in progress.

### 14.7 No Business Logic in UI

Validation of business rules must not be implemented only in the UI. UI validation is a convenience, not a control. The domain layer enforces rules; the UI communicates them.

### 14.8 Accessibility and Internationalization

The platform targets enterprise organizations across multiple countries. Internationalization (i18n) and accessibility (WCAG 2.1 AA minimum) are not optional. Date formats, number formats, text direction and label translations must be handled through the configuration layer, not hardcoded.

### 14.9 Action Clarity

Every irreversible or significant user action must require explicit confirmation. The UI must communicate clearly what the consequences of an action are before the user commits to it. This is especially important for approval, publication, and closure actions.

---

## 15. API Principles

### 15.1 API First

APIs are the product. UI is one consumer of the API. External integrations are another. The API must be complete and correct independently of any UI implementation.

### 15.2 RESTful Design

The adtender API follows REST conventions:

- Resources represent Business Objects, not operations.
- HTTP verbs have standard semantics: `GET` reads, `POST` creates, `PATCH` updates, `DELETE` removes (where permitted).
- Non-CRUD operations use explicit action suffixes: `POST /requirements/{id}/approve`.
- Response codes are semantically correct: `200` for success, `201` for creation, `400` for validation failure, `403` for authorization failure, `404` for not found, `409` for conflict.

### 15.3 API Versioning

APIs are versioned from the first release. Breaking changes require a new API version. The version is encoded in the URL path: `/api/v1/requirements`.

Versioning policy:

- Minor additions (new optional fields, new endpoints) are non-breaking.
- Removal of fields, endpoint removal, semantic changes to existing fields are breaking changes.
- Deprecated endpoints carry a `Deprecation` response header and remain available for a defined sunset period.

### 15.4 Consistent Error Responses

All API error responses follow a consistent structure:

```json
{
  "error": {
    "code": "REQUIREMENT_ALREADY_APPROVED",
    "message": "A requirement in Approved state cannot be directly modified.",
    "details": {}
  }
}
```

Error codes use `SCREAMING_SNAKE_CASE` and reference the domain concept. Generic error messages are prohibited.

### 15.5 Pagination and Filtering

All list endpoints must support:

- cursor-based or offset-based pagination
- filtering by relevant Business Object attributes
- sorting by relevant fields
- total count in the response envelope

### 15.6 Security

- All API endpoints require authentication.
- Authorization is enforced at the domain level, not only at the gateway.
- Sensitive Business Objects must respect tenant isolation.
- API keys and tokens must never appear in logs, URLs or response bodies.

### 15.7 Event Publication via API

Domain Events may be made available to external consumers through event streaming endpoints or webhook subscriptions. The API layer is responsible for translating internal domain events into stable external event contracts. Internal event schemas must not be leaked directly to external consumers.

---

## 16. Event Driven Principles

### 16.1 Events Are Business Facts

A domain event records something that happened in the domain. It is named in the past tense. It is immutable. It carries all context a downstream consumer needs to react without querying the source again.

### 16.2 Events Are Not Commands

An event communicates what happened. A command requests that something happen. These are fundamentally different communication patterns and must not be confused or substituted for each other.

### 16.3 Event Naming and Structure

Every domain event must include:

- **Event type**: PascalCase, past tense (`RequirementApproved`)
- **Event ID**: unique identifier for the event occurrence
- **Aggregate ID**: the identity of the affected Business Object
- **Aggregate type**: the domain type (`Requirement`, `Tender`)
- **Occurred at**: the timestamp of the state change in the domain (not the publication timestamp)
- **Actor**: the user or system that triggered the change
- **Version**: the event schema version
- **Payload**: the relevant state context

### 16.4 Event Consumers Must Be Idempotent

Event consumers must be designed to handle duplicate delivery. The platform cannot guarantee exactly-once delivery. Idempotency keys and deduplication are the responsibility of the consumer.

### 16.5 Events Drive Integration

Cross-domain integration on adtender is event-driven by default. When the Knowledge Management domain needs to react to a Project being closed, it does so by consuming a `ProjectClosed` event, not by being directly called by the Project domain.

### 16.6 Audit Trail via Events

The event stream for each Aggregate constitutes its authoritative audit trail. The audit log is derived from domain events. This ensures that the audit log and the application state are always consistent.

### 16.7 Event Schema Governance

Event schemas are contracts. They must be versioned. Breaking changes to event schemas must follow the same governance process as API breaking changes. Event consumers must be able to handle multiple schema versions during migration periods.

---

## 17. Versioning Principles

### 17.1 Why Versioning Is Mandatory

In enterprise procurement and decision contexts, traceability to the exact state of a Business Object at a specific point in time is a compliance and governance requirement. Evaluation scores and decisions must reference the exact Requirement version that was evaluated. This is not optional.

### 17.2 Versioning Model

adtender uses **explicit version snapshots**, not implicit git-style diffing. A new version is created as an intentional business act, not as an automatic side effect of any edit.

A version record captures:

- version number (monotonically increasing)
- the complete state of the Business Object at that version
- the author of the version
- the timestamp
- the reason for the version
- the transition from which lifecycle state
- whether the version is current

### 17.3 Immutability of Approved and Published Versions

Versions in `Approved` or `Published` state are **immutable**. No attribute may be changed. Any change requires creating a new version. This rule is enforced at the domain layer.

### 17.4 Business Objects That Require Versioning

| Business Object | Versioning Required |
|---|---|
| Requirement | Yes — mandatory |
| Tender | Yes — mandatory |
| Evaluation Criteria | Yes — mandatory |
| Decision | Yes — mandatory |
| Knowledge Asset | Yes — mandatory |
| Requirement Library configuration | Yes |
| Workflow definition | Yes |
| Project | Lifecycle state history; full versioning optional |
| Supplier Response | Submission history required |

### 17.5 Version References

When a Business Object references another versioned object, it must reference the **specific version**, not just the object identity. A `SupplierResponse` references a `RequirementVersionId`. An `Evaluation` references the same `RequirementVersionId`. This ensures that changes to Requirements after publication do not silently alter existing evaluation data.

### 17.6 API Versioning

See Section 15.3 for API versioning policy. API versioning is independent of Business Object versioning.

---

## 18. Configuration vs Customization

### 18.1 The Distinction

**Configuration** is what a tenant admin can change without code. It controls business behavior through data — categories, workflow steps, evaluation models, response types, permission roles.

**Customization** is code-level modification. It is expensive, creates upgrade risk, and fragments the product. Customization must be avoided.

The platform design goal is: **everything a customer would want to change without writing code must be configurable**.

### 18.2 What Must Be Configurable

The following must be configurable per organization or tenant:

- Requirement types and categories
- Project types
- Tender types
- Lifecycle states and transitions (within constraints)
- Workflow steps and approvers
- Evaluation methods and scoring models
- Supplier response types
- Document templates
- Notification triggers and recipients
- Permission roles and access levels
- Library membership rules
- AI assistance on/off toggles per feature area
- Report formats and export templates

### 18.3 What Must Not Be Configurable

The following represent platform invariants and must not be configurable:

- The requirement that approved versions are immutable
- The requirement that audit records are not deletable
- The requirement that AI must not make accountable decisions
- The requirement that decisions require human approval
- Core Business Object identities and their primary relationships
- Security boundaries and tenant data isolation

### 18.4 Configuration Is Data

Configuration must be modeled as Business Objects with their own lifecycle, governance and audit trail. A workflow configuration change must be auditable. A permission role change must be traceable. Configuration is not a properties file; it is managed data.

### 18.5 Configuration Inheritance

For multi-tenant and enterprise deployments, configuration may follow an inheritance model:

- **Platform defaults** — defined by the product team
- **Organization configuration** — overrides platform defaults
- **Project configuration** — overrides organization configuration for a specific initiative

Overrides must be explicit and auditable.

---

## 19. Business Rules Philosophy

### 19.1 Rules Are Domain Knowledge

Business rules encode domain expertise. They are not implementation details. They must be documented in the Product Knowledge Base before they are implemented in code, and they must be implemented in the domain layer, not in application or UI layers.

### 19.2 Rules Are Named and Identified

Every significant business rule has:

- an **ID** in the format `{ObjectCode}-BR-{sequence}` (e.g., `REQ-BR-003`)
- a **natural language statement** of the rule
- the **Business Objects** it applies to
- the **lifecycle state(s)** in which it is active
- the **consequence of violation** (error, warning, block)
- a reference to the **authority** for the rule (regulatory, organizational, product design)

### 19.3 Rules Live in the Domain Layer

Business rules must be implemented as:

- **Invariants** within the Aggregate Root (conditions that must always hold)
- **Preconditions** on Commands (conditions that must hold before an operation is permitted)
- **Domain Services** for cross-aggregate rules
- **Policy Objects** for complex, configurable rule sets

Business rules must not be implemented as:

- Controller-level conditionals
- Database triggers
- UI validation only
- Inline if-statements scattered across service classes

### 19.4 Configurable Rules

Some business rules must be configurable per organization. For example, whether a Requirement requires a two-step approval or a single approver is an organizational policy, not a platform invariant. The platform must support configurable rule application without hardcoding one model.

### 19.5 AI-Assisted Rule Checking

AI may assist in detecting rule violations, inconsistencies and gaps. AI may flag that a Requirement appears to conflict with an existing approved Requirement, or that a Decision lacks evidence for a key Requirement. These are suggestions, not enforcement actions.

### 19.6 Rules Are Tested

Every business rule must have explicit automated test coverage. Test names must reference the rule ID. Tests must cover both the positive case (rule satisfied) and the negative case (rule violated and correctly rejected).

---

## 20. Product Roadmap Vision

This section describes the intended evolution of the adtender platform. It establishes the architectural commitments that must be honored today to enable tomorrow's capabilities.

### 20.1 Phase 1: Tender Management Foundation

The first release delivers the core tender lifecycle:

- Project Management
- Requirement Management and Libraries
- Tender Creation and Publication
- Supplier Collaboration Portal
- Structured Supplier Responses
- Evaluation Management
- Decision Documentation
- Basic Knowledge Management
- Workflow Engine (approvals, reviews)
- Organization and User Management

Architectural prerequisite: the domain model for all core Business Objects must be complete before implementation begins.

### 20.2 Phase 2: Knowledge Intelligence

The second phase activates the knowledge flywheel:

- Requirement Library management with full governance
- Lessons Learned structured capture and retrieval
- Knowledge Asset management
- AI-assisted duplicate detection and reuse recommendations
- Requirement quality scoring
- Cross-project knowledge analytics
- Library contribution workflows

### 20.3 Phase 3: AI Augmentation

The third phase deepens AI integration:

- AI-assisted Requirement generation from unstructured inputs
- AI evaluation quality analysis
- AI decision briefing generation
- AI supplier response summarization
- Predictive project risk scoring
- Natural language query of the knowledge base
- AI onboarding assistance for new project team members

### 20.4 Phase 4: Decision Platform Expansion

The fourth phase expands beyond tender management to realize the platform vision:

- Investment Decision Management
- Strategic Partnership Decisions
- Technology Assessment workflows
- Vendor Qualification Management
- Framework Agreement Management
- Horizontal knowledge sharing across decision types

The architecture built in Phase 1 must support this expansion. Tender Management is implemented as the first bounded context of a multi-domain platform, not as a monolithic tender application.

### 20.5 Phase 5: Enterprise Integration Ecosystem

The fifth phase delivers deep enterprise integration:

- ERP connectors (SAP, Oracle, Microsoft Dynamics)
- DMS integration
- CRM connectors
- Digital signature integration
- Marketplace connectivity for supplier discovery
- Analytics and BI platform export
- Public sector e-procurement standard connectors (PEPPOL, UBL, eForms)

### 20.6 Architectural Commitments for the Roadmap

To make this roadmap achievable, every architectural decision today must honor the following:

1. **Bounded context isolation** — new domains must be addable without restructuring existing ones.
2. **Event-driven integration** — domains communicate through events, enabling new consumers to be added independently.
3. **Configuration layer** — new domain behavior must be expressible through configuration, not code forks.
4. **Knowledge layer independence** — the Knowledge domain must remain usable across all current and future business domains.
5. **AI layer independence** — AI capabilities must be addable to any domain without restructuring the domain model.
6. **API stability** — external integrations must not be broken by internal architectural changes.

---

## Appendix A: Reading Order for AI Agents

When loading context for an implementation task, read in the following order:

1. `00_Product_DNA/AI_MASTER_CONTEXT.md` ← this document
2. `00_Product_DNA/AI_BOOTSTRAP.md`
3. `00_Product_DNA/Product_Principles.md`
4. `00_Product_DNA/Architecture_Principles.md`
5. `00_Product_DNA/Product_Glossary.md`
6. `02_Domain_Model/{RelevantObject}.md` for each object in scope
7. `01_Business/BP{nn}_{Process}.md` for each relevant process
8. `05_Technical/{RelevantSpec}.md` if a technical specification exists

Never skip steps 1–5 regardless of how narrow the task appears.

---

## Appendix B: Quick Reference — Non-Negotiable Rules

The following rules are absolute. They must not be overridden by deadline pressure, simplification requests or scope trade-offs.

| # | Rule |
|---|---|
| 1 | Business logic must not be implemented in UI components. |
| 2 | Business logic must not be implemented in controllers or handlers. |
| 3 | Business rules belong to the domain layer. |
| 4 | Documents are not the primary source of truth. Business Objects are. |
| 5 | Every important business action must be auditable. |
| 6 | Audit records must not be deletable. |
| 7 | Important Business Objects must support versioning. |
| 8 | Approved and Published versions are immutable. |
| 9 | AI must not approve, publish or delete Business Objects. |
| 10 | AI must not make or record accountable Decisions. |
| 11 | Human confirmation is required for all AI-assisted business-changing actions. |
| 12 | Domain terminology must be consistent across all platform layers. |
| 13 | No implementation starts before the related Business Object is described. |
| 14 | Cross-aggregate direct mutation is prohibited. |
| 15 | Tenant data isolation must be enforced at the domain layer. |

---

## Appendix C: Glossary Reference

For all domain term definitions, refer to `00_Product_DNA/Product_Glossary.md`.

Core terms: Project, Requirement, Requirement Library, Tender, Supplier, Tender Response, Evaluation, Decision, Knowledge Asset, Workflow, Business Object, Audit Record, Version.

---

*This document is the constitutional authority for the adtender platform. All conflicting informal conventions, verbal agreements or ad hoc implementation decisions are superseded by the principles and rules stated here. Changes to this document require formal review and version increment.*
