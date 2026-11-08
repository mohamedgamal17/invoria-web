# Invoria Web — documentation index

Single navigation entry point for all docs. The index is hierarchical:

1. **This README** — the aggregator; one row per folder index (never lists individual docs).
2. **Per-folder `README.md`** — indexes that folder's docs with "read when" and per-section anchors.
3. **The docs themselves** — canonical content; every rule lives in exactly one of them.

Always-on agent rules (stack, commands, hard constraints, skills index) live in
[`.opencode/AGENTS.md`](../.opencode/AGENTS.md), which points here for navigation; enforced,
task-triggered workflows are skills under [`.opencode/skills/`](../.opencode/skills/).

| Folder index | What's inside |
|--------------|---------------|
| [architecture/README.md](architecture/README.md) | Reference: overview (structure/dependency rules/state patterns), component design (NgRx + signals pages), API services & models, design consistency (PrimeNG/Tailwind + PR checklist) |
| [guides/README.md](guides/README.md) | Task guides: frontend list conventions (tables/paging/URL state), order workflow (statuses/stepper/gating), testing conventions (Vitest patterns) |

## Maintenance

When a change introduces or alters a cross-cutting pattern, update the relevant doc
**and its owning folder index** in the same PR; when adding/removing a whole docs
folder, update this aggregator too. Details and the doc-map rules are in the
`maintaining-docs` skill.
