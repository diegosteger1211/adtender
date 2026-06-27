---
id: PKB-02F-004
title: SupplierProfile — Foundation Aggregate
version: 1.0
status: APPROVED
owner: Domain Architecture
bounded_context: Organization Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
  - Procurement Architect
depends_on:
  - PKB-00-MASTER
  - PKB-00-001
  - PKB-02-000
  - PKB-02F-003
  - PKB-02-003
tags:
  - foundation
  - aggregate
  - supplier
  - organization-management
  - ddd
---

# SupplierProfile — Foundation Aggregate

---

## Bounded Context

**Context:** Organization Management (OM)

**Role:** SupplierProfile is the persistent organizational identity of a Supplier as known to a Buyer's procurement system. It is the foundation record that enables a Supplier to be invited to Tenders and to submit responses.

**Critical distinction:**
- `SupplierProfile` (OM) — the Supplier's organizational identity, qualifications, and portal access credentials. Organizational layer.
- `SupplierResponse` (SM) — the Supplier's response to a specific Tender. Transactional layer.

These are distinct aggregates in separate bounded contexts. SupplierProfile must exist before a SupplierResponse can be created.

---

## 1. Purpose

SupplierProfile represents a Supplier company as it is known within a Buyer's organizational scope. It holds the Supplier's business identity, qualification status, contact information, certifications, and procurement categories — the persistent record that a Buyer uses to manage their Supplier base and decide which Suppliers to invite to Tenders.

SupplierProfile belongs to the **Buyer's Tenant**. It is the Buyer's representation of the Supplier, not a self-managed Supplier identity.

---

## 2. Responsibilities

- Represent the organizational identity of a Supplier within a Buyer's Tenant
- Track qualification status for Tender participation
- Hold contact information and portal access credential references
- Record certifications and their validity periods
- Define the procurement categories the Supplier is qualified for
- Provide the identity reference for Tender InvitationList entries and SupplierResponse records

---

## 3. Business Context

Before a Supplier can be invited to a Tender, their SupplierProfile must exist and be in `Qualified` status within the Buyer's Tenant.

The lifecycle of the SupplierProfile tracks the Buyer's relationship with the Supplier — from initial registration through active qualification, possible suspension, and eventual archiving if the relationship ends.

A Supplier company may have SupplierProfiles in multiple Buyer tenants. Each is an independent entry, managed by the respective Buyer. There is no cross-tenant Supplier identity synchronization.

---

## 4. Ownership

SupplierProfile is owned by the Organization Management (OM) bounded context within a specific Buyer's Tenant. The Buyer (Procurement Manager or Admin) manages SupplierProfiles for their own Supplier base.

**Organizational layer rule (GBR-005, adapted):** SupplierProfile is a tenant-level organizational asset. It has no ProjectId or TenderId as its owner. Multiple Projects and Tenders within the same Tenant may reference the same SupplierProfileId.

---

## 5. Aggregate Root

**Aggregate Root:** `SupplierProfile`

The SupplierProfile aggregate is the root for Supplier identity, qualification, and contact management within a Buyer's Tenant.

---

## 6. Entities

| Entity | Description |
|---|---|
| `SupplierContact` | A named individual contact at the Supplier (name, role, email, phone) |
| `Certification` | A documented qualification with issuing body, certificate number, and validity period |
| `SupplierCategory` | A procurement category the Supplier is qualified for (configurable; no hardcoded industry types) |
| `PortalAccessRecord` | A reference to the Supplier's portal login credentials (reference only; credentials are not stored in the domain) |

---

## 7. Value Objects

| Value Object | Description |
|---|---|
| `SupplierStatus` | Enum: `Registered`, `QualificationPending`, `Qualified`, `Suspended`, `Archived` |
| `CompanyRegistrationNumber` | Legal registration number; unique within the Supplier's registration country |
| `CountryOfRegistration` | ISO 3166-1 alpha-2 code; the country where the Supplier is legally registered |
| `CertificationValidity` | Start date + expiry date; validity must be in the future for the Certification to be considered active |
| `SupplierCategoryCode` | Configurable code from the Buyer's category taxonomy |
| `PortalAccessStatus` | Enum: `NotInvited`, `InvitationSent`, `AccessActive`, `AccessRevoked` |

---

## 8. Lifecycle

```
Registered → QualificationPending → Qualified → Suspended → Archived
                                        ↑              ↓
                                   (requalification from Suspended)
```

| State | Meaning | Can Be Invited to Tender |
|---|---|---|
| `Registered` | Basic identity created; qualification not yet started | No |
| `QualificationPending` | Qualification review underway | No |
| `Qualified` | Approved for Tender participation | Yes |
| `Suspended` | Temporarily blocked (e.g., compliance issue) | No |
| `Archived` | No longer active in the Buyer's Supplier base | No |

**Qualification rule (SPR-BR-003):** Only SupplierProfiles in `Qualified` status may be added to a Tender's InvitationList. The Tender Management Application Service enforces this check through the OM API before adding a Supplier to an InvitationList.

---

## 9. Business Rules

| ID | Rule |
|---|---|
| SPR-BR-001 | A SupplierProfile belongs to one Buyer's Tenant; it has no cross-tenant identity |
| SPR-BR-002 | A Supplier company may have independent SupplierProfiles in multiple Buyer tenants |
| SPR-BR-003 | Only `Qualified` SupplierProfiles may be added to a Tender's InvitationList |
| SPR-BR-004 | A `Suspended` SupplierProfile may not receive new Tender invitations |
| SPR-BR-005 | Portal access credentials are managed externally; SupplierProfile stores a reference only |
| SPR-BR-006 | An archived SupplierProfile retains historical data including prior SupplierResponses (referenced by ID) |
| SPR-BR-007 | Certification expiry does not automatically change SupplierStatus; it requires a Procurement Manager decision |
| SPR-BR-008 | SupplierProfile category assignments are configurable and must use Buyer-defined category taxonomy |
| SPR-BR-009 | All SupplierProfile changes are auditable (GBR-001) |
| SPR-BR-010 | A SupplierProfile cannot be deleted; only archived |

---

## 10. Relationships

| Relationship | Direction | Type | Notes |
|---|---|---|---|
| `SupplierProfile` → `Tenant` | N:1 | ID Reference | Belongs to Buyer's Tenant; GBR-021 scoped |
| `Tender.invitationList[].supplierProfileId` → `SupplierProfile` | External reference | ID Reference | TM reads qualification status via OM API before adding to InvitationList |
| `SupplierResponse.supplierId` → `SupplierProfile` | External reference | ID Reference | SM stores SupplierProfileId as the Supplier identity on each response |
| `Decision.outcome.awardedSupplierId` → `SupplierProfile` | External reference | ID Reference | DM references the awarded Supplier |
| `Decision.boardMembers[].coiDeclarations[].supplierId` → `SupplierProfile` | External reference | ID Reference | COI declarations reference specific SupplierProfileIds |

---

## 11. Commands

| Command | Preconditions | State Transition |
|---|---|---|
| `RegisterSupplier` | Procurement Manager role; LegalName and contact provided; company not already in Tenant registry | — → `Registered` |
| `StartQualification` | Procurement Manager; SupplierProfile in `Registered` state | `Registered` → `QualificationPending` |
| `QualifySupplier` | Procurement Manager; qualification review complete | `QualificationPending` → `Qualified` |
| `RejectQualification` | Procurement Manager; rejection reason provided | `QualificationPending` → `Registered` |
| `UpdateSupplierProfile` | Procurement Manager; not `Archived` | No state change |
| `AddCertification` | Procurement Manager; certification details and validity provided | No state change |
| `RevokeCertification` | Procurement Manager; revocation reason provided | No state change |
| `AssignCategory` | Procurement Manager; category code exists in Buyer's taxonomy | No state change |
| `SuspendSupplier` | Procurement Manager; reason provided | `Qualified` → `Suspended` |
| `RequalifySupplier` | Procurement Manager; suspension resolved | `Suspended` → `QualificationPending` |
| `ArchiveSupplier` | Procurement Manager; no open Tenders where Supplier has a Locked response | `Qualified` / `Suspended` → `Archived` |
| `SendPortalInvitation` | Procurement Manager; SupplierProfile is `Qualified` | No state change; `PortalAccessStatus` → `InvitationSent` |
| `RevokePortalAccess` | Procurement Manager | No state change; `PortalAccessStatus` → `AccessRevoked` |

---

## 12. Events

| Event | Trigger | Key Payload Fields |
|---|---|---|
| `SupplierRegistered` | `RegisterSupplier` | `supplierProfileId`, `tenantId`, `legalName`, `registeredAt` |
| `SupplierQualified` | `QualifySupplier` | `supplierProfileId`, `tenantId`, `qualifiedBy`, `qualifiedAt` |
| `SupplierSuspended` | `SuspendSupplier` | `supplierProfileId`, `tenantId`, `reason`, `suspendedAt` |
| `SupplierArchived` | `ArchiveSupplier` | `supplierProfileId`, `tenantId`, `archivedAt` |
| `SupplierCertificationAdded` | `AddCertification` | `supplierProfileId`, `certificationId`, `expiresAt` |
| `SupplierCertificationRevoked` | `RevokeCertification` | `supplierProfileId`, `certificationId`, `reason`, `revokedAt` |
| `SupplierPortalInvitationSent` | `SendPortalInvitation` | `supplierProfileId`, `tenantId`, `portalEmail`, `sentAt` |
| `SupplierPortalAccessRevoked` | `RevokePortalAccess` | `supplierProfileId`, `tenantId`, `revokedAt` |

---

## Permissions

| Action | Required Role | Condition |
|---|---|---|
| Register Supplier | Procurement Manager, Organization Admin | Within own Tenant |
| View SupplierProfile | Procurement Manager, Project Manager, Evaluator | Own Tenant; GBR-021 |
| Update SupplierProfile | Procurement Manager | Own Tenant |
| Start / Complete Qualification | Procurement Manager | — |
| Add / Revoke Certification | Procurement Manager | — |
| Assign Category | Procurement Manager | — |
| Suspend Supplier | Procurement Manager, Organization Admin | — |
| Archive Supplier | Procurement Manager, Organization Admin | No open Tender responses |
| Send / Revoke Portal Invitation | Procurement Manager | SupplierProfile `Qualified` |

---

## 13. Multi-Tenant Considerations

- SupplierProfile belongs to a Buyer's Tenant (SPR-BR-001). A Supplier company (in the real world) may have independent profiles in multiple Buyer tenants — each managed by the respective Buyer, each isolated by TenantId.
- There is no cross-tenant Supplier identity synchronization. Two Buyers managing the same Supplier company have separate, unlinked SupplierProfile records.
- This is an intentional trade-off: it preserves Tenant isolation (GBR-021) and Buyer autonomy. Future platform evolution could introduce an optional Supplier self-registration portal that feeds into Buyer-specific Supplier Profiles.
- Portal credentials are external to the domain model. The SupplierProfile stores a `PortalAccessRecord` reference only. Actual authentication is handled by an external identity provider.

---

## 14. Versioning

SupplierProfile is not versioned with explicit version snapshots in the same way as Requirement or KnowledgeAsset. Profile changes are auditable through the event log.

**Exception for references:** SupplierResponse and Decision reference SupplierProfile by `supplierProfileId`. If a Supplier is archived after a Decision is made, the Decision's reference remains valid and resolvable for audit purposes (SPR-BR-006, USR-BR-003 pattern).

---

## 15. API Considerations

| Endpoint | Method | Description |
|---|---|---|
| `/suppliers` | GET | List SupplierProfiles for the Tenant |
| `/suppliers` | POST | Register a new Supplier |
| `/suppliers/{id}` | GET | Get SupplierProfile detail |
| `/suppliers/{id}` | PATCH | Update SupplierProfile |
| `/suppliers/{id}/qualify` | POST | Complete qualification |
| `/suppliers/{id}/suspend` | POST | Suspend Supplier |
| `/suppliers/{id}/archive` | POST | Archive Supplier |
| `/suppliers/{id}/certifications` | GET | List certifications |
| `/suppliers/{id}/certifications` | POST | Add certification |
| `/suppliers/{id}/portal-access` | POST | Send portal invitation |
| `/suppliers/{id}/portal-access` | DELETE | Revoke portal access |

All endpoints enforce TenantId scoping. A Buyer's Procurement Manager cannot access SupplierProfiles from another Tenant.

---

## 16. AI Guidance

**AI may:**
- Detect certifications nearing expiry and surface them for Procurement Manager review
- Suggest category assignments based on Supplier description
- Identify SupplierProfiles that are frequently invited but consistently do not respond
- Recommend qualification review for Suppliers with a long period of inactivity

**AI must not:**
- Qualify or disqualify Suppliers without human confirmation (ADR-005)
- Suspend or archive SupplierProfiles
- Send portal invitations autonomously
- Access SupplierProfile data across Tenant boundaries

---

## 17. Machine Context

```yaml
domain: Organization Management
aggregate_root: SupplierProfile
bounded_context: OM
layer: Foundation
versioned: false
auditable: true

lifecycle_states:
  - Registered
  - QualificationPending
  - Qualified
  - Suspended
  - Archived

critical_invariants:
  - Only Qualified SupplierProfiles may be in a Tender InvitationList (SPR-BR-003)
  - SupplierProfile belongs to Buyer's Tenant; no cross-tenant identity (SPR-BR-001)
  - Portal credentials stored by reference only; not in domain (SPR-BR-005)
  - Archived SupplierProfiles remain resolvable for audit (SPR-BR-006)

referenced_by:
  - Tender.invitationList[].supplierProfileId (TM)
  - SupplierResponse.supplierId (SM)
  - Decision.outcome.awardedSupplierId (DM)
  - Decision.boardMembers[].coiDeclarations[].supplierId (DM)

commands:
  - RegisterSupplier
  - StartQualification
  - QualifySupplier
  - RejectQualification
  - UpdateSupplierProfile
  - AddCertification
  - RevokeCertification
  - SuspendSupplier
  - RequalifySupplier
  - ArchiveSupplier
  - SendPortalInvitation
  - RevokePortalAccess

events_produced:
  - SupplierRegistered
  - SupplierQualified
  - SupplierSuspended
  - SupplierArchived
  - SupplierCertificationAdded
  - SupplierCertificationRevoked
  - SupplierPortalInvitationSent
  - SupplierPortalAccessRevoked

never:
  - delete_supplier_profile
  - store_portal_credentials_in_domain
  - allow_unqualified_supplier_in_invitation_list
  - allow_cross_tenant_supplier_access
  - ai_auto_qualify_or_suspend
```
