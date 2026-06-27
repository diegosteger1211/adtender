---
id: PKB-01-007
title: Process Capability Matrix
version: 2.0
status: APPROVED
owner: Product Architecture
audience:
  - Product Management
  - Business Architecture
  - Software Architecture
  - AI Development Agents
depends_on:
  - PKB-01-001
  - PKB-01-006
---

# Process Capability Matrix

## Purpose

This matrix maps each of the fifteen business processes to the capabilities they exercise. It shows which capabilities are primarily driven by each process (P) and which capabilities provide supporting functions (S).

Use this matrix for:
- Impact analysis: which processes are affected when a capability changes
- Roadmap planning: which capabilities must be delivered before a process can be supported
- Feature specification: identifying all capabilities a new feature must interact with

---

## Matrix

| Process | Project Mgmt | Requirement Mgmt | Tender Mgmt | Supplier Mgmt | Evaluation Mgmt | Decision Mgmt | Knowledge Mgmt | Workflow | Doc Mgmt | Reporting | Integration |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| BP01 Strategy | **P** | — | — | — | — | — | — | S | — | — | — |
| BP02 Initiation | **P** | — | — | — | — | — | — | S | — | — | — |
| BP03 Planning | **P** | — | — | — | — | — | — | S | — | — | — |
| BP04 Requirements | S | **P** | — | — | — | — | S | S | — | — | — |
| BP05 Library | — | S | — | — | — | — | **P** | S | — | S | — |
| BP06 Tender Creation | S | S | **P** | S | — | — | — | S | S | — | — |
| BP07 Publication | — | — | **P** | S | — | — | — | S | S | — | — |
| BP08 Supplier Collab | — | — | S | **P** | — | — | — | S | S | — | — |
| BP09 Evaluation | — | S | — | S | **P** | — | — | S | — | — | — |
| BP10 Consolidation | — | — | — | — | **P** | — | — | S | — | S | — |
| BP11 Decision | — | — | — | — | S | **P** | — | S | S | — | — |
| BP12 Handover | — | — | — | S | — | S | — | S | S | — | **P** |
| BP13 Closing | **P** | — | — | — | — | — | — | S | S | — | — |
| BP14 Lessons Learned | — | S | — | — | — | — | **P** | S | — | — | — |
| BP15 Knowledge Mgmt | — | S | — | — | — | — | **P** | S | — | S | — |

**P** = Primary capability driving this process  
**S** = Supporting capability consumed by this process  
**—** = Not involved

---

## Capability Delivery Prerequisites

The following table shows the minimum capability set required before each process can be supported by the platform. Processes cannot be activated until all listed capabilities are available.

| Process | Required Capabilities (minimum) |
|---|---|
| BP01 | Project Management |
| BP02 | Project Management, Workflow Management |
| BP03 | Project Management, Workflow Management |
| BP04 | Requirement Management, Knowledge Management, Workflow Management |
| BP05 | Knowledge Management, Requirement Management |
| BP06 | Tender Management, Requirement Management, Workflow Management |
| BP07 | Tender Management, Supplier Management, Document Management |
| BP08 | Supplier Management, Tender Management, Workflow Management |
| BP09 | Evaluation Management, Supplier Management, Requirement Management |
| BP10 | Evaluation Management, Reporting |
| BP11 | Decision Management, Evaluation Management, Workflow Management, Document Management |
| BP12 | Decision Management, Integration, Document Management |
| BP13 | Project Management, Workflow Management, Document Management |
| BP14 | Knowledge Management, Requirement Management, Workflow Management |
| BP15 | Knowledge Management, Requirement Management |

---

## Capability Coverage by Phase

| Platform Phase | Capabilities Delivered | Processes Supported |
|---|---|---|
| Phase 1 — Foundation | Project Mgmt, Requirement Mgmt, Tender Mgmt, Supplier Mgmt, Evaluation Mgmt, Decision Mgmt, Knowledge Mgmt (basic), Workflow, Document Mgmt | BP01–BP15 (full lifecycle) |
| Phase 2 — Knowledge Intelligence | Knowledge Mgmt (full), Requirement Mgmt (AI-enhanced), Reporting (full) | BP04, BP05, BP14, BP15 (enhanced) |
| Phase 3 — AI Augmentation | All capabilities (AI-enhanced) | All processes (AI-assisted) |
| Phase 4 — Integration Ecosystem | Integration (full), Reporting (BI export) | BP12 (full automation), cross-system |

---

## References

- [`Business_Process_Architecture.md`](./Business_Process_Architecture.md) — Process descriptions and sequencing
- [`Capability_Map.md`](./Capability_Map.md) — Capability definitions
- [`Business_Domains.md`](./Business_Domains.md) — Domain ownership of capabilities
