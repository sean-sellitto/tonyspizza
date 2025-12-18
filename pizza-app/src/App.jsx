import { useEffect, useState } from "react";
import { fetchTimeSlots } from "./api/timeSlots";
import { createOrder } from "./api/orders";
import PizzaOrderForm from "./components/PizzaOrderForm";

export default function App() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    pizzaType: "Pepperoni",
    quantity: 1,
    timeslot: "",
  });

  useEffect(() => {
    async function loadTimeSlots() {
      const { data, error } = await fetchTimeSlots();
      if (!error && data.length > 0) {
        setTimeSlots(data);
        setFormData((prev) => ({ ...prev, timeslot: data[0].id }));
      }
    }
    loadTimeSlots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await createOrder({
      customer_name: formData.customerName,
      phone: formData.phone,
      email: formData.email,
      pizza_type: formData.pizzaType,
      quantity: formData.quantity,
      timeslot_id: formData.timeslot,
      status: "pending",
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Order submitted successfully!");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Tony's Pizza Order Form</h1>

      <PizzaOrderForm
        formData={formData}
        setFormData={setFormData}
        timeSlots={timeSlots}
        onSubmit={handleSubmit}
      />

      {message && <p>{message}</p>}
    </div>
  );
}
