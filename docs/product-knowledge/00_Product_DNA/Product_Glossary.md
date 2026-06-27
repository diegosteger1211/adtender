---
id: PKB-00-004
title: Product Glossary
version: 2.0
status: APPROVED
owner: Product Architecture
audience:
  - Product Management
  - Business Architecture
  - Software Architecture
  - Developers
  - UX Designers
  - AI Development Agents
depends_on:
  - PKB-00-MASTER
---

# Product Glossary

This glossary defines the **ubiquitous language** of adtender. Every term listed here must be used consistently across all platform layers: domain model, API, UI, database, events, documentation and code.

Using a synonym, abbreviation or alternative phrasing where a defined term exists is a terminology violation. When a term is not listed, it must be added here before it appears in any platform artifact.

Terms are grouped by domain. Acronyms expand to the full term on first use in any document.

---

## Core Platform Concepts

| Term | Definition | Synonyms / Aliases | Do Not Use |
|---|---|---|---|
| **Business Object** | A domain concept with identity, lifecycle, governance, relationships and business rules. The primary unit of platform value. | Domain Object, Aggregate | Entity (ambiguous), Record, Row, Item |
| **Bounded Context** | An explicit boundary within which a domain model applies and is internally consistent. Each bounded context owns its data, its domain model and its API. | Domain, Service Domain | Module (ambiguous), Package |
| **Aggregate** | A cluster of Business Objects treated as a unit for data changes. Access to internal entities must go through the Aggregate Root. | — | Object group, Cluster |
| **Aggregate Root** | The single entry point to an Aggregate. External code may only reference and mutate an Aggregate through its root. | Root Entity | Parent object |
| **Domain Event** | An immutable record of something that happened in the domain. Always named in the past tense. The primary integration mechanism between bounded contexts. | Business Event | Message, Notification (when used as synonym) |
| **Command** | An instruction to perform a domain operation. Named in the imperative. May be rejected if preconditions are not met. | — | Request (ambiguous), Action |
| **Domain Service** | A stateless service that implements domain logic that does not naturally belong to a single Aggregate. | — | Business Service (ambiguous), Manager |
| **Repository** | An abstraction that provides collection-like access to Aggregates. Hides persistence details from the domain. | — | DAO, DataService |
| **Value Object** | An immutable, identity-free domain concept. Two Value Objects with the same properties are equal. | — | Simple type |
| **Lifecycle** | The defined set of states a Business Object can occupy and the permitted transitions between them. | State Machine, Workflow | Status flow |
| **Audit Record** | An immutable record of a significant business action. Captures actor, action, timestamp and state change. Must not be deletable. | Audit Entry, Audit Log Entry | Log message, Debug log |
| **Version** | An immutable snapshot of a Business Object's state at a specific point in time. Created as an intentional domain act. | Snapshot | Revision (unless explicitly defined as synonym) |
| **Tenant** | An organization using the adtender platform. Each tenant's data is fully isolated from other tenants. | Organization (in multi-tenant context) | Customer (ambiguous in code) |
| **Ubiquitous Language** | The shared vocabulary used consistently by all team members and in all platform artifacts — code, APIs, UI, events and documentation. | Domain Language | — |

---

## Business Domain Objects

| Term | Definition | Synonyms / Aliases | Do Not Use |
|---|---|---|---|
| **Project** | The governing business initiative within which a tender or decision process is executed. A Project coordinates scope, stakeholders, milestones and all related Business Objects. | Initiative | Programme (different scale), Campaign |
| **Requirement** | A structured, reusable, versioned business expectation. Represents what a product, service, system or supplier must fulfill. First-class domain object — not a document paragraph or form field. | Business Requirement | Spec (informal), Criterion (unless in evaluation context) |
| **Requirement Library** | A curated, governed collection of reusable Requirements. Belongs to the organizational layer, independent of any specific project. | Library | Document library, Folder |
| **Tender** | A structured procurement or selection process published to qualified Suppliers. Contains a defined, versioned set of Requirements. | RFP (Request for Proposal), RFI, ITT | Auction, Bid document |
| **Supplier** | An external organization that participates in a Tender by submitting a structured Supplier Response. | Vendor, Bidder, Service Provider | Contractor (unless in post-award context) |
| **Supplier Response** | A structured answer from a Supplier to the Requirements of a published Tender. References specific Requirement versions. | Response, Bid Response | Tender Response (deprecated — see note below), Offer |
| **Evaluation** | A structured assessment of one or more Supplier Responses against defined Requirement versions and evaluation criteria. | Assessment | Review (ambiguous), Scoring (partial) |
| **Evaluation Criteria** | The defined rules and weightings used to assess a Supplier Response against a Requirement. Part of the Evaluation Model. | Scoring Criteria, Weighting | Metrics (ambiguous) |
| **Evaluation Model** | The complete set of Evaluation Criteria, scoring methods and weightings applied to a Tender. Configurable per Tender. | Scoring Model | Evaluation Template (different concept) |
| **Decision** | An accountable business decision with documented rationale, evidence references, approval chain and outcome. | Business Decision | Result, Outcome, Award (partial) |
| **Knowledge Asset** | A structured record of reusable organizational learning derived from project experience. May represent a risk pattern, lessons learned insight, market observation or decision precedent. | Organizational Knowledge, Reusable Knowledge | Knowledge item, Note |
| **Workflow** | A configurable, governed orchestration of business tasks and approvals. Defined as a Business Object with lifecycle and audit. | Process Instance, Workflow Instance | Process (ambiguous — overloaded), Flow |
| **Lessons Learned** | Structured observations captured at project close that describe what worked, what did not, and what should be improved. Feeds back into Knowledge Assets and Requirement Libraries. | Retrospective insights | Post-mortem (negative connotation), Debrief |
| **Award** | The business act of formally selecting a Supplier as the outcome of a Decision. Triggers the contract handover process. | Selection | Winner announcement |
| **Contract Handover** | The formal transfer of the tender result and contract preparation data to the relevant downstream systems (legal, ERP, contract management). | Award Handover | Contract Management (out of scope) |
| **Template** | A reusable, pre-configured starting point for a Project, Tender, Requirement set or Evaluation Model. Stored in the organizational knowledge layer. | Starting Template | Form template (ambiguous) |
| **Knock-out Criterion** | A Requirement whose non-fulfillment by a Supplier results in automatic exclusion from the Evaluation, regardless of other scores. | Exclusion Criterion, Must-have Criterion | Hard requirement (informal) |

> **Note on "Supplier Response" vs "Tender Response":** Previous documents used both terms. The platform standardizes on **Supplier Response** as the ubiquitous language term and `SupplierResponse` as the aggregate name. "Tender Response" is deprecated and must not appear in new documentation, code or APIs.

---

## Roles

| Term | Definition |
|---|---|
| **Project Owner** | The business stakeholder accountable for the outcome of a Project. Has final approval authority within the project. |
| **Project Manager** | The individual responsible for coordinating the day-to-day execution of a Project within adtender. |
| **Requirement Engineer** | The individual responsible for defining, structuring, classifying and managing Requirements within a Project or Library. |
| **Procurement Manager** | The individual responsible for managing the Tender process, Supplier relationships and compliance. |
| **Evaluator** | An individual assigned to assess Supplier Responses against Requirements within an Evaluation. |
| **Decision Board** | The group of stakeholders authorized to make and approve the final Decision. |
| **Supplier Contact** | The individual at a Supplier organization who submits and manages the Supplier Response. |
| **Library Manager** | The individual responsible for the governance of a Requirement Library. |
| **System Administrator** | The individual responsible for platform configuration, user management and tenant setup. |

---

## Technical Terms

| Term | Definition |
|---|---|
| **ADR** | Architecture Decision Record. A document that captures an architectural decision, its context, the options considered, the chosen option and its consequences. |
| **API** | Application Programming Interface. In adtender, all business capabilities are exposed through versioned REST APIs. |
| **Event Store** | An append-only storage mechanism for domain events. |
| **Idempotency** | The property of an operation such that performing it multiple times produces the same result as performing it once. Required for all event consumers. |
| **Outbox Pattern** | A pattern for reliable event publication: events are first written to a local outbox table in the same transaction as the domain state change, then published to the event bus asynchronously. |
| **Read Model** | A projection of domain data optimized for query. Derived from domain events. Not a source of truth — the aggregate is. |
| **Saga** | A pattern for managing long-running, multi-step business processes across bounded contexts using domain events and compensating commands. |

---

## Lifecycle States (Platform Standard)

The following state names are the platform-standard lifecycle vocabulary. Domain-specific states extend this vocabulary but must not contradict these definitions.

| State | Meaning |
|---|---|
| **Draft** | Initial creation state. Object is being authored. Editable. Not yet subject to approval governance. |
| **In Review** | Submitted for quality review or approval. Editing is restricted. |
| **Approved** | Formally approved. Immutable. A new version is required for any change. |
| **Published** | Made available to external parties (e.g., Suppliers). Immutable. |
| **Active** | Currently in use within a business process. |
| **Completed** | Business process for this object has concluded successfully. |
| **Deprecated** | Should not be used in new contexts. Retained for historical reference and existing usages. |
| **Archived** | Retained for historical traceability. Not visible in normal workflow surfaces. Immutable. |
| **Cancelled** | The associated process was explicitly stopped before completion. |

---

## References

- [`AI_MASTER_CONTEXT.md`](./AI_MASTER_CONTEXT.md) — Sections 6 (DDD Principles) and 12 (Naming Conventions)
- [`Product_DNA.md`](./Product_DNA.md) — Platform identity and business scope context
- [`02_Domain_Model/`](../02_Domain_Model/) — Authoritative Business Object specifications
