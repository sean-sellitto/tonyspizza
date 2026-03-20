# ST-001 Code Review - Multi-Item Checkout and Slot Reservation

Issue 1 - Required backend RPCs are referenced but not implemented/deployed, so core ST-001 flows cannot execute end-to-end (`create_reservation_safe`, `release_reservation_safe`, `create_grouped_order_safe`) - `pizza-app/src/api/orders.js`

Issue 2 - Repeated line items render duplicate `id` values for select controls because `SelectField` derives ids from label text only; this violates the accessibility requirement for proper label/control association in repeated rows - `pizza-app/src/components/SelectField.jsx` and `pizza-app/src/components/PizzaOrderForm.jsx`

Issue 3 - Reservation expiry handling is incomplete in UI behavior: timer disappearance does not provide explicit expiration feedback or item-level recovery guidance, which is required by ST-001 error/expiry UX expectations - `pizza-app/src/pages/PizzaOrderFormPage.jsx` (reservation countdown logic) and `pizza-app/src/components/PizzaOrderForm.jsx` (timer/error messaging)

Issue 4 - Quantity-change re-reservation uses stale closure state when looking up the target line item immediately after `setLineItems`, which can produce inconsistent reservation updates under rapid edits - `pizza-app/src/pages/PizzaOrderFormPage.jsx` (`onLineItemChange`, `onLineItemSlotSelect`)

Issue 5 - Design specifies a distinct review step with a “Continue to review” transition; implementation collapses builder and review into one form without that explicit step transition - `pizza-app/src/components/PizzaOrderForm.jsx`
