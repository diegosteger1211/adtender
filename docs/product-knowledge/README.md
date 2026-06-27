---
id: PKB-ROOT-001
title: adtender Product Knowledge Base
version: 2.0
status: APPROVED
owner: Product Architecture
---

# adtender Product Knowledge Base

This directory is the **Single Source of Truth** for the design, architecture and implementation of the adtender platform.

Every product decision, every architectural choice, every domain model and every implementation rule is documented here. Code that contradicts this documentation is incorrect. Documentation that needs to be updated must be updated through a formal change, not circumvented.

---

## Start Here

**First document to read — always:**

> [`00_Product_DNA/AI_MASTER_CONTEXT.md`](00_Product_DNA/AI_MASTER_CONTEXT.md) — The constitutional document of the platform.

Then continue with:

1. [`00_Product_DNA/AI_BOOTSTRAP.md`](00_Product_DNA/AI_BOOTSTRAP.md) — Mandatory orientation for AI agents and developers
2. [`00_Product_DNA/Product_DNA.md`](00_Product_DNA/Product_DNA.md) — Platform identity, vision, mission and business scope
3. [`00_Product_DNA/Product_Principles.md`](00_Product_DNA/Product_Principles.md) — Product principles P-001 to P-013
4. [`00_Product_DNA/Architecture_Principles.md`](00_Product_DNA/Architecture_Principles.md) — Architecture principles AP-001 to AP-016
5. [`00_Product_DNA/Product_Glossary.md`](00_Product_DNA/Product_Glossary.md) — Ubiquitous language — mandatory for all naming

For the complete reading guide and document index, see [`INDEX.md`](INDEX.md).

---

## Audience

This knowledge base is written for:

| Role | Primary Documents |
|---|---|
| Product Management | Product DNA, Product Principles, Business layer |
| Business Architecture | Business Process Architecture, Capability Map, Domain Model |
| Software Architecture | Architecture Principles, ADRs, Domain Model, Technical layer |
| Developers | AI Bootstrap, Architecture Principles, Domain Model, Development layer |
| UX Designers | UI layer, Domain Model (lifecycle and states) |
| QA Engineers | Domain Model (business rules), Functional layer |
| AI Development Agents | AI Master Context, AI Bootstrap — then all others |

---

## Repository Structure

```
docs/product-knowledge/
├── README.md                  — This file
├── INDEX.md                   — Complete document index with status
│
├── 00_Product_DNA/            — Platform identity, principles, ADRs
│   ├── AI_MASTER_CONTEXT.md   — Constitutional document (read first)
│   ├── AI_BOOTSTRAP.md        — AI agent and developer orientation
│   ├── Product_DNA.md         — Vision, mission, philosophy, scope
│   ├── Product_Principles.md  — Product principles
│   ├── Architecture_Principles.md — Architecture principles
│   ├── Product_Glossary.md    — Ubiquitous language
│   └── ADR/                   — Architecture Decision Records
│
├── 01_Business/               — Business processes, capabilities, roles, rules
├── 02_Domain_Model/           — Business Object specifications (authoritative domain model)
├── 03_Functional/             — Functional capability specifications
├── 04_UI/                     — Workspace, navigation and UX specifications
├── 05_Technical/              — Technical architecture, APIs, services, infrastructure
├── 06_AI/                     — AI behavior guidelines, prompting, model contracts
└── 07_Development/            — Coding patterns, testing standards, implementation rules
```

---

## Mandatory Rule

**No implementation starts before the related Business Object and business capability are documented.**

This rule is enforced by Architecture Principle AP-001 and Product Principle P-001. It is not a guideline — it is a platform constraint.

---

## Document Status Model

| Status | Meaning |
|---|---|
| `APPROVED` | Authoritative. Must be followed. Changes require formal review. |
| `DRAFT` | Work in progress. Not yet authoritative. Must not be used as implementation basis. |
| `REVIEW` | Under active review. Use with caution; may change. |
| `DEPRECATED` | Superseded by a newer document. Retained for historical reference. |
