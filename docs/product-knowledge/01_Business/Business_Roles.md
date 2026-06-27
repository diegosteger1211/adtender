---
id: PKB-01-004
title: Business Roles
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
  - PKB-00-001
  - PKB-01-002
---

# Business Roles

## Purpose

This document defines the business roles on the adtender platform. Each role entry describes who acts in the system, what they are responsible for, which business processes they participate in, and which permission categories they require.

Roles are modeled as business concepts. Technical permission sets are derived from roles; roles must not be derived from permission sets.

A user may hold multiple roles within a project. Roles are scoped at the organizational level or the project level as specified per role. Role assignments follow the lifecycle of the project and are auditable.

---

## Role Model

adtender uses a **role-per-context** model. A user's role may differ between projects — a Procurement Manager in Project A may be a Domain Expert in Project B. Roles are assigned at project initiation and may be adjusted during the project lifecycle with appropriate governance and audit.

Organization-level roles (System Administrator, Library Manager) apply across all projects within the tenant and are managed by the System Administrator.

---

## Core Business Roles

### Executive Sponsor

**Scope:** Organization / Project  
**Primary domain:** Project Management, Decision Management

**Purpose:** Holds ultimate business accountability for the initiative. Provides strategic alignment, authorizes the business case, and approves the final Decision for high-value initiatives.

**Responsibilities:**
- Approving the business case and budget authorization for the project
- Ensuring the project remains aligned with organizational strategy and priorities
- Providing the escalation path for unresolved decision conflicts
- Approving the final award Decision for initiatives above the defined value threshold

**Process involvement:**
- BP01 — approves the business case and authorizes project creation
- BP11 — member of the Decision Board for strategically significant initiatives
- BP12 — signs off on contract handover for strategic contracts

**Minimum permission categories:**
`Project.Read`, `Project.Approve`, `Decision.Read`, `Decision.Approve`, `Reporting.Read`

**Constraint:** The Executive Sponsor does not operate Requirements or Evaluations. Their involvement is at strategic approval gates, not at operational level.

---

### Project Owner

**Scope:** Project  
**Primary domain:** Project Management

**Purpose:** Accountable for the outcome of the specific project on adtender. The primary business contact for the project, holding final approval authority over all project-level decisions.

**Responsibilities:**
- Defining and owning the project objectives, scope and success criteria
- Approving the project plan, milestones and key deliverables
- Reviewing and approving the complete Requirement set before Tender creation
- Reviewing the consolidated Evaluation result before Decision submission to the Decision Board
- Confirming and submitting the Decision record for Board approval
- Authorizing project closure and initiating the Lessons Learned process

**Process involvement:**
- BP01 — approves or creates the Project record
- BP02 — formally accepts accountability as Project Owner
- BP03 — approves the project plan
- BP04 — approves the finalized Requirement set
- BP06 — reviews and approves the Tender draft
- BP09 — reviews the Evaluation in progress
- BP10 — reviews the consolidated Evaluation result
- BP11 — submits the Decision to the Decision Board
- BP13 — authorizes project closure
- BP14 — initiates and oversees Lessons Learned

**Minimum permission categories:**
`Project.*`, `Requirement.Read`, `Requirement.Approve`, `Tender.Read`, `Tender.Approve`, `Evaluation.Read`, `Decision.Create`, `Decision.SubmitForApproval`, `LessonsLearned.Create`

**Business rule constraint:** Exactly one Project Owner per Project at any time (GBR-007). Transfer of ownership requires an explicit `TransferProjectOwnership` action and is audited.

---

### Project Manager

**Scope:** Project  
**Primary domain:** Project Management

**Purpose:** Coordinates the day-to-day execution of the project within adtender. Responsible for timelines, task coordination, stakeholder communication and the operational management of the process flow.

**Responsibilities:**
- Creating and maintaining the project plan, milestones and task assignments
- Assigning team members to workflow steps and coordinating handoffs
- Tracking progress against plan and escalating blockers to the Project Owner
- Managing the Supplier invitation list in preparation for BP07
- Coordinating the clarification process during BP08, ensuring equal treatment
- Ensuring all process entry conditions are met before triggering the next process step
- Maintaining complete project documentation and audit trail completeness

**Process involvement:**
- BP02 — primary author of the Project record
- BP03 — primary author of the project plan
- BP06 — authors the Tender structure
- BP07 — manages publication logistics and Supplier access
- BP08 — coordinates the clarification process
- BP10 — orchestrates the consolidation meeting and coordinates Evaluator inputs
- BP12 — coordinates the contract handover package
- BP13 — executes the project closure checklist

**Minimum permission categories:**
`Project.Update`, `Project.ManageMembers`, `Project.ManageMilestones`, `Tender.Create`, `Tender.Update`, `Tender.ManageSuppliers`, `Evaluation.Read`, `Evaluation.ManageAssignments`, `Workflow.Trigger`, `Workflow.Reassign`, `Document.Create`, `Document.Manage`

---

### Domain Expert

**Scope:** Project  
**Primary domain:** Requirement Management, Evaluation Management

**Purpose:** Provides subject matter knowledge for the business domain being procured or decided upon. Validates technical correctness of Requirements and provides scoring rationale during Evaluation.

**Responsibilities:**
- Reviewing and contributing to Requirements in their area of expertise
- Verifying that Requirements are technically accurate, complete and unambiguous
- Providing individual evaluation scores for Requirements in their assigned domain
- Reviewing Supplier Responses for technical accuracy and evidence completeness
- Contributing domain-specific observations to the Lessons Learned process

**Process involvement:**
- BP04 — reviews and contributes to Requirements
- BP09 — scores Supplier Responses within assigned Requirement groups
- BP10 — participates in consolidation review for disputed scores in their domain
- BP14 — provides domain-specific Lessons Learned observations

**Minimum permission categories:**
`Requirement.Read`, `Requirement.Comment`, `SupplierResponse.Read` (assigned scope), `Evaluation.CreateScore` (own assignment), `Evaluation.Read` (assigned scope), `LessonsLearned.Contribute`

---

### Requirement Engineer

**Scope:** Project / Organization (for library work)  
**Primary domain:** Requirement Management, Knowledge Management

**Purpose:** Responsible for the structural quality, classification and governance of Requirements. Manages the full lifecycle from requirement capture through approval, library contribution and improvement.

**Responsibilities:**
- Searching Requirement Libraries for reusable content before creating new Requirements
- Structuring new Requirements as Business Objects with full classification, lifecycle, response types and evaluation configuration
- Managing Requirement review and approval workflows
- Organizing Requirements into groups for Tender structure
- Configuring response types, evidence requirements and evaluation relevance per Requirement
- Identifying and proposing Requirement improvements after project completion
- Submitting library improvement proposals in BP15

**Process involvement:**
- BP04 — primary actor for Requirement engineering
- BP05 — primary user of library search and reuse
- BP06 — assembles the approved Requirement set for the Tender
- BP14 — identifies Requirements that should be improved
- BP15 — submits improvement proposals to library governance

**Minimum permission categories:**
`Requirement.*`, `RequirementLibrary.Read`, `RequirementLibrary.Search`, `RequirementLibrary.ProposeContribution`, `Tender.AddRequirement`

---

### Procurement Manager

**Scope:** Project / Organization  
**Primary domain:** Tender Management, Supplier Management

**Purpose:** Governs the Tender process from a procedural and compliance perspective. Responsible for tender legality, supplier fairness, timeline governance and publication control.

**Responsibilities:**
- Ensuring the Tender structure complies with applicable procurement rules and organizational governance policy
- Managing the Supplier shortlist and qualification criteria
- Controlling Tender publication and the formal amendment process
- Enforcing submission deadlines and clarification windows
- Ensuring equal treatment of all Suppliers throughout the Tender process
- Managing clarification answers — all answers are published to all invited Suppliers
- Managing the formal notification of unsuccessful Suppliers after the Decision is approved
- Governing the contract handover documentation and compliance package

**Process involvement:**
- BP06 — reviews Tender for procurement compliance
- BP07 — executes and controls publication; manages Supplier access
- BP08 — governs the clarification process; authors and publishes clarification answers
- BP12 — manages contract handover and unsuccessful Supplier notifications

**Minimum permission categories:**
`Tender.*`, `Supplier.Read`, `Supplier.Invite`, `Supplier.Manage`, `SupplierResponse.Read`, `SupplierResponse.LockSubmission`, `Decision.Read`, `Document.Create`, `Document.Publish`

---

### Evaluator

**Scope:** Project (Evaluation phase)  
**Primary domain:** Evaluation Management

**Purpose:** Independently assesses Supplier Responses against assigned Requirements using the defined Evaluation Model. Evaluators operate independently to preserve evaluation integrity.

**Responsibilities:**
- Reviewing Supplier Responses for their assigned Requirement group
- Recording scores for each Supplier Response against each assigned Requirement version, using the defined Evaluation Model
- Documenting scoring rationale for every score — mandatory for scores below threshold and for all Knock-out determinations
- Flagging missing evidence, incomplete responses and clarification needs
- Completing evaluation within the assigned deadline
- Participating in consolidation review for disputed scores

**Process involvement:**
- BP09 — primary actor for individual scoring
- BP10 — participates in score dispute review and consolidation

**Minimum permission categories:**
`SupplierResponse.Read` (assigned Suppliers only, during evaluation), `Requirement.ReadPublished` (published versions in scope), `Evaluation.CreateScore` (own assignment only), `Evaluation.Read` (own scores during individual evaluation; all scores after consolidation opens)

**Business rule constraint (GBR-013):** Evaluators must not see other Evaluators' scores during the individual evaluation phase. This is enforced at the API and data layer, not only in the UI. The Evaluation aggregate tracks this state and the API must respect it.

---

### Decision Board

**Scope:** Project (Decision phase)  
**Primary domain:** Decision Management

**Purpose:** The group of stakeholders authorized to review the consolidated Evaluation result and approve the final Decision. Holds collective accountability for the selection outcome.

**Responsibilities:**
- Reviewing the consolidated Evaluation result and Decision brief
- Challenging scoring rationale and requesting clarification where needed
- Approving the recommended Decision with or without modifications to the rationale
- Formally recording the Decision rationale, including trade-offs and accepted deviations
- Approving the notification approach for unsuccessful Suppliers

**Process involvement:**
- BP11 — approves the Decision record

**Minimum permission categories:**
`Evaluation.Read` (consolidated result only), `Decision.Read`, `Decision.Approve`, `Decision.Reject`

**Business rule constraint (GBR-016):** Decision Board approval is a mandatory gateway. Contract Handover (BP12) may not begin without a Decision in `Approved` state carrying Decision Board approval.

---

### Supplier Contact

**Scope:** External — Supplier Portal  
**Primary domain:** Supplier Management

**Purpose:** The individual at a Supplier organization who accesses the adtender Supplier Portal, reviews the published Tender, manages clarification requests and submits the Supplier Response.

**Responsibilities:**
- Reviewing the published Tender and all published Requirement versions
- Submitting clarification requests within the defined clarification window
- Reviewing published clarification answers from the Procurement Manager
- Completing the structured Supplier Response for every Requirement
- Attaching required evidence materials (certificates, reference documentation, price sheets)
- Submitting the Supplier Response before the submission deadline

**Process involvement:**
- BP07 — receives invitation and publication notification
- BP08 — submits clarifications, reads answers, completes and submits the Supplier Response

**Minimum permission categories:**
`Tender.ReadPublished` (own invitation only), `Requirement.ReadPublished` (published versions in their Tender), `ClarificationRequest.Create`, `ClarificationAnswer.Read`, `SupplierResponse.Create`, `SupplierResponse.Update` (own response only, before deadline), `SupplierResponse.Submit`

**Key constraint:** Supplier Contacts have no visibility into other Suppliers' responses, other Suppliers' identities, evaluation scores, internal project data, or Decision Board deliberations. Tenant data isolation enforces this at the data layer.

---

### Library Manager

**Scope:** Organization  
**Primary domain:** Knowledge Management, Requirement Management

**Purpose:** Governs one or more Requirement Libraries. Controls the quality, structure and relevance of library content across all projects.

**Responsibilities:**
- Reviewing and approving or rejecting Requirement improvement proposals submitted from projects
- Deprecating Requirements that are outdated, replaced or no longer meet quality standards
- Organizing library structure: categories, tags, groupings, hierarchies
- Ensuring library content meets organizational quality standards before publication
- Publishing new and improved Requirements to the library
- Monitoring library health: reuse rates, stale content, duplication levels

**Process involvement:**
- BP05 — primary governance actor for library operations
- BP15 — reviews, approves and publishes library contributions from projects

**Minimum permission categories:**
`RequirementLibrary.*`, `Requirement.Approve`, `Requirement.Publish`, `Requirement.Deprecate`, `Requirement.Archive`, `KnowledgeAsset.Create`, `KnowledgeAsset.Approve`, `Reporting.Read`

---

### System Administrator

**Scope:** Organization (Tenant)  
**Primary domain:** Organization Management, Administration

**Purpose:** Manages the adtender platform configuration for the tenant organization. Enables and governs the platform environment. Does not participate in business processes.

**Responsibilities:**
- User account provisioning, de-provisioning and profile management
- Role assignment and permission management within the tenant
- Tenant configuration: configurable categories, workflow templates, evaluation model templates, notification templates
- Platform integration configuration: SSO, ERP connectors, DMS connectors
- Monitoring platform usage and audit log access for compliance purposes

**Minimum permission categories:**
Organization administration permissions. Must not have access to project-specific business content beyond what is necessary for support operations. All administrative actions are auditable.

---

## Role Participation Matrix

| Role | BP01 | BP02 | BP03 | BP04 | BP05 | BP06 | BP07 | BP08 | BP09 | BP10 | BP11 | BP12 | BP13 | BP14 | BP15 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Executive Sponsor | ✓ | — | — | — | — | — | — | — | — | — | ✓ | — | — | — | — |
| Project Owner | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — | ✓ | ✓ | ✓ | — | ✓ | ✓ | — |
| Project Manager | — | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | ✓ | — |
| Domain Expert | — | — | — | ✓ | — | — | — | — | ✓ | ✓ | — | — | — | ✓ | — |
| Requirement Engineer | — | — | — | ✓ | ✓ | ✓ | — | — | — | — | — | — | — | ✓ | ✓ |
| Procurement Manager | — | — | — | — | — | ✓ | ✓ | ✓ | — | — | — | ✓ | — | — | — |
| Evaluator | — | — | — | — | — | — | — | — | ✓ | ✓ | — | — | — | — | — |
| Decision Board | — | — | — | — | — | — | — | — | — | — | ✓ | — | — | — | — |
| Supplier Contact | — | — | — | — | — | — | ✓ | ✓ | — | — | — | — | — | — | — |
| Library Manager | — | — | — | — | ✓ | — | — | — | — | — | — | — | — | — | ✓ |
| System Administrator | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |

---

## References

- [`Product_Glossary.md`](../00_Product_DNA/Product_Glossary.md) — Authoritative role definitions
- [`Business_Process_Architecture.md`](./Business_Process_Architecture.md) — How roles participate in processes
- [`Business_Rules.md`](./Business_Rules.md) — Role-related business rules (GBR-007)
- [`02_Domain_Model/Project.md`](../02_Domain_Model/Project.md) — Project-level role and governance model
