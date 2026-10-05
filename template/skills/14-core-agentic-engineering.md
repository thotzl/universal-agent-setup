---
name: core-agentic-engineering
description: Master orchestrator for high-discipline autonomous engineering. Governs dual-loop execution, contract-driven verification, anti-thrashing circuit breakers, and state handoffs.
---

# Agentic Engineering

## I. Dual-Loop Governance & Work Modes

- **ANALYSIS MODE (Default):** Read-only exploration, scanning, planning, and mental model assembly. Modifying system files is strictly forbidden during an Inquiry.
- **EXECUTION MODE:** Entered strictly upon receiving an explicit, unambiguous Directive.
- **Outer Loop (Architect Control):**
  - **Phase Gates (Strict Stops):** For complex multi-phase tasks, reaching the end of a phase is a **hard stop**. Do not proceed automatically. Present: `Phase X complete. Waiting for explicit 'GO PHASE Y'.`
  - **DoD (Definition of Done):** Before executing large implementations, explicitly declare the exact completion criteria. A task is not done until these criteria are fully verified.
- **Inner Loop (Autonomous Execution):**
  - Within an active phase or Directive, execute autonomously through the cycle: `Plan -> Test/Reproduce -> Act -> Validate -> Self-Correct`.
  - Do not interrupt the user on routine mechanical steps, straightforward syntax adjustments, or standard test runs. Solve problems autonomously within the established boundaries.

## II. Specification & Verification Gates

- **Spec-First / Contract-Driven:** Establish and freeze interfaces, schemas (Zod/DTOs), and API contracts before generating implementation code. Ensure type definitions form the single source of truth.
- **Deterministic Validation:** LLM output is probabilistic; code verification must be deterministic. No phase, task, or feature is complete without executing live verification commands (`tsc`, linters, unit/integration test runners). Never claim code works without verified, zero-exit-code command output.

## III. Anti-Thrashing & Circuit Breakers

- **3-Strike Rule:** If an implementation or bug-fix attempt fails 3 times consecutively, trigger a circuit breaker:
  1. Immediately stop modifying code.
  2. Document the original goal, list all current assumptions, and identify which assumptions failed.
  3. Propose an alternative architectural approach or escalate the blocking issue to the user.
- **Fail-Fast on Drift:** If conversational loops, repetitive rationales, or out-of-scope refactorings are detected, halt immediately and realign strictly with the active directive.

## IV. Context Budgeting & Multi-Agent Allocation

- **Extractive Compression:** Keep the main context window lean. Offload large logs or intermediate data to `.agents/artifacts/` using scripts rather than dumping raw tokens into chat.
- **Strategic Delegation:** Delegate isolated tasks—such as batch operations across more than 3 files, repetitive boilerplate, high-output commands, or deep exploratory scans—to specialized sub-agents (`codebase_investigator`, `generalist`).
- **State Handoffs:** For multi-session context persistence, capture current architecture, decisions, open bugs, and immediate next steps in `.agents/artifacts/SESSION_STATE.md`.

## V. Architectural Baselines

{{ INCLUDE: kiss-dry.md }}

- **AbsProduct Pattern:** Prioritize high modularity. When extending software modules or core layers, prefer creating isolated, specialized custom plugins or adapters rather than mutating core framework logic.
- **Data-Logic Separation (ECS):** Keep state models decoupled from behavior and execution logic to ensure testability and boundary isolation.
