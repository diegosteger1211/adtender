---
id: PKB-04-016
title: Dashboard Concept — adtender UI Specification
version: 1.0
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Frontend Developer
  - Product Manager
  - AI Development Agent
depends_on:
  - PKB-04-002
  - PKB-04-003
  - PKB-04-012
tags:
  - ui
  - dashboard
  - overview
  - navigation
  - workflow
---

# Dashboard Concept — adtender UI Specification

> This document extends and supersedes the role dashboard definitions in [`Dashboard.md`](./Dashboard.md) (PKB-04-002) with the enhanced dashboard concept derived from reference platform analysis. It formalizes the dashboard as the primary navigation anchor — the place users land to understand state, act on priorities, and navigate to active work.

---

## 1. Purpose

The Dashboard serves two purposes simultaneously:

1. **Orientation**: "Where are things?" — Shows the current state of all work the user is involved in
2. **Action queue**: "What do I need to do next?" — Surfaces time-sensitive tasks, approvals, and alerts

The Dashboard is not a passive display. Every widget element is an entry point: clicking a tender opens the Tender Workspace, clicking a task navigates to the action, clicking an alert explains the issue and provides a resolution path.

---

## 2. Dashboard Design Philosophy

Derived from reference platform analysis:

| Principle | Rationale |
|---|---|
| **Action-first** | Most users land on the dashboard to act, not to report. Priority items appear first. |
| **Stage-aware summary cards** | Each active tender/project shows its current stage and what's blocking progress — not just a status label |
| **Cross-workspace navigation** | Dashboard is the primary navigation hub; every item deep-links to the relevant workspace |
| **Role-contextual content** | Each role sees only the information relevant to their responsibilities |
| **No unnecessary noise** | Completed work fades out; AI insights are advisory, always dismissible |

---

## 3. Layout Model

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOP BAR: Global search · Notifications · User menu                 │
├──────────────────────────────────────────────────────────────────────┤
│  LEFT SIDEBAR (240px)       │  MAIN DASHBOARD CONTENT               │
│                             │                                        │
│  ▸ Dashboard (active)       │  ┌─────────────────────────────────┐  │
│  ▸ Projects                 │  │  MY PRIORITY TASKS (top pinned) │  │
│  ▸ Requirement Library      │  │  ─────────────────────────────  │  │
│  ▸ Suppliers                │  │  🔴 COI Declaration — Jul 15    │  │
│  ▸ Tasks                    │  │  🟡 Score REQ-0044 — Today      │  │
│  ▸ Reports                  │  └─────────────────────────────────┘  │
│  ─────────────────────      │                                        │
│  ▸ PROJECTS                 │  ┌────────────────┐ ┌───────────────┐ │
│    IT Modernization         │  │  ACTIVE        │ │  DEADLINES    │ │
│    Network Upgrade          │  │  TENDERS (3)   │ │  THIS WEEK    │ │
│                             │  │  ─────────     │ │  ─────────    │ │
│                             │  │  [Tender card] │ │  [Timeline]   │ │
│                             │  │  [Tender card] │ │               │ │
│                             │  └────────────────┘ └───────────────┘ │
│                             │                                        │
│                             │  ┌────────────────┐ ┌───────────────┐ │
│                             │  │  MY PROJECTS   │ │  AI INSIGHTS  │ │
│                             │  │  ─────────     │ │  ─────────    │ │
│                             │  │  [Project card]│ │  [3 insights] │ │
│                             │  └────────────────┘ └───────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Priority Tasks Panel (Top — Pinned)

The topmost element on every role's dashboard. Cannot be removed or repositioned. Shows the user's highest-priority pending actions, limited to 5 items.

```
MY PRIORITY TASKS                         [View All Tasks →]
─────────────────────────────────────────────────────────────
🔴  COI Declaration — Cloud Infra Selection   OVERDUE (3 days)
    [Declare COI →]

🟡  Score TechSolutions GmbH for REQ-0044     Today 17:00
    Tender: IT Security Suite
    [Open Evaluation →]

🟡  Answer Clarification Q-2024-0015          Today
    Tender: IT Security Suite
    [Go to Clarification →]

⬜  Review Requirement REQ-0091               Jul 24
    Project: Network Upgrade
    [Review →]
```

Clicking [View All Tasks →] opens the Task & Deadline Workspace.

---

## 5. Active Tenders Panel

Shows all tenders the user is assigned to (as PM, evaluator, board member, or procurement manager) that are not yet Awarded or Archived.

### Tender Card

```
┌──────────────────────────────────────────────────────────────────┐
│  IT Security Suite                              [Open Tender →]  │
│  Project: IT Modernization  ·  PKT-2024-003                     │
│                                                                  │
│  ✅ Setup ──── ✅ Published ──── ✅ Responses ──── 🔄 Evaluation ─ │
│                                                   ↑ Active       │
│                                                                  │
│  Evaluation deadline: Jul 22 (6 days)                           │
│  Progress: 9 / 15 evaluations submitted                         │
│  2 open clarifications                                           │
│                                                                  │
│  ⚠ Sarah Müller has 4 overdue evaluation tasks                  │
└──────────────────────────────────────────────────────────────────┘
```

Each card shows:
- Tender name, project, code
- Mini stage progress bar (same visual language as Application_Navigation.md §3)
- Current phase deadline and time remaining
- Relevant progress indicator (phase-dependent: "evaluations submitted" in Evaluation; "responses received" in Published)
- Open clarifications count
- One contextual alert if any (overdue task, missing data)

### Panel controls

```
Active Tenders (3)          [All Stages ▾]  [+ New Tender]
```

Filter by stage: All / Published / Evaluation / Decision

---

## 6. Deadlines Panel

A compact timeline view of upcoming deadlines for all active tenders. Spans the next 14 days.

```
UPCOMING DEADLINES                              [Calendar View →]
─────────────────────────────────────────────────────────────────
TODAY     ●──────────────────────────────────────────────────
  COI Declaration  Cloud Infra Selection         [Declare →]

Jul 18    ─────────────────────
  Submission Deadline  IT Security Suite
  Clarification Deadline  Network Upgrade

Jul 22    ─────────────────────
  Evaluation Deadline  IT Security Suite       ⚠ 6 days

Aug 05    ─────────────────────
  Submission Deadline  API Platform Replacement
─────────────────────────────────────────────────────────────────
```

Each deadline entry:
- Date, event type, tender name
- Action link if action is available (e.g., [Declare →] for COI)
- Alert badge if at risk

---

## 7. My Projects Panel

Shows all projects the user owns or participates in, with a health indicator.

### Project Card (compact)

```
┌─────────────────────────────────────────────────────────────────┐
│  IT Modernization                           ● Active           │
│  2 active tenders  ·  12 requirements  ·  3 team members       │
│  Stage: TenderRunning                    [Open Project →]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. AI Insights Panel

```
✦ AI INSIGHTS                                      [Dismiss All]
─────────────────────────────────────────────────────────────────
✦  Score variance detected on REQ-0044 (IT Security Suite)
   3 evaluators disagree significantly (std dev 3.2).
   Consider a calibration session before locking.
   [View Matrix →]                               [Dismiss ×]

✦  DataSafe Ltd has 0 evaluations submitted (3 days to deadline).
   [Send Reminder →]                             [Dismiss ×]

✦  IT Security Suite has 2 unanswered clarifications with
   3 days until the clarification deadline.
   [View Clarifications →]                       [Dismiss ×]
─────────────────────────────────────────────────────────────────
```

Rules:
- Maximum 3 insights shown at once
- Always dismissible (per item and all at once)
- Insights are re-generated daily; dismissed insights do not reappear for 7 days
- AI chip `[✦ AI]` pattern from Workspace_Concept.md applies

---

## 9. Role-Based Dashboard Variants

The same layout frame is used across all roles. The widgets and their priority order differ by role.

### Procurement Manager Dashboard

| Zone | Widget |
|---|---|
| Top pinned | Priority Tasks |
| Left main | Active Tenders (all stages) |
| Right | Deadlines Panel |
| Left lower | Clarification Summary (open Q&A across all tenders) |
| Right lower | AI Insights |

### Project Manager Dashboard

| Zone | Widget |
|---|---|
| Top pinned | Priority Tasks |
| Left main | My Projects |
| Right | Active Tenders (own projects only) |
| Left lower | Requirement Approval Queue |
| Right lower | AI Insights |

### Evaluator Dashboard

| Zone | Widget |
|---|---|
| Top pinned | Priority Tasks (evaluation tasks only) |
| Left main | My Evaluations (per tender, per supplier, progress) |
| Right | Evaluation Deadlines |
| Left lower | AI Insights (calibration notes) |

### Decision Board Member Dashboard

| Zone | Widget |
|---|---|
| Top pinned | Priority Tasks (COI + decision approval) |
| Left main | Pending Decisions |
| Right | Supplier Comparison Summary (post-lock) |

### Org Admin Dashboard

| Zone | Widget |
|---|---|
| Top pinned | System Alerts |
| Left main | User Management Summary |
| Right | Active Tenant Activity |
| Left lower | Audit Log Summary |

---

## 10. Clarification Summary Widget (Procurement Manager)

Shown as a lower-priority widget for Procurement Managers who manage multiple tenders.

```
OPEN CLARIFICATIONS
─────────────────────────────────────────────────────────────────
IT Security Suite          3 open    Deadline: Jul 12 (Today)
Network Upgrade            1 open    Deadline: Jul 18
Cloud Infra Selection      0 open
─────────────────────────────────────────────────────────────────
[View All Clarifications →]
```

---

## 11. Dashboard Customization

Users can:
- Reorder non-pinned panels (drag-and-drop)
- Collapse panels (state persisted per user)
- Configure widget visibility from dashboard settings (gear icon in top-right)
- Add a Project Quick View card for any project

The Priority Tasks panel is always pinned at the top and cannot be removed.

Dashboard state (collapsed/expanded panels, widget order) is persisted per user per tenant.

---

## 12. Empty States

| State | Display |
|---|---|
| No active tenders | "No active tenders. Start by creating a new tender within one of your projects." [+ New Tender] |
| No tasks | "You're all caught up — no open tasks." |
| No projects | "No projects yet. Create a project to get started." [+ New Project] |

---

## 13. Navigation from Dashboard

The dashboard serves as the primary navigation hub. Every item is clickable:

| Click target | Navigation |
|---|---|
| Tender card | `/projects/:id/tenders/:tenderId` |
| Tender stage (on card) | `/projects/:id/tenders/:tenderId?stage=evaluation` |
| Task [action link] | Deep link to the relevant action URL |
| Project card | `/projects/:id` |
| Clarification count | `/projects/:id/tenders/:tenderId/clarifications` |
| AI insight [View link] | Relevant workspace URL |
| "View All Tasks" | `/tasks` |

---

## 14. Refresh Behavior

- Dashboard data is refreshed when the user navigates to it
- Active counters (tasks, open clarifications) update in real-time via WebSocket (if user is on the page)
- Stale indicator: if data is >5 minutes old, a subtle "Last updated 6 min ago · [Refresh]" appears in the dashboard header

---

## References

- [`Dashboard.md`](./Dashboard.md) — PKB-04-002 — Role-based widget catalog
- [`Application_Navigation.md`](./Application_Navigation.md) — PKB-04-012 — Stage bar in tender cards
- [`Task_Deadline_Workspace.md`](./Task_Deadline_Workspace.md) — PKB-04-014 — Task source for Priority Tasks
- [`Clarification_Workspace.md`](./Clarification_Workspace.md) — PKB-04-015 — Clarification summary source
- [`Reference_Video_Analysis.md`](./Reference_Video_Analysis.md) — PKB-04-011 — Design pattern origin
