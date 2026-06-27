---
id: PKB-01-001
title: Business Process Architecture
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
  - PKB-01-002
---

# Business Process Architecture

## Purpose

This document defines the end-to-end business process architecture of adtender. It describes the fifteen business processes that constitute the complete lifecycle of a project, the flow and dependencies between them, the Business Objects involved in each process, the domain ownership, and the process sequencing rules.

The business process architecture is intentionally independent of technology and user interface. It describes what the business does, not how software implements it.

---

## Governing Principle

> Every completed project shall enrich the organizational knowledge base.

The process architecture is designed around this principle. The process flow does not end with a Decision or a Contract. It continues through Project Closing, Lessons Learned and Knowledge Management — ensuring that organizational intelligence grows with every initiative.

---

## End-to-End Process Overview

The fifteen processes form a lifecycle chain with two continuous capabilities (BP05 and BP15) that bookend the knowledge flow.

```
Strategic Layer
────────────────────────────────────────────────────────────
  BP01  Strategy & Project Idea
  BP02  Project Initiation
  BP03  Project Planning

Knowledge & Preparation Layer
────────────────────────────────────────────────────────────
  BP04  Requirement Engineering
  BP05  Library & Knowledge Reuse        ◄── continuous capability

Tender Execution Layer
────────────────────────────────────────────────────────────
  BP06  Tender Creation
  BP07  Publication
  BP08  Supplier Collaboration

Evaluation & Decision Layer
────────────────────────────────────────────────────────────
  BP09  Evaluation
  BP10  Consolidation
  BP11  Decision

Closure & Knowledge Layer
────────────────────────────────────────────────────────────
  BP12  Contract Handover
  BP13  Project Closing
  BP14  Lessons Learned
  BP15  Knowledge Management             ◄── feeds back into BP05
```

BP05 provides organizational library knowledge into new projects. BP15 feeds project experience back into organizational libraries. Together they constitute the knowledge flywheel.

---

## Process Descriptions

### BP01 — Strategy & Project Idea

**Layer:** Strategic | **Owner:** Executive Sponsor, Project Owner

**Entry condition:** A business need, opportunity or obligation has been identified that may require an external procurement or structured decision process.

**Exit condition:** Business case approved; Project record created in `Idea` state; Project Owner designated.

**What happens:** The organization identifies a need — a new system, a supplier selection, a strategic sourcing initiative. The Executive Sponsor reviews the business case for strategic alignment and budget justification. Initial scope and objectives are established. The Project record is created as the organizing container for all subsequent activity.

**Business Objects:** `Project` (created, state: Idea)  
**Domain:** Project Management | **Detail:** [BP01_Strategy.md](./BP01_Strategy.md)

---

### BP02 — Project Initiation

**Layer:** Strategic | **Owner:** Project Owner, Project Manager

**Entry condition:** Project in `Idea` state; business case approved.

**Exit condition:** Project in `Initiated` state; Project Owner and Manager assigned; initial team assembled; governance structure defined.

**What happens:** The project is formally established. The organization commits resources. The Project Manager is assigned. The project team is assembled with initial role assignments. Governance rules for the project — approval chain, escalation path, conflict of interest declarations — are configured.

**Business Objects:** `Project` (state: Idea → Initiated)  
**Domain:** Project Management | **Detail:** [BP02_Project_Initiation.md](./BP02_Project_Initiation.md)

---

### BP03 — Project Planning

**Layer:** Strategic | **Owner:** Project Manager, Project Owner

**Entry condition:** Project in `Initiated` state.

**Exit condition:** Project in `Planned` state; milestones defined; Tender timeline established; evaluation approach agreed.

**What happens:** The project plan is created with milestones, responsibilities and a realistic timeline. The procurement strategy is defined: single or multi-round tender, open or restricted, public or private. The evaluation approach is agreed at high level. The supplier market is considered.

**Business Objects:** `Project` (state: Initiated → Planned)  
**Domain:** Project Management | **Detail:** [BP03_Project_Planning.md](./BP03_Project_Planning.md)

---

### BP04 — Requirement Engineering

**Layer:** Knowledge & Preparation | **Owner:** Requirement Engineer, Domain Expert, Project Owner

**Entry condition:** Project in `Planned` state; scope confirmed.

**Exit condition:** All Requirements for the Tender in `Approved` state; Requirements organized into groups; response types and evaluation properties configured.

**What happens:** Business expectations are structured as Requirements. The Requirement Engineer searches libraries before creating new Requirements. New Requirements are authored, reviewed and approved. Requirements are classified (type, category, priority, knock-out status), organized into groups, and configured with response types and evaluation properties. This is the process where organizational knowledge is most intensively consumed.

**Business Objects:** `Requirement` (created or referenced, state: Draft → Approved), `RequirementLibrary` (searched and consumed)  
**Domain:** Requirement Management | **Detail:** [BP04_Requirement_Engineering.md](./BP04_Requirement_Engineering.md)

---

### BP05 — Library & Knowledge Reuse

**Layer:** Knowledge & Preparation (continuous) | **Owner:** Requirement Engineer, Library Manager

**Entry condition:** Active from project initiation onward; no sequential gate.

**Exit condition:** Not a sequential process — operates as a standing capability.

**What happens:** Library & Knowledge Reuse is a continuous capability, not a sequential step. During BP04, Requirements are searched and reused from libraries. During project execution, the Library Manager governs library health. During BP15, improvements are contributed back. This process represents the organizational knowledge flywheel.

**Business Objects:** `RequirementLibrary`, `Requirement` (library versions), `KnowledgeAsset`, `Template`  
**Domain:** Knowledge Management, Requirement Management | **Detail:** [BP05_Library_Management.md](./BP05_Library_Management.md)

---

### BP06 — Tender Creation

**Layer:** Tender Execution | **Owner:** Project Manager, Procurement Manager, Requirement Engineer

**Entry condition:** All Requirements in `Approved` state; Evaluation Model defined; Supplier invitation list prepared.

**Exit condition:** Tender in `Approved` state; ready for publication.

**What happens:** The Tender is assembled from the approved Requirement set. Tender structure is defined (sections, groups). The Evaluation Model is configured (scoring method, weights, knock-out flags). The Supplier invitation list is finalized. The Tender is reviewed for compliance and approved for publication.

**Business Objects:** `Tender` (created, state: Draft → Approved), `Requirement` (referenced), `Supplier` (invitation list prepared)  
**Domain:** Tender Management | **Detail:** [BP06_Tender_Creation.md](./BP06_Tender_Creation.md)

---

### BP07 — Publication

**Layer:** Tender Execution | **Owner:** Procurement Manager, Project Manager

**Entry condition:** Tender in `Approved` state; Supplier invitation list confirmed; submission deadline set.

**Exit condition:** Tender in `Published` state; all invited Suppliers notified; Requirement versions frozen; clarification window open.

**What happens:** The Tender is published to invited Suppliers. Requirement versions are frozen at publication time. Suppliers receive Supplier Portal access. The clarification window opens. The submission deadline is communicated. Any subsequent changes to the Tender require the formal amendment process.

**Business Objects:** `Tender` (state: Approved → Published), `Supplier` (portal access granted), Requirement version snapshot (frozen)  
**Domain:** Tender Management, Supplier Management | **Detail:** [BP07_Publication.md](./BP07_Publication.md)

---

### BP08 — Supplier Collaboration

**Layer:** Tender Execution | **Owner:** Procurement Manager, Project Manager

**Entry condition:** Tender in `Published` state; clarification window open.

**Exit condition:** All submitted Supplier Responses locked; submission deadline passed; Evaluation may begin.

**What happens:** Suppliers ask clarification questions. The Procurement Manager reviews and answers questions, publishing answers to all invited Suppliers to maintain equal treatment. Tender amendments may be issued if clarifications reveal errors. Suppliers complete and submit their structured Supplier Responses. Submissions are locked after the deadline.

**Business Objects:** `ClarificationRequest` (received), `ClarificationAnswer` (published), `SupplierResponse` (state: Draft → Submitted → Locked)  
**Domain:** Supplier Management, Tender Management | **Detail:** [BP08_Supplier_Collaboration.md](./BP08_Supplier_Collaboration.md)

---

### BP09 — Evaluation

**Layer:** Evaluation & Decision | **Owner:** Evaluators, Project Owner

**Entry condition:** All Supplier Responses locked; Evaluation configured with Evaluator assignments.

**Exit condition:** All assigned Evaluators have completed individual scoring; Evaluation in `UnderReview` state.

**What happens:** The Evaluation is opened. Evaluators are assigned to Requirement groups. Each Evaluator independently scores Supplier Responses for their assigned Requirements, providing rationale for each score. Knock-out criteria are applied. Evidence is reviewed. Blind evaluation ensures Evaluators cannot see each other's scores during this phase.

**Business Objects:** `Evaluation` (state: Preparing → InProgress → UnderReview), `EvaluationScore` records  
**Domain:** Evaluation Management | **Detail:** [BP09_Evaluation.md](./BP09_Evaluation.md)

---

### BP10 — Consolidation

**Layer:** Evaluation & Decision | **Owner:** Project Manager, Project Owner

**Entry condition:** Evaluation in `UnderReview` state; all individual scores recorded.

**Exit condition:** Evaluation in `Completed` state; consolidated ranking produced; Evaluation result approved as Decision basis.

**What happens:** Individual scores are aggregated according to the Evaluation Model. Scoring anomalies and evaluator inconsistencies are surfaced. The consolidation team reviews disputed scores. A final consolidated ranking is produced. The Evaluation result is approved as the basis for the Decision.

**Business Objects:** `Evaluation` (state: UnderReview → Completed), consolidated `EvaluationResult`  
**Domain:** Evaluation Management | **Detail:** [BP10_Consolidation.md](./BP10_Consolidation.md)

---

### BP11 — Decision

**Layer:** Evaluation & Decision | **Owner:** Decision Board, Project Owner

**Entry condition:** Evaluation in `Completed` state.

**Exit condition:** Decision in `Approved` state; selected Supplier identified; Decision rationale documented.

**What happens:** The Decision Board reviews the consolidated Evaluation result. A Decision record is drafted capturing the rationale: decisive Requirements, accepted trade-offs, accepted deviations. The Decision Board approves the Decision. The Decision is immutable from this point. Supplier notifications are prepared.

**Business Objects:** `Decision` (created, state: Draft → Approved), `Evaluation` (referenced)  
**Domain:** Decision Management | **Detail:** [BP11_Decision.md](./BP11_Decision.md)

---

### BP12 — Contract Handover

**Layer:** Closure | **Owner:** Procurement Manager, Project Manager

**Entry condition:** Decision in `Approved` state.

**Exit condition:** Awarded Supplier notified; unsuccessful Suppliers notified; handover package transferred to downstream systems; Project state updated.

**What happens:** The award is communicated to the selected Supplier. Unsuccessful Suppliers are notified per organizational governance (including standstill periods where applicable). The handover package is assembled and transferred to legal, ERP and contract management. Downstream systems receive structured award data.

**Business Objects:** `Decision` (referenced), `Project` (state updated), integration events to ERP/DMS  
**Domain:** Decision Management, Integration | **Detail:** [BP12_Contract_Handover.md](./BP12_Contract_Handover.md)

---

### BP13 — Project Closing

**Layer:** Closure | **Owner:** Project Owner, Project Manager

**Entry condition:** Contract Handover completed; all open actions resolved.

**Exit condition:** Project in `Closing` state; Lessons Learned workflow triggered; all documents archived.

**What happens:** All open project actions are resolved or formally closed. The Supplier Portal is closed to new submissions. Project documentation is finalized. The project moves to `Closing` state, which mandatorily triggers the Lessons Learned workflow (GBR-018). The project cannot reach `Archived` state until Lessons Learned is completed.

**Business Objects:** `Project` (state: Active → Closing), `LessonsLearned` (initiated)  
**Domain:** Project Management | **Detail:** [BP13_Project_Closing.md](./BP13_Project_Closing.md)

---

### BP14 — Lessons Learned

**Layer:** Knowledge | **Owner:** Project Owner, Project Manager, all participants

**Entry condition:** Project in `Closing` state; Lessons Learned workflow initiated.

**Exit condition:** Lessons Learned record in `Completed` state; improvement proposals submitted to Knowledge Management.

**What happens:** The project team reviews what worked and what could be improved: Requirement quality, Tender structure, Supplier quality observations, Evaluation model effectiveness, Decision process efficiency. Observations are captured as structured Lessons Learned items. Requirement improvements and new Knowledge Assets are proposed to the library governance process.

**Business Objects:** `LessonsLearned` (state: Draft → Completed), `RequirementImprovementProposal`, `KnowledgeAsset` (proposed)  
**Domain:** Knowledge Management, Requirement Management | **Detail:** [BP14_Lessons_Learned.md](./BP14_Lessons_Learned.md)

---

### BP15 — Knowledge Management

**Layer:** Knowledge | **Owner:** Library Manager, Requirement Engineer

**Entry condition:** Improvement proposals received from BP14; Library Manager review triggered.

**Exit condition:** Accepted improvements published to Requirement Libraries and Knowledge Assets; Project moved to `Archived` state.

**What happens:** The Library Manager reviews improvement proposals. Valid Requirement improvements are published as new library versions. New Knowledge Assets are created and published. Templates are updated. The organizational knowledge base is enriched. The project may now be archived, closing the full lifecycle.

**Business Objects:** `Requirement` (new library versions), `KnowledgeAsset` (published), `RequirementLibrary` (updated), `Project` (state: Closing → Archived)  
**Domain:** Knowledge Management, Requirement Management | **Detail:** [BP15_Knowledge_Management.md](./BP15_Knowledge_Management.md)

---

## Process Sequencing

| Process | May begin when |
|---|---|
| BP01 | Business need identified |
| BP02 | BP01 complete: Project in `Idea` state, business case approved |
| BP03 | BP02 complete: Project in `Initiated` state |
| BP04 | BP03 complete: Project in `Planned` state |
| BP05 | Continuous from BP02 onward |
| BP06 | BP04 complete: all Requirements in `Approved` state |
| BP07 | BP06 complete: Tender in `Approved` state |
| BP08 | BP07 complete: Tender in `Published` state |
| BP09 | BP08 complete: all Supplier Responses in `Locked` state |
| BP10 | BP09 complete: Evaluation in `UnderReview` state |
| BP11 | BP10 complete: Evaluation in `Completed` state |
| BP12 | BP11 complete: Decision in `Approved` state |
| BP13 | BP12 complete: Contract Handover confirmed |
| BP14 | BP13 complete: Project in `Closing` state (automatically triggered) |
| BP15 | BP14 complete: Lessons Learned in `Completed` state |

---

## Process-to-Capability Map

| Process | Primary Capability | Supporting Capabilities |
|---|---|---|
| BP01 | Project Management | — |
| BP02 | Project Management | Workflow, Organization Management |
| BP03 | Project Management | Workflow |
| BP04 | Requirement Management | Knowledge Management, Workflow |
| BP05 | Knowledge Management | Requirement Management |
| BP06 | Tender Management | Requirement Management, Workflow |
| BP07 | Tender Management | Supplier Management, Document Management |
| BP08 | Supplier Management | Tender Management, Workflow, Document Management |
| BP09 | Evaluation Management | Supplier Management, Requirement Management, Workflow |
| BP10 | Evaluation Management | Reporting, Workflow |
| BP11 | Decision Management | Evaluation Management, Workflow, Document Management |
| BP12 | Decision Management | Integration, Document Management, Workflow |
| BP13 | Project Management | Workflow, Document Management |
| BP14 | Knowledge Management | Requirement Management, Workflow |
| BP15 | Knowledge Management | Requirement Management |

---

## References

- [`Business_Domains.md`](./Business_Domains.md) — Domain ownership of each process
- [`Business_Roles.md`](./Business_Roles.md) — Role participation per process
- [`Capability_Map.md`](./Capability_Map.md) — Capability definitions
- [`02_Domain_Model/`](../02_Domain_Model/) — Business Object specifications for each process
