import { useEffect, useState } from "react";
import InputField from "./InputField";
import SelectField from "./SelectField";

export default function PizzaOrderForm({
  formData,
  setFormData,
  lineItems,
  timeSlots,
  menuItems,
  onSubmit,
  onAddLineItem,
  onRemoveLineItem,
  onLineItemChange,
  onLineItemSlotSelect,
  reservationCountdown,
  isSubmitting,
  activeOrderDateLabel,
  submitConflictSummary,
  successResetToken,
  backendMessage,
}) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!successResetToken) return;
    setMessage("");
  }, [successResetToken]);

  // Validation helpers
  const validateName = (name) => name.length > 0 && name.length <= 50;

  const validatePhone = (phone) =>
    /^\+?[0-9]{7,15}$/.test(phone.replace(/\s+/g, ""));

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!validateName(formData.customer_name)) {
      setMessage("Name must be 1-50 characters.");
      return;
    }

    if (!validatePhone(formData.phone)) {
      setMessage("Phone number is invalid.");
      return;
    }

    if (!validateEmail(formData.email)) {
      setMessage("Email is invalid.");
      return;
    }

    // Clear validation message
    setMessage("");

    // Delegate actual submission to parent
    onSubmit(e);
  };

  const canSubmit =
    lineItems.length > 0 &&
    lineItems.every((item) => item.menu_item_id && item.timeslot_id && item.quantity);
  const completedItems = lineItems.filter(
    (item) => item.menu_item_id && item.timeslot_id && item.quantity,
  ).length;
  const getMenuItemName = (menuItemId) =>
    menuItems.find((m) => String(m.id) === String(menuItemId))?.name;
  const getSlotLabel = (timeslotId) =>
    timeSlots.find((t) => String(t.id) === String(timeslotId))?.slot;

  useEffect(() => {
    if (message) {
      setMessage("");
    }
  }, [formData, lineItems]);

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <section className="checkout-section">
        <div className="section-header">
          <h3>Your Details</h3>
          <p>Enter contact info for pickup coordination.</p>
        </div>

        {activeOrderDateLabel && (
          <p className="order-date-label">
            Ordering for: <strong>{activeOrderDateLabel}</strong>
          </p>
        )}
        <InputField
          type="text"
          maxLength={50}
          label="Name"
          value={formData.customer_name}
          onChange={(e) =>
            setFormData({ ...formData, customer_name: e.target.value })
          }
          required
        />

        <InputField
          type="tel"
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <InputField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </section>

      {reservationCountdown && (
        <div className="timer-banner" aria-live="polite">
          Reservation hold time: {reservationCountdown}
        </div>
      )}

      <section className="checkout-section" aria-label="Order items">
        <div className="section-header">
          <h3>Build Your Order</h3>
          <p>
            {completedItems} of {lineItems.length} items ready to submit.
          </p>
        </div>
        {timeSlots.length === 0 && (
          <div className="empty-state-box" role="status">
            <h4>No Time Slots Available</h4>
            <p>
              There are currently no pickup slots configured for this date. Please check back
              shortly or contact the pizza shop owner.
            </p>
          </div>
        )}
        {lineItems.map((item, index) => (
          <div key={item.id} className="line-item-card">
            <div className="line-item-header">
              <h4>Item {index + 1}</h4>
              <span className={`item-status ${item.menu_item_id && item.timeslot_id ? "ready" : ""}`}>
                {item.menu_item_id && item.timeslot_id ? "Ready" : "Incomplete"}
              </span>
            </div>
            <div className="field-group">
              <SelectField
                label="Pizza Type"
                value={item.menu_item_id || ""}
                onChange={(e) =>
                  onLineItemChange(item.id, "menu_item_id", e.target.value)
                }
                options={menuItems.map((menuItem) => ({
                  label: menuItem.name,
                  value: menuItem.id,
                }))}
              />

              <SelectField
                label="Quantity"
                value={item.quantity}
                onChange={(e) =>
                  onLineItemChange(item.id, "quantity", Number(e.target.value))
                }
                options={[
                  { label: "1", value: 1 },
                  { label: "2", value: 2 },
                ]}
              />

              <SelectField
                label="Timeslot"
                value={item.timeslot_id || ""}
                onChange={(e) =>
                  onLineItemSlotSelect(item.id, e.target.value, item.quantity)
                }
                options={[
                  { label: "Select a time slot", value: "", disabled: true },
                  ...timeSlots.map((ts) => ({
                    value: ts.id,
                    label:
                      ts.remaining === 0
                        ? `${ts.slot} — FULL`
                        : `${ts.slot} — ${ts.remaining} spots left`,
                    disabled: ts.remaining === 0,
                  })),
                ]}
              />
            </div>

            {item.error && (
              <p className="form-error" aria-live="assertive">
                {item.error}
              </p>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={() => onRemoveLineItem(item.id)}
            >
              Remove Item
            </button>
          </div>
        ))}
      </section>

      <div className="build-actions">
        <button type="button" className="secondary-button" onClick={onAddLineItem}>
          Add Another Pizza
        </button>
      </div>
      <div className="summary-box preview-box" aria-live="polite">
        <h4>Order Preview</h4>
        <p className="preview-helper">
          Review exactly what will be placed for each item.
        </p>
        <ul className="preview-list">
          {lineItems.map((item, index) => (
            <li key={`preview-${item.id}`} className="preview-item-card">
              <div className="preview-item-head">
                <strong>Item {index + 1}</strong>
                <span
                  className={`item-status ${item.menu_item_id && item.timeslot_id ? "ready" : ""}`}
                >
                  {item.menu_item_id && item.timeslot_id ? "Ready to submit" : "Needs selection"}
                </span>
              </div>
              <div className="preview-item-line">
                <span>Pizza</span>
                <strong>{getMenuItemName(item.menu_item_id) || "Not selected"}</strong>
              </div>
              <div className="preview-item-line">
                <span>Quantity</span>
                <strong>{item.quantity || 0}</strong>
              </div>
              <div className="preview-item-line">
                <span>Pickup</span>
                <strong>{getSlotLabel(item.timeslot_id) || "Not selected"}</strong>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="primary-action-row">
        <button type="submit" disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? "Submitting..." : "Place Order"}
        </button>
      </div>
      {!canSubmit && (
        <p className="step-helper">
          To submit, each item needs a pizza, quantity, and time slot.
        </p>
      )}

      {submitConflictSummary?.length > 0 && (
        <div className="conflict-summary-box" aria-live="assertive">
          <h4>Could not submit order</h4>
          <p>One or more line items conflicted with current slot availability.</p>
          <ul>
            {submitConflictSummary.map((item) => (
              <li key={`conflict-${item.item}`}>
                Item {item.item}: {item.pizza} at {item.slot}. {item.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <p className="form-error">{message}</p>}
      {backendMessage && <p className="form-error">{backendMessage}</p>}
    </form>
  );
}
