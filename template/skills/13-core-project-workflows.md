---
name: core-project-workflows
description: Persisting project knowledge in .agents/skills, structure maps (REPO_MAP, PROJECT_MAP), multi-session handoffs and console log monitoring. Use when documenting findings, syncing repo maps, handing a task over between sessions, or checking .agents/artifacts/console.log.
---

# Project & AI Workflows

This skill covers workspace conventions and AI context management. Execution boundaries (Inquiry vs. Directive, phase gates) are defined in the root `AGENTS.md`.

## I. Workspace Mandates

- **Persistence:** Put durable findings in `.agents/skills/` (delta only). Prefer disk over chat history.
- **State handoff:** For multi-session tasks, use `.agents/state/active-task.md`.
- **Structure Sync:** Scan the repository and sync structural maps (e.g., `PROJECT_MAP.md`) when the overarching structure changes. Use the workspace's designated local scanning script if provided. Otherwise, fallback to the global scanner shipped with this skill: `scripts/gather-context.py` (relative to this skill's directory).
  - _Deterministic Global Output:_ The global fallback script scans standard monorepo folders (`packages/`, `apps/`, `src/`) and outputs a markdown list of all `package.json` names/descriptions and a mapped list of API Controllers/Resolvers (`@Controller`, `@Resolver`).
- **Agnostic Documentation:** When documenting findings or patterns in the workspace ledger (`.agents/skills/`), describe them strictly in terms of file structures and codebase symbols. DO NOT use agent-specific tool names (e.g., `replace`, `write_file`, `Edit`).

## II. Console Monitoring

Use this workflow to observe external processes started by the user or background tasks.

1. **Shared Log:** Assume the standard path for console logs is `.agents/artifacts/console.log`. This file can be a static log or a live stream.
2. **Streaming Awareness:** If a process is known to be running as a stream, the agent should perform periodic checks (re-reading the tail of the file) when prompted or during debugging to capture the latest output.
3. **Efficient Reading:** Never read the entire log file if it's large. Use a shell command such as `tail -n 100` or `grep` to find specific errors or progress markers.
4. **Context Request:** If the user mentions a console error, check this log immediately before asking for more information.

## III. Technical Tooling Notes

- **Bypassing Gitignore:** When accessing or searching within `.agents/` or `.agents/artifacts/`, you MUST ensure your file search and listing tools do not skip gitignored paths (disable gitignore filtering, target the path explicitly, or fall back to shell `find`/`grep`). These directories are often gitignored but essential for agent operations.
