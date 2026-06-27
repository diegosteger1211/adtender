---
id: PKB-02F-001
title: User — Foundation Aggregate
version: 1.0
status: APPROVED
owner: Domain Architecture
bounded_context: Organization Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
  - Security Architect
depends_on:
  - PKB-00-MASTER
  - PKB-00-001
  - PKB-02-000
  - PKB-02F-003
tags:
  - foundation
  - aggregate
  - identity
  - organization-management
  - ddd
---

# User — Foundation Aggregate

---

## Bounded Context

**Context:** Organization Management (OM)

**Role:** User is the identity anchor for the entire platform. Every auditable action, every role assignment, every approval, and every command is attributed to a UserId. No business process can be executed without a resolved, authenticated User identity.

**Layer:** Infrastructure — User is a shared foundation aggregate. All other bounded contexts depend on UserId for authorization, attribution, and audit.

---

## 1. Purpose

User represents an authenticated individual who interacts with the adtender platform. It is the identity record that the platform uses for authorization, role resolution, audit attribution, and notification targeting.

User does not own business content. It is the actor who creates, approves, scores, or decides on Business Objects — but those objects belong to their respective bounded contexts.

---

## 2. Responsibilities

- Represent the identity of an individual on the platform
- Hold assigned roles and their organizational scope
- Provide the attribution target for all domain events and audit records (GBR-001)
- Hold notification preferences
- Enforce login status (active, suspended, deactivated)
- Be the reference target for Project Owner, Evaluator, Decision Board member, Requirement Author, and similar role designations across all bounded contexts

---

## 3. Business Context

Every significant action in adtender requires an identified User:

| Action | User Role |
|---|---|
| Create a Project | Project Owner |
| Approve a Requirement | Library Manager / Reviewer |
| Assign Evaluators | Procurement Manager |
| Score a Supplier | Evaluator |
| Convene a Decision Board | Decision Board Chair |
| Approve a KnowledgeAsset | Domain Expert |
| Submit Lessons Learned | Project Manager |

Without a resolved UserId, none of these actions can be attributed or audited.

---

## 4. Ownership

User is owned by the Organization Management (OM) bounded context. All other contexts store only the `UserId` as a reference. They do not embed User profile data. Display name, email, and role labels are resolved at read time through the OM API.

**Cross-context rule:** No aggregate outside OM may store User profile data (name, email, role label). They store only `UserId`. Profile display is resolved on demand.

---

## 5. Aggregate Root

**Aggregate Root:** `User`

The User aggregate is the root for all identity-related state. Roles, preferences, and access state are all governed through the User aggregate root.

---

## 6. Entities

| Entity | Description |
|---|---|
| `UserRole` | An assigned role with a defined scope (platform-wide, organization, project, tender) |
| `NotificationPreference` | Per-event-type settings for delivery channel (email, in-app, none) |

---

## 7. Value Objects

| Value Object | Description |
|---|---|
| `EmailAddress` | Validated email; unique within a Tenant (USR-BR-004) |
| `DisplayName` | First name + last name combination; not unique |
| `UserStatus` | Enum: `Invited`, `Active`, `Suspended`, `Deactivated` |
| `LocalePreference` | Language and date format preference; defaults to Organization default |
| `RoleScope` | Scope of a role assignment: `Platform`, `Organization`, `Project`, `Tender` |

---

## 8. Lifecycle

```
Invited → Active → Suspended → Deactivated
                       ↕
                  (reactivatable from Suspended)
```

| State | Meaning | Can Perform Actions |
|---|---|---|
| `Invited` | User invited by Admin; not yet accepted | No |
| `Active` | Invitation accepted; fully operational | Yes |
| `Suspended` | Temporarily blocked by Admin | No |
| `Deactivated` | Permanently removed from active use; identity preserved | No |

**Deactivation rule (USR-BR-003):** A deactivated User's identity and associated audit records are preserved indefinitely. The UserId remains valid for historical attribution. Deactivation is not deletion.

---

## 9. Business Rules

| ID | Rule |
|---|---|
| USR-BR-001 | Every User belongs to exactly one Tenant |
| USR-BR-002 | A User must have at least one active Role |
| USR-BR-003 | A deactivated User's identity is preserved for audit purposes; the UserId must remain resolvable |
| USR-BR-004 | Email addresses must be unique within a Tenant |
| USR-BR-005 | All role changes are auditable (GBR-001) |
| USR-BR-006 | A suspended or deactivated User cannot perform any platform action |
| USR-BR-007 | AI must not change User roles or permissions autonomously (ADR-005) |
| USR-BR-008 | An Admin cannot deactivate themselves |
| USR-BR-009 | Invitation links expire after a configurable duration |
| USR-BR-010 | A User may hold multiple roles simultaneously, in different scopes |

---

## 10. Relationships

| Relationship | Direction | Type | Notes |
|---|---|---|---|
| `User` → `Tenant` | N:1 | ID Reference | User belongs to one Tenant; enforced at creation |
| `User` → `Organization` | N:1 | ID Reference | User belongs to one Organization |
| `Project.ownerId` → `User` | ID Reference (external) | Project Owner is a UserId in PM context |
| `Project.members[].userId` → `User` | ID Reference (external) | Project members are UserIds in PM context |
| `Evaluation.evaluatorId` → `User` | ID Reference (external) | Evaluator is a UserId in EM context |
| `Decision.boardMembers[].userId` → `User` | ID Reference (external) | Board members are UserIds in DM context |
| `Requirement.authorId` → `User` | ID Reference (external) | Requirement author is a UserId in RM context |
| `KnowledgeAsset.authorId` → `User` | ID Reference (external) | KnowledgeAsset author is a UserId in KM context |

---

## 11. Commands

| Command | Preconditions | State Transition |
|---|---|---|
| `InviteUser` | Admin role; email not already used in Tenant; valid Tenant | — → `Invited` |
| `AcceptInvitation` | Invitation token valid and not expired | `Invited` → `Active` |
| `UpdateUserProfile` | User is `Active`; acting user is self or Admin | No state change |
| `AssignRole` | Admin role; target User is `Active`; role type valid | No state change |
| `RevokeRole` | Admin role; User retains at least one role after revocation (USR-BR-002) | No state change |
| `SuspendUser` | Admin role; target User is `Active`; actor ≠ target (USR-BR-008) | `Active` → `Suspended` |
| `ReactivateUser` | Admin role; target User is `Suspended` | `Suspended` → `Active` |
| `DeactivateUser` | Admin role; actor ≠ target (USR-BR-008); no open active approvals | `Active` or `Suspended` → `Deactivated` |

---

## 12. Events

| Event | Trigger | Key Payload Fields |
|---|---|---|
| `UserInvited` | `InviteUser` | `userId`, `tenantId`, `email`, `invitedAt` |
| `UserActivated` | `AcceptInvitation` | `userId`, `tenantId`, `activatedAt` |
| `UserRoleAssigned` | `AssignRole` | `userId`, `roleType`, `scope`, `assignedBy`, `assignedAt` |
| `UserRoleRevoked` | `RevokeRole` | `userId`, `roleType`, `scope`, `revokedBy`, `revokedAt` |
| `UserSuspended` | `SuspendUser` | `userId`, `suspendedBy`, `reason`, `suspendedAt` |
| `UserReactivated` | `ReactivateUser` | `userId`, `reactivatedBy`, `reactivatedAt` |
| `UserDeactivated` | `DeactivateUser` | `userId`, `deactivatedBy`, `deactivatedAt` |

---

## Permissions

| Action | Required Role | Condition |
|---|---|---|
| Invite User | Organization Admin | Within own Tenant |
| View User profile | Any authenticated User | Own profile, or Admin |
| Update own profile | Active User | Own profile only |
| Assign Role | Organization Admin | Within own Tenant; role must be valid |
| Revoke Role | Organization Admin | User retains at least one role |
| Suspend User | Organization Admin | Cannot suspend self |
| Reactivate User | Organization Admin | — |
| Deactivate User | Organization Admin | Cannot deactivate self |
| View all Users (tenant) | Organization Admin | Own Tenant only (GBR-021) |

---

## 13. Multi-Tenant Considerations

- A User belongs to exactly one Tenant (USR-BR-001). There are no cross-tenant Users.
- Supplier portal access is not modeled through the internal User aggregate. Supplier-side authentication is managed through the `SupplierProfile` portal access mechanism in Organization Management.
- Email uniqueness is scoped to the Tenant — the same email address may exist in different Tenants.
- Deactivated Users remain in the Tenant data scope for audit purposes. Their TenantId is never cleared.
- Tenant isolation (GBR-021) is enforced at the data layer. No User query may return Users from a different Tenant.

---

## 14. Versioning

Users are not versioned in the business sense. There is no `UserVersion` concept. Profile changes (name, email, roles) are auditable through the event log but do not create immutable version snapshots. This is consistent with the domain: Users are actors, not knowledge assets.

---

## 15. API Considerations

| Endpoint | Method | Description |
|---|---|---|
| `/users` | GET | List Users for the authenticated Tenant |
| `/users/{id}` | GET | Get User profile |
| `/users/invite` | POST | Invite a new User |
| `/users/{id}` | PATCH | Update User profile |
| `/users/{id}/roles` | GET | Get User roles |
| `/users/{id}/roles` | POST | Assign a role |
| `/users/{id}/roles/{roleId}` | DELETE | Revoke a role |
| `/users/{id}/suspend` | POST | Suspend a User |
| `/users/{id}/reactivate` | POST | Reactivate a suspended User |
| `/users/{id}/deactivate` | POST | Deactivate a User |

All endpoints enforce TenantId scoping. Cross-tenant access is not permitted.

---

## 16. AI Guidance

**AI may:**
- Suggest relevant roles for a User based on their project involvement
- Detect Users assigned to a project who have not yet accepted an invitation

**AI must not:**
- Assign or revoke roles without explicit human confirmation (ADR-005, USR-BR-007)
- Activate, suspend, or deactivate Users
- Infer User identity from context — UserId must always be explicitly resolved through authentication

---

## 17. Machine Context

```yaml
domain: Organization Management
aggregate_root: User
bounded_context: OM
layer: Foundation
versioned: false
auditable: true

lifecycle_states:
  - Invited
  - Active
  - Suspended
  - Deactivated

critical_invariants:
  - UserId must remain resolvable after deactivation (USR-BR-003)
  - Email unique within Tenant (USR-BR-004)
  - User belongs to exactly one Tenant (USR-BR-001)
  - No cross-tenant User queries (GBR-021)

referenced_by_all_contexts_as: UserId

commands:
  - InviteUser
  - AcceptInvitation
  - UpdateUserProfile
  - AssignRole
  - RevokeRole
  - SuspendUser
  - ReactivateUser
  - DeactivateUser

events_produced:
  - UserInvited
  - UserActivated
  - UserRoleAssigned
  - UserRoleRevoked
  - UserSuspended
  - UserReactivated
  - UserDeactivated

never:
  - delete_user_identity
  - store_user_profile_data_outside_OM
  - ai_auto_role_assignment
  - cross_tenant_user_access
```
