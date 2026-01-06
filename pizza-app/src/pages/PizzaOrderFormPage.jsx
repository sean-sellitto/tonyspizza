import PizzaOrderForm from "../components/PizzaOrderForm";
import { useState, useEffect } from "react";
import { fetchTimeSlots } from "../api/timeSlots";
import { fetchMenuItems } from "../api/menu";
import { createOrder } from "../api/orders";

export default function PizzaOrderFormPage() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    menuItemId: "",
    quantity: 1,
    timeslot: "",
  });
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const loadTimeSlots = async () => {
    const { data, error } = await fetchTimeSlots();
    if (!error && data.length > 0) {
      setTimeSlots(data);
      setFormData((prev) => ({ ...prev, timeslot: data[0].id }));
    }
  };

  const loadMenuItems = async () => {
    const { data, error } = await fetchMenuItems();
    if (!error && data.length > 0) {
      setMenuItems(data);
      setFormData((prev) => ({ ...prev, menuItemId: data[0].id }));
    }
  };

  useEffect(() => {
    loadTimeSlots();
    loadMenuItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await createOrder(formData);

    if (error) {
      setMessage("Error: " + error);
      setSuccess(false);
    } else {
      setMessage("Order submitted successfully!");
      setSuccess(true);
      setFormData({
        customerName: "",
        phone: "",
        email: "",
        menuItemId: menuItems[0]?.id || "",
        quantity: 1,
        timeslot: timeSlots[0]?.id || "",
      });
      await loadTimeSlots(); // refresh available slots
    }
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
