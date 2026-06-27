---
id: PKB-02F-002
title: Organization — Foundation Aggregate
version: 1.0
status: APPROVED
owner: Domain Architecture
bounded_context: Organization Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
depends_on:
  - PKB-00-MASTER
  - PKB-00-001
  - PKB-02-000
  - PKB-02F-003
tags:
  - foundation
  - aggregate
  - organization
  - organization-management
  - multi-tenant
  - ddd
---

# Organization — Foundation Aggregate

---

## Bounded Context

**Context:** Organization Management (OM)

**Role:** Organization is the top-level business entity on the platform. It represents a company, institution, or organizational unit that uses adtender as its procurement and knowledge platform. Every Tenant, User, Project, and Knowledge Asset exists within the scope of an Organization.

**Layer:** Infrastructure — Organization is a shared foundation aggregate. All other bounded contexts depend on it for organizational context and Tenant scoping.

---

## 1. Purpose

Organization represents the legal or administrative entity that subscribes to and uses the adtender platform. It is the business-level owner of all procurement activity conducted on the platform within its Tenant scope.

The Organization aggregate provides:
- The registration identity of the entity using the platform
- The link between business identity and the technical Tenant isolation boundary
- Organizational structure (departments, teams) for grouping Users and Projects
- Platform-level settings and governance defaults

---

## 2. Responsibilities

- Register and identify the organizational entity on the platform
- Provision and own the associated Tenant data scope (1:1 relationship)
- Maintain the organizational hierarchy (departments, teams)
- Hold platform subscription state and feature entitlements
- Store default governance settings (approval workflows, thresholds)
- Be the parent context for all Users, Projects, and Knowledge Assets in the Tenant

---

## 3. Business Context

An Organization is the unit that signs up for adtender. Every object created on the platform — Projects, Requirements, Tenders, Knowledge Assets — ultimately belongs to an Organization's Tenant scope.

The Organization itself does not run Projects or manage Requirements. Those are activities performed by Users within the Organization's Tenant. The Organization provides the context and governance boundaries within which those activities occur.

---

## 4. Ownership

Organization is owned by the Organization Management (OM) bounded context. It is a Platform-layer aggregate: Organizations are administered by platform operators (onboarding) and by Organization Administrators (ongoing management).

**Organizational data does not belong to any Project or Tender.** It belongs to the Organization itself, which persists beyond any individual initiative.

---

## 5. Aggregate Root

**Aggregate Root:** `Organization`

The Organization aggregate is the root for organizational identity, structure, and platform subscription state.

---

## 6. Entities

| Entity | Description |
|---|---|
| `Department` | An organizational sub-unit within the Organization, used for grouping Users and Projects |
| `OrganizationSettings` | Platform-level configurable defaults for this Organization (default approval workflows, languages, branding, Requirement categories, etc.) |

---

## 7. Value Objects

| Value Object | Description |
|---|---|
| `LegalName` | The registered legal name of the Organization |
| `OrganizationCode` | A short, unique platform-wide identifier (e.g., `ACME-CORP`) |
| `OrganizationStatus` | Enum: `Registering`, `Active`, `Suspended`, `Archived` |
| `CountryCode` | ISO 3166-1 alpha-2 country code (primary registration country) |
| `IndustryType` | Configurable industry classification; no hardcoded types (consistent with platform neutrality) |
| `SubscriptionTier` | The active subscription plan; governs feature entitlements |

---

## 8. Lifecycle

```
Registering → Active → Suspended → Archived
```

| State | Meaning | Data Accessible |
|---|---|---|
| `Registering` | Onboarding in progress; Tenant provisioning underway | Limited (admin setup only) |
| `Active` | Fully operational | Yes |
| `Suspended` | Blocked by platform operator (e.g., payment failure) | No user logins; data preserved |
| `Archived` | Organization no longer active; subscription ended | Read-only; compliance access only |

**Archiving rule (ORG-BR-003):** An archived Organization's data remains accessible for audit and compliance purposes. The associated Tenant is also archived. No new data may be written to an archived Organization's scope.

---

## 9. Business Rules

| ID | Rule |
|---|---|
| ORG-BR-001 | Every Organization has exactly one Tenant (1:1 relationship) |
| ORG-BR-002 | OrganizationCode must be unique across the entire platform |
| ORG-BR-003 | An archived Organization's data must remain accessible for audit and compliance |
| ORG-BR-004 | Suspending an Organization blocks all User logins for that Tenant but preserves all data |
| ORG-BR-005 | Organization type and industry must be configurable; no industry-specific types may be hardcoded |
| ORG-BR-006 | Creating an Organization automatically provisions its Tenant |
| ORG-BR-007 | An Organization cannot be deleted; only archived |
| ORG-BR-008 | Organization settings changes are auditable (GBR-001) |
| ORG-BR-009 | OrganizationCode is immutable once set |

---

## 10. Relationships

| Relationship | Direction | Type | Cardinality | Notes |
|---|---|---|---|---|
| `Organization` → `Tenant` | 1:1 | ID Reference + Lifecycle Gate | Each Organization provisions one Tenant | ORG-BR-001; Tenant is created when Organization is created |
| `Organization` → `User` | 1:N | ID Reference (via User.organizationId) | One Organization has many Users | Navigated via OM API |
| `Project.organizationId` → `Organization` | External reference | ID Reference | Each Project belongs to one Organization | Project Management context |
| `Requirement.tenantId` → `Organization.tenantId` | External reference | Tenant-scoped | All Requirements in a Tenant belong to its Organization | Enforced at data layer |
| `KnowledgeAsset.tenantId` → `Organization.tenantId` | External reference | Tenant-scoped | KnowledgeAssets are organizational assets | GBR-005 |

---

## 11. Commands

| Command | Preconditions | State Transition |
|---|---|---|
| `RegisterOrganization` | OrganizationCode unique; LegalName provided; Platform Operator role | — → `Registering` |
| `CompleteOnboarding` | Tenant provisioned; at least one Admin User created | `Registering` → `Active` |
| `UpdateOrganizationProfile` | Organization is `Active`; Organization Admin role | No state change |
| `UpdateOrganizationSettings` | Organization is `Active`; Organization Admin role | No state change |
| `SuspendOrganization` | Platform Operator role; organization is `Active` | `Active` → `Suspended` |
| `ReactivateOrganization` | Platform Operator role; organization is `Suspended` | `Suspended` → `Active` |
| `ArchiveOrganization` | Platform Operator role; no open Projects in non-Archived state | `Active` or `Suspended` → `Archived` |

---

## 12. Events

| Event | Trigger | Key Payload Fields |
|---|---|---|
| `OrganizationRegistered` | `RegisterOrganization` | `organizationId`, `tenantId`, `organizationCode`, `registeredAt` |
| `OrganizationActivated` | `CompleteOnboarding` | `organizationId`, `tenantId`, `activatedAt` |
| `OrganizationSettingsUpdated` | `UpdateOrganizationSettings` | `organizationId`, `changedSettings`, `updatedAt` |
| `OrganizationSuspended` | `SuspendOrganization` | `organizationId`, `tenantId`, `reason`, `suspendedAt` |
| `OrganizationReactivated` | `ReactivateOrganization` | `organizationId`, `tenantId`, `reactivatedAt` |
| `OrganizationArchived` | `ArchiveOrganization` | `organizationId`, `tenantId`, `archivedAt` |

---

## Permissions

| Action | Required Role | Condition |
|---|---|---|
| Register Organization | Platform Operator | Platform-level access |
| View Organization profile | Organization Admin, Platform Operator | Own Organization or platform access |
| Update Organization profile | Organization Admin | Own Organization |
| Update Organization settings | Organization Admin | Own Organization |
| Suspend Organization | Platform Operator | — |
| Reactivate Organization | Platform Operator | — |
| Archive Organization | Platform Operator | No open Projects |
| View all Organizations | Platform Operator | Platform-level only |

---

## 13. Multi-Tenant Considerations

- Organization and Tenant are in a strict 1:1 relationship. One Organization cannot span multiple Tenants. One Tenant cannot be shared by multiple Organizations.
- The Organization aggregate is the business concept; the Tenant aggregate is the technical data isolation boundary. They are created together and archived together.
- Organization data (name, settings) is accessible only within its own Tenant context. Platform Operators have cross-tenant administrative access for operational purposes, but this is a platform-level capability, not a domain feature.
- Organization archiving cascades to Tenant archiving.

---

## 14. Versioning

The Organization aggregate is not versioned in the business sense. Settings changes are auditable through the event log. OrganizationCode is immutable (ORG-BR-009). LegalName changes are audited but do not create version snapshots.

---

## 15. API Considerations

| Endpoint | Method | Description |
|---|---|---|
| `/organizations/{id}` | GET | Get Organization profile |
| `/organizations/{id}` | PATCH | Update Organization profile |
| `/organizations/{id}/settings` | GET | Get Organization settings |
| `/organizations/{id}/settings` | PATCH | Update Organization settings |
| `/organizations/{id}/departments` | GET | List departments |
| `/organizations/{id}/departments` | POST | Create department |

Platform-level endpoints (operator access only):

| Endpoint | Method | Description |
|---|---|---|
| `/admin/organizations` | GET | List all Organizations |
| `/admin/organizations` | POST | Register new Organization |
| `/admin/organizations/{id}/suspend` | POST | Suspend |
| `/admin/organizations/{id}/reactivate` | POST | Reactivate |
| `/admin/organizations/{id}/archive` | POST | Archive |

---

## 16. AI Guidance

**AI may:**
- Surface Organization settings inconsistencies (e.g., missing default approval workflow)
- Recommend Organization settings based on similar-sized organizations

**AI must not:**
- Suspend, archive, or modify Organization settings without human confirmation (ADR-005)
- Provision or deprovision Tenants
- Make decisions about organizational structure

---

## 17. Machine Context

```yaml
domain: Organization Management
aggregate_root: Organization
bounded_context: OM
layer: Foundation
versioned: false
auditable: true

lifecycle_states:
  - Registering
  - Active
  - Suspended
  - Archived

critical_invariants:
  - Organization and Tenant are 1:1 (ORG-BR-001)
  - OrganizationCode is unique platform-wide and immutable (ORG-BR-002, ORG-BR-009)
  - Archived Organizations data is read-only but accessible (ORG-BR-003)

provisioning_relationship:
  creates: Tenant (on RegisterOrganization)
  cascades: Tenant archiving on OrganizationArchived

commands:
  - RegisterOrganization
  - CompleteOnboarding
  - UpdateOrganizationProfile
  - UpdateOrganizationSettings
  - SuspendOrganization
  - ReactivateOrganization
  - ArchiveOrganization

events_produced:
  - OrganizationRegistered
  - OrganizationActivated
  - OrganizationSettingsUpdated
  - OrganizationSuspended
  - OrganizationReactivated
  - OrganizationArchived

never:
  - delete_organization
  - allow_multiple_tenants_per_organization
  - allow_multiple_organizations_per_tenant
  - ai_auto_suspend_or_archive
```
