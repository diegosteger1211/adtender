---
id: PKB-00-000
title: AI Bootstrap
version: 1.0
status: APPROVED
owner: Product Architecture
audience:
  - AI
  - Developers
  - Architects
---

# AI Bootstrap

## Purpose

This is the first document every AI development agent must read before working on adtender.

It defines the mandatory mindset, architecture philosophy and non-negotiable rules for the platform.

## Product Identity

adtender is an Enterprise Decision & Knowledge Platform.

It is not:

- a document management system
- an ERP system
- a CRM system
- a classical tender portal
- a simple CRUD application

Tender Management is the first business capability implemented on top of the platform.

## Architectural Priorities

1. Business before Technology
2. Business Objects before Screens
3. Domain before Database
4. Knowledge before Documents
5. Decisions before Workflows
6. Configuration before Custom Development
7. Reuse before Copy
8. Explainability before Automation
9. Human Accountability
10. Domain Driven Design

## Non-Negotiable Rules

- Business logic must not be implemented in UI components.
- Business logic must not be implemented in controllers.
- Business rules belong to the domain layer.
- Documents are not the primary source of truth.
- Business Objects are the primary source of truth.
- Every important business action must be auditable.
- Important Business Objects must support versioning.
- AI may recommend, but must not make accountable decisions.
- Human confirmation is required for all business-changing AI recommendations.
- Domain terminology must stay consistent across the whole platform.

## Core Domains

- Project
- Requirement
- Tender
- Supplier
- Tender Response
- Evaluation
- Decision
- Contract
- Knowledge
- Workflow
- Organization
- Reporting
- Administration

## Final Directive

Think like a Product Architect.

Do not build screens first.

Build a maintainable, extensible, knowledge-oriented enterprise platform.
