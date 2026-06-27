---
id: PKB-00-000
title: AI Bootstrap
version: 2.0
status: APPROVED
owner: Product Architecture
audience:
  - AI Development Agents
  - Developers
  - Architects
depends_on:
  - PKB-00-MASTER
---

# AI Bootstrap

## Purpose

This is the mandatory entry point for every AI development agent working on adtender.

Read this document completely before generating any code, any documentation, or any architectural proposal. It will prevent the most common and most costly mistakes.

The full constitutional authority lives in [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md). This document is your fast-start orientation. It does not replace the master context — it precedes it.

---

## What adtender Is

adtender is an **Enterprise Decision & Knowledge Platform**.

The first business domain implemented on the platform is Tender Management.

The platform is not:

- a document management system
- an ERP or CRM system
- a classical supplier portal that publishes PDFs
- a simple CRUD application
- a workflow tool that happens to store some data

Every architectural and implementation decision must be evaluated against this identity. If a feature would make sense in a document portal but not in a Decision & Knowledge Platform, it is wrong for adtender.

---

## Mandatory Reading Order

Before implementing any task, load context in this order. Do not skip steps.

| Step | Document | Purpose |
|---|---|---|
| 1 | [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md) | Constitutional rules, all principles, naming conventions, coding directives |
| 2 | [`Product_Principles.md`](./Product_Principles.md) | Product-level constraints with rationale and violation examples |
| 3 | [`Architecture_Principles.md`](./Architecture_Principles.md) | Technical architecture constraints with implementation guidance |
| 4 | [`Product_Glossary.md`](./Product_Glossary.md) | Ubiquitous language — mandatory for naming all identifiers |
| 5 | [`02_Domain_Model/{Object}.md`](../02_Domain_Model/) | Full specification for each Business Object in scope |
| 6 | [`01_Business/BP{nn}_{Process}.md`](../01_Business/) | Business process context for the capability being implemented |
| 7 | [`05_Technical/`](../05_Technical/) | Technical specifications if available for the area |

**Loading 1–4 is mandatory for every task, regardless of scope. Loading 5–7 is mandatory for the specific objects and processes in scope.**

---

## Architectural Priorities

When trade-offs arise during implementation, resolve them in this order:

1. Business correctness before technical elegance
2. Business Objects before screens or database tables
3. Domain model before persistence model
4. Structured knowledge before documents
5. Decisions before workflows
6. Configuration before custom development
7. Reuse before creation
8. Explainability before automation
9. Human accountability — always
10. Domain Driven Design throughout

If an implementation choice conflicts with a higher-priority item, the higher-priority item wins unless an ADR approves the exception.

---

## Non-Negotiable Rules

The following rules are absolute. No deadline, no simplification request, no scope trade-off overrides them.

### Domain Layer Rules
- Business logic must not be implemented in UI components.
- Business logic must not be implemented in controllers or command handlers.
- Business rules belong to the domain layer — in aggregates, domain services and policy objects.
- State transitions must be performed through explicit domain methods, never by directly setting a state field.

### Data Integrity Rules
- Documents are not the primary source of truth. Business Objects are.
- Every important business action must produce an audit record.
- Audit records must not be deletable.
- Approved and Published Business Object versions are immutable. A new version must be created for any change.
- Cross-aggregate direct mutation is prohibited.

### AI Rules
- AI must not approve, publish, archive or delete Business Objects.
- AI must not record or approve Decisions.
- AI must not modify approved or published versions without creating a new version through the standard workflow.
- AI recommendations must be presented as suggestions. Human confirmation is required before any AI-suggested change becomes a domain state change.
- AI interactions with domain data must go through the same APIs and authorization checks as any other caller.

### Terminology Rules
- Domain terminology must be consistent across all layers: code, API, UI, events, documentation.
- Use the ubiquitous language from [`Product_Glossary.md`](./Product_Glossary.md) for all identifiers.
- "Supplier Response" is the correct term. "Tender Response" is deprecated.

---

## Core Bounded Contexts

| Bounded Context | Aggregate Roots (partial) | Status |
|---|---|---|
| Project Management | Project | Specified |
| Requirement Management | Requirement, RequirementLibrary | Specified |
| Tender Management | Tender | Planned |
| Supplier Management | Supplier, SupplierResponse | Planned |
| Evaluation Management | Evaluation | Planned |
| Decision Management | Decision | Planned |
| Knowledge Management | KnowledgeAsset | Planned |
| Workflow Management | WorkflowDefinition, WorkflowInstance | Planned |
| Organization Management | Organization, User, Role | Planned |
| Reporting | — | Planned |
| Integration | — | Planned |

**Note:** "Contract" is not a Core Domain of adtender. Contract Lifecycle Management is explicitly out of scope. adtender handles contract handover — the transfer of award data to downstream systems — not ongoing contract management. See [`Product_DNA.md`](./Product_DNA.md#out-of-scope).

---

## Task-Type Implementation Guidance

### Implementing a new Business Object

1. Verify it is not already specified in [`02_Domain_Model/`](../02_Domain_Model/).
2. Read the related Business Process document in [`01_Business/`](../01_Business/).
3. Define: identity, attributes, lifecycle, business rules, commands, events, relationships.
4. Write the domain model document in [`02_Domain_Model/`](../02_Domain_Model/) before writing any code.
5. Implement: Aggregate Root → Entities → Value Objects → Domain Events → Repository interface.
6. Write unit tests for all business rules and lifecycle transitions.
7. Implement: Repository (infrastructure) → Application Service → API → UI.

### Implementing a new API endpoint

1. Identify the Aggregate Root the endpoint operates on.
2. Verify the business operation exists as a Command in the domain model.
3. Implement: Application Service method → Controller mapping → API contract documentation.
4. The controller must not contain business logic.
5. Error responses must use domain-meaningful error codes, not generic HTTP messages.

### Implementing a new UI feature

1. Verify the API contract exists. If not, implement the API first.
2. Determine the lifecycle state context the user will be operating in.
3. UI validation may mirror domain validation for UX, but domain validation is the authority.
4. AI-generated content must be visually distinguished from human-authored content.
5. State labels in the UI must use the lifecycle vocabulary from [`Product_Glossary.md`](./Product_Glossary.md).

### Adding AI capabilities

1. Read [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md) Section 10 (AI Principles) in full.
2. Confirm the capability is advisory, not authoritative.
3. Confirm the capability operates through the standard API and authorization model.
4. Implement the human confirmation step before any AI suggestion becomes a domain state change.
5. Log AI interactions with model identity and invocation context as part of the audit trail.

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---|---|
| Designing the database schema first | Define the domain model first; let the schema follow |
| Implementing a UI form before the API exists | API first; UI is a consumer |
| Storing business logic in an API controller | Business logic in the domain layer |
| Calling `requirement.status = 'Approved'` | Call `requirement.approve(actor, timestamp)` |
| Storing a `RequirementId` reference instead of `RequirementVersionId` | Always reference the specific version where traceability is required |
| Letting AI approve or publish a Business Object | AI suggests; human confirms and executes |
| Using "Tender Response" as a term | Use "Supplier Response" — "Tender Response" is deprecated |
| Creating a project-owned copy of a Requirement with no library traceability | Requirements in projects are references or traced adaptations; the canonical version belongs to the library |
| Implementing a feature without an existing domain model document | Write the domain model document first |

---

## Final Directive

Build a **maintainable, extensible, knowledge-oriented enterprise platform**.

Think from the domain outward — not from the screen inward, not from the database upward, not from the framework downward.

Every line of code is a decision. Ensure it is a decision you can explain to a Product Architect, a domain expert and a regulator.

---

## References

- [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md) — Full constitutional document
- [`Product_DNA.md`](./Product_DNA.md) — Platform identity and business scope
- [`Product_Principles.md`](./Product_Principles.md) — Product principles P-001 to P-013
- [`Architecture_Principles.md`](./Architecture_Principles.md) — Architecture principles AP-001 to AP-016
- [`Product_Glossary.md`](./Product_Glossary.md) — Ubiquitous language
- [`ADR/`](./ADR/) — Architecture Decision Records
