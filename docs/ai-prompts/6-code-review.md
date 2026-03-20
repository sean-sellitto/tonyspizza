**Parameters:** Read `docs/ai-prompts/current-story.md` first. Use **story_file**, **design_file**, **code_review_file**, **story_name**, and **decisions_file** for all paths and references below.

Context:
- Implementation code / instructions from Step 5
- Original spec: `docs/stories/` + story_file
- UI design: `docs/design/` + design_file
- Decisions log: `docs/product/` + decisions_file — flag if implementation contradicts any recorded decision (e.g. adds in-scope behavior that a decision says is out of scope).

Task:
- Check that implementation matches spec and design.
- Identify missing functionality, deviations, or edge cases not handled.
- Output issues in format:

  Issue # - Description - File/Section

- Save code-review output to: `docs/reviews/` + **code_review_file**
- If requirements are missing, save them to `docs/requirements/missed-requirements.md`:

  User Story # - Description of missing requirement - Document missing from (Spec/Design/Code)
- If code matches spec: "Implementation verified for [story_name]"
