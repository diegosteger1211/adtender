---
id: PKB-01-BP09
title: BP09 — Evaluation
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

# BP09 — Evaluation

## Purpose

This process performs the structured, individual scoring of Supplier Responses by assigned Evaluators. Each Evaluator independently assesses Supplier Responses against the configured Evaluation Model without visibility of other Evaluators' scores.

The output of BP09 is a set of completed, locked individual Evaluations ready for Consolidation in BP10.

---

## Business Context

Evaluation is the process that transforms Supplier Responses into comparable scores. The quality of the Evaluation determines the defensibility of the Decision.

Three principles govern this process:

1. **Independence:** Evaluators score independently. Peer scores are not visible during the individual evaluation phase (GBR-013). This prevents anchoring bias.
2. **Evidence-based scoring:** Scores must be grounded in the Supplier's actual Response content, not assumptions or market knowledge. The Requirement configuration defines what evidence is required; the Evaluator checks whether the Supplier provided it.
3. **Traceability:** Every score must have a rationale. Scores without rationale are rejected by the platform.

The Procurement Manager does not score. They govern the process, ensure equal treatment, and coordinate the assignment of Evaluators.

---

## Scope

**In scope:**
- Assigning Evaluators to Requirements and Supplier Responses
- Individual scoring of Supplier Responses per Requirement
- Applying Knock-out enforcement
- Recording score rationale and evidence references
- Managing Evaluator completion progress
- Locking individual Evaluations

**Out of scope:**
- Score aggregation and consolidation (BP10)
- Consensus discussions (BP10)
- Decision-making (BP11)

---

## Entry Criteria

- `EvaluationReadinessConfirmed` event from BP08
- All Supplier Responses in `Locked` state
- Evaluators assigned to the Tender (configured in BP06 or at this step)

---

## Exit Criteria

BP09 is complete when:

- All assigned Evaluators have completed scoring for all assigned Supplier Responses and Requirements
- All Evaluations are in `Locked` state
- All Knock-out determinations are recorded
- Score completeness check is passed (no required scores missing)
- Procurement Manager has confirmed consolidation readiness

---

## Actors

| Role | Responsibility in BP09 |
|---|---|
| Procurement Manager | Assigns Evaluators; monitors completion; enforces process integrity; confirms readiness |
| Evaluator | Independently scores Supplier Responses against Requirements within scope |
| Project Owner | Notified of completion; does not score |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Locked Supplier Responses | BP08 output | `Locked` |
| Evaluation Model | `Tender.evaluationModel` | Configured |
| Evaluator assignments | BP06 configuration | Confirmed |
| Requirements with response types and knock-out flags | BP04 output | `Approved` |

---

## Activities

### Activity 1 — Assign Evaluators to Requirement Groups

**Actor:** Procurement Manager  
**Command:** `AssignEvaluator`  
**Action:** Evaluators are assigned to specific Requirement groups within the Tender. The assignment defines:
- Which Evaluator is responsible for which Requirement group(s)
- Whether the assignment covers all Suppliers or a specific subset (only for very large Tenders that require split evaluation teams)

Each Evaluator must have a recorded and cleared conflict of interest declaration (from BP02). If a new conflict of interest is identified at this stage, the Evaluator must be replaced before the assignment is confirmed.

**Business rule enforced:** GBR-013 — Evaluators are scoped to their assignment; the platform must restrict score access accordingly.

**Events produced:** `EvaluatorAssigned` (per assignment)

---

### Activity 2 — Evaluator Reviews Tender Context

**Actor:** Evaluator  
**Action:** Before scoring, the Evaluator reviews:
- The Requirements in their assigned groups: content, acceptance expectations, knock-out flags
- The Evaluation Model: scoring scale, mandatory comment thresholds
- Evaluation guidance documents (if provided by the Procurement Manager)

This is preparation — not a formal process gate — but the platform should surface this review step to ensure Evaluators do not start scoring without reading the context.

---

### Activity 3 — Score Supplier Response per Requirement

**Actor:** Evaluator  
**Command:** `ScoreRequirement`  
**Action:** For each Requirement in the Evaluator's assigned group and for each Supplier Response, the Evaluator:

1. Reviews the Supplier's response to the specific Requirement (response text, answer values, attached evidence)
2. Assesses compliance against the Requirement's acceptance expectation
3. Assigns a score within the configured scoring scale
4. Records a score rationale (mandatory for all scores below a configurable threshold; mandatory for all Knock-out Requirements)
5. References specific evidence items where relevant

**Business rule enforced:** GBR-013 — the platform must not display other Evaluators' scores while an Evaluator's active session is open. Score visibility isolation is enforced at the data layer.

**Events produced:** `RequirementScored`

---

### Activity 4 — Apply Knock-out Enforcement

**Actor:** Evaluator (determination), Platform (enforcement)  
**Command:** `RecordKnockout`  
**Action:** When an Evaluator scores a Knock-out Requirement as non-fulfilled, the Knock-out is explicitly recorded:
- The Evaluator confirms the non-fulfillment with a written rationale
- The platform records the knock-out determination on the Supplier Response
- The Supplier Response is flagged as `KnockoutPending` — not finalized until BP10 review

**Business rule enforced:** GBR-014 — non-fulfillment of a Knock-out Requirement disqualifies the Supplier. This determination is reviewed in BP10 but cannot be informally overridden.

**Events produced:** `KnockoutDetermined`

---

### Activity 5 — Evaluator Submits Evaluation

**Actor:** Evaluator  
**Command:** `SubmitEvaluation`  
**Action:** When the Evaluator has scored all Requirements across all assigned Suppliers, they submit their Evaluation. Submission:
- Performs a completeness check (no missing scores in the Evaluator's scope)
- Sets the Evaluation to `Submitted` state
- Notifies the Procurement Manager

**Events produced:** `EvaluationSubmitted`

---

### Activity 6 — Monitor Evaluation Progress

**Actor:** Procurement Manager  
**Action:** The Procurement Manager monitors progress across all Evaluators:
- Which Evaluators have submitted
- Which Evaluators are approaching or past their due date
- Whether any Evaluator has flagged an issue or conflict of interest

If an Evaluator cannot complete their assignment, a replacement is assigned and the evaluation for that group is restarted with the new Evaluator.

---

### Activity 7 — Lock All Evaluations

**Actor:** Procurement Manager  
**Command:** `LockEvaluations`  
**Action:** After all Evaluators have submitted, the Procurement Manager locks all Evaluations. After locking, no further score changes are possible. All Evaluations become available for Consolidation.

**Events produced:** `EvaluationsLocked`

---

### Activity 8 — Confirm Consolidation Readiness

**Actor:** Procurement Manager  
**Command:** `ConfirmConsolidationReadiness`  
**Action:** The Procurement Manager verifies that:
- All Evaluator assignments are completed
- No scoring gaps exist
- All Knock-out determinations are recorded
- Consolidation may proceed

**Events produced:** `ConsolidationReadinessConfirmed`

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP09-BR-001 | An Evaluator must not be assigned to score a Supplier Response if they have an active conflict of interest declaration for that Supplier. |
| BP09-BR-002 | All Knock-out Requirement scores must include a written rationale regardless of the score value. |
| BP09-BR-003 | An Evaluation cannot be submitted if any required score within the Evaluator's assignment scope is missing. |
| BP09-BR-004 | An Evaluator may not view any other Evaluator's scores until all Evaluations are locked. |
| BP09-BR-005 | Score rationale is mandatory when the score falls below the configured mandatory-comment threshold (default: lowest 20% of the scoring scale). |
| GBR-013 | Evaluators cannot see each other's scores during the individual evaluation phase. |
| GBR-014 | Non-fulfillment of a Knock-out Requirement disqualifies the Supplier regardless of other scores. |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Business Object | Transition | Trigger |
|---|---|---|
| `Evaluation` | `NotStarted` (created by assignment) | `AssignEvaluator` |
| `Evaluation` | `NotStarted` → `InProgress` | First `ScoreRequirement` |
| `Evaluation` | `InProgress` → `Submitted` | `SubmitEvaluation` |
| `Evaluation` | `Submitted` → `Locked` | `LockEvaluations` |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `EvaluatorAssigned` | `AssignEvaluator` |
| `RequirementScored` | `ScoreRequirement` |
| `KnockoutDetermined` | `RecordKnockout` |
| `EvaluationSubmitted` | `SubmitEvaluation` |
| `EvaluationsLocked` | `LockEvaluations` |
| `ConsolidationReadinessConfirmed` | `ConfirmConsolidationReadiness` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Locked individual Evaluations | `Evaluation[]` | `Locked` |
| Individual scores per Requirement per Supplier | `Score[]` | Immutable |
| Knock-out determinations | `KnockoutDetermination[]` | Recorded |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| Evaluation cycle time | Calendar days from EvaluationReadinessConfirmed to EvaluationsLocked |
| Evaluator on-time completion rate | Percentage of Evaluators completing within the scheduled period |
| Score rationale coverage | Percentage of required scores with written rationale |
| Knock-out rate | Number of Suppliers triggering knock-out per Tender |

---

## AI Guidance

AI may assist in BP09 by:
- Highlighting evidence items in Supplier Responses that are directly relevant to each Requirement being scored
- Summarizing the Supplier's response to a Requirement as a reading aid (clearly labelled as AI-generated; not a score input)
- Flagging Supplier Responses that appear to contain no substantive content for a Requirement
- Detecting statistical outlier scores after lock and surfacing them to the Procurement Manager for BP10 anomaly review

AI must not:
- Score Requirements
- Determine knock-out eligibility
- Pre-fill scores or rationale fields

All AI reading aids are clearly distinguished from the Supplier's actual response content (ADR-005 transparency requirement).

---

## Anti-Patterns

- Sharing evaluation progress or partial scores between Evaluators before lock — violates GBR-013 and introduces anchoring bias.
- Accepting Evaluations with missing rationale on low scores — produces a legally indefensible result.
- Assigning one Evaluator to all groups in large Tenders — creates single-point-of-failure and eliminates the value of independent perspectives.
- Scoring from market knowledge rather than Response evidence — produces a biased evaluation that cannot be defended.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-013, GBR-014, GBR-001
- [BP08_Supplier_Collaboration.md](./BP08_Supplier_Collaboration.md) — Predecessor process
- [BP10_Consolidation.md](./BP10_Consolidation.md) — Next process
