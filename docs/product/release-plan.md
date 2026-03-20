# Release Plan

## Release Goal

Ship a reliable multi-item pizza checkout with strict slot capacity control and admin payment tracking.

## Release Candidates

## RC1 (MVP)

- Multi-item checkout with one submit
- 3-minute reservation timer and expiry handling
- Capacity rule enforced at 2 pizzas per slot
- Grouped admin order view
- Admin mark-as-paid controls

## RC2 (Enhancement)

- UI/UX modernization refinements
- Reporting/audit polish
- Optional online payments (if approved and feasible)

## Exit Criteria for MVP Release

- All P0 acceptance criteria pass
- Critical defects resolved
- Admin can reliably identify paid vs unpaid orders
- No observed slot overbooking under concurrent test scenarios
