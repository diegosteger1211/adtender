---
id: PKB-04-001
title: Navigation — adtender Application Structure
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
  - PKB-04-003
tags:
  - ui
  - navigation
  - information-architecture
  - routing
---

# Navigation — adtender Application Structure

> This document defines the complete navigation model of adtender: the primary sidebar, top bar, contextual navigation, URL structure, and navigation rules. All workspace documents reference this document for their entry points.

---

## 1. Navigation Philosophy

adtender organizes navigation around **context**, not menus.

The primary navigation reflects the user's current working context: platform-level (across all projects) or project-level (within one project). A user working inside a tender never needs to navigate through the global menu to reach tender-related actions — everything is accessible within the project context.

**Navigation principles:**
- Maximum two levels of primary navigation visible at once
- Current context always visible in breadcrumb and sidebar
- No navigation dead-ends — every screen has a clear path back
- Deep links work: any state of the application is bookmarkable and shareable

---

## 2. Primary Navigation (Left Sidebar)

### 2.1 Platform-Level Navigation

Always visible regardless of context.

| Icon | Label | URL | Description |
|---|---|---|---|
| 🏠 | Home | `/dashboard` | Role-based dashboard |
| 📁 | Projects | `/projects` | All projects the user has access to |
| 📚 | Library | `/library` | Requirement libraries (organizational level) |
| 🏢 | Suppliers | `/suppliers` | Supplier registry and qualification |
| 📊 | Reports | `/reports` | Analytics, dashboards, exports |
| ⚙️ | Admin | `/admin` | Organization settings, users, roles (admin only) |

### 2.2 Project Context Navigation

When a user is inside a project, the sidebar expands to show project-level navigation below the platform items. This replaces none of the platform-level items.

```
─────────────────────
  Home
  Projects           ← active (highlighted)
─────────────────────
  ▸ PROJECT: [Project Name]
  ─────────────────
    Overview
    Requirements
    Tenders
    Team
  ─────────────────
  Library
  Suppliers
  Reports
  Admin
```

| Icon | Label | URL | Description |
|---|---|---|---|
| 📋 | Overview | `/projects/:id` | Project dashboard and status |
| 📝 | Requirements | `/projects/:id/requirements` | Project-scoped requirement workspace |
| 📄 | Tenders | `/projects/:id/tenders` | Tender list for this project |
| 👥 | Team | `/projects/:id/team` | Stakeholders and role assignments |

### 2.3 Tender Context Navigation

When a user is inside a tender, the context expands further:

```
─────────────────────
  ▸ PROJECT: [Project Name]
  ─────────────────
    Overview
    Requirements
    Tenders          ← active
  ─────────────────
  ▸ TENDER: [Tender Name]
  ─────────────────
    Tender Overview
    Requirements
    Suppliers
    Clarifications
    Evaluation
    Decision
```

### 2.4 Sidebar States

| State | Width | Content |
|---|---|---|
| Expanded | 240px | Icon + label + context sections |
| Collapsed | 56px | Icon only + hover tooltip |
| Mobile | 0px (hidden) | Accessible via hamburger icon |

User preference is persisted. Keyboard shortcut: `Cmd/Ctrl + [` to toggle.

---

## 3. Top Bar

Fixed, always visible. Height: 56px.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [▲ adtender] [Acme Corp ▾]    [Breadcrumb]        [🔍 Search] [🔔] [✦] [👤]   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

| Zone | Element | Behavior |
|---|---|---|
| Left | Logo | Click → Dashboard |
| Left | Tenant name + chevron | Dropdown: switch workspace / tenant (for multi-org users) |
| Center | Breadcrumb | Max 3 levels; last item is non-clickable current location |
| Right | Search icon | Opens Global Search overlay (Cmd+K) |
| Right | Notification bell | Opens notification panel; badge shows unread count |
| Right | AI assistant icon (✦) | Toggles AI assistant panel in right sidebar |
| Right | User avatar | Dropdown: profile, preferences, help, sign out |

---

## 4. Breadcrumb

The breadcrumb always reflects the current navigation position.

| Context | Breadcrumb |
|---|---|
| Dashboard | (no breadcrumb) |
| Projects list | Projects |
| Project detail | Projects › [Project Name] |
| Project requirements | Projects › [Project Name] › Requirements |
| Tender detail | Projects › [Project Name] › Tenders › [Tender Name] |
| Tender evaluation | Projects › [Project Name] › [Tender Name] › Evaluation |
| Library | Library |
| Library detail | Library › [Library Name] |
| Supplier profile | Suppliers › [Supplier Name] |

Each segment is a link except the last (current location).

---

## 5. URL Structure

All URLs are deep-linkable. The URL reflects the current state.

### 5.1 Platform-Level URLs

```
/dashboard
/projects
/library
/library/:libraryId
/library/:libraryId/requirements
/suppliers
/suppliers/:supplierId
/reports
/reports/:reportType
/admin
/admin/users
/admin/roles
/admin/settings
```

### 5.2 Project-Level URLs

```
/projects/:projectId
/projects/:projectId/requirements
/projects/:projectId/requirements/:requirementId
/projects/:projectId/tenders
/projects/:projectId/tenders/:tenderId
/projects/:projectId/tenders/:tenderId/requirements
/projects/:projectId/tenders/:tenderId/suppliers
/projects/:projectId/tenders/:tenderId/clarifications
/projects/:projectId/tenders/:tenderId/evaluation
/projects/:projectId/tenders/:tenderId/evaluation/:evaluationId
/projects/:projectId/tenders/:tenderId/decision
/projects/:projectId/team
```

### 5.3 URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `:projectId` | UUID | Project aggregate ID |
| `:tenderId` | UUID | Tender aggregate ID |
| `:requirementId` | UUID | Requirement aggregate ID |
| `:libraryId` | UUID | RequirementLibrary aggregate ID |
| `:supplierId` | UUID | SupplierProfile aggregate ID |
| `:evaluationId` | UUID | Evaluation aggregate ID |
| `:reportType` | string | Report type slug |

### 5.4 Query Parameters

Used for workspace state that should be shareable:

```
/projects/:id/requirements?status=Draft&owner=me&view=kanban
/library/:id?category=Security&sort=lastModified
```

| Parameter | Values |
|---|---|
| `view` | `table`, `card`, `kanban`, `timeline` |
| `status` | Lifecycle state value |
| `owner` | `me`, or UserId |
| `sort` | Field name |
| `order` | `asc`, `desc` |
| `panel` | `ai`, `audit`, `detail` (right panel open state) |

---

## 6. Navigation Rules

### 6.1 Access Control

Navigation items are hidden (not just disabled) when the user does not have permission to access them. A user who cannot access Evaluation sees no Evaluation item in the sidebar.

### 6.2 Project Context Persistence

When the user navigates away from a project context and then returns to "Projects" in the sidebar, the application reopens the last visited project (not the project list), unless the user explicitly navigated to the project list.

### 6.3 Deep Links

Clicking a notification or a shared URL navigates directly to the target record, establishing the correct sidebar context (project context section appears if the target is inside a project).

### 6.4 Navigation Guards

Navigating away from a screen with unsaved changes triggers a confirmation dialog:

```
┌────────────────────────────────────────┐
│  Unsaved changes                       │
│  You have unsaved changes on this      │
│  requirement. Navigating away will     │
│  discard them.                         │
│                                        │
│  [Stay]         [Discard and leave]    │
└────────────────────────────────────────┘
```

Auto-save is active for draft records. Navigation guards only appear for records not covered by auto-save (e.g., complex form dialogs).

### 6.5 Back Navigation

The browser Back button works correctly. The application does not use `replaceState` to hide navigation steps.

---

## 7. Supplier Portal Navigation (Separate Application)

The Supplier Portal is a separate application shell with simplified navigation. Suppliers access only:

```
[adtender Supplier Portal]
─────────────────────────
  Dashboard           ← open invitations, deadlines
  My Responses        ← all tender responses
  Clarifications      ← Q&A threads
  My Profile          ← portal access settings
```

No project-level navigation. No Library or Admin access. The Supplier Portal shares the design system but uses a simplified layout.

---

## 8. Accessibility and Keyboard Navigation

| Shortcut | Action |
|---|---|
| `Tab` | Move focus through interactive nav elements |
| `Enter` or `Space` | Activate focused nav item |
| `Arrow keys` | Navigate within dropdown menus |
| `Escape` | Close open dropdown |
| `Cmd/Ctrl + [` | Toggle sidebar expanded / collapsed |
| `G then H` | Go to Home (sequential shortcut) |
| `G then P` | Go to Projects |
| `G then L` | Go to Library |
| `G then S` | Go to Suppliers |

Sequential shortcuts (`G then X`) do not interfere with text input — they only activate when no input is focused.

---

## References

- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003 — Application shell and layout anatomy
- [`Dashboard.md`](./Dashboard.md) — PKB-04-002 — Dashboard workspace
- [`Global_Search.md`](./Global_Search.md) — PKB-04-009 — Global search overlay
- [`Product_Scope_MVP.md`](../00_Product_DNA/Product_Scope_MVP.md) — PKB-00-005 — Workspace definitions
