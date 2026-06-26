---
id: PKB-00-003
title: Architecture Principles
version: 1.0
status: APPROVED
owner: Product Architecture
---

# Architecture Principles

## AP-001 Domain Driven Design

The technical architecture follows the business domain model.

## AP-002 Business Logic in Domain Layer

Business rules must live in the domain layer, not in UI or controllers.

## AP-003 API First

Business capabilities must be exposed through stable APIs.

## AP-004 Event Driven Business Facts

Relevant state changes create immutable domain events.

## AP-005 Version Everything Important

Important Business Objects must support versioning.

## AP-006 Audit Everything Relevant

Relevant business actions must be auditable.

## AP-007 Single Source of Business Truth

Every Business Object has one authoritative representation.

## AP-008 Loose Coupling

Domains should interact through explicit relationships, APIs and events.

## AP-009 Configuration Layer

Customer-specific behavior should be modeled as configuration, rules, workflows or templates.

## AP-010 Knowledge Layer

Reusable knowledge must be separated from project-specific usage.
