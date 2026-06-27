---
id: PKB-01-BP02
title: BP02 — Project Initiation
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
  - PKB-01-001
  - PKB-00-MASTER
---

# BP02 — Project Initiation

## Purpose

This process formally establishes the project on the platform. Its goal is to move from an approved business idea (BP01 output) to a fully configured project with a defined team, governance structure, and organizational context.

The output of BP02 is a Project record in `Initiated` state — ready for detailed planning in BP03.

---

## Business Context

BP01 answers "should we do this?" BP02 answers "who will do this and how will we organize it?"

Project Initiation is the organizational commitment step. Resources are committed, roles are formally assigned, governance rules are configured, and the project becomes a live entity that stakeholders can track on the platform.

This process is also where conflict of interest declarations are captured for roles that will later participate in Evaluation (Evaluators) and Decision (Decision Board members). These declarations are a governance requirement that must be in place before any Supplier data is visible to those roles.

---

## Scope

**In scope:**
- Formally assigning the Project Owner and Project Manager
- Assembling the project team with role assignments
- Configuring the project's governance structure (approval chains, escalation paths)
- Recording conflict of interest declarations for evaluation-sensitive roles
- Establishing the project's organizational context (business unit, cost center, initiative category)
- Configuring the project's notification and communication settings

**Out of scope:**
- Detailed milestone planning (BP03)
- Requirement engineering (BP04)
- Supplier identification and invitation (BP06, BP07)
- Budget approval (Executive Sponsor activity in BP01)

---

## Entry Criteria

- Project in `Idea` state with Executive Sponsor approval recorded (`ProjectIdeaApproved` event)
- Project Owner designated (from BP01)

---

## Exit Criteria

BP02 is complete when:

- Project is in `Initiated` state
- Project Owner is formally confirmed (not just provisionally assigned)
- Project Manager is assigned
- Core project team is assembled with roles defined
- Project governance configuration is complete (approval chains, escalation)
- Conflict of interest declarations are recorded for roles with later evaluation involvement
- Project organizational context is complete (business unit, initiative category, cost center reference)

---

## Actors

| Role | Responsibility in BP02 |
|---|---|
| Project Owner | Confirms accountability; reviews and approves the initiation configuration |
| Project Manager | Primary executor of this process; configures the project and assembles the team |
| Executive Sponsor | May be consulted for governance configuration; not primary actor |
| System Administrator | Provisions user accounts if team members are new to the platform |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Project record | BP01 output | `Idea`, with `ProjectIdeaApproved` event |
| Project Owner identity | Executive Sponsor decision (BP01) | Confirmed person |
| Project team candidate list | Project Owner / HR / Organization Management | Named individuals with proposed roles |
| Organizational context | Finance / HR | Business unit, cost center, initiative category |
| Governance policy | Organization Management | Standard approval chains for project type |

---

## Activities

### Activity 1 — Confirm Project Owner and Assign Project Manager

**Actor:** Project Manager (self-assignment or assignment by Project Owner)  
**Commands:** `ConfirmProjectOwner`, `AssignProjectManager`  
**Action:** The Project Owner formally confirms their accountability. The Project Manager is assigned — the individual who will coordinate day-to-day execution and be the primary operational contact on the platform.

**Business rule enforced:** GBR-007 — exactly one Project Owner.

**Events produced:** `ProjectOwnerConfirmed`, `ProjectManagerAssigned`

---

### Activity 2 — Assemble the Project Team

**Actor:** Project Manager  
**Command:** `AddProjectMember` (repeated per team member)  
**Action:** The project team is assembled. For each team member, the following is recorded:
- User identity (from Organization Management)
- Project role(s): Domain Expert, Requirement Engineer, Procurement Manager, Evaluator, Decision Board member
- Scope of authority (which domains, which Requirement groups for Evaluators)
- Start date on project

**Important:** For team members who will later serve as Evaluators or Decision Board members, conflict of interest declarations must be recorded before they are permitted to access Supplier data. Activity 3 handles this.

**Events produced:** `ProjectMemberAdded` (per member)

---

### Activity 3 — Record Conflict of Interest Declarations

**Actor:** Project Manager, each team member  
**Command:** `RecordConflictOfInterestDeclaration`  
**Action:** Every team member who will participate in Evaluation (Evaluators) or Decision (Decision Board members) must submit a conflict of interest declaration stating whether they have any personal, financial or professional relationship with any of the invited Suppliers.

Declarations are mandatory before these roles may access Supplier Response data.

**Business rule enforced:** BP02-BR-002 — Evaluators and Decision Board members must have a recorded conflict of interest declaration before accessing Supplier data.

**Events produced:** `ConflictOfInterestDeclared` (per declaration)

---

### Activity 4 — Configure Project Governance

**Actor:** Project Manager, Project Owner  
**Command:** `ConfigureProjectGovernance`  
**Action:** The project's governance rules are configured, drawing from organizational templates where available:
- Approval chain for Tender publication (who must approve before publication)
- Approval chain for Decision submission
- Escalation path (who to escalate to if a gateway stalls)
- Quorum rules for Decision Board (how many board members must approve)
- Notification recipients for key project events

**Events produced:** `ProjectGovernanceConfigured`

---

### Activity 5 — Set Organizational Context

**Actor:** Project Manager  
**Command:** `UpdateProjectOrganizationalContext`  
**Action:** The project's organizational context is completed:
- Owning business unit
- Cost center reference
- Initiative category (configurable per tenant: strategic, tactical, operational, compliance, etc.)
- Data classification level (governs access control and data handling rules)

**Events produced:** `ProjectContextUpdated`

---

### Activity 6 — Project Owner Approves Initiation

**Actor:** Project Owner  
**Command:** `ApproveProjectInitiation`  
**Action:** The Project Owner reviews the project configuration — team composition, governance structure, organizational context — and formally approves the project for planning.

**Project state transition:** `Idea` → `Initiated`

**Events produced:** `ProjectInitiated`

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP02-BR-001 | A Project may not transition to `Initiated` state without a confirmed Project Owner and an assigned Project Manager. |
| BP02-BR-002 | Any team member assigned to the Evaluator or Decision Board role must have a recorded conflict of interest declaration before being permitted to access Supplier Response data. |
| BP02-BR-003 | Role assignments must reference existing user identities from Organization Management. Role assignments for non-existent users are rejected. |
| BP02-BR-004 | A project governance configuration must be in place before the Project can transition to `Initiated`. The minimum governance configuration is: at least one approver for the Tender publication gateway and at least one Decision Board member. |
| GBR-007 | Exactly one Project Owner at any time. |
| GBR-008 | Project belongs to one Organization. |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Transition | Trigger | Actor |
|---|---|---|
| `Idea` → `Initiated` | `ApproveProjectInitiation` | Project Owner |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `ProjectOwnerConfirmed` | `ConfirmProjectOwner` |
| `ProjectManagerAssigned` | `AssignProjectManager` |
| `ProjectMemberAdded` | `AddProjectMember` (per member) |
| `ConflictOfInterestDeclared` | `RecordConflictOfInterestDeclaration` (per declaration) |
| `ProjectGovernanceConfigured` | `ConfigureProjectGovernance` |
| `ProjectContextUpdated` | `UpdateProjectOrganizationalContext` |
| `ProjectInitiated` | `ApproveProjectInitiation` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Initiated Project | `Project` | `Initiated` |
| Team member assignments | `Project.members[]` | Roles assigned |
| Conflict of interest declarations | `ConflictOfInterestDeclaration[]` | Recorded per relevant member |
| Governance configuration | `Project.governanceConfiguration` | Configured |
| Audit records | `AuditRecord[]` | Immutable, records all BP02 actions |

---

## KPIs

| KPI | Definition |
|---|---|
| BP02 cycle time | Calendar days from `ProjectIdeaApproved` to `ProjectInitiated` |
| Team assembly completeness | Percentage of mandatory roles filled at BP02 exit |
| Conflict of interest declaration compliance | Percentage of evaluation-sensitive roles with completed declarations |

---

## AI Guidance

AI may assist in BP02 by:
- Suggesting team composition based on project type and domain (drawing on similar past projects from Knowledge Assets)
- Recommending governance configuration templates matching the project type
- Flagging potential conflicts: if an invited team member has previously evaluated the same Supplier, surface this for human review

AI must not:
- Assign roles to team members autonomously
- Override conflict of interest declarations
- Configure governance without human review

---

## Anti-Patterns

- Skipping conflict of interest declarations and allowing Evaluators to access Supplier data without them — a governance and potentially legal violation.
- Using generic role assignments (e.g., "everyone is a Domain Expert") with no specific scope definition — makes Evaluator assignment impossible in BP09.
- Configuring a Decision Board with only one member — single-person decision approval removes the governance value of a board review.

---

## References

- [`Business_Roles.md`](./Business_Roles.md) — Role definitions and responsibilities
- [`Business_Rules.md`](./Business_Rules.md) — Global rules (GBR-001, GBR-007, GBR-008)
- [`02_Domain_Model/Project.md`](../02_Domain_Model/Project.md) — Project aggregate specification
- [BP01_Strategy.md](./BP01_Strategy.md) — Predecessor process
- [BP03_Project_Planning.md](./BP03_Project_Planning.md) — Next process
