---
id: PKB-04-007
title: Evaluation Workspace — adtender UI Specification
version: 1.0
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Frontend Developer
  - Product Manager
  - AI Development Agent
depends_on:
  - PKB-04-003
  - PKB-02-005
tags:
  - ui
  - workspace
  - evaluation
  - scoring
---

# Evaluation Workspace — adtender UI Specification

---

## 1. Purpose

The Evaluation Workspace is where Evaluators score supplier responses and where Procurement Managers oversee the evaluation process. It is the most analytically intensive workspace in adtender.

The workspace enforces two critical invariants:
- **Blind scoring**: An Evaluator cannot see other Evaluators' scores until all Evaluations are Locked (GBR-013)
- **Version fidelity**: All scores reference the RequirementVersionId frozen at Tender publication (GBR-010)

---

## 2. Target Users

| Role | View | Primary Use |
|---|---|---|
| Evaluator | Individual Evaluation view | Score supplier responses per requirement |
| Procurement Manager | Oversight view | Monitor progress; lock evaluations; manage assignments |
| Evaluation Lead | Consolidated view | Review all scores; generate report |

---

## 3. Navigation Entry

Accessed from the Evaluation tab within a Tender:
`/projects/:projectId/tenders/:tenderId/evaluation`

Individual evaluation: `/projects/:projectId/tenders/:tenderId/evaluation/:evaluationId`

---

## 4. Evaluation Overview (Procurement Manager View)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← IT Security Suite Evaluation  ›  Evaluation                 │
│  Evaluation Phase  ·  Deadline: 22 Jul 2024                     │
│  [Lock All Evaluations]  [Assign Evaluators ▾]                  │
├──────────────────────────────────────────────────────────────────┤
│  [Overview] [Evaluators] [Consolidated] [History]               │
├──────────────────────────────────────────────────────────────────┤
│  EVALUATION PROGRESS                                             │
│                                                                  │
│  Total evaluations: 15  (5 suppliers × 3 evaluators)            │
│  Submitted: 9  ·  In progress: 5  ·  Not started: 1            │
│  Progress: ██████████████░░░░░░░░  60%                          │
│                                                                  │
│  EVALUATOR SUMMARY                                               │
│  Evaluator       Assigned  Submitted  Last Active  Status       │
│  ─────────────────────────────────────────────────────────────── │
│  Anna Schmidt    5 / 5     4 / 5      Today        ● InProgress │
│  Thomas Becker   5 / 5     3 / 5      Yesterday    ● InProgress │
│  Sarah Müller    5 / 5     2 / 5      3 days ago   ● InProgress │
│                                                                  │
│  ⚠ Sarah Müller has not submitted 3 evaluations.               │
│  Deadline in 5 days.  [Send reminder]                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Individual Evaluation View (Evaluator)

The Evaluator sees their own assigned evaluations only. They cannot see other evaluators' scores.

```
┌──────────────────────────────────────────────────────────────────┐
│  My Evaluations — IT Security Suite                             │
│  Assigned to me: 5  ·  Submitted: 4  ·  Remaining: 1           │
├──────────────────────────────────────────────────────────────────┤
│  SELECT SUPPLIER TO EVALUATE                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Acme     │  │TechSol.  │  │CyberSh.  │  │DataSafe  │        │
│  │ ✅ Done  │  │✅ Done   │  │✅ Done   │  │✅ Done   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐                                                    │
│  │SecureCo  │                                                    │
│  │ 🔄 4/12  │  ← Currently scoring                             │
│  └──────────┘                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Scoring Interface (Evaluator — per Supplier)

This is the core evaluation screen. One supplier at a time, all requirements scrollable.

```
┌──────────────────────────────────────────────────────────────────┐
│  Evaluating: SecureCo  (Tender: IT Security Suite)              │
│  4 of 12 requirements scored  ████░░░░░░░░░░  33%              │
│  [Save Progress]                    [Submit Evaluation]          │
├──────────────────────────────────────────────────────────────────┤
│  ← REQ-0042  Data Encryption at Rest        [4/12]  REQ-0043 →  │
├──────────────────────────────────────────────────────────────────┤
│  REQUIREMENT                                                     │
│  REQ-0042 (v2.0)  ·  Category: Security  ·  Priority: Critical  │
│  Weight: 15%                                                     │
│  ───────────────────────────────────────────────────────────    │
│  "All data stored by the system must be encrypted using          │
│   AES-256 or stronger. Key management must comply with          │
│   NIST guidelines."                                              │
│  Acceptance Criteria:                                            │
│  • AES-256 minimum                                              │
│  • NIST-compliant key rotation                                  │
│  • Encryption applies to all storage tiers                      │
├──────────────────────────────────────────────────────────────────┤
│  SUPPLIER RESPONSE — SecureCo                                    │
│  Compliance: ● Compliant                                        │
│  ───────────────────────────────────────────────────────────    │
│  "SecureCo implements AES-256-GCM for all data at rest.         │
│   Key management follows NIST SP 800-57. We use HSM-backed      │
│   key storage with automated 90-day rotation..."                │
│  Attachments: [ISO-27001.pdf] [EncryptionPolicy.pdf]            │
├──────────────────────────────────────────────────────────────────┤
│  MY SCORE                                                        │
│  Score:  [1] [2] [3] [4] [●5] [6] [7] [8] [9] [10]            │
│                   ↑ click or keyboard 1-9, 0 for 10             │
│  Rationale (required for scores ≤ 3 or ≥ 9):                   │
│  [Full compliance demonstrated with HSM-backed key storage...]  │
│                                                                  │
│  ✦ AI Suggestion:  Score: 9/10  ·  "Response fully addresses    │
│    AES-256 and NIST requirements. Minor gap: no mention of      │
│    encryption in transit."  [Accept] [Dismiss]                  │
├──────────────────────────────────────────────────────────────────┤
│  [◀ Previous]                    [Score & Next ▶]               │
└──────────────────────────────────────────────────────────────────┘
```

### Scoring Controls

- **Score selector**: 1–10 buttons (or numeric keys 1–9, 0=10). Immediate selection.
- **Rationale**: Rich text. Required when score is ≤3 or ≥9 (extreme scores need justification).
- **Navigation**: Previous / Next requirement. Score auto-saves on navigation.
- **AI Suggestion**: AI-generated score and rationale. Always a suggestion; evaluator can Accept (pre-fills score + rationale), Edit, or Dismiss.

**Blind scoring enforcement**: The AI suggestion is drawn from the requirement's acceptance criteria + supplier response content only. It never references other evaluators' scores. The interface shows no scores from other evaluators.

---

## 7. Scoring Progress Sidebar

A collapsible sidebar showing the evaluator's progress across all 12 requirements for the current supplier.

```
Requirements (12)
─────────────────────
✅ REQ-0042  8/10
✅ REQ-0043  7/10
✅ REQ-0044  6/10
✅ REQ-0045  9/10
🔄 REQ-0046  ← current
⬜ REQ-0047
⬜ REQ-0048
...
─────────────────────
Scored: 4/12  Avg: 7.5
```

Color codes: green (scored), orange (current), gray (not yet scored).

---

## 8. Submit Evaluation

When all requirements are scored, the Submit button becomes active.

```
Submit Evaluation                              [✕]
────────────────────────────────────────────────
Supplier: SecureCo
Requirements scored: 12 / 12
Average score: 7.8 / 10

Overall Comment (optional):
[SecureCo demonstrates strong encryption practices...]

────────────────────────────────────────────────
By submitting, you confirm that these scores
represent your independent assessment.
Your scores are final after submission.

[Cancel]                    [Submit Evaluation]
```

After submission: the evaluation is read-only for the evaluator. They can still view but not edit.

---

## 9. Consolidated View (Evaluation Lead / Procurement Manager)

Only available after all evaluations are locked. Reveals all evaluator scores side-by-side.

```
┌──────────────────────────────────────────────────────────────────┐
│  Consolidated Evaluation — IT Security Suite                    │
│  ● Computing  →  [Generate Report]  (appears when complete)     │
├──────────────────────────────────────────────────────────────────┤
│  SUPPLIER COMPARISON                                             │
│                        Acme  TechS.  CyberS.  DataS.  SecureCo  │
│  ──────────────────────────────────────────────────────────────  │
│  REQ-0042 (w: 15%)      8      7       6        5        9      │
│  REQ-0043 (w: 12%)      7      8       7        6        7      │
│  REQ-0044 (w: 10%)      9      6       8        7        8      │
│  ...                                                             │
│  ──────────────────────────────────────────────────────────────  │
│  TOTAL SCORE           81%    73%     69%      62%      85%     │
│  RANK                   2      3       4        5        1      │
│                                                                  │
│  ✦ AI Insight: SecureCo leads overall. Acme Systems is strong   │
│    on Compliance (avg 8.7) but weaker on Integration (avg 5.2). │
│    [View full AI analysis]                                       │
└──────────────────────────────────────────────────────────────────┘
```

### Consolidated View Features

- **Color heatmap**: Score cells are color-coded (red–amber–green) for at-a-glance comparison
- **Row detail**: Click any row to expand and see per-evaluator breakdown
- **Per-evaluator tab**: Switch between "Aggregated" and individual evaluator views
- **Score revision**: If a score error is found, "Revise Score" is available (resets to Computing state per EVL-BR-011)
- **AI Analysis**: Full AI comparison summary per supplier, per requirement category, per evaluation dimension

---

## 10. Evaluation Report Generation

```
┌──────────────────────────────────────────────────────────────────┐
│  Generate Consolidated Evaluation Report                         │
│                                                                  │
│  Report format:                                                  │
│  ○ Executive Summary only                                       │
│  ● Full Report (all scores + analysis)                          │
│  ○ Decision Board Format (formatted for management review)      │
│                                                                  │
│  Include AI analysis:    [✅ Yes]                               │
│  Include score rationale: [✅ Yes]                              │
│  Anonymize evaluators:   [☐ No]                                 │
│                                                                  │
│  ✦ AI will generate an executive summary from the scores.       │
│    You can edit before finalizing.                               │
│                                                                  │
│  [Cancel]                          [Generate Report]            │
└──────────────────────────────────────────────────────────────────┘
```

Generated report is stored as a ConsolidatedEvaluation record. It must be approved before the Decision phase opens.

---

## 11. Score Revision Flow

If a scoring error is found post-lock:

1. Evaluation Lead clicks "Revise Score" on a score cell
2. Dialog explains: "Revising a score will reset the Consolidated Evaluation to Computing state. The report must be regenerated."
3. Confirmation required
4. Target evaluator receives notification to revise their score
5. ConsolidatedEvaluation recomputes after re-submission

---

## 12. AI Assistant Integration (Evaluation)

| Feature | Trigger | Behavior |
|---|---|---|
| Score suggestion | Scoring interface | Per-requirement score + rationale suggestion |
| Response summary | Score assistance | Summarizes supplier response in 2 sentences |
| Scoring anomaly | Consolidated view | Highlights outlier evaluator scores |
| Evaluator consistency | Consolidated view | "Evaluator 2's scores are 2.3 points lower on average — potential calibration issue" |
| Supplier comparison | Consolidated view | Strengths/weaknesses narrative per supplier |
| Executive briefing | Report generation | Auto-draft of executive summary |

---

## 13. Keyboard Shortcuts (Evaluation Workspace)

| Shortcut | Action |
|---|---|
| `1–9, 0` | Score current requirement (1–9, 0=10) |
| `→` or `N` | Score and go to next requirement |
| `←` or `P` | Go to previous requirement |
| `R` | Open rationale text field |
| `A` | Accept AI suggestion |
| `D` | Dismiss AI suggestion |
| `S` | Save progress |
| `Shift + S` | Submit evaluation (with confirmation) |
| `C` | Toggle progress sidebar |

---

## 14. Bulk Actions (Evaluation Overview)

| Action | Available to | Condition |
|---|---|---|
| Send reminder | Procurement Manager | Evaluator with overdue submissions |
| Lock all evaluations | Procurement Manager | All evaluations Submitted |
| Reassign evaluator | Procurement Manager | Evaluator unable to complete |
| Export scoring matrix | Evaluation Lead | Any state |

---

## 15. Export Functions

| Export | Contents |
|---|---|
| Scoring Matrix (XLSX) | All scores per evaluator, per supplier, per requirement |
| Consolidated Report (PDF) | Full formatted report for Decision Board |
| Executive Summary (PDF) | 1–2 page management summary |
| Evaluation Audit Trail (PDF) | Complete history of scoring events |

---

## 16. Permissions

| Action | Role | Condition |
|---|---|---|
| View evaluation overview | Procurement Manager | Own tender |
| Score requirements | Evaluator | Assigned evaluation; before lock |
| View others' scores | — | Prohibited until all locked (GBR-013) |
| Lock evaluations | Procurement Manager | All evaluations Submitted |
| Revise score | Evaluation Lead | Post-lock; with confirmation |
| Generate report | Evaluation Lead, Procurement Manager | All scores computed |
| Approve report | Procurement Manager | Report in Draft state |

---

## References

- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003
- [`Decision_Workspace.md`](./Decision_Workspace.md) — PKB-04-008 — Next phase
- [`Evaluation.md`](../02_Domain_Model/Evaluation.md) — PKB-02-005 — Domain model
- [`Business_Object_Lifecycle.md`](../02_Domain_Model/Business_Object_Lifecycle.md) — GBR-013 blind scoring rule
