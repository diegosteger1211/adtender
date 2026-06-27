---
id: PKB-ROOT-002
title: Product Knowledge Index
version: 2.2
status: APPROVED
owner: Product Architecture
---

# Product Knowledge Index

This index lists every document in the adtender Product Knowledge Base, its status and its purpose. Use it to find the authoritative source for any topic.

**Status legend:** `APPROVED` — authoritative | `DRAFT` — work in progress | `PLANNED` — defined but not yet written

---

## 00 — Product DNA

The constitutional layer. Read fully before contributing to any other layer.

| Document | Status | Purpose |
|---|---|---|
| [AI_MASTER_CONTEXT.md](00_Product_DNA/AI_MASTER_CONTEXT.md) | APPROVED | Constitutional document — platform vision, all principles, naming, coding rules |
| [AI_BOOTSTRAP.md](00_Product_DNA/AI_BOOTSTRAP.md) | APPROVED | Mandatory AI agent and developer orientation — reading order, task guidance, prohibitions |
| [Product_DNA.md](00_Product_DNA/Product_DNA.md) | APPROVED | Platform identity, vision, mission, philosophy and business scope |
| [Product_Principles.md](00_Product_DNA/Product_Principles.md) | APPROVED | Product principles P-001 to P-013 with rationale and violation examples |
| [Architecture_Principles.md](00_Product_DNA/Architecture_Principles.md) | APPROVED | Architecture principles AP-001 to AP-016 with implementation guidance |
| [Product_Glossary.md](00_Product_DNA/Product_Glossary.md) | APPROVED | Ubiquitous language — authoritative for all naming decisions |
| [Product_Scope_MVP.md](00_Product_DNA/Product_Scope_MVP.md) | APPROVED | MVP+ scope definition, out-of-scope decisions, workspace architecture, UX principles |

### Architecture Decision Records

| Document | Status | Decision |
|---|---|---|
| [ADR-001 Business Objects First](00_Product_DNA/ADR/ADR-001-business-objects-first.md) | ACCEPTED | Domain model is defined before screens, APIs or databases |
| [ADR-002 Knowledge before Documents](00_Product_DNA/ADR/ADR-002-knowledge-before-documents.md) | ACCEPTED | Structured Business Objects are the source of truth; documents are outputs |
| [ADR-003 Event-Driven Architecture](00_Product_DNA/ADR/ADR-003-event-driven-architecture.md) | ACCEPTED | Domain events are the primary cross-domain integration mechanism |
| [ADR-004 API First](00_Product_DNA/ADR/ADR-004-api-first.md) | ACCEPTED | Every business capability is expressed as a versioned API before UI is built |
| [ADR-005 Human-in-the-Loop AI](00_Product_DNA/ADR/ADR-005-human-in-the-loop-ai.md) | ACCEPTED | AI advises; humans confirm and execute all binding domain actions |

---

## 01 — Business

Business processes, capabilities, roles and rules. The business context for the domain model.

| Document | Status | Purpose |
|---|---|---|
| [Business_Process_Architecture.md](01_Business/Business_Process_Architecture.md) | DRAFT | End-to-end process model BP01–BP15 |
| [Business_Domains.md](01_Business/Business_Domains.md) | DRAFT | Core and supporting business domains |
| [Capability_Map.md](01_Business/Capability_Map.md) | DRAFT | Platform capability overview |
| [Process_Capability_Matrix.md](01_Business/Process_Capability_Matrix.md) | DRAFT | Mapping of processes to capabilities |
| [Business_Roles.md](01_Business/Business_Roles.md) | DRAFT | Business roles and responsibilities |
| [Business_Rules.md](01_Business/Business_Rules.md) | DRAFT | Global business rules |
| [BP01_Strategy.md](01_Business/BP01_Strategy.md) | DRAFT | Strategy and project idea |
| [BP02_Project_Initiation.md](01_Business/BP02_Project_Initiation.md) | DRAFT | Project initiation |
| [BP03_Project_Planning.md](01_Business/BP03_Project_Planning.md) | DRAFT | Project planning |
| [BP04_Requirement_Engineering.md](01_Business/BP04_Requirement_Engineering.md) | DRAFT | Requirement engineering |
| [BP05_Library_Management.md](01_Business/BP05_Library_Management.md) | DRAFT | Library and knowledge reuse |
| [BP06_Tender_Creation.md](01_Business/BP06_Tender_Creation.md) | DRAFT | Tender creation |
| [BP07_Publication.md](01_Business/BP07_Publication.md) | DRAFT | Tender publication to suppliers |
| [BP08_Supplier_Collaboration.md](01_Business/BP08_Supplier_Collaboration.md) | DRAFT | Supplier collaboration and response collection |
| [BP09_Evaluation.md](01_Business/BP09_Evaluation.md) | DRAFT | Evaluation of supplier responses |
| [BP10_Consolidation.md](01_Business/BP10_Consolidation.md) | DRAFT | Evaluation consolidation and scoring |
| [BP11_Decision.md](01_Business/BP11_Decision.md) | DRAFT | Decision documentation and approval |
| [BP12_Contract_Handover.md](01_Business/BP12_Contract_Handover.md) | DRAFT | Award and contract handover |
| [BP13_Project_Closing.md](01_Business/BP13_Project_Closing.md) | DRAFT | Project closing |
| [BP14_Lessons_Learned.md](01_Business/BP14_Lessons_Learned.md) | DRAFT | Lessons learned capture |
| [BP15_Knowledge_Management.md](01_Business/BP15_Knowledge_Management.md) | DRAFT | Knowledge management and library contribution |

---

## 02 — Domain Model

Authoritative Business Object specifications. The primary implementation reference.

### Domain Model Architecture Documents

| Document | ID | Status | Purpose |
|---|---|---|---|
| [Domain_Model_Overview.md](02_Domain_Model/Domain_Model_Overview.md) | PKB-02-000 | APPROVED | Aggregate catalog, patterns, reading order for domain model |
| [Bounded_Contexts.md](02_Domain_Model/Bounded_Contexts.md) | PKB-02-009 | APPROVED | All 11 bounded contexts with integration contracts |
| [Aggregate_Relationships.md](02_Domain_Model/Aggregate_Relationships.md) | PKB-02-010 | APPROVED | Cross-aggregate relationship catalog (29 entries) |
| [Business_Object_Lifecycle.md](02_Domain_Model/Business_Object_Lifecycle.md) | PKB-02-011 | APPROVED | State machines, lifecycle gates, end-to-end procurement lifecycle |

### Domain Aggregates (02_Domain_Model/)

| Document | ID | Status | Aggregate Root |
|---|---|---|---|
| [Project.md](02_Domain_Model/Project.md) | PKB-02-002 | APPROVED | Project |
| [Requirement.md](02_Domain_Model/Requirement.md) | PKB-02-001 | APPROVED | Requirement |
| [Tender.md](02_Domain_Model/Tender.md) | PKB-02-003 | DRAFT | Tender |
| [SupplierResponse.md](02_Domain_Model/SupplierResponse.md) | PKB-02-004 | DRAFT | SupplierResponse |
| [Evaluation.md](02_Domain_Model/Evaluation.md) | PKB-02-005 | DRAFT | Evaluation |
| [Decision.md](02_Domain_Model/Decision.md) | PKB-02-006 | DRAFT | Decision |
| [KnowledgeAsset.md](02_Domain_Model/KnowledgeAsset.md) | PKB-02-007 | DRAFT | KnowledgeAsset |
| [LessonsLearnedRecord.md](02_Domain_Model/LessonsLearnedRecord.md) | PKB-02-008 | DRAFT | LessonsLearnedRecord |

### Foundation Aggregates (02_Foundation/)

| Document | ID | Status | Aggregate Root |
|---|---|---|---|
| [User.md](02_Foundation/User.md) | PKB-02F-001 | APPROVED | User |
| [Organization.md](02_Foundation/Organization.md) | PKB-02F-002 | APPROVED | Organization |
| [Tenant.md](02_Foundation/Tenant.md) | PKB-02F-003 | APPROVED | Tenant |
| [SupplierProfile.md](02_Foundation/SupplierProfile.md) | PKB-02F-004 | APPROVED | SupplierProfile |
| [RequirementLibrary.md](02_Foundation/RequirementLibrary.md) | PKB-02F-005 | APPROVED | RequirementLibrary |

---

## 03 — Functional

Functional capability specifications. Bridges business processes and domain model to user-facing features.

| Document | ID | Status | Purpose |
|---|---|---|---|
| [MVP_Functional_Scope.md](03_Functional/MVP_Functional_Scope.md) | PKB-03-001 | APPROVED | 14 functional areas: F-01 to F-14; user actions, system enforcements, out-of-scope |

---

## 04 — UI

Workspace architecture, navigation model and user journey specifications.

| Document | ID | Status | Purpose |
|---|---|---|---|
| [Navigation.md](04_UI/Navigation.md) | PKB-04-001 | APPROVED | Application shell, sidebar, top bar, URL structure, routing rules |
| [Dashboard.md](04_UI/Dashboard.md) | PKB-04-002 | APPROVED | Role-based dashboards, widget catalog, My Tasks panel |
| [Workspace_Concept.md](04_UI/Workspace_Concept.md) | PKB-04-003 | APPROVED | Workspace pattern, layout anatomy, shared component vocabulary |
| [Requirement_Workspace.md](04_UI/Requirement_Workspace.md) | PKB-04-004 | APPROVED | Library browsing, requirement creation, import, AI assistance |
| [Tender_Workspace.md](04_UI/Tender_Workspace.md) | PKB-04-005 | APPROVED | Wizard-based tender creation, suppliers, clarifications, publication |
| [Supplier_Workspace.md](04_UI/Supplier_Workspace.md) | PKB-04-006 | APPROVED | Supplier registry, qualification workflow, Supplier Portal spec |
| [Evaluation_Workspace.md](04_UI/Evaluation_Workspace.md) | PKB-04-007 | APPROVED | Evaluator scoring interface, consolidated view, blind scoring enforcement |
| [Decision_Workspace.md](04_UI/Decision_Workspace.md) | PKB-04-008 | APPROVED | Decision board, COI declaration, report access, approval workflow |
| [Global_Search.md](04_UI/Global_Search.md) | PKB-04-009 | APPROVED | Universal search overlay, command palette, recent items |
| [Notifications.md](04_UI/Notifications.md) | PKB-04-010 | APPROVED | Notification types, delivery channels, in-app panel, email config |
| [Reference_Video_Analysis.md](04_UI/Reference_Video_Analysis.md) | PKB-04-011 | APPROVED | 7 observed UX patterns from reference platforms; adtender design decisions |
| [Application_Navigation.md](04_UI/Application_Navigation.md) | PKB-04-012 | APPROVED | Two-level navigation model; stage progress bar; stage-aware action visibility |
| [Requirement_Evaluation_Matrix.md](04_UI/Requirement_Evaluation_Matrix.md) | PKB-04-013 | APPROVED | M×N evaluation matrix; score heatmap; cell interaction; GBR-013 enforcement |
| [Task_Deadline_Workspace.md](04_UI/Task_Deadline_Workspace.md) | PKB-04-014 | APPROVED | Task list, calendar, deadline timeline, system-generated + manual tasks |
| [Clarification_Workspace.md](04_UI/Clarification_Workspace.md) | PKB-04-015 | APPROVED | Q&A thread management; equal treatment; publish-to-all; amendment notices |
| [Dashboard_Concept.md](04_UI/Dashboard_Concept.md) | PKB-04-016 | APPROVED | Enhanced dashboard; action-first layout; stage-aware tender cards; role variants |
| [iPavos_Reference_Analysis.md](04_UI/iPavos_Reference_Analysis.md) | PKB-04-017 | APPROVED | Screen-by-screen analysis of iPavos reference platform; UX patterns adopted; role/function confirmation |

---

## 09 — Product Concept

The synthesized design vision. Consolidates all reference observations into adtender-native product decisions.

| Document | ID | Status | Purpose |
|---|---|---|---|
| [Target_Product_Concept.md](09_Product_Concept/Target_Product_Concept.md) | PKB-09-001 | APPROVED | Complete design vision: philosophy, navigation, workspace, modules, UX, AI, roadmap |

---

## 05 — Technical

Technical architecture, deployment model, stack constraints, and infrastructure decisions.

| Document | ID | Status | Purpose |
|---|---|---|---|
| [Deployment_Target.md](05_Technical/Deployment_Target.md) | PKB-05-001 | APPROVED | Target domain, hosting model, repo structure, multi-environment strategy |
| [Technology_Stack.md](05_Technical/Technology_Stack.md) | PKB-05-002 | APPROVED | Full stack definition: React/Vite, Cloudflare Workers, D1, KV, Resend — with IEC-confirm items |
| [Environment_Variables.md](05_Technical/Environment_Variables.md) | PKB-05-003 | APPROVED | All env vars and secrets; local/staging/production setup; deploy checklist |
| [Cloudflare_Deployment.md](05_Technical/Cloudflare_Deployment.md) | PKB-05-004 | APPROVED | Pages + Workers deployment; GitHub Actions; migrations; rollback; security |
| [Email_Integration_Resend.md](05_Technical/Email_Integration_Resend.md) | PKB-05-005 | APPROVED | Resend setup; DNS; email catalog; templates; equal-treatment bulk sending |

---

## 06 — AI

AI behavior guidelines, prompt engineering standards and AI model interaction contracts.

| Document | Status | Purpose |
|---|---|---|
| *(No documents yet)* | PLANNED | — |

---

## 07 — Development

Coding patterns, testing standards, tooling and implementation rules.

| Document | Status | Purpose |
|---|---|---|
| *(No documents yet)* | PLANNED | — |
