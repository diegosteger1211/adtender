---
id: ADR-004
title: API First
status: ACCEPTED
date: 2025-01-01
deciders:
  - Software Architecture
  - Product Architecture
---

# ADR-004 API First

## Context

adtender must be accessible to multiple types of consumers: the primary web UI, future mobile or embedded interfaces, external enterprise system integrations (ERP, DMS, CRM), AI agents and automated workflows. If the platform's capabilities are implemented primarily as UI behaviors rather than as explicit API operations, only the UI can access them.

Additionally, the discipline of defining an API contract before implementing UI has a clarifying effect on domain model quality: it is impossible to define a well-structured API for a concept that has not been clearly modeled. API design pressure reveals gaps and ambiguities in the domain model while they are still cheap to fix.

## Decision

Every business capability on adtender must be fully expressible through a versioned, stable API before any UI is built on top of it.

The API is the authoritative expression of the platform's capabilities. The UI is one consumer. External systems and AI agents are equal consumers.

### Versioning Standard

- API versions are encoded in the URL path: `/api/v1/requirements`
- Minor additions (new optional response fields, new optional query parameters, new endpoints) are non-breaking and do not require a version increment.
- Removing fields, changing field semantics, removing endpoints, or changing response structure are breaking changes and require a new major version.
- Deprecated endpoints must carry a `Deprecation` response header and remain available for a minimum of two major release cycles.

### API Design Standards

- Resources represent Business Objects, not operations: `/requirements`, not `/getRequirements`.
- Resource names use lowercase kebab-case in plural.
- HTTP verbs carry standard REST semantics: `GET` (read), `POST` (create), `PATCH` (partial update), `PUT` (full replace), `DELETE` (remove where permitted).
- Non-CRUD domain operations use action suffixes on the resource: `POST /requirements/{id}/approve`.
- Error responses use domain-meaningful error codes, not generic HTTP descriptions.
- All list endpoints support pagination, filtering and sorting.

### API-Domain Alignment

API resources map to Aggregate Roots. API operations map to Commands. An API operation that does not correspond to a defined Command is a design signal that either the command is missing from the domain model or the API is bypassing the domain.

## Options Considered

**UI First (rejected):** Build the UI workflow first; extract the API from it. Common in rapid prototyping but produces APIs that reflect UI structure rather than domain semantics. Creates a second domain model in the UI layer.

**API as Implementation Detail (rejected):** Build the service internally; expose API endpoints as needed. Leads to API design being driven by implementation convenience rather than consumer needs.

**API First (accepted):** Define the API contract before UI implementation. Forces domain clarity, guarantees multi-consumer support, and produces a stable integration contract from day one.

## Consequences

**Positive:**
- All platform capabilities are accessible to all consumer types from the first release.
- External integrations, AI agents and automated processes are first-class platform citizens.
- API design pressure improves domain model quality during the design phase.
- API stability enables independent evolution of the UI without breaking external consumers.

**Negative / Mitigations:**
- API design requires upfront effort before visible UI progress. Mitigated by treating the API contract definition as part of the feature specification phase, not as an additional step.
- API versioning management adds operational complexity. Mitigated by disciplined version governance and automated deprecation warnings.

## Compliance Check

When a new feature is specified, the API contract must be defined as part of the specification. UI implementation must not begin until the API contract is reviewed and approved. If a capability exists only as a UI behavior with no API equivalent, it does not comply with this decision.

## References

- [`Architecture_Principles.md — AP-003`](../Architecture_Principles.md#ap-003-api-first)
- [`AI_MASTER_CONTEXT.md — Section 15`](../AI_MASTER_CONTEXT.md)
- [`Product_Principles.md — P-009`](../Product_Principles.md#p-009-platform-thinking)
