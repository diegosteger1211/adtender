---
id: PKB-01-BP10
title: BP10 — Consolidation
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

# BP10 — Consolidation

## Purpose

This process aggregates individual Evaluator scores into a consolidated ranking, resolves scoring anomalies through structured discussion, finalizes Knock-out determinations, and produces the Consolidated Evaluation Report that supports the Decision in BP11.

The output of BP10 is an approved Consolidated Evaluation Report showing a ranked Supplier list with supporting rationale — ready for the Decision Board.

---

## Business Context

BP09 produces independent scores per Evaluator. BP10 brings those scores together, validates consistency, addresses anomalies, and produces a single defensible consolidated result.

Consolidation is not a majority vote that erases minority opinions. It is a structured process to understand divergences, document them, and produce an honest aggregate that the Decision Board can interrogate.

Divergence in Evaluator scores is not a failure — it is information. Large divergences indicate Requirements that are interpreted differently, evidence that is ambiguous, or genuine differences in stakeholder priority. These must be documented, not smoothed over.

The Procurement Manager facilitates consolidation but does not score. Their role is process integrity.

---

## Scope

**In scope:**
- Revealing all individual scores after lock
- Score aggregation using the configured Evaluation Model weights
- Anomaly detection and structured discussion of large scoring divergences
- Knock-out determination review and finalization
- Consolidated Ranking production
- Consolidated Evaluation Report creation and approval

**Out of scope:**
- Individual scoring (BP09)
- Final award decision (BP11)
- Supplier notifications (BP12)

---

## Entry Criteria

- `ConsolidationReadinessConfirmed` event from BP09
- All Evaluations in `Locked` state

---

## Exit Criteria

BP10 is complete when:

- Knock-out determinations are finalized
- All scoring anomalies have been reviewed and documented
- Consolidated Ranking is calculated and approved
- Consolidated Evaluation Report is generated and approved by the Project Owner

---

## Actors

| Role | Responsibility in BP10 |
|---|---|
| Procurement Manager | Facilitates consolidation; runs anomaly detection; governs the process; approves report |
| Evaluator | Participates in anomaly discussion; may revise a score with documented justification |
| Project Owner | Approves the Consolidated Evaluation Report |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Locked individual Evaluations | BP09 output | `Locked` |
| Knock-out determinations | BP09 | Recorded |
| Evaluation Model | `Tender.evaluationModel` | Configured |

---

## Activities

### Activity 1 — Reveal Individual Scores

**Actor:** Procurement Manager  
**Command:** `RevealScores`  
**Action:** After all Evaluations are locked, individual scores are revealed to all Evaluators and the Procurement Manager simultaneously. Before this point, no Evaluator had visibility of any other Evaluator's scores (GBR-013).

**Events produced:** `ScoresRevealed`

---

### Activity 2 — Finalize Knock-out Determinations

**Actor:** Procurement Manager, Evaluators  
**Command:** `FinalizeKnockout`  
**Action:** Each Knock-out determination from BP09 is reviewed in the consolidation session:

1. The Evaluator who determined the knock-out presents their rationale
2. Other Evaluators who scored the same Requirement for the same Supplier confirm or raise concerns
3. The Procurement Manager reviews for process compliance
4. If confirmed: the Supplier is formally excluded from further Evaluation

**Override handling:** A Knock-out may only be overridden if the Evaluator identifies a scoring error (evidence was reviewed incorrectly). An override requires a formal exception request with documented justification and Project Owner approval.

**Business rule enforced:** GBR-014 — Knock-out determinations cannot be informally overridden.

**Events produced:** `KnockoutFinalized`, `KnockoutOverrideApproved` (if exception granted)

---

### Activity 3 — Anomaly Detection and Review

**Actor:** Platform (detection), Procurement Manager (facilitation), Evaluators (discussion)  
**Action:** The platform automatically identifies statistical anomalies in the score set:

| Anomaly Type | Definition |
|---|---|
| High divergence | A Supplier–Requirement score deviates by more than a configurable threshold from the Evaluator group average |
| Consistent outlier | One Evaluator's scores for all Requirements are systematically above or below peers |
| Reversed ranking | Two Evaluators rank two Suppliers in opposite order across a majority of Requirements |

For each anomaly, the Procurement Manager initiates a structured discussion:
1. Each Evaluator presents their scoring reasoning for the flagged item
2. The group identifies whether divergence stems from different evidence interpretation or genuine priority difference
3. An Evaluator may revise their score after discussion — but only with a written explanation referencing new evidence or corrected reasoning

Revisions that chase the group average without substantive justification are recorded and flagged.

**Events produced:** `AnomalyDetected`, `ScoreRevisedAfterDiscussion` (per revision)

---

### Activity 4 — Calculate Consolidated Scores

**Actor:** Platform (calculation), Procurement Manager (review)  
**Action:** Using the Evaluation Model's defined aggregation method, consolidated scores are calculated per Supplier:

1. For each Requirement: aggregate individual scores using the configured method (average, weighted average, or median)
2. For each group: apply group weight to produce a weighted group score
3. Across all groups: sum weighted group scores to produce the overall Tender score per Supplier
4. Exclude Suppliers with confirmed Knock-out determinations from the ranking

The calculation is executed by the platform. Manual overrides to calculated scores are not permitted (BP10-BR-001).

**Events produced:** `ConsolidatedScoresCalculated`

---

### Activity 5 — Generate Consolidated Ranking

**Actor:** Platform (automated), Procurement Manager (review)  
**Command:** `GenerateConsolidatedRanking`  
**Action:** The Consolidated Ranking is produced:
- Rank position (1 = highest score)
- Supplier identifier (anonymized or named per Tender configuration)
- Total consolidated score
- Score breakdown per Requirement group
- Knock-out exclusions with rationale
- Anomalies identified and their resolution

**Events produced:** `ConsolidatedRankingGenerated`

---

### Activity 6 — Generate Consolidated Evaluation Report

**Actor:** Procurement Manager  
**Command:** `GenerateConsolidatedEvaluationReport`  
**Action:** The report is generated from structured Evaluation data and contains:
- Tender summary and timeline
- Participating Supplier list (with knock-out exclusions)
- Evaluation Model summary (scoring method, weights)
- Consolidated Ranking with score details
- Anomaly documentation and resolutions
- Individual Evaluator score tables
- Knock-out determination details

This report is the primary input to the Decision Board in BP11.

**Events produced:** `ConsolidatedEvaluationReportGenerated`

---

### Activity 7 — Approve Consolidated Evaluation Report

**Actor:** Project Owner  
**Command:** `ApproveConsolidatedEvaluationReport`  
**Action:** The Project Owner reviews the report. Approval confirms that the process was followed correctly, Knock-out determinations are justified, and the report is complete and ready for the Decision Board.

**Events produced:** `ConsolidatedEvaluationReportApproved`

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP10-BR-001 | Consolidated scores must be calculated by the platform using the configured Evaluation Model. Manual overrides to calculated scores are not permitted. |
| BP10-BR-002 | Score revisions after anomaly discussion must include a written justification. Revisions without justification are rejected by the platform. |
| BP10-BR-003 | A Knock-out determination can only be overridden with documented justification and Project Owner approval. |
| BP10-BR-004 | All Knock-out excluded Suppliers must appear in the Consolidated Evaluation Report with their exclusion rationale, even though they do not appear in the ranking. |
| BP10-BR-005 | The Consolidated Evaluation Report must be approved before BP11 (Decision) can begin. |
| GBR-013 | Score visibility is only enabled after all Evaluations are locked. |
| GBR-014 | Non-fulfillment of a Knock-out Requirement disqualifies the Supplier. |
| GBR-015 | The Decision must be based on the Consolidated Evaluation Report. |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Business Object | Transition | Trigger |
|---|---|---|
| `ConsolidatedEvaluationReport` | Created (`Draft`) | `GenerateConsolidatedEvaluationReport` |
| `ConsolidatedEvaluationReport` | `Draft` → `Approved` | `ApproveConsolidatedEvaluationReport` |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `ScoresRevealed` | `RevealScores` |
| `KnockoutFinalized` | `FinalizeKnockout` |
| `KnockoutOverrideApproved` | `ApproveKnockoutOverride` (if applicable) |
| `AnomalyDetected` | Platform analysis |
| `ScoreRevisedAfterDiscussion` | Score revision during anomaly review |
| `ConsolidatedScoresCalculated` | Score aggregation |
| `ConsolidatedRankingGenerated` | `GenerateConsolidatedRanking` |
| `ConsolidatedEvaluationReportGenerated` | `GenerateConsolidatedEvaluationReport` |
| `ConsolidatedEvaluationReportApproved` | `ApproveConsolidatedEvaluationReport` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Consolidated Ranking | `ConsolidatedRanking` | Calculated |
| Consolidated Evaluation Report | Document | `Approved` |
| Finalized Knock-out records | `KnockoutDetermination[]` | Finalized |
| Anomaly discussion records | `AnomalyRecord[]` | Documented |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| BP10 cycle time | Calendar days from ConsolidationReadinessConfirmed to ConsolidatedEvaluationReportApproved |
| Anomaly rate | Percentage of Requirement–Supplier score pairs triggering anomaly detection |
| Score revision rate | Percentage of scores revised after anomaly discussion |
| Knock-out override rate | Percentage of BP09 knock-outs that were overridden (should be near zero) |

---

## AI Guidance

AI may assist in BP10 by:
- Automatically running anomaly detection against all scores and presenting a ranked anomaly list
- Generating the Consolidated Evaluation Report draft from structured Evaluation data
- Producing scoring summary tables and score distribution visualizations for the consolidation review session
- Identifying Suppliers whose scores are within a configurable margin of each other (rank-sensitive analysis)

AI must not:
- Revise scores
- Override Knock-out determinations
- Approve the Consolidated Evaluation Report

---

## Anti-Patterns

- Running consolidation informally without structured anomaly discussion — produces a report that cannot explain score divergences.
- Allowing score revisions to match the group average without written justification — eliminates the value of independent scoring.
- Excluding Knock-out Suppliers without formal finalization — leaves the exclusion undocumented and legally challengeable.
- Approving a Consolidated Evaluation Report without individual score details — makes the Decision untraceable.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-013, GBR-014, GBR-015, GBR-001
- [BP09_Evaluation.md](./BP09_Evaluation.md) — Predecessor process
- [BP11_Decision.md](./BP11_Decision.md) — Next process
