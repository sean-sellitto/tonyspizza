**Parameters:** Read `docs/ai-prompts/current-story.md` first. Use **story_id**, **story_slug**, **story_name**, **story_file**, and the optional doc names for all paths and references below.

Context:
- Architecture: `docs/product/` + architecture_file
- Backlog: `docs/product/` + backlog_status_file
- Product Plan: `docs/product/` + product_plan_file
- Decisions log: `docs/product/` + decisions_file — account for recorded decisions (scope, out-of-scope, follow-ups) when defining the spec.

Template:
- `docs/project-templates/story-template.md`

Task:
- Create a complete story spec for backlog item "[story_name]" (from current-story.md) following the story template.
- Fill all fields: Story, User Story, Requirements, Acceptance Criteria, Edge Cases, Dependencies, Non-Goals.
- Do NOT invent behavior or assume requirements.
- If information is missing, output missing requirements in this format and save to `docs/requirements/missed-requirements.md`:

  User Story # - Description of missing requirement - Document missing from (Backlog/Architecture/Product Plan/Decisions)

Output:
- Save story spec to `docs/stories/` using **story_file** from current-story.md.
- If all fields are complete, output: "All requirements accounted for for [story_name]"
