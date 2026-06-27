---
id: PKB-04-015
title: Clarification Workspace — adtender UI Specification
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
  - PKB-04-005
tags:
  - ui
  - workspace
  - clarification
  - supplier-communication
  - equal-treatment
---

# Clarification Workspace — adtender UI Specification

---

## 1. Purpose

The Clarification Workspace manages structured Q&A between Suppliers and the Buyer during an active tender. It ensures that:

1. Suppliers can ask questions and receive answers before the submission deadline
2. The **equal treatment principle** is enforced — answers that are relevant to all suppliers are published to everyone, anonymized
3. All communication is traceable, auditable, and stored as part of the tender record

Clarification management was previously a minor tab within the Tender Workspace. Based on reference analysis, it is elevated to a first-class workspace within the tender context, with its own dedicated UI optimized for Q&A management.

---

## 2. Target Users

| Role | Primary Use |
|---|---|
| Procurement Manager | Receive questions; draft and publish answers; manage threads |
| Legal / Compliance | Review answers before publication |
| Supplier (Portal) | Post questions; receive answers |
| Project Manager | Read-only view of clarification history |

---

## 3. User Goals

**Buyer:**
- Process incoming questions efficiently
- Ensure equal treatment (publish relevant answers to all)
- Track open vs. answered threads
- Meet the clarification deadline

**Supplier (Portal):**
- Get answers to ambiguous requirements before committing to a response
- See all published answers (including those originally asked by other suppliers)

---

## 4. Navigation Entry

Within a Tender, via the sidebar context navigation:

```
▸ TENDER: IT Security Suite
  ─────────────────────────
  → Overview
  → Requirements
  → Suppliers
  → Clarifications    ← this workspace
  → Evaluation
  → Decision
```

URL: `/projects/:projectId/tenders/:tenderId/clarifications`

Availability: Active when tender is in `Published` or `SubmissionClosed` state (read-only after close).

---

## 5. Layout Concept

```
┌──────────────────────────────────────────────────────────────────┐
│  Clarifications — IT Security Suite                             │
│  🗓 Clarification deadline: 12 Jul 2024  (3 days remaining)    │
│  Open: 3  ·  Answered: 2  ·  Published to All: 5              │
├───────────────────────────┬──────────────────────────────────────┤
│  THREAD LIST (left)       │  THREAD DETAIL (right)               │
│                           │                                      │
│  [Open (3)] [Answered (2)]│  ┌──────────────────────────────┐   │
│  [Draft (1)] [All (8)]    │  │  Thread: Q-2024-0015          │   │
│                           │  │  Acme Systems  ·  15 Jun 2024 │   │
│  ─────────────────────    │  │  ● Open  ·  Not yet published │   │
│  ● Q-2024-0015            │  │  ─────────────────────────── │   │
│  Acme Systems · Open      │  │  QUESTION                     │   │
│  "Can REQ-0042 be         │  │  "Can REQ-0042 be interpreted │   │
│  interpreted to exclude…" │  │   to exclude backup storage   │   │
│  2 days ago               │  │   encrypted by the cloud..."  │   │
│                           │  │                               │   │
│  ─────────────────────    │  │  RELATED REQUIREMENT          │   │
│  🟡 Q-2024-0016           │  │  REQ-0042 Data Encryption     │   │
│  TechSolutions · Open     │  │  [View Requirement]           │   │
│  "Is Section 4 format...  │  │                               │   │
│  mandatory?"              │  │  DRAFT ANSWER                 │   │
│  3 days ago               │  │  [No, cloud provider-managed  │   │
│                           │  │   encryption may be used if   │   │
│  ─────────────────────    │  │   AES-256 equivalent...]       │   │
│  ✅ Q-2024-0014            │  │  [Edit Answer]                │   │
│  CyberShield · Answered   │  │                               │   │
│  "Does pricing include..." │  │  PUBLISH OPTIONS              │   │
│  5 days ago               │  │  ○ Answer this supplier only  │   │
│                           │  │  ● Publish to ALL suppliers   │   │
│                           │  │    (equal treatment)          │   │
│                           │  │    Anonymize: ✅              │   │
│                           │  │                               │   │
│                           │  │  [Save Draft]  [Publish Answer]│  │
│                           │  └──────────────────────────────┘   │
└───────────────────────────┴──────────────────────────────────────┘
```

---

## 6. Thread List (Left Panel)

### Thread Entry

Each thread in the list shows:
- Thread ID (Q-YYYY-NNNN)
- Supplier name
- Status badge
- Question excerpt (first 60 characters)
- Relative age

### Status Badges

| Badge | Color | Meaning |
|---|---|---|
| Open | Blue | Question received; not yet answered |
| Draft | Amber | Answer drafted but not published |
| Answered (Private) | Green outline | Answered; answer sent to this supplier only |
| Published to All | Green filled | Answer published to all suppliers |
| Archived | Gray | No longer relevant (withdrawn or expired) |

### Thread List Tabs

| Tab | Contents |
|---|---|
| Open | Requires action from Procurement Manager |
| Answered | Threads with a final answer (private or published) |
| Draft | Threads with a draft answer (not yet published) |
| All | Full thread history |

### Thread List Toolbar

```
[🔍 Search threads...]  [Supplier ▾]  [Status ▾]  [Requirement ▾]  [Export]
```

---

## 7. Thread Detail (Right Panel)

### Thread Header

- Thread ID, creation date
- Supplier company name
- Status badge
- Related requirement (if supplier referenced one in their question)

### Question Display

Full question text, formatted. Supplier's original formatting preserved. No editing by buyer.

### Related Requirement Link

If the question references a specific requirement, a card shows:
- Requirement code and title
- Requirement excerpt
- [View Requirement] button

### Answer Area

A rich text editor for the buyer's answer.

- Auto-saves as draft every 30 seconds
- Can be edited multiple times before publishing
- AI draft available: "✦ AI: Draft answer" — generates a proposed response from the requirement text and acceptance criteria

### Publish Options

```
Publish Options:
  ○ Answer this supplier only
    (supplier will receive a direct reply; other suppliers will not see it)

  ● Publish to ALL suppliers (Equal Treatment)
    All invited suppliers will receive this answer.
    
    ✅ Anonymize supplier name
       The answer will show: "Question from: [Supplier]" → "Anonymous"
    
    ✅ Include in tender amendment notice
       If this answer materially changes a requirement, include in
       formal amendment notification.
```

**Rationale:** The equal treatment principle requires that answers materially relevant to all suppliers be shared with everyone. The UI makes "Publish to All" the default option for answers to requirement-related questions.

---

## 8. Clarification Answer Workflow

### States for a thread

```
Open → Draft Answer → [Review?] → Published (to one or to all)
  └──────────────────────────────→ Archived
```

**Optional internal review step:**
If enabled in tender configuration, answers require a secondary reviewer (e.g., Legal) before publishing. This adds a `Pending Review` state.

### Publishing to All

When "Publish to All" is confirmed:
1. All invited suppliers receive an in-app notification and email
2. The answer appears in the Supplier Portal "Published Q&A" section
3. If "Include in amendment notice" is checked, a formal amendment record is created
4. Thread status → Published to All
5. Audit record created: who published, when, content

---

## 9. Supplier Portal — Clarification View

Suppliers see clarifications from two angles:

**My Questions tab:**
- Questions they posted + answers received

**All Published Q&A tab:**
- All questions that were published to all suppliers (anonymized)
- Sorted by publication date
- Filterable by requirement

This ensures suppliers have access to all clarifications relevant to their response, even those originally asked by competitors.

---

## 10. Post New Clarification (Supplier Portal)

```
Post a Clarification Question            [✕]
────────────────────────────────────────────
Tender: IT Security Suite Evaluation

Question: *
[________________________________________]

Related Requirement (optional):
[REQ-0042 — Data Encryption at Rest  ▾]

Attachment (optional):
[+ Attach file]

────────────────────────────────────────────
Clarification deadline: 12 Jul 2024
Questions submitted after this date will not
be answered.

[Cancel]                   [Submit Question]
```

---

## 11. Amendment Notice Generation

When a clarification answer materially changes or clarifies a requirement:

```
Amendment Notice                               [✕]
────────────────────────────────────────────────
This answer has been flagged as requiring a
formal amendment notice.

Amendment Summary:
[REQ-0042: Cloud provider encryption is
 explicitly permitted if AES-256 equivalent
 is confirmed.]

Notify all suppliers:  ✅ Yes (recommended)
Extend submission deadline:
  ○ No
  ● Yes — extend by: [3 days ▾]
    New deadline: 18 Jul 2024

────────────────────────────────────────────────
[Cancel]                    [Issue Amendment]
```

Issuing an amendment:
- Triggers notification to all suppliers
- Updates the tender deadline if extension is chosen
- Creates an `AmendmentNoticeIssued` domain event
- Adds an entry to the tender's Clarification Log

---

## 12. Clarification Deadline Management

A countdown banner appears at the top of the workspace when the clarification deadline is within 7 days:

```
⚠ Clarification deadline: 12 Jul 2024 (3 days remaining)
3 open questions require your response.       [View Open]
```

After the clarification deadline:
- Suppliers can no longer post new questions
- Buyer can still answer posted-but-not-yet-answered questions
- New questions trigger a warning: "Clarification period has closed — this question cannot be answered officially"

---

## 13. Clarification Log Export

A formal record of all Q&A for the tender, suitable for inclusion in the procurement documentation.

**PDF format includes:**
- Tender name and publication date
- Clarification deadline
- All questions with dates (supplier names shown or anonymized per policy)
- All answers with publication dates
- Amendment notices issued

Export available from: toolbar Export button → "Clarification Log (PDF)"

---

## 14. AI Support

| Feature | Trigger | Display |
|---|---|---|
| Answer draft | "✦ AI: Draft answer" button | Generates proposed answer from requirement text |
| Requirement linkage | On question submission | AI suggests the most relevant requirement if none linked |
| Duplicate question detection | On question received | "Similar question from Acme Systems (Q-2024-0012). Consolidate?" |
| Equal treatment flag | On drafting private answer | "This answer appears relevant to all suppliers — consider publishing to all" |
| Amendment impact analysis | On answer that changes scope | "This answer may change Supplier response requirements for REQ-0042 — review for amendment" |

---

## 15. Status Indicators Summary

| Indicator | Meaning |
|---|---|
| 🔵 Open | Awaiting answer from Procurement Manager |
| 🟡 Draft | Answer drafted; not published |
| ✅ Answered (Private) | Answered; only sending supplier notified |
| ✅✅ Published to All | All suppliers notified |
| ⚠️ Near deadline | Clarification deadline <3 days; open threads |
| 🔴 Overdue | Unanswered thread past clarification deadline |

---

## 16. Filters

| Filter | Values |
|---|---|
| Status | Open / Draft / Answered / Published / All |
| Supplier | Select from invited suppliers |
| Related Requirement | Select from tender requirements |
| Date range | Submitted / Answered within date range |
| Published to All | Yes / No |

---

## 17. Business Rules

| Rule | Enforcement |
|---|---|
| Equal treatment | UI makes "Publish to All" the default for requirement-related questions |
| Clarification deadline | System blocks new Supplier questions after deadline |
| Anonymization | Buyer anonymizes supplier name before publishing to all (opt-out requires justification) |
| Audit trail | All answers, publication events, and amendments create immutable audit records |

---

## 18. Permissions

| Action | Role | Condition |
|---|---|---|
| View clarification threads (all) | Procurement Manager, Project Manager | Own tender |
| Draft and publish answers | Procurement Manager | Published tender |
| Review answers before publish | Legal / Compliance reviewer (if configured) | Configured in tender settings |
| Post clarification question | Supplier (Portal) | Published tender; before clarification deadline |
| View published Q&A | Any Supplier (Portal) | Published tender |
| Issue amendment | Procurement Manager | Published tender |
| Export Clarification Log | Procurement Manager | Any state |

---

## References

- [`Tender_Workspace.md`](./Tender_Workspace.md) — PKB-04-005 — Parent tender context
- [`Supplier_Workspace.md`](./Supplier_Workspace.md) — PKB-04-006 — Supplier Portal Q&A view
- [`Notifications.md`](./Notifications.md) — PKB-04-010 — Clarification notifications
- [`Reference_Video_Analysis.md`](./Reference_Video_Analysis.md) — PKB-04-011 — Pattern origin
