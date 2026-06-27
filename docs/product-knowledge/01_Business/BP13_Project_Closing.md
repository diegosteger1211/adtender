---
id: PKB-01-BP13
title: BP13 — Project Closing
version: 2.0
status: APPROVED
owner: Product Architecture
audience:
  - Product Management
  - Business Architecture
  - Software Architecture
  - Developers
  - AI Development Agents
depends_on:
  - PKB-01-001
  - PKB-00-MASTER
---

# BP13 — Project Closing

## Purpose

This process provides a controlled, governed closure for projects regardless of their outcome — award, rejection of all responses, cancellation, or natural completion. It ensures that all required post-procurement activities are completed, Lessons Learned are initiated, and the project record is properly archived.

The output of BP13 is a Project in `Closed` state with a complete archive record.

---

## Business Context

Project Closing is not an administrative formality. It is the gate between execution and learning.

Without a formal closing process, Lessons Learned do not happen, knowledge is lost, and the organizational knowledge base does not grow. The closing process makes explicit what happened, why it happened, and what should be done differently next time.

The closing process applies to all projects — not just successful ones. A cancelled project still contains valuable knowledge about why a procurement approach failed. A rejected-all-responses project reveals why Supplier market coverage was insufficient. This knowledge is as valuable as the knowledge from a successfully completed procurement.

The Project Manager owns this process. The Project Owner formally signs off.

---

## Scope

**In scope:**
- Confirming all required post-procurement activities are complete or not applicable
- Formal Lessons Learned process initiation (mandatory trigger to BP14)
- Access revocation for Supplier Portal
- Project archive record creation
- Project status transition to `Closed`

**Out of scope:**
- Contract execution tracking (CLM)
- Lessons Learned content creation (BP14)
- Knowledge Management library contributions (BP15)

---

## Entry Criteria

BP13 is triggered by one of:
- `HandoverExecuted` from BP12 (award path)
- `DecisionApproved` with decision type `RejectAllResponses` or `CancelProcurement` from BP11
- Project Owner decision to close an in-progress project (exceptional; requires documented justification)

---

## Exit Criteria

BP13 is complete when:

- All closing checklist items are marked complete or explicitly noted as not applicable
- Lessons Learned process initiated (BP14 triggered)
- Supplier Portal access revoked for all Suppliers
- Project archive record created
- Project in `Closed` state
- Project Owner has countersigned the closing record

---

## Actors

| Role | Responsibility in BP13 |
|---|---|
| Project Manager | Owns the closing process; completes the closing checklist; coordinates archive |
| Project Owner | Reviews closing status; countersigns the closing record |
| Procurement Manager | Confirms all procurement obligations are satisfied |
| System Administrator | Revokes Supplier Portal access |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Project record | Current project | Active |
| Decision Record (if award or rejection) | BP11 output | `Approved` |
| Handover confirmation (if award) | BP12 output | `HandoverExecuted` |
| Closing reason (if early termination) | Project Owner declaration | Documented |

---

## Activities

### Activity 1 — Confirm Post-Procurement Activity Completion

**Actor:** Project Manager  
**Action:** The Project Manager reviews the project closing checklist:

| Checklist Item | Applicable For |
|---|---|
| Procurement data package handed over | Award path |
| Standstill period elapsed | Award path |
| All Supplier notifications sent | All paths |
| Outstanding clarification requests closed | All paths |
| All Evaluator access to Supplier data confirmed complete | All paths |
| Debrief requests from unsuccessful Suppliers addressed | Award path |
| Decision Record approved and immutable | All paths with a Decision |
| Project documentation complete | All paths |

Items not applicable to the current outcome are explicitly marked `N/A`.

---

### Activity 2 — Initiate Lessons Learned Process

**Actor:** Project Manager  
**Command:** `InitiateLessonsLearned`  
**Action:** The Lessons Learned process (BP14) is formally initiated. This is a mandatory step for all projects — not optional.

A Lessons Learned record is created with:
- Project reference
- Project outcome type (Award / RejectAll / Cancelled / EarlyTermination)
- Scheduled Lessons Learned session date (must be within a configurable period after project closing)
- Initial participants identified (Project Manager, Project Owner, Procurement Manager, Requirement Engineers, Evaluators)

**Business rule enforced:** GBR-018 — Lessons Learned is mandatory for all closed projects.

**Events produced:** `LessonsLearnedInitiated`

---

### Activity 3 — Revoke Supplier Portal Access

**Actor:** System Administrator (automated or manual)  
**Command:** `RevokeSupplierPortalAccess`  
**Action:** All Supplier Contacts who were granted portal access for this project's Tender have their access revoked. Suppliers no longer have visibility of the project's Tender data.

Exception: access may be retained for a limited period if an active challenge or debrief process requires it (Procurement Manager must explicitly authorize the extension).

**Events produced:** `SupplierPortalAccessRevoked` (per Supplier)

---

### Activity 4 — Create Project Archive Record

**Actor:** Project Manager  
**Command:** `CreateProjectArchiveRecord`  
**Action:** The project archive record is created, capturing a summary of the project for future reference:
- Project type, domain, scope summary
- Procurement approach (tender type, evaluation method)
- Outcome (award / rejection / cancellation)
- Key metrics: number of Requirements, number of invited Suppliers, response rate, evaluation cycle time
- Decision Record reference
- Lessons Learned record reference
- Links to all key documents

The archive record is the entry point for anyone searching for insights from this project in the future.

**Events produced:** `ProjectArchiveRecordCreated`

---

### Activity 5 — Close Project

**Actor:** Project Owner  
**Command:** `CloseProject`  
**Action:** The Project Owner reviews the closing checklist and archive record, and formally closes the project.

**Project state transition:** `Active` → `Closed`

**Business rule enforced:** GBR-018 — Lessons Learned must be initiated before the project can be closed.

**Events produced:** `ProjectClosed`

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP13-BR-001 | Lessons Learned must be initiated before a project can be closed. A project with no Lessons Learned record cannot transition to `Closed` state. |
| BP13-BR-002 | Supplier Portal access must be revoked as part of project closing, except where an active challenge or debrief process explicitly requires continued access (maximum extension: 30 calendar days). |
| BP13-BR-003 | A project closing record requires countersignature by the Project Owner. |
| GBR-018 | Project closing is mandatory before a project can be archived. |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Business Object | Transition | Trigger |
|---|---|---|
| `Project` | `Active` → `Closed` | `CloseProject` |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `LessonsLearnedInitiated` | `InitiateLessonsLearned` |
| `SupplierPortalAccessRevoked` | `RevokeSupplierPortalAccess` (per Supplier) |
| `ProjectArchiveRecordCreated` | `CreateProjectArchiveRecord` |
| `ProjectClosed` | `CloseProject` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Closed Project | `Project` | `Closed` |
| Project archive record | `ProjectArchiveRecord` | Created |
| Lessons Learned record | `LessonsLearned` | `Initiated` |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| BP13 cycle time | Calendar days from BP12 HandoverExecuted (or BP11 Decision) to ProjectClosed |
| Lessons Learned initiation rate | Percentage of closed projects with Lessons Learned initiated within 5 business days of closing |
| Portal access revocation rate | Percentage of Supplier portal accesses revoked within 2 business days of project closing |

---

## AI Guidance

AI may assist in BP13 by:
- Pre-populating the project archive record summary from project data (Requirements count, Supplier count, timeline metrics)
- Flagging closing checklist items that appear incomplete before the Project Owner closes the project
- Generating the Lessons Learned session invitation with pre-populated project context

AI must not:
- Close the project without Project Owner command
- Waive the Lessons Learned initiation requirement

---

## Anti-Patterns

- Closing a project without initiating Lessons Learned — the most common cause of organizational knowledge loss in procurement.
- Leaving Supplier portal access active after project close — creates unnecessary data access risk (GBR-021 tenant isolation applies).
- Creating a minimal archive record that contains no searchable context — makes the project unfindable in future library searches.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-018, GBR-001
- [BP12_Contract_Handover.md](./BP12_Contract_Handover.md) — Predecessor process (award path)
- [BP11_Decision.md](./BP11_Decision.md) — Predecessor process (cancel/reject path)
- [BP14_Lessons_Learned.md](./BP14_Lessons_Learned.md) — Triggered by this process
