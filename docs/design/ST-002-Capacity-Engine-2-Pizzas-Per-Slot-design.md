# ST-002 UI Design - Capacity Engine: 2 Pizzas Per Slot

## Summary

This design ensures capacity behavior is clearly communicated in the existing checkout flow so users understand slot limits, can recover from conflicts, and never overbook beyond 2 pizzas per slot.

## User Flow

1. Customer views available slots with current remaining capacity.
2. Customer selects quantity and slot; system validates capacity and either confirms hold or returns a clear conflict.
3. Customer reviews order and submits; if capacity changed, submit fails with actionable feedback on affected items.

## UI Structure Table

| Screen | Component | Description | Notes | Missing (Yes/No) |
|---|---|---|---|---|
| Order Builder | Timeslot options | Each option shows slot plus remaining capacity text | Example: `5:30 - 1 spot left`, `5:30 - FULL` | No |
| Order Builder | Quantity selector | Quantity selection constrained by capacity checks | Validation must be server-authoritative | No |
| Order Builder | Inline line-item error | Per-item error text for over-capacity and hold conflicts | Keep near affected row for quick correction | No |
| Order Builder | Reservation timer banner | Global hold timer for active reservations | Supports urgency and expiry awareness | No |
| Order Builder | Capacity helper copy | Small instructional copy clarifying 2-pizza slot limit | Keep concise; no long policy text | No |
| Review and Submit | Availability status notice | Reminder that capacity is rechecked at submit time | Prevents surprise on last-step failure | No |
| Review and Submit | Submit conflict message panel | Summarizes failed item(s) when slot is no longer available | Must indicate next action (edit item / reselect slot) | No |
| Confirmation | Success summary | Shows successful grouped submission | No extra payment/admin details in ST-002 | No |

## States

- Loading: slot availability fetching and refresh after reservation/submit attempts.
- Error: deterministic capacity conflict responses for reserve/submit failures.
- Empty: no available slots for selected date; show clear sold-out message.

## UX Notes

- Capacity is enforced server-side; UI should present status, not authoritative logic.
- Error language should be deterministic and recovery-oriented.
- Slot labels should avoid ambiguity by ensuring deduped slot rows per date.
- Keep this story scoped to capacity communication and conflict handling only.

## Accessibility Considerations

- Capacity and conflict updates must be announced via `aria-live` regions.
- Error focus should move to the affected line item or conflict summary at submit failure.
- FULL/available status must include text, not color-only indicators.
- Ensure keyboard users can reselect slot and retry submit without pointer use.

## Missing UI Element Check

No missing UI elements found for ST-002 based on current story requirements and decisions.
