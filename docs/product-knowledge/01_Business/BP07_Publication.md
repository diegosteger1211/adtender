---
id: PKB-01-BP07
title: BP07 — Publication
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

# BP07 — Publication

## Purpose

This process formally publishes the approved Tender to the invited Suppliers. It is the point at which the procurement process becomes visible to the market — the formal start of the competitive process.

The output of BP07 is a Tender in `Published` state with a frozen Requirement version snapshot, Supplier Portal access granted to all invited Suppliers, and the clarification window open.

---

## Business Context

Publication is a legal and governance milestone, not just a technical action. Once a Tender is published:
- The Requirement versions it contains are immutable (GBR-010)
- The submission deadline is binding
- The equal treatment obligation is active — any information shared with one Supplier must be shared with all Suppliers
- Amendments require a formal process that notifies all invited Suppliers

The platform must enforce these constraints at the domain layer. Publication is not a reversible action without governance process.

---

## Scope

**In scope:**
- Final pre-publication checks
- Executing the publication action (freezing Requirements, granting portal access, opening clarification window)
- Notifying invited Suppliers
- Managing the publication record

**Out of scope:**
- Tender content changes (must use the amendment process after publication)
- Supplier Response collection (BP08)
- Clarification management (BP08)

---

## Entry Criteria

- Tender in `Approved` state (`TenderApproved` event)
- All invited Suppliers have confirmed contact persons in the system
- Publication date reached or confirmed

---

## Exit Criteria

BP07 is complete when:

- Tender is in `Published` state
- Requirement version snapshot is frozen (immutable reference to all `RequirementVersionId` values)
- All invited Suppliers have received access to the Supplier Portal for this Tender
- Publication notification has been sent and recorded
- Clarification window is open

---

## Actors

| Role | Responsibility in BP07 |
|---|---|
| Procurement Manager | Executes publication; confirms pre-publication checks; manages Supplier access |
| Project Manager | Coordinates timing; confirms publication readiness |
| Supplier Contact | Receives publication notification; accesses Supplier Portal |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Approved Tender | BP06 output | `Approved` |
| Supplier invitation list | `Tender.invitationList[]` | Confirmed |
| Tender timeline | `Project.tenderTimeline` | Active |
| Supplier contact records | Supplier Management | Active user accounts in portal |

---

## Activities

### Activity 1 — Pre-Publication Checks

**Actor:** Procurement Manager  
**Action:** Before executing publication, a final readiness check is performed:
- All invited Suppliers have active portal user accounts
- Submission deadline is in the future
- Clarification window dates are correctly configured (clarification close must precede submission deadline)
- Tender document has been reviewed for completeness
- Any pre-notification requirements (e.g., regulatory notice periods for public procurement) have been satisfied

Pre-publication checks that fail must block publication until resolved.

**Events produced:** `PrePublicationCheckCompleted`

---

### Activity 2 — Execute Tender Publication

**Actor:** Procurement Manager  
**Command:** `PublishTender`  
**Action:** The `PublishTender` command performs the following atomically:

1. **Freeze Requirement versions:** Creates an immutable `TenderRequirementSnapshot` recording the `RequirementVersionId` for every Requirement in the Tender at this moment. Any subsequent changes to Requirements in Requirement Management have no effect on this published Tender.

2. **Set Tender to Published state:** `Tender.status` transitions from `Approved` to `Published`.

3. **Open Supplier Portal access:** All Suppliers on the invitation list receive read access to the Tender and its published Requirement versions.

4. **Start clarification window:** The clarification window opens, enabling Suppliers to submit clarification requests.

5. **Record publication timestamp:** The exact publication datetime is recorded on the Tender record as `publishedAt`.

**Business rule enforced:** GBR-010 — Requirement version snapshot is frozen at this point.

**Tender state transition:** `Approved` → `Published`

**Events produced:** `TenderPublished`, `RequirementVersionsSnapshotCreated`, `SupplierPortalAccessGranted` (per Supplier)

---

### Activity 3 — Send Publication Notifications

**Actor:** Platform (automated), Procurement Manager (if manual notification is required)  
**Action:** Publication notifications are sent to all invited Suppliers via:
- In-platform notification (Supplier Contact receives a notification in their portal dashboard)
- Email notification to the registered Supplier Contact address
- Any additional external channels configured for the tenant (e.g., public notice board link for regulated procurement)

Each notification records:
- Supplier identity
- Notification type (email / in-platform)
- Timestamp
- Confirmation of delivery (if available)

**Events produced:** `SupplierNotificationSent` (per Supplier)

---

### Activity 4 — Confirm Publication Record

**Actor:** Procurement Manager  
**Command:** `ConfirmPublicationRecord`  
**Action:** The Procurement Manager confirms that publication has been executed correctly and records any publication-specific notes (e.g., reference to a public notice number for regulated procurement).

This action closes the BP07 process. BP08 (Supplier Collaboration) begins from this point.

**Events produced:** `PublicationConfirmed`

---

## Amendment Process (Post-Publication)

If, after publication, an error or necessary change is identified in the Tender content, the following amendment process applies:

1. **Identify the change:** Document what must change and why.
2. **Create a Tender Amendment:** A formal amendment record is created on the Tender.
3. **If Requirement content must change:** The Requirement is updated in Requirement Management, producing a new Approved version. The amendment adds the new version to the Tender snapshot.
4. **Notify all Suppliers:** All invited Suppliers must be notified of the amendment. No Supplier receives the amendment without all others also receiving it.
5. **Extend the submission deadline if required:** If the amendment is material, the submission deadline must be extended to give Suppliers adequate time to revise their responses.

**Business rule enforced:** GBR-010 — amendments create a new Tender version, not a mutation of the published snapshot.

**Events produced:** `TenderAmended`, `TenderDeadlineExtended` (if deadline changed)

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP07-BR-001 | Tender publication must be rejected if any Supplier on the invitation list does not have an active portal user account. |
| BP07-BR-002 | The submission deadline at the time of publication must be at least the minimum response period in the future (configurable per tenant; e.g., 10 business days). |
| BP07-BR-003 | Once published, a Tender cannot be directly modified. Changes require the formal amendment process. |
| BP07-BR-004 | All Supplier notifications must be sent simultaneously. Notifying one Supplier before others violates equal treatment. The platform must enforce this by sending all notifications in a single atomic batch. |
| BP07-BR-005 | If an amendment is issued, a new notification must be sent to all invited Suppliers — including those who have not yet accessed the portal. |
| GBR-009 | All Requirements in the Tender must be in Approved state at publication. |
| GBR-010 | Requirement versions are frozen at publication. |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Transition | Trigger | Actor |
|---|---|---|
| `Approved` → `Published` | `PublishTender` | Procurement Manager |
| `Published` → `Published` (new version) | `CreateTenderAmendment` | Procurement Manager |
| `Published` → `Closed` | `CloseTenderSubmissions` (BP08 exit) | Procurement Manager |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `PrePublicationCheckCompleted` | Pre-publication check activity |
| `TenderPublished` | `PublishTender` command |
| `RequirementVersionsSnapshotCreated` | Atomic with `TenderPublished` |
| `SupplierPortalAccessGranted` | Atomic with `TenderPublished` (per Supplier) |
| `SupplierNotificationSent` | Publication notification sent (per Supplier) |
| `PublicationConfirmed` | `ConfirmPublicationRecord` |
| `TenderAmended` | `CreateTenderAmendment` (if amendment required) |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Published Tender | `Tender` | `Published` |
| Requirement version snapshot | `TenderRequirementSnapshot` | Frozen, immutable |
| Supplier portal access records | Per `Supplier` | Active |
| Publication notification records | `SupplierNotification[]` | Sent |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| Time from Tender Approved to Published | Calendar days between `TenderApproved` and `TenderPublished` events |
| Supplier notification delivery rate | Percentage of invited Suppliers who received and opened the publication notification |
| Amendment rate | Number of Tenders requiring amendment post-publication (lower is better — indicates BP06 quality) |

---

## AI Guidance

AI may assist in BP07 by:
- Running pre-publication checks automatically and surfacing failures before the Procurement Manager executes publication
- Verifying that the submission deadline satisfies minimum response period requirements for the procurement type
- Detecting Suppliers on the invitation list without active portal accounts

AI must not:
- Execute the `PublishTender` command
- Send Supplier notifications autonomously

---

## Anti-Patterns

- Publishing without sending simultaneous notifications to all Suppliers — creates an information asymmetry that may be grounds for legal challenge in regulated procurement.
- Making editorial changes to the Tender document after publication without following the amendment process — the document becomes inconsistent with the structured Tender source of truth.
- Setting a submission deadline that does not provide adequate response time — reduces response quality and increases the risk of legal challenge.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-009, GBR-010, GBR-001
- [BP06_Tender_Creation.md](./BP06_Tender_Creation.md) — Predecessor process
- [BP08_Supplier_Collaboration.md](./BP08_Supplier_Collaboration.md) — Next process
