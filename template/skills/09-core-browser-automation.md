---
name: core-browser-automation
description: Interaction hierarchy for web UIs (structured page APIs, JS state inspection, accessibility snapshots). Use when automating, inspecting or debugging a web UI through a browser automation tool.
---

# Browser Automation

## I. Interaction Hierarchy

When interacting with web interfaces, always prioritize structured protocols over fragile DOM elements:

1. **WebMCP Discovery:** Check if the browser or page exposes a structured API for agents. Review schemas and execute actions programmatically using structured WebMCP commands.
2. **State Inspection (JS Injection):** If analyzing application states, do not scrape the DOM. Inject programmatic queries to evaluate global state variables (e.g. `window.store` for Redux or Zustand store singletons) to read state values directly.
3. **Accessibility Snapshot Fallback:** If visual interaction is necessary, retrieve a text-based Accessibility (A11y) snapshot. Identify interactive elements (buttons, inputs) strictly by their unique snapshot identifiers (`uid`) instead of fragile, volatile CSS classes.

## II. Robust Scripting

- **Wait for Idle:** Always wait for navigation and network idle states before querying elements.
- **Console Audit:** In case of element failures, inspect browser console logs immediately before guessing source-code edits.
