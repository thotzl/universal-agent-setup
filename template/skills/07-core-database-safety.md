---
name: core-database-safety
description: Migration and transaction safety rules. Use when changing database schemas, writing migrations or seeds, scripting database mutations, or resolving local migration conflicts.
---

# Database Safety

## I. Evolution & Migrations

- **Strict Schema Control:** Never execute database or schema adjustments on live environments manually. Schema evolutions must be explicitly registered via migration scripts.
- **No Speculative Down-Migrations:** Since automatic down-migrations often fail due to unexpected data dependencies, avoid writing theoretical rollback scripts.
- **Local Workspace Resets:** To resolve schema or migration conflicts in your local environment, use a complete database purge/reset tool to guarantee a clean transactional base instead of patching individual tables.

## II. Transactional Security

- **Isolation Safety:** When scripting database interactions, wrap mutations in isolated SQL transactions. Ensure a failure in any intermediate step automatically triggers a complete rollback.
- **Data Integrity Overrides:** Never bypass foreign-key constraints, unique indexes, or schema validation limits to fix test cases. Fix the test data context, not the structural rules.
