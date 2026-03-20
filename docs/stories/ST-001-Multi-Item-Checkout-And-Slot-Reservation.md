# Story: ST-001 - Multi-Item Checkout and Slot Reservation

## User Story

As a pizza customer,  
I want to build one order with multiple pizza line items across one or more time slots with temporary slot holds,  
so that I can submit once without overbooking any time slot.

## Requirements

1. The system must support a parent order model with one-to-many order items.
2. Each order item must store menu item, quantity, and selected time slot.
3. One checkout submission must support multiple order items, including items in different time slots.
4. Slot capacity must enforce a hard maximum of 2 pizzas per time slot.
5. Availability calculations must include both confirmed orders and active reservations.
6. Reservation duration must be 3 minutes.
7. Reservation hold must start when the customer selects a time slot.
8. Reservation expiration must release held capacity automatically.
9. Final checkout submit must atomically revalidate all order items and fail safely if any item violates capacity.
10. Reservation conflicts and expiration must return actionable errors so the UI can prompt the user to recover.

## Acceptance Criteria

- AC1: Data model supports one parent order with multiple child order items; each item has menu item, quantity, and time slot reference.
- AC2: A checkout payload with at least two different pizza line items is accepted and persisted under one parent order.
- AC3: A checkout payload with line items in different time slots is accepted and persisted under one parent order.
- AC4: System blocks any create/update attempt that would result in more than 2 pizzas in a time slot.
- AC5: Availability endpoints reflect confirmed orders plus active reservations.
- AC6: Selecting a time slot creates a reservation hold with a 3-minute expiration.
- AC7: Expired reservations release capacity and no longer count toward availability.
- AC8: Final submit revalidates all line items in one atomic operation; partial success is not allowed.
- AC9: If any line item fails capacity revalidation at submit, the entire submit fails and returns a conflict response.
- AC10: Reservation/validation responses include enough detail for UI messaging (for example: slot unavailable, hold expired).

## Edge Cases

- Two users select the same slot at nearly the same time; system allows only capacity-safe holds/submit outcomes.
- Reservation expires while user is on checkout review; submit must fail safely and prompt slot reselection.
- Multi-item checkout where one item is valid and one is over capacity; order must not partially commit.
- User reselects a new time slot for an item before submit; old hold is released and new hold is evaluated.
- Duplicate submit requests (double-click or retry) must not create duplicate confirmed orders.

## Dependencies

- Product decisions: `docs/product/decisions.md` (2 pizzas/slot, 3-minute reservation TTL, reservation starts on slot selection, multi-item checkout).
- Existing features/components: current Supabase-backed order/time-slot/menu flows in the Pizza app.
- External systems/services: Supabase database, constraints/transactions/RPCs (or equivalent server-side atomic handling).

## Non-Goals

- Admin grouped order UI and mark-as-paid controls (covered in later stories).
- Post-order customer edit flow and 3:00 PM cutoff behavior (covered in later stories).
- Optional online payment integration (phase 2 nice-to-have).
