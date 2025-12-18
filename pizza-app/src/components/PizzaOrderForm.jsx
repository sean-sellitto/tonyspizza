import InputField from "./InputField";
import SelectField from "./SelectField";

const pizzaOptions = [
  { label: "Pepperoni", value: "Pepperoni" },
  { label: "Cheese", value: "Cheese" },
  { label: "Buffalo Chicken", value: "Buffalo Chicken" },
];

export default function PizzaOrderForm({
  formData,
  setFormData,
  timeSlots,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <InputField
        label="Name"
        value={formData.customerName}
        onChange={(e) =>
          setFormData({ ...formData, customerName: e.target.value })
        }
      />

      <InputField
        label="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />

      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <SelectField
        label="Pizza Type"
        value={formData.pizzaType}
        onChange={(e) =>
          setFormData({ ...formData, pizzaType: e.target.value })
        }
        options={pizzaOptions}
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
          label: ts.slot,
          value: ts.id,
        }))}
      />

      <button type="submit">Submit Order</button>
    </form>
  );
}
