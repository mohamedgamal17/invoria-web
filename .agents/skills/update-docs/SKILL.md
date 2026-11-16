---
name: update-docs
description: Use when changing cross-cutting patterns, adding new features, or modifying conventions in Invoria Web — maintains the 3-tier documentation index (docs/README.md -> folder README.md -> canonical doc) and enforces the same-PR documentation rule.
---

# Skill: Updating Project Documentation

This skill guides the maintenance and synchronization of documentation in Invoria Web.

## Step 1: Understand the 3-Tier Documentation Structure
- **Tier 1 (Aggregator)**: `docs/README.md` — One row per folder index. Never list individual docs here.
- **Tier 2 (Folder Index)**: `docs/architecture/README.md` and `docs/guides/README.md` — List each doc with "Read when" and anchor links.
- **Tier 3 (Canonical Docs)**: Specific topic files (`overview.md`, `component-design.md`, etc.).

## Step 2: The Same-PR Rule
Whenever introducing, changing, or removing a cross-cutting pattern, boundary rule, or convention:
- Update the canonical document.
- Update the folder's `README.md` index.
- If agent rules or workflows are affected, update `GEMINI.md` and `.agents/rules/`.

## Step 3: Documentation Checklist
- [ ] Relative links resolve correctly (e.g., `../../src/...` from `docs/architecture/`).
- [ ] No duplicated documentation; single source of truth.
- [ ] Code samples in markdown contain **no single-character identifiers**.
- [ ] Format edited documentation files with `npx prettier --write <file>`.
