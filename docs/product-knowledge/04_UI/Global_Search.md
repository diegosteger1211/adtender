---
id: PKB-04-009
title: Global Search — adtender UI Specification
version: 1.0
status: APPROVED
owner: UX Architecture
audience:
  - UX Designer
  - Frontend Developer
  - AI Development Agent
depends_on:
  - PKB-04-001
  - PKB-04-003
tags:
  - ui
  - search
  - navigation
  - global
---

# Global Search — adtender UI Specification

---

## 1. Purpose

Global Search is the fastest path to any record in adtender. It is not a simple filter — it is a command interface that allows users to navigate, discover, and take action without leaving their current context.

Global Search surfaces:
- Business objects (Projects, Tenders, Requirements, Suppliers, Decisions)
- Recent items
- Quick navigation commands
- Keyboard shortcuts

---

## 2. Activation

| Method | Action |
|---|---|
| Keyboard | `Cmd/Ctrl + K` from anywhere in the application |
| Mouse | Click the search icon in the Top Bar |
| Mobile | Tap the search icon |

The search overlay appears as a centered modal with a dark backdrop. It does not navigate away from the current page — the user returns to the same context after selecting a result.

---

## 3. Search Overlay Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [🔍  Search requirements, tenders, suppliers...   ]  [Esc]     │
├──────────────────────────────────────────────────────────────────┤
│  RECENT                                              [Clear all] │
│  📝 REQ-0042  Data Encryption at Rest               Requirement  │
│  📄 TND-2024-0007  IT Security Suite Evaluation     Tender       │
│  🏢 Acme Systems AG                                 Supplier     │
│  📁 IT Modernization 2024                           Project      │
├──────────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS                                                   │
│  + New Requirement                                               │
│  + New Tender                                                    │
│  + Register Supplier                                             │
│  ⚙ Go to Admin                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Default state (no query): shows Recent items and Quick Actions.

---

## 4. Search Results Layout

When the user types:

```
┌──────────────────────────────────────────────────────────────────┐
│  [🔍  data encryption          ]  [Esc]                         │
├──────────────────────────────────────────────────────────────────┤
│  RESULTS FOR "data encryption"                                   │
│                                                                  │
│  REQUIREMENTS (4)                                    [See all →] │
│  📝 REQ-0042  Data Encryption at Rest                ● Approved  │
│     IT Core Library  ·  Security  ·  Critical                   │
│  📝 REQ-0091  Data Encryption in Transit             ● Approved  │
│     IT Core Library  ·  Security  ·  High                       │
│  📝 REQ-0113  Data Encryption Key Management         ● Review    │
│     Data Security Library  ·  Compliance                        │
│                                                                  │
│  TENDERS (1)                                         [See all →] │
│  📄 TND-2024-0007  IT Security Suite Evaluation      ● Published │
│     IT Modernization 2024  ·  Deadline: 15 Jul 2024             │
│                                                                  │
│  SUPPLIERS (1)                                                   │
│  🏢 DataSafe Ltd  ·  Data Security  ·  ● Qualified              │
│                                                                  │
│  ─── Press ↑↓ to navigate  ·  Enter to open  ·  Esc to close ──│
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Result Types

| Type | Icon | Fields searched |
|---|---|---|
| Project | 📁 | Name, description, code |
| Requirement | 📝 | Title, description, code, tags |
| Tender | 📄 | Title, code, description |
| Supplier | 🏢 | Company name, registration number, category |
| Library | 📚 | Name, description, code |
| Decision | ⚖️ | Tender name, awarded supplier, justification snippet |
| User | 👤 | Name, email (admin only) |

---

## 6. Search Behavior

### 6.1 Instant Results

Results appear after the user types 2+ characters. No search button required.

### 6.2 Ranking

Results are ranked by:
1. Exact code match (e.g., "REQ-0042")
2. Title prefix match
3. Full-text match in title
4. Full-text match in description
5. Recently accessed (recency boost)

### 6.3 Tenant Scoping

All results are automatically scoped to the authenticated user's Tenant. Cross-tenant results are never shown (GBR-021).

### 6.4 Permission Scoping

Results only include records the user has permission to view. An Evaluator does not see Decision records they are not authorized to access.

### 6.5 Highlighting

Matched terms are highlighted in the result snippet.

---

## 7. Filters

After a search query is entered, type-filters appear:

```
[🔍 data encryption] [All ▾] [Requirements ▾] [Tenders ▾] [Suppliers ▾] [Status ▾]
```

Selecting a type narrows results to that type only. Status filter shows lifecycle states for the selected type.

---

## 8. Keyboard Navigation

| Key | Action |
|---|---|
| `↑` `↓` | Navigate through results |
| `Enter` | Open highlighted result |
| `Shift + Enter` | Open in new tab |
| `→` | Open right panel preview for highlighted result |
| `Tab` | Move between result groups (Requirements, Tenders, etc.) |
| `Escape` | Close search overlay, return to previous context |
| `Cmd/Ctrl + K` (while open) | Clear query |

---

## 9. Quick Commands

When the user types `/`, a command palette mode activates:

```
[🔍  /                           ]
────────────────────────────────────────────────────────────────────
COMMANDS
  /new requirement          Create a new Requirement
  /new tender               Create a new Tender
  /new project              Create a new Project
  /register supplier        Register a new Supplier
  /go settings              Navigate to Organization Settings
  /go admin                 Navigate to Admin panel
  /help                     Open help documentation
```

Commands allow keyboard-first users to create records or navigate without touching the mouse.

---

## 10. Recent Items

Shown when the search field is empty. Last 10 accessed records, per user.

- Stored per user identity
- Clears when a record is deleted or archived
- "Clear all" removes recent items from the UI (does not affect history)

---

## 11. Search-Within (Workspace Search)

Distinct from Global Search. Each workspace has an inline search bar that searches only within that workspace's data set (e.g., search within a library, search within a project's requirements).

Workspace search does not use the `Cmd+K` shortcut — it is a standard text input within the workspace toolbar.

---

## 12. AI-Assisted Search (Phase 2)

Future enhancement (not MVP+):

- Natural language queries: "show me requirements about data privacy from the last 3 months"
- Semantic similarity: "requirements similar to REQ-0042"
- Cross-tender patterns: "suppliers who performed well in security evaluations"

Planned as a Phase 2 enhancement. The search infrastructure must be designed to support this extension.

---

## 13. Permissions

| Feature | Available to |
|---|---|
| Search all record types | Any authenticated user (results scoped to permissions) |
| Quick commands | Role-appropriate commands only |
| Admin search (users, org settings) | Organization Admin only |
| Cross-type search | All roles |

---

## References

- [`Navigation.md`](./Navigation.md) — PKB-04-001 — Top bar search trigger
- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003 — Workspace search pattern
