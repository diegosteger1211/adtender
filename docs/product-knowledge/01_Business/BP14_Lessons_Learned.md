---
id: PKB-01-BP14
title: BP14 — Lessons Learned
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

# BP14 — Lessons Learned

## Purpose

This process captures structured learning from a completed project — what worked, what did not, and what should be done differently next time — and converts that learning into actionable improvement proposals for the organizational Knowledge Base.

The output of BP14 is a completed Lessons Learned Record and a set of validated Improvement Proposals submitted to BP15 (Knowledge Management) for library contribution.

---

## Business Context

BP14 is the mechanism that closes the Knowledge Flywheel. Without it, each project starts from the same baseline. With it, every project makes the organization measurably smarter.

Lessons Learned is not a retrospective ceremony that produces a document no one reads. It is a structured process that produces:
- Specific improvement proposals for the Requirement Library
- Documented process deviations and their root causes
- Project experience data that enriches Knowledge Assets

The quality of BP14 output directly determines the quality of BP05 library improvements. Vague lessons ("communication was poor") produce nothing reusable. Specific lessons ("Requirement group X was too granular — 47 Requirements should be consolidated into 12") produce actionable library changes.

BP14 is mandatory for all projects (GBR-018). Its output feeds BP15.

---

## Scope

**In scope:**
- Structured Lessons Learned session facilitation
- Requirement quality retrospective (which Requirements worked well; which were poorly specified)
- Process deviation review (where the procurement process deviated from expected flow)
- Evaluation quality review (scoring anomaly analysis, knock-out review)
- Improvement proposal creation (Requirement-level, process-level, template-level)
- Lessons Learned Record finalization and approval

**Out of scope:**
- Library contribution governance (BP05)
- Knowledge Asset creation (BP15)
- Project archiving (BP13)

---

## Entry Criteria

- `LessonsLearnedInitiated` event from BP13
- Project in `Closed` state
- Key participants available: Project Manager, Project Owner, Procurement Manager, at least two Requirement Engineers and/or Evaluators

---

## Exit Criteria

BP14 is complete when:

- Lessons Learned session held with documented participants
- Requirement quality retrospective completed
- Process deviation analysis completed
- Improvement proposals created and classified
- Lessons Learned Record approved by Project Owner
- Improvement proposals submitted to BP15

---

## Actors

| Role | Responsibility in BP14 |
|---|---|
| Project Manager | Facilitates the Lessons Learned session; owns the Lessons Learned Record |
| Project Owner | Approves the Lessons Learned Record; validates improvement proposals |
| Procurement Manager | Contributes process deviation analysis; reviews compliance learnings |
| Requirement Engineers | Contribute Requirement quality retrospective; propose library improvements |
| Evaluators | Contribute evaluation quality retrospective |
| Library Manager | Consulted on improvement proposal feasibility; not a primary participant |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Closed project record | BP13 output | `Closed` |
| Project archive record | BP13 | Created |
| All approved Requirements from the project | BP04 | `Approved` |
| Evaluation data | BP09/BP10 | `Locked` / `Approved` |
| Scoring anomaly records | BP10 | Documented |
| Knock-out determination records | BP09/BP10 | Finalized |

---

## Activities

### Activity 1 — Prepare for Lessons Learned Session

**Actor:** Project Manager  
**Action:** The Project Manager prepares the session:
- Pulls project metrics from the platform: number of Requirements created vs. reused from library, scoring anomaly count, evaluation cycle time, knock-out rate
- Prepares a Requirements quality analysis: which Requirements had high review iteration counts (candidates for improvement)
- Prepares a process deviation log: where did the actual process deviate from the expected flow?
- Invites participants and distributes pre-reading

---

### Activity 2 — Requirement Quality Retrospective

**Actor:** Requirement Engineers, Domain Experts, Project Manager  
**Command:** `RecordRequirementLesson` (per lesson)  
**Action:** For each identified Requirement quality issue:

**Questions to answer:**
- Which Requirements generated the most Supplier clarification questions? (indicates ambiguity)
- Which Requirements produced the highest scoring divergence between Evaluators? (indicates unclear acceptance criteria)
- Which Requirements were adapted in ways that suggest the library version was incomplete?
- Were there Requirements that should have been Knock-out but were not?
- Were there Requirements that were designated Knock-out unnecessarily?

Each lesson is recorded with:
- Affected Requirement reference (or library source)
- Problem description
- Proposed improvement (specific wording change, structural change, new field)
- Improvement type: `RequirementWording` / `AcceptanceCriteria` / `ResponseType` / `KnockoutDesignation` / `NewLibraryRequirement`

**Events produced:** `RequirementLessonRecorded` (per lesson)

---

### Activity 3 — Process Deviation Review

**Actor:** Project Manager, Procurement Manager  
**Command:** `RecordProcessDeviation` (per deviation)  
**Action:** Any deviation from the standard process is reviewed:
- Was the deviation intentional and justified?
- Was the deviation a consequence of a process gap (the standard process did not fit the situation)?
- Was the deviation a mistake that should not recur?

Each deviation is recorded with its root cause and a recommendation:
- `ConfigurationChange`: the platform configuration should be updated
- `ProcessGuidanceUpdate`: the process documentation should be clarified
- `ExceptionAccepted`: the deviation was correct and should be allowed as a standard exception
- `CorrectiveMeasure`: the deviation was a mistake; document how to prevent recurrence

**Events produced:** `ProcessDeviationRecorded`

---

### Activity 4 — Evaluation Quality Review

**Actor:** Project Manager, Procurement Manager  
**Action:** Review the evaluation data for learnings:
- Were scoring criteria clear enough for consistent evaluation? (evidenced by anomaly rate)
- Were there systematic differences between Evaluator groups that suggest calibration needs?
- Did the Evaluation Model weights reflect the business priorities accurately?
- Were there Knock-out Requirements that should not have been, or vice versa?

Learnings are recorded as Requirement-level improvement proposals (via Activity 2) or Evaluation Model template improvement proposals.

---

### Activity 5 — Create Improvement Proposals

**Actor:** Project Manager, Requirement Engineers  
**Command:** `CreateImprovementProposal`  
**Action:** Each validated learning is converted into a structured Improvement Proposal:
- Type: `RequirementImprovement` / `NewLibraryRequirement` / `TemplateImprovement` / `ProcessImprovement`
- Source: reference to the lesson that generated this proposal
- Proposal content: specific proposed change with before/after comparison where applicable
- Business justification: why this change would benefit future projects
- Priority: `High` / `Medium` / `Low`

**Events produced:** `ImprovementProposalCreated`

---

### Activity 6 — Finalize and Approve Lessons Learned Record

**Actor:** Project Owner  
**Command:** `ApproveLessonsLearnedRecord`  
**Action:** The Project Owner reviews the complete Lessons Learned Record:
- Session summary
- All Requirement lessons
- All process deviations
- All Improvement Proposals

The Project Owner approves the record, making it final.

**Events produced:** `LessonsLearnedRecordApproved`

---

### Activity 7 — Submit Improvement Proposals to Knowledge Management

**Actor:** Project Manager  
**Command:** `SubmitImprovementProposals`  
**Action:** All improvement proposals are formally submitted to BP15 (Knowledge Management) for library contribution governance. Each proposal is assigned to the relevant Library Manager or Process Owner for review.

**Events produced:** `ImprovementProposalsSubmitted`

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP14-BR-001 | The Lessons Learned session must be held within 30 calendar days of project closing. |
| BP14-BR-002 | At minimum, the Requirement quality retrospective and the process deviation review must be completed. Sessions that only produce a general narrative without structured lessons are insufficient. |
| BP14-BR-003 | Improvement proposals must reference the specific Requirement or process element they propose to improve. Generic improvement proposals (e.g., "improve communication") are rejected. |
| BP14-BR-004 | The Lessons Learned Record must be approved by the Project Owner before improvement proposals are submitted to BP15. |
| GBR-018 | Lessons Learned is mandatory for all closed projects. |
| GBR-001 | All actions are auditable. |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `RequirementLessonRecorded` | `RecordRequirementLesson` |
| `ProcessDeviationRecorded` | `RecordProcessDeviation` |
| `ImprovementProposalCreated` | `CreateImprovementProposal` |
| `LessonsLearnedRecordApproved` | `ApproveLessonsLearnedRecord` |
| `ImprovementProposalsSubmitted` | `SubmitImprovementProposals` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Approved Lessons Learned Record | `LessonsLearnedRecord` | `Approved` |
| Improvement Proposals | `ImprovementProposal[]` | `Submitted` to BP15 |
| Process deviation records | `ProcessDeviation[]` | Documented |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| Lessons Learned completion rate | Percentage of closed projects completing BP14 within 30 days of closing |
| Improvement proposals per project | Average number of structured proposals generated per project |
| Proposal acceptance rate | Percentage of submitted proposals accepted by the Library Manager (BP05) |
| Library contribution rate | Percentage of proposals resulting in a new or improved published library Requirement |

---

## AI Guidance

AI may assist in BP14 by:
- Automatically generating the session preparation report: Requirements with high clarification request counts, anomaly rates, revision rates, knock-out statistics
- Identifying Requirements with low reuse rates (candidates for improvement or deprecation)
- Detecting patterns across multiple projects — if the same Requirement generates clarification questions in 3+ projects, that is a systemic quality signal
- Drafting structured improvement proposals from the session notes

AI must not:
- Create Improvement Proposals without human review
- Submit proposals to BP15 without Project Manager command
- Approve the Lessons Learned Record

---

## Anti-Patterns

- Holding a Lessons Learned session without a structured agenda — produces narrative notes that cannot be converted to improvement proposals.
- Recording improvements as general process observations rather than specific Requirement or template changes — makes the output unactionable.
- Skipping the evaluation quality review because the project was successful — the most valuable learnings often come from anomalies in successful projects.
- Submitting improvement proposals without referencing the specific lesson that generated them — Library Managers cannot evaluate proposals without project context.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-018, GBR-001
- [BP05_Library_Management.md](./BP05_Library_Management.md) — Receives library improvement proposals
- [BP13_Project_Closing.md](./BP13_Project_Closing.md) — Predecessor process
- [BP15_Knowledge_Management.md](./BP15_Knowledge_Management.md) — Receives all improvement proposals
