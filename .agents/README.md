# Agent Configuration

This directory is the **single source of truth** for agent guidance in Invoria Web. Root
`AGENTS.md`, `GEMINI.md`, and `.opencode/AGENTS.md` are thin pointers to this directory.

## Entry points

| Path                                 | Purpose                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| [`GEMINI.md`](GEMINI.md)             | Canonical always-on rules: stack, commands, hard constraints, skills index.                                      |
| [`rules/`](rules/)                   | Topic-specific rules: architecture boundaries, coding standards, component design, state, UI, testing, security. |
| [`workflows/`](workflows/)           | Step-by-step runbooks: implement feature, refactor, debug, test, review, docs, eliminate redundancy.             |
| [`skills/`](skills/)                 | Procedural skills loaded on demand when a task matches.                                                          |
| [`skills.json`](skills.json)         | Skill discovery configuration for agent tooling.                                                                 |
| [`mcp_config.json`](mcp_config.json) | MCP server configuration.                                                                                        |

## Adding or editing guidance

- **Always-on rule** that every agent must know -> `GEMINI.md` (keep it short; link out for detail).
- **Topic rule** -> `rules/<topic>.md` and link it from `GEMINI.md`.
- **Repeatable procedure** -> a `skills/<name>/SKILL.md` with `name` / `description` frontmatter, then register it in the skills index below.
- **Multi-step project workflow** -> `workflows/<name>.md`.
- Cross-cutting documentation changes still follow the
  [`maintaining-docs`](skills/maintaining-docs/SKILL.md) skill and the [`docs/`](../docs/README.md) index.

## Skills index

| Skill                                                            | Use when                                                          |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`charts`](skills/charts/SKILL.md)                               | Adding or modifying any ECharts chart.                            |
| [`debug-issue`](skills/debug-issue/SKILL.md)                     | Diagnosing bugs, runtime exceptions, or failing tests.            |
| [`eliminate-redundancy`](skills/eliminate-redundancy/SKILL.md)   | Consolidating duplicated code, UI primitives, or constants.       |
| [`implement-feature`](skills/implement-feature/SKILL.md)         | Implementing a new feature or page.                               |
| [`maintaining-docs`](skills/maintaining-docs/SKILL.md)           | Introducing cross-cutting patterns or touching docs/agent config. |
| [`ngrx-details-store`](skills/ngrx-details-store/SKILL.md)       | Building a details/single-entity page.                            |
| [`ngrx-list-mutations`](skills/ngrx-list-mutations/SKILL.md)     | Syncing create/update mutations into a paged-list slice.          |
| [`ngrx-page-state`](skills/ngrx-page-state/SKILL.md)             | Adding or debugging pagination/page state in NgRx slices.         |
| [`orders-testing`](skills/orders-testing/SKILL.md)               | Writing or changing specs under `features/orders/`.               |
| [`pre-commit-review`](skills/pre-commit-review/SKILL.md)         | Pre-commit/pre-PR checklist.                                      |
| [`products-list-layout`](skills/products-list-layout/SKILL.md)   | Working on the products catalog list page.                        |
| [`refactor-code`](skills/refactor-code/SKILL.md)                 | Refactoring existing code.                                        |
| [`report-page-scaffold`](skills/report-page-scaffold/SKILL.md)   | Creating or modifying report pages.                               |
| [`ts-naming-conventions`](skills/ts-naming-conventions/SKILL.md) | Writing or editing any TypeScript file.                           |
| [`update-docs`](skills/update-docs/SKILL.md)                     | Maintaining the documentation index.                              |
| [`write-tests`](skills/write-tests/SKILL.md)                     | Authoring or improving unit tests.                                |
