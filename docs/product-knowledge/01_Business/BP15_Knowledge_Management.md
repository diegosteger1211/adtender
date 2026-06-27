---
id: PKB-01-BP15
title: BP15 — Knowledge Management
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

# BP15 — Knowledge Management

## Purpose

This process governs the organizational Knowledge Base as a strategic asset: receiving improvement proposals from projects, creating and maintaining Knowledge Assets, archiving project experience, and ensuring the library remains current, complete and high quality over time.

BP15 is the organizational-level counterpart to BP05 (Library Management at the library level). Together they constitute the Knowledge Flywheel that makes adtender a learning platform rather than a transactional tool.

---

## Business Context

BP15 operates at the organizational layer — above individual projects and libraries. Its responsibilities are:

1. **Intake governance:** Reviewing improvement proposals from BP14 and routing them to the appropriate Library Managers (BP05) for library-level acceptance
2. **Knowledge Asset creation:** Extracting reusable organizational intelligence from project experiences — beyond individual Requirements — and encoding it as structured Knowledge Assets (evaluation models, procurement playbooks, supplier market maps, etc.)
3. **Project archival:** Ensuring that closed project records are searchable and referenceable by future project teams
4. **Library health oversight:** Monitoring the overall health of all libraries across the organization, not just individual library health

Without BP15, the organizational knowledge base grows organically but without direction. Knowledge Assets become fragmented. Libraries overlap. The knowledge flywheel slows.

---

## Scope

**In scope:**
- Receiving, reviewing and routing improvement proposals from BP14
- Creating and maintaining Knowledge Assets at the organizational layer
- Governing the lifecycle of Knowledge Assets (Draft → Approved → Published → Deprecated)
- Project archive searchability and quality
- Cross-library consistency review
- Library gap identification and proactive library expansion

**Out of scope:**
- Individual library governance (BP05 — the Library Manager governs each library)
- Lessons Learned facilitation (BP14)
- Project-level Requirement management (BP04)

---

## Entry Criteria

BP15 has no single entry condition. It is triggered by:
- `ImprovementProposalsSubmitted` from BP14
- `ProjectClosed` from BP13 (triggers project archival quality review)
- Library Manager request for cross-library consistency review
- Organization-initiated Knowledge Asset creation

---

## Exit Criteria

There is no single exit condition for BP15. Each sub-process has its own completion criteria:
- **Improvement proposal routing:** All proposals assigned to relevant Library Manager(s) for BP05 governance
- **Knowledge Asset:** Asset in `Published` state
- **Project archival:** Archive record enriched and searchable
- **Library health review:** Report produced and recommendations issued

---

## Actors

| Role | Responsibility in BP15 |
|---|---|
| Library Manager | Primary actor: receives routed proposals; governs library contributions (BP05); creates Knowledge Assets |
| Project Manager | Submits improvement proposals (from BP14); contributes to Knowledge Asset creation |
| Domain Expert | Consulted for domain-specific Knowledge Asset creation and validation |
| System Administrator | Configures organizational library structure; manages access |

---

## Knowledge Asset Types

A Knowledge Asset is a structured, reusable organizational knowledge object. Unlike Requirements (which tell Suppliers what to fulfill), Knowledge Assets encode organizational intelligence about how to procure effectively.

| Knowledge Asset Type | Description | Example |
|---|---|---|
| Procurement Playbook | Step-by-step guidance for a specific procurement scenario | "Software Selection for ERP Systems" |
| Evaluation Model Template | Pre-configured Evaluation Model for a procurement type | "IT Software Evaluation — Standard Weights" |
| Supplier Market Map | Structured knowledge about Supplier landscape for a domain | "ERP Vendors — European Market Overview 2024" |
| Project Template | Pre-configured project setup for a common procurement type | "IT Infrastructure Procurement Template" |
| Regulatory Compliance Guide | Structured guidance for procurement in regulated contexts | "EU Public Procurement Compliance Checklist" |
| Risk Register Template | Common procurement risks for a category | "Software Implementation Risk Register" |

Knowledge Assets have the standard lifecycle: `Draft` → `InReview` → `Approved` → `Published` → `Deprecated`.

---

## Sub-Process A: Improvement Proposal Intake and Routing

### A1 — Receive Improvement Proposals

**Actor:** Library Manager (organizational role)  
**Trigger:** `ImprovementProposalsSubmitted` from BP14  
**Action:** The incoming proposals are reviewed for completeness and validity:
- Does each proposal reference a specific Requirement, template or process element?
- Is the proposed change substantive (not a stylistic preference)?
- Is the proposal supported by project evidence?

Proposals that fail the intake check are returned to the submitting Project Manager with a documented reason.

**Events produced:** `ImprovementProposalReceived`

---

### A2 — Route to Library Manager

**Actor:** Library Manager (organizational)  
**Command:** `RouteImprovementProposal`  
**Action:** Each validated proposal is routed to the responsible Library Manager for the affected library. From this point, BP05 sub-process B governs the acceptance or rejection of each proposal.

The organizational Library Manager tracks the proposal status until resolution and reports the aggregate outcome to the submitting project team.

**Events produced:** `ImprovementProposalRouted`

---

### A3 — Track and Report Proposal Outcomes

**Actor:** Library Manager (organizational)  
**Action:** After BP05 governance completes, the outcome is reported to the submitting Project Manager:
- Which proposals were accepted and resulted in new library versions
- Which proposals were rejected and why

This feedback loop motivates future proposal quality.

---

## Sub-Process B: Knowledge Asset Creation

### B1 — Identify Knowledge Asset Need

**Actor:** Library Manager, Domain Expert, Project Manager  
**Action:** A Knowledge Asset need is identified when:
- Multiple projects repeatedly face the same procurement challenge with no reusable guidance
- A new regulatory framework requires procurement compliance knowledge
- An organizational strategic decision creates a new procurement category
- Aggregated Lessons Learned data reveals a systematic pattern across projects

The need is documented as a Knowledge Asset request.

---

### B2 — Author Knowledge Asset

**Actor:** Library Manager, Domain Expert  
**Command:** `CreateKnowledgeAsset`  
**Action:** A Knowledge Asset is authored:
- Asset type selected (see Knowledge Asset Types table above)
- Content authored with reference to source project experiences and external references
- Referenced Requirements, templates and processes linked
- Initial version created in `Draft` state

**Events produced:** `KnowledgeAssetCreated`

---

### B3 — Review and Approve Knowledge Asset

**Actor:** Domain Expert, Library Manager  
**Command:** `ApproveKnowledgeAsset`  
**Action:** The Knowledge Asset is reviewed for accuracy, completeness and cross-asset consistency. Approved Knowledge Assets transition to `Published` state and become available to project teams.

**Events produced:** `KnowledgeAssetApproved`, `KnowledgeAssetPublished`

---

### B4 — Maintain and Deprecate Knowledge Assets

**Actor:** Library Manager  
**Command:** `UpdateKnowledgeAsset`, `DeprecateKnowledgeAsset`  
**Action:** Knowledge Assets are maintained on a regular review cycle. Outdated assets are deprecated with a reference to the replacement asset where applicable.

**Events produced:** `KnowledgeAssetUpdated`, `KnowledgeAssetDeprecated`

---

## Sub-Process C: Project Archival Quality

### C1 — Review Project Archive Record Quality

**Actor:** Library Manager (organizational)  
**Trigger:** `ProjectClosed` from BP13  
**Action:** The project archive record created in BP13 is reviewed for search quality:
- Is the domain and procurement type classification correct?
- Are the key metrics present (Requirements count, Supplier count, outcome)?
- Is the project findable through library search for future reference?
- Does the archive record reference any Requirements, templates or Knowledge Assets that future projects should know about?

Low-quality archive records are returned to the Project Manager for enrichment.

---

### C2 — Enrich Archive with Knowledge Pointers

**Actor:** Library Manager  
**Command:** `EnrichProjectArchive`  
**Action:** The archive record is enriched with cross-references:
- Links to any library Requirements that were created or improved as a result of this project
- Links to any Knowledge Assets created from this project's experience
- Tags for domain, procurement category, outcome type — enabling semantic search

**Events produced:** `ProjectArchiveEnriched`

---

## Sub-Process D: Library Health Oversight

### D1 — Cross-Library Consistency Review

**Actor:** Library Manager (organizational)  
**Action:** Periodic review across all organizational libraries:
- Are there duplicate Requirements across libraries that should be consolidated?
- Are there contradictions between Requirements in different libraries that apply to the same procurement scenario?
- Is library coverage balanced across domains and procurement types?

Findings are issued as recommendations to the responsible Library Managers.

---

### D2 — Library Gap Analysis

**Actor:** Library Manager (organizational)  
**Action:** Based on project archive data, identify library gaps:
- What procurement categories have projects faced without library support?
- Which domains have low reuse rates — suggesting library content does not match real project needs?
- What new procurement scenarios are emerging that require proactive library development?

Gap findings trigger Knowledge Asset creation (Sub-Process B) or targeted library expansion.

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BP15-BR-001 | Knowledge Assets must have at least one Domain Expert review before approval. |
| BP15-BR-002 | Improvement proposals must be routed to the responsible Library Manager within 5 business days of receipt. |
| BP15-BR-003 | Published Knowledge Assets are versioned and immutable at the version level. Changes require a new version. |
| BP15-BR-004 | Cross-library consistency reviews must be conducted at least twice per year for libraries with more than 50 published Requirements. |
| GBR-005 | Reusable knowledge belongs to the organizational layer, independent of any project. |
| GBR-003 | Published Knowledge Asset versions are immutable. |
| GBR-001 | All actions are auditable. |

---

## Domain Events Produced

| Event | Trigger |
|---|---|
| `ImprovementProposalReceived` | Proposal intake |
| `ImprovementProposalRouted` | `RouteImprovementProposal` |
| `KnowledgeAssetCreated` | `CreateKnowledgeAsset` |
| `KnowledgeAssetApproved` | `ApproveKnowledgeAsset` |
| `KnowledgeAssetPublished` | Knowledge Asset approved and published |
| `KnowledgeAssetUpdated` | `UpdateKnowledgeAsset` |
| `KnowledgeAssetDeprecated` | `DeprecateKnowledgeAsset` |
| `ProjectArchiveEnriched` | `EnrichProjectArchive` |

---

## Outputs

| Output | Business Object | State |
|---|---|---|
| Routed improvement proposals | `ImprovementProposal[]` | Routed to BP05 |
| Published Knowledge Assets | `KnowledgeAsset[]` | `Published` |
| Enriched project archive records | `ProjectArchiveRecord[]` | Enriched |
| Library health report | Structured report | Issued |

---

## KPIs

| KPI | Definition | Direction |
|---|---|---|
| Proposal routing speed | Average days from ImprovementProposalReceived to Routed | Lower is better |
| Knowledge Asset creation rate | New Knowledge Assets published per quarter | Monitor for organizational learning activity |
| Archive enrichment rate | Percentage of project archives enriched with cross-references | Higher is better |
| Library consistency issue rate | Cross-library contradictions identified per review cycle | Lower is better |
| Knowledge Asset utilization | Number of projects referencing each Knowledge Asset in BP04/BP06 | Higher is better |

---

## The Knowledge Flywheel

BP15 closes the knowledge flywheel:

```
Projects (BP01–BP13)
       ↓
Lessons Learned (BP14)
       ↓
Improvement Proposals → BP15 routing → BP05 acceptance
       ↓
Updated Library Requirements
       ↓
Next project BP04: higher reuse rate, less rework
       ↑ (flywheel continues)
```

Every successfully accepted improvement proposal makes future projects faster. Every Knowledge Asset reduces the setup cost for a new project type. The organizational value of the platform is not linear — it compounds as the knowledge base grows.

---

## AI Guidance

AI may assist in BP15 by:
- Detecting duplicate or highly similar Knowledge Assets across the organizational library
- Recommending Knowledge Asset creation triggers when pattern analysis identifies recurring project challenges
- Generating Knowledge Asset drafts from aggregated project experience data (clearly labelled as AI-generated drafts requiring expert review)
- Performing gap analysis: mapping project archive records to library coverage and identifying under-served procurement categories
- Scoring incoming improvement proposals for specificity and actionability before routing

AI must not:
- Approve or publish Knowledge Assets
- Route improvement proposals without Library Manager review
- Deprecate Knowledge Assets without human authorization

---

## Anti-Patterns

- Treating BP15 as an administrative archive task rather than a strategic capability — the library and Knowledge Assets stagnate without active governance.
- Creating Knowledge Assets without Domain Expert input — produces generic content that projects will not use.
- Routing all improvement proposals to a single Library Manager regardless of domain — creates bottlenecks and reduces proposal quality review.
- Measuring BP15 success purely by volume (number of proposals received) rather than quality (percentage resulting in published improvements) — incentivizes noise over signal.

---

## References

- [`Business_Rules.md`](./Business_Rules.md) — GBR-005, GBR-003, GBR-001
- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Knowledge Flywheel principle
- [BP05_Library_Management.md](./BP05_Library_Management.md) — Library-level governance
- [BP13_Project_Closing.md](./BP13_Project_Closing.md) — Triggers project archival
- [BP14_Lessons_Learned.md](./BP14_Lessons_Learned.md) — Submits improvement proposals
