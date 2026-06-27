---
id: PKB-02F-003
title: Tenant — Foundation Aggregate
version: 1.0
status: APPROVED
owner: Domain Architecture
bounded_context: Organization Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Security Architect
depends_on:
  - PKB-00-MASTER
  - PKB-00-001
  - PKB-02-000
  - PKB-02F-002
tags:
  - foundation
  - aggregate
  - tenant
  - multi-tenant
  - organization-management
  - ddd
---

# Tenant — Foundation Aggregate

---

## Bounded Context

**Context:** Organization Management (OM)

**Role:** Tenant is the technical data isolation boundary of the platform. Every piece of data on adtender — every Project, Requirement, Tender, Evaluation, Decision, KnowledgeAsset — belongs to exactly one Tenant. TenantId is the root scoping criterion for every query in every bounded context.

**Layer:** Infrastructure — Tenant is the deepest foundation. It is created before any business data can be written and must be resolved before any business query is executed.

---

## 1. Purpose

Tenant enforces data isolation between Organizations on the platform. It is the technical implementation of the business principle that no Organization should have access to another Organization's data.

Tenant is not a domain concept in the business sense — Organizations and Users think in terms of their "workspace" or "environment," not tenants. Tenant is an architectural construct that makes multi-tenancy safe and enforceable.

---

## 2. Responsibilities

- Define the data isolation boundary for an Organization (GBR-021)
- Carry the `TenantId` that is attached to every Business Object on creation
- Provide the scoping root for all data queries across all bounded contexts
- Hold tenant-level technical configuration (storage region, data residency, feature flags)
- Gate activation and deactivation of all data access for the associated Organization

---

## 3. Business Context

Tenant is created automatically when an Organization is registered. It is not separately managed by business users. Its lifecycle is driven entirely by the lifecycle of its Organization.

From a business user's perspective, the Tenant is invisible. From an implementation perspective, TenantId is present on every aggregate, every query, and every domain event.

---

## 4. Ownership

Tenant is owned by the Organization Management (OM) bounded context. It is provisioned by the platform infrastructure layer when an Organization is registered. It is the only aggregate whose creation is triggered by another aggregate's command (Organization → Tenant).

---

## 5. Aggregate Root

**Aggregate Root:** `Tenant`

The Tenant aggregate is the root for technical isolation configuration. It has minimal business content. Its primary value is its existence and its `TenantId`, which flows to all other aggregates.

---

## 6. Entities

| Entity | Description |
|---|---|
| `TenantConfiguration` | Technical settings: data residency region, storage quota, feature flags, API rate limits |

---

## 7. Value Objects

| Value Object | Description |
|---|---|
| `TenantId` | Globally unique, immutable identifier; present on every Business Object |
| `TenantStatus` | Enum: `Provisioning`, `Active`, `Suspended`, `Archived` |
| `DataResidencyRegion` | The geographic data storage region (e.g., `EU`, `US`, `APAC`) |
| `StorageQuota` | Maximum allowed data volume for the Tenant |

---

## 8. Lifecycle

```
Provisioning → Active → Suspended → Archived
```

Tenant lifecycle is driven by Organization lifecycle:

| Organization State | Tenant State | Effect |
|---|---|---|
| `Registering` | `Provisioning` | TenantId allocated; no data yet writable |
| `Active` | `Active` | All data reads and writes permitted |
| `Suspended` | `Suspended` | All User logins blocked; no writes; data preserved |
| `Archived` | `Archived` | Read-only access for compliance; no writes |

**Immutability rule (TNT-BR-002):** TenantId is immutable once assigned. It cannot be changed, merged with another TenantId, or transferred to a different Organization.

---

## 9. Business Rules

| ID | Rule |
|---|---|
| TNT-BR-001 | Every Business Object must carry a TenantId at creation |
| TNT-BR-002 | TenantId is immutable once set on any aggregate |
| TNT-BR-003 | No query may return data from a different TenantId without explicit cross-tenant authorization (GBR-021) |
| TNT-BR-004 | A Tenant cannot be deleted; only archived |
| TNT-BR-005 | Tenant provisioning is automatically triggered by Organization creation (ORG-BR-006) |
| TNT-BR-006 | Tenant suspension cascades from Organization suspension |
| TNT-BR-007 | Tenant archiving cascades from Organization archiving |
| TNT-BR-008 | An Archived Tenant's data must remain readable for compliance purposes |
| TNT-BR-009 | TenantId must be validated on every inbound API request |
| TNT-BR-010 | Cross-tenant reads require explicit Platform Operator authorization and must be logged |

---

## 10. Relationships

| Relationship | Direction | Type | Notes |
|---|---|---|---|
| `Tenant` → `Organization` | 1:1 | ID Reference | Tenant is provisioned for and owned by one Organization |
| All Business Objects → `Tenant` | N:1 | TenantId present | Every aggregate in every context carries TenantId at creation |

**Cross-context rule:** TenantId is not a reference in the domain model sense — it is a mandatory field on every aggregate in every bounded context. It is enforced at the infrastructure layer, not the domain layer. The domain layer passes TenantId through; the infrastructure layer enforces isolation.

---

## 11. Commands

| Command | Preconditions | State Transition |
|---|---|---|
| `ProvisionTenant` | Called by `RegisterOrganization`; TenantId not yet allocated | — → `Provisioning` |
| `ActivateTenant` | Called by `CompleteOnboarding`; Organization is activating | `Provisioning` → `Active` |
| `SuspendTenant` | Called by `SuspendOrganization`; Tenant is `Active` | `Active` → `Suspended` |
| `ReactivateTenant` | Called by `ReactivateOrganization`; Tenant is `Suspended` | `Suspended` → `Active` |
| `ArchiveTenant` | Called by `ArchiveOrganization`; Tenant is `Active` or `Suspended` | `Active` / `Suspended` → `Archived` |
| `UpdateTenantConfiguration` | Platform Operator; Tenant is `Active` | No state change |

**Note:** Tenant commands are not exposed to business users. They are internal commands triggered by Organization lifecycle events. Organization Admins interact with Organization commands; Tenant commands are infrastructure-level.

---

## 12. Events

| Event | Trigger | Key Payload Fields |
|---|---|---|
| `TenantProvisioned` | `ProvisionTenant` | `tenantId`, `organizationId`, `dataResidencyRegion`, `provisionedAt` |
| `TenantActivated` | `ActivateTenant` | `tenantId`, `organizationId`, `activatedAt` |
| `TenantSuspended` | `SuspendTenant` | `tenantId`, `organizationId`, `suspendedAt` |
| `TenantReactivated` | `ReactivateTenant` | `tenantId`, `organizationId`, `reactivatedAt` |
| `TenantArchived` | `ArchiveTenant` | `tenantId`, `organizationId`, `archivedAt` |

---

## Permissions

Tenant management is a Platform Operator capability. Business users do not directly interact with Tenant commands or events.

| Action | Required Role |
|---|---|
| Provision Tenant | Platform Operator (system-triggered) |
| Activate Tenant | Platform Operator (system-triggered) |
| Suspend Tenant | Platform Operator |
| Archive Tenant | Platform Operator |
| View Tenant configuration | Platform Operator, Organization Admin (own Tenant only) |
| Update Tenant configuration | Platform Operator |

---

## 13. Multi-Tenant Considerations

Tenant is the mechanism through which multi-tenancy is implemented. The following rules apply to every bounded context:

**At data write:**
- Every aggregate created must have TenantId set at creation time
- TenantId is sourced from the authenticated User's Tenant (resolved via OM)
- TenantId may not be overridden by any user input

**At data read:**
- Every repository query must include a TenantId filter
- Repository implementations must reject queries that lack a TenantId
- Cross-tenant joins are prohibited at the data layer

**At API boundary:**
- Every inbound API request must carry a resolved TenantId (from authentication token)
- TenantId must be validated before any query is executed (TNT-BR-009)

**Cross-tenant exception:**
- Platform Operators may perform cross-tenant reads for administrative purposes
- All cross-tenant reads must be explicitly authorized and logged (TNT-BR-010)

---

## 14. Versioning

Tenant is not versioned. TenantId is immutable (TNT-BR-002). Configuration changes are tracked through the event log and TenantConfiguration audit history, not through version snapshots.

---

## 15. API Considerations

Tenant does not have a direct business-facing API. It is accessed indirectly through Organization and User management:

| Endpoint | Method | Description |
|---|---|---|
| `/admin/tenants/{id}` | GET | Platform Operator: view Tenant configuration |
| `/admin/tenants/{id}/configuration` | PATCH | Platform Operator: update Tenant configuration |

The `TenantId` is resolved from the authentication token on every request. It is not a URL parameter for business endpoints.

---

## 16. AI Guidance

**AI must not:**
- Provision, suspend, or archive Tenants
- Access or suggest cross-tenant data reads
- Bypass TenantId scoping in any query or suggestion
- Generate any output that could expose cross-tenant data

**AI may:**
- Identify Tenant configuration settings that may affect platform behavior (e.g., missing feature flag)

---

## 17. Machine Context

```yaml
domain: Organization Management
aggregate_root: Tenant
bounded_context: OM
layer: Foundation
versioned: false
auditable: true

lifecycle_states:
  - Provisioning
  - Active
  - Suspended
  - Archived

critical_invariants:
  - TenantId is immutable once set (TNT-BR-002)
  - TenantId must be present on every Business Object (TNT-BR-001)
  - No cross-tenant query without explicit Platform Operator authorization (TNT-BR-003, GBR-021)

enforcement_layer: infrastructure
tenant_id_presence: mandatory on all aggregates in all contexts

commands:
  - ProvisionTenant
  - ActivateTenant
  - SuspendTenant
  - ReactivateTenant
  - ArchiveTenant
  - UpdateTenantConfiguration

events_produced:
  - TenantProvisioned
  - TenantActivated
  - TenantSuspended
  - TenantReactivated
  - TenantArchived

never:
  - delete_tenant
  - reassign_tenant_id
  - allow_cross_tenant_query_without_authorization
  - allow_business_user_to_manage_tenant_directly
  - allow_ai_to_access_cross_tenant_data
```
