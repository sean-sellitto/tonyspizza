# Backlog Status

## Legend

- `Not Started`
- `In Progress`
- `Blocked`
- `In Review`
- `Done`

## Dev-Ready Story Queue

| Seq | Story ID | Story Name | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|
| 1 | ST-001 | Data Model: Parent Order + Order Items | P0 | Done | None | Introduce grouped order model and line-item relationships |
| 2 | ST-002 | Capacity Engine: 2 Pizzas Per Slot | P0 | In Progress | ST-001 | Enforce slot capacity rule consistently in reads/writes |
| 3 | ST-003 | Reservation Lifecycle: 3-Min TTL | P0 | Not Started | ST-002 | Create reservations with expiration and cleanup behavior |
| 4 | ST-004 | Reservation Trigger on Time Slot Selection | P0 | Not Started | ST-003 | Start hold when user selects slot (checkout + edit flows) |
| 5 | ST-006 | Cart API: Multi-Item + Multi-Slot Payloads | P0 | Not Started | ST-004 | Backend contracts for add/edit/remove line items |
| 6 | ST-007 | Customer UI: Build Order (Add/Edit/Remove Items) | P0 | In Progress | ST-006 | Multi-item order builder before checkout |
| 7 | ST-008 | Customer UI: Reservation Timer + Expiry Messaging | P0 | In Progress | ST-007 | Visible countdown and recovery UX on expiration |
| 8 | ST-009 | Customer UI: Review + Confirmation Experience | P0 | In Progress | ST-008 | Single submit with summary and confirmation details |
| 9 | ST-005 | Atomic Checkout Submit + Revalidation | P0 | Not Started | ST-009 | Final submit validates all items and commits once |
| 10 | ST-010 | Payment Method MVP: Cash at Pickup + Status | P0 | Not Started | ST-005 | Collect payment method and persist unpaid/cash_due state |
| 11 | ST-011 | Admin UI: Grouped Order List + Expandable Items | P0 | Not Started | ST-010 | Parent/child grouped view with slot detail |
| 12 | ST-012 | Admin UI: Mark as Paid + Payment Status Audit | P0 | Not Started | ST-011 | Admin action to update payment status with audit trail |
| 13 | ST-013 | Post-Order Edit API + Concurrency Controls | P1 | Not Started | ST-012 | Safe post-submit order edits with revalidation |
| 14 | ST-014 | Post-Order Edit Cutoff at 3:00 PM Order Day | P1 | Not Started | ST-013 | Block edits after cutoff with clear messaging |
| 15 | ST-015 | Customer UI: Post-Order Self-Service Edit Flow | P1 | Not Started | ST-014 | Edit submitted orders and time slots within policy |
| 16 | ST-016 | Admin/Search UX: Filters for Paid/Unpaid, Date, Slot | P1 | Not Started | ST-015 | Operational filtering and faster fulfillment workflow |
| 17 | ST-017 | UX Modernization Pass (Visual Hierarchy + Mobile) | P1 | Not Started | ST-016 | Improve clarity, spacing, and responsive behavior |
| 18 | ST-018 | Reliability + Accessibility + Regression Test Hardening | P1 | Not Started | ST-017 | AC coverage, accessibility, and concurrency regression suite |
| 19 | ST-019 | Optional Online Payment Integration (Venmo-Capable Path) | P2 | Not Started | ST-018 | Nice-to-have online payment route if provider is feasible |
