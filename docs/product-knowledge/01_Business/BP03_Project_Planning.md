---
id: PKB-01-BP03
title: BP03 — Project Planning
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

# BP03 — Project Planning

## Purpose

This process produces the operational plan for the project — the milestones, timeline, resources, procurement strategy and evaluation approach that will govern all subsequent execution.

The output of BP03 is a Project record in `Planned` state with a defined, approved project plan.

---

## Business Context

BP02 establishes who is accountable. BP03 establishes how the initiative will be executed, in what sequence, by when.

Planning is where the procurement strategy is made explicit: how many Tender rounds, whether the process is open or restricted, how many Suppliers will be invited, what the evaluation approach will be at a high level. These decisions drive the entire downstream process architecture — they determine the scope of BP04 (Requirement Engineering), BP06 (Tender Creation), BP09 (Evaluation), and BP11 (Decision).

A project plan that is not structured data is a planning failure. Milestones and timelines must be captured as Business Objects in the platform, not in a spreadsheet that goes out of date the moment the project is created.

---

## Scope

**In scope:**
- Defining project milestones with owners and target dates
- Establishing the Tender timeline (publication date, clarification window, submission deadline, evaluation period, decision date)
- Defining the procurement strategy (tender type, number of rounds, open vs. restricted)
- Establishing the evaluation approach (individual vs. committee, scoring method at high level)
- Identifying the initial Supplier longlist for consideration
- Defining the project data classification and access control baseline

**Out of scope:**
- Requirement authoring (BP04)
- Supplier qualification and formal invitation (BP06, BP07)
- Evaluation Model configuration in detail (BP06)
- Budget approval (already in BP01)

---

## Entry Criteria

- Project in `Initiated` state (`ProjectInitiated` event)
- Core project team assembled
- Governance configuration in place

---

## Exit Criteria

BP03 is complete when:

- Project is in `Planned` state
- All mandatory milestones are defined with owners and target dates
- Tender timeline is established and approved
- Procurement strategy is documented and approved
- Evaluation approach is agreed at high level
- Project Owner has approved the project plan

---

## Actors

| Role | Responsibility in BP03 |
|---|---|
| Project Manager | Primary author of the project plan and all milestone definitions |
| Project Owner | Reviews and approves the project plan |
| Procurement Manager | Defines the procurement strategy and Tender timeline |
| Domain Expert | Consulted on realistic timeline for Requirement Engineering |
| Executive Sponsor | Informed; may review for strategic alignment |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Initiated Project record | BP02 output | `Initiated` |
| Organizational procurement policy | Organization Management / Procurement Manager | Active configuration |
| Supplier market knowledge | Procurement Manager, Domain Expert | Informal / Knowledge Assets |
| Organizational calendar constraints | Project Manager | Stakeholder availability, holidays, fiscal year |

---

## Activities

### Activity 1 — Define Project Milestones

**Actor:** Project Manager  
**Command:** `AddProjectMilestone` (repeated per milestone)  
**Action:** The key milestones of the project are defined. Each milestone requires:
- Name (using standard milestone vocabulary where configured)
- Target date
- Owner (from project team)
- Entry and exit criteria (brief description)
- Dependency on other milestones

**Mandatory milestones for a Tender process:**

| Milestone | Notes |
|---|---|
| Requirements approved | All Requirements in `Approved` state — gates BP06 |
| Tender approved | Tender in `Approved` state — gates BP07 |
| Tender published | Publication date communicated to Suppliers |
| Clarification window close | Last date for Supplier clarification requests |
| Submission deadline | Last date for Supplier Response submission |
| Evaluation complete | All individual scores recorded — gates BP10 |
| Consolidation complete | Consolidated Evaluation result approved — gates BP11 |
| Decision approved | Decision in `Approved` state — gates BP12 |
| Contract handover | Handover to legal/ERP complete |
| Project closed | BP13 complete |
| Lessons Learned complete | BP14 complete |

**Events produced:** `MilestoneAdded` (per milestone)

---

### Activity 2 — Define Procurement Strategy

**Actor:** Procurement Manager, Project Owner  
**Command:** `SetProcurementStrategy`  
**Action:** The procurement approach is documented as structured configuration on the Project:

- **Tender type:** Open (any Supplier may respond), Restricted (invited Suppliers only), Framework (against an existing framework agreement)
- **Number of rounds:** Single round, or multi-round (preliminary assessment followed by detailed Tender)
- **Market engagement:** Whether pre-market consultation is planned
- **Regulatory framework:** Whether public procurement rules apply (EU Directive, national law, organizational threshold rules)
- **Confidentiality:** Supplier name anonymization during evaluation (yes/no)
- **Standstill period:** Required days between Decision notification and contract execution

**Events produced:** `ProcurementStrategySet`

---

### Activity 3 — Define Tender Timeline

**Actor:** Project Manager, Procurement Manager  
**Command:** `SetTenderTimeline`  
**Action:** The Tender-specific timeline is established with explicit dates:
- Target Tender publication date
- Clarification window: open date and close date
- Submission deadline (date and time, timezone)
- Evaluation period: start and target completion date
- Consolidation and Decision period
- Standstill period start and end
- Contract execution target date

The Tender timeline is validated against the project milestones: the submission deadline must precede the evaluation start milestone; the Decision approved milestone must precede the contract handover milestone.

**Events produced:** `TenderTimelineSet`

---

### Activity 4 — Define Evaluation Approach

**Actor:** Project Owner, Procurement Manager, Domain Expert  
**Command:** `SetEvaluationApproach`  
**Action:** The high-level evaluation approach is documented:
- Evaluation method: criteria-weighted scoring, pass/fail, qualitative ranking, or combined
- Whether individual blind evaluation is used (strongly recommended; see GBR-013)
- Number of Evaluators required per Requirement group
- Scoring scale (e.g., 0–5, 0–10, percentage)
- Whether a consolidated consolidation meeting is required after individual scoring

This is a high-level configuration that will be detailed in BP06 when the Evaluation Model is configured on the Tender.

**Events produced:** `EvaluationApproachSet`

---

### Activity 5 — Identify Initial Supplier Longlist

**Actor:** Procurement Manager, Project Manager  
**Command:** `AddPotentialSupplier` (repeated per Supplier)  
**Action:** Known Suppliers relevant to this initiative are identified and added to the project's Supplier consideration list. This is not a formal invitation — it is a working list for planning purposes.

For each potential Supplier, note:
- Known market position
- Prior relationship with the organization
- Potential conflict of interest concerns (surfaced for Project Owner review)

**Events produced:** `PotentialSupplierAdded` (per entry)

---

### Activity 6 — Project Owner Approves Project Plan

**Actor:** Project Owner  
**Command:** `ApproveProjectPlan`  
**Action:** The Project Owner reviews the complete project plan — milestones, procurement strategy, Tender timeline, evaluation approach — and approves it.

**Project state transition:** `Initiated` → `Planned`

**Events produced:** `ProjectPlanApproved`, `ProjectPlanned`

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP03-BR-001 | A Project may not transition to `Planned` state without all mandatory milestones defined, each with an owner and a target date. |
| BP03-BR-002 | The submission deadline milestone must be at least the minimum response period after the Tender publication milestone. The minimum response period is configurable per tenant (e.g., 10 business days for private procurement; regulated periods for public procurement). |
| BP03-BR-003 | The Tender timeline must be internally consistent: clarification close < submission deadline < evaluation start < evaluation complete < decision approved. Any inconsistency is rejected by the platform. |
| BP03-BR-004 | A procurement strategy must be documented before the Project can be approved for planning. |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Transition | Trigger | Actor |
|---|---|---|
| `Initiated` → `Planned` | `ApproveProjectPlan` | Project Owner |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `MilestoneAdded` | `AddProjectMilestone` |
| `ProcurementStrategySet` | `SetProcurementStrategy` |
| `TenderTimelineSet` | `SetTenderTimeline` |
| `EvaluationApproachSet` | `SetEvaluationApproach` |
| `PotentialSupplierAdded` | `AddPotentialSupplier` |
| `ProjectPlanApproved` | `ApproveProjectPlan` |
| `ProjectPlanned` | Project state transitions to `Planned` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Planned Project with milestones | `Project` | `Planned` |
| Procurement strategy | `Project.procurementStrategy` | Configured |
| Tender timeline | `Project.tenderTimeline` | Configured |
| Evaluation approach | `Project.evaluationApproach` | Configured |
| Potential Supplier list | `Project.potentialSuppliers[]` | Recorded |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| BP03 cycle time | Calendar days from `ProjectInitiated` to `ProjectPlanned` |
| Milestone completeness | All mandatory milestones defined with owners and dates at BP03 exit |
| Timeline adherence | Percentage of later milestones completed within the dates set at BP03 (retrospective) |

---

## AI Guidance

AI may assist in BP03 by:
- Suggesting realistic Tender timelines based on similar past projects from Knowledge Assets
- Flagging timeline inconsistencies (e.g., a submission deadline before the clarification window closes)
- Identifying regulatory minimum periods if the procurement type is regulated
- Recommending evaluation approaches based on project type and complexity

AI must not:
- Approve the project plan
- Set milestone dates without human confirmation
- Determine the procurement strategy autonomously

---

## Anti-Patterns

- Defining milestones without owners — creates accountability gaps that become blockers during execution.
- Setting unrealistic timelines that compress the Supplier response period — reduces Supplier Response quality and increases the risk of legal challenge.
- Skipping the procurement strategy documentation and treating this as an informal decision — governance violations in regulated procurement can invalidate the entire process.
- Treating the Supplier longlist as a final decision at this stage — it is an input to planning, not a commitment.

---

## References

- [`Business_Roles.md`](./Business_Roles.md) — Role responsibilities
- [`Business_Rules.md`](./Business_Rules.md) — GBR-001
- [`02_Domain_Model/Project.md`](../02_Domain_Model/Project.md) — Project aggregate specification
- [BP02_Project_Initiation.md](./BP02_Project_Initiation.md) — Predecessor process
- [BP04_Requirement_Engineering.md](./BP04_Requirement_Engineering.md) — Next process
