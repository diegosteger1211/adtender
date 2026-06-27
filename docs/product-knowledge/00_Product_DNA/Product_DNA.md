---
id: PKB-00-001
title: Product DNA
version: 2.1
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
---

# Product DNA

## Purpose

This document defines the identity of adtender: what it is, what it is not, why it exists, and what it must remain as it grows.

It serves as the reference for all product decisions, scope discussions and architectural trade-offs. When a proposal conflicts with this document, this document takes precedence unless a formal revision is approved.

The constitutional rules and implementation directives live in [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md). This document provides the identity and business scope on which those rules are built.

---

## Vision

adtender is an **Enterprise Decision & Knowledge Platform**.

Organizations make consequential decisions — selecting suppliers, investing in technology, choosing partners, awarding contracts — through processes that are largely invisible. The rationale disappears into email threads. Requirements live in Word documents. Evaluation scores exist in spreadsheets that nobody can find six months later. The knowledge gained from one project never reaches the next.

adtender makes this visible, structured, traceable and reusable.

The long-term vision: every completed business initiative on adtender automatically enriches the organizational knowledge base, so that future initiatives begin with accumulated institutional intelligence rather than from a blank page.

Tender Management is the first business domain implemented on the platform. It is the proof of concept for a broader capability set that will grow to cover any structured organizational decision process.

---

## Mission

adtender supports organizations in making **structured, transparent and reusable business decisions**.

- **Structured** — business expectations, supplier responses, evaluations and decisions are captured as typed, versioned Business Objects, not as prose.
- **Transparent** — every score, recommendation and decision is traceable to the data that produced it.
- **Reusable** — knowledge created in one project becomes a resource for future projects through managed libraries and structured lessons learned.

---

## Product Philosophy

The following five philosophies are the non-negotiable character of adtender. They are not preferences; they are constraints. A feature that contradicts one of these philosophies is architecturally wrong regardless of its business utility.

### Decisions instead of Documents

Documents are outputs: exports, attachments and evidence. The primary value of adtender is structured decision knowledge captured in Business Objects. A document can be generated from a Business Object. A Business Object cannot be reliably derived from a document.

*Principle reference: [P-001](./Product_Principles.md#p-001-business-objects-first), [ADR-002](./ADR/ADR-002-knowledge-before-documents.md)*

### Knowledge instead of Archives

A closed project is not a dead project. It is an opportunity to improve the organizational knowledge base. adtender must make the transition from project experience to reusable library knowledge a first-class workflow, not an optional post-project activity.

*Principle reference: [P-002](./Product_Principles.md#p-002-knowledge-by-design), [P-003](./Product_Principles.md#p-003-reuse-by-default)*

### Reuse instead of Recreation

Before any new Requirement, template or evaluation model is created, the platform must surface relevant existing knowledge from the organizational libraries. The cost of recreating existing knowledge is measurable: duplicated effort, inconsistent standards, and missed institutional learning.

*Principle reference: [P-003](./Product_Principles.md#p-003-reuse-by-default)*

### Platform instead of One-Off Application

Tender Management is the first domain. The architecture must remain open — through bounded context isolation, configurable business rules, and a shared knowledge layer — for any future decision-centric domain. Every architectural decision is evaluated against this multi-domain future.

*Principle reference: [P-009](./Product_Principles.md#p-009-platform-thinking), [AP-008](./Architecture_Principles.md#ap-008-loose-coupling)*

### Human Responsibility

AI augments every stage of the platform's business processes: it detects gaps, surfaces reuse opportunities, summarizes complex data, and flags risks. It does not make accountable decisions. In regulated environments, public procurement and high-stakes commercial contexts, accountability cannot be delegated to an algorithm.

*Principle reference: [P-005](./Product_Principles.md#p-005-human-in-the-loop), [P-006](./Product_Principles.md#p-006-explainability)*

---

## Product Identity

adtender is **not**:

| What it is not | Why this matters |
|---|---|
| A document management system | Documents are outputs; Business Objects are the source of truth |
| An ERP system | adtender integrates with ERP; it does not replace it |
| A CRM system | Supplier relationships are in scope; commercial account management is not |
| A classical tender portal | A portal publishes documents; adtender structures decisions |
| A simple CRUD application | Every Business Object has lifecycle, governance, versioning and audit |
| A full Contract Lifecycle Management system | Contract handover is in scope; post-award contract management is not |

---

## Business Scope

adtender supports the following business activities, mapped to the business process architecture:

| Activity | Business Process Reference |
|---|---|
| Project initiation | [BP02 Project Initiation](../01_Business/BP02_Project_Initiation.md) |
| Requirement engineering | [BP04 Requirement Engineering](../01_Business/BP04_Requirement_Engineering.md) |
| Library and knowledge reuse | [BP05 Library Management](../01_Business/BP05_Library_Management.md) |
| Tender creation | [BP06 Tender Creation](../01_Business/BP06_Tender_Creation.md) |
| Publication to suppliers | [BP07 Publication](../01_Business/BP07_Publication.md) |
| Supplier collaboration | [BP08 Supplier Collaboration](../01_Business/BP08_Supplier_Collaboration.md) |
| Structured supplier responses | [BP08 Supplier Collaboration](../01_Business/BP08_Supplier_Collaboration.md) |
| Evaluation | [BP09 Evaluation](../01_Business/BP09_Evaluation.md) |
| Consolidation and scoring | [BP10 Consolidation](../01_Business/BP10_Consolidation.md) |
| Decision documentation | [BP11 Decision](../01_Business/BP11_Decision.md) |
| Award and contract handover | [BP12 Contract Handover](../01_Business/BP12_Contract_Handover.md) |
| Project closing | [BP13 Project Closing](../01_Business/BP13_Project_Closing.md) |
| Lessons learned | [BP14 Lessons Learned](../01_Business/BP14_Lessons_Learned.md) |
| Knowledge management and library contribution | [BP15 Knowledge Management](../01_Business/BP15_Knowledge_Management.md) |

---

## Out of Scope

The following are explicitly outside the platform boundary. adtender integrates with these systems through defined integration points; it does not replicate their functionality.

| System / Scope | Notes |
|---|---|
| ERP (SAP, Oracle, Dynamics) | Award data, purchase orders, budget approval — integration only |
| CRM | Supplier master data synchronization — integration only |
| DMS / ECM | Document storage and retrieval; adtender generates, DMS stores |
| Accounting / Finance | Budget consumption, invoice processing |
| HR | User identity and organization hierarchy |
| Full Contract Lifecycle Management | Post-award contract management; adtender handles handover only |
| Digital Signature Platforms | Integrated for signing; not replicated internally |
| Public e-Procurement Platforms | Publish/subscribe connectors; not rebuilt internally |
| Generic assessment platform | Not part of MVP+; potential future platform expansion |
| Compliance suite (IEC 62443, ISO regulatory workflows) | Specialist domain workflows outside tender management scope |
| Enterprise platform services unrelated to tender management | Future roadmap; Phase 4+ |

For the complete MVP+ out-of-scope list and the relationship between first-release scope and long-term platform vision, see [`Product_Scope_MVP.md`](./Product_Scope_MVP.md).

---

## Core Domains

The platform is organized around the following bounded contexts. Each is architecturally independent with its own domain model, lifecycle and API.

| Domain | Purpose |
|---|---|
| Project Management | Governs the business initiative lifecycle |
| Requirement Management | Creates, versions and manages reusable business expectations |
| Tender Management | Structures the procurement and selection process |
| Supplier Management | Manages supplier participation and structured responses |
| Evaluation Management | Provides structured, traceable assessment of supplier responses |
| Decision Management | Documents and governs accountable business decisions |
| Knowledge Management | Manages libraries, templates, lessons learned and knowledge assets |
| Workflow Management | Provides configurable process orchestration across domains |
| Organization Management | Manages users, roles, permissions and tenant configuration |
| Reporting | Provides aggregated analytics, dashboards and exports |
| Integration | Manages connectors to external enterprise systems |

---

## References

- [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md) — Constitutional rules and implementation directives
- [`Product_Principles.md`](./Product_Principles.md) — Product principles P-001 to P-013
- [`Architecture_Principles.md`](./Architecture_Principles.md) — Architecture principles AP-001 to AP-016
- [`Product_Glossary.md`](./Product_Glossary.md) — Ubiquitous language definitions
- [`AI_BOOTSTRAP.md`](./AI_BOOTSTRAP.md) — AI agent operating directives
- [`../01_Business/Business_Process_Architecture.md`](../01_Business/Business_Process_Architecture.md) — End-to-end business process model
- [`Product_Scope_MVP.md`](./Product_Scope_MVP.md) — PKB-00-005 — MVP+ scope, out-of-scope decisions, workspace architecture, UX principles
