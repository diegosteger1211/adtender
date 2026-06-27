---
id: PKB-00-002
title: Product Principles
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

# Product Principles

Product Principles govern all product decisions. They describe what adtender must be and how it must behave — not as aspirations, but as design constraints.

When a feature proposal, architectural choice or implementation decision conflicts with a principle, the principle takes precedence. Exceptions require a formal Architecture Decision Record.

Each principle includes: the rule, the rationale behind it, how to apply it in practice, and what constitutes a violation.

---

## P-001 Business Objects First

**Rule:** Business Objects define the platform. Screens, APIs and database structures are derived from them, never the reverse.

**Why:** UI screens are the most volatile layer of any application — they change with every design iteration. Database schemas optimized for storage diverge from domain concepts. When either of these drives the domain model, the result is an anemic domain that cannot enforce its own rules. Business Objects, by contrast, reflect stable real-world concepts that change only when the business itself changes.

**How to apply:**
- Before implementing any feature, identify the Business Object(s) it affects.
- Define the object's identity, attributes, lifecycle and business rules before writing a single line of UI or persistence code.
- Database migrations must reflect domain evolution, not drive it.
- UI mockups are reviewed against the domain model to ensure correct terminology and lifecycle representation.

**Violation examples:**
- Designing a form first, then deriving the data model from its fields.
- Adding a column to a database table without first updating the domain model.
- Creating a REST endpoint that exposes raw table structure.

*ADR reference: [ADR-001](./ADR/ADR-001-business-objects-first.md)*

---

## P-002 Knowledge by Design

**Rule:** Every feature must either contribute to structured knowledge or improve decision quality. Features that do neither require explicit justification.

**Why:** adtender's long-term value is its organizational knowledge layer. Each interaction is an opportunity to capture structured information that benefits future projects. Features that are purely transactional without contributing to the knowledge base are misaligned with the platform's purpose.

**How to apply:**
- When designing a feature, ask: does this create reusable knowledge, improve a decision, or improve the quality of existing knowledge?
- Evaluation results, lessons learned, requirement improvements and decision rationale must all be captured as structured data.
- Workflows that produce knowledge must have explicit steps for reviewing and contributing that knowledge to libraries.

**Violation examples:**
- Closing a project without triggering a lessons learned process.
- Storing evaluation comments only as free text with no structured metadata.
- Generating a document from a decision without persisting the decision's structured rationale.

---

## P-003 Reuse by Default

**Rule:** The platform must prompt and support reuse of existing knowledge before creation of new content.

**Why:** Every duplicated Requirement, recreated template or reinvented evaluation criterion represents a direct cost: effort wasted, inconsistency introduced, and institutional learning ignored. At enterprise scale, this cost becomes significant across hundreds of projects.

**How to apply:**
- Requirement creation flows must include a library search step before the blank creation form is presented.
- The platform must surface reuse suggestions when similarity to existing content is detected.
- Reuse actions — reference, copy with traceability, derive — must be first-class operations, not secondary options.
- Reuse rates must be measurable KPIs within the platform.

**Violation examples:**
- A "New Requirement" button that opens a blank form with no library search.
- Templates that are duplicated per project with no centralized library.
- Evaluation models recreated from scratch for every tender.

---

## P-004 Configuration before Programming

**Rule:** Business behavior that a customer or tenant might legitimately want to vary must be configurable, not hardcoded.

**Why:** Hardcoded business behavior creates a product that serves one organization's assumptions rather than the enterprise market. It also forces engineering changes for what should be administrative decisions, creating unnecessary release cycles and technical debt.

**How to apply:**
- Requirement types, project types, evaluation methods, scoring models, workflow steps, approval chains, notification rules and response formats must all be configurable per tenant.
- New configuration dimensions must be modeled as Business Objects with their own governance, not as properties files or feature flags.
- When a customer requests a variation, the first question is always: can this be configuration? If yes, make it configuration. If no, document why in an ADR.

**Violation examples:**
- Hardcoding "Fulfilled / Partially Fulfilled / Not Fulfilled" as the only valid response type.
- A single approval workflow that cannot be modified per organization.
- Category lists embedded as enumerations in application code.

*Architecture reference: [AP-009](./Architecture_Principles.md#ap-009-configuration-layer)*

---

## P-005 Human in the Loop

**Rule:** AI and automation may support every business activity, but accountable business decisions must be explicitly confirmed by a human actor.

**Why:** In procurement, public tendering, investment decisions and regulatory contexts, accountability cannot be delegated to an algorithm. Automated decisions expose organizations to legal, regulatory and reputational risk. Beyond compliance, human judgment is irreplaceable for trade-offs that involve context, ethics and organizational values not encoded in the data.

**How to apply:**
- AI-generated content must be visually distinguished from human-authored content in all UI surfaces.
- Any AI action that would change a Business Object's state must be presented as a suggestion requiring explicit user confirmation.
- Approval, publication and closure of Business Objects must always require a human actor.
- AI recommendation logs must record whether each suggestion was accepted, modified or rejected.

**Violation examples:**
- An AI process that approves Requirements automatically based on quality score.
- A workflow that closes a project and archives lessons learned without human review.
- Evaluation scores calculated by AI that are not surfaced for human review before submission.

*Architecture reference: [AP-014](./Architecture_Principles.md#ap-014-secure-by-design)*

---

## P-006 Explainability

**Rule:** Every AI recommendation, evaluation score and decision must be traceable to the structured data that produced it.

**Why:** In enterprise contexts, decision-makers must be able to explain and defend outcomes — to auditors, management, procurement authorities, unsuccessful suppliers, and in legal disputes. A black-box result has no enterprise credibility.

**How to apply:**
- Evaluation scores must reference the Requirement versions and Supplier Response versions they are based on.
- AI recommendations must carry references to the source data (Requirements, historical projects, library entries) that informed them.
- Decisions must reference the Evaluations, Requirement versions and deliberation records that justify them.
- "Explain this" must be a supported operation for every AI output.

**Violation examples:**
- A composite evaluation score with no breakdown by requirement.
- An AI-suggested winner with no reference to which criteria were decisive.
- A Decision record that contains only an approval name and date with no rationale.

---

## P-007 Traceability

**Rule:** Important business information must remain traceable across its full lifecycle. Deletion is not permitted where traceability is a governance requirement.

**Why:** Procurement decisions are subject to audit, challenge and regulatory review. The ability to reconstruct the state of a Requirement, the version a supplier responded to, and the evaluation criteria used is a compliance requirement, not a nice-to-have.

**How to apply:**
- Published and Approved Business Objects must not be deletable; they must be archivable with full history retained.
- References between Business Objects must use versioned identifiers (e.g., `RequirementVersionId`, not just `RequirementId`).
- Audit records are immutable and must never be subject to user deletion, even by administrators.
- Every state transition must record who performed it and when.

**Violation examples:**
- Allowing a Requirement to be deleted after it has been used in a published Tender.
- Storing only the current state of a Business Object with no history.
- Evaluations that reference a Requirement by ID without capturing the version.

---

## P-008 Domain Neutrality

**Rule:** The platform must not encode assumptions about a specific industry, procurement category or business domain into its core model.

**Why:** adtender targets enterprise organizations across industries — manufacturing, IT, logistics, professional services, public sector. Hardcoding assumptions about IT procurement, for example, would make the platform unsuitable for manufacturing or infrastructure decisions. The platform's commercial reach depends on this neutrality.

**How to apply:**
- Requirement types, evaluation criteria, scoring models, supplier categories and project types must all be configurable, not hardcoded.
- Example content in documentation should span multiple industries; no single domain should dominate.
- When an industry-specific feature is requested, design it as a configuration set, not a platform code change.
- Domain-specific terminology must not leak into the core platform model.

**Violation examples:**
- A Requirement model that has a "SAP module" field at the domain layer.
- An evaluation model that assumes price is always a criterion.
- Workflow steps named after procurement-law concepts from a single jurisdiction.

---

## P-009 Platform Thinking

**Rule:** Every capability must be designed as a reusable, extensible platform component, not as a one-off solution for a single use case.

**Why:** The commercial and architectural investment in adtender justifies itself through breadth of reuse. A capability designed only for Tender Management is a cost; a capability designed for Tender Management but extensible to Investment Decisions and Strategic Sourcing is a platform asset.

**How to apply:**
- Before building a new capability, ask: is there an existing platform component this could extend or reuse?
- New bounded contexts must not require changes to existing bounded contexts to function.
- Shared infrastructure (Workflow Engine, Knowledge Layer, Event Bus, Audit Service) must be designed as platform services, not embedded in domain implementations.
- The answer to "can we build this feature?" should always be followed by "how does this extend the platform?".

**Violation examples:**
- Building a second notification system because the first was designed specifically for Tender events.
- Implementing a project-specific approval chain instead of using the Workflow Engine.
- Domain-specific report generation that cannot be generalized to the Reporting bounded context.

---

## P-010 Decision Documentation

**Rule:** The path to a decision is as important as the decision itself. Rationale, evidence, deliberation and the approval chain must be first-class data.

**Why:** The decision outcome is visible in downstream systems (ERP, contract, purchase order). The rationale for that decision — which supplier was strongest and why, which Requirements were decisive, which trade-offs were accepted — exists only on adtender. Without it, the organization cannot learn from decisions, cannot defend them under audit, and cannot improve future decision processes.

**How to apply:**
- A Decision Business Object must capture: the question, the options considered, the decisive evidence, accepted deviations, the approval chain, and the final rationale.
- Evaluation scores alone are not sufficient decision documentation; the reasoning behind scores must also be captured.
- Decision documents generated for external distribution must be derivable from the structured Decision object, not maintained separately.

**Violation examples:**
- A Decision record that contains only "Supplier X awarded" and an approval stamp.
- Storing decision rationale only in email threads or meeting minutes outside the platform.
- Generating a decision document without a corresponding structured Decision Business Object.

---

## P-011 Audit by Default

**Rule:** Every significant business action must be recorded as an immutable audit entry. Audit capability is not optional and must not be added retroactively.

**Why:** Enterprise platforms operate in regulatory, financial and legal contexts where the ability to reconstruct who did what, when, and with what authorization is mandatory. Audit is an architectural concern, not a logging afterthought.

**How to apply:**
- Every Aggregate Root must maintain an audit log from the moment of its creation.
- Audit records must capture: actor, action, timestamp, previous state, new state, and context.
- Audit records must be stored in a system that does not allow application-level deletion.
- Administrative operations on audit records must themselves be audited.

**Violation examples:**
- Adding audit logging to an aggregate as a later feature iteration.
- Allowing administrators to delete or modify audit records.
- Logging only errors rather than all significant state transitions.

*Architecture reference: [AP-006](./Architecture_Principles.md#ap-006-audit-everything-relevant)*

---

## P-012 Integration by Design

**Rule:** adtender integrates with external enterprise systems at defined boundaries. It does not replicate their capabilities.

**Why:** Organizations have existing investments in ERP, CRM, DMS and contract management systems. adtender's value is its decision and knowledge layer; attempting to duplicate adjacent system capabilities dilutes focus, increases scope, and creates competitive conflicts with system vendors the organization also uses.

**How to apply:**
- When a new feature touches data that could reside in an adjacent system (financial data, contract terms, supplier master data), define the integration boundary explicitly.
- Integration points must be modeled as explicit connectors in the Integration bounded context, not as ad hoc API calls scattered through domain logic.
- Data imported from external systems must be clearly attributed to its source.

**Violation examples:**
- Building a full supplier master data management system instead of integrating with the existing CRM.
- Storing financial commitments and payment terms as first-class domain data rather than referencing the ERP.

---

## P-013 Fail Explicitly

**Rule:** Every operation that cannot complete successfully must communicate its failure clearly, with domain-meaningful information. Silent failures, swallowed exceptions and undefined return values are prohibited.

**Why:** In an enterprise platform that supports compliance-critical workflows, a silent failure is more dangerous than a visible one. An evaluator who submits a response that silently fails, or a Decision that appears saved but was not, creates downstream legal and organizational risk.

**How to apply:**
- Business rule violations must produce named, structured domain errors with a code and human-readable message.
- API responses must use semantically correct HTTP status codes and consistent error response bodies.
- UI must communicate the outcome of every user action — success, failure or pending — without ambiguity.
- Retry-eligible operations must be clearly distinguished from permanent failures.

**Violation examples:**
- A service method that returns `null` when a Business Object is not found rather than throwing a typed `NotFoundError`.
- A form that silently discards validation errors.
- A background process that fails without alerting the relevant business owner.

---

## References

- [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md) — Section 4 (Product Principles) and Section 13 (Coding Principles)
- [`Architecture_Principles.md`](./Architecture_Principles.md) — Technical implementation of these product principles
- [`Product_DNA.md`](./Product_DNA.md) — Business context for these principles
- [`ADR-001`](./ADR/ADR-001-business-objects-first.md) — Decision record for P-001
- [`ADR-002`](./ADR/ADR-002-knowledge-before-documents.md) — Decision record supporting P-002 and P-007
