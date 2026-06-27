---
id: PKB-00-003
title: Architecture Principles
version: 2.0
status: APPROVED
owner: Product Architecture
audience:
  - Software Architecture
  - Developers
  - AI Development Agents
depends_on:
  - PKB-00-MASTER
  - PKB-00-001
  - PKB-00-002
---

# Architecture Principles

Architecture Principles govern all technical design decisions on adtender. They are the technical expression of the Product Principles and the implementation constraints that give the platform its structural integrity.

Each principle includes: the rule, the rationale, how to apply it, and what constitutes a violation.

When a technical decision conflicts with a principle, an Architecture Decision Record must be raised and approved before the exception is implemented. Undocumented exceptions are violations.

---

## AP-001 Domain Driven Design

**Rule:** The technical architecture mirrors the business domain model. Technology choices serve domain clarity; domain clarity never bends to technology convenience.

**Why:** The domain model is the most stable layer of the system. Business concepts change more slowly than frameworks, databases and infrastructure. Anchoring the architecture in the domain model means structural changes in technology have limited blast radius. It also means developers, architects and domain experts share a common language.

**How to apply:**
- Bounded contexts define service and module boundaries, not technical layers.
- Aggregate Roots are the primary access point to each domain concept. Nothing accesses an aggregate's internal entities directly from outside the aggregate boundary.
- The ubiquitous language defined in the [`Product_Glossary.md`](./Product_Glossary.md) must appear verbatim in class names, method names, API resource names and event names.
- Domain packages must not import from infrastructure, persistence or UI packages. The dependency arrow always points inward.

**Violation examples:**
- A service named `DataProcessingService` that mixes multiple unrelated domain concepts.
- A repository method named `findById` that returns a raw persistence entity instead of a domain aggregate.
- A module boundary that reflects the team structure rather than the domain model.

---

## AP-002 Business Logic in Domain Layer

**Rule:** All business rules, validations, invariants and state transition logic must live in the domain layer. Controllers, handlers, API routes and UI components must remain thin orchestrators.

**Why:** When business logic is scattered across controllers, services, database triggers and UI components, it becomes impossible to test, impossible to reason about, and impossible to maintain consistently. The domain layer is the only layer that should know what a valid state transition is.

**How to apply:**
- State transitions happen through explicit domain methods on the Aggregate Root: `requirement.approve(...)`, not `requirement.status = 'Approved'`.
- Preconditions for commands are validated by the aggregate before any state change occurs.
- Application services are responsible for loading aggregates, calling domain methods, and persisting results. They contain no business logic themselves.
- Cross-aggregate business logic lives in Domain Services, not in Application Services or controllers.

**Violation examples:**
- `if (requirement.status === 'Draft') { requirement.status = 'Approved' }` in an API controller.
- Validation logic implemented only in a UI form that could be bypassed by a direct API call.
- Business rules enforced only by database triggers.
- An Application Service that makes domain decisions (e.g., decides which workflow to start based on business rules).

---

## AP-003 API First

**Rule:** Every business capability must be fully expressible through a versioned API before any UI is built on top of it. The API is the product; the UI is one consumer.

**Why:** An API-first approach ensures that the platform's capabilities are available to all consumers equally — UI, mobile applications, external integrations, AI agents, automated workflows. It also forces domain clarity: if a capability cannot be clearly expressed as an API operation, the domain model is not yet well-defined.

**How to apply:**
- API contracts must be defined and reviewed before UI development begins for a given capability.
- APIs must expose domain operations, not database operations. The API vocabulary is the ubiquitous language.
- All API endpoints must be versioned from their first release.
- Third-party integrations and AI agents must be able to perform all platform operations through the API that a human user can perform through the UI.

**Violation examples:**
- A capability that is only accessible through the UI with no API equivalent.
- An API endpoint that returns a raw database row rather than a domain representation.
- An API that exposes internal identifiers or database keys that are subject to change.

*ADR reference: [ADR-004](./ADR/ADR-004-api-first.md)*

---

## AP-004 Event Driven Business Facts

**Rule:** Relevant domain state changes produce immutable, named domain events. Events are the primary integration mechanism between bounded contexts.

**Why:** Direct cross-domain calls create tight coupling: a change to the Requirement domain's internal API breaks all consumers. Domain events decouple the producer from the consumer. They also provide a natural audit log and enable event sourcing patterns, replay capabilities and integration with external systems.

**How to apply:**
- Every significant state transition in an Aggregate must emit a domain event.
- Events are named in the past tense and describe a completed fact: `RequirementApproved`, `TenderPublished`.
- Events carry all context required for downstream consumers to react without additional queries.
- Cross-domain reactions are implemented as event consumers, never as direct domain calls.
- Event consumers must be idempotent to handle duplicate delivery.

**Violation examples:**
- A direct method call from the Tender domain into the Requirement domain to notify it of a publication.
- An event named in the present tense: `RequirementApproving`.
- An event payload that contains only an ID, forcing consumers to query for the full state.

*ADR reference: [ADR-003](./ADR/ADR-003-event-driven-architecture.md)*

---

## AP-005 Version Everything Important

**Rule:** Business Objects with governance, compliance or traceability relevance must support explicit versioning. A version is an immutable snapshot of the object's state at a point in time.

**Why:** Supplier responses must reference the exact Requirement version they answered. Evaluations must reference the same version. Decisions must be traceable to the versions in play at decision time. Without explicit versioning, retrospective reconstruction of the decision context is impossible.

**How to apply:**
- A new version is created as an intentional domain act, not as an automatic side effect of any edit.
- Published and Approved versions are immutable. The domain layer must reject any mutation attempt.
- Cross-object references must use versioned identifiers where traceability is required.
- Version history must be preserved indefinitely; versions must not be purged.

**Business Objects requiring versioning:** Requirement, Tender, Evaluation Criteria, Decision, Knowledge Asset, Workflow Definition, Requirement Library configuration.

**Violation examples:**
- Overwriting a published Requirement's description in-place.
- A `SupplierResponse` that stores `RequirementId` rather than `RequirementVersionId`.
- Purging old versions to save storage.

---

## AP-006 Audit Everything Relevant

**Rule:** Every business action with governance significance must produce an immutable audit record. Audit is a design-time concern, not a post-hoc addition.

**Why:** Enterprise platforms operate under audit, regulatory review and legal discovery obligations. The ability to answer "who approved this, and when?" or "what was the state of this object when this decision was made?" is not optional.

**How to apply:**
- Every Aggregate Root must maintain an audit log from creation.
- Audit records capture: actor identity, action name, timestamp, before-state and after-state.
- Audit records are stored in an append-only store; application-level deletion and modification are prohibited.
- Administrative access to audit records must itself be audited.

**Violation examples:**
- Adding audit logging to an aggregate in a later sprint because it was not initially designed in.
- Storing audit data in the same mutable table as the Business Object.
- Allowing a "cleanup" batch process to delete old audit records.

---

## AP-007 Single Source of Business Truth

**Rule:** Every Business Object has one authoritative owner. Duplicate representations across bounded contexts are permitted only through explicit, synchronized read models.

**Why:** Multiple mutable representations of the same Business Object create consistency problems: which copy is correct? In procurement contexts, an inconsistency between the authoritative Requirement and a copy in the Tender domain could produce legally significant discrepancies.

**How to apply:**
- Identify the owning bounded context for each Business Object. Only that context may mutate the canonical state.
- Other bounded contexts that need read access maintain local read models synchronized through domain events.
- Read models are clearly identified as projections, not sources of truth.
- Synchronization lag must be handled explicitly; stale data must be identifiable.

**Violation examples:**
- Two services that both maintain mutable copies of Supplier data with no synchronization mechanism.
- A reporting query that reads directly from a transactional table in another bounded context's database.
- Duplicating Requirement content into a Tender without maintaining the authoritative reference.

---

## AP-008 Loose Coupling

**Rule:** Bounded contexts communicate through explicit APIs and domain events. Direct cross-domain database access and cross-aggregate direct mutation are prohibited.

**Why:** Tight coupling is the primary enemy of the platform architecture. When the Tender domain accesses the Requirement database directly, any schema change in Requirement Management breaks Tender Management. This friction grows exponentially as the number of domains increases.

**How to apply:**
- Each bounded context owns its own data store. No direct cross-schema queries.
- Inter-domain communication: synchronous interactions use public APIs; asynchronous interactions use domain events.
- Aggregates expose their internal entities only through the Aggregate Root. No direct manipulation of internal entities from outside the aggregate.
- Dependencies between bounded contexts must be explicitly documented in the architecture.

**Violation examples:**
- A JOIN query that spans database tables owned by different bounded contexts.
- A method call that retrieves an entity from inside an aggregate and mutates it directly.
- Circular dependencies between bounded contexts.

---

## AP-009 Configuration Layer

**Rule:** Customer-specific and tenant-specific behavior must be expressed as managed configuration data, not as code branches, feature flags or tenant-specific deployments.

**Why:** Configuration-driven multi-tenancy scales. Code-branching for tenant behavior does not. Every tenant-specific code change increases maintenance cost, testing surface and deployment complexity.

**How to apply:**
- Configurable dimensions (requirement types, workflow definitions, evaluation models, approval chains) are Business Objects in the Organization Management or Workflow Management domain.
- Configuration changes follow a lifecycle (Draft → Approved → Active) and are auditable.
- Platform defaults exist at the product level; tenants override selectively.
- The configuration layer must not be able to override platform invariants (immutability of approved versions, audit record preservation, AI human-in-the-loop rules).

**Violation examples:**
- A `switch (tenantId)` statement in domain logic.
- Workflow definitions stored as YAML files deployed per tenant.
- Hardcoded lists of requirement categories that require a code release to extend.

---

## AP-010 Knowledge Layer

**Rule:** Reusable organizational knowledge must be architecturally separated from project-specific usage. A project references knowledge; it does not own it.

**Why:** If knowledge is stored inside projects, it dies when the project is archived. The platform's long-term value — accumulated organizational intelligence — can only be realized if reusable knowledge exists independently of any project lifecycle.

**How to apply:**
- Requirement Libraries, Knowledge Assets and templates belong to the Knowledge Management domain, not to any project.
- A project's relationship to a Requirement is a reference, not ownership. The project may carry a project-specific adaptation (with traceability to the source), but the canonical version belongs to the library.
- The Knowledge Management domain must be accessible across all current and future business domains.
- Library contribution workflows (from project experience back to the library) are first-class business processes.

**Violation examples:**
- Requirements stored only within a project with no library membership or traceability.
- Lessons learned captured as project notes with no structured extraction to Knowledge Assets.
- A template system that is project-scoped rather than organization-scoped.

---

## AP-011 No Logic in UI

**Rule:** UI components must not implement business rules, data validation logic or state transition decisions. These belong exclusively in the domain layer.

**Why:** UI validation is a convenience for the user, not a control mechanism. A business rule implemented only in the UI can be bypassed by any direct API call — intentional or accidental. When the UI is rebuilt, rewritten or replaced (which it will be), business rules must survive unchanged.

**How to apply:**
- UI validation may duplicate domain validation for immediate user feedback, but it must never be the only place a rule is enforced.
- State transition controls in the UI (e.g., "Approve" button visible only when status is Draft) are driven by domain state returned by the API, not by UI-level conditionals.
- Computed values presented in the UI are calculated in the domain or application layer; the UI renders them.

**Violation examples:**
- A form that prevents submission based on a status check performed in a React component with no corresponding domain guard.
- Knock-out requirement logic implemented as a UI filter rather than as a domain rule.

---

## AP-012 No Logic in Controllers

**Rule:** API controllers and command handlers route, translate and delegate. They contain no business decisions.

**Why:** Controllers that contain business logic create a second, hidden domain layer that is harder to test, harder to find and easy to diverge from the actual domain. They also make business logic inaccessible to non-HTTP consumers (event handlers, CLI, background jobs).

**How to apply:**
- Controllers: receive request → validate structure → call Application Service → return response.
- Application Services: load aggregate → call domain method → persist → publish events → return result.
- The business decision (can this transition happen?) is made by the domain. The controller only deals with "did it happen?".

**Violation examples:**
- A controller that checks `if (user.role === 'Approver' && requirement.status === 'InReview')` before calling the service.
- An Application Service that contains a workflow branching decision based on business rules.

---

## AP-013 Dependency Direction

**Rule:** All dependencies must point inward toward the domain. Outer layers depend on inner layers; inner layers never depend on outer layers.

**Why:** When the domain layer imports a persistence framework, a UI library or an HTTP client, it becomes coupled to infrastructure decisions that should be replaceable without changing business logic. Inverting this dependency means the domain is testable in isolation and infrastructure is swappable.

**Dependency order (outermost to innermost):**
```
Infrastructure / UI / API
      ↓
Application Services
      ↓
Domain (Aggregates, Domain Services, Events)
```

**How to apply:**
- The domain layer must have zero imports from infrastructure, persistence, web framework or UI packages.
- Infrastructure implements domain interfaces (Repository pattern). The domain defines the interface; infrastructure provides the implementation.
- Dependency injection is used to wire infrastructure implementations to domain interfaces at startup.

**Violation examples:**
- A domain entity that imports a JPA annotation or a Hibernate type.
- An Aggregate Root that directly calls an HTTP endpoint.
- A domain service that references a specific database query library.

---

## AP-014 Secure by Design

**Rule:** Authentication, authorization, data isolation and tenant separation must be addressed at the architecture level in every component, not added as a retrofitted layer.

**Why:** Security added after the fact is security that has gaps. In an enterprise platform handling commercially sensitive procurement data, a data leak between tenants or an unauthorized access to a Decision record carries severe legal and reputational consequences.

**How to apply:**
- Every domain operation must declare its required permission. Authorization is enforced at the Application Service layer, not only at the API gateway.
- Tenant data isolation must be enforced at the query and aggregate level, not only by application-level filtering.
- Sensitive data fields (financial values, supplier pricing, strategic decision rationale) must have explicit access control at the field level where required.
- Security requirements for new features must be defined in the domain specification before implementation begins.

**Violation examples:**
- Relying on a single API gateway middleware check for all authorization.
- A query that retrieves all records of a type and filters by tenant in application code (tenant data crosses the query boundary).
- Authorization logic implemented in a UI component.

*ADR reference: [ADR-005](./ADR/ADR-005-human-in-the-loop-ai.md) for AI-specific security rules*

---

## AP-015 Idempotent Event Consumers

**Rule:** All consumers of domain events must produce the same result when processing the same event multiple times. The platform cannot guarantee exactly-once event delivery.

**Why:** Distributed systems deliver messages at-least-once in practice. A non-idempotent consumer processing a duplicate `RequirementApproved` event might send a duplicate notification, create a duplicate audit record, or corrupt state. Idempotency is the consumer's responsibility, not the event bus's.

**How to apply:**
- Consumers must track processed event IDs and skip already-processed events.
- State-changing consumers must check current state before applying a change: if the state is already the target state, do nothing and return success.
- Outbox patterns should be used to ensure events are published reliably without dual-write problems.

**Violation examples:**
- An email notification service that sends a notification every time it receives a `ProjectClosed` event, without checking whether the notification was already sent.
- A read model projector that appends a new record for every event arrival without deduplication.

---

## AP-016 Explicit Contract for AI Interactions

**Rule:** AI interactions with domain data must occur through the same APIs, authorization rules and domain constraints as any other caller. AI must not be given privileged direct data access that bypasses domain logic.

**Why:** Allowing AI components to bypass domain rules — even with good intentions — creates a parallel path through which invariants can be violated, audit trails corrupted, and unauthorized state changes made. AI systems are software components; they must respect the same architectural contracts as all other components.

**How to apply:**
- AI services interact with the domain through Application Services or public APIs only.
- AI-suggested changes are submitted as Commands through the standard command pipeline, subject to all standard preconditions and business rule validation.
- AI cannot directly write to domain aggregates, audit tables or event stores.
- AI interactions are logged with the AI model and invocation context as part of the audit trail.

**Violation examples:**
- An AI component that writes a suggestion directly to a Requirement's content field via a database connection.
- An AI pipeline that marks Requirements as Approved by calling an internal method that bypasses the approval workflow.
- AI-generated audit records that are not distinguishable from human-initiated ones.

*ADR reference: [ADR-005](./ADR/ADR-005-human-in-the-loop-ai.md)*

---

## References

- [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md) — Sections 5, 6, 13 — full rationale and implementation context
- [`Product_Principles.md`](./Product_Principles.md) — Business principles these architecture principles implement
- [`ADR-001`](./ADR/ADR-001-business-objects-first.md) — Grounds AP-001 and AP-002
- [`ADR-002`](./ADR/ADR-002-knowledge-before-documents.md) — Grounds AP-007 and AP-010
- [`ADR-003`](./ADR/ADR-003-event-driven-architecture.md) — Grounds AP-004 and AP-015
- [`ADR-004`](./ADR/ADR-004-api-first.md) — Grounds AP-003
- [`ADR-005`](./ADR/ADR-005-human-in-the-loop-ai.md) — Grounds AP-016
