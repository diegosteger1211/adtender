---
id: PKB-01-BP01
title: BP01 — Strategy & Project Idea
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

# BP01 — Strategy & Project Idea

## Purpose

This process captures the origin of a business initiative. Its goal is to translate an organizational need into a justified, approved project idea that can be formally initiated on the platform.

The output of BP01 is a Project record in `Idea` state — the organizational container that will govern all subsequent activity through BP15.

---

## Business Context

Every project on adtender originates from a recognized business need: a technology selection, a supplier evaluation, a strategic sourcing initiative, an investment decision, or any other scenario requiring a structured procurement or decision process.

BP01 is the lightest-weight process in the lifecycle. It is not about operational detail — that belongs in BP02 and BP03. It is about answering three questions:
1. Is there a real business problem that justifies this initiative?
2. Is there organizational will and budget intent to pursue it?
3. Who is accountable?

The answers to these questions must be captured in a structured Project record, not in a presentation or an email thread.

---

## Scope

**In scope:**
- Identifying and articulating the business need or opportunity
- Establishing the business case at a summary level
- Designating the Project Owner
- Creating the Project record in the system

**Out of scope:**
- Detailed project planning (BP03)
- Requirement engineering (BP04)
- Procurement strategy definition (BP03)
- Supplier identification (BP03, BP06)

---

## Entry Criteria

Before BP01 can produce its output, the following must be true:

- A business need, obligation or strategic opportunity has been identified
- A sponsoring stakeholder (Executive Sponsor or equivalent) is willing to support the initiative
- Preliminary budget intent exists — the initiative is not speculative without any organizational backing

---

## Exit Criteria

BP01 is complete when:

- A Project record exists in the system in `Idea` state
- The Project has a descriptive title and a business problem statement
- The Executive Sponsor has approved proceeding to BP02
- A Project Owner has been designated (may be confirmed in BP02)
- An initial budget intent has been recorded

---

## Actors

| Role | Responsibility in BP01 |
|---|---|
| Executive Sponsor | Approves the business case; authorizes proceeding to initiation |
| Project Owner | Designated as accountable; may author the initial Project record |
| Project Manager | May be identified provisionally; formally assigned in BP02 |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Business need or opportunity description | Stakeholder | Free text / structured document |
| Budget intent | Finance / Executive Sponsor | Indicative amount or range |
| Strategic context | Executive Sponsor | Alignment to organizational objectives |
| Reference to existing Knowledge Assets | Knowledge Management | Optional — relevant prior project outcomes |

---

## Activities

### Activity 1 — Identify and Articulate the Business Need

**Actor:** Executive Sponsor, Project Owner  
**Action:** The business problem, opportunity or obligation is articulated in structured form:
- What needs to be procured, selected or decided?
- Why now — what is the driver (business growth, system end-of-life, regulatory obligation, strategic opportunity)?
- What is the estimated scope and complexity?
- What is the indicative timeline?
- What does failure to proceed cost the organization?

**Output:** A structured business need statement.

**Platform action:** This content is captured as the Project's `description`, `businessContext` and `strategicJustification` attributes.

---

### Activity 2 — Search for Relevant Prior Knowledge

**Actor:** Project Owner, Requirement Engineer (if engaged early)  
**Action:** Before creating the Project, search the Knowledge Management domain for:
- Similar projects completed previously
- Existing Knowledge Assets relevant to this initiative
- Templates available for this type of project

The goal is to understand what the organization already knows about this type of initiative before starting from a blank page.

**Platform action:** Search `KnowledgeAsset` and `RequirementLibrary` by project type, domain and keywords. Results are linked to the Project record as reference context.

---

### Activity 3 — Create the Project Record

**Actor:** Project Owner  
**Command:** `CreateProject`  
**Action:** A Project record is created with the following minimum attributes:
- Title (concise, unambiguous)
- Business problem statement
- Project type (configurable: software selection, supplier qualification, strategic sourcing, etc.)
- Responsible Organization unit
- Estimated timeline (start and target completion)
- Budget intent (indicative range)
- Strategic context / justification

**Project state after this activity:** `Idea`

**Event produced:** `ProjectCreated`

---

### Activity 4 — Designate the Project Owner

**Actor:** Executive Sponsor  
**Command:** `AssignProjectOwner`  
**Action:** The individual who will be accountable for the project outcome is formally assigned as Project Owner.

**Business rule enforced:** GBR-007 — a Project must have exactly one Project Owner.

**Event produced:** `ProjectOwnerAssigned`

---

### Activity 5 — Executive Sponsor Approval

**Actor:** Executive Sponsor  
**Command:** `ApproveProjectIdea`  
**Action:** The Executive Sponsor reviews the Project record and approves proceeding to BP02 (Project Initiation). This approval is a formal gate — the Project may not proceed to `Initiated` state without it.

**Event produced:** `ProjectIdeaApproved`

The Project is now ready for BP02.

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP01-BR-001 | A Project must have a title and a business problem statement before it can be created. Empty titles and problem statements are rejected. |
| BP01-BR-002 | The `CreateProject` command assigns the creating user as the provisional Project Owner if no explicit owner is designated at creation time. |
| BP01-BR-003 | A Project in `Idea` state may only transition to `Initiated` (BP02 entry) after the Executive Sponsor approval action is recorded. |
| BP01-BR-004 | If an existing Knowledge Asset or similar past project is referenced, the reference must use the Knowledge Asset's versioned identifier. |
| GBR-007 | Exactly one Project Owner at any time. |
| GBR-008 | Project belongs to exactly one Organization. |
| GBR-001 | All actions in this process are auditable. |

---

## State Transitions

| Transition | Trigger | Actor |
|---|---|---|
| `Idea` (created) | `CreateProject` | Project Owner |
| `Idea` → approval recorded | `ApproveProjectIdea` | Executive Sponsor |
| `Idea` → `Initiated` | Entry of BP02 | Triggered by `ProjectIdeaApproved` event |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `ProjectCreated` | `CreateProject` command executes successfully |
| `ProjectOwnerAssigned` | `AssignProjectOwner` command executes successfully |
| `ProjectIdeaApproved` | `ApproveProjectIdea` command executes successfully |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Project record | `Project` | `Idea`, with Executive Sponsor approval recorded |
| Knowledge Asset references | `Project.relatedKnowledgeAssets` | Linked (optional) |
| Audit record | `AuditRecord` | Immutable, records all BP01 actions |

---

## KPIs

| KPI | Definition | Target |
|---|---|---|
| BP01 cycle time | Calendar days from business need identification to Project creation with Executive Sponsor approval | ≤ 5 business days for standard initiatives |
| Business case completeness | Percentage of mandatory Project attributes populated at BP01 exit | 100% |
| Knowledge reuse discovery rate | Percentage of BP01 projects where a prior Knowledge Asset or similar project was found and linked | Measure and improve |

---

## AI Guidance

AI may assist in BP01 by:
- Searching the Knowledge Asset repository for relevant prior projects and surfacing matches with similarity scores
- Suggesting a Project type classification based on the business problem description
- Identifying similar existing projects that may indicate relevant templates
- Detecting gaps in the business case (missing justification fields, missing timeline)

AI must not:
- Create the Project record autonomously
- Approve the business case
- Assign the Project Owner

All AI suggestions in this process are advisory. The Project Owner and Executive Sponsor make all decisions.

---

## Anti-Patterns

- Creating a Project without a Project Owner — violates GBR-007 and leaves accountability undefined.
- Capturing the business case only in a presentation file and linking the file to the Project — violates GBR-006 (documents are not the source of truth). The business problem statement must exist as structured text in the Project record.
- Proceeding to BP02 without Executive Sponsor approval — bypasses a governance gate that exists to prevent resource allocation without authorization.
- Skipping the Knowledge Asset search — misses the opportunity to learn from prior experience before committing to a project approach.

---

## References

- [`Business_Process_Architecture.md`](./Business_Process_Architecture.md) — Position of BP01 in the lifecycle
- [`Business_Roles.md`](./Business_Roles.md) — Role responsibilities
- [`Business_Rules.md`](./Business_Rules.md) — Global rules applied in this process
- [`02_Domain_Model/Project.md`](../02_Domain_Model/Project.md) — Project Business Object specification
- [BP02_Project_Initiation.md](./BP02_Project_Initiation.md) — Next process
