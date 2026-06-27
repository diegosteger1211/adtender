---
id: PKB-01-BP04
title: BP04 — Requirement Engineering
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
  - PKB-02-001
---

# BP04 — Requirement Engineering

## Purpose

This process transforms the project scope into a complete set of structured, approved Requirements ready for Tender creation. It is the knowledge-intensive core of the pre-tender phase and the process where organizational library knowledge is most intensively consumed.

The output of BP04 is a complete set of Requirements in `Approved` state — organized into groups, classified, and configured with response types and evaluation properties.

---

## Business Context

Requirements are the single most important Business Object in adtender. They define what suppliers must demonstrate, fulfill, provide or comply with. The quality of Requirements directly determines:
- the quality of Supplier Responses (clear Requirements produce comparable responses)
- the quality of the Evaluation (structured Requirements produce structured, defensible scores)
- the quality of the Decision (traceable Requirements produce auditable decision rationale)
- the value of the knowledge base (reusable Requirements grow in quality over multiple projects)

BP04 is not a documentation exercise. It is a structured knowledge engineering process.

The Requirement Engineer's first action is always to **search the library**. Creation follows only where the library cannot satisfy the need.

---

## Scope

**In scope:**
- Searching Requirement Libraries for reusable Requirements
- Selecting, referencing and where needed adapting library Requirements
- Creating new Requirements where library gaps exist
- Classifying all Requirements (type, category, priority, criticality, knock-out status)
- Configuring response types (how Suppliers must answer each Requirement)
- Configuring evaluation properties (weight, minimum acceptance level)
- Organizing Requirements into groups for the Tender structure
- Managing the Requirement review and approval workflow
- Detecting and resolving duplicates and contradictions

**Out of scope:**
- Tender structure configuration (BP06)
- Evaluation Model detail (BP06)
- Supplier-facing presentation of Requirements (BP07)

---

## Entry Criteria

- Project in `Planned` state (`ProjectPlanned` event)
- Scope confirmed by Project Owner
- Domain Experts identified and available

---

## Exit Criteria

BP04 is complete when:

- All Requirements for the Tender are in `Approved` state
- All Requirements are classified: type, category, priority, knock-out flag
- All Requirements have a configured response type
- All Requirements have evaluation configuration: weight or relevance flag
- Requirements are organized into groups
- The Requirement set has been reviewed by Domain Experts and approved by the Project Owner
- No Requirements remain in `Draft` or `InReview` state

---

## Actors

| Role | Responsibility in BP04 |
|---|---|
| Requirement Engineer | Primary actor: searches libraries, creates and classifies Requirements, manages review workflow |
| Domain Expert | Reviews and validates Requirements in their subject area; flags quality issues |
| Project Owner | Approves the complete Requirement set for Tender creation |
| Library Manager | Consulted for library reuse guidance; not a primary actor in this process |

---

## Inputs

| Input | Source | Required State |
|---|---|---|
| Planned Project record | BP03 output | `Planned` |
| Project scope definition | Project record `description`, `businessContext` | Structured |
| Requirement Libraries | Knowledge Management | `Approved` / `Published` |
| Knowledge Assets from similar projects | Knowledge Management | `Published` |
| Domain Expert availability | Project team | Assigned in BP02 |

---

## Activities

### Activity 1 — Define the Requirement Scope

**Actor:** Requirement Engineer, Project Owner  
**Action:** Before searching libraries or creating Requirements, the Requirement scope is defined as a structured outline:
- What domains need to be covered? (e.g., functional, technical, commercial, operational, compliance)
- What types of Requirements are expected? (functional, non-functional, service levels, documentation, etc.)
- Are there known mandatory Requirements that carry knock-out status?
- What is the expected total number of Requirements (rough estimate)?

This outline guides the library search and prevents scope creep.

---

### Activity 2 — Search Requirement Libraries

**Actor:** Requirement Engineer  
**Action:** Before creating any new Requirement, search accessible Requirement Libraries using:
- Project type filter (matches library requirements designed for this type of initiative)
- Domain filter (functional area, technology domain, category)
- Keyword search (title and description)
- Similarity search (AI-assisted: finds semantically similar Requirements)

For each relevant library Requirement found:
- Review its content, version history, classification and prior usage
- Decide: reference as-is, copy with adaptation, or derive a more specific version
- Record the reuse decision with traceability to the source version

**Platform action:** Results are surfaced as Requirement suggestions with similarity scores. The Requirement Engineer confirms or rejects each suggestion.

**Events produced:** `RequirementReused` (per library Requirement selected for this project)

---

### Activity 3 — Create New Requirements

**Actor:** Requirement Engineer  
**Command:** `CreateRequirement`  
**Action:** For each business expectation not covered by existing library Requirements, a new Requirement is created with:

**Mandatory fields:**
- Title (concise, unambiguous, in active voice)
- Description (what the Supplier must fulfill, prove or demonstrate — not how)
- Type (configurable: Functional, Non-Functional, Technical, Organizational, Commercial, Service, Compliance, etc.)
- Category (configurable per tenant)
- Priority (High, Medium, Low — configurable)
- Criticality (Standard, Critical, Knock-out)

**Optional fields (complete before Tender creation):**
- Business rationale
- Acceptance expectation (what a fully compliant response looks like)
- Related Requirements
- Source / regulatory reference (if compliance-driven)

**Events produced:** `RequirementCreated`

---

### Activity 4 — Configure Response Types

**Actor:** Requirement Engineer  
**Command:** `ConfigureRequirementResponse`  
**Action:** For each Requirement, define how Suppliers must answer it:

| Response Type | Use When |
|---|---|
| Yes / No | Binary compliance check |
| Fulfilled / Partially Fulfilled / Not Fulfilled | Three-level compliance assessment |
| Free text | Qualitative description required |
| Number or percentage | Quantitative metric required |
| Date | Delivery date or timeline commitment |
| Single choice | Selection from defined options |
| Multiple choice | Selection of all applicable options |
| Price value | Commercial or cost input |
| URL | Link to product or reference |
| File evidence | Certificate, reference document, product sheet |
| Structured table | Comparison matrix (e.g., module feature list) |

Evidence requirements are also configured here: is a document attachment mandatory, optional, or not applicable?

**Events produced:** `RequirementResponseConfigured`

---

### Activity 5 — Configure Evaluation Properties

**Actor:** Requirement Engineer, Domain Expert  
**Command:** `ConfigureRequirementEvaluation`  
**Action:** For each Requirement, define how it will contribute to the Evaluation:
- Weight (relative importance compared to other Requirements in its group, 0–100)
- Knock-out flag (true/false — if true, non-fulfillment disqualifies the Supplier)
- Minimum acceptance level (minimum score or fulfillment level required to pass without knock-out)
- Evaluation relevance (does this Requirement contribute to scoring, or is it for information only?)

**Events produced:** `RequirementEvaluationConfigured`

---

### Activity 6 — Organize Requirements into Groups

**Actor:** Requirement Engineer  
**Command:** `CreateRequirementGroup`, `AddRequirementToGroup`  
**Action:** Requirements are organized into named groups that will form the Tender structure. Groups typically represent functional areas, evaluation categories, or process areas.

Example groups for a software selection project:
- Functional Capabilities
- Technical Architecture and Infrastructure
- Security and Compliance
- Implementation and Migration
- Service Levels and Support
- Commercial and Pricing
- References and Qualification

Each group has a weight that contributes to the overall Evaluation score.

**Events produced:** `RequirementGroupCreated`, `RequirementAddedToGroup`

---

### Activity 7 — Domain Expert Review

**Actor:** Domain Expert (per group or area)  
**Command:** `ReviewRequirement` (per Requirement)  
**Action:** Domain Experts review Requirements in their subject area for:
- Technical accuracy and completeness
- Unambiguous wording (each Requirement should have one interpretation)
- Feasibility (can this actually be evaluated objectively?)
- Absence of bias toward a specific Supplier's solution
- Correct knock-out designation (not overused, not underused)

Domain Experts flag issues as comments. The Requirement Engineer resolves issues and updates the Requirement before advancing it.

**Events produced:** `RequirementReviewed`, `RequirementCommentAdded` (per issue)

---

### Activity 8 — Submit Requirements for Approval

**Actor:** Requirement Engineer  
**Command:** `SubmitRequirementForApproval` (per Requirement or batch)  
**Action:** Once Domain Expert review is complete and issues resolved, Requirements are submitted for formal approval.

**Events produced:** `RequirementSubmittedForApproval`

---

### Activity 9 — Approve Requirements

**Actor:** Project Owner (or delegated approver per governance configuration)  
**Command:** `ApproveRequirement` (per Requirement or batch)  
**Action:** The Project Owner reviews the Requirements and approves them. An approved Requirement version is immutable.

If a Requirement is rejected, it returns to `Draft` state with rejection comments for the Requirement Engineer to address.

**Business rule enforced:** GBR-003 — approved versions are immutable.

**Events produced:** `RequirementApproved` (per Requirement)

Project state does not change in this activity — the Project remains in `Planned` state until BP06 creates the Tender.

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP04-BR-001 | The Requirement Engineer must perform a library search before creating any new Requirement. The search must be recorded in the audit trail (search query, number of results, selected results). |
| BP04-BR-002 | Every Requirement must have a type, category, priority and criticality classification before it can be submitted for approval. |
| BP04-BR-003 | Every Requirement must have a response type configured before it can be submitted for approval. |
| BP04-BR-004 | Knock-out Requirements must have an explicit `knockoutJustification` field completed before they can be approved. Knock-out designation requires deliberate justification because incorrect knock-out designation can disqualify valid Suppliers. |
| BP04-BR-005 | A Requirement with contradictions or dependency conflicts identified by Domain Experts must not be approved until the conflict is resolved. |
| BP04-BR-006 | A project-specific adaptation of a library Requirement must record the source library Requirement version as `derivedFromVersionId`. |
| GBR-003 | Approved Requirement versions are immutable. |
| GBR-005 | New Requirements created in a project context should be proposed to the library after project completion (BP15). |
| GBR-001 | All actions are auditable. |

---

## State Transitions

| Requirement State | Transition | Trigger | Actor |
|---|---|---|---|
| `Draft` | Created | `CreateRequirement` | Requirement Engineer |
| `Draft` → `InReview` | Submitted for review | `SubmitRequirementForApproval` | Requirement Engineer |
| `InReview` → `Draft` | Rejected | `RejectRequirement` | Project Owner |
| `InReview` → `Approved` | Approved | `ApproveRequirement` | Project Owner |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `RequirementCreated` | `CreateRequirement` |
| `RequirementReused` | Library Requirement selected for project |
| `RequirementResponseConfigured` | `ConfigureRequirementResponse` |
| `RequirementEvaluationConfigured` | `ConfigureRequirementEvaluation` |
| `RequirementGroupCreated` | `CreateRequirementGroup` |
| `RequirementReviewed` | `ReviewRequirement` |
| `RequirementSubmittedForApproval` | `SubmitRequirementForApproval` |
| `RequirementApproved` | `ApproveRequirement` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Complete Requirement set | `Requirement[]` | All `Approved` |
| Requirement groups | `RequirementGroup[]` | Organized |
| Library reuse records | `RequirementReuse[]` | Traced |
| Audit records | `AuditRecord[]` | Immutable |

---

## KPIs

| KPI | Definition |
|---|---|
| Requirement reuse rate | Percentage of Requirements sourced from existing libraries (not newly created) |
| Requirement cycle time | Average days from Requirement creation to Approved state |
| Review iteration count | Average number of review cycles before approval |
| Knock-out rate | Percentage of Requirements designated as knock-out (monitor for over-use) |
| Requirements per group | Average number of Requirements per group (very high counts may indicate grouping issues) |

---

## AI Guidance

AI may assist in BP04 by:
- Searching libraries and returning similar Requirement matches with similarity scores
- Detecting duplicate or near-duplicate Requirements within the current project set
- Detecting contradictions between Requirements (e.g., two Requirements with conflicting constraints)
- Suggesting response types based on Requirement content and type
- Suggesting evaluation weights based on similar prior Tenders
- Improving Requirement wording for clarity and objectivity
- Detecting ambiguous wording ("should", "ideally", "approximately") and suggesting precise alternatives
- Checking completeness: are there obvious gaps in the Requirement scope for this project type?

AI must not:
- Approve Requirements
- Set knock-out flags without human confirmation
- Remove or modify approved Requirements

All AI suggestions are displayed as proposals requiring Requirement Engineer confirmation.

---

## Anti-Patterns

- Creating Requirements without library search — wastes effort, produces duplicates, and degrades library health.
- Writing Requirements as implementation instructions ("The system must use Java") instead of capability expectations ("The system must provide a documented integration API") — biases responses and may exclude valid solutions.
- Over-designating knock-out criteria — if too many Requirements carry knock-out status, valid Suppliers may be excluded for minor gaps. Reserve knock-out for genuinely absolute requirements.
- Skipping evaluation weight configuration and relying on equal weighting — produces Evaluation results that do not reflect business priorities.
- Approving Requirements individually without a final holistic review — misses contradictions and gaps visible only when viewing the complete set.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-001, GBR-003, GBR-005
- [`02_Domain_Model/Requirement.md`](../02_Domain_Model/Requirement.md) — Authoritative Requirement specification
- [BP03_Project_Planning.md](./BP03_Project_Planning.md) — Predecessor process
- [BP05_Library_Management.md](./BP05_Library_Management.md) — Library governance context
- [BP06_Tender_Creation.md](./BP06_Tender_Creation.md) — Next process (consumes approved Requirements)
