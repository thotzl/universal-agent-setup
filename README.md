# Universal Agent Setup

> **📓 Official Documentation & Wiki:** The entire, comprehensive guide, installation how-to, architecture overview, and modular skill documentation has been consolidated under the project's official wiki / local documentation.

### 🌐 [Visit the Documentation Home](./wiki/Home.md)

---

## Quick Start (Installation)

To integrate this scaffolding into any target codebase, navigate to your target project folder in your terminal and execute the installer:

```bash
npm start --prefix <path-to-universal-agent-setup-repo>
```

### Path Resolution Examples:

The installer supports absolute, relative, and shell home-directory (`~`) shortcuts. Choose the command that matches where you cloned the repository:

- **If cloned under your user home directory (standard):**
  ```bash
  npm start --prefix ~/projects/universal-agent-setup
  ```
- **Using relative directory paths:**
  ```bash
  npm start --prefix ../universal-agent-setup
  ```
- **Using absolute system paths:**
  ```bash
  npm start --prefix /var/repos/universal-agent-setup
  ```

### 🛠️ Command Line Subcommands

The CLI supports advanced modular subcommands in addition to the standard interactive installation wizard:

- **List all available skills from the manifest:**
  ```bash
  node bin/cli.js skill list
  ```
- **Install a specific skill directly (headless):**
  ```bash
  node bin/cli.js skill add <id> --target <target-directory> [--mode <safe|overwrite>]
  ```
- **Update all currently installed skills to the newest version:**
  ```bash
  node bin/cli.js skill update --target <target-directory>
  ```

---

## Workspace Script Shortcuts

If you are working directly inside the `universal-agent-setup` repository itself, you can utilize these script shortcuts:

```bash
npm start     # Runs the interactive CLI installer locally
npm test      # Runs the comprehensive E2E and compliance test suite
```

---

## 🛠️ Troubleshooting & Manual Redirection

If the installer encounters file-permission or write restrictions, it will gracefully warn you in the console. If any of the agent-typical files (`.cursorrules`, `.windsurfrules`, `.clinerules`, `.copilotrules`, `.github/copilot-instructions.md`, `CLAUDE.md`) cannot be written automatically, simply **manually paste** the following redirection block at the top/bottom of your respective editor rule file:

```markdown
# ==============================================================================

# Universal AI Agent & Copilot Redirection

# ==============================================================================

# This workspace utilizes a unified cognitive rule-structure. To prevent context

# drift, hallucinations, or anti-hallucination rule violations, ALL AI agents

# (Cursor, Copilot, Windsurf, Gemini, Cline, Roo Code, etc.) working inside this

# codebase MUST read, internalize, and strictly prioritize:

#

# 1. The master root mandates in: AGENTS.md

# 2. The compiled, flattened specialized skills in: .agents/skills/

# ==============================================================================
```

---

## 📓 Official Documentation

Click any link below to jump directly to its documentation page:

- [Documentation Landing Page (Home)](./wiki/Home.md)
- [01. Behavioral Baseline Guide](./wiki/01-core-behavioral-baseline.md)
- [02. Analytical Shortcuts Guide](./wiki/02-core-analytical-shortcuts.md)
- [03. Vibe Coding (Rapid Spike) Guide](./wiki/03-core-vibe-coding.md)
- [04. Code Craft Guide](./wiki/04-core-code-craft.md)
- [05. Technical Standards Guide](./wiki/05-core-technical-standards.md)
- [06. Testing Strategies Guide](./wiki/06-core-testing-strategies.md)
- [07. Database Safety Guide](./wiki/07-core-database-safety.md)
- [08. Operations & Ticketing Guide](./wiki/08-core-ops-and-ticketing.md)
- [09. Browser Automation Guide](./wiki/09-core-browser-automation.md)
- [10. Context Management Guide](./wiki/10-core-context-management.md)
- [11. Skill Creator Guide](./wiki/11-core-skill-creator.md)
- [12. Redux Investigator Guide](./wiki/12-core-redux-investigator.md)
- [13. Project & AI Workflows Guide](./wiki/13-core-project-workflows.md)
- [14. Agentic Engineering Standard Guide](./wiki/14-core-agentic-engineering.md)
