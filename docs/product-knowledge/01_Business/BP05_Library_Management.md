---
id: PKB-01-BP05
title: BP05 — Library & Knowledge Reuse
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

# BP05 — Library & Knowledge Reuse

## Purpose

This process governs the organizational Requirement Libraries and Knowledge Assets that provide reusable content to all projects on the platform. It is a continuous capability — not a sequential step — that operates in parallel with and in support of all other processes.

BP05 has two directional flows:
1. **Outbound:** Making library content available to projects (consumed primarily in BP04)
2. **Inbound:** Receiving and governing improvement contributions from projects (received primarily from BP15)

---

## Business Context

BP05 is the operational expression of the knowledge flywheel. Without a governed library process, knowledge created in one project never reaches the next. With it, each project adds measurable value to the organizational knowledge base.

The Requirement Library is not a document library. It is a governed repository of structured, versioned, classified Requirements — the organization's accumulated understanding of what to expect from suppliers across different domains. Over time, this library becomes a strategic asset.

BP05 differs from all other processes in that it has no sequential entry or exit gate in the project lifecycle. It is an organizational capability that exists independently of any single project.

---

## Scope

**In scope:**
- Governing Requirement Library structure and content quality
- Publishing new Requirements to libraries
- Managing library Requirement versions and deprecation
- Receiving, reviewing and approving improvement proposals from projects
- Maintaining Knowledge Assets
- Managing Template lifecycle (Project templates, Tender templates, Evaluation Model templates)
- Measuring and reporting library health

**Out of scope:**
- Project-specific Requirement creation (BP04)
- Lessons Learned capture (BP14)
- Knowledge extraction from projects (BP15 — this process governs the library side; BP15 governs the project contribution side)

---

## Entry Criteria

BP05 has no single entry condition. It is activated by:
- The creation of a new Requirement Library (organizational decision)
- The submission of an improvement proposal from a project (event: `RequirementImprovementProposed`)
- The Library Manager's regular quality review cycle
- The creation of a new project that searches libraries (event: `ProjectPlanned`)

---

## Exit Criteria

BP05 does not have a single exit condition. Each sub-process has its own exit:
- **Library publishing:** Requirement is in `Published` (library) state
- **Improvement proposal:** Proposal accepted or rejected with documented rationale
- **Deprecation:** Requirement in `Deprecated` state with replacement reference where applicable

---

## Actors

| Role | Responsibility in BP05 |
|---|---|
| Library Manager | Primary governance actor: reviews contributions, publishes new versions, manages deprecation |
| Requirement Engineer | Searches and uses library content; submits improvement proposals |
| Domain Expert | Consulted for domain-specific quality validation of library content |
| System Administrator | Configures library access permissions and organizational library structure |

---

## Library Structure

A Requirement Library is a named, governed collection of Requirements belonging to the organizational layer. Libraries may represent:

| Library Type | Examples |
|---|---|
| Domain library | IT Systems, Manufacturing Equipment, Professional Services, Logistics |
| Process library | Software Selection, ERP Implementation, Infrastructure Procurement |
| Compliance library | GDPR requirements, ISO 27001 controls, regulatory requirements |
| Industry library | Automotive supplier standards, pharmaceutical procurement, public sector minimum requirements |
| Organizational library | Company-wide standard commercial terms, general service level requirements |

A Requirement may belong to multiple libraries. A library may contain Requirements from multiple domains.

---

## Sub-Process A: Library Search and Reuse (Outbound)

This sub-process is invoked from BP04 when the Requirement Engineer searches for reusable content.

### A1 — Search Libraries

**Actor:** Requirement Engineer  
**Action:** Search accessible libraries using:
- Project type match
- Domain and category filters
- Free-text keyword search
- AI-assisted semantic similarity search

Results are ranked by relevance, prior usage frequency, and recency of the most recent approval.

### A2 — Evaluate Results

**Actor:** Requirement Engineer  
**Action:** For each relevant result, evaluate:
- Is this Requirement suitable as-is?
- Does it need adaptation for this project's context?
- Is it still current (not deprecated)?
- Is its version history consistent with the project's requirements?

### A3 — Apply Reuse Action

**Actor:** Requirement Engineer  
**Action:** Select the appropriate reuse action:

| Reuse Action | When to Use | Traceability |
|---|---|---|
| **Reference** | Requirement is suitable as-is | Direct link to library version; no copy created |
| **Copy with adaptation** | Minor project-specific changes needed | Copy created; `derivedFromVersionId` set |
| **Derive** | A more specific version of a generic library Requirement | New Requirement; `derivedFromVersionId` set |

**Business rule enforced:** BP04-BR-006 — derived or adapted Requirements must trace to their source.

**Events produced:** `RequirementReused`

---

## Sub-Process B: Library Contribution Review (Inbound)

This sub-process is invoked when a project submits improvement proposals from BP15.

### B1 — Receive Improvement Proposals

**Actor:** Library Manager  
**Trigger:** `RequirementImprovementProposed` event from BP15  
**Action:** The Library Manager receives the improvement proposal and reviews the context:
- Which Requirement is being improved?
- What change is proposed?
- What project experience justifies the change?
- Is the proposed change an improvement or a project-specific adaptation that should not affect the library?

### B2 — Evaluate the Proposal

**Actor:** Library Manager, Domain Expert (if technical validation needed)  
**Action:** The Library Manager evaluates the proposal against library quality criteria:
- Does the improvement benefit the organization beyond the proposing project?
- Is the proposed wording clearer, more complete or more accurate?
- Does the change contradict other library Requirements?
- Are there multiple recent proposals for the same Requirement (indicating systemic quality issues)?

### B3 — Accept or Reject

**Actor:** Library Manager  
**Command:** `AcceptRequirementImprovement` or `RejectRequirementImprovement`  
**Action:**

If accepted:
- A new Requirement version is created in `Draft` state with the proposed content
- The Library Manager reviews and approves the new version
- The new version is published to the library (`Approved` → `Published` in library context)
- The previous version is retained in history

If rejected:
- The rejection reason is documented
- The proposing project is notified

**Events produced:** `RequirementImprovementAccepted` or `RequirementImprovementRejected`, `RequirementVersionCreated`, `RequirementPublishedToLibrary`

---

## Sub-Process C: Proactive Library Governance

This sub-process is not triggered by events — it is a regular governance activity initiated by the Library Manager.

### C1 — Quality Review

**Actor:** Library Manager  
**Action:** Periodically review library health using the reporting capability:
- Identify Requirements not used in any project in the last 12 months (staleness indicator)
- Identify Requirements with high review iteration counts (quality issues)
- Identify Requirements that have been adapted in most projects (candidate for a more flexible version)
- Identify gaps: project types with poor library coverage

### C2 — Deprecation

**Actor:** Library Manager  
**Command:** `DeprecateRequirement`  
**Action:** Requirements that are outdated, replaced or no longer meet quality standards are deprecated. Deprecation requires:
- A reason
- A replacement Requirement reference (where applicable)
- Confirmation that the deprecated Requirement is not currently in use in any active project

**Business rule enforced:** BP05-BR-002 — Requirements cannot be deprecated if they are referenced in an active project Tender.

**Events produced:** `RequirementDeprecated`

### C3 — New Requirements for the Library

**Actor:** Library Manager, Requirement Engineer (proposing)  
**Action:** New Requirements identified as having broad organizational applicability — not just one project — are created directly in the library. These follow the standard Requirement lifecycle: Draft → InReview → Approved → Published.

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP05-BR-001 | Library Requirement versions in `Published` state are immutable. Changes require creating a new version. |
| BP05-BR-002 | A Requirement in active use in a published Tender may not be deprecated. The Requirement must be active until all Tenders referencing its version are closed. |
| BP05-BR-003 | Improvement proposals must include a reference to the source project and a description of the experience that justifies the improvement. |
| BP05-BR-004 | A rejected improvement proposal must include a documented reason visible to the proposing project. |
| BP05-BR-005 | Library access permissions are configured per library. Not all Requirement Engineers have write access to all libraries. Read access for searching is broader than write access for contribution. |
| GBR-003 | Published library versions are immutable. |
| GBR-005 | Reusable knowledge belongs to the organizational layer, independent of any project. |
| GBR-001 | All actions are auditable. |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `RequirementReused` | Requirement Engineer selects a library Requirement for a project |
| `RequirementImprovementProposed` | Improvement proposal submitted from BP15 |
| `RequirementImprovementAccepted` | Library Manager accepts proposal |
| `RequirementImprovementRejected` | Library Manager rejects proposal |
| `RequirementVersionCreated` | New version created from accepted improvement |
| `RequirementPublishedToLibrary` | New or improved Requirement version published |
| `RequirementDeprecated` | `DeprecateRequirement` command executed |

---

## KPIs

| KPI | Definition | Direction |
|---|---|---|
| Library reuse rate | Percentage of Requirements in all projects sourced from libraries (not newly created) | Higher is better |
| Library coverage by domain | Percentage of projects for which library Requirements covered > 50% of scope | Higher is better |
| Contribution acceptance rate | Percentage of improvement proposals accepted by Library Managers | Monitor for quality issues |
| Stale Requirement rate | Percentage of library Requirements not used in any project in 12 months | Lower is better |
| Library size | Total published Requirements per library | Monitor growth vs. stale rate |
| Average Requirement age | Average time since last version update | Lower for active libraries |

---

## AI Guidance

AI may assist in BP05 by:
- Running periodic duplicate detection across the library and surfacing potential duplicates to the Library Manager
- Scoring Requirement quality: clarity, ambiguity level, completeness
- Recommending library consolidation opportunities (similar Requirements that could be merged into one configurable version)
- Identifying library gaps: project types with low reuse rates that suggest missing library content
- Generating similarity-ranked search results for library searches

AI must not:
- Publish new Requirements to the library
- Approve improvement proposals
- Deprecate Requirements

---

## Anti-Patterns

- Libraries that grow without governance — become unusable repositories of contradictory, overlapping, stale content.
- A single "catch-all" library — Requirements without categorization are unsearchable and unusable.
- Treating every project-specific adaptation as a library improvement — the library should contain broadly applicable Requirements; project-specific nuances remain in the project.
- Library Managers approving improvements without Domain Expert validation — reduces library quality over time.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-003, GBR-005
- [`02_Domain_Model/Requirement.md`](../02_Domain_Model/Requirement.md) — Requirement aggregate specification
- [BP04_Requirement_Engineering.md](./BP04_Requirement_Engineering.md) — Primary consumer of library content
- [BP14_Lessons_Learned.md](./BP14_Lessons_Learned.md) — Source of improvement proposals
- [BP15_Knowledge_Management.md](./BP15_Knowledge_Management.md) — Process that submits proposals to BP05
