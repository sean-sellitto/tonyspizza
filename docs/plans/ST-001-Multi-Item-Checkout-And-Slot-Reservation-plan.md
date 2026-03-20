# ST-001 Implementation Plan - Multi-Item Checkout and Slot Reservation

## Story Scope Statement

This plan implements ST-001 only:

- Multi-item checkout under a single parent order
- Per-item pizza type, quantity, and time slot
- Slot capacity enforcement (2 pizzas max per slot)
- 3-minute reservation holds starting when time slot is selected
- Atomic final submit with revalidation and conflict-safe failure behavior
- UI for order building, reservation timer, review/submit, conflict messaging, and confirmation

Out of scope for ST-001 (handled in later stories):

- Admin grouped order enhancements and mark-as-paid controls
- Post-order customer edit flow and 3:00 PM cutoff behavior
- Optional online payment integration

## High-Level Workstreams

## 1) Data Model and Persistence Changes

- Introduce parent order entity and child order item entity (one-to-many).
- Ensure each order item stores menu item id, quantity, and time slot id.
- Add reservation persistence model for active holds with expiration timestamp.
- Add indexes/constraints to support slot lookups, reservation expiry checks, and submit-time revalidation.

Deliverables:

- Database schema updates for parent order, order items, and reservations.
- Migration artifacts and rollback strategy.

## 2) Capacity and Reservation Backend Logic

- Implement capacity computation as:
  - confirmed pizzas per slot
  - plus active (non-expired) reserved pizzas per slot
- Enforce hard cap of 2 pizzas per slot for both reservation creation and final submit.
- Implement reservation expiration handling and capacity release.
- Ensure reservation creation starts when time slot is selected.

Deliverables:

- Capacity/availability service logic.
- Reservation create/update/release/expire logic.

## 3) API/RPC Contract Updates

- Define endpoints/RPCs for:
  - building/updating cart line items
  - creating and refreshing reservations
  - releasing reservations on item removal/reselection
  - final checkout submit with atomic revalidation
- Standardize conflict and expiration error payloads for UI recovery.
- Add idempotency/duplicate-submit protection at final submit.

Deliverables:

- Updated API/RPC contracts and response/error models.

## 4) Customer UI Flow Implementation

- Order Builder:
  - add/edit/remove line items
  - pizza selector, quantity selector, time slot selector per line item
  - hold creation triggered by time-slot selection
- Reservation Timer + Messaging:
  - global countdown banner for active holds
  - near-expiry warning and expiry recovery path
- Review and Submit:
  - single order summary across all line items
  - submit action calling atomic backend endpoint
  - actionable conflict/expiry feedback when submit fails
- Confirmation:
  - success state for one submitted grouped order

Deliverables:

- UI changes mapped to design screens: Order Builder, Review and Submit, Confirmation.

## 5) Atomic Submit and Conflict Handling

- Submit all line items in one transaction boundary.
- Revalidate each line item against current capacity and active reservations.
- If any line item fails, fail whole submit and return conflict details.
- Prevent partial writes and duplicate order creation on retries/double-click.

Deliverables:

- Atomic submit implementation with explicit failure modes.

## 6) Verification and Rollout Checks

- Validate all ST-001 acceptance criteria end-to-end.
- Add test coverage for concurrency, hold expiration, and mixed valid/invalid line-item submits.
- Confirm accessibility baseline for keyboard flow, focus handling, and live-region announcements for timer/conflicts.
- Perform safe migration rollout checks and data consistency verification.

Deliverables:

- AC traceability checklist and test evidence.

## Dependency Map Between Workstreams

1. Data model/persistence (Workstream 1) is prerequisite for all backend and UI integration.
2. Capacity/reservation logic (Workstream 2) depends on Workstream 1.
3. API/RPC contracts (Workstream 3) depend on Workstreams 1 and 2.
4. Customer UI implementation (Workstream 4) depends on Workstream 3.
5. Atomic submit/conflict handling (Workstream 5) depends on Workstreams 2 and 3, then integrates with 4.
6. Verification/rollout (Workstream 6) depends on completion of 1-5.

## Estimated Sequence of Steps (Ordered)

1. Finalize DB schema and migration scripts for parent order, order items, reservations.
2. Implement slot capacity computation using confirmed + active reservation counts.
3. Implement reservation lifecycle (create on slot select, refresh/update, release, expire at 3 minutes).
4. Implement API/RPC endpoints for line-item operations and reservation operations.
5. Implement atomic checkout submit endpoint with all-item revalidation and all-or-nothing commit.
6. Integrate frontend Order Builder with per-item selectors and reservation-trigger behavior.
7. Add reservation timer banner, near-expiry warning, and expiry/conflict recovery UX.
8. Implement Review and Submit + Confirmation screens tied to submit endpoint.
9. Add duplicate-submit prevention and idempotency handling in submit path.
10. Execute AC test matrix, concurrency scenarios, and accessibility checks; fix gaps.

## Risks and Mitigations

- Race conditions at slot contention
  - Mitigation: server-side transactional revalidation, lock-sensitive checks, and no client-trust capacity writes.
- Reservation expiration during review
  - Mitigation: explicit expiry detection at submit and actionable per-item conflict responses.
- Duplicate submit causing duplicate orders
  - Mitigation: submit idempotency key and backend dedupe protection.
- Stale UI availability state
  - Mitigation: refresh availability/reservation status on key actions and at submit.
- Accessibility regressions in dynamic flows
  - Mitigation: enforce focus management and live-region announcements for timer/error changes.

## Exit Criteria Mapped to ST-001 Acceptance Criteria

- AC1 -> Parent/child order and order item schema shipped and validated.
- AC2 -> Multi-item (different pizza types) payload accepted and persisted under one parent order.
- AC3 -> Multi-slot payload accepted and persisted under one parent order.
- AC4 -> Capacity violations above 2 pizzas blocked at reservation and submit.
- AC5 -> Availability responses include confirmed + active reservations.
- AC6 -> Slot selection starts 3-minute reservation hold.
- AC7 -> Expired reservations release capacity and are excluded from active counts.
- AC8 -> Final submit revalidates all items atomically.
- AC9 -> Any failed line-item validation causes whole submit failure with no partial commit.
- AC10 -> Error payloads support actionable UI messaging for slot unavailable/hold expired.

