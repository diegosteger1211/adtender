---
id: PKB-04-013
title: Requirement Evaluation Matrix — adtender UI Specification
version: 1.0
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Frontend Developer
  - Product Manager
  - Evaluator
  - AI Development Agent
depends_on:
  - PKB-04-003
  - PKB-04-007
  - PKB-02-005
  - PKB-02-001
tags:
  - ui
  - evaluation
  - matrix
  - requirements
  - comparison
---

# Requirement Evaluation Matrix — adtender UI Specification

---

## 1. Purpose

The Requirement Evaluation Matrix is the central analytical view of the adtender Evaluation Workspace. It presents all suppliers as columns and all requirements as rows in a single, scrollable comparison grid.

The Matrix answers two questions simultaneously:
- **Completeness**: Which cells are still missing scores? (evaluation gaps)
- **Quality**: How do suppliers compare on each requirement? (decision support)

This is the primary tool for Evaluation Leads and Procurement Managers to understand the overall evaluation state. It is also available to Evaluators for their own in-progress scoring.

---

## 2. Target Users

| Role | View Mode | Primary Use |
|---|---|---|
| Evaluation Lead | Full view (all evaluators aggregated) | Monitor completeness; generate consolidated view |
| Procurement Manager | Full view | Oversee evaluation; identify gaps; trigger reminders |
| Evaluator | Filtered view (own scores only) | Progress overview before submitting |
| Decision Board Member | Read-only post-lock | Review scores as part of decision preparation |

---

## 3. User Goals

- See at a glance which supplier/requirement combinations are complete, incomplete, or at risk
- Identify which requirements are most differentiating (large score variance between suppliers)
- Navigate directly from a matrix cell to the detailed evaluation record
- Compare suppliers side-by-side on any requirement category
- Export the matrix for decision board materials

---

## 4. Navigation Entry

Accessed from the **Evaluation tab** within a Tender, via a view toggle:

```
Evaluation  →  [Evaluator View ▾]  [Matrix View ▾]  ← toggle
```

URL: `/projects/:projectId/tenders/:tenderId/evaluation?view=matrix`

The Matrix view replaces the Evaluator list view when selected. State is persisted per user.

---

## 5. Layout Concept

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  Evaluation Matrix — IT Security Suite Evaluation                                        │
│  ● Evaluation Phase  ·  All evaluations: 9/15 submitted  ·  [Lock Evaluations ▾]        │
│  [View: Aggregated ▾]  [Evaluator: All ▾]  [Show: Scores ▾]  [Export Matrix]            │
├────────────────────────────────┬───────────┬───────────┬───────────┬───────────┬─────────┤
│                                │   Acme    │  TechSol  │ CyberShld │  DataSafe │ SecureCo│
│  REQUIREMENT                   │  Systems  │   GmbH    │    AG     │   Ltd     │         │
│                                │   81%     │   73%     │   69%     │   62%     │   85%   │
├────────────────────────────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│  ▼ SECURITY (4 requirements)   │  avg 8.2  │  avg 7.1  │  avg 6.8  │  avg 5.9  │  avg 9.1│
├────────────────────────────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│  REQ-0042 Data Encryption (15%)│  ██ 8     │  ██ 7     │  █░  6    │  █░  5   │  ██ 9   │
│  Critical                      │  ✅ 3/3   │  ✅ 3/3   │  ✅ 3/3   │  🔄 2/3  │  ✅ 3/3 │
├────────────────────────────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│  REQ-0043 Access Control (12%) │  ██ 7     │  ██ 8     │  ██ 7     │  █░ 6    │  ██ 7   │
│  High                          │  ✅ 3/3   │  ✅ 3/3   │  ✅ 3/3   │  🔄 2/3  │  ✅ 3/3 │
├────────────────────────────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│  REQ-0044 Audit Logging (10%)  │  ██ 9     │  █░ 6     │  ██ 8     │  ⬜ —    │  ██ 8   │
│  High                          │  ✅ 3/3   │  ✅ 3/3   │  🔄 1/3   │  ⬜ 0/3  │  ✅ 3/3 │
├────────────────────────────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│  ▶ COMPLIANCE (3 requirements) │  avg 7.4  │  avg 6.8  │  avg 7.2  │  avg 4.1  │  avg 8.3│
├────────────────────────────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│  ▶ INTEGRATION (3 requirements)│  avg 5.9  │  avg 7.8  │  avg 6.1  │  avg 7.2  │  avg 7.4│
├────────────────────────────────┴───────────┴───────────┴───────────┴───────────┴─────────┤
│  TOTAL (weighted)                 81%        73%         69%         62%         85%      │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Matrix Structure

### Row Structure

**Category header row (collapsible):**
- Category name and requirement count
- Average score per supplier in this category
- Expand/collapse triangle
- Default: top-level categories expanded, sub-categories collapsed

**Requirement row:**
- Left column (fixed, 280px): Requirement code, title (truncated), priority badge, weight %
- Data cells (equal width, min 100px, horizontally scrollable): Score + completeness

**Total row (sticky at bottom):**
- Weighted total score per supplier (%)
- Rank badges: 1st, 2nd, 3rd

### Column Structure

**Requirement column (fixed left, 280px):**
- Sticky — does not scroll horizontally
- Contains: requirement code, title, priority badge, evaluation weight

**Supplier columns (equal width, horizontally scrollable):**
- Header: company name, overall score (%)
- Each cell: score value + evaluator completeness indicator

---

## 7. Cell Content

Each cell shows two pieces of information:

```
┌───────────┐
│  ██ 8     │  ← Score bar + numeric score (aggregated)
│  ✅ 3/3   │  ← Evaluator completeness (submitted/total)
└───────────┘
```

### Score Display

| View Mode | Score Shown |
|---|---|
| Aggregated (default) | Weighted average of all evaluator scores |
| Per-evaluator | Individual evaluator's score for this cell |

Score bar width represents the value on a 1–10 scale.

### Completeness Indicator

| Icon | Meaning |
|---|---|
| ✅ 3/3 | All evaluators submitted for this cell |
| 🔄 2/3 | Partially submitted |
| ⬜ 0/3 | No evaluator has scored this cell |
| 🔴 0/3 (red) | Deadline < 24h and cell empty |

---

## 8. Color Coding

### Score Heatmap (cells)

Applied after all evaluations are locked (scores revealed):

| Score Range | Cell Background |
|---|---|
| 8.0 – 10.0 | Light green |
| 6.0 – 7.9 | Light yellow/neutral |
| 4.0 – 5.9 | Light amber |
| 1.0 – 3.9 | Light red |
| Not scored | Light gray |

Heatmap is **only visible after evaluations are locked** (GBR-013). Before lock: cells show completeness only, no score colors.

### Completeness Heatmap (before lock)

| Completeness | Cell Background |
|---|---|
| 100% submitted | Light green |
| 50–99% | Light yellow |
| 1–49% | Light amber |
| 0% | Light gray |
| 0% + near deadline | Light red |

---

## 9. Cell Interaction

### Single-click on a cell

Opens the right panel with a **Cell Detail** view:

```
┌─────────────────────────────────────────┐
│  REQ-0042 × Acme Systems                │
│  Data Encryption at Rest               │
│  Weight: 15%  Priority: Critical       │
│  ─────────────────────────────────────  │
│  Aggregated Score: 8.0 / 10            │
│  ██████████████████░░  80%             │
│  ─────────────────────────────────────  │
│  EVALUATORS                            │
│  Anna Schmidt    8  ✅ submitted        │
│  Thomas Becker   8  ✅ submitted        │
│  Sarah Müller    8  ✅ submitted        │
│  ─────────────────────────────────────  │
│  SUPPLIER RESPONSE EXCERPT             │
│  "SecureCo implements AES-256-GCM..."  │
│  [Read full response]                  │
│  ─────────────────────────────────────  │
│  ✦ AI: Score variance: 0 — Full        │
│    agreement across evaluators         │
└─────────────────────────────────────────┘
```

### Double-click on a cell

Navigates to the full Evaluation detail for that supplier/evaluator combination.

---

## 10. Score Variance Indicator

A small visual indicator on the requirement row (left column) flags rows where evaluator scores diverge significantly:

```
REQ-0044  Audit Logging (10%)  ⚡ High variance
```

- ⚡ shown when the standard deviation of scores across evaluators exceeds 2.0 points
- Tooltip: "Evaluators disagree significantly on this requirement. Consider a calibration review."
- AI surfaces this as a calibration alert

---

## 11. Toolbar Controls

```
[View: Aggregated ▾]  [Evaluator: All ▾]  [Category ▾]  [Show: Scores + Completeness ▾]  ||  [Export Matrix ▾]
```

| Control | Options |
|---|---|
| **View** | Aggregated / Per-evaluator (select specific evaluator) |
| **Evaluator** | All / select one evaluator (only in Per-evaluator view mode) |
| **Category** | All categories / filter to one category (collapses others) |
| **Show** | Scores + Completeness / Scores only / Completeness only |
| **Export Matrix** | XLSX (full matrix) / PDF (formatted report format) / CSV |

---

## 12. Filters

| Filter | Values |
|---|---|
| Status | All / Incomplete (cells with missing scores) / Variance flagged |
| Priority | All / Critical / High / Medium / Low |
| Weight | Range filter (e.g., only requirements with weight > 10%) |
| Supplier | Show/hide individual supplier columns |

**Gap mode:** When "Incomplete" filter is active, the matrix collapses to show only rows/cells that are incomplete. This is the "triage view" for evaluators who need to identify what remains.

---

## 13. Row Actions (Requirement Row)

Hover on a requirement row shows a row action menu (⋮):

| Action | Description |
|---|---|
| Flag for calibration | Mark requirement for evaluator discussion |
| View requirement detail | Opens requirement in right panel |
| View all responses | Shows all supplier responses for this requirement |
| Revise scores (post-lock) | Opens score revision flow (Evaluation Lead only) |

---

## 14. Supplier Column Actions

Click the supplier column header to see supplier-level actions:

| Action | Description |
|---|---|
| View Supplier Profile | Opens SupplierProfile in right panel |
| View All Responses | Opens full supplier response for this tender |
| Exclude from comparison | Hides supplier column temporarily (not deletion) |
| View Evaluation Report | Opens evaluator-specific report |

---

## 15. Aggregated Total Row

Sticky at the bottom of the matrix.

```
┌────────────────────────────────┬───────────┬───────────┬───────────┬───────────┬─────────┐
│  TOTAL SCORE (weighted)        │   81%     │   73%     │   69%     │   62%     │   85%   │
│  RANK                          │   🥈 2nd  │   🥉 3rd  │   4th     │   5th     │   🥇 1st│
└────────────────────────────────┴───────────┴───────────┴───────────┴───────────┴─────────┘
```

- Only visible after evaluations are locked
- Before lock: shows completeness percentage instead of scores

---

## 16. AI Support

| Feature | Trigger | Display |
|---|---|---|
| Score variance alert | Variance > 2.0 std dev | ⚡ icon on requirement row + right panel detail |
| Evaluator calibration suggestion | After all evaluations locked | "Evaluator X's scores are consistently 1.8 points lower — review for calibration bias" |
| Differentiating requirements | Any time (post-lock) | "REQ-0044 shows the highest score spread (4 points) — most differentiating requirement" |
| Completion risk | <24h to deadline, cells incomplete | 🔴 cell indicator + dashboard notification |
| Missing score narrative | Decision Board view | AI generates per-requirement comparison narrative for top 2 suppliers |

---

## 17. Status Indicators Summary

| Indicator | Meaning |
|---|---|
| ✅ green | All evaluators submitted for this cell |
| 🔄 blue | Partially submitted |
| ⬜ gray | Not started |
| 🔴 red | Not started + deadline critical |
| ⚡ variance | Evaluators disagree significantly |
| 🔒 lock | Cell locked (evaluations locked, immutable) |

---

## 18. Export Functions

| Export | Description |
|---|---|
| **Matrix XLSX** | Full matrix with all scores; color-coded; includes evaluator breakdown sheet |
| **Matrix PDF** | A3-landscape formatted comparison grid suitable for printing/presenting |
| **Gap Report** | Only incomplete cells; used to manage remaining evaluation work |
| **Calibration Report** | Requirements with high variance; evaluator scores side-by-side |

---

## 19. Business Rules

| Rule | UI Enforcement |
|---|---|
| GBR-013: Blind scoring until all locked | Score values and heatmap hidden until `EvaluationsLocked` event |
| GBR-010: Scores reference RequirementVersionId | Matrix headers display RequirementVersionId on hover |
| EVL-BR-011: Scores computed by platform | No manual score editing directly in matrix cells; must use score revision flow |

---

## 20. Permissions

| Action | Role | Condition |
|---|---|---|
| View matrix (completeness only) | Evaluator | Before lock |
| View matrix (scores) | Evaluation Lead, Procurement Manager | After lock |
| View matrix (scores) | Decision Board Member | After COI declared |
| Export matrix | Evaluation Lead, Procurement Manager | Any state |
| Flag for calibration | Evaluation Lead | Any state |
| Revise score | Evaluation Lead | After lock; with confirmation |

---

## Implementation Guidance

- The matrix must support virtual scrolling for large requirement sets (100+ rows) and many supplier columns (10+)
- Score bar width is a CSS progress indicator, not a chart library component — keeps performance high
- Cell color heatmap must be computed server-side and sent as color class metadata with the matrix payload
- The matrix is a read-aggregated view; it never writes directly — all mutations go through the Evaluation domain model
- Horizontal scrolling must freeze the left requirement column (CSS `position: sticky`)

---

## References

- [`Evaluation_Workspace.md`](./Evaluation_Workspace.md) — PKB-04-007 — Parent workspace
- [`Decision_Workspace.md`](./Decision_Workspace.md) — PKB-04-008 — Post-lock matrix used in Decision phase
- [`Evaluation.md`](../02_Domain_Model/Evaluation.md) — PKB-02-005 — Domain model
- [`Reference_Video_Analysis.md`](./Reference_Video_Analysis.md) — PKB-04-011 — Pattern origin
