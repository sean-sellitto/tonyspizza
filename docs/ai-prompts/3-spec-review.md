**Parameters:** Read `docs/ai-prompts/current-story.md` first. Use **story_file**, **design_file**, **spec_review_file**, **story_name**, and **decisions_file** for all paths and references below.

Context:
- Story spec: `docs/stories/` + story_file
- Design: `docs/design/` + design_file
- Decisions log: `docs/product/` + decisions_file — flag if spec or design conflicts with any recorded decision (scope, out-of-scope, story references).

Task:
- Review the spec and design.
- Identify missing requirements, edge cases, or inconsistencies.
- Do NOT invent requirements or behaviors.
- Output missing items in format:

  User Story # - Description of missing requirement - Document missing from (Spec/Design)

- Save review output to: `docs/reviews/` + **spec_review_file**
- Save missing requirements to: `docs/requirements/missed-requirements.md`
- If everything is complete: "No missing requirements found for [story_name]"
