# adtender — MVP Implementation Roadmap

**Version:** 1.0  
**Status:** APPROVED  
**Owner:** Product Management  
**Last Updated:** 2026-06-26

---

## Purpose

This roadmap translates the adtender MVP product concept into a concrete, sequenced implementation plan. It defines Epics, Features, Dependencies, Risks, Milestones, and Definition of Done.

The goal is a **production-ready MVP** — a real system that procurement teams can use for live tender processes, not a demo or prototype.

---

## Definition of Done

A Feature is **Done** when:

- [ ] All domain model business rules are enforced (not just in the UI)
- [ ] Unit tests cover all business rule validations
- [ ] Integration tests cover the full happy path and documented failure paths
- [ ] Audit events are emitted for every binding state change
- [ ] Multi-tenancy is enforced: no cross-tenant data leakage is possible
- [ ] All UI interactions that trigger domain changes require explicit user confirmation where the action is irreversible
- [ ] Export/output functions include version metadata (Business Object IDs, export date)
- [ ] Role-based access control is enforced at the API layer (not only at the UI)
- [ ] The feature has been tested end-to-end by a user with the correct role on a staging environment
- [ ] No critical or high-severity accessibility violations (WCAG 2.1 AA)

A Milestone is **Done** when all its Features are Done and a complete end-to-end workflow has been executed successfully in the staging environment.

---

## Phase 1 — Foundation

**Goal:** Project management, requirement library, requirement authoring.  
**Milestone:** A procurement manager can create a project, build a requirement library, and produce an approved set of requirements ready for tender inclusion.

---

### Epic 1.1 — Authentication & Multi-Tenancy

**Dependencies:** None — this is the foundation for everything else.

| Feature | Description | Done When |
|---|---|---|
| 1.1.1 User authentication | Login, logout, session management, password reset | Users can authenticate; sessions expire correctly |
| 1.1.2 Multi-tenant isolation | TenantId on every aggregate; no cross-tenant queries | Automated test confirms tenant A cannot access tenant B's data |
| 1.1.3 Role assignment | Project Manager, Procurement Manager, Evaluator, Board Member, Org Admin | Roles enforced at API layer; UI reflects role-visible actions |
| 1.1.4 User invitation flow | Invite by email; accept; activate account | New user can be invited and onboarded without admin manual steps |

**Risks:**
- Multi-tenancy must be correct from day one — retrofitting is expensive and dangerous
- Authentication implementation must not block Phase 2 supplier portal (different auth flow)

---

### Epic 1.2 — Organization & User Management

**Dependencies:** Epic 1.1

| Feature | Description | Done When |
|---|---|---|
| 1.2.1 Organization provisioning | Create org; Organization triggers Tenant creation | Organization → Tenant lifecycle gate enforced (ORG-BR-001, TNT-BR-005) |
| 1.2.2 User lifecycle | Invite / Activate / Suspend / Deactivate | UserId preserved on deactivation (USR-BR-003); deactivated users cannot log in |
| 1.2.3 Basic admin UI | User list; invite; role edit; suspend | Admin can manage all users within their tenant |

---

### Epic 1.3 — Project Management

**Dependencies:** Epic 1.2

| Feature | Description | Done When |
|---|---|---|
| 1.3.1 Create / edit project | Title, description, category, owner | Project created with TenantId; owner can edit |
| 1.3.2 Project lifecycle | Initiated → Active → TenderRunning → Closing → Archived | State transitions enforced; Archived requires all tenders terminal |
| 1.3.3 Project overview screen | Stage bar, tender list, team members | PM can see all their projects and navigate to tenders |
| 1.3.4 Team management | Add / remove team members; role within project | Team membership scoped to project |
| 1.3.5 Project list + filters | Filter by status, owner, category | Filters persist per user |

---

### Epic 1.4 — Requirement Library

**Dependencies:** Epic 1.2

| Feature | Description | Done When |
|---|---|---|
| 1.4.1 Library CRUD | Create / edit / archive library | Library scoped to tenant (LIB-BR-001); archiving does not affect requirements (LIB-BR-005) |
| 1.4.2 Library catalog UI | Browse, search, filter by category/status | Users can find requirements across libraries |
| 1.4.3 Library versioning | RequirementLibrary version tracked | Version increments on library configuration change |

---

### Epic 1.5 — Requirement Authoring

**Dependencies:** Epic 1.4

| Feature | Description | Done When |
|---|---|---|
| 1.5.1 Create requirement | Title, description, category, priority, acceptance criteria | Requirement created in Draft; all required fields validated |
| 1.5.2 Requirement lifecycle | Draft → Review → Approved → Deprecated | State transitions enforced; Approved creates new immutable version (GBR-009) |
| 1.5.3 Versioning | RequirementVersionId generated on each Approval | VersionId is immutable and unique; displayed in UI |
| 1.5.4 Review / approval flow | Submit for review; reviewer approves or rejects with comment | Reviewer notified; author notified on decision |
| 1.5.5 Requirement list + table | Table view with filters; column config | Filters persist; column config persists |
| 1.5.6 Requirement detail panel | Detail panel with tabs: Details / History / Comments | All field changes appear in Timeline |
| 1.5.7 Kanban view | Drag cards between Draft / Review / Approved | Drag triggers state transition (with confirmation for Approved) |
| 1.5.8 Duplicate requirement | Create Draft copy from any requirement | New Draft; no version link to original |
| 1.5.9 Import from library | Add library requirement to project scope | Captures RequirementVersionId at import time |
| 1.5.10 Comments | Add/view comments on requirement | Comments visible to all with read access; stored in Timeline |
| 1.5.11 Export requirements | CSV / XLSX with RequirementVersionId | Version IDs included in export |

**Risks:**
- Versioning logic must be correct before any tender uses it — fixing post-tender is a data integrity issue

---

### Phase 1 Milestone

| Check | Criterion |
|---|---|
| ✓ End-to-end flow | PM creates project → creates library → authors 10 requirements → approves them → exports as CSV |
| ✓ Multi-tenancy | Two tenants have no data visibility into each other |
| ✓ Audit | Every state change appears in the requirement Timeline |
| ✓ Roles | Evaluator role cannot access library administration |

---

## Phase 2 — Tender Execution

**Goal:** Create, publish, and manage a tender; suppliers respond via the portal.  
**Milestone:** A procurement manager can publish a tender and receive submitted responses from suppliers before the submission deadline.

---

### Epic 2.1 — Supplier Registry & Qualification

**Dependencies:** Epic 1.2

| Feature | Description | Done When |
|---|---|---|
| 2.1.1 Register supplier | SupplierProfile creation; all required fields | SupplierProfile created in Registered state; scoped to tenant (SPR-BR-001) |
| 2.1.2 Qualification workflow | QualificationPending → Qualified; document upload; approval | Only Qualified suppliers can be invited to tenders (SPR-BR-003) |
| 2.1.3 Supplier list + filters | Filter by qualification status, category, portal access | Filters persist |
| 2.1.4 Supplier profile detail | 5 tabs: Overview / Qualifications / Certifications / Tenders / History | History tab includes all tender participations |
| 2.1.5 Certification tracking | Expiry date; color coding (green/amber/red) | Cert expiry < 30 days → amber; expired → red |
| 2.1.6 Supplier suspension / archive | Suspend blocks portal access; Archive removes from active list | Suspended supplier cannot be added to new tenders |

---

### Epic 2.2 — Tender Wizard

**Dependencies:** Epics 1.3, 1.5, 2.1

| Feature | Description | Done When |
|---|---|---|
| 2.2.1 Wizard step 1: Basics | Title, code, type, description, template selection | Code unique within tenant; type from configured list |
| 2.2.2 Wizard step 2: Requirements | Select from library; set evaluation weights | Min 1 requirement; all weights set; RequirementVersionIds captured |
| 2.2.3 Wizard step 3: Suppliers | Invite Qualified SupplierProfiles | Only Qualified suppliers selectable (LG-SPR-001) |
| 2.2.4 Wizard step 4: Settings | Deadlines, clarification config, anonymization | Submission deadline > today; evaluation deadline > submission deadline |
| 2.2.5 Wizard step 5: Review + Publish | Read-only checklist; Publish action | Publish triggers `TenderPublished` event; requirement versions frozen (GBR-011); all suppliers notified |
| 2.2.6 Save as draft | Persist incomplete wizard state | PM can resume wizard from last step |

---

### Epic 2.3 — Tender Management Workspace

**Dependencies:** Epic 2.2

| Feature | Description | Done When |
|---|---|---|
| 2.3.1 Stage progress bar | All 6 stages; active/completed/upcoming/overdue states | Stage correctly reflects tender lifecycle state |
| 2.3.2 Lifecycle CTAs | Primary action changes with each stage | Each CTA shows confirmation dialog explaining consequences |
| 2.3.3 Overview tab | Progress summary, timeline, next-phase checklist | Data reflects real-time state |
| 2.3.4 Requirements tab | Frozen snapshot view (post-publication) | No editing possible post-publish; version IDs shown |
| 2.3.5 Suppliers tab | Response status table; resend/revoke portal access | Status updates in real-time as suppliers act |
| 2.3.6 Tender export | Tender Document PDF; Requirement Snapshot CSV; Audit Trail PDF | All exports include version metadata |

---

### Epic 2.4 — Supplier Portal

**Dependencies:** Epic 2.2

| Feature | Description | Done When |
|---|---|---|
| 2.4.1 Portal authentication | Separate auth flow for supplier contacts | Supplier can only access their own tenant/supplier data |
| 2.4.2 Invitation email + activation | Supplier receives email; activates portal account | Activation link expires after 7 days; resend available |
| 2.4.3 Tender invitation dashboard | Open invitations with deadline countdown | Only tenders supplier is invited to; no cross-supplier visibility |
| 2.4.4 Response editor | Per-requirement: compliance radio + description + evidence upload | Auto-save every 30 seconds; progress bar updates |
| 2.4.5 Response submission | Confirmation dialog; submission locks response | Post-submission: read-only; submission timestamp recorded |
| 2.4.6 View published clarifications | All answers published to all (anonymized) | Supplier sees all Q&A published for their tender |
| 2.4.7 Supplier profile (portal) | Update contact details | Legal name read-only; contact details editable by supplier |

**Risks:**
- Supplier portal isolation is a security boundary — must be validated via penetration test before any live tender
- Supplier authentication must be separate from buyer authentication; shared identity service must not create cross-access

---

### Phase 2 Milestone

| Check | Criterion |
|---|---|
| ✓ End-to-end flow | PM creates tender → publishes → supplier receives invitation → supplier submits response before deadline |
| ✓ Version integrity | Requirement version IDs match between tender wizard selection and supplier response record |
| ✓ Isolation | Supplier A cannot see Supplier B's response or profile |
| ✓ Deadline enforcement | System blocks supplier submission after deadline |
| ✓ Audit | Publish event, invitation events, submission event all in tender Timeline |

---

## Phase 3 — Evaluation and Decision

**Goal:** Complete evaluation of responses; produce a formal, auditable procurement decision.  
**Milestone:** A procurement manager can run a complete evaluation, lock scores, and produce an approved Decision record.

---

### Epic 3.1 — Clarification Workspace

**Dependencies:** Epic 2.3

| Feature | Description | Done When |
|---|---|---|
| 3.1.1 Question submission (portal) | Supplier posts question; optionally links to requirement | Question stored with tender ID, supplier ID, timestamp |
| 3.1.2 Thread list | Open / Draft / Answered / Published views | Procurement Manager sees all threads for their tender |
| 3.1.3 Answer editor | Rich text; auto-save draft; AI draft button | Draft saved every 30 seconds |
| 3.1.4 Publish to one | Answer sent to asking supplier only | Answer stored; audit record created |
| 3.1.5 Publish to all | Anonymized answer sent to all invited suppliers | All suppliers notified; answer visible in portal |
| 3.1.6 Amendment notice | Formal change record; optional deadline extension | All suppliers notified; tender deadline updated if extended |
| 3.1.7 Clarification deadline enforcement | No new supplier questions after deadline | System blocks submission; buyer receives warning for late-posted questions |
| 3.1.8 Clarification Log export | PDF of all Q&A + amendment notices | Version-stamped; includes publication dates |

---

### Epic 3.2 — Evaluation Workspace

**Dependencies:** Epics 2.3, 2.4

| Feature | Description | Done When |
|---|---|---|
| 3.2.1 Evaluator assignment | Assign evaluators to suppliers (and requirements) | Assignment creates system-generated task for each evaluator |
| 3.2.2 Individual scoring interface | 1–10 buttons; rationale for extreme scores; per-requirement | Evaluator can only see own scores (GBR-013 enforced) |
| 3.2.3 Progress tracking | Evaluator sees their own completeness; PM sees all evaluators | Progress bar per evaluator; completeness % in matrix |
| 3.2.4 Evaluation Matrix — pre-lock | M×N grid; completeness cells; no scores revealed | Heatmap hidden; completeness indicators shown |
| 3.2.5 Lock evaluations | All evaluations become immutable; scores revealed | `EvaluationsLocked` event emitted; GBR-013 enforced by system |
| 3.2.6 Evaluation Matrix — post-lock | Score heatmap; supplier ranking; variance indicators | Rank badges visible; ⚡ variance > 2.0 std dev flagged |
| 3.2.7 Cell detail panel | Per-cell: evaluator breakdown + supplier response excerpt | Only available post-lock |
| 3.2.8 Score revision | Revision flow with justification; audit record | Original score preserved; revision event in Timeline |
| 3.2.9 Evaluation exports | Matrix XLSX/PDF; Gap Report; Calibration Report | All include RequirementVersionIds and evaluator IDs |

**Risks:**
- Blind scoring (GBR-013) must be enforced at the API layer, not only in the UI — a direct API call must not reveal scores before lock
- Evaluation locking must be tested as truly irreversible

---

### Epic 3.3 — Decision Workspace

**Dependencies:** Epic 3.2

| Feature | Description | Done When |
|---|---|---|
| 3.3.1 Configure decision board | Add board members + chair | Board configuration stored; members notified |
| 3.3.2 COI declaration | Per-supplier declaration (conflict / none) for each board member | All members must declare before report access granted |
| 3.3.3 Report access control | Conflicted members receive redacted report | Redaction computed server-side; not a UI-only restriction |
| 3.3.4 Evaluation report view | Read-only evaluation summary for board | Post-lock only; access controlled by COI status |
| 3.3.5 Record decision | Awarded supplier; justification; trade-offs; conditions | All fields required; AI justification draft available |
| 3.3.6 Board approval | All board members approve; chair finalizes | System tracks per-member approval; all-approved → Decision locked |
| 3.3.7 Immutable Decision record | Decision cannot be modified after approval | GBR-017: any change requires Revocation |
| 3.3.8 Revocation flow | Create new Decision; original preserved | Original Decision record archived; new Decision in Draft |
| 3.3.9 Decision report export | Full decision + justification + approvals + COI declarations | Version-stamped; suitable as formal procurement record |

**Risks:**
- COI redaction must be tested: a conflicted board member must not be able to access conflicted supplier's data via any API route
- Decision immutability must be enforced by the domain model, not only by the UI

---

### Phase 3 Milestone

| Check | Criterion |
|---|---|
| ✓ End-to-end flow | PM closes submissions → assigns evaluators → evaluators score → PM locks evaluations → board convened → COI declared → decision recorded → all board approves → Decision locked |
| ✓ Blind scoring | Evaluator cannot see other scores until lock — tested via API and UI |
| ✓ COI redaction | Conflicted board member cannot access conflicted supplier data — tested via API |
| ✓ Immutability | Approved Decision cannot be modified — tested via API |
| ✓ Audit | Every evaluation submission, lock, COI declaration, and approval in Timeline |

---

## Phase 4 — Reporting, Administration, and AI

**Goal:** Production-grade deployment with full reporting, administration, and embedded AI assistance.  
**Milestone:** Platform is ready for enterprise deployment with all reports, admin capabilities, and AI enabled.

---

### Epic 4.1 — Reports

**Dependencies:** Phases 1–3 complete

| Feature | Description | Done When |
|---|---|---|
| 4.1.1 Tender Summary Report | All phases in one document | Includes all requirement versions, evaluation summary, decision |
| 4.1.2 Evaluation Matrix Report | Full scored comparison PDF/XLSX | GBR-013 compliant (heatmap only post-lock) |
| 4.1.3 Clarification Log | Q&A + amendments PDF | Suitable for procurement audit |
| 4.1.4 Decision Report | Award + justification + approvals | Suitable as formal procurement decision document |
| 4.1.5 Audit Trail Report | Full event history for a tender | Immutable; all events with timestamps and actor IDs |
| 4.1.6 Supplier Participation Report | Cross-tender participation summary | Per-supplier or per-tender scope |

---

### Epic 4.2 — Administration

**Dependencies:** Epic 1.2

| Feature | Description | Done When |
|---|---|---|
| 4.2.1 User administration UI | Full user management with all lifecycle actions | Admin can manage all users within tenant |
| 4.2.2 Role management | Fine-grained role assignment | Roles enforced at API layer |
| 4.2.3 Configuration management | Tender types; requirement categories; supplier categories | Config changes emit audit events; active-tender impact warning shown |
| 4.2.4 Audit log viewer | Read-only view of all tenant audit events | Filterable by event type, actor, date, record |
| 4.2.5 System alerts | Storage; expired certifications; inactive users | Admin notified via dashboard + email |

---

### Epic 4.3 — AI Assistant

**Dependencies:** All prior epics

| Feature | Description | Done When |
|---|---|---|
| 4.3.1 Requirement quality score | Real-time 1–10 score as author types | Score displayed; updates on each keystroke (debounced) |
| 4.3.2 Duplicate detection (requirements) | Warns if similar requirement exists in library | Warning shown before saving; user can dismiss |
| 4.3.3 Requirement gap detection (tender) | Flags missing categories in tender requirement set | Shown in Tender Wizard Step 2 and Requirements tab |
| 4.3.4 Clarification answer drafting | AI drafts a proposed answer from requirement text | Draft shown with [✦ AI] chip; user must Accept/Edit/Dismiss |
| 4.3.5 Evaluation variance alert | ⚡ on cells with std dev > 2.0 | Per-cell in matrix; dismissible per evaluator session |
| 4.3.6 Decision justification draft | AI generates draft justification from evaluation data | Shown in Record Decision dialog; must be accepted by user |
| 4.3.7 Dashboard insights | At-risk tasks, workload imbalance, deadline warnings | Max 3 shown; all dismissible; not regenerated for 7 days |
| 4.3.8 AI panel in all workspaces | Contextual AI panel in Detail Panel per workspace | Panel collapses/expands; state persists per user |

**Risks:**
- AI output must never be applied without explicit user confirmation — this must be enforced in the UI, not just by guidance
- AI response latency must not block UI rendering — all AI calls are asynchronous; workspace loads without AI content if AI is slow

---

### Phase 4 Milestone

| Check | Criterion |
|---|---|
| ✓ Reports | All 6 report types generate correctly with version metadata |
| ✓ Administration | Org Admin can manage all users, roles, and configuration without engineering intervention |
| ✓ AI | All AI features work; no AI change is applied without user Accept action |
| ✓ Audit | Full Audit Trail Report covers every binding action across a complete tender lifecycle |

---

## Cross-Cutting Concerns

These are not phase-specific — they must be addressed continuously throughout all phases.

| Concern | Requirement | Risk |
|---|---|---|
| **Performance** | Table views with 500+ rows must render without perceptible delay (virtual scrolling) | Heavy requirement/supplier sets in large tenants |
| **Data isolation** | Every API route must enforce TenantId scoping | A bug here is a security incident |
| **Accessibility** | WCAG 2.1 AA; keyboard navigation; ARIA labels on interactive elements | Enterprise procurement includes users with accessibility needs |
| **Email delivery** | Invitation, notification, and amendment emails must be deliverable and not flagged as spam | Supplier invitation flow fails silently if email is blocked |
| **Session security** | Session tokens expire; concurrent session handling; secure cookie flags | Enterprise security requirements |
| **Error handling** | All domain errors surface as plain-language messages; no technical stack traces in UI | User trust |
| **Localization** | UI text must be extractable for translation; date/number formats locale-aware | Enterprise customers may require German + English minimum |

---

## Dependency Map

```
1.1 Auth + Multi-tenancy
  └── 1.2 Org & Users
        ├── 1.3 Projects
        │     └── 2.2 Tender Wizard ─────────────────────────┐
        ├── 1.4 Requirement Library                           │
        │     └── 1.5 Requirement Authoring ─────────────────┤
        └── 2.1 Supplier Registry ──────────────────────────►2.2
                                                              │
                                              2.3 Tender Workspace
                                              2.4 Supplier Portal
                                                     │
                                              3.1 Clarifications
                                              3.2 Evaluation
                                                     │
                                              3.3 Decision
                                                     │
                                     4.1 Reports + 4.2 Admin + 4.3 AI
```

---

## Key Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Multi-tenancy breach | Low | Critical | Automated cross-tenant isolation tests run on every build |
| Blind scoring violated (GBR-013) | Low | High | API-layer enforcement; tested via direct API calls without UI |
| Decision immutability broken | Low | High | Domain model enforces immutability; UI restriction is secondary |
| Supplier portal cross-access | Low | Critical | Separate auth; penetration test before Phase 2 go-live |
| Requirement versioning drift | Medium | High | Version IDs checked in integration tests at tender creation and response submission |
| AI latency blocks UX | Medium | Medium | All AI calls async; workspace loads before AI content; timeout gracefully |
| Email delivery failures | Medium | Medium | Use reputable email provider; SPF/DKIM/DMARC configured; monitor delivery rates |
| Scope creep (features not in roadmap) | High | Medium | Every feature request assessed against: "Does this help us build the best enterprise tender management platform?" |

---

## Milestones Summary

| Milestone | Phase | Key Criterion |
|---|---|---|
| M1 — Foundation | Phase 1 | Project created → library built → requirements approved → exported |
| M2 — First Tender | Phase 2 | Tender published → supplier responds → submission received |
| M3 — First Decision | Phase 3 | Evaluations locked → decision approved → Decision record immutable |
| M4 — Production Ready | Phase 4 | All reports, admin, AI enabled; audit trail complete |
