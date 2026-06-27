---
id: PKB-04-014
title: Task & Deadline Workspace — adtender UI Specification
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
  - PKB-04-010
tags:
  - ui
  - workspace
  - tasks
  - deadlines
  - workflow
---

# Task & Deadline Workspace — adtender UI Specification

---

## 1. Purpose

The Task & Deadline Workspace provides a consolidated view of all open actions and upcoming deadlines across all projects and tenders. It answers the question "what do I need to do and when?" without requiring the user to check each project individually.

Tasks in adtender are primarily **system-generated**: they are created automatically when workflow events occur (evaluation assigned, COI declaration required, review requested). Manual tasks are also supported as a supplement.

---

## 2. Target Users

| Role | Primary Use |
|---|---|
| Project Manager | Overview of all tasks across all their projects |
| Procurement Manager | Deadline tracking; assignment management across tenders |
| Evaluator | My evaluation deadlines and scoring tasks |
| Organization Admin | Team workload view; reassignment support |

---

## 3. User Goals

- Never miss a deadline across any active project or tender
- Understand what is assigned to me vs. what I assigned to others
- Identify at-risk tasks (due soon, overdue, unassigned)
- Reassign tasks when team members are unavailable
- Export a deadline summary for team meetings

---

## 4. Navigation Entry

| Entry | URL |
|---|---|
| Sidebar: Tasks (platform level) | `/tasks` |
| Dashboard "My Tasks" panel: View all link | `/tasks?scope=mine` |
| Project context: Task view | `/projects/:id/tasks` |

---

## 5. Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Tasks & Deadlines                   [+ Add Manual Task]        │
│  32 tasks  ·  5 overdue  ·  8 due this week                    │
├──────────────────────────────────────────────────────────────────┤
│  [My Tasks ●] [Assigned by Me] [All Team]  │  [⊞ List] [📅 Cal]  │
├──────────────────────────────────────────────────────────────────┤
│  [Filter: Project ▾] [Tender ▾] [Status ▾] [Assignee ▾]  [Export]│
├──────────────────────────────────────────────────────────────────┤
│  ⚠ OVERDUE (5)                                     [Collapse ▾] │
│  ────────────────────────────────────────────────────────────── │
│  🔴 Score REQ-0044 for DataSafe Ltd                    Jul 18   │
│     Tender: IT Security Suite  ·  Assigned: You        LATE 3d  │
│     [Go to Evaluation →]                [Reassign]              │
│                                                                  │
│  🔴 COI Declaration — Decision Board                   Jul 15   │
│     Tender: Cloud Infra Selection  ·  Assigned: You    LATE 7d  │
│     [Declare COI →]                                             │
│                                                                  │
│  📋 DUE TODAY (3)                                               │
│  ────────────────────────────────────────────────────────────── │
│  🟡 Submit Evaluation — CyberShield AG                 Today    │
│     Tender: IT Security Suite  ·  Assigned: You        17:00   │
│     [Open Evaluation →]                                         │
│                                                                  │
│  📋 DUE THIS WEEK (8)                                           │
│  ────────────────────────────────────────────────────────────── │
│  ⬜ Review Requirement REQ-0091                        Jul 24   │
│     Project: Network Upgrade  ·  Assigned: You                 │
│     [Review →]                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Task Groups

Tasks are grouped and displayed in priority order:

| Group | Color | Condition |
|---|---|---|
| Overdue | 🔴 Red | Due date has passed and not completed |
| Due Today | 🟡 Amber | Due date is today |
| Due This Week | 🟦 Blue | Due within 7 days |
| Due Later | ⬜ Gray | Due after 7 days |
| Completed | ✅ Green | Completed (hidden by default; toggle to show) |

Each group is collapsible. Count shown in the group header.

---

## 7. Task Row

Each task row shows:

| Element | Description |
|---|---|
| Status icon | Color-coded urgency indicator |
| Task title | Action description (system-generated or manual) |
| Due date | Absolute date + relative indicator ("LATE 3d", "Today 17:00", "In 5 days") |
| Context | Tender name + Project name (or Library / Project if not tender-specific) |
| Assignee | Avatar + name (own tasks show "You") |
| Quick action link | Direct deep link to the relevant record |
| Reassign | Available when user has management permissions |

---

## 8. Task Types

### System-Generated Tasks

Automatically created when workflow events occur. Cannot be deleted (only completed through the underlying workflow action).

| Task | Trigger Event | Assignee |
|---|---|---|
| Score [SupplierName] for [Tender] | `EvaluationAssigned` | Assigned Evaluator |
| Declare COI — [Tender] | `DecisionBoardConvened` | Each Board Member |
| Review Requirement [Code] | `RequirementSubmittedForReview` | Assigned Reviewer |
| Answer Clarification — [Tender] | `ClarificationPosted` | Procurement Manager |
| Approve Decision — [Tender] | `DecisionDraftReady` | Board Chair |
| Submit Lessons Learned — [Project] | `ProjectMovedToClosing` | Project Manager |
| Qualify Supplier — [Name] | `QualificationStarted` | Procurement Manager |

### Manual Tasks

Created by users for supplemental work items not covered by system workflow.

| Field | Required | Notes |
|---|---|---|
| Title | Yes | Free text |
| Due date | Yes | |
| Assignee | Yes | Default: self |
| Related record | No | Link to Project / Tender / Requirement |
| Description | No | Additional context |
| Priority | No | Low / Medium / High (default: Medium) |

---

## 9. Calendar View

Toggled from the view toggle in the toolbar.

```
┌──────────────────────────────────────────────────────────────────┐
│  July 2024                                [◀ Prev]  [Today]  [Next ▶] │
├────┬────┬────┬────┬────┬────┬────────────────────────────────────┤
│Mon │Tue │Wed │Thu │Fri │Sat │Sun                                 │
├────┴────┴────┴────┴────┴────┴────────────────────────────────────┤
│ 15 │ 16 │ 17 │ 18 │ 19 │ 20 │ 21                                │
│    │    │    │🔴SC│    │    │                                    │
│    │    │    │Eval│    │    │                                    │
│────│────│────│────│────│────│────                               │
│ 22 │ 23 │ 24 │ 25 │ 26 │ 27 │ 28                                │
│🟡Ev│    │⬜REQ│    │    │    │                                    │
│Subm│    │0091│    │    │    │                                    │
└──────────────────────────────────────────────────────────────────┘
```

- Each task appears as a chip on its due date
- Color matches urgency (red = overdue, amber = today, blue = upcoming)
- Multi-day tenders (publication to deadline) shown as a span bar
- Click a date chip to see task detail in right panel
- Week and Month view toggles

---

## 10. Deadline Timeline (Tender Deadlines View)

A secondary view showing major tender milestones (not individual tasks) across all active tenders.

```
TENDER DEADLINES — NEXT 30 DAYS
────────────────────────────────────────────────────────────────────
IT Security Suite     [══════════════════════●] Submission: Jul 15
Cloud Infra Select.   [══════════════●] Evaluation: Jul 22
Network Upgrade       [══════●] Publication: Jul 18
API Platform Repl.    [══════════════════════════════●] Submission: Aug 5
────────────────────────────────────────────────────────────────────
Today: Jul 12
```

Bar length represents relative distance to deadline. Colored bars indicate urgency.

---

## 11. Filters

| Filter | Values |
|---|---|
| Scope | My Tasks / Assigned by Me / All Team |
| Project | Dropdown of accessible projects |
| Tender | Dropdown of active tenders |
| Status | Overdue / Due Today / Due This Week / Due Later / Completed |
| Task Type | System-Generated / Manual |
| Assignee | User picker (admin/PM scope) |
| Priority (manual tasks) | Low / Medium / High |

---

## 12. Bulk Actions

| Action | Applies to |
|---|---|
| Reassign | Selected tasks (requires management permission) |
| Mark complete | Manual tasks only (system tasks complete via their underlying action) |
| Export | All selected |
| Set priority | Manual tasks only |

---

## 13. Reassign Task Flow

```
Reassign Task                                  [✕]
────────────────────────────────────────────────
Task: Score REQ-0044 for DataSafe Ltd
Tender: IT Security Suite

Current Assignee: Sarah Müller (unavailable)

New Assignee: *
[Search user...  Anna Schmidt ×]

Reason (optional):
[Sarah is on leave until 29 Jul]

Note: Reassigning an evaluation task will reset
the evaluation for this supplier if scoring has
not yet started.

────────────────────────────────────────────────
[Cancel]                          [Reassign Task]
```

---

## 14. Add Manual Task Dialog

```
New Task                                       [✕]
────────────────────────────────────────────────
Title *
[________________________________]

Due Date *              Priority
[25 Jul 2024]           [Medium ▾]

Assignee *
[You ▾]

Related Record (optional)
[Link to Project / Tender / Requirement...]

Description
[________________________________]

────────────────────────────────────────────────
[Cancel]                              [Add Task]
```

---

## 15. AI Support

| Feature | Trigger | Display |
|---|---|---|
| At-risk task alert | Task has <24h to deadline and no activity | 🔴 cell in calendar; dashboard notification |
| Workload imbalance | One user has 10+ overdue tasks | "Sarah Müller has 4 overdue tasks — consider reassignment" |
| Smart deadline suggestion | Creating manual task | AI suggests due date based on related tender deadline |
| Task summary | Dashboard AI panel | "You have 5 open tasks. 2 are overdue. The most critical: COI declaration for Cloud Infra by today." |

---

## 16. Export Functions

| Export | Contents |
|---|---|
| My Tasks (CSV) | All tasks assigned to me; status, due date, context |
| Team Tasks (XLSX) | Full team task list; grouped by assignee |
| Deadline Summary (PDF) | Formatted one-page overview of all tender deadlines — suitable for team meetings |
| Calendar Export (.ics) | Import tasks into calendar applications |

---

## 17. Business Rules

| Rule | Enforcement |
|---|---|
| System-generated tasks cannot be deleted | No delete button shown for system tasks |
| Only the task owner or a manager can reassign | Reassign button hidden for other users |
| Completing a system task via direct action marks it done | Opening evaluation and submitting automatically marks the evaluation task complete |

---

## 18. Permissions

| Action | Role | Condition |
|---|---|---|
| View own tasks | Any authenticated user | Always |
| View team tasks | Project Manager, Procurement Manager | Within own tenant |
| Create manual task | Any authenticated user | — |
| Reassign task | Project Manager, Procurement Manager, Admin | — |
| Export team tasks | Project Manager, Procurement Manager | — |

---

## References

- [`Dashboard.md`](./Dashboard.md) — PKB-04-002 — My Tasks panel
- [`Notifications.md`](./Notifications.md) — PKB-04-010 — Task notification integration
- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003 — Layout patterns
