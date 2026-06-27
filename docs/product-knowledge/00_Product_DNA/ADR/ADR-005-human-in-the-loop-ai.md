---
id: ADR-005
title: Human-in-the-Loop AI
status: ACCEPTED
date: 2025-01-01
deciders:
  - Product Architecture
  - Business Architecture
  - Software Architecture
---

# ADR-005 Human-in-the-Loop AI

## Context

adtender integrates AI capabilities throughout its business processes: requirement quality analysis, duplicate detection, evaluation summarization, decision briefing, knowledge gap detection, and more. As AI capabilities mature, there is a natural pressure to increase autonomy — to let AI not just suggest but act.

This pressure must be resisted at the architectural level for the following reasons:

**Regulatory and compliance context:** Public procurement processes in many jurisdictions operate under legal frameworks that require human accountability for selection and award decisions. An automated award decision — even one supported by a transparent scoring model — may be legally invalid.

**Commercial risk:** An erroneous AI-generated action (approving the wrong Requirement version, marking an incomplete evaluation as complete, selecting the wrong supplier) in a high-value procurement has significant financial and reputational consequences. The cost of a human confirmation step is orders of magnitude smaller than the cost of an incorrect automated action.

**Trust and adoption:** Enterprise users — particularly senior procurement managers and decision board members — will not trust a platform that takes autonomous action on their behalf without visibility. AI that makes visible, explainable suggestions and waits for human confirmation builds trust incrementally. AI that acts autonomously will be disabled or circumvented.

**Auditability:** Procurement decisions must be defensible under audit. A decision chain that includes autonomous AI actions is harder to defend than one where every state change is attributable to a named human actor who reviewed AI recommendations.

## Decision

AI capabilities on adtender operate as intelligent advisory services. They do not take binding domain actions autonomously.

### What AI May Do

- Analyze Business Objects and surface findings as suggestions.
- Generate content (requirement wording improvements, decision summaries, knowledge asset drafts) as suggestions.
- Flag risks, inconsistencies, gaps and quality issues.
- Recommend reuse candidates from libraries.
- Generate documents and exports from structured data.
- Assist in classifying, tagging and categorizing Business Objects.
- Answer questions about the knowledge base.

### What AI Must Not Do

- Approve, reject, publish, archive or delete Business Objects.
- Record or approve Decisions.
- Submit Supplier Responses.
- Trigger Workflow state transitions.
- Modify approved or published Business Object versions.
- Assign or modify user permissions.
- Write directly to domain aggregates, bypassing the command pipeline.

### Confirmation Requirement

Any AI-generated content that a user wishes to apply to a Business Object must go through an explicit user confirmation step. The user must be able to review the suggestion, modify it, and confirm before it becomes a domain state change.

### AI Transparency Requirements

- AI-generated content must be visually distinct from human-authored content in all UI surfaces.
- Every AI suggestion must carry: the data sources it used, a confidence indicator, and the ability for the user to inspect and challenge the reasoning.
- All AI interactions are logged with: AI model identity, invocation context, the suggestion produced, and whether the user accepted, modified or rejected it.
- AI interaction logs are part of the audit trail and must not be deletable.

### Technical Implementation

AI services interact with domain data exclusively through:
- Public Application Service methods
- Public REST APIs
- Standard authorization checks

Direct database access, direct aggregate mutation and bypassing of business rule validation are prohibited for AI components, regardless of the justification.

## Options Considered

**Full Autonomy (rejected):** AI acts directly on domain state without human confirmation. Maximum efficiency; unacceptable regulatory, commercial and trust risk.

**Supervised Autonomy (rejected):** AI acts autonomously by default but produces an audit log that humans can review retroactively. Still creates legally unattributable decisions and does not build user trust.

**Human-in-the-Loop (accepted):** AI suggests; human confirms and executes. Every binding domain action is attributable to a named human actor. AI efficiency is captured without sacrificing accountability.

## Consequences

**Positive:**
- Every domain state change is attributable to a named human actor.
- Platform decisions are defensible under audit, legal challenge and regulatory review.
- Users build trust in AI capabilities through transparent, reviewable suggestions.
- AI error consequences are bounded: an incorrect suggestion that is not confirmed has no domain impact.

**Negative / Mitigations:**
- Confirmation steps add friction to high-volume workflows. Mitigated by batch confirmation patterns for bulk AI suggestions and by progressive trust — as AI suggestion quality is measured and proven, bulk confirmation UX can reduce friction while preserving human authorization.
- AI capabilities develop more slowly when they cannot act autonomously. This is an accepted trade-off given the platform's regulatory and enterprise context.

## Compliance Check

Any new AI feature that would result in a domain state change without explicit human confirmation does not comply with this decision. No exception may be implemented without a formal revision of this ADR.

## References

- [`Product_Principles.md — P-005, P-006`](../Product_Principles.md)
- [`Architecture_Principles.md — AP-014, AP-016`](../Architecture_Principles.md)
- [`AI_MASTER_CONTEXT.md — Section 10`](../AI_MASTER_CONTEXT.md)
- [`AI_BOOTSTRAP.md — AI Rules`](../AI_BOOTSTRAP.md)
