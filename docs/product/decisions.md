# Pizza Product Decisions Log

Use this file to record product and implementation decisions that affect scope, sequencing, and delivery.

## Decision Entry Template

| Date | Story ID | Decision | Type | Scope Impact | Follow-up |
|---|---|---|---|---|---|
| YYYY-MM-DD | ST-### or Epic | Concise decision statement | In Scope / Out of Scope / Constraint | What this changes in current work | Required next action or "None" |

## Decisions

| Date | Story ID | Decision | Type | Scope Impact | Follow-up |
|---|---|---|---|---|---|
| 2026-03-19 | N/A | Decisions log initialized | Constraint | Establishes canonical decisions location for prompts and reviews | None |
| 2026-03-20 | Epic: Multi-Item Checkout | One checkout can include multiple pizza line items across different time slots | In Scope | Requires grouped order model and line-item schema | Reflect in stories and plans |
| 2026-03-20 | Epic: Capacity Control | Time slot capacity is limited to 2 pizzas total | Constraint | Availability and validation logic must enforce pizza count, not order count | Add explicit AC in capacity stories |
| 2026-03-20 | Epic: Reservation | Slot reservations expire after 3 minutes | Constraint | Requires reservation TTL, expiry handling, and customer messaging | Add timer UI and expiry tests |
| 2026-03-20 | Epic: Reservation | Reservation starts when a customer selects a time slot | Constraint | Hold logic must be triggered on slot selection event | Update checkout and edit-flow AC |
| 2026-03-20 | Epic: Payments | Online payment is optional for MVP; cash flow is required | Out of Scope (MVP) / In Scope (Phase 2) | MVP ships with cash + payment status tracking first | Gate online payment under Phase 2 stories |
| 2026-03-20 | Epic: Admin Ops | Admin must be able to mark orders as paid and view grouped orders | In Scope | Requires admin actions, audit fields, and grouped order UI | Add admin stories and acceptance criteria |
| 2026-03-20 | Epic: Post-Order Changes | Customers can modify submitted orders/time slots if capacity allows | In Scope | Requires order edit workflow, revalidation, and concurrency-safe update logic | Add story for self-service order edits |
| 2026-03-20 | Epic: Post-Order Changes | Customer order modification closes at 3:00 PM on the day of order | Constraint | Edit flow must block updates after cutoff and show clear message | Add cutoff logic and tests |
