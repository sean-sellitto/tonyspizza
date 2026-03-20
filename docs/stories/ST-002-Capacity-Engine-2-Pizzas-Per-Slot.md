# Story: ST-002 - Capacity Engine: 2 Pizzas Per Slot

## User Story

As a pizza customer,  
I want slot availability to enforce a strict 2-pizza limit across all active orders and reservations,  
so that I cannot overbook a pickup slot and the owner can trust slot capacity.

## Requirements

1. The system must enforce a hard capacity of 2 pizzas per time slot.
2. Capacity checks must include both confirmed orders and active reservations.
3. Reservation and checkout submit paths must both reject requests that exceed slot capacity.
4. Capacity evaluation must be server-side and concurrency-safe.
5. Availability responses must reflect current effective remaining capacity for each slot.
6. Updating/replacing a reservation must re-evaluate capacity correctly and avoid double counting the same reservation.
7. Duplicate slot-instance records for a date/slot combination must be prevented.
8. Existing duplicate slot instances must be safely resolved so UI shows one slot option per time and date.
9. Error responses for capacity failure must be clear enough for UI recovery messaging.

## Acceptance Criteria

- AC1: Any create/update operation that would exceed 2 pizzas in a slot is rejected.
- AC2: Reservation creation fails when effective capacity is insufficient.
- AC3: Grouped submit fails atomically when any item exceeds capacity.
- AC4: Effective capacity calculation includes confirmed orders plus active, unexpired reservations.
- AC5: Replacing a reservation does not incorrectly reduce capacity twice for the same hold.
- AC6: Slot availability data returned to UI aligns with server capacity checks.
- AC7: Duplicate slot instances for the same `(order_date_id, time_slot_id)` are blocked by a uniqueness constraint.
- AC8: Existing duplicate slot instances can be cleaned without breaking FK references from orders.
- AC9: Capacity-related RPC errors return deterministic, actionable messages.

## Edge Cases

- Two users reserve the last spot at nearly the same time; only one succeeds.
- One line item in grouped submit is valid and another is over capacity; whole submit fails.
- Reservation expires while user is on review step; capacity reflects release immediately after expiry.
- Replacing an existing reservation for the same session/slot does not self-block.
- Historical duplicate slot-instance rows exist before uniqueness is enforced.

## Dependencies

- Product decisions: `docs/product/decisions.md` (2 pizzas per slot, reservation-based capacity behavior).
- Existing features/components: ST-001 reservation and grouped order RPCs, `time_slots_with_availability` usage in app.
- External systems/services: Supabase tables/views/RPC functions and transaction semantics.

## Non-Goals

- UI redesign or checkout flow changes beyond capacity messaging.
- Admin grouped-order enhancements and mark-as-paid controls.
- Post-order edit behavior/cutoff logic.
