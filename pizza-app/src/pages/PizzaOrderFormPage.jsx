import PizzaOrderForm from "../components/PizzaOrderForm";
import TimesUpPage from "./TimesUpPage";
import { useState, useEffect } from "react";
import { fetchTimeSlots } from "../api/timeSlots";
import { fetchMenuItems } from "../api/menu";
import { createOrder } from "../api/orders";

export default function PizzaOrderFormPage() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
    menu_item_id: "",
    timeslot_id: "",
    quantity: 1,
  });
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // --- Ordering cutoff logic ---
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday ... 5 = Friday
  const hour = now.getHours();

  const orderingClosed =
    (day === 5 && hour >= 12) || // Friday after noon
    day === 6 || // Saturday
    day === 0 || // Sunday
    (day === 1 && hour < 8); // Monday before 8am

  const loadTimeSlots = async () => {
    const { data, error } = await fetchTimeSlots();
    if (!error && data.length > 0) {
      setTimeSlots(data);
      setFormData((prev) => ({ ...prev, timeslot_id: data[0].id }));
    }
  };

  const loadMenuItems = async () => {
    const { data, error } = await fetchMenuItems();
    if (!error && data.length > 0) {
      setMenuItems(data);
      setFormData((prev) => ({ ...prev, menu_item_id: data[0].id }));
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
        customer_name: "",
        phone: "",
        email: "",
        menu_item_id: menuItems[0]?.id || "",
        quantity: 1,
        timeslot_id: timeSlots[0]?.id || "",
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
        {orderingClosed ? (
          <TimesUpPage />
        ) : (
          <PizzaOrderForm
            formData={formData}
            setFormData={setFormData}
            timeSlots={timeSlots}
            menuItems={menuItems}
            onSubmit={handleSubmit}
          />
        )}
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
