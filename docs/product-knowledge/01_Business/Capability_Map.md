---
id: PKB-01-006
title: Capability Map
version: 2.0
status: APPROVED
owner: Product Architecture
audience:
  - Product Management
  - Business Architecture
  - Software Architecture
  - AI Development Agents
depends_on:
  - PKB-00-MASTER
  - PKB-01-001
  - PKB-01-002
---

# Capability Map

## Purpose

This document defines the business capabilities of the adtender platform. A capability is a named, stable business ability — what the platform can do, independent of how it is implemented or which process invokes it.

Capabilities are the stable layer between volatile business processes and changing technical implementations. When processes change, capabilities remain. When technology changes, capabilities remain. This makes capabilities the most useful design artifact for roadmap planning, impact analysis and architectural investment.

---

## Capability Model

Capabilities are organized into **Core Capabilities** — those that directly deliver platform value — and **Shared Capabilities** — those that support multiple core capabilities.

---

## Core Capabilities

### Project Management

**Definition:** The ability to create, configure, govern and track a business initiative from inception through closure.

**What this enables:**
- Creating and managing a Project with defined scope, objectives and success criteria
- Assigning and managing project team members and their roles
- Defining and tracking milestones against the project timeline
- Configuring project-level governance (approval chains, escalation paths)
- Transitioning the Project through its full lifecycle
- Triggering downstream processes (Lessons Learned, Knowledge contribution) at lifecycle gates

**Primary business processes:** BP01, BP02, BP03, BP13

**Depends on:** Workflow Management (for approval orchestration), Organization Management (for user and role resolution)

---

### Requirement Management

**Definition:** The ability to create, version, classify, govern and lifecycle-manage structured business expectations.

**What this enables:**
- Authoring Requirements as structured Business Objects with full metadata
- Managing Requirement lifecycle from Draft through Approved to Published, Deprecated or Archived
- Creating immutable versions of Requirements at approval and publication
- Classifying Requirements by type, category, priority, criticality and knock-out status
- Configuring response types and evidence requirements per Requirement
- Configuring evaluation properties (weight, knock-out flag, minimum acceptance level) per Requirement
- Managing Requirement relationships (depends-on, conflicts-with, refines, replaces)
- Searching Requirements across libraries and projects
- Receiving and processing improvement proposals from Lessons Learned

**Primary business processes:** BP04, BP05

**Depends on:** Knowledge Management (for library governance), Workflow Management (for review and approval flows)

---

### Tender Management

**Definition:** The ability to create, structure, govern and publish a formal procurement or selection process.

**What this enables:**
- Assembling a Tender from a set of approved Requirement versions
- Structuring the Tender into sections, groups and evaluation categories
- Configuring the Evaluation Model: scoring method, weightings, knock-out rules
- Managing the Tender lifecycle from Draft through Published and Closed
- Freezing Requirement versions at publication as an immutable snapshot
- Managing Tender amendments and clarification issuances after publication
- Enforcing publication governance (all Requirements must be Approved before publication)

**Primary business processes:** BP06, BP07

**Depends on:** Requirement Management (for approved Requirement versions), Supplier Management (for invitation list), Workflow Management (for approval flows)

---

### Supplier Management

**Definition:** The ability to manage Supplier participation in tenders — including invitation, communication, clarification and structured response collection.

**What this enables:**
- Maintaining Supplier master records with profiles and qualification status
- Managing Supplier invitations and Supplier Portal access
- Receiving and publishing Supplier clarification requests and answers
- Collecting structured Supplier Responses against published Requirement versions
- Enforcing submission deadlines
- Locking Supplier Responses after the submission deadline for evaluation

**Primary business processes:** BP07, BP08

**Depends on:** Tender Management (for published Tender context), Requirement Management (for published Requirement versions), Workflow Management (for clarification orchestration)

---

### Evaluation Management

**Definition:** The ability to conduct structured, traceable and fair assessment of Supplier Responses against defined criteria.

**What this enables:**
- Creating an Evaluation with a defined Evaluation Model for a closed Tender
- Assigning Evaluators to Requirement groups
- Collecting individual evaluation scores with mandatory rationale
- Enforcing blind evaluation during the individual scoring phase
- Applying Knock-out Criterion rules automatically
- Detecting scoring anomalies and evaluator inconsistencies
- Consolidating individual scores into an aggregated ranking
- Producing a completed Evaluation result that serves as the Decision basis

**Primary business processes:** BP09, BP10

**Depends on:** Supplier Management (for locked Supplier Responses), Requirement Management (for published Requirement versions), Workflow Management (for review flows and Evaluator assignments)

---

### Decision Management

**Definition:** The ability to document, govern and persist an accountable business decision with full traceability to its evidence base.

**What this enables:**
- Creating a Decision record from a completed Evaluation
- Documenting decision rationale: decisive Requirements, accepted trade-offs, deviations accepted
- Recording the Decision Board approval chain
- Maintaining Decision immutability after approval
- Providing the Decision as the basis for Contract Handover and Supplier notifications

**Primary business processes:** BP11

**Depends on:** Evaluation Management (for completed Evaluation result), Workflow Management (for Decision Board approval orchestration), Document Management (for Decision document generation)

---

### Knowledge Management

**Definition:** The ability to transform project experience into reusable organizational intelligence and to govern the lifecycle of organizational knowledge assets.

**What this enables:**
- Creating and governing Requirement Libraries independent of any project
- Creating, versioning and publishing Knowledge Assets
- Managing the library contribution workflow: project improvements → library review → publication
- Governing template lifecycle: Project templates, Tender templates, Evaluation Model templates
- Supporting cross-project knowledge search and similarity detection
- Measuring and reporting library health: reuse rates, stale content, duplication

**Primary business processes:** BP05, BP14, BP15

**Depends on:** Requirement Management (for Requirement Library governance), Workflow Management (for contribution approval flows)

---

## Shared Capabilities

### Workflow Management

**Definition:** The ability to define, instantiate, track and enforce configurable process orchestration across all business domains.

**What this enables:**
- Defining reusable Workflow Definitions for approval chains, review sequences and notification patterns
- Instantiating Workflow Instances triggered by domain events
- Managing step assignments, SLA deadlines, escalations and delegation rules
- Supporting parallel and sequential step patterns
- Providing workflow context to UI surfaces for task-list driven user experience

**Used by:** All core capabilities for approval, review and notification orchestration

---

### Document Management

**Definition:** The ability to generate, store, version and retrieve documents produced by or attached to Business Objects.

**What this enables:**
- Generating documents from Business Objects (Tender PDFs, Decision records, handover packages)
- Storing supplier-attached evidence (certificates, reference documents, product sheets)
- Version management for generated documents
- Secure access control for sensitive document content
- DMS integration for organizations that manage documents externally

**Used by:** Tender Management (Tender documents), Decision Management (Decision records), Supplier Management (evidence storage)

---

### Reporting

**Definition:** The ability to produce aggregated views, KPI dashboards and data exports across all domains.

**What this enables:**
- Process KPI tracking: project duration, Requirement reuse rates, Tender lead times, Decision quality scores
- Cross-project analytics and benchmarking
- Compliance and audit reports
- Export to BI platforms and spreadsheet tools

---

### Administration

**Definition:** The ability to configure and operate the platform at the tenant and system level.

**What this enables:**
- Tenant provisioning and configuration
- User and role management
- Platform-level monitoring and operations

---

### Integration

**Definition:** The ability to exchange data with external enterprise systems at defined integration boundaries.

**What this enables:**
- Structured award data export to ERP (purchase orders, budget commitments)
- Supplier master data synchronization with CRM
- Document storage integration with DMS/ECM
- Digital signature platform integration for contract execution
- Public e-procurement standard connectors (PEPPOL, UBL, eForms)

---

## Capability Dependency Overview

```
Reporting ◄────────────────────────────────── all capabilities
Workflow Management ◄──────────────────────── all core capabilities
Document Management ◄──────────────────────── Tender, Decision, Supplier
Organization Management ◄──────────────────── all capabilities

Knowledge Management ◄────── Requirement Management ◄─── Project Management
                                      │
                              Tender Management
                                      │
                              Supplier Management
                                      │
                             Evaluation Management
                                      │
                              Decision Management
                                      │
                              Integration ◄──────────────── (ERP, CRM, DMS)
```

---

## References

- [`Business_Domains.md`](./Business_Domains.md) — Domain ownership of each capability
- [`Business_Process_Architecture.md`](./Business_Process_Architecture.md) — Process-to-capability mapping
- [`Process_Capability_Matrix.md`](./Process_Capability_Matrix.md) — Full matrix view
