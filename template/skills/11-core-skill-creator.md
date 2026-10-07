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
│   ├── YAML frontmatter (only 'name' and 'description' keys)
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
description: Clear, single-line description outlining what the skill does and exactly when the AI should activate it.
---
```

## III. Verification & Packaging

1. **Test Scripts:** Execute all bundled scripts locally first to ensure they output clean, LLM-friendly stdout and suppress standard stack traces.
2. **Remove Placeholders:** Ensure absolutely zero placeholders or task indicators remain in any markdown or script.
3. **Zip Packaging:** Once verified, zip the skill directory and rename its extension to `.skill` (e.g., `zip -r my-skill.skill my-skill-folder/`) for distribution and installation.
