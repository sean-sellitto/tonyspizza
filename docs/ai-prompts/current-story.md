# Current story — edit this file when switching stories

Use these values in all ai-prompts. The AI should read this file first and substitute these variables into paths and task text.

| Variable | Value |
|----------|--------|
| **story_id** | ST-002 |
| **story_slug** | Capacity-Engine-2-Pizzas-Per-Slot |
| **story_name** | Capacity Engine: 2 Pizzas Per Slot |
| **story_file** | ST-002-Capacity-Engine-2-Pizzas-Per-Slot.md |
| **design_file** | ST-002-Capacity-Engine-2-Pizzas-Per-Slot-design.md |
| **plan_file** | ST-002-Capacity-Engine-2-Pizzas-Per-Slot-plan.md |
| **spec_review_file** | ST-002-Capacity-Engine-2-Pizzas-Per-Slot-spec-review.md |
| **code_review_file** | ST-002-Capacity-Engine-2-Pizzas-Per-Slot-code-review.md |
| **tests_file** | ST-002-Capacity-Engine-2-Pizzas-Per-Slot-tests.md |

## Optional (usually unchanged)

| Variable | Value |
|----------|--------|
| **architecture_file** | pizza-architecture.md |
| **decisions_file**    | decisions.md |
| **backlog_status_file** | backlog-status.md |
| **product_plan_file** | master-execution-plan.md |
| **release_plan**      | release-plan.md |

## Output paths derived from story_id + story_slug

- Story spec: `/docs/stories/` + **story_file**
- Design: `/docs/design/` + **design_file**
- Plan: `/docs/plans/` + **plan_file**
- Spec Review: `/docs/reviews/` + **spec_review_file**
- Code Review: `/docs/reviews/` + **code_review_file**
- Tests: `/docs/tests/` + **tests_file**
- Missed requirements (if any): `/docs/requirements/missed-requirements.md`
