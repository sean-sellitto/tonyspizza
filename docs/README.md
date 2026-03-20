# Spec-Driven Workflow (Pizza Project)

## Source of Truth Order

1. `docs/product/product-backlog-and-requirements.md`
2. `docs/product/decisions.md`
3. Story-specific files generated from `docs/ai-prompts/current-story.md`

## Working Sequence Per Story

1. Product spec -> `docs/stories/`
2. UI design -> `docs/design/`
3. Spec review -> `docs/reviews/`
4. Implementation plan -> `docs/plans/`
5. Engineering implementation in code
6. Code review -> `docs/reviews/`
7. Testing plan/cases -> `docs/tests/`

## Missing Requirement Rule

If any required information is missing, log it in:

- `docs/requirements/missed-requirements.md`

Format:

`User Story # - Description of missing requirement - Document missing from (...)`

## Story Switching

Before starting any prompt-driven task, update:

- `docs/ai-prompts/current-story.md`

This file controls all output paths and naming for the active story.
