# Pizza App Product Backlog and Requirements

## Purpose

This document captures the product review findings, agreed business rules, backlog items, and implementation requirements for the next development phase.

## Confirmed Decisions

- One checkout can contain multiple pizzas.
- A single checkout can contain multiple time slots.
- Time slot limit is `2 pizzas` maximum per slot.
- Time slots should be reserved for `3 minutes` during checkout.
- Reservation starts when the customer selects a time slot.
- Payment integration is a `nice-to-have`, not a hard requirement for MVP.
- Admin needs grouped orders and `mark as paid` controls.
- Customers should be able to modify their order and/or time slot after submission, while slot constraints still apply.
- Post-order modification closes at `3:00 PM` on the day of order.

## Recommendation: Reservation Timer

Yes, include a visible countdown timer (Ticketmaster-style) during checkout.

### Why this helps

- Prevents confusion about when reserved items expire.
- Reduces failed checkouts caused by silent reservation expiry.
- Sets clear urgency and improves conversion.

### Requirement

- Show reservation timer globally at checkout (for example: `02:41 remaining`).
- Warn user when less than 60 seconds remain.
- Expired reservations must clearly tell the user which line items were released.

## Current Gaps (Findings)

1. Current order model supports only one pizza type per submission (`menu_item_id` + `quantity` + one `timeslot_id`).
2. No cart or multi-line checkout exists.
3. No reservation/locking mechanism exists to prevent race-condition overbooking.
4. No grouped order structure in admin (flat rows only).
5. No payment status lifecycle in admin for tracking paid vs unpaid.
6. UX is functional but dated (long text-heavy page, weak visual hierarchy).
7. Loading and error states are minimal for key customer flows.
8. Accessibility and form behavior need improvement.

## Product Requirements

### Checkout and Ordering

- Customer can add multiple pizza line items before submitting once.
- Each line item includes:
  - pizza type
  - quantity
  - selected time slot
- Customer details are entered once at checkout.
- User can edit and remove line items before final submit.
- Checkout displays clear order summary before final confirmation.

### Post-Order Modification

- Customers can request changes to an existing order after submission.
- Customers can modify:
  - pizza quantities
  - pizza selection
  - selected time slot(s)
- All modifications must re-check and enforce the same slot capacity constraint (2 pizzas max per slot).
- If requested slot capacity is unavailable, user must be prompted to select another slot.
- Modification flow must prevent overbooking during update operations (same concurrency protections as checkout).
- System should keep a change history for order modifications (what changed and when).
- Post-order modifications are only allowed until 3:00 PM on the day of order.
- After 3:00 PM, modification requests must be blocked with a clear cutoff message.

### Capacity and Reservation Rules

- Hard limit: maximum `2 pizzas` per time slot.
- Availability calculation must include:
  - confirmed orders
  - active reservations
- Reservation window is exactly `3 minutes`.
- Reservation starts when customer selects a time slot.
- Reservation expires automatically if checkout is not completed.
- Final submit must revalidate all line items atomically server-side.

### Reservation UX

- Display persistent countdown timer while reserved capacity is held.
- Show clear warning near expiration.
- If reservation expires, tell the user what changed and how to recover.
- Prevent silent failures.

### Admin Grouped Orders

- Admin view must show parent order with nested line items.
- Admin list should include:
  - customer
  - created date/time
  - line item count
  - order total
  - payment method
  - payment status
- Admin should be able to expand grouped orders to see each pizza line item and slot.

### Mark as Paid Controls (Admin)

- Admin must have action to mark unpaid/cash orders as paid.
- Payment status transitions should be tracked with timestamp and actor (if auth is available).
- Support at minimum statuses:
  - unpaid
  - paid
  - cash_due
  - payment_failed (if online payment is added)

### Payment (Nice-to-Have)

- MVP can ship with `Cash at pickup` plus payment-status tracking.
- Optional enhancement: online payment integration (Venmo via payment provider if eligible).
- If online payment is added:
  - order should not be marked paid until payment confirmation succeeds
  - failed payments should not leave inconsistent order state

### UX Modernization

- Replace single long form with step-based or sectioned checkout:
  1. Build order
  2. Review cart
  3. Checkout details + payment method
  4. Confirmation
- Improve hierarchy, spacing, typography, and mobile layout.
- Reduce dense instructional copy and move secondary details to helper text.
- Add clear loading, empty, and error states.
- Improve accessibility for form labels, errors, announcements, and keyboard use.

## Prioritized Backlog

## P0 - Must Have

1. New data model for grouped orders and order line items.
2. Cart and true checkout flow with one final submit.
3. 3-minute slot reservation system with expiry handling.
4. Capacity enforcement for 2 pizzas per slot (including reservations).
5. Atomic checkout validation/submission.
6. Grouped admin order view.
7. Admin mark-as-paid controls and payment status fields.
8. Reservation timer and expiration messaging in customer UI.

## P1 - High Priority

1. Modernized customer checkout UI and cleaner UX flow.
2. Better time slot presentation and availability clarity.
3. Strong loading/error/empty states in customer path.
4. Improved validation and user guidance.
5. Admin filters/search for paid/unpaid, date, and customer.
6. Post-order customer self-service modification flow (order and time slot edits with capacity revalidation).

## P2 - Important Enhancements

1. Optional online payment integration (Venmo-capable provider path).
2. Enhanced audit history for payment and status transitions.
3. Reporting views (slot fulfillment, unpaid cash balances).
4. Additional polish and content improvements.

## Proposed Epics

1. Multi-Item Checkout and Cart
2. Time Slot Reservation and Capacity Engine
3. Admin Grouped Orders and Payment Operations
4. UX/UI Modernization and Accessibility
5. Optional Online Payments

## Acceptance Criteria Snapshot

### Multi-item checkout

- User can submit one order containing at least two different pizza types.
- User can include line items across different time slots in one checkout.

### Capacity enforcement

- System never allows more than 2 pizzas confirmed/reserved for a slot at any moment.
- Concurrent users cannot overbook the same slot.

### Reservation timer

- Checkout displays remaining hold time.
- At expiration, held line items are released and user is notified.
- Timer starts when a time slot is selected.

### Admin paid-state handling

- Admin can mark cash/unpaid orders as paid.
- Payment state is visible in list and detail views.

### Post-order edit handling

- Customer can update an existing order without breaking slot constraints.
- System blocks updates that would exceed 2 pizzas in any affected slot.
- System blocks modifications after 3:00 PM on the day of order and informs customer why.

## Open Technical Questions

1. Should partial reservation extension be allowed when user edits cart?
2. Should mark-as-paid be reversible (for correction), and who can do it?
3. What level of audit trail is required if admin auth is minimal?

## Suggested Delivery Sequence

1. Build data model + reservation engine first.
2. Implement cart + checkout UI with timer.
3. Implement grouped admin + mark-as-paid.
4. Polish UX/accessibility.
5. Add optional online payment integration if feasible.

