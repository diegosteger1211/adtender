---
id: PKB-04-008
title: Decision Workspace — adtender UI Specification
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
  - PKB-02-006
tags:
  - ui
  - workspace
  - decision
  - award
---

# Decision Workspace — adtender UI Specification

---

## 1. Purpose

The Decision Workspace is where management makes the final procurement decision. It is the most governance-sensitive workspace in adtender.

The workspace enforces:
- **COI declaration before data access** (GBR-016): Board members must declare any conflict of interest before the Consolidated Evaluation Report is shown
- **Immutability after approval** (GBR-017): Approved Decision Records cannot be changed
- **Traceability** (GBR-015): Every decision must be grounded in the Consolidated Evaluation Report

---

## 2. Target Users

| Role | Primary Use |
|---|---|
| Decision Board Chair | Configure Decision Board; manage COI process; approve decision |
| Decision Board Member | Review report; declare COI; vote/endorse |
| Procurement Manager | Prepare for decision session; generate materials |
| Management / Executive | Read-only access to approved decision records |

---

## 3. Navigation Entry

Accessed from the Decision tab within a Tender:
`/projects/:projectId/tenders/:tenderId/decision`

---

## 4. Decision Workspace — State-Based Layout

The workspace changes its layout based on the Decision lifecycle state.

### 4.1 Pre-Session (Approved CE Report available, no Decision started)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← IT Security Suite  ›  Decision                              │
│  ○ Not Started                   [Configure Decision Board]     │
├──────────────────────────────────────────────────────────────────┤
│  PREREQUISITE: Consolidated Evaluation Report                    │
│  ✅ Report approved: 20 Jul 2024                                 │
│  [View Report]                                                   │
│                                                                  │
│  DECISION BOARD                                                  │
│  Not configured.                                                 │
│  [Configure Decision Board]                                      │
│                                                                  │
│  ✦ AI: "Based on the evaluation, SecureCo achieved the         │
│    highest weighted score (85%). Acme Systems was second (81%). │
│    [View full AI briefing]"                                     │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Active Session (Decision Board configured, COI pending)

```
┌──────────────────────────────────────────────────────────────────┐
│  Decision Board — IT Security Suite                             │
│  ● Session Open  ·  Convened: 22 Jul 2024                      │
│  [Record Decision]                                               │
├──────────────────────────────────────────────────────────────────┤
│  [Overview] [Board Members] [Report] [Discussion] [History]     │
├──────────────────────────────────────────────────────────────────┤
│  COI STATUS                                                     │
│  ✅ Anna Schmidt  ·  Declared: No COI                           │
│  ✅ Thomas Becker  ·  Declared: No COI                          │
│  ⚠ Sarah Müller  ·  COI Declaration PENDING                    │
│    [Send reminder]  [View profile]                              │
│                                                                  │
│  ⚠ Sarah Müller has not completed COI declaration.             │
│    Report access restricted for this board member.              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Configure Decision Board

```
Configure Decision Board                       [✕]
────────────────────────────────────────────────
Board Chair (required):
[Anna Schmidt  ▾]

Board Members:
  [Thomas Becker  ✕]   Role: Commercial
  [Sarah Müller  ✕]    Role: Technical
  [+ Add member]

Quorum requirement:
[All members must declare COI ▾]

Decision deadline:
[25 Jul 2024]

Session Notes (optional):
[_________________________________]

────────────────────────────────────────────────
[Cancel]                     [Convene Session]
```

Convening the session sends notifications to all Board Members requesting COI declaration.

---

## 6. COI Declaration Flow (Board Member)

When a Board Member receives a session notification, they are taken to the COI declaration screen before the report is shown.

```
Conflict of Interest Declaration
────────────────────────────────────────────────────────────────────
Tender:  IT Security Suite Evaluation
Session: Convened 22 Jul 2024

Please declare any conflict of interest with the following
invited suppliers before accessing evaluation data.

  ○ Acme Systems AG
    ○ No COI
    ○ I have a financial interest  [Describe: ___________]
    ○ I have a personal relationship  [Describe: ___________]
    ○ Former employer or client

  ○ TechSolutions GmbH
    ○ No COI
    ○ I have a financial interest
    ...

  ○ SecureCo (3 more)  [Expand]

────────────────────────────────────────────────────────────────────
By proceeding, I confirm this declaration is complete and accurate.

[Cancel]                              [Submit COI Declaration]
```

After submission:
- Board member with "No COI" on all suppliers → full report access granted
- Board member with declared COI on Supplier X → report section for Supplier X is hidden/redacted

---

## 7. Report View (Decision Board)

After COI declaration, the Consolidated Evaluation Report is displayed within the workspace. Supplier sections are shown/hidden per individual COI declarations.

```
┌──────────────────────────────────────────────────────────────────┐
│  Consolidated Evaluation Report                  [Download PDF] │
│  IT Security Suite Evaluation  ·  Approved 20 Jul 2024         │
├──────────────────────────────────────────────────────────────────┤
│  EXECUTIVE SUMMARY                                               │
│  The evaluation of 5 suppliers across 12 requirements resulted  │
│  in SecureCo achieving the highest weighted score of 85%.       │
│  Acme Systems was a strong second at 81%...                     │
│                                                                  │
│  SUPPLIER RANKINGS                                               │
│  1. SecureCo          85%  ██████████████████████              │
│  2. Acme Systems AG   81%  █████████████████████               │
│  3. TechSolutions     73%  ██████████████████                  │
│  4. CyberShield AG    69%  █████████████████                   │
│  5. DataSafe Ltd      62%  ████████████████                    │
│                                                                  │
│  ─── SECTION: SecureCo (Ranked #1) ────────────────────────────│
│  [Full score breakdown by requirement...]                       │
│                                                                  │
│  ─── SECTION: Acme Systems AG (Ranked #2) ─────────────────────│
│  [Full score breakdown...]                                      │
│                                                                  │
│  ─── ⛔ REDACTED: DataSafe Ltd ──────────────────────────────── │
│  You declared a COI for DataSafe Ltd.                           │
│  This section is not accessible to you.                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Record Decision Dialog

The most important dialog in the entire platform.

```
Record Procurement Decision                    [✕]
────────────────────────────────────────────────
Tender: IT Security Suite Evaluation
────────────────────────────────────────────────
AWARD DECISION

Awarded Supplier: *
[SecureCo  ▾]

Award Justification: *
[SecureCo demonstrated the highest compliance across all
 critical security requirements, particularly in encryption
 and access control. Their implementation of HSM-backed key
 management provides a superior security posture...]

✦ AI: Generate justification draft  [Generate]

RISK ACKNOWLEDGMENT

Accepted trade-offs (optional):
[+ Add accepted trade-off]
  "SecureCo's pricing was 12% above median — accepted given
   superior security rating in critical requirements."

Conditions of Award (optional):
[+ Add condition]
  "SecureCo must provide updated ISO-27001 certificate before
   contract signature."

────────────────────────────────────────────────
BOARD APPROVAL

Decision Date: [22 Jul 2024]
Approved by: *
  ☑ Anna Schmidt (Chair)
  ☑ Thomas Becker
  ☐ Sarah Müller (COI declared for DataSafe — excluded)

────────────────────────────────────────────────
By approving this decision, it becomes immutable.
All fields are final after approval.

[Save Draft]                [Approve Decision]
```

The "Approve Decision" button is only enabled when all required fields are complete and all eligible Board Members have approved (or are excluded for COI).

---

## 9. Approved Decision View

After approval, the Decision Record is immutable and displayed in read-only mode.

```
┌──────────────────────────────────────────────────────────────────┐
│  Decision Record — DEC-2024-0012                 ✅ Approved     │
│  IT Security Suite Evaluation                                    │
│  Approved: 22 Jul 2024 by Anna Schmidt (Chair)  [Download PDF]  │
├──────────────────────────────────────────────────────────────────┤
│  🔒 This Decision Record is immutable. No changes are possible. │
├──────────────────────────────────────────────────────────────────┤
│  Awarded Supplier: SecureCo                                     │
│  Justification:                                                  │
│  "SecureCo demonstrated the highest compliance across all        │
│   critical security requirements..."                            │
│                                                                  │
│  Consolidated Evaluation Report: [View CE-2024-0012]           │
│  Board Members: Anna Schmidt  ·  Thomas Becker                  │
│                 (Sarah Müller excluded: COI declared)           │
│                                                                  │
│  NEXT STEPS                                                      │
│  [Generate Award Notice]  [Proceed to Contract Handover]        │
│                                                                  │
│  Revocation: If this decision must be revisited:                │
│  [Revoke Decision]  (creates new Decision Record; this one      │
│   remains preserved)                                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. Decision Revocation Flow

Triggered by "Revoke Decision" on an Approved record.

```
Revoke Decision                                [✕]
────────────────────────────────────────────────
⚠ This action creates a formal revocation record.
The original Decision DEC-2024-0012 will be preserved
and marked as revoked. A new decision process will begin.

Revocation reason (required): *
[New conflict of interest discovered for SecureCo after
 the decision was approved...]

Revocation authority:
[Anna Schmidt  ▾]

────────────────────────────────────────────────
[Cancel]                     [Confirm Revocation]
```

After revocation:
- Original decision is marked `Revoked` (immutable, preserved for audit)
- New Decision aggregate is created in `Draft` state
- Evaluation phase may need to restart (Procurement Manager decides)

---

## 11. Discussion Thread (Decision Board)

A threaded discussion visible to all Board Members during the active session.

```
Decision Discussion                     [+ Post Comment]
────────────────────────────────────────────────────────
  Anna Schmidt  ·  22 Jul 2024, 10:15
  "I've reviewed the report. SecureCo's response to REQ-0042
   is significantly stronger than the competitors."
  [Reply]

  Thomas Becker  ·  22 Jul 2024, 10:32
  "Agree. One concern: SecureCo's pricing is 12% above median.
   Is that acceptable given the budget?"
  [Reply]

    Anna Schmidt  ·  22 Jul 2024, 10:45
    "I'll add it as an accepted trade-off in the decision record."
    [Reply]
```

Discussion threads are stored as part of the Decision audit trail.

---

## 12. AI Assistant Integration (Decision)

| Feature | Trigger | Behavior |
|---|---|---|
| Pre-briefing | Session convened | Summarizes report top findings in 3 bullets |
| Award justification draft | "Generate" button in Record Decision | AI drafts justification from scores and report |
| Trade-off suggestions | Record Decision dialog | AI identifies scoring gaps as potential trade-offs to acknowledge |
| Missing evidence alert | Pre-approval check | "Decision references no accepted trade-offs despite 2 below-threshold scores" |
| Decision precedent | Session start | "Similar tenders in this category: last 3 decisions and outcomes" |

---

## 13. History Tab

Full audit trail for the Decision workspace:
- Board Member COI declarations (with timestamps and content)
- Report access events (who viewed the report and when)
- Discussion thread (full content)
- Decision Record versions (Draft saves, final approval)
- Revocation history (if applicable)

---

## 14. Keyboard Shortcuts (Decision Workspace)

| Shortcut | Action |
|---|---|
| `R` | Open Report tab |
| `D` | Open Decision tab |
| `H` | Open History tab |
| `Cmd/Ctrl + P` | Download Report PDF |
| `A` | AI: open briefing panel |

---

## 15. Export Functions

| Export | Contents |
|---|---|
| Decision Record (PDF) | Full decision with justification, board members, COI status |
| Award Notice (PDF) | Formal award communication for winning supplier |
| Audit Trail (PDF) | Complete audit of the decision process |
| Board Summary (XLSX) | Score summary formatted for board review |

---

## 16. Permissions

| Action | Role | Condition |
|---|---|---|
| Configure Decision Board | Procurement Manager, Chair | Approved CE Report exists |
| Declare COI | Board Member | Session open; not yet declared |
| View Report | Board Member | COI declared; full or redacted per COI status |
| Post discussion comment | Board Member | Session open |
| Record Decision | Board Chair | All eligible members COI-declared |
| Approve Decision | Board Member | Draft decision exists |
| Generate Award Notice | Procurement Manager | Decision Approved |
| Revoke Decision | Board Chair, Procurement Director | Decision Approved |
| View approved Decision | Any authenticated user (own tenant) | Any post-approval state |

---

## References

- [`Workspace_Concept.md`](./Workspace_Concept.md) — PKB-04-003
- [`Evaluation_Workspace.md`](./Evaluation_Workspace.md) — PKB-04-007 — Previous phase
- [`Decision.md`](../02_Domain_Model/Decision.md) — PKB-02-006 — Domain model
- GBR-015, GBR-016, GBR-017 — Business rules governing Decision management
