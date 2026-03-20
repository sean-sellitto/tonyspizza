# ST-001 UI Design - Multi-Item Checkout and Slot Reservation

## Summary

This design supports building a single checkout with multiple pizza line items, each with its own time slot, while enforcing reservation holds and capacity constraints before submit.

## User Flow

1. Customer opens the order page and starts a new line item.
2. Customer selects pizza, quantity, and time slot; selecting a time slot starts a 3-minute hold.
3. Customer adds more line items (same or different slots), edits/removes items, then proceeds to review.
4. Customer submits once; system revalidates all items atomically and either confirms order or returns actionable conflicts.

## UI Structure Table

| Screen | Component | Description | Notes | Missing (Yes/No) |
|---|---|---|---|---|
| Order Builder | Page header | Title and short instruction for multi-item ordering | Keep concise; avoid long text blocks | No |
| Order Builder | Line item card/list row | One editable line item containing pizza type, quantity, and time slot | Repeatable list for multi-item flow | No |
| Order Builder | Pizza selector | Select pizza type for current line item | Required per line item | No |
| Order Builder | Quantity selector | Select quantity for current line item | Must respect slot capacity outcomes | No |
| Order Builder | Time slot selector | Select slot for current line item; triggers hold start | Hold starts on selection by decision | No |
| Order Builder | Add item button | Adds a new empty line item | Needed for multi-item checkout | No |
| Order Builder | Remove item action | Removes a line item and releases any related hold | Must handle active hold release | No |
| Order Builder | Edit item action | Updates existing line item fields | Changes can re-evaluate hold validity | No |
| Order Builder | Reservation timer banner | Global countdown for active holds | Show warning near expiry | No |
| Order Builder | Slot conflict inline message | Indicates slot unavailable/over capacity for a line item | Actionable guidance required | No |
| Order Builder | Continue to review button | Navigates to review step | Disabled when required fields missing | No |
| Review and Submit | Order summary list | Displays all line items grouped under one order | Includes slot, pizza, quantity per item | No |
| Review and Submit | Reservation status notice | Shows remaining hold time while reviewing | Must remain visible before submit | No |
| Review and Submit | Submit order button | Single final submit for all items | Triggers atomic revalidation | No |
| Review and Submit | Submit conflict message panel | Shows errors if any item fails revalidation | Must explain which item/slot failed | No |
| Confirmation | Confirmation card | Success state after atomic commit | Single order confirmation with all items | No |

## States

- Loading: menu/time-slot availability loading for selectors and review refresh.
- Error: reservation expired, slot full, and submit conflict responses.
- Empty: no line items yet (prompt to add first pizza item).

## UX Notes

- Keep interaction simple: line-item builder plus review step only.
- Always show reservation timing context once any slot has been selected.
- Conflict messages should direct users to edit affected items instead of starting over.
- No payment UI beyond what is already in-scope for ST-001.

## Accessibility Considerations

- Use explicit labels for all inputs/selects (pizza, quantity, time slot) and associate labels programmatically.
- Ensure keyboard-only flow supports add/edit/remove line item actions, step navigation, and final submit without pointer input.
- Keep focus order logical: line-item fields -> row actions -> continue/review -> submit.
- On validation or submit conflict, move focus to the error summary and provide links/jumps to affected line items.
- Reservation timer updates must be announced through a polite live region; expiration/conflict messages should use assertive announcements.
- Provide visible focus states and maintain sufficient text/background contrast for timer, warnings, and error states.
- Do not rely on color alone to indicate slot status; include clear status text (for example: "Full", "Reserved", "Expired").
- Confirmation view should include a clear heading and summary readable by assistive technologies.

## Missing UI Element Check

No missing UI elements found for ST-001 based on current story requirements and decisions.
