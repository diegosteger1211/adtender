---
id: PKB-04-012
title: Application Navigation — Two-Level Navigation Model
version: 1.0
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Frontend Developer
  - Product Manager
  - AI Development Agent
depends_on:
  - PKB-04-001
  - PKB-04-003
  - PKB-04-011
tags:
  - ui
  - navigation
  - workflow
  - stage-progression
---

# Application Navigation — Two-Level Navigation Model

> This document extends [`Navigation.md`](./Navigation.md) (PKB-04-001) with the two-level navigation model derived from reference analysis: a left-side module navigation combined with a top-of-workspace stage progression bar. The two levels are complementary — module navigation answers "where am I?", stage navigation answers "what phase am I in?".

---

## 1. Two-Level Navigation Philosophy

Enterprise procurement users operate in two mental modes simultaneously:

1. **Module mode**: "I need to go to the Requirements section of this tender"
2. **Stage mode**: "We are in the Evaluation phase — submissions are closed"

Previous adtender navigation addressed module mode well. Stage mode was implicit (a status badge). This document formalizes stage navigation as a first-class UI element that guides workflow progression.

---

## 2. Level 1 — Module Navigation (Left Sidebar)

Unchanged from [`Navigation.md`](./Navigation.md). The sidebar provides permanent access to all workspaces.

The key addition: when inside a tender, the sidebar context section now reflects the current **tender module**:

```
─────────────────────────────
  ▸ PROJECT: IT Modernization
  ─────────────────────────
    Overview
    Requirements
  ▸ TENDER: IT Security Suite
  ─────────────────────────
    → Overview
    → Requirements
    → Suppliers
    → Clarifications
    → Evaluation
    → Decision
  ─────────────────────────
```

Items that are not yet available (e.g., Evaluation before submissions close) are shown in a disabled/muted state with a tooltip explaining why: "Available after submissions close."

---

## 3. Level 2 — Stage Progress Bar (Tender Context)

A horizontal stage progression bar appears at the top of every Tender Workspace screen, directly below the workspace header. It is specific to the Tender lifecycle.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TENDER STAGE PROGRESS                                                           │
│                                                                                  │
│   ✅ Setup ──── ✅ Published ──── ✅ Responses ──── 🔄 Evaluation ──── ⬜ Decision │
│      Jun 1          Jun 1           Jun 15            Jul 22 →             —    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Stage Bar Properties

| Property | Detail |
|---|---|
| Location | Below workspace header; above tab navigation |
| Height | 44px |
| Visibility | Tender Workspace only (not visible on project or library pages) |

### Stage States

| State | Visual | Meaning |
|---|---|---|
| Completed | ✅ Green checkmark + date | Phase finished; click to view read-only summary |
| Active | 🔄 Blue spinner/highlight + arrow | Current phase; actions available |
| Upcoming | ⬜ Gray + no date | Not yet reached; locked |
| Overdue | 🔴 Red with alert | Phase has passed expected date without completion |

### Stage Labels and Dates

| Stage | Start Event | Date Shown |
|---|---|---|
| Setup | Tender created | Creation date |
| Published | `TenderPublished` event | Publication date |
| Responses | Publication date | Submission deadline |
| Evaluation | Submission deadline passed | Evaluation deadline |
| Decision | Evaluation locked | — |
| Awarded | Decision approved | Award date |

### Stage Navigation Behavior

- **Completed stage** (click): Opens a read-only "phase summary" panel on the right side. Example: clicking "Responses" shows the response summary — how many submitted, deadline, lock date.
- **Active stage** (click): Navigates to the primary tab for that stage (e.g., "Evaluation" → Evaluation tab).
- **Upcoming stage** (click): No navigation; tooltip shows what prerequisite must be met.

---

## 4. Stage-Aware Action Visibility

The stage bar drives what actions are visible and available in the workspace. This prevents users from performing out-of-sequence operations.

| Current Stage | Available Actions | Hidden/Disabled |
|---|---|---|
| Setup | Edit all details; Add requirements; Invite suppliers; Publish | Close Submissions; Lock Evaluations; Approve Decision |
| Published | Answer clarifications; Monitor responses; Extend deadline | Edit requirements (frozen at publish) |
| Responses | Answer clarifications; Monitor submissions | Close Submissions (until deadline) |
| Evaluation | Assign evaluators; Monitor scoring; Lock evaluations | Publish Tender; Edit requirements |
| Decision | Configure board; COI declarations; Record decision | Modify evaluation |
| Awarded | Generate award notice; Archive | Modify decision |

---

## 5. Process Breadcrumb (Stage-Aware)

The breadcrumb in the Top Bar is extended for tender context:

```
Projects › IT Modernization › IT Security Suite › Evaluation
                                                    ↑
                              Current stage shown in breadcrumb
```

The final segment reflects the current stage, not just the module name.

---

## 6. Module Lock Indicators

Left sidebar items that are not available in the current stage show a lock icon:

```
  → Overview                        ✅
  → Requirements                    ✅
  → Suppliers                       ✅
  → Clarifications                  ✅
  → Evaluation                      🔄  ← current
  → Decision                        🔒  ← locked until eval complete
```

Clicking a locked item shows a non-blocking tooltip: "Available after evaluations are locked."

---

## 7. Project-Level Stage Navigation

At the project level (above tenders), a simplified stage bar shows project lifecycle:

```
   ✅ Initiated ──── ✅ Active ──── 🔄 TenderRunning ──── ⬜ Closing ──── ⬜ Archived
```

Same behavior: completed stages are clickable for summary; current stage is highlighted; future stages are muted.

---

## 8. Navigation Transitions

### Entering a Tender

When navigating to a tender, the application:
1. Updates the sidebar to show the tender context section
2. Renders the stage bar based on the tender's current state
3. Opens the most relevant tab for the current stage (Overview for Draft; Evaluation tab for Evaluation stage)

### Leaving a Tender

When navigating away from a tender:
1. The sidebar collapses the tender context section
2. The stage bar disappears
3. The breadcrumb resets to the higher-level context

### Stage Transition

When a stage transition occurs (e.g., tender moves from Published → Evaluation):
1. The stage bar updates immediately
2. A toast notification appears: "Submissions closed. Evaluation phase has begun."
3. Previously locked modules (Evaluation) become active in the sidebar

---

## 9. Mobile Navigation Adaptation

On tablet (768–1023px):
- Stage bar is condensed: shows only current and immediately adjacent stages
- Completed stages accessible via "← Previous phases" link
- Left sidebar collapses to icons

On mobile (<768px):
- Stage bar replaced by a single current-stage chip below the workspace header: `🔄 Evaluation Phase`
- Tapping the chip opens a bottom sheet with full stage history

---

## 10. Accessibility

- Stage bar items have ARIA role `progressbar` with `aria-valuenow` (current step) and `aria-valuemax` (total steps)
- Each stage has an `aria-label`: "Step 4: Evaluation — in progress"
- Color is not the only indicator: icon + label for each state
- Keyboard: stage bar items are focusable with Tab; Enter activates

---

## References

- [`Navigation.md`](./Navigation.md) — PKB-04-001 — Base navigation model
- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003 — Layout anatomy
- [`Tender_Workspace.md`](./Tender_Workspace.md) — PKB-04-005 — Stage bar placement
- [`Reference_Video_Analysis.md`](./Reference_Video_Analysis.md) — PKB-04-011 — Observed pattern source
