**Parameters:** Read `docs/ai-prompts/current-story.md` first. Use **story_file**, **design_file**, **plan_file**, **story_name**, **architecture_file**, and **decisions_file** for all paths and references below.

Context:
- Architecture doc: `docs/product/` + architecture_file
- Story spec: `docs/stories/` + story_file
- Design: `docs/design/` + design_file
- Decisions log: `docs/product/` + decisions_file — plans must not include work that decisions mark as out of scope; note follow-ups where relevant.

Task:
- Create an implementation plan for "[story_name]" including:
  - High-level tasks
  - Dependencies
  - Estimated sequence of steps

Output:
- Save the implementation plan to `docs/plans/` using **plan_file** from `current-story.md`.
- Filename format: `ST-###-<Story-Slug>-plan.md`

If information is missing:
- Do NOT invent behavior.
- Do NOT assume requirements.

Instead output:
- `Missing Requirement` and save to `docs/requirements/missed-requirements.md` in the format:

  User Story # - what the missed requirement was
