---
name: core-skill-creator
description: How to write agent-neutral skills (structure, frontmatter, trigger-oriented descriptions, progressive disclosure). Use when creating, restructuring or reviewing a skill.
---

# Skill Creator

This guide provides instructions for creating, validating, and packaging modular, self-contained AI skills.

## I. Core Principles

- **Concise Context:** Keep skill rules lean. AI models are already highly capable; only document non-obvious, domain-specific procedural steps, constraints, and schemas.
- **Progressive Disclosure:**
  1. Keep the core instructions inside `SKILL.md` under 400 lines.
  2. Move heavy, verbose reference material, API specs, or data models to separate markdown files inside a `references/` subdirectory.
  3. Load references on-demand using relative markdown links (e.g., `[API Spec](references/api_spec.md)`).

## II. Directory Structure of a Skill

A standard skill is packaged inside a single directory:

```text
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter ('name' and 'description' required)
│   └── Markdown guidelines and triggers
├── scripts/    - (Optional) Executable scripts (Python, JS, Bash) for deterministic workflows
├── references/ - (Optional) Heavy API schema docs, policies, or structural maps
└── assets/     - (Optional) Non-readable boilerplate code, images, or templates
```

### 1. Frontmatter Format

The `SKILL.md` file must start with clean YAML frontmatter:

```yaml
---
name: skill-name
description: What the skill covers in one sentence. Use when <concrete trigger conditions>.
---
```

- **Portable minimum:** `name` (matching the directory name) and `description` are understood by all agents. Some agents support extra keys (e.g., tool restrictions); treat them as optional and never rely on them for correctness.
- **Description is the trigger:** Many agents only see the description until they decide to load the skill. State _what_ it covers and _when_ to use it (`Use when ...`), naming the concrete tasks, files, frameworks, or keywords that should activate it. A description that only names the topic ("Global standards for X") will rarely trigger.
- **Keep it valid YAML:** One line, no `: ` sequence inside the value (or quote the whole value).
- **Self-contained:** A skill must work when installed on its own. Never rely on `AGENTS.md` or other files outside the skill directory for its rules; inline shared text instead (in this repo via `{{ INCLUDE: <file> }}` from `template/shared/`).

## III. Verification & Packaging

1. **Test Scripts:** Execute all bundled scripts locally first to ensure they output clean, LLM-friendly stdout and suppress standard stack traces.
2. **Remove Placeholders:** Ensure absolutely zero placeholders or task indicators remain in any markdown or script.
3. **Distribution:** Agents load the plain skill directory, so copying it into the target skills folder is enough. For sharing as a single file, zip the directory and use the `.skill` extension (e.g., `zip -r my-skill.skill my-skill-folder/`).
