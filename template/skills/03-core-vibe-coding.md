---
name: core-vibe-coding
description: Rapid spike mode with relaxed guardrails. Use only when the user explicitly asks for a spike, prototype, proof of concept, hackathon code or a throwaway UI draft, never for production code.
---

# Vibe Coding (Rapid Spike Mode)

> **⚠️ Operational Intent:** This skill is strictly for hackathons, visual spikes, proofs-of-concept, and throwaway prototypes. For production-grade architecture, use `core-agentic-engineering`.

## I. Core Mindset: Hit, Run & Iterate

- **Bias for Immediate Output:** Suppress architectural debates, formal phase gates, and design patterns. Deliver a functional, visually visible result in the minimum number of turns.
- **Runtime-Driven over Contract-Driven:** If it runs in the runtime/browser and meets the visual/interactive need, it succeeds. Do not invent heavy schemas or multi-tier abstractions before seeing it work.
- **Zero Interruption:** Do not pause to ask routine architectural questions. Make bold, sensible default assumptions and implement end-to-end immediately.

## II. Relaxed Guardrails

- **Tests Deferred:** Do not write unit, integration, or regression test suites unless explicitly requested. Optimize strictly for execution speed and visual feedback.
- **Pragmatic Typing:** While fatal syntax and compiler errors must be resolved, avoid spending turns engineering complex generic type systems. Use inline types, utility shortcuts, or pragmatic assertions to maintain momentum.
- **Inline over Abstraction:** Avoid premature modularity, plugin factories, or multi-file indirection. Colocate logic where it is used. A working single-file component beats an unrendered five-file clean architecture.

## III. Quarantine & Spike Discipline

- **Prototype Tagging:** Add a top-level notice `// SPIKE / PROTOTYPE - NOT ARCHITECTURAL STANDARD` to generated core files so experimental code is never mistaken for production standards.
- **Fail-Fast Pivoting:** If a chosen library or quick approach hits friction within 2 turns, discard it immediately and try the simplest alternative instead of debugging deep framework internals.
