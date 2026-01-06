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
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    pizzaType: "Pepperoni",
    quantity: 1,
    timeslot: "",
  });

  const loadTimeSlots = async () => {
    const { data, error } = await fetchTimeSlots();
    if (!error && data.length > 0) {
      setTimeSlots(data);
      setFormData((prev) => ({
        ...prev,
        timeslot: data[0]?.id || "",
      }));
    }
  };

  useEffect(() => {
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

    console.log("Submitting order with:", {
      timeslot: formData.timeslot,
      quantity: formData.quantity,
    });

    const { data, error } = await createOrder({
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
      setSuccess(false);
      return;
    }

    setMessage("Order submitted successfully!");
    setSuccess(true);

    setFormData({
      customerName: "",
      phone: "",
      email: "",
      menuItemId: menuItems[0]?.id || "",
      quantity: 1,
      timeslot: "",
    });

    await loadTimeSlots();
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Tony's Pizza Order Form</h1>
        <p>Fresh pizza. Limited slots. Order now.</p>
      </header>

      <main className="card">
        <PizzaOrderForm
          formData={formData}
          setFormData={setFormData}
          timeSlots={timeSlots}
          menuItems={menuItems}
          onSubmit={handleSubmit}
        />
      </main>

      {success && (
        <div className="success-box">
          <h2>🎉 Order Confirmed!</h2>
          <p>Your pizza is being prepared.</p>
        </div>
      )}
    </div>
  );
}
