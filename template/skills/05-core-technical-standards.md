---
name: core-technical-standards
description: Schema-first design, data/logic separation, stable interfaces and module boundaries. Use when designing or changing architecture, APIs, DTOs, schemas or public interfaces.
---

# Technical Standards

## I. Architectural Core

- **Schema-First Design:** Data Transfer Objects (DTOs), API contracts, types, and input/output schemas must be fully defined and validated before any dependent business or UI logic is written.
- **Data vs. Logic Separation:** Maintain strict boundaries between state and execution logic. State should be pure data; modifications should happen via isolated, functional modules or actions.
- **Modularity Boundaries:** Protect core integrity. Extend existing architectural structures using stable modular interfaces instead of modifying core, unrelated codebases.

## II. Quality & Maintainability

- **Unified Comments:** All code comments, logs, and documentations must be strictly in English, focusing entirely on explaining the architectural or logical "why".
- **Formatting Standards:** Adhere strictly to the workspace's designated styling configurations (e.g., eslint, prettier). Ensure code formatting is automatically applied prior to review.
- **Stability Guarantee:** Keep public interfaces, classes, and exported APIs structurally stable during refactoring to prevent regressions across dependee scopes.
