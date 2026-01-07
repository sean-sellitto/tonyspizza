import { useState } from "react";
import InputField from "./InputField";
import SelectField from "./SelectField";

export default function PizzaOrderForm({
  formData,
  setFormData,
  timeSlots,
  menuItems,
  onSubmit,
  backendMessage,
}) {
  const [message, setMessage] = useState("");

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

    // Delegae actual submission to parent
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <div className="field-group">
        <SelectField
          label="Pizza Type"
          value={formData.menu_item_id}
          onChange={(e) =>
            setFormData({ ...formData, menu_item_id: Number(e.target.value) })
          }
          options={menuItems.map((item) => ({
            label: item.name,
            value: item.id,
          }))}
        />

        <SelectField
          label="Quantity"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: Number(e.target.value) })
          }
          options={[
            { label: "1", value: 1 },
            { label: "2", value: 2 },
          ]}
        />

        <SelectField
          label="Timeslot"
          value={formData.timeslot_id}
          onChange={(e) =>
            setFormData({ ...formData, timeslot_id: Number(e.target.value) })
          }
          options={timeSlots.map((ts) => ({
            value: ts.id,
            label:
              ts.remaining === 0
                ? `${ts.slot} — SOLD OUT`
                : `${ts.slot} — ${ts.remaining} spots left`,
            disabled: ts.remaining === 0,
          }))}
        />
      </div>

      <button type="submit">Submit Order</button>
      {message.startsWith("Order submitted") && (
        <div className="success-box">
          🍕 Order received! We’ll start cooking.
        </div>
      )}

      {message && <p className="form-error">{message}</p>}
      {backendMessage && (
        <p
          className={`form-error ${
            backendMessage.startsWith("Order submitted") ? "success-box" : ""
          }`}
        >
          {backendMessage}
        </p>
      )}
    </form>
  );
}
