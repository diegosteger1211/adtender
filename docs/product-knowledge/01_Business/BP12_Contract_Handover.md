---
id: PKB-01-BP12
title: BP12 — Contract Handover
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

# BP12 — Contract Handover

## Purpose

This process manages the formal transition from procurement decision to contract execution. It covers award notifications, unsuccessful Supplier notifications, standstill period management, and handover of the procurement data package to the contracting team.

The output of BP12 is a completed procurement record: all Supplier notifications sent, standstill period elapsed, and the structured procurement package transferred to the organization's contract management processes.

---

## Business Context

Contract Lifecycle Management (CLM) is explicitly out of scope for adtender (see [`Product_DNA.md`](../00_Product_DNA/Product_DNA.md)). adtender's role ends when:
1. All Suppliers have been formally notified of the Decision outcome
2. The standstill period has elapsed without unresolved challenge
3. The structured procurement data package has been handed over to the contracting team

The platform provides a structured handover dataset — Decision Record, Supplier Responses, Evaluation results, Requirements — not contract drafting or CLM. The integration point with external CLM or ERP systems is defined by this process.

For regulated procurement (EU public procurement, GWB-based procurement), minimum standstill periods must be observed. During this period, unsuccessful Suppliers may formally challenge the Decision. This period must be managed and its expiry documented before the award can be formally executed.

---

## Scope

**In scope:**
- Award notification to the selected Supplier
- Unsuccessful Supplier notifications (including Knock-out excluded Suppliers)
- Standstill period tracking
- Challenge recording (platform records; legal process is external)
- Procurement data package preparation and handover
- Integration data export to CLM/ERP (if configured)

**Out of scope:**
- Contract drafting (CLM / legal team)
- Contract negotiation (commercial team)
- Contract execution and lifecycle management (CLM/ERP)

---

## Entry Criteria

- `DecisionApproved` event from BP11
- Decision type = `Award`
- (For `RejectAllResponses` or `CancelProcurement` decisions, proceed directly to BP13)

---

## Exit Criteria

BP12 is complete when:

- Award notification sent to selected Supplier and confirmed
- All unsuccessful Supplier notifications sent
- Standstill period elapsed without unresolved challenge
- Procurement data package handed over to contracting team
- Tender in `Awarded` state

---

## Actors

| Role | Responsibility in BP12 |
|---|---|
| Procurement Manager | Sends notifications; manages standstill; prepares handover package; owns this process |
| Project Owner | Countersigns award notification; confirms handover |
| Project Manager | Coordinates transition to contracting team |
| Supplier Contact (awarded) | Receives and acknowledges award notification |
| Supplier Contact (unsuccessful) | Receives unsuccessful notification |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Approved Decision Record | BP11 output | `Approved` |
| Consolidated Evaluation Report | BP10 output | `Approved` |
| All locked Supplier Responses | BP08 | `Locked` |
| Standstill period configuration | Organizational procurement policy | Configured |
| CLM/ERP integration configuration | System Administration | Active (if integration enabled) |

---

## Activities

### Activity 1 — Prepare Award Notification

**Actor:** Procurement Manager  
**Command:** `PrepareAwardNotification`  
**Action:** The award notification is prepared and contains:
- Formal notification of the award decision
- Reference to the Tender and Decision Record
- Next steps for contract execution
- Standstill period end date (so the awarded Supplier knows when contract execution may begin)

The Project Owner reviews the notification before sending.

**Events produced:** `AwardNotificationPrepared`

---

### Activity 2 — Prepare Unsuccessful Supplier Notifications

**Actor:** Procurement Manager  
**Command:** `PrepareUnsuccessfulNotifications`  
**Action:** For each non-awarded Supplier (including Knock-out excluded Suppliers), an unsuccessful notification is prepared containing:
- Formal notification of non-selection
- Their ranking position (configurable per jurisdiction)
- Their overall score and the winning Supplier's overall score (configurable per procurement type and jurisdiction)
- Knock-out exclusion grounds (if applicable)
- Standstill period information: duration, how to file a challenge
- Debrief session availability (if offered)

**Business rule enforced:** GBR-015 — unsuccessful Suppliers are entitled to reasons for non-selection within confidentiality limits.

**Events produced:** `UnsuccessfulNotificationsGenerated`

---

### Activity 3 — Send All Notifications Simultaneously

**Actor:** Procurement Manager  
**Command:** `SendDecisionNotifications`  
**Action:** Award and all unsuccessful notifications are dispatched simultaneously in a single atomic batch. Equal treatment requires that no Supplier learns of the Decision before another.

The platform must prevent partial notification (award sent before unsuccessful notifications are ready). The standstill period starts from the notification dispatch timestamp.

**Events produced:** `AwardNotificationSent`, `UnsuccessfulNotificationSent` (per Supplier), `StandstillPeriodStarted`

---

### Activity 4 — Manage Standstill Period

**Actor:** Procurement Manager (monitoring), Platform (tracking)  
**Action:** The platform tracks the standstill period:
- Start date: notification dispatch timestamp
- End date: start date + configured standstill duration (e.g., 15 calendar days)
- Status: `Active` / `ChallengeReceived` / `Elapsed`

If a challenge is received during the standstill:
- The Procurement Manager records the challenge in the platform
- The project is placed in `StandstillChallenged` status
- Legal and compliance teams manage the challenge (outside adtender)
- adtender records the challenge resolution outcome (upheld / dismissed)

**Events produced:** `StandstillPeriodElapsed`, `StandstillChallengeReceived` (if applicable)

---

### Activity 5 — Prepare Procurement Handover Package

**Actor:** Procurement Manager  
**Command:** `PrepareHandoverPackage`  
**Action:** The procurement data package is assembled for handover to the contracting team:
- Decision Record (structured data + generated document)
- Consolidated Evaluation Report
- Published Tender document
- Awarded Supplier's locked Response
- All approved Requirements with their versions
- Clarification Q&A record
- Audit trail export

The package provides the contracting team with the complete context of what was promised, committed and evaluated during the procurement process.

**Events produced:** `HandoverPackagePrepared`

---

### Activity 6 — Execute Handover

**Actor:** Project Manager, Procurement Manager  
**Command:** `ExecuteHandover`  
**Action:** The handover is formally executed:
- Procurement package transferred to the internal contracting team (document and/or structured data)
- Integration push to CLM/ERP system (if configured)
- Tender status updated to `Awarded`
- Project Manager and contracting team notified

Integration success or failure is recorded in the platform. Integration failures trigger an alert; the package can be re-exported.

**Events produced:** `HandoverExecuted`, `TenderStatusUpdated` (`Awarded`), `CLMIntegrationCompleted` (if integration active)

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP12-BR-001 | Award and unsuccessful notifications must be sent simultaneously. The platform must prevent dispatch of the award notification before all unsuccessful notifications are prepared. |
| BP12-BR-002 | The contract may not be executed before the standstill period has elapsed without a pending challenge. |
| BP12-BR-003 | If a challenge is received during the standstill period, the project is placed on hold and legal/compliance teams are notified before any further procurement actions. |
| BP12-BR-004 | The procurement handover package must include the complete Decision audit trail: Decision Record, Consolidated Evaluation Report, individual Evaluations, and the awarded Supplier's locked Response. |
| BP12-BR-005 | Unsuccessful Supplier notifications must include at minimum the grounds for non-selection and the standstill period information. Score disclosure level is configurable per tenant and procurement type. |
| GBR-015 | Unsuccessful Suppliers are entitled to reasons for non-selection. |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Business Object | Transition | Trigger |
|---|---|---|
| `Tender` | `Closed` → `Awarded` | `ExecuteHandover` |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `AwardNotificationPrepared` | `PrepareAwardNotification` |
| `UnsuccessfulNotificationsGenerated` | `PrepareUnsuccessfulNotifications` |
| `AwardNotificationSent` | `SendDecisionNotifications` |
| `UnsuccessfulNotificationSent` | `SendDecisionNotifications` (per Supplier) |
| `StandstillPeriodStarted` | `SendDecisionNotifications` |
| `StandstillPeriodElapsed` | Platform timer |
| `StandstillChallengeReceived` | Procurement Manager records challenge |
| `HandoverPackagePrepared` | `PrepareHandoverPackage` |
| `HandoverExecuted` | `ExecuteHandover` |

---

## Integration

adtender's integration boundary in BP12 is the handover of structured data. The platform does not draft or execute contracts.

| Integration Target | Direction | Data Exported |
|---|---|---|
| CLM system | Outbound | Decision Record, Requirements, Evaluation summary, awarded Response |
| ERP system | Outbound | Award data (Supplier, project reference, commercial summary) |
| Document Management | Outbound | Generated documents (Tender, Decision Report, Notifications) |

Integration is event-triggered by `HandoverExecuted`. Platform records integration success/failure.

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Award notification record | `SupplierNotification` | Sent |
| Unsuccessful notification records | `SupplierNotification[]` | Sent |
| Standstill period record | `StandstillRecord` | Elapsed or Resolved |
| Procurement handover package | Structured data + documents | Exported |
| Awarded Tender | `Tender` | `Awarded` |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| Notification-to-handover cycle time | Calendar days from DecisionApproved to HandoverExecuted |
| Standstill challenge rate | Percentage of Tenders receiving at least one challenge |
| Handover package completeness | Percentage of packages with all required components |
| Integration success rate | Percentage of CLM/ERP integration pushes completing without error |

---

## AI Guidance

AI may assist in BP12 by:
- Generating award and unsuccessful notification drafts from the Decision Record
- Checking notification drafts for required content (score, grounds, standstill period, debrief offer)
- Tracking standstill period expiry and alerting the Procurement Manager
- Assembling and verifying the handover package checklist

AI must not:
- Send notifications without Procurement Manager review and explicit command
- Execute the handover or integration push autonomously

---

## Anti-Patterns

- Sending the award notification before the unsuccessful notifications are ready — creates an information asymmetry that may constitute an equal treatment violation.
- Executing the contract before the standstill period has elapsed — in regulated procurement this can invalidate the contract.
- Providing debrief information that reveals the awarded Supplier's commercial details or identity to unsuccessful Suppliers beyond what is authorized.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-015, GBR-001
- [`Product_DNA.md`](../00_Product_DNA/Product_DNA.md) — CLM is out of scope
- [BP11_Decision.md](./BP11_Decision.md) — Predecessor process
- [BP13_Project_Closing.md](./BP13_Project_Closing.md) — Next process
