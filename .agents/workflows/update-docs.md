---
name: update-docs
description: Reusable workflow for maintaining, updating, and synchronizing project documentation and indexes in Invoria Web following the 3-tier documentation model.
---

# Development Workflow: Updating Project Documentation

This workflow defines the rules and steps for updating documentation in Invoria Web, ensuring that architectural context, guides, and agent instructions remain synchronized with code changes.

---

## Step 1: Inspect Documentation Hierarchy & Indexing Model

Before editing or creating documentation, understand the **three-tier documentation index**:

```text
docs/
├── README.md            # Tier 1: Aggregator (one row per folder index, NEVER lists individual docs)
├── architecture/        # Tier 2: Folder index (lists each architecture doc with anchors)
│   ├── README.md        # Folder index with "Read when" and section anchor links
│   ├── overview.md      # Canonical architecture reference
│   ├── component-design.md
│   ├── api-services-and-models.md
│   └── design-consistency.md
└── guides/              # Tier 2: Task and feature guides
    ├── README.md        # Folder index with "Read when" and section anchor links
    ├── frontend-list-conventions.md
    ├── order-workflow.md
    └── testing-conventions.md
```

### Doc vs. Skill vs. Rule Classification
- **Always-on Project Rules**: `GEMINI.md` at root and `.agents/rules/*.md`. Contains concise, universally applicable constraints.
- **Procedural Workflows & Skills**: `.agents/workflows/*.md` and `.agents/skills/<name>/SKILL.md`. Contains actionable, step-by-step procedures.
- **Reference & Conceptual Documentation**: `docs/`. Contains in-depth architectural explanations, design rationales, and guides.

---

## Step 2: The Same-PR Maintenance Rule

- **Rule**: Whenever a change introduces, alters, or removes a cross-cutting pattern, boundary exception, or convention, **update the relevant documentation in the same PR/commit**.
- **No Unwritten Conventions**: If a pattern is not documented, it cannot be reliably maintained or enforced across the team.

---

## Step 3: Step-by-Step Update Procedure

### When Modifying an Existing Pattern:
1. Update the canonical document in `docs/architecture/` or `docs/guides/`.
2. Check if section headings changed. If so, update the anchor links in the folder's `README.md`.
3. Check if agent rules in `GEMINI.md` or `.agents/rules/` need corresponding updates.

### When Adding a New Document:
1. Create `docs/<folder>/<kebab-case-name>.md`.
2. Include a clear `# Title`, purpose statement, and structured sections with descriptive headings.
3. Update the owning folder's `README.md` index:
   - Add a row with the document link, "Read when" trigger, and key section anchor links.
4. If a whole new documentation folder is created, add a row in the top-level aggregator `docs/README.md`.

### When Adding a New Exception or Dependency Whitelist:
1. Update `docs/architecture/overview.md §7` (Dependency Rules) with the minimal surface and rationale.
2. Mirror the exception in `.agents/rules/architecture-boundaries.md`.

---

## Step 4: Documentation Review Checklist

Before finishing documentation changes:
- [ ] **Links Resolve**: All relative links resolve accurately from the file's directory depth (e.g. `../../src/...`).
- [ ] **No Barrels / Duplication**: Content lives in exactly one canonical place; other docs link to it.
- [ ] **Code Samples Conform**: All code snippets in markdown files follow repository conventions (e.g., **no single-character identifiers** in sample code).
- [ ] **Format Cleanly**: Run `npx prettier --write <touched-doc-file>` on edited markdown files.
