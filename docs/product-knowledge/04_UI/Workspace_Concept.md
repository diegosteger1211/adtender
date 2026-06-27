---
id: PKB-04-003
title: Workspace Concept — adtender UI Architecture
version: 1.0
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Frontend Developer
  - Product Manager
  - AI Development Agent
depends_on:
  - PKB-00-MASTER
  - PKB-00-005
  - PKB-04-001
tags:
  - ui
  - workspace
  - layout
  - ux-architecture
---

# Workspace Concept — adtender UI Architecture

> This document defines the fundamental UI architecture of adtender: the Workspace pattern, application shell, layout anatomy, and the shared component vocabulary used across all workspaces. Every workspace document inherits from this specification.

---

## 1. The Workspace Philosophy

adtender is not a collection of pages. It is a collection of **Workspaces**.

A Workspace is a persistent, role-appropriate work environment for a major phase of the tender lifecycle. Unlike a page, a workspace:

- Remembers state between sessions (last open record, applied filters, column preferences)
- Exposes the full toolset for its domain — not just the currently selected record
- Keeps the user oriented within their job-to-be-done at all times
- Answers the question: **"What do I need to do next?"** on every visit

A page is visited. A Workspace is inhabited.

---

## 2. Application Shell

The application shell is the persistent container that wraps every workspace. It never fully reloads between navigation events.

```
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR                                                         │
│  [Logo + Tenant] [Breadcrumb]        [Search] [Notif] [User]    │
├──────────┬──────────────────────────────────────────────────────┤
│          │  WORKSPACE HEADER                                     │
│   LEFT   │  [Title] [Status] [Tabs?]         [Workspace Actions]│
│          ├──────────────────────────────────────────────────────┤
│   SIDE   │  WORKSPACE TOOLBAR                                    │
│          │  [Filters] [View Toggle] [Sort] [Bulk Actions]       │
│   BAR    ├───────────────────────────────────┬──────────────────┤
│          │                                   │                  │
│  (240px) │  MAIN CONTENT AREA                │  RIGHT PANEL     │
│          │                                   │  (detail /       │
│  or 56px │  List / Table / Kanban /          │   context /      │
│  icons   │  Timeline / Detail view           │   AI)            │
│          │                                   │  (400px,         │
│          │                                   │   optional)      │
│          ├───────────────────────────────────┴──────────────────┤
│          │  STATUS BAR (optional)                               │
│          │  [Record count] [Selection info] [Last saved]        │
└──────────┴──────────────────────────────────────────────────────┘
```

### 2.1 Top Bar

Fixed 56px height. Always visible.

| Zone | Content |
|---|---|
| Left | adtender logo (links to Dashboard); current Tenant name |
| Center-left | Breadcrumb — current workspace > current record (max 3 levels) |
| Right | Global Search (Cmd/Ctrl+K); Notification bell; AI Assistant toggle; User avatar menu |

### 2.2 Left Sidebar

Collapsible. Default: 240px expanded. Collapsed: 56px icon-only. State persisted per user.

| Element | Behavior |
|---|---|
| Primary nav items | Icon + label when expanded; icon + tooltip when collapsed |
| Active indicator | Left border accent, background highlight |
| Sub-navigation | Expands inline (accordion) when parent is active |
| Workspace context | Current Project name shown below primary nav when inside a Project |
| Bottom | Collapse toggle; Settings; Help |

### 2.3 Right Panel

Optional. Slides in from the right (400px). Used for:
- Record detail preview (without full navigation)
- AI Assistant chat
- Contextual help
- Audit trail for the selected record

Opened by: clicking a record in list view, pressing `Space` on a selected row, or clicking the AI Assistant button.

Closed by: pressing `Escape`, clicking outside, or clicking the close button.

---

## 3. Workspace Layout Anatomy

Every workspace follows this internal structure.

### 3.1 Workspace Header

```
┌──────────────────────────────────────────────────────────────────┐
│  [Icon] Workspace Title          [Status Badge]      [Action CTA]│
│  Subtitle / description line                    [Secondary actions]│
│  [Tab 1] [Tab 2] [Tab 3]  ←── optional tabbed sub-sections      │
└──────────────────────────────────────────────────────────────────┘
```

- **Title**: Workspace name or current record name
- **Status Badge**: Lifecycle state of the current context (color-coded)
- **Primary CTA**: The single most-important action for the current state (e.g., "Publish Tender")
- **Secondary actions**: Overflow menu for less-common actions
- **Tabs**: Used when a workspace has distinct sub-views (e.g., Overview / Requirements / Suppliers)

### 3.2 Workspace Toolbar

```
┌──────────────────────────────────────────────────────────────────┐
│  [+ New]  [Filter ▾]  [Group ▾]  [Sort ▾]  │  [⊞ Table] [⊟ Kanban] [≡ List]  │  [Export ▾]  │
└──────────────────────────────────────────────────────────────────┘
```

- Left zone: Creation and primary data manipulation actions
- Center zone: View controls (filters, grouping, sort, search-within)
- Right zone: View mode toggles; export
- Separator (`│`) divides zones visually

### 3.3 Filter Bar

Appears below the toolbar when filters are active. Shows applied filters as removable chips.

```
Active filters:  [Status: Active ✕]  [Owner: Me ✕]  [Category: IT ✕]   [Clear all]
```

- Each filter is a chip with a remove button
- "Clear all" removes all active filters
- Saved Views: a named filter set can be saved and recalled

### 3.4 Main Content Area

Supports four display modes, toggled from the toolbar:

| Mode | Icon | Best for |
|---|---|---|
| **Table** | grid icon | High-density list with sortable columns; default for most workspaces |
| **Card Grid** | cards icon | Visual browsing (e.g., library cards, dashboard widgets) |
| **Kanban** | columns icon | Lifecycle stage visualization (e.g., Requirements by status) |
| **Timeline** | timeline icon | Date-based views (e.g., Project milestones, Tender deadlines) |

Mode preference is persisted per workspace per user.

### 3.5 Detail View

When a record is opened (single-click → right panel preview; double-click or Enter → full detail view):

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to list                     [Edit] [More ▾]  [Status ▾] │
├──────────────────────────────────────────────────────────────────┤
│  RECORD HEADER                                                    │
│  [Code]  Title                               [Status Badge]      │
│  Meta: Owner | Created | Last modified | Version                 │
├────────────────────────────────┬─────────────────────────────────┤
│  CONTENT AREA                  │  SIDE PANEL                     │
│  (tabs: Details / History /    │  Properties                     │
│   Related / AI / Comments)     │  Quick links                    │
│                                │  Audit trail                    │
└────────────────────────────────┴─────────────────────────────────┘
```

---

## 4. Common Component Vocabulary

These components appear consistently across all workspaces.

### 4.1 Status Badge

Color-coded, consistent across the platform.

| Color | States |
|---|---|
| Gray | `Draft`, `Provisioning` |
| Blue | `Active`, `InProgress`, `Scoring` |
| Yellow/Amber | `Review`, `QualificationPending`, `Closing` |
| Green | `Approved`, `Qualified`, `Submitted`, `Published` |
| Orange | `Suspended` |
| Red | `Cancelled`, `Overdue`, `Rejected` |
| Purple | `Archived` |

### 4.2 Record Code

Every Business Object has a unique, human-readable code (e.g., `REQ-2024-0042`, `TND-2024-0007`). Always shown with the title; never omitted from detail views.

### 4.3 Action Button Hierarchy

| Type | Appearance | Use |
|---|---|---|
| Primary | Filled, brand color | One per view; the most important next action |
| Secondary | Outlined | Common supporting actions |
| Ghost | Text only | Low-emphasis actions |
| Danger | Red fill | Destructive or irreversible actions; always requires confirmation dialog |
| Icon | Icon only | Toolbar actions; always has tooltip |

### 4.4 Inline Editing

Fields that support inline editing show an edit icon on hover. Clicking activates the field in place. Saving is automatic on blur or explicit with Enter. Escape cancels.

Inline editing is only available in `Draft` or `Active` states. `Approved` and `Published` records show a lock icon; the edit action creates a new version.

### 4.5 Bulk Actions

When rows are selected in table view, a Bulk Actions bar appears above the table:

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ 5 selected   [Submit for Review]  [Assign Owner]  [Export]  [✕]│
└──────────────────────────────────────────────────────────────────┘
```

Bulk actions are context-sensitive: only valid actions for the current selection state are shown.

### 4.6 Confirmation Dialogs

Required for all irreversible or significant actions.

```
┌────────────────────────────────────┐
│  [!] Publish Tender                │
│                                    │
│  This will make the Tender visible │
│  to all invited Suppliers.         │
│  This action cannot be undone.     │
│                                    │
│  [Cancel]          [Publish Tender]│
└────────────────────────────────────┘
```

Danger actions use a red confirmation button. The user must read the consequences before confirming.

### 4.7 Empty States

Every list/table has a designed empty state:
- Illustration or icon
- Title: what is missing
- Subtitle: why it might be empty
- Call-to-action: the natural first step

### 4.8 AI Suggestion Chip

AI-generated content is always visually distinguished:

```
[✦ AI]  Suggested: "Include Section 3.2 on data security compliance"
         Based on: Similar tenders in IT infrastructure category
         [Accept]  [Edit]  [Dismiss]
```

- Purple `[✦ AI]` tag on all AI-generated content
- Source indication ("Based on: ...")
- Always offers Accept / Edit / Dismiss — never auto-applies

---

## 5. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| ≥1440px (large desktop) | Sidebar expanded (240px) + right panel available |
| 1024–1439px (desktop) | Sidebar expanded; right panel available but narrower (320px) |
| 768–1023px (tablet) | Sidebar collapsed to icons (56px); right panel slides over content |
| <768px (mobile) | Sidebar hidden, accessible via hamburger menu; no right panel |

Enterprise primary use case is desktop (1280px+). Tablet is a supported secondary. Mobile is limited to dashboards and read-only views.

---

## 6. Keyboard Navigation

Global keyboard shortcuts are available everywhere:

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + K` | Open Global Search |
| `Cmd/Ctrl + /` | Show keyboard shortcut reference |
| `?` | Context-sensitive help |
| `Escape` | Close panel / dialog / cancel edit |
| `N` | New record (in workspace context) |
| `Space` | Open right panel preview for selected row |
| `Enter` | Open full detail for selected row |
| `↑ ↓` | Navigate rows in table |
| `Cmd/Ctrl + A` | Select all visible rows |
| `Shift + Click` | Range select rows |

Workspace-specific shortcuts are defined in each workspace document.

---

## 7. State Persistence

The following workspace state is persisted per user, per workspace:

| State | Persisted? |
|---|---|
| Applied filters | Yes — survives browser close |
| Selected view mode (table/card/kanban) | Yes |
| Column visibility and order | Yes |
| Sort column and direction | Yes |
| Saved views (named filter sets) | Yes |
| Right panel open/closed | Yes |
| Sidebar expanded/collapsed | Yes |
| Last accessed project context | Yes |

State is stored per user identity, not per browser/device. The user gets the same workspace state on any device.

---

## 8. Loading and Error States

### 8.1 Loading

- Skeleton screens for content areas (not spinners)
- Table rows load as skeleton rows; detail panels show skeleton fields
- No full-page loading spinners

### 8.2 Error States

- Inline error messages (not toasts) for form validation
- Toasts (non-blocking) for operation confirmations: "Requirement approved"
- Error banners at the top of the workspace for system-level issues
- Structured error messages: domain error code + human-readable explanation

### 8.3 Optimistic Updates

UI updates immediately on user action; reverts if the server returns an error. The user sees the result of their action instantly without waiting for a network round-trip.

---

## 9. Accessibility

- WCAG 2.1 AA compliance minimum
- All interactive elements are keyboard accessible
- Focus management: after dialog close, focus returns to the trigger element
- Screen reader support: ARIA labels on icons, status badges, and AI content
- Color is never the sole indicator of meaning (always paired with icon or text)
- Minimum contrast ratio: 4.5:1 for normal text

---

## References

- [`Navigation.md`](./Navigation.md) — PKB-04-001 — Application shell and navigation model
- [`Dashboard.md`](./Dashboard.md) — PKB-04-002 — Role-based dashboard specifications
- [`Product_Scope_MVP.md`](../00_Product_DNA/Product_Scope_MVP.md) — PKB-00-005 — Workspace list and UX principles
- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — PKB-00-MASTER — UI principles §14; AI principles §10
