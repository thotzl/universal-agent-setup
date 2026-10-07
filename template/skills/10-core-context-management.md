---
name: core-context-management
description: Context window hygiene - filter large logs and outputs with local scripts instead of reading them raw. Use when handling large logs, JSON or XML dumps, long command output, or multi-session state handoffs.
---

# Context Management

## I. Workspace Sandboxing (Artifacts)

- **Zero Pollution:** To prevent polluting the main Git repository and the agent's context window, all temporary scripts, filtered logs, and temporary outputs must be written inside `.agents/artifacts/`.
- **Gitignore Safety:** Ensure `.agents/artifacts/` is registered in the workspace's ignore list to keep it completely private.

## II. Extractive Compression Workflows

- **Never read large logs:** Do not read massive `.log`, `.json`, or `.xml` outputs directly into the chat context.
- **Filter Locally:** Always write a specialized, lightweight local script (Python, JS, or Bash) into `.agents/artifacts/` to scan and filter the logs locally. Only read the final, filtered high-signal lines (e.g., specific stack-traces or error entries) back into your context window.
- **State Handoffs:** For multi-turn persistence, save the current goals, active bugs, and immediate tasks into `.agents/state/active-task.md`.
