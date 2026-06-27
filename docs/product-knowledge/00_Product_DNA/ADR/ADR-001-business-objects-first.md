---
id: ADR-001
title: Business Objects First
status: ACCEPTED
date: 2025-01-01
deciders:
  - Product Architecture
  - Software Architecture
---

# ADR-001 Business Objects First

## Context

Early product design discussions revealed a recurring pattern in enterprise software projects: features get designed starting from UI screens or database tables, and the domain model is derived backwards from these. This produces an anemic domain — objects that are little more than data containers — with business logic scattered across service classes, controllers and UI components.

For adtender, this approach was identified as architecturally incompatible with the platform's goals:

- The platform must support multiple business domains over time (not just Tender Management).
- Business rules must be enforceable across all access paths — API, event consumers, background jobs — not just the primary UI.
- Reusable knowledge and reusable evaluation models require stable, well-defined domain concepts that do not shift with every UI redesign.
- AI capabilities require structured, typed data — not prose extracted from UI form fields.

A UI-first or database-first approach would compromise all four of these requirements.

## Decision

adtender is modeled around Business Objects before screens, database tables or APIs.

A Business Object is defined by its:
- identity
- attributes and value objects
- lifecycle and state transitions
- business rules and invariants
- commands it accepts
- events it produces
- relationships to other Business Objects

All of these must be defined and documented in the Product Knowledge Base (`02_Domain_Model/`) before any implementation begins for that object.

## Options Considered

**Option A — UI First (rejected):** Design screens first, derive the data model from form fields. Fast time-to-prototype, but produces anemic domain models and creates strong coupling between business logic and UI structure.

**Option B — Database First (rejected):** Design the relational schema first, then build services on top of it. Efficient for simple CRUD but forces the domain to conform to storage concerns. Cross-aggregate queries become tempting shortcuts that destroy domain boundaries.

**Option C — Business Objects First (accepted):** Define the domain model completely before any persistence or UI work begins. Requires upfront discipline but produces a stable, testable, extensible domain that all other layers serve.

## Consequences

**Positive:**
- Business logic is centralized in the domain layer and enforceable from all access paths.
- The domain model is the single source of truth for what is valid.
- Technology changes (database swap, frontend framework change) do not require domain model changes.
- AI components interacting with the domain model work with typed, validated concepts rather than raw data.

**Negative / Mitigations:**
- Higher upfront documentation effort. Mitigated by the Product Knowledge Base structure that makes domain modeling a standard step, not extra work.
- Developers accustomed to database-first or UI-first patterns need to adapt. Mitigated by the AI Bootstrap document and explicit implementation guidance in domain model documents.

## Compliance Check

Every feature implementation must answer: which Business Objects does this feature affect? If those objects are not documented in `02_Domain_Model/`, documentation must be created first.

## References

- [`Product_Principles.md — P-001`](../Product_Principles.md#p-001-business-objects-first)
- [`Architecture_Principles.md — AP-001, AP-002`](../Architecture_Principles.md#ap-001-domain-driven-design)
- [`AI_MASTER_CONTEXT.md — Section 7`](../AI_MASTER_CONTEXT.md)
