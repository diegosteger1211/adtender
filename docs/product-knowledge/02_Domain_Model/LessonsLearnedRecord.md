---
id: PKB-02-008
title: LessonsLearnedRecord — Domain Object Specification
version: 1.0
status: APPROVED
owner: Domain Architecture
domain: Knowledge Management
audience:
  - Software Architect
  - Developer
  - AI Development Agent
  - Product Owner
  - QA Engineer
depends_on:
  - PKB-00-MASTER
  - PKB-02-002
  - PKB-02-003
  - PKB-02-005
  - PKB-02-006
  - PKB-02-007
  - PKB-01-001
used_by:
  - KnowledgeAsset
  - Project
related_processes:
  - BP13_Project_Closing
  - BP14_Lessons_Learned
  - BP15_Knowledge_Management
tags:
  - domain-model
  - aggregate
  - lessons-learned
  - knowledge
  - ddd
---

# LessonsLearnedRecord — Domain Object Specification

## 1. Executive Summary

The LessonsLearnedRecord is the structured capture of organizational learning produced at the end of every project. It is the primary mechanism by which project experience is transformed into reusable organizational knowledge — Requirements improved, templates updated, processes corrected, and Knowledge Assets created.

A LessonsLearnedRecord is not a retrospective ceremony report. It is a domain aggregate that enforces structured capture: each lesson must reference the specific Business Object it concerns, each process deviation must have a root-cause classification, and each improvement proposal must be specific enough to be actionable by a Library Manager without additional context.

The LessonsLearnedRecord is **mandatory for all projects** (GBR-018). A project cannot reach the `Archived` state without an `Approved` LessonsLearnedRecord. This is not a soft requirement — it is a domain-enforced state dependency between the Project aggregate and this aggregate.

The output of this aggregate — the `ImprovementProposal` collection — is submitted to BP15 (Knowledge Management) for organizational knowledge governance. This is the closure of the Knowledge Flywheel: `Library → Project → Tender → Evaluation → Decision → LessonsLearned → Improved Library`.

---

## 2. Purpose

The `LessonsLearnedRecord` aggregate:

1. Provides a structured container for all learning captured during a project's closing phase
2. Enforces that lessons reference specific Business Objects (not vague observations)
3. Governs the lifecycle of improvement proposals from creation through submission to Knowledge Management
4. Enforces approval by the Project Owner before proposals are submitted
5. Triggers the organizational knowledge improvement pipeline by producing the `ImprovementProposalsSubmitted` event consumed by BP15

---

## 3. Business Motivation

**Why is LessonsLearnedRecord a separate aggregate from Project?**

The Project aggregate governs the project lifecycle — its stakeholders, milestones, and business context. The LessonsLearnedRecord governs the learning extraction process — a post-execution activity that produces outputs consumed by the Knowledge Management bounded context, not the Project Management context. Separating them allows Knowledge Management to evolve its intake process independently of Project lifecycle rules.

**Why is structured capture enforced at the aggregate level?**

Organizations routinely conduct retrospectives that produce narrative notes. Narrative notes are not actionable by Library Managers. A lesson that says "Requirements were unclear" cannot be turned into a library improvement. A lesson that says "Requirement REQ-112 acceptance criterion for response time was ambiguous — three Evaluators interpreted it differently, producing a divergence of 2.1 points on a 5-point scale — propose change to acceptance criterion text" can be acted upon directly. The LessonsLearnedRecord enforces specificity as a domain invariant.

**Why must ImprovementProposals reference source lessons?**

Library Managers who receive improvement proposals need project evidence to assess whether the proposal reflects a systemic issue or a one-off edge case. A proposal with no source reference cannot be evaluated on its merits. The aggregate enforces provenance at the entity level.

**Why is Project Owner approval mandatory?**

Improvement proposals submitted to the organizational library affect future projects across the organization. The Project Owner is accountable for the quality of the project's output — including its organizational contribution. Project Owner approval ensures that proposals are reviewed by the accountable stakeholder before they enter the organizational governance process.

---

## 4. Responsibilities

- Capturing structured lessons from four categories: Requirement quality, process deviations, evaluation quality, and general project experience
- Enforcing that each lesson references a specific Business Object (`RequirementId`, `RequirementVersionId`, process step ID, or Knowledge Asset reference)
- Managing the lifecycle of `ImprovementProposal` entities from creation through approval
- Enforcing that the Project Owner approves the record before proposals are submitted
- Producing the `ImprovementProposalsSubmitted` event that triggers BP15 intake
- Maintaining the complete audit trail of the lessons learned process

### Scope

**In scope:**
- RequirementLesson entities: quality observations about specific Requirements used in the project
- ProcessDeviation entities: deviations from the standard procurement process with root cause
- EvaluationLesson entities: quality observations about the evaluation model, scoring calibration, and knock-out design
- GeneralLesson entities: project-level observations that do not fit the three structured categories above
- ImprovementProposal entities: actionable proposals for library or process improvement, derived from lessons
- Session metadata: date, participants, facilitator
- Approval record: Project Owner approval of the complete record
- Submission record: formal submission of proposals to BP15

**Out of scope:**
- Library contribution governance (BP05 — this is governed by Knowledge Management after submission)
- Knowledge Asset creation (BP15 — this is triggered by the proposals, not owned here)
- Project closing formalities (BP13 — the Project aggregate owns closing)
- Evaluation scoring data (owned by Evaluation aggregate; referenced here by ID only)
- Decision content (owned by Decision aggregate; referenced here by ID only)

---

## 5. Business Context

The LessonsLearnedRecord sits at the intersection of Project Management and Knowledge Management, serving as the bridge that closes the Knowledge Flywheel.

```
Project (BP01–BP13)
    │
    │ ProjectClosed event
    ▼
LessonsLearnedRecord ──── lessons + proposals ────► BP15 Knowledge Management
    │                                                         │
    │ ImprovementProposalsSubmitted                           │
    │                                               BP05 Library acceptance
    │                                                         │
    └─────────────────────────────────────────── Updated Requirement Library
                                                            │
                                             Next project has better library ←──
```

The aggregate is initiated by a `ProjectClosed` event from the Project domain (BP13). The facilitating Project Manager prepares session data from the platform — this includes pulling metrics from the Evaluation aggregate (`AnomalyRecord` data, knock-out rates) and from the Requirement domain (clarification request counts per Requirement, inter-evaluator divergence data). This data is read-only context; the LessonsLearnedRecord does not embed it.

After approval, the record is submitted to BP15. The Library Manager in BP15 then routes each ImprovementProposal to the responsible library owner for BP05 governance.

---

## 6. Lifecycle

```
ProjectClosed event
    │
    │ InitiateLessonsLearned (Project Manager)
    ▼
  Initiated
    │
    │ (Session prepared; participants gathered)
    │ RecordRequirementLesson / RecordProcessDeviation
    │ RecordEvaluationLesson / RecordGeneralLesson
    ▼
  InProgress
    │
    │ CreateImprovementProposal (from lessons)
    │ All lessons reviewed; all proposals created
    │
    │ SubmitForApproval (Project Manager)
    ▼
  AwaitingApproval
    │
    │ RequestRevision (Project Owner) ──────────────► InProgress
    │ ApproveLessonsLearnedRecord (Project Owner)
    ▼
  Approved
    │
    │ SubmitImprovementProposals (Project Manager)
    ▼
  Submitted ─────────────────────────── (ImprovementProposals now in BP15)
```

State immutability: Once `Approved`, the LessonsLearnedRecord content is immutable. Proposals may only be updated before approval. After submission, the record and all proposals are permanently immutable.

---

## 7. State Machine

### Permitted transitions

| From | To | Command | Guard |
|---|---|---|---|
| (new) | `Initiated` | `InitiateLessonsLearned` | Project in `Closing` state; acting user has `LessonsLearned.Initiate` permission; GBR-018 |
| `Initiated` | `InProgress` | First `RecordLesson` command of any type | — |
| `InProgress` | `AwaitingApproval` | `SubmitForApproval` | At least one lesson recorded in each mandatory category (Requirement quality + process deviation); at least one `ImprovementProposal` created; BP14-BR-002 |
| `AwaitingApproval` | `InProgress` | `RequestRevision` | Project Owner provides revision notes |
| `AwaitingApproval` | `Approved` | `ApproveLessonsLearnedRecord` | Project Owner actor; no pending revision requests |
| `Approved` | `Submitted` | `SubmitImprovementProposals` | Project Manager actor; `Approved` state |

### Forbidden transitions

| Forbidden | Reason |
|---|---|
| Any mutation after `Approved` | LLR-BR-006: record is immutable after approval |
| `SubmitForApproval` with no lessons | BP14-BR-002: structured lessons mandatory |
| `SubmitForApproval` with `ImprovementProposal` referencing no source lesson | LLR-BR-003 |
| `ApproveLessonsLearnedRecord` without Requirement quality retrospective completed | BP14-BR-002 |
| Project transition to `Archived` without `LessonsLearnedRecord` in `Submitted` state | GBR-018 (enforced on the Project aggregate) |

---

## 8. Business Rules

| Rule ID | Rule | Enforcement Layer | When Active |
|---|---|---|---|
| LLR-BR-001 | A LessonsLearnedRecord must be initiated within 30 calendar days of project closing. | Application Service policy; configurable warning at 20 days | After `ProjectClosed` |
| LLR-BR-002 | Each lesson must reference a specific Business Object: a `RequirementId`, `RequirementVersionId`, named process step, or evaluation group. Lessons with no specific reference are rejected. | `RecordLesson` command guard | At creation |
| LLR-BR-003 | Each `ImprovementProposal` must reference the `lessonId` that generated it. Proposals without a source lesson are rejected. | `CreateImprovementProposal` guard | At creation |
| LLR-BR-004 | At minimum, at least one lesson must be recorded in the `RequirementQuality` category and one in the `ProcessDeviation` category before the record can be submitted for approval. | `SubmitForApproval` guard | BP14-BR-002 |
| LLR-BR-005 | A `ProcessDeviation` must include a `RootCause` classification. Free-text deviation records without classification are rejected. | `RecordProcessDeviation` guard | At creation |
| LLR-BR-006 | Once `Approved`, the LessonsLearnedRecord is immutable. No changes to lessons, proposals, or metadata are permitted. | Domain invariant; Repository write block | After `Approved` |
| LLR-BR-007 | An `ImprovementProposal` of type `RequirementImprovement` must include a before/after comparison showing the specific proposed change. | `CreateImprovementProposal` guard (type-specific) | For RequirementImprovement type |
| LLR-BR-008 | The Project Owner who approves the LessonsLearnedRecord must not be the same person as the Project Manager who submitted it. | `ApproveLessonsLearnedRecord` guard | At approval |
| GBR-018 | Lessons Learned is mandatory for all closed projects. The Project aggregate must enforce that `LessonsLearnedRecord.status == Submitted` before it can transition to `Archived`. | Project aggregate state guard (cross-aggregate) | At project archival |
| GBR-001 | All actions are auditable. | Aggregate audit log | Always |

---

## 9. Relationships

```
Project (1)
    └── projectId ────────────────────────────── LessonsLearnedRecord (1 per project)
                                                        │
                                            ┌───────────┼───────────────┐
                                            │           │               │
                                  RequirementLesson[]  ProcessDeviation[]  ImprovementProposal[]
                                            │
                              requirementId (cross-BC reference, read-only)
                              requirementVersionId (optional, for version-specific issues)

Evaluation (consumed for session prep context)
    └── AnomalyRecord[] (read at session prep; not embedded in LessonsLearnedRecord)
    └── EvaluationLesson[] reference tenderId + evaluationId

Tender (consumed for context)
    └── tenderId referenced in EvaluationLesson

ImprovementProposal ────────────────────────────► BP15 (after SubmitImprovementProposals)
```

The LessonsLearnedRecord does **not** embed:
- Requirement content (references by `RequirementId` / `RequirementVersionId`)
- Evaluation scores or score matrices (referenced by `EvaluationId`)
- Tender data (referenced by `TenderId`)
- Decision rationale (referenced by `DecisionId`)

---

## 10. Aggregate Design

```
LessonsLearnedRecord (Aggregate Root)
├── recordId: LessonsLearnedRecordId
├── projectId: ProjectId                          immutable
├── tenderId: TenderId?                           immutable; null for non-tender projects
├── tenantId: TenantId                            immutable
├── status: LessonsLearnedStatus
├── sessionMetadata: SessionMetadata
│   ├── sessionDate: Date
│   ├── facilitatorUserId: UserId               (Project Manager)
│   ├── participants: Participant[]
│   │   └── Participant
│   │       ├── userId: UserId
│   │       └── role: ParticipantRole           ProjectOwner | ProcurementManager | RequirementEngineer | Evaluator | Other
│   └── preparationNotes: string?               max 5000 chars
├── requirementLessons: RequirementLesson[]
│   └── RequirementLesson
│       ├── lessonId: LessonId
│       ├── requirementId: RequirementId         cross-BC reference; immutable
│       ├── requirementVersionId: RequirementVersionId?   if lesson targets specific version
│       ├── issueType: RequirementIssueType      AmbiguousWording | UnclearAcceptanceCriteria | WrongResponseType | MissingKnockout | UnnecessaryKnockout | Overcomplexity | Other
│       ├── description: string                  max 5000 chars; mandatory; must be specific
│       ├── evidence: string?                    data from the project (e.g., clarification count, divergence value)
│       └── recordedAt: Timestamp
├── processDeviations: ProcessDeviation[]
│   └── ProcessDeviation
│       ├── deviationId: DeviationId
│       ├── processStep: ProcessStepReference    reference to a named BP activity (e.g., "BP07-A3")
│       ├── description: string                  max 5000 chars
│       ├── rootCause: ProcessDeviationRootCause  ProcessGap | ToolLimitation | HumanError | ExternalConstraint | IntentionalException
│       ├── recommendation: ProcessDeviationRecommendation  ConfigurationChange | ProcessGuidanceUpdate | ExceptionAccepted | CorrectiveMeasure
│       └── recordedAt: Timestamp
├── evaluationLessons: EvaluationLesson[]
│   └── EvaluationLesson
│       ├── lessonId: LessonId
│       ├── tenderId: TenderId                   cross-BC reference
│       ├── evaluationId: ConsolidatedEvaluationId?  cross-BC reference
│       ├── issueType: EvaluationIssueType       ScoringCriteriaUnclear | EvaluationModelWeightsMisaligned | HighAnomalyRate | KnockoutDesignIssue | CalibrationGap | Other
│       ├── description: string                  max 5000 chars
│       ├── anomalyCount?: int                   from EvaluationManagement
│       └── recordedAt: Timestamp
├── generalLessons: GeneralLesson[]
│   └── GeneralLesson
│       ├── lessonId: LessonId
│       ├── category: GeneralLessonCategory      Timeline | Stakeholder | Communication | RiskManagement | SupplierEngagement | Governance | Other
│       ├── description: string                  max 5000 chars
│       └── recordedAt: Timestamp
├── improvementProposals: ImprovementProposal[]
│   └── ImprovementProposal
│       ├── proposalId: ImprovementProposalId
│       ├── sourceLessonId: LessonId             mandatory; LLR-BR-003
│       ├── proposalType: ImprovementProposalType  RequirementImprovement | NewLibraryRequirement | TemplateImprovement | ProcessImprovement | KnowledgeAssetCreation
│       ├── title: string                        max 300 chars
│       ├── description: string                  max 5000 chars
│       ├── beforeState: string?                 for RequirementImprovement: current text; LLR-BR-007
│       ├── afterState: string?                  for RequirementImprovement: proposed text; LLR-BR-007
│       ├── businessJustification: string        max 2000 chars
│       ├── priority: ProposalPriority           High | Medium | Low
│       ├── targetLibraryId: LibraryId?          if targeting a specific library
│       └── createdAt: Timestamp
├── approvalRecord: ApprovalRecord?              set at ApproveLessonsLearnedRecord
│   ├── approvedBy: UserId
│   ├── approvedAt: Timestamp
│   └── approvalNotes: string?
├── submissionRecord: SubmissionRecord?          set at SubmitImprovementProposals
│   ├── submittedBy: UserId
│   ├── submittedAt: Timestamp
│   └── bp15ReferenceId: string?                assigned by BP15 intake
└── auditLog: AuditEntry[]
```

---

## 11. Entities

### RequirementLesson (Entity within LessonsLearnedRecord)

The most important lesson category. Must reference a specific Requirement. The `issueType` forces the capturing actor to classify the nature of the problem — preventing the "requirements were unclear" anti-pattern.

| Attribute | Type | Rules |
|---|---|---|
| `lessonId` | `LessonId` | Immutable |
| `requirementId` | `RequirementId` | Cross-BC reference; must be a Requirement that was used in the project's Tender |
| `issueType` | `RequirementIssueType` | Enum; mandatory |
| `description` | `string` | 1–5000 chars; must not be generic per LLR-BR-002 |
| `evidence` | `string?` | Quantitative evidence preferred (clarification count, divergence score) |

### ImprovementProposal (Entity within LessonsLearnedRecord)

The output entity that feeds BP15. This is the unit of value produced by the LessonsLearnedRecord aggregate.

| Attribute | Type | Rules |
|---|---|---|
| `proposalId` | `ImprovementProposalId` | Immutable |
| `sourceLessonId` | `LessonId` | Must reference a lesson within this record (LLR-BR-003) |
| `proposalType` | `ImprovementProposalType` | Determines content validation (LLR-BR-007 applies to RequirementImprovement) |
| `beforeState` | `string?` | Mandatory for `RequirementImprovement` type |
| `afterState` | `string?` | Mandatory for `RequirementImprovement` type |
| `priority` | `ProposalPriority` | `High \| Medium \| Low` |

### ProcessDeviation (Entity within LessonsLearnedRecord)

| Attribute | Type | Rules |
|---|---|---|
| `processStep` | `ProcessStepReference` | Must reference a named BP step (e.g., "BP07-A3") — not a free-text description |
| `rootCause` | `ProcessDeviationRootCause` | Mandatory enum (LLR-BR-005) |
| `recommendation` | `ProcessDeviationRecommendation` | Mandatory enum |

---

## 12. Value Objects

| Value Object | Type | Constraints |
|---|---|---|
| `LessonsLearnedRecordId` | UUID | — |
| `LessonsLearnedStatus` | enum | `Initiated \| InProgress \| AwaitingApproval \| Approved \| Submitted` |
| `RequirementIssueType` | enum | `AmbiguousWording \| UnclearAcceptanceCriteria \| WrongResponseType \| MissingKnockout \| UnnecessaryKnockout \| Overcomplexity \| Other` |
| `ProcessDeviationRootCause` | enum | `ProcessGap \| ToolLimitation \| HumanError \| ExternalConstraint \| IntentionalException` |
| `ProcessDeviationRecommendation` | enum | `ConfigurationChange \| ProcessGuidanceUpdate \| ExceptionAccepted \| CorrectiveMeasure` |
| `EvaluationIssueType` | enum | `ScoringCriteriaUnclear \| EvaluationModelWeightsMisaligned \| HighAnomalyRate \| KnockoutDesignIssue \| CalibrationGap \| Other` |
| `ImprovementProposalType` | enum | `RequirementImprovement \| NewLibraryRequirement \| TemplateImprovement \| ProcessImprovement \| KnowledgeAssetCreation` |
| `ProposalPriority` | enum | `High \| Medium \| Low` |
| `ProcessStepReference` | `{ bpId: string, stepId: string }` | e.g., `{ bpId: "BP07", stepId: "A3" }`; validated against BP step registry |
| `ParticipantRole` | enum | `ProjectOwner \| ProcurementManager \| RequirementEngineer \| Evaluator \| Other` |

---

## 13. Commands

| Command | Actor | Preconditions | State Change | Events Produced |
|---|---|---|---|---|
| `InitiateLessonsLearned` | Project Manager | Project in `Closing` state; no existing `LessonsLearnedRecord` for project | (new) → `Initiated` | `LessonsLearnedInitiated` |
| `RecordRequirementLesson` | Requirement Engineer / Project Manager | Status `InProgress` or `Initiated`; `requirementId` references Requirement used in project; description non-generic (LLR-BR-002) | Adds `RequirementLesson`; → `InProgress` if `Initiated` | `RequirementLessonRecorded` |
| `RecordProcessDeviation` | Project Manager / Procurement Manager | Status `InProgress` or `Initiated`; `processStep` valid; `rootCause` provided (LLR-BR-005) | Adds `ProcessDeviation` | `ProcessDeviationRecorded` |
| `RecordEvaluationLesson` | Procurement Manager / Evaluator | Status `InProgress` | Adds `EvaluationLesson` | `EvaluationLessonRecorded` |
| `RecordGeneralLesson` | Any participant | Status `InProgress` | Adds `GeneralLesson` | `GeneralLessonRecorded` |
| `CreateImprovementProposal` | Project Manager / Requirement Engineer | Status `InProgress`; `sourceLessonId` valid (LLR-BR-003); `beforeState`/`afterState` for RequirementImprovement (LLR-BR-007) | Adds `ImprovementProposal` | `ImprovementProposalCreated` |
| `SubmitForApproval` | Project Manager | Status `InProgress`; LLR-BR-004 satisfied; ≥1 `ImprovementProposal` exists | `InProgress` → `AwaitingApproval` | `LessonsLearnedSubmittedForApproval` |
| `RequestRevision` | Project Owner | Status `AwaitingApproval`; revision notes provided | `AwaitingApproval` → `InProgress` | `LessonsLearnedRevisionRequested` |
| `ApproveLessonsLearnedRecord` | Project Owner | Status `AwaitingApproval`; LLR-BR-008 (approver ≠ submitter) | `AwaitingApproval` → `Approved` | `LessonsLearnedRecordApproved` |
| `SubmitImprovementProposals` | Project Manager | Status `Approved` | `Approved` → `Submitted` | `ImprovementProposalsSubmitted` |

---

## 14. Events

| Event | Trigger | Critical Payload |
|---|---|---|
| `LessonsLearnedInitiated` | `InitiateLessonsLearned` | `recordId`, `projectId`, `tenderId?`, `initiatedBy`, `initiatedAt` |
| `RequirementLessonRecorded` | `RecordRequirementLesson` | `recordId`, `lessonId`, `requirementId`, `issueType`, `recordedAt` |
| `ProcessDeviationRecorded` | `RecordProcessDeviation` | `recordId`, `deviationId`, `processStep`, `rootCause`, `recommendation`, `recordedAt` |
| `EvaluationLessonRecorded` | `RecordEvaluationLesson` | `recordId`, `lessonId`, `tenderId`, `issueType`, `recordedAt` |
| `ImprovementProposalCreated` | `CreateImprovementProposal` | `recordId`, `proposalId`, `proposalType`, `sourceLessonId`, `priority`, `createdAt` |
| `LessonsLearnedRecordApproved` | `ApproveLessonsLearnedRecord` | `recordId`, `projectId`, `approvedBy`, `approvedAt`, `proposalCount` |
| `ImprovementProposalsSubmitted` | `SubmitImprovementProposals` | `recordId`, `projectId`, `proposals[]` (proposalId + type + priority per entry), `submittedAt` |

**`ImprovementProposalsSubmitted` is the primary integration event.** BP15 subscribes to this event and ingests the proposals into the organizational improvement pipeline. The event payload must carry enough proposal data for BP15 to begin routing without additional queries.

---

## 15. API Considerations

**Base resource:** `/api/v1/projects/{projectId}/lessons-learned-records`

```
POST   /api/v1/projects/{projectId}/lessons-learned-records
       — InitiateLessonsLearned; returns 201 with recordId

GET    /api/v1/projects/{projectId}/lessons-learned-records/{recordId}
       — Get full record including all lessons and proposals

POST   /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/requirement-lessons
       — RecordRequirementLesson

POST   /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/process-deviations
       — RecordProcessDeviation

POST   /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/evaluation-lessons
       — RecordEvaluationLesson

POST   /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/general-lessons
       — RecordGeneralLesson

POST   /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/improvement-proposals
       — CreateImprovementProposal

POST   /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/submit-for-approval
       — SubmitForApproval

POST   /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/request-revision
       — RequestRevision (Project Owner)

POST   /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/approve
       — ApproveLessonsLearnedRecord

POST   /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/submit-proposals
       — SubmitImprovementProposals

GET    /api/v1/projects/{projectId}/lessons-learned-records/{recordId}/improvement-proposals
       — List proposals (also accessible to Library Managers post-submission)
```

**Error codes:**

| Code | Trigger |
|---|---|
| `LESSONS_LEARNED_ALREADY_EXISTS` | Attempt to initiate when one already exists for this project |
| `LESSON_REFERENCE_REQUIRED` | Lesson recorded with no `requirementId` or `processStep` reference |
| `IMPROVEMENT_PROPOSAL_SOURCE_REQUIRED` | Proposal without `sourceLessonId` |
| `MANDATORY_CATEGORIES_INCOMPLETE` | `SubmitForApproval` with missing RequirementQuality or ProcessDeviation lessons |
| `SELF_APPROVAL_PROHIBITED` | Approver is the same user as the submitter (LLR-BR-008) |
| `RECORD_IMMUTABLE` | Mutation attempt on `Approved` or `Submitted` record |

### Permissions

| Permission | Required Role(s) | Scope |
|---|---|---|
| `LessonsLearned.Initiate` | Project Manager | Own project |
| `LessonsLearned.RecordLesson` | Project Manager, Requirement Engineer, Evaluator, Procurement Manager | Own project; any lesson category per role |
| `LessonsLearned.CreateProposal` | Project Manager, Requirement Engineer | Own project |
| `LessonsLearned.SubmitForApproval` | Project Manager | Own project |
| `LessonsLearned.Approve` | Project Owner | Own project; must not be submitter |
| `LessonsLearned.SubmitProposals` | Project Manager | Own project; record must be `Approved` |
| `LessonsLearned.View` | All project stakeholders | Own project |
| `LessonsLearned.ViewProposals` | Library Manager (post-submission), all project stakeholders | Proposals accessible to Library Manager after submission |

---

## 16. UI Considerations

**Session preparation dashboard:** When the Project Manager initiates Lessons Learned, the platform pre-loads a session preparation view showing:
- Requirements with the highest clarification request counts during the Tender phase
- Evaluation anomaly records with their types and resolution outcomes
- Requirement revision counts during the project
- Inter-evaluator score divergence per Requirement group

This data is read from the Evaluation and Tender domains — it is context for the session, not content of the LessonsLearnedRecord.

**Structured lesson entry forms:** Each lesson category has its own form with appropriate fields. The RequirementLesson form includes a Requirement picker (linked to the project's Requirements), issue type selector, and a description field with a character minimum enforced in the UI. The ProcessDeviation form shows a visual process map with clickable steps.

**Before/After comparison editor:** For `RequirementImprovement` proposals, the UI renders a side-by-side diff editor showing the current Requirement text (pulled by reference) on the left and the proposed improvement on the right. The before-state is pre-filled from the referenced Requirement; the Project Manager only authors the after-state.

**Completeness indicator:** A visual progress bar showing: RequirementLessons recorded, ProcessDeviations recorded, ImprovementProposals created. The SubmitForApproval action is disabled until LLR-BR-004 is satisfied.

**Post-approval read view:** After the record is `Approved`, all lesson and proposal content switches to read-only. A clearly visible "Approved" banner and approval metadata (approver name, date) are shown. No edit controls are rendered.

---

## 17. AI Guidance

**AI may assist with:**

- **Session preparation report generation:** AI can generate the pre-session data pull automatically — Requirements ranked by clarification count, anomaly summary, divergence metrics — saving the Project Manager 1–2 hours of manual data gathering
- **Lesson specificity check:** When a Project Manager types a lesson description, AI can assess whether the description is specific enough to be actionable (references a specific Requirement, includes evidence) — and provide inline improvement suggestions
- **ImprovementProposal drafting:** Given a recorded lesson, AI can draft an initial ImprovementProposal with suggested before/after text for RequirementImprovement proposals. The PM reviews and confirms before the proposal is created.
- **Duplicate detection:** AI can detect when a newly recorded lesson closely matches lessons recorded in previous projects' LessonsLearnedRecords — surfacing "this is a recurring issue" context
- **Pattern analysis across projects:** AI can aggregate lessons across multiple projects to identify systemic patterns — e.g., "RequirementIssueType: UnclearAcceptanceCriteria has been recorded in 6 of the last 8 projects in the IT domain" — and suggest proactive Knowledge Asset creation

**AI must not:**

- Create lessons or proposals autonomously without PM review
- Approve the LessonsLearnedRecord
- Submit proposals to BP15 without explicit PM command
- Reference Evaluation scores or Decision rationale in AI-generated lesson summaries without making the source data explicit

---

## 18. Machine Context

```yaml
domain: Knowledge Management
bounded_context: KnowledgeManagement (but triggered from ProjectManagement)
aggregate_root: LessonsLearnedRecord

lifecycle: [Initiated, InProgress, AwaitingApproval, Approved, Submitted]

mandatory: true  # GBR-018: every project must have one in Submitted state before Archived

critical_invariants:
  - GBR-018: Project cannot archive without LessonsLearnedRecord in Submitted state
  - LLR-BR-002: every lesson must reference a specific Business Object (not generic)
  - LLR-BR-003: every ImprovementProposal must reference a sourceLessonId
  - LLR-BR-006: immutable after Approved
  - LLR-BR-008: approver ≠ submitter

key_events:
  - LessonsLearnedInitiated
  - ImprovementProposalCreated
  - LessonsLearnedRecordApproved
  - ImprovementProposalsSubmitted   # triggers BP15 intake

primary_relationships:
  - initiated_for: Project (ProjectId)
  - lessons_reference: Requirement (RequirementId), Tender (TenderId), ConsolidatedEvaluation (EvaluationId)
  - proposals_submitted_to: BP15 Knowledge Management

cross_aggregate_constraint:
  - Project aggregate must check LessonsLearnedRecord.status == Submitted
    before allowing transition to Archived (GBR-018)
  - This is the ONLY cross-aggregate dependency in this aggregate's lifecycle

never:
  - allow_generic_lessons_without_specific_business_object_reference
  - allow_proposal_without_source_lesson
  - allow_approval_by_submitter
  - allow_mutation_after_approved
  - allow_ai_to_create_lessons_or_approve_record
```

---

## 19. Anti-Patterns

**Recording narrative observations instead of structured lessons:**
"The overall project communication was challenging" is not a lesson — it is a mood. The aggregate's guards prevent this but the UI must also encourage specificity. A lesson that cannot drive an `ImprovementProposal` is not a lesson.

**Creating ImprovementProposals without tracing them to a lesson:**
The `sourceLessonId` requirement exists precisely to prevent decontextualized proposals from reaching Library Managers. A Library Manager who receives "change Requirement REQ-112 acceptance criterion" without knowing why (two Evaluators interpreted it differently in three consecutive projects) has no basis for prioritization.

**Approving the record before all evaluation data is reviewed:**
The evaluation quality retrospective is often skipped when a project "went well." Anomaly rates and score divergence data are valuable even in successful evaluations — they reveal calibration gaps that erode evaluation quality incrementally. The platform should warn when evaluation lessons are absent, though it cannot force them (not all projects produce anomaly data).

**Treating LessonsLearned as a project closure formality:**
If LessonsLearned is viewed as a box to check before archiving, proposals become generic and low-quality. The platform KPI "proposal acceptance rate by Library Manager" is the organizational signal that lessons captured are actually actionable.

---

## 20. Examples

### Example 1: RequirementLesson producing an ImprovementProposal

Project team records: `RequirementLesson { requirementId: REQ-112, issueType: UnclearAcceptanceCriteria, description: "Requirement REQ-112 (API response time) acceptance criterion was 'under 2 seconds.' Three Evaluators interpreted this differently — one scored Supplier A as non-fulfilled because the submitted test results showed 1.95s average with P99 at 2.3s. Two scored as fulfilled. This produced an anomaly in the ConsolidatedEvaluation and required post-discussion score revision. Evidence: AnomalyRecord EVL-ANO-087, divergence 2.1/5." }`

From this lesson, Project Manager creates: `ImprovementProposal { type: RequirementImprovement, sourceLessonId: LES-001, beforeState: "Response time under 2 seconds.", afterState: "Response time under 2 seconds (P95 ≤ 1.5s; P99 ≤ 2.0s). Evidence: automated load test report required, format: JMeter or k6 summary." }`

Library Manager receives this proposal with full context. The before/after diff is immediately actionable.

### Example 2: GBR-018 enforcement

Project Manager attempts to transition the Project to `Archived` state before LessonsLearned is completed. The Project aggregate calls `LessonsLearnedRecord.getStatusForProject(projectId)`. Result: `InProgress`. The Project aggregate raises `PROJECT_ARCHIVAL_BLOCKED_PENDING_LESSONS_LEARNED` error. The project remains in `Closing` state until the LessonsLearnedRecord reaches `Submitted`.

---

## 21. Implementation Guidance

Implement in this order:

1. **Value objects:** `LessonsLearnedStatus`, `RequirementIssueType`, `ProcessDeviationRootCause`, `ProcessDeviationRecommendation`, `ImprovementProposalType`, `ProposalPriority`, `ProcessStepReference` (with BP step registry validation)
2. **`LessonsLearnedRecord` aggregate root** with `InitiateLessonsLearned` command — cross-BC guard: verify Project is in `Closing` state via Application Service ACL
3. **`RecordRequirementLesson` command** with LLR-BR-002 specificity guard — enforce that `requirementId` is present; the "non-generic description" check is a Domain Service responsibility (e.g., min 100 chars + requirementId)
4. **`RecordProcessDeviation` command** with `rootCause` enum guard (LLR-BR-005)
5. **`RecordEvaluationLesson` command**
6. **`RecordGeneralLesson` command**
7. **`CreateImprovementProposal` command** with LLR-BR-003 source lesson guard and LLR-BR-007 type-specific guard for `RequirementImprovement`
8. **`SubmitForApproval` command** with LLR-BR-004 mandatory category check
9. **`ApproveLessonsLearnedRecord` command** with LLR-BR-008 self-approval guard; produces `LessonsLearnedRecordApproved`
10. **`SubmitImprovementProposals` command** — produces `ImprovementProposalsSubmitted` event with full proposal payload for BP15 consumption
11. **Cross-aggregate check for GBR-018:** Add to Project aggregate's `ArchiveProject` command: call `LessonsLearnedRepository.getStatusForProject(projectId)`, assert `== Submitted`
12. **BP15 event consumer:** Subscribe to `ImprovementProposalsSubmitted`, create BP15 intake records for each proposal

**Critical test:**
- Attempt `RecordRequirementLesson` with no `requirementId` → expect `LESSON_REFERENCE_REQUIRED`
- Attempt `SubmitForApproval` with no `ProcessDeviation` lesson → expect `MANDATORY_CATEGORIES_INCOMPLETE`
- Attempt `ApproveLessonsLearnedRecord` where approver == submitter → expect `SELF_APPROVAL_PROHIBITED`
- Attempt to archive a Project when its LessonsLearnedRecord is `InProgress` → expect `PROJECT_ARCHIVAL_BLOCKED_PENDING_LESSONS_LEARNED`
- Attempt any mutation on `Approved` record → expect `RECORD_IMMUTABLE`

---

## References

- [`AI_MASTER_CONTEXT.md`](../00_Product_DNA/AI_MASTER_CONTEXT.md) — Knowledge Flywheel (Section 8); AI Principles (Section 10)
- [`Architecture_Principles.md`](../00_Product_DNA/Architecture_Principles.md) — AP-006 (audit), AP-010 (knowledge layer)
- [`Business_Rules.md`](../01_Business/Business_Rules.md) — GBR-018, GBR-001
- [`BP13_Project_Closing.md`](../01_Business/BP13_Project_Closing.md) — Initiates this aggregate
- [`BP14_Lessons_Learned.md`](../01_Business/BP14_Lessons_Learned.md) — The business process this aggregate implements
- [`BP15_Knowledge_Management.md`](../01_Business/BP15_Knowledge_Management.md) — Consumes `ImprovementProposalsSubmitted`
- [`Project.md`](./Project.md) — Parent project; enforces GBR-018 on archival
- [`Requirement.md`](./Requirement.md) — Requirements referenced in `RequirementLesson` entities
- [`Evaluation.md`](./Evaluation.md) — Source of anomaly data used in session preparation
- [`KnowledgeAsset.md`](./KnowledgeAsset.md) — Target of `KnowledgeAssetCreation` proposal type
