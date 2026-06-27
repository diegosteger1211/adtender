---
id: PKB-01-BP11
title: BP11 — Decision
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

# BP11 — Decision

## Purpose

This process governs the formal procurement decision: the selection of the awarded Supplier (or the decision to reject all responses) by the authorized Decision Board, based exclusively on the Consolidated Evaluation Report.

The output of BP11 is an approved Decision Record documenting the award, the rationale, and all dissenting positions.

---

## Business Context

The Decision is the most governance-sensitive moment in the procurement process. It is the point where evaluation data becomes a binding selection. Its defensibility determines the legal and organizational standing of the entire procurement.

Three properties are required:

1. **Traceability:** The Decision must be traceable to the Consolidated Evaluation Report, which in turn traces to individual Evaluations, Supplier Responses, and Requirements.
2. **Rationale:** The Decision Record must document why the selected Supplier was chosen — not just their ranking, but the substantive reasoning.
3. **Authorization:** The Decision must be made by the authorized Decision Board. No individual can make the award decision unilaterally.

Decisions based on criteria outside the Evaluation Model — personal preference, commercial relationships, or organizational politics — are a governance failure. The platform records all decisions with structured rationale; rationale that cannot be traced to the Evaluation is flagged.

---

## Scope

**In scope:**
- Decision Board review session management
- Conflict of Interest declarations by Board members before accessing Supplier data
- Decision Record creation and rationale documentation
- Award decision (or decision to reject all responses or cancel)
- Dissenting opinion documentation
- Decision approval and immutable record creation

**Out of scope:**
- Consolidated Evaluation Report approval (BP10)
- Supplier award notifications (BP12)
- Standstill period management (BP12)

---

## Entry Criteria

- `ConsolidatedEvaluationReportApproved` event from BP10
- Decision Board members identified
- No open conflicts of interest on Decision Board members

---

## Exit Criteria

BP11 is complete when:

- Decision Record is created and approved by the Decision Board
- Decision rationale is documented and traceable to the Evaluation
- Dissenting positions (if any) are documented
- Executive Sponsor notified
- Decision in `Approved` state

---

## Actors

| Role | Responsibility in BP11 |
|---|---|
| Decision Board | Reviews Evaluation results; deliberates; makes the award decision; approves the Decision Record |
| Project Owner | Chairs the session; presents the Evaluation; countersigns the Decision Record |
| Procurement Manager | Confirms process compliance; presents governance summary; provides compliance confirmation |
| Executive Sponsor | Notified of Decision; may hold Decision for escalation |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Approved Consolidated Evaluation Report | BP10 output | `Approved` |
| Decision Board composition | `Project.governanceConfig` | Configured |
| Conflict of Interest declarations | BP02 and this process | Recorded |

---

## Activities

### Activity 1 — Prepare Decision Board Session

**Actor:** Project Owner, Procurement Manager  
**Command:** `ScheduleDecisionBoardSession`  
**Action:** The Decision Board session is scheduled:
- Confirmed session date and participants
- Consolidated Evaluation Report distributed in advance with appropriate confidentiality handling
- Conflict of interest declaration requirement communicated to all Board members

**Events produced:** `DecisionBoardSessionScheduled`

---

### Activity 2 — Record Conflict of Interest Declarations

**Actor:** Decision Board members  
**Command:** `RecordDecisionBoardConflictDeclaration`  
**Action:** Before accessing Supplier identity information or entering the Decision Board session, each member declares:
- No conflict of interest, OR
- A potential conflict of interest (which must be reviewed and resolved before the member participates)

A Decision Board member with an unresolved conflict of interest must be recused and replaced before the session proceeds.

**Business rule enforced:** GBR-016 — Board members must declare conflicts before accessing Supplier commercial data.

**Events produced:** `DecisionBoardConflictDeclared` (per member)

---

### Activity 3 — Decision Board Reviews Evaluation Results

**Actor:** Decision Board, Project Owner (presenting)  
**Action:** The Decision Board reviews the Consolidated Evaluation Report:
- Overall ranking and score summary
- Score breakdown by Requirement group
- Knock-out determinations and their rationale
- Scoring anomalies and their resolution

Board members may ask questions about the evaluation process and scoring. They may not re-evaluate Supplier Responses — the Evaluation is complete and immutable. Questions about individual scores are channelled through the Procurement Manager.

---

### Activity 4 — Board Deliberation

**Actor:** Decision Board  
**Action:** The Decision Board deliberates on the award. Deliberation is governed by the voting or consensus rules configured in the project governance.

The primary input is the Evaluation result. The Board may also consider:
- Strategic fit factors documented in the Project scope
- Risk factors associated with the top-ranked Supplier

A decision to select a lower-ranked Supplier requires explicit documented rationale explaining why the ranking was overridden. This is a significant governance event and must be recorded as an override with full justification.

---

### Activity 5 — Create Decision Record

**Actor:** Project Owner  
**Command:** `CreateDecisionRecord`  
**Action:** A structured Decision Record is created:
- Decision type: `Award` / `RejectAllResponses` / `CancelProcurement`
- Selected Supplier (if award)
- Award rationale: written explanation directly tied to Evaluation results
- Override rationale (if lower-ranked Supplier selected): explicit reference to criteria justifying the override
- Dissenting positions: documented for any Board member who voted against the majority
- Reference to the Consolidated Evaluation Report version

**Events produced:** `DecisionRecordCreated`

---

### Activity 6 — Approve Decision Record

**Actor:** Decision Board (quorum as configured), Project Owner  
**Command:** `ApproveDecisionRecord`  
**Action:** The Decision Record is formally approved by the Decision Board and countersigned by the Project Owner.

**Business rule enforced:** GBR-017 — Decision Records are immutable once approved.

**Decision state transition:** `Draft` → `Approved`

**Events produced:** `DecisionApproved`

---

### Activity 7 — Notify Executive Sponsor

**Actor:** Platform (automated notification)  
**Action:** The Executive Sponsor is notified of the Decision outcome (award / reject all / cancel), the selected Supplier identity if award, and a reference to the Decision Record.

The Executive Sponsor may hold the Decision for escalation review. A hold is a formal action with a documented reason and a resolution deadline.

**Events produced:** `ExecutiveSponsorNotified`, `DecisionHeldForEscalation` (if applicable)

---

## Decision Outcome Types

| Decision Type | Trigger | Next Process |
|---|---|---|
| **Award** | A Supplier is selected | BP12 — Contract Handover |
| **Reject all responses** | No Supplier met minimum standards | Project returns to BP03/BP04 or to BP13 |
| **Cancel procurement** | Strategic decision to not proceed | BP13 — Project Closing |

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP11-BR-001 | The Decision Board must reach quorum as configured in the project governance before a Decision Record can be approved. |
| BP11-BR-002 | A decision to select a lower-ranked Supplier must include an explicit override rationale referencing the specific criteria that justify the override. |
| BP11-BR-003 | An award cannot be made to a Supplier who has been excluded due to a confirmed Knock-out determination. |
| BP11-BR-004 | Dissenting positions from Decision Board members must be documented in the Decision Record. |
| GBR-015 | The Decision must be based on the Consolidated Evaluation Report. |
| GBR-016 | Decision Board members must declare conflicts of interest before accessing Supplier commercial data. |
| GBR-017 | Approved Decision Records are immutable. |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Business Object | Transition | Trigger |
|---|---|---|
| `DecisionRecord` | Created (`Draft`) | `CreateDecisionRecord` |
| `DecisionRecord` | `Draft` → `Approved` | `ApproveDecisionRecord` |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `DecisionBoardSessionScheduled` | `ScheduleDecisionBoardSession` |
| `DecisionBoardConflictDeclared` | `RecordDecisionBoardConflictDeclaration` |
| `DecisionRecordCreated` | `CreateDecisionRecord` |
| `DecisionApproved` | `ApproveDecisionRecord` |
| `ExecutiveSponsorNotified` | Notification after Decision approved |
| `DecisionHeldForEscalation` | Executive Sponsor hold action |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Approved Decision Record | `DecisionRecord` | `Approved` |
| Award determination | `DecisionRecord.selectedSupplier` | Immutable |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| BP11 cycle time | Calendar days from ConsolidatedEvaluationReportApproved to DecisionApproved |
| Override rate | Percentage of Decisions selecting a lower-ranked Supplier (monitor for governance drift) |
| Escalation rate | Percentage of Decisions held for Executive Sponsor escalation |
| Conflict of interest recusal rate | Number of Decision Board members recused per Tender |

---

## AI Guidance

AI may assist in BP11 by:
- Preparing the Decision Board briefing document from the Consolidated Evaluation Report
- Summarizing the key differentiating factors between top-ranked Suppliers
- Prominently flagging a proposed decision that selects a lower-ranked Supplier so the override rationale requirement is surfaced
- Generating a structured Decision Record draft from session inputs

AI must not:
- Make the award decision
- Approve the Decision Record
- Generate rationale that is not grounded in Evaluation data

---

## Anti-Patterns

- Making an award decision verbally before the formal Decision Record is created — creates an undocumented commitment.
- Approving a Decision Record with rationale that references factors outside the Evaluation Model — legally challengeable and a governance failure.
- Proceeding without reaching quorum after a Board member recusal — the Board must be reconstituted before proceeding.
- Conducting informal Supplier negotiations during the decision deliberation without following equal treatment process.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-015, GBR-016, GBR-017, GBR-001
- [BP10_Consolidation.md](./BP10_Consolidation.md) — Predecessor process
- [BP12_Contract_Handover.md](./BP12_Contract_Handover.md) — Next process (award)
- [BP13_Project_Closing.md](./BP13_Project_Closing.md) — Next process (cancel)
