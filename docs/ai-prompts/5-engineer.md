**Parameters:** Read `docs/ai-prompts/current-story.md` first. Use **story_file**, **design_file**, **plan_file**, **story_name**, and **decisions_file** for all paths and references below.

Context:
- Story spec: `docs/stories/` + story_file
- Implementation plan: `docs/plans/` + plan_file (if present)
- Design: `docs/design/` + design_file
- Decisions log: `docs/product/` + decisions_file — do not implement behavior that decisions mark as out of scope for the current story.

Task:
- Generate code or detailed instructions to implement "[story_name]".
- Follow the plan exactly.
- Do not add extra features.
- Reference UI components and layouts from design doc.

Output:
- Implement directly in repository source files only.
- Do not write implementation output into docs files.
- After implementation, provide a concise change summary grouped by file path and include a traceability mapping:
  - Requirement/AC reference -> implemented file(s)/function(s)
- If implementation cannot proceed due to missing required information, output "Missing Requirement" and append details to `docs/requirements/missed-requirements.md`.
- If requirements are missing, save them to `docs/requirements/missed-requirements.md`:

  User Story # - Description of missing requirement - Document missing from (Spec/Design/Plan/Decisions)
