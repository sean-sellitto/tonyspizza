**Parameters:** Read `docs/ai-prompts/current-story.md` first. Use **story_file**, **design_file**, **tests_file**, **story_name**, and **decisions_file** for all paths and references below.

Context:
- Implementation code / instructions
- Story spec: `docs/stories/` + story_file
- UI design: `docs/design/` + design_file
- Decisions log: `docs/product/` + decisions_file — test plan and cases should not assume or cover behavior that decisions mark as out of scope.

Task:
- Generate test plan and test cases for "[story_name]" including:
  - Positive tests
  - Negative tests
  - Edge cases
  - UI/UX flows
- Ensure acceptance criteria are fully covered.

Follow:
- `docs/project-templates/testing-template.md`

Output:
- Save to `docs/tests/` using **tests_file** from current-story.md.
- Filename format: `ST-###-<Story-Slug>-tests.md`
- If requirements are missing, save them to `docs/requirements/missed-requirements.md`:

  User Story # - Description of missing requirement - Document missing from (Spec/Design/Implementation)
- If tests cover all criteria: "All acceptance criteria covered for [story_name]"
