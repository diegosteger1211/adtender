---
id: PKB-01-002
title: Business Domains
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
  - PKB-00-MASTER
  - PKB-00-001
---

# Business Domains

## Purpose

This document defines the business domains of the adtender platform: their responsibilities, their data ownership boundaries, and their relationships. Each domain corresponds to a bounded context in the technical architecture. Domain boundaries govern service design, data ownership, API design, and event contracts.

---

## Domain Architecture Overview

adtender is organized into **Core Domains** — those that deliver primary business value — and **Supporting Domains** — those that provide shared capabilities consumed by multiple core domains.

```
Core Domains
─────────────────────────────────────────────────────────────────────
  Project Management          Requirement Management
  Tender Management           Supplier Management
  Evaluation Management       Decision Management
  Knowledge Management

Supporting Domains
─────────────────────────────────────────────────────────────────────
  Workflow Management         Organization Management
  Document Management         Reporting
  Administration              Integration
```

---

## Core Domains

### Project Management

**Purpose:** Governs the lifecycle of a business initiative from the initial idea through project closure and archival.

**Aggregate Roots:** `Project`

**Responsibilities:**
- Creating and managing the Project lifecycle: Idea → Initiated → Planned → Active → Closing → Archived
- Defining project scope, objectives, budget and success criteria
- Assigning and managing project stakeholders and their roles
- Coordinating all related Business Objects — Tenders, Evaluations, Decisions — within the project boundary
- Managing project milestones and tracking progress
- Triggering the Lessons Learned and Knowledge Management processes on project close
- Maintaining project-level audit and traceability

**Owns:** Project identity, project membership, project milestones, project-level configuration, project lifecycle state

**Does not own:** Requirements (referenced, not owned), Knowledge Assets (contributes to them), Workflow definitions (uses them)

**Key integration events produced:**
`ProjectCreated`, `ProjectActivated`, `ProjectClosed`, `ProjectArchived`

---

### Requirement Management

**Purpose:** Creates, versions, governs and makes reusable the structured business expectations that drive tender quality, supplier evaluation and decision traceability.

**Aggregate Roots:** `Requirement`, `RequirementLibrary`

**Responsibilities:**
- Full lifecycle management of Requirements: Draft → In Review → Approved → Published → Deprecated → Archived
- Versioning of Requirements — every approved version is immutable
- Managing Requirement Libraries and their governance
- Supporting reuse workflows: reference, copy with traceability, derive
- Classifying Requirements by type, category, domain and priority
- Managing Requirement relationships (depends-on, conflicts-with, refines, replaces)
- Receiving and processing improvement proposals from post-project Lessons Learned
- AI-assisted duplicate detection and quality analysis

**Owns:** Requirement content, Requirement versions, RequirementLibrary membership, Requirement classification, Requirement relationships

**Does not own:** Tender content (supplies requirements to Tenders), Supplier Response content (referenced by responses), Evaluation scores (assessed against requirements)

**Key integration events produced:**
`RequirementApproved`, `RequirementPublished`, `RequirementVersionCreated`, `RequirementDeprecated`, `RequirementImprovementProposed`

---

### Tender Management

**Purpose:** Structures and governs the formal procurement or selection process, from Tender creation through publication, amendment and closure.

**Aggregate Roots:** `Tender`

**Responsibilities:**
- Creating a Tender from a defined set of approved Requirements
- Configuring the Tender structure: sections, groups, Evaluation Model
- Managing Tender lifecycle: Draft → In Review → Approved → Published → Closed → Archived
- Freezing Requirement versions at publication time as an immutable snapshot
- Managing Tender amendments and clarification issuances
- Controlling the Supplier invitation list
- Enforcing publication governance: all referenced Requirements must be Approved before publication

**Owns:** Tender structure, Tender configuration, Supplier invitation list, Requirement version snapshot at publication

**Does not own:** Requirements (references approved versions), Supplier identities (owned by Supplier Management), Evaluation execution (owned by Evaluation Management)

**Key integration events produced:**
`TenderCreated`, `TenderApproved`, `TenderPublished`, `TenderAmended`, `TenderClosed`

---

### Supplier Management

**Purpose:** Manages Supplier participation in tenders — profile, invitation, clarification and structured Supplier Response collection.

**Aggregate Roots:** `Supplier`, `SupplierResponse`

**Responsibilities:**
- Managing the Supplier master record: profile, contact persons, qualification status
- Managing Supplier access to published Tenders
- Receiving and managing Supplier clarification requests
- Collecting structured Supplier Responses against published Requirement versions
- Managing Supplier Response submission lifecycle: Draft → Submitted → Locked
- Enforcing that Supplier Responses reference correct published Requirement versions
- Managing submission deadline enforcement

**Owns:** Supplier identity and profile, SupplierResponse content, response submission history, clarification correspondence

**Does not own:** Tender structure (reads from Tender Management), Requirement definitions (references published versions), Evaluation of responses (owned by Evaluation Management)

**Key integration events produced:**
`SupplierInvited`, `ClarificationRequested`, `ClarificationAnswered`, `SupplierResponseSubmitted`, `SupplierResponseLocked`

---

### Evaluation Management

**Purpose:** Provides structured, transparent and traceable assessment of Supplier Responses against the Requirements of a published Tender.

**Aggregate Roots:** `Evaluation`

**Responsibilities:**
- Creating an Evaluation for a Tender with a defined Evaluation Model
- Assigning Evaluators to Requirement groups or categories
- Recording individual evaluation scores against specific Requirement versions
- Managing Evaluation lifecycle: Preparing → InProgress → UnderReview → Completed
- Enforcing blind evaluation during the individual scoring phase
- Enforcing Knock-out Criterion rules
- Detecting scoring anomalies and evaluator inconsistencies
- Producing the consolidated Evaluation result as primary input to the Decision process

**Owns:** Evaluation structure, Evaluator assignments, individual scores, consolidated result

**Does not own:** Requirement definitions (assesses against published versions), Supplier Response content (evaluates it), Decision (informed by Evaluation)

**Key integration events produced:**
`EvaluationStarted`, `EvaluationScoreRecorded`, `EvaluationCompleted`, `KnockoutApplied`

---

### Decision Management

**Purpose:** Documents, governs and persists the accountable business decision that concludes an Evaluation, with full traceability to the evidence.

**Aggregate Roots:** `Decision`

**Responsibilities:**
- Creating a Decision record from a completed Evaluation
- Capturing the decision rationale: decisive Requirements, accepted deviations, trade-offs
- Managing the Decision approval workflow: Decision Board review and approval
- Recording the selected Supplier and the basis for non-selection of others
- Maintaining Decision immutability after approval
- Providing the Decision as the basis for Contract Handover and unsuccessful Supplier notification

**Owns:** Decision rationale, approval chain, outcome records

**Does not own:** Evaluation data (references it), Contract terms (out of scope), Supplier notification delivery (owned by Integration or Workflow)

**Key integration events produced:**
`DecisionDraftCreated`, `DecisionApproved`, `SupplierAwardRecorded`, `SupplierNotificationTriggered`

---

### Knowledge Management

**Purpose:** Transforms project experience into reusable organizational intelligence — managed Requirement Libraries, Knowledge Assets, templates and structured Lessons Learned.

**Aggregate Roots:** `KnowledgeAsset`

**Responsibilities:**
- Maintaining organizational Requirement Libraries independent of any project
- Creating, versioning and governing Knowledge Assets
- Managing the library contribution workflow: project experience → reviewed improvement → library publication
- Managing template governance: Project templates, Tender templates, Evaluation Model templates
- Supporting cross-project knowledge search and discovery
- Measuring knowledge reuse rates and library health

**Owns:** Knowledge Assets, Library governance, template definitions

**Does not own:** Project-specific experience data (receives structured contributions from projects), Requirement versions in operation (co-governed with Requirement Management)

**Key integration events produced:**
`KnowledgeAssetCreated`, `LibraryContributionApproved`, `TemplatePublished`, `RequirementImprovementPublished`

---

## Supporting Domains

### Workflow Management

**Purpose:** Provides configurable, governed process orchestration across all core domains.

**Responsibilities:**
- Defining reusable Workflow Definitions: approval chains, review sequences, notification patterns
- Instantiating and tracking Workflow Instances triggered by domain events
- Managing step assignments, deadlines, escalations and delegation
- Providing workflow state to UI surfaces for contextual display
- Supporting parallel and sequential approval patterns

---

### Organization Management

**Purpose:** Manages organizational identity, user accounts, roles, permissions and multi-tenant configuration.

**Responsibilities:**
- User lifecycle management: provisioning, de-provisioning, profile management
- Role definition and permission assignment
- Tenant configuration: custom categories, workflow templates, evaluation model templates, branding
- Organization hierarchy for permission inheritance
- Single Sign-On and identity provider integration

---

### Document Management

**Purpose:** Manages the storage, versioning and retrieval of documents generated by or attached to Business Objects.

**Important:** Documents are secondary to structured Business Objects. This domain manages the document lifecycle; it does not replace structured data as the source of truth. See [ADR-002](../00_Product_DNA/ADR/ADR-002-knowledge-before-documents.md).

**Responsibilities:**
- Storing generated documents: Tender PDFs, Decision records, handover packages
- Managing supplier-attached evidence files: certificates, reference documents, product sheets
- Version management for generated documents
- Secure access control for sensitive documents
- DMS integration connectors

---

### Reporting

**Purpose:** Provides aggregated analytics, dashboards and data exports across all domains.

**Responsibilities:**
- Read model projections optimized for reporting queries
- KPI dashboards: project duration, reuse rates, evaluation quality, decision lead time
- Cross-project analytics
- Compliance and audit reports
- Export to BI tools: CSV, XLSX, API feeds

---

### Administration

**Purpose:** Platform-level operational management separate from business-level Organization Management.

**Responsibilities:**
- Platform health monitoring
- Tenant provisioning and lifecycle management
- System configuration and feature management
- Maintenance mode and operational controls

---

### Integration

**Purpose:** Manages connectors to external enterprise systems at defined boundaries.

**Responsibilities:**
- ERP connectors: award data, purchase order creation, budget validation
- CRM connectors: Supplier master data synchronization
- DMS connectors: document storage and retrieval
- Digital signature platform integration
- Public e-procurement standard connectors: PEPPOL, UBL, eForms
- Event-based integration adapters

---

## Domain Relationship Flow

Primary data flow between domains. Dependencies are read-only references or event subscriptions. Direct domain mutation across boundaries is prohibited (see [AP-008](../00_Product_DNA/Architecture_Principles.md)).

```
Organization Management
        │ (configuration, users, roles)
        ▼
Project Management ──────────────────────────────────────┐
        │ references                                      │
        ▼                                                 │
Requirement Management ──────────────────────────────────┤
        │ supplies approved versions                      │
        ▼                                                 │
Tender Management ───────────────────────────────────────┤
        │ publishes to                                    │
        ▼                                                 │
Supplier Management                                      │
        │ responses consumed by                           │
        ▼                                                 │
Evaluation Management                                    │
        │ result informs                                  │
        ▼                                                 │
Decision Management ─────────────────────────────────────┤
        │ triggers                                        │
        ▼                                                 │
Knowledge Management ◄───────────────────────────────────┘
        (project experience feeds back into libraries)
```

---

## References

- [`AI_MASTER_CONTEXT.md — Section 6`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Bounded context design principles
- [`Business_Process_Architecture.md`](./Business_Process_Architecture.md) — Domain participation in processes
- [`Business_Roles.md`](./Business_Roles.md) — Who operates within each domain
- [`Capability_Map.md`](./Capability_Map.md) — What each domain enables
