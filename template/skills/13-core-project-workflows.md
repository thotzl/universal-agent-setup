---
name: core-project-workflows
description: Maintains workspace context, persisting findings into .agents/skills/, context dumps and REPO_MAP sync, multi-session handoffs, and strict phase-gates and anti-overstepping execution boundaries.
---

# Project & AI Workflows

This skill merges workspace conventions with advanced AI context management and execution limits.

## I. Workspace Mandates

- **Persistence:** Put durable findings in `.agents/skills/` (delta only). Prefer disk over chat history.
- **State handoff:** For multi-session tasks, use `.agents/state/active-task.md`.
- **Structure Sync:** Scan the repository and sync structural maps (e.g., `PROJECT_MAP.md`) when the overarching structure changes. Use the workspace's designated local scanning script if provided. Otherwise, fallback to the global scanner shipped with this skill: `scripts/gather-context.py` (relative to this skill's directory).
  - _Deterministic Global Output:_ The global fallback script scans standard monorepo folders (`packages/`, `apps/`, `src/`) and outputs a markdown list of all `package.json` names/descriptions and a mapped list of API Controllers/Resolvers (`@Controller`, `@Resolver`).
- **Agnostic Documentation:** When documenting findings or patterns in the workspace ledger (`.agents/skills/`), describe them strictly in terms of file structures and codebase symbols. DO NOT use agent-specific tool names (e.g., `replace`, `write_file`, `Edit`).

## II. Execution Limits & Anti-Overstepping

To prevent the agent from rushing ahead or misinterpreting clarifications as execution commands, adhere to these strict limits:

1. **Workflow Modes:**
   - `MODE: ANALYSIS` -> Read-only. You may plan, explain, search, and read files. You MUST NOT write or edit files or run mutating shell commands.
   - `MODE: EXECUTION` -> Read/Write. You may modify the codebase.
     _(Assume ANALYSIS mode for all new tasks until a plan is explicitly approved)._

2. **Phase Gates (Strict Stops):**
   - When a task is divided into phases (e.g., Phase 1, Phase 2), reaching the end of the current phase is a **HARD STOP**.
   - Do NOT proceed to the next phase automatically.
   - Output exactly: `Phase X complete. Waiting for explicit 'GO PHASE Y'.`
   - Do not interpret conversational answers as a "GO". Only proceed when explicitly told to execute the next phase.

## III. Console Monitoring

Use this workflow to observe external processes started by the user or background tasks.

1. **Shared Log:** Assume the standard path for console logs is `.agents/artifacts/console.log`. This file can be a static log or a live stream.
2. **Streaming Awareness:** If a process is known to be running as a stream, the agent should perform periodic checks (re-reading the tail of the file) when prompted or during debugging to capture the latest output.
3. **Efficient Reading:** Never read the entire log file if it's large. Use a shell command such as `tail -n 100` or `grep` to find specific errors or progress markers.
4. **Context Request:** If the user mentions a console error, check this log immediately before asking for more information.

## IV. Technical Tooling Notes

- **Bypassing Gitignore:** When accessing or searching within `.agents/` or `.agents/artifacts/`, you MUST ensure your file search and listing tools do not skip gitignored paths (disable gitignore filtering, target the path explicitly, or fall back to shell `find`/`grep`). These directories are often gitignored but essential for agent operations.
- **Safe Mutation:** Always verify the `MODE` before using any tool that modifies the file system.
