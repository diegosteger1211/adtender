---
id: ADR-003
title: Event-Driven Architecture for Cross-Domain Integration
status: ACCEPTED
date: 2025-01-01
deciders:
  - Software Architecture
  - Product Architecture
---

# ADR-003 Event-Driven Architecture for Cross-Domain Integration

## Context

adtender is structured around independently deployable bounded contexts (see Architecture Principle AP-001). These contexts must communicate with each other — when a Project is closed, Knowledge Management must trigger the Lessons Learned workflow; when a Tender is published, Suppliers must be notified; when a Requirement is approved, any Tender drafts referencing it may need review.

The question is: how should bounded contexts communicate?

**Option A — Direct synchronous calls** means Service A directly calls Service B's API to notify it of a state change. This is simple to implement initially but creates runtime coupling: if Service B is unavailable, Service A's operation fails. It also creates design coupling: Service A must know Service B's API, which creates a dependency that grows with every new downstream consumer.

**Option B — Shared database** means both services read and write to shared tables. This is the most direct cause of tight coupling in distributed systems. It makes schema evolution impossible without coordinating all consumers, destroys bounded context integrity, and has been explicitly prohibited by AP-008.

**Option C — Domain events over an event bus** means Service A emits an immutable event describing what happened. Service B (and any other interested service) consumes that event independently. Services are decoupled in time and in design.

For an enterprise platform expected to grow from Tender Management into a multi-domain Decision Platform, Option C is the only viable architecture. The number of integrations between domains will grow with each new domain. Every synchronous coupling added today becomes a maintenance liability tomorrow.

## Decision

Domain events are the primary mechanism for cross-bounded-context integration on adtender.

Every significant state change in an Aggregate Root produces a named, immutable domain event. Interested bounded contexts consume these events independently, without the producing context knowing or caring about its consumers.

### Event Contract Standards

Every domain event must include:

```
eventId        — unique identifier for this event occurrence
eventType      — fully qualified, past-tense name (e.g., RequirementApproved)
aggregateId    — identity of the affected Aggregate Root
aggregateType  — domain type name (e.g., Requirement)
occurredAt     — timestamp of the domain state change
actorId        — identity of the user or system that triggered the change
version        — event schema version
payload        — the relevant state context for consumers
```

### Idempotency Requirement

All event consumers must be idempotent. The event bus provides at-least-once delivery; consumers are responsible for deduplication using the `eventId`.

### Outbox Pattern

Domain state changes and event publication must be atomic. The Outbox Pattern is the standard implementation: events are written to a local outbox table within the same database transaction as the state change, then published to the event bus by a relay process. This prevents the dual-write problem.

### Synchronous Integration

Synchronous API calls between bounded contexts are permitted for read operations where the calling context requires current state and an eventual consistency lag is not acceptable. They are not permitted for notifying a domain of another domain's state change.

## Options Considered

**Synchronous direct calls (rejected):** Runtime coupling. Fan-out to multiple consumers requires all consumers to be available. Adding a new consumer requires changing the producing service.

**Shared database (rejected):** Explicitly prohibited by AP-008. Destroys bounded context integrity and makes independent deployment impossible.

**Domain events (accepted):** Temporal decoupling. Producers have no knowledge of consumers. New consumers can be added without modifying the producer. Event history enables replay, debugging and event sourcing.

## Consequences

**Positive:**
- Bounded contexts can be deployed and scaled independently.
- New domains can subscribe to existing events without requiring changes to existing domains.
- The event stream is a natural, immutable audit trail of everything that happened across the platform.
- Event replay enables read model rebuilding, debugging and migration.

**Negative / Mitigations:**
- Eventual consistency: a consumer may not have processed an event when a user queries for the effect. Mitigated by designing UX around eventual consistency (optimistic updates, async confirmation) and by making consistency lag visible where it matters.
- Increased operational complexity: requires an event bus, event schema registry and consumer monitoring. This is an accepted cost for a platform designed to grow across multiple domains.
- Debugging distributed event flows is harder than debugging synchronous call chains. Mitigated by correlation IDs, distributed tracing and comprehensive event logging.

## Compliance Check

When a new integration between bounded contexts is designed, consult this ADR. If a synchronous call is proposed for state-change notification, it must be replaced with a domain event. A justification for synchronous integration must reference a specific, documented requirement for strong consistency.

## References

- [`Architecture_Principles.md — AP-004, AP-008, AP-015`](../Architecture_Principles.md)
- [`AI_MASTER_CONTEXT.md — Section 16`](../AI_MASTER_CONTEXT.md)
- [`Product_Glossary.md — Domain Event, Outbox Pattern, Idempotency`](../Product_Glossary.md)
