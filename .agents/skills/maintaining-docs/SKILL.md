---
name: maintaining-docs
description: Use when introducing a new cross-cutting/feature pattern, changing existing conventions, or touching any docs/.opencode files — defines where documentation lives in this repo (docs/ vs .opencode/AGENTS.md vs skills), the same-PR update rule, whether content is a doc or a skill, naming and linking conventions, and the docs-index maintenance contract.
compatibility: Invoria Web (Angular 21)
---

# Maintaining docs and skills

Two kinds of knowledge live in this repo. Classify **before writing** anything new:

## 1. The doc/skill split

| Content | Where |
| --- | --- |
| **Always-on** summary every agent must know (stack, commands, hard constraints, checklist of most-violated rules) | `.opencode/AGENTS.md` — keep it short (~70 lines max); detail goes down to docs/skills |
| **Enforced, procedural workflow** triggered by a specific task (`consider`/`use when` style) | `.opencode/skills/<skill-name>/SKILL.md` with `name`/`description`/`compatibility` frontmatter — e.g. pagination state, list mutations, charts, report scaffolds |
| **High-level reference**: architecture facts, dependency rules, design system, feature guides | `docs/` — see below |

## 2. `docs/` layout and the indexing contract

Documentation navigation is a **three-tier index** — never index individual docs at
the top level:

```
docs/
├── README.md            # tier 1: aggregator — one row per folder index, NEVER per-doc entries
├── architecture/        # stable reference docs + its own README.md (tier 2: folder index)
│   └── README.md        # lists each doc here with "read when" + per-section anchors
└── guides/              # task/feature guides + its own README.md (tier 2: folder index)
    └── README.md        # lists each doc here with "read when" + per-section anchors
```

- Every docs folder owns a `README.md` index (doc → one-line topic → section anchor
  links); `docs/README.md` only links the folder indexes, so adding a doc means
  updating **one** folder index, and adding a folder means updating the aggregator.
- `.opencode/AGENTS.md` must not list individual docs — it links `docs/README.md`
  as the single navigation entry point (the skills index stays in AGENTS.md).
- Filenames: `kebab-case.md`; one topic per file; no barrel/aggregating docs (a folder
  `README.md` that only indexes siblings is an index, not an aggregator of content).
- Links between docs are **relative**; links to code are relative (`../../src/...` from
  `docs/architecture/`) and point at the actual file, not a copy.
- Reference docs must not restate AGENTS.md bullet-for-bullet — docs hold the deep detail,
  AGENTS.md holds the summary and links up.

## 3. The same-PR rule

- A PR introducing or changing a **cross-cutting pattern** must update the relevant doc
  and/or skill **in the same PR**. Unwritten conventions are drift.
- If new content doesn't fit an existing file: create a doc (add it to the owning
  folder's `README.md` index; register it in `docs/README.md` only if you created a
  new folder) and/or a skill (register it in the skills index in `.opencode/AGENTS.md`).
- If a rule is removed/replaced: update or delete its doc/skill **and** fix every inbound
  link (search the repo for the old path).
- The folder `README.md` indexes and `docs/README.md` are the index of record for docs;
  AGENTS.md just points at `docs/README.md` — keep them in sync when paths change.

## 4. Checklist for every docs/skills change

1. Correct folder per the split above (doc ≠ skill ≠ AGENTS.md)?
2. Owning folder's `README.md` index updated? (+ `docs/README.md` if a new folder;
   + AGENTS.md skills index if a new skill?)
3. All links resolve from the file's own location (mind the depth)?
4. Frontmatter `description` on skills written as a **trigger** ("Use when…"), not a title?
5. No duplication: content appears in exactly one canonical place; other files link to it?
6. No single-character identifiers in code samples (see `ts-naming-conventions`).
7. PR description notes any exception granted (docs or otherwise) with rationale.
