---
id: ADR-002
title: Knowledge before Documents
status: ACCEPTED
date: 2025-01-01
deciders:
  - Product Architecture
  - Business Architecture
---

# ADR-002 Knowledge before Documents

## Context

Traditional procurement platforms are document-centric: they manage the creation, distribution, collection and storage of documents — RFPs as PDFs, supplier responses as Word files, evaluation results as Excel sheets. This approach is familiar to users and reflects how procurement has historically been practiced.

However, document-centric platforms have fundamental limitations that make them unsuitable for adtender's goals:

1. **Documents cannot be compared reliably.** Two suppliers may answer the same question differently because the question was unstructured. Without structured Requirement definitions, side-by-side comparison is manual and error-prone.

2. **Documents cannot be evaluated objectively.** Scoring a Word document requires extracting and interpreting unstructured text. Scoring a structured Supplier Response against typed, weighted Requirements produces a defensible, reproducible result.

3. **Documents cannot be reused efficiently.** A Requirement buried in a PDF cannot be found by a library search, cannot be recommended to future projects, and cannot be improved based on evaluation experience.

4. **Documents cannot support AI analysis at enterprise quality.** AI working on structured, typed Business Objects produces reliable results. AI working on unstructured documents produces hallucinations and misattributions.

5. **Documents obscure traceability.** The chain from business requirement to supplier response to evaluation score to decision is invisible in a document-centric system. Auditors, managers and unsuccessful suppliers cannot reconstruct the basis of a decision.

## Decision

Documents are not the primary source of truth on adtender.

Structured Business Objects and Knowledge Assets are the primary source of truth.

Documents may be:
- **generated** from Business Objects (export a Tender as a PDF for a supplier who cannot access the portal)
- **attached** to Business Objects as evidence (a supplier attaches a certificate to their response)
- **imported** as a starting point for structured data extraction (AI-assisted import of a legacy Excel requirements list)
- **exported** for downstream use (signed contract, handover package)

Documents must never **replace** structured data as the system of record.

## Options Considered

**Option A — Document First (rejected):** Build a document management layer as the primary storage model, with structured data extracted as a secondary concern. Familiar to users but reproduces all limitations listed in the context.

**Option B — Hybrid Equal (rejected):** Treat documents and structured data as co-equal. Users may choose either path. In practice this creates two parallel systems, both incomplete, with no single source of truth.

**Option C — Structured Data First, Documents as Outputs (accepted):** All primary business data is structured. Documents are generated, imported or attached. The structured layer is always authoritative.

## Consequences

**Positive:**
- Reliable comparison and scoring across Supplier Responses.
- Full traceability from Requirement through Response through Evaluation to Decision.
- Reusable Requirement Libraries that grow in quality over time.
- High-quality AI analysis on typed, validated, version-controlled data.
- Defensible, auditable decisions.

**Negative / Mitigations:**
- Higher onboarding effort for users accustomed to document-based workflows. Mitigated by document import capabilities (AI-assisted conversion from legacy formats) and document generation capabilities (the platform can produce familiar document outputs from structured data).
- Some regulatory or contractual processes require specific document formats. Mitigated by the document generation layer — adtender maintains structured data and generates compliant documents from it.

## Compliance Check

When any feature proposal involves storing business information as a document rather than a structured Business Object, this ADR must be consulted. If the information is needed for comparison, evaluation, reuse, AI analysis or decision traceability, it must be structured.

## References

- [`Product_Principles.md — P-001, P-002, P-007`](../Product_Principles.md)
- [`Architecture_Principles.md — AP-007, AP-010`](../Architecture_Principles.md)
- [`Product_Glossary.md — Knowledge Asset, Supplier Response`](../Product_Glossary.md)
- [`AI_MASTER_CONTEXT.md — Section 8`](../AI_MASTER_CONTEXT.md)
