import { useState } from "react";
import InputField from "./InputField";
import SelectField from "./SelectField";

export default function PizzaOrderForm({
  formData,
  setFormData,
  timeSlots,
  menuItems,
  onSubmit,
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
    if (!validateName(formData.customerName)) {
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
        value={formData.customerName}
        onChange={(e) =>
          setFormData({ ...formData, customerName: e.target.value })
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

      <SelectField
        label="Pizza Type"
        value={formData.menuItemId}
        onChange={(e) =>
          setFormData({ ...formData, menuItemId: Number(e.target.value) })
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
        value={formData.timeslot}
        onChange={(e) =>
          setFormData({ ...formData, timeslot: Number(e.target.value) })
        }
        options={timeSlots.map((ts) => ({
          value: ts.id,
          label:
            ts.remaining > 0
              ? `${ts.slot} - ${ts.remaining} spot${
                  ts.remaining > 1 ? "s" : ""
                } left`
              : `${ts.slot} - SOLD OUT`,
          disabled: ts.remaining === 0,
        }))}
      />

      <button type="submit">Submit Order</button>
      {message && <p className="error">{message}</p>}
    </form>
  );
}
