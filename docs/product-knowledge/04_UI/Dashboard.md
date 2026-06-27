---
id: PKB-04-002
title: Dashboard — adtender Role-Based Dashboards
version: 1.0
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Frontend Developer
  - Product Manager
  - AI Development Agent
depends_on:
  - PKB-00-005
  - PKB-04-001
  - PKB-04-003
tags:
  - ui
  - dashboard
  - widgets
  - role-based
---

# Dashboard — adtender Role-Based Dashboards

> The Dashboard is the entry point for every adtender session. It is role-aware, contextual, and action-oriented. The Dashboard does not display data for its own sake — it surfaces the next relevant actions and critical status information for the authenticated user's role.

---

## 1. Dashboard Philosophy

**The Dashboard answers one question: "What do I need to do today?"**

- No vanity metrics
- No generic statistics
- Only information that requires or enables action

Every widget either shows a task needing attention, a deadline requiring response, or a status change the user should know about.

---

## 2. Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  TOP BAR                                                         │
├──────────┬───────────────────────────────────────────────────────┤
│          │  DASHBOARD HEADER                                     │
│   LEFT   │  Good morning, [Name]  •  [Date]                     │
│          │  [Pending tasks: 3]  [Overdue: 1]  [New: 2]          │
│   SIDE   ├──────────────────────────────┬────────────────────────┤
│          │  MAIN WIDGET AREA (2/3)      │  RIGHT COLUMN (1/3)    │
│   BAR    │                              │                        │
│          │  ┌──────────┐  ┌──────────┐  │  ┌──────────────────┐ │
│          │  │ Widget 1 │  │ Widget 2 │  │  │  My Tasks        │ │
│          │  └──────────┘  └──────────┘  │  │  (action list)   │ │
│          │  ┌──────────────────────────┐│  ├──────────────────┤ │
│          │  │ Widget 3 (full width)    ││  │  Notifications   │ │
│          │  └──────────────────────────┘│  │  (recent 5)      │ │
│          │                              │  ├──────────────────┤ │
│          │                              │  │  AI Insights     │ │
│          │                              │  └──────────────────┘ │
└──────────┴──────────────────────────────┴────────────────────────┘
```

### 2.1 Dashboard Header

- Personalized greeting with user name
- Today's date
- Summary strip: pending tasks, overdue items, unread notifications (clickable counts)

### 2.2 Widget Grid

- Left 2/3: configurable widget grid (2-column on desktop, 1-column on tablet)
- Right 1/3: persistent action panel (My Tasks, recent notifications, AI Insights)
- Widgets are draggable (drag-and-drop reorder within the grid)
- Each widget has a menu (⋮) for: remove, configure, refresh

---

## 3. Role-Based Dashboard Configurations

Each role gets a default dashboard. Users can customize widgets within their role's available set.

### 3.1 Project Manager Dashboard

**Focus:** Project health, milestone status, open items across all my projects.

| Widget | Data shown |
|---|---|
| **My Projects** | List: name, status, last activity, open issues count. Quick-access to active projects. |
| **Upcoming Milestones** | Timeline: next 30 days, milestone name, project, date |
| **Tender Status** | Summary cards: active tenders per project with lifecycle state |
| **Requirement Progress** | Per-project: requirements by status (Draft / Review / Approved) |
| **Overdue Actions** | List of overdue tasks across all my projects |
| **Knowledge Reuse** | Prompt: X requirements available from library for current project |
| **AI Insight** | "Project [X] has 3 requirements still in Draft — tender creation is blocked" |

### 3.2 Procurement Manager Dashboard

**Focus:** Active tenders, submission deadlines, evaluation pipeline.

| Widget | Data shown |
|---|---|
| **Active Tenders** | Cards: tender name, project, status, submission deadline, # invited / responded |
| **Submission Deadline Countdown** | Critical: tenders closing in next 7 days with days-remaining indicator |
| **Supplier Response Tracker** | Per-tender: responses received vs. invited; % complete |
| **Evaluation Status** | Tenders in evaluation: evaluators assigned, completed vs. total |
| **Clarification Threads** | Open clarifications requiring Procurement Manager response |
| **Qualification Queue** | Suppliers awaiting qualification review |
| **AI Insight** | "Tender [X] has 2 suppliers who have not opened their invitation. Consider resending." |

### 3.3 Evaluator Dashboard

**Focus:** Assigned evaluations, scoring progress, upcoming deadlines.

| Widget | Data shown |
|---|---|
| **My Evaluations** | Cards: tender name, # requirements to score, progress bar, deadline |
| **Scoring Progress** | Per evaluation: scored / total, estimated time to completion |
| **Upcoming Evaluation Deadlines** | Countdown for evaluation submission deadlines |
| **Requirements Awaiting Score** | List of individual requirements not yet scored |
| **AI Scoring Assistant** | "Ready to summarize supplier responses for Evaluation [X]?" |

### 3.4 Decision Board Member Dashboard

**Focus:** Decision sessions pending, COI declarations, report availability.

| Widget | Data shown |
|---|---|
| **Decision Sessions** | List: tender name, project, status, my role, COI status |
| **COI Declaration Required** | Alert banner if COI declaration is pending for a scheduled session |
| **Reports Ready for Review** | Consolidated Evaluation Reports available for my sessions |
| **Recent Decisions** | Last 5 decisions I participated in — outcome and date |
| **AI Briefing** | "The Consolidated Report for Tender [X] is available. Key finding: Supplier A leads on 8 of 12 criteria." |

### 3.5 Organization Admin Dashboard

**Focus:** Platform health, user management, audit summary.

| Widget | Data shown |
|---|---|
| **Active Users** | Count active / invited / suspended |
| **Platform Activity** | Activity heatmap: last 30 days |
| **Tenant Storage** | Usage vs. quota |
| **Recent Audit Events** | Last 10 significant audit entries |
| **Pending User Invitations** | Users in Invited state for >7 days |
| **License Status** | Current plan, expiry, usage |

### 3.6 Supplier Dashboard (Supplier Portal)

**Focus:** My invitations, response progress, clarification threads.

| Widget | Data shown |
|---|---|
| **Open Invitations** | Cards: tender name, buyer, submission deadline, response status |
| **Submission Countdown** | Critical deadlines in next 7 days |
| **My Responses** | All submitted and in-progress responses |
| **Clarification Threads** | Open questions — answered/unanswered |
| **Qualification Status** | Current qualification state for each buyer |

---

## 4. Widget Catalog

All available widgets (users add from a widget library per role permissions).

| Widget ID | Name | Available to |
|---|---|---|
| WGT-001 | My Projects | Project Manager, Procurement Manager |
| WGT-002 | Active Tenders | Procurement Manager, Project Manager |
| WGT-003 | Submission Deadlines | Procurement Manager |
| WGT-004 | Supplier Response Tracker | Procurement Manager |
| WGT-005 | My Evaluations | Evaluator |
| WGT-006 | Scoring Progress | Evaluator |
| WGT-007 | Decision Sessions | Decision Board Member |
| WGT-008 | COI Status | Decision Board Member |
| WGT-009 | Overdue Actions | All |
| WGT-010 | Requirement Progress | Project Manager, Procurement Manager |
| WGT-011 | Clarification Threads | Procurement Manager |
| WGT-012 | Qualification Queue | Procurement Manager |
| WGT-013 | AI Insights | All |
| WGT-014 | Recent Decisions | Decision Board Member |
| WGT-015 | Knowledge Reuse Prompt | Project Manager, Procurement Manager |
| WGT-016 | Platform Activity | Admin |
| WGT-017 | Audit Events | Admin |
| WGT-018 | User Management | Admin |
| WGT-019 | Upcoming Milestones | Project Manager |
| WGT-020 | Open Invitations | Supplier |

---

## 5. My Tasks Panel (Right Column)

Always visible in the right column. Shows a prioritized task list derived from the user's active work items.

```
My Tasks                              [View all]
─────────────────────────────────────────────────
⚠ OVERDUE
  Score 4 requirements — Tender: IT Security
  Due: yesterday                         [Go →]

📋 TODAY
  Declare COI — Decision Board Session
  Due: today 17:00                       [Go →]

📋 THIS WEEK
  Review Requirement REQ-2024-0042
  Due: Thursday                          [Go →]

  Complete Supplier Qualification
  Acme Systems · Started 3 days ago      [Go →]
```

- Items are auto-generated from workflow assignments, deadlines, and lifecycle state
- Each item has a direct deep link to the relevant record
- "View all" opens a full task list view
- Overdue items always appear first with a warning indicator

---

## 6. AI Insights Panel (Right Column)

Shows proactive AI suggestions relevant to the user's current work. Limited to 3 items to avoid noise.

```
✦ AI Insights                          [Dismiss all]
────────────────────────────────────────────────────
✦  Tender "IT Security Suite 2024" has 3 suppliers
   that haven't opened their invitation.
   [Resend invitation]  [Dismiss]

✦  Requirement REQ-0031 "Data Encryption at Rest"
   is very similar to REQ-0012 in the IT Library.
   [Compare]  [Dismiss]
```

AI Insights are suggestions only. Each one has a direct action link and a Dismiss button. Dismissed insights do not reappear unless the underlying condition changes.

---

## 7. Dashboard Customization

Users can customize their dashboard via "Customize Dashboard" (accessible from the ⋮ menu in the dashboard header).

- Add widgets from the widget catalog (role-gated)
- Remove widgets
- Reorder via drag-and-drop
- Resize widgets (small / medium / large grid cells)
- Reset to default configuration

Changes are persisted per user and per role. Org Admins can set default dashboard configurations per role that apply to new users.

---

## 8. Quick Actions

A persistent "Quick Actions" button (+ icon) appears in the bottom-right corner of the dashboard. It expands to the most common creation actions for the user's role:

**Project Manager:**
- + New Project
- + New Requirement
- + Import from Library

**Procurement Manager:**
- + New Tender
- + Invite Supplier
- + Start Evaluation

**Evaluator:**
- Continue Scoring → [Most recent evaluation]

---

## 9. Keyboard Shortcuts (Dashboard)

| Shortcut | Action |
|---|---|
| `R` | Refresh all widgets |
| `C` | Open customize dashboard panel |
| `N` | Quick action: new item (context-dependent) |
| `T` | Jump to My Tasks |

---

## References

- [`Navigation.md`](./Navigation.md) — PKB-04-001 — Top bar and breadcrumb
- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003 — Widget patterns and layout
- [`Notifications.md`](./Notifications.md) — PKB-04-010 — Notification panel
