import "./styles.css";
import { useEffect, useState } from "react";
import { fetchTimeSlots } from "./api/timeSlots";
import { fetchMenuItems } from "./api/menu";
import { createOrder } from "./api/orders";
import PizzaOrderForm from "./components/PizzaOrderForm";

export default function App() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [menuItems, setMenuItems] = useState([]);

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

  useEffect(() => {
    async function loadMenu() {
      const { data, error } = await fetchMenuItems();
      if (!error && data.length > 0) {
        setMenuItems(data);
        setFormData((prev) => ({
          ...prev,
          menuItemId: data[0].id,
        }));
      }
    }
    loadMenu();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await createOrder({
      customer_name: formData.customerName,
      phone: formData.phone,
      email: formData.email,
      menu_item_id: formData.menuItemId,
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
    <div className="app-container">
      <div className="card"></div>
      <h1>Tony's Pizza Order Form</h1>

      <PizzaOrderForm
        formData={formData}
        setFormData={setFormData}
        timeSlots={timeSlots}
        menuItems={menuItems}
        onSubmit={handleSubmit}
      />

      {message && (
        <p
          className={`message ${
            message.startsWith("Error") ? "error" : "success"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
