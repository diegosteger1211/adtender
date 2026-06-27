---
id: PKB-04-004
title: Requirement Workspace — adtender UI Specification
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
  - PKB-02-001
  - PKB-02F-005
tags:
  - ui
  - workspace
  - requirements
  - library
---

# Requirement Workspace — adtender UI Specification

---

## 1. Purpose

The Requirement Workspace is the primary environment for creating, discovering, structuring and managing Requirements. It serves two distinct scopes, accessible from the same workspace design:

- **Library scope** (`/library`): Organizational Requirement Libraries — the shared knowledge base
- **Project scope** (`/projects/:id/requirements`): Requirements within a specific Project

The Requirement Workspace makes reuse the path of least resistance — browsing and importing from the Library is faster than creating from scratch.

---

## 2. Target Users

| Role | Primary Use |
|---|---|
| Requirement Engineer | Create, structure, review and approve requirements |
| Project Manager | Select requirements for a project from the library; manage project-scope requirements |
| Procurement Manager | Review and finalize requirements before tender creation |
| Library Manager | Curate library content; approve library additions; manage categories |
| AI Agent | Surface relevant requirements; detect duplicates; suggest improvements |

---

## 3. Navigation Entry

| Scope | Sidebar item | URL |
|---|---|---|
| Library (org-level) | Library | `/library` |
| Project Requirements | Requirements (under current project) | `/projects/:id/requirements` |

---

## 4. Page Layout — Library Workspace

```
┌──────────────────────────────────────────────────────────────────┐
│  Library                              [+ Create Library]         │
│  Browse and manage organizational requirement libraries          │
├──────────────────────────────────────────────────────────────────┤
│  [Search libraries...]  [Filter: Type ▾] [Status ▾]  [⊞] [≡]   │
├──────────────────────────────────────────────────────────────────┤
│  LIBRARY CARDS                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ IT Core 2024    │  │ Data Security   │  │ Cloud Services  │  │
│  │ 87 requirements │  │ 42 requirements │  │ 31 requirements │  │
│  │ ● Active        │  │ ● Active        │  │ ○ Draft         │  │
│  │ [Open] [Import] │  │ [Open] [Import] │  │ [Open]          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Library Card content:**
- Library name and code
- Type badge (Domain / Compliance / Template / Function)
- Requirement count
- Status badge
- Last updated date
- Quick actions: Open, Import to Project (when in project context)

---

## 5. Page Layout — Library Detail (Requirement List)

When a library is opened:

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Library    IT Core Requirements Library (RM-IT-CORE-2024)    │
│  87 requirements  ● Active    Last updated: 2 days ago          │
│  [Add Requirement] [Import CSV] [Review Library]  [⋮]           │
├────────────────────────┬─────────────────────────────────────────┤
│  FILTER SIDEBAR        │  REQUIREMENT TABLE                      │
│                        │                                         │
│  Category              │  Code      Title         Status  Owner  │
│  ☑ Security (12)       │  ──────────────────────────────────     │
│  ☑ Data (8)            │  REQ-0042  Data Encryp…  Approved  JD  │
│  ☑ Network (15)        │  REQ-0043  Access Ctrl…  Approved  JD  │
│  ☑ Compliance (22)     │  REQ-0044  Audit Loggi…  Review   AM   │
│                        │  REQ-0045  Backup Poli…  Draft    AM   │
│  Priority              │                                         │
│  ○ Critical (8)        │  [Load more]                            │
│  ○ High (21)           │                                         │
│  ○ Medium (35)         │                                         │
│  ○ Low (23)            │                                         │
│                        │                                         │
│  Status                │                                         │
│  ○ Approved (71)       │                                         │
│  ○ Review (9)          │                                         │
│  ○ Draft (7)           │                                         │
└────────────────────────┴─────────────────────────────────────────┘
```

---

## 6. Page Layout — Project Requirements Workspace

When accessed from a project context:

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Project: IT Modernization 2024                               │
│  Requirements    42 requirements  ● Active                      │
│  [+ Add from Library]  [+ Create New]  [Import]    [Publish]    │
├──────────────────────────────────────────────────────────────────┤
│  [Search…] [Status ▾] [Category ▾] [Priority ▾] [Owner ▾]  [⊞ Table][⊟ Kanban] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TABLE / KANBAN VIEW                                             │
│                                                                  │
│  Code     │ Title              │ Category   │ Priority │ Status  │
│  ─────────┼────────────────────┼────────────┼──────────┼───────  │
│  REQ-0042 │ Data Encryption    │ Security   │ Critical │ ✅ App  │
│  REQ-0043 │ Access Control     │ Security   │ High     │ ✅ App  │
│  REQ-0044 │ Audit Logging      │ Compliance │ High     │ 🔄 Rev  │
│  REQ-0045 │ Backup Policy      │ Data       │ Medium   │ ✏️ Draft │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Toolbar Actions

| Action | Availability | Description |
|---|---|---|
| **+ Create New** | Always | Open new requirement form in right panel |
| **+ Add from Library** | Project scope | Opens Library browser to import requirements |
| **Import CSV** | Library Manager | Bulk import from structured CSV |
| **Publish Library** | Library Manager, Draft library | Transitions library Draft → Active |
| **Review Library** | Library Manager, Active library | Initiates governance review |
| **Export** | All | Export visible requirements as CSV / XLSX / PDF |
| **Filter** | Always | Open filter sidebar |
| **View Toggle** | Always | Table / Card / Kanban |

---

## 8. Filters

### Quick Filter Chips (always visible in toolbar)
- Status (multi-select: Draft, Review, Approved)
- Category (configured per library/organization)
- Priority (Critical, High, Medium, Low)
- Owner (Me, Unassigned, or user picker)

### Advanced Filter Panel (expanded sidebar)
- Date range: created, last modified
- Version: latest only / all versions
- Source: library name (when in project scope)
- Tags / keywords
- AI quality score (when AI scoring is enabled)

### Saved Views
Users can save any filter combination as a named view (e.g., "My Draft Requirements", "Critical Security Requirements"). Saved views appear as tabs above the filter bar.

---

## 9. Requirement Table — Columns

Default columns (configurable per user):

| Column | Type | Sortable | Description |
|---|---|---|---|
| Code | Text | Yes | REQ-YYYY-NNNN |
| Title | Text | Yes | Requirement title (truncated) |
| Category | Badge | Yes | Configured category |
| Priority | Badge | Yes | Critical / High / Medium / Low |
| Status | Badge | Yes | Draft / Review / Approved |
| Version | Text | No | Current version number |
| Owner | Avatar | Yes | Assigned owner |
| Library | Text | Yes | Source library (project scope) |
| Last Modified | Date | Yes | Relative date |
| AI Score | Icon | No | Quality indicator (AI-assessed) |

Optional columns (hidden by default):
- Description excerpt
- Tags
- Approval date
- Tender usage count

---

## 10. Requirement Detail Panel

Opens in the right panel on single-click. Full detail view on double-click or Enter.

### Right Panel (Preview)
```
[REQ-2024-0042]  ● Approved
Data Encryption at Rest

Category: Security  Priority: Critical
Owner: Jane Doe  Version: 2.0

─── Description ───────────────────────
All data stored by the system must be
encrypted using AES-256 or stronger…

─── Quick Actions ──────────────────────
[Submit for Review]  [Clone]  [View Full]
```

### Full Detail View (Tabs)

**Details tab**
- Title, code, description, acceptance criteria
- Category, priority, type
- Tags
- Current version and version history link

**History tab**
- Timeline of all state changes
- Version comparison (select two versions to diff)
- Who changed what and when

**Related tab**
- Libraries this requirement belongs to
- Projects using this requirement
- Tenders that include this requirement version
- Linked requirements (dependencies, conflicts)

**AI tab**
- AI quality assessment (completeness, clarity, testability)
- Duplicate detection results
- Improvement suggestions
- Reuse recommendations

**Comments tab**
- Threaded comments
- Review notes
- @mention support

---

## 11. Create / Edit Requirement Dialog

A side panel (not a full-page form) opens for creation and editing.

```
New Requirement                                [✕]
────────────────────────────────────────────────
Title *
[____________________________________]
AI: "Try to be specific and measurable"  [Show]

Description
[Multi-line text area]
[✦ AI: Improve wording]  [✦ AI: Check completeness]

Acceptance Criteria
[+ Add criterion]

Category *
[Security ▾]

Priority *
[Critical ▾]

Owner
[Jane Doe  ▾]

Tags
[+ Add tag]

────────────────────────────────────────────────
[Save Draft]            [Save & Submit for Review]
```

- Auto-save as Draft every 30 seconds
- AI quality score updates in real time as the user types
- "Submit for Review" triggers the review workflow

---

## 12. Import from Library

When "+ Add from Library" is clicked in a project context:

```
Add from Library                                [✕]
────────────────────────────────────────────────
Search requirements        [🔍 ________________]
AI: "Looking for Security requirements?"

Filter:  [Library ▾]  [Category ▾]  [Priority ▾]

Results                               [Select all]
─────────────────────────────────────────────────
☑  REQ-0042  Data Encryption at Rest  IT Core
   "AES-256 required for all stored data..."
   Priority: Critical  ● Approved  v2.0

☑  REQ-0043  Access Control Policy    IT Core
   "Role-based access for all systems..."
   Priority: High  ● Approved  v1.3

☐  REQ-0044  Audit Logging            Security Lib
   "Full audit trail for admin actions..."
   Priority: High  ● Approved  v1.0

─────────────────────────────────────────────────
3 selected                  [Cancel]  [Add to Project]
```

---

## 13. Kanban View (Project Scope)

Columns: Draft → Review → Approved

Each card shows: code, title (truncated), priority dot, owner avatar. Cards are draggable between columns, which triggers a lifecycle transition (with confirmation if moving backward).

---

## 14. AI Assistant Integration

| AI Feature | Trigger | Behavior |
|---|---|---|
| Duplicate detection | On requirement save | Alert chip if near-duplicate found in library |
| Wording improvement | "✦ AI: Improve" button | Inline suggestion in the edit panel |
| Completeness check | On status change to Review | Score card with missing elements highlighted |
| Reuse suggestion | On title entry | "3 similar requirements found in Library" |
| Category suggestion | On description entry | AI suggests category from content |
| Quality score | Real-time in edit mode | 0–100 score with breakdown |

All AI actions produce suggestions in the `[✦ AI]` chip format. Nothing is applied without user confirmation.

---

## 15. Drag and Drop

- Kanban view: drag cards between status columns (triggers state transition)
- Table reorder: drag rows to reorder within a project's requirement list (custom sort order)
- Import: drag a CSV file onto the workspace to trigger import flow

---

## 16. Inline Editing

Available for: Title, Category, Priority, Owner (in table view). Click the field to edit in place. Auto-saves on blur.

Not available for: Description, Acceptance Criteria (opens side panel), Status (uses workflow commands).

---

## 17. Bulk Actions

Available when rows are selected:

| Action | Available when |
|---|---|
| Submit for Review | Any Draft requirements selected |
| Approve | Requirements in Review; requires appropriate role |
| Assign Owner | Any |
| Change Category | Draft or Review |
| Add to Library | Approved requirements (Library Manager) |
| Export Selected | Any |
| Clone | Any |
| Archive | Approved (with no active Tender dependencies) |

---

## 18. Export Functions

| Format | Contents |
|---|---|
| CSV | All visible columns; respects active filters |
| XLSX | Formatted with status colors; includes metadata |
| PDF | Formatted requirement document (one page per requirement or table format) |
| JSON | Full structured export for API integration |

---

## 19. Keyboard Shortcuts (Requirement Workspace)

| Shortcut | Action |
|---|---|
| `N` | New requirement |
| `L` | Open library browser |
| `F` | Focus filter search |
| `V K` | Switch to Kanban view |
| `V T` | Switch to Table view |
| `Space` | Preview selected requirement |
| `Enter` | Open full detail |
| `E` | Edit selected requirement |
| `Cmd/Ctrl + Enter` | Save and submit for review |
| `Cmd/Ctrl + S` | Save draft |
| `A` | AI: analyze selected requirement |

---

## 20. Permissions

| Action | Role Required | Condition |
|---|---|---|
| View requirements | Any authenticated user | Within own Tenant |
| Create requirement | Requirement Engineer, Project Manager | Project scope only |
| Edit Draft requirement | Owner, Requirement Engineer | Draft state only |
| Submit for Review | Owner, Requirement Engineer | Draft state |
| Approve requirement | Library Manager, Senior Requirement Engineer | Review state |
| Add to Library | Library Manager | Approved requirements only |
| Publish Library | Library Manager | Draft library with ≥1 entry |
| Import CSV | Library Manager | Library scope |
| Export | Any role with view access | — |
| Archive requirement | Library Manager | No active Tender dependencies |

---

## References

- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003 — Layout patterns
- [`Tender_Workspace.md`](./Tender_Workspace.md) — PKB-04-005 — Requirements flow into Tenders
- [`Requirement.md`](../02_Domain_Model/Requirement.md) — PKB-02-001 — Domain model
- [`RequirementLibrary.md`](../02_Foundation/RequirementLibrary.md) — PKB-02F-005 — Library domain model
