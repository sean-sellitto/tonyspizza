---
description: Canonical MVP backlog tracker and status update rules from Release Plan
globs: docs/BACKLOG.md,docs/stories/*.md,docs/design/*.md,docs/plans/*.md,docs/reviews/*.md,docs/tests/*.md,docs/requirements/missed-requirements.md,docs/ai-prompts/current-story.md
alwaysApply: false
---

# FieldQuote MVP Backlog Status

Source of truth: `docs/product/FieldQuote_Release_Plan.md`

Use this file to track status for all MVP stories and to drive the story artifact workflow.

## Per-story artifact outputs

When a story is active, use these canonical outputs:

- Story spec: `docs/stories/ST-###-<Story-Slug>.md`
- Design: `docs/design/ST-###-<Story-Slug>-design.md`
- Plan: `docs/plans/ST-###-<Story-Slug>-plan.md`
- Review: `docs/reviews/ST-###-<Story-Slug>-review.md`
- Tests: `docs/tests/ST-###-<Story-Slug>-tests.md`
- Missing requirements (if any): `docs/requirements/missed-requirements.md`

## Backlog table (MVP, 46 stories)

| Story ID | Title | Sprint | Priority | Status |
|---|---|---|---|---|
| ST-100 | Push Notification Infrastructure | 1 | P0 | In Progress |
| ST-001 | Welcome Screen | 1 | P0 | Planned |
| ST-002 | Trade Selection | 1 | P0 | Planned |
| ST-003 | Business Profile Setup | 1 | P0 | Planned |
| ST-004 | Progressive Auth - Account Creation After First Send | 2 | P0 | Planned |
| ST-005 | Returning User Sign In | 2 | P0 | Planned |
| ST-010 | Create New Estimate | 3 | P0 | Planned |
| ST-011 | Add and Edit Line Items | 3 | P0 | Planned |
| ST-014 | Live Running Total | 3 | P0 | Planned |
| ST-015 | Tax Rate Management | 3 | P0 | Planned |
| ST-012 | Load Trade Template | 4 | P0 | Planned |
| ST-013 | Save Custom Template | 4 | P1 | Planned |
| ST-016 | Client Notes and Internal Notes | 4 | P0 | Planned |
| ST-017 | Edit Draft Estimate | 4 | P0 | Planned |
| ST-020 | Generate Branded PDF | 5 | P0 | Planned |
| ST-021 | Send Estimate via Email | 5 | P0 | Planned |
| ST-022 | Copy Shareable Link | 5 | P0 | Planned |
| ST-023 | Client Approval Flow | 6 | P0 | Planned |
| ST-024 | Estimate Status Tracking | 6 | P0 | Planned |
| ST-025 | Estimate Viewed Push Notification | 6 | P0 | Planned |
| ST-026 | 48-Hour Follow-Up Prompt | 6 | P0 | Planned |
| ST-030 | 1-Tap Estimate to Invoice Conversion | 7 | P0 | Planned |
| ST-031 | Create Standalone Invoice | 7 | P0 | Planned |
| ST-040 | Stripe Connect Onboarding | 7 | P0 | Planned |
| ST-041 | Payment Link in Invoice | 7 | P0 | Planned |
| ST-042 | Client Payment Page (Public) | 7 | P0 | Planned |
| ST-043 | Deposit Request | 8 | P0 | Planned |
| ST-044 | Mark as Paid (Cash/Check) | 8 | P0 | Planned |
| ST-034 | Invoice Status Tracking | 8 | P0 | Planned |
| ST-036 | Send Payment Reminder | 8 | P0 | Planned |
| ST-050 | Create Client | 8 | P0 | Planned |
| ST-051 | Client List and Search | 8 | P0 | Planned |
| ST-052 | Client Detail and History | 9 | P0 | Planned |
| ST-054 | Quick Re-Estimate from Client | 9 | P0 | Planned |
| ST-060 | View and Edit Catalog Items | 9 | P1 | Planned |
| ST-061 | Add Catalog Item | 9 | P1 | Planned |
| ST-062 | System Templates by Trade | 9 | P0 | Planned |
| ST-070 | Home Dashboard | 9 | P0 | Planned |
| ST-071 | Activity Feed | 9 | P0 | Planned |
| ST-073 | Tab Bar Navigation | 9 | P0 | Planned |
| ST-080 | Business Profile Management | 10 | P0 | Planned |
| ST-082 | Default Tax Rate | 10 | P0 | Planned |
| ST-083 | Notification Preferences | 10 | P0 | Planned |
| ST-090 | Free Tier Limits and Enforcement | 10 | P0 | Planned |
| ST-091 | 21-Day Pro Trial | 10 | P0 | Planned |
| ST-092 | Upgrade Flow | 10 | P0 | Planned |
| ST-103 | Payment Received Push Notification | 10 | P0 | Planned |
| ST-110 | Touch Target Compliance | 10 | P0 | Planned |
| ST-111 | Color Contrast Compliance | 10 | P0 | Planned |

## Valid status values

| Status        | When to use |
|---------------|-------------|
| Planned       | Not started; default. |
| In Progress   | Work has started on this story (spec, design, or implementation). |
| Done          | Story is complete (implementation and verification done; PR merged or ready). |

## When to update

1. **Starting work on a story**  
   When the user or agent begins work on a specific story (e.g. ST-001, ST-042):
   - Set that story's Status to **In Progress** in this file and in `docs/BACKLOG.md` (if present).
   - Change only the Status cell for that story's row; leave Story ID, Title, Sprint, and Priority unchanged.

2. **Finishing a story**  
   When the story is complete (implementation done, tests/QA done, PR merged or ready):
   - Set that story's Status to **Done** in this file and in `docs/BACKLOG.md` (if present).

3. **No status change**  
   - Do not change status when only discussing, reading, or planning without starting implementation.
   - Do not change status for other stories when working on one story.

## How to edit status safely

- This file uses markdown tables with five columns: `| Story ID | Title | Sprint | Priority | Status |`.
- `docs/BACKLOG.md` uses markdown tables and should mirror status when it exists.
- Replace only the Status cell for the target story. Example:
  - `| ST-001 | Welcome Screen | 1 | P0 | Planned |`
  - -> `| ST-001 | Welcome Screen | 1 | P0 | In Progress |`
- Preserve the exact Story ID and Title text. Only change the last column.

## Scope

- Update only the story row the user or agent is explicitly working on.
- If the user says “we’re done with ST-001” or “mark ST-001 complete”, set that story to **Done**.
- If the user says “starting ST-007” or “implement ST-007”, set that story to **In Progress**.
