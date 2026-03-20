**Parameters:** Read `docs/ai-prompts/current-story.md` first. Use **story_file**, **story_name**, **design_file**, **architecture_file**, and **decisions_file** for all paths and references below.

Context:
- Product spec: `docs/stories/` + story_file
- Architecture doc: `docs/product/` + architecture_file
- Design template: `docs/project-templates/ui-design-template.md`
- Decisions log: `docs/product/` + decisions_file — do not design features that decisions mark as out of scope; respect follow-up notes.

Task:
- Create UI design for story "[story_name]" including:
  1. Screens / pages needed
  2. Components per screen (buttons, inputs, navigation, modals, etc.)
  3. Layout and flow between screens
  4. Notes on style / spacing / colors (follow design template)
  5. Accessibility considerations

- Check spec: flag missing components/screens as "Missing UI Element".
- Do NOT invent features outside the spec.

Output:
- Save to `docs/design/` using **design_file** from current-story.md (format: `ST-###-<Story-Slug>-design.md`).
- Use markdown table:

  Screen | Component | Description | Notes | Missing (Yes/No)

- If all UI elements are accounted for: "UI design is complete for [story_name]"
- If requirements are missing, save them to `docs/requirements/missed-requirements.md`:

  User Story # - Description of missing requirement - Document missing from (Spec/Architecture/Decisions)
