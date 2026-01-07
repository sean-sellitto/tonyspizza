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
      setMessage(error);
      setSuccess(false);
      return;
    } else {
      //setMessage("Order submitted successfully!");
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
          <>
            <section className="info-section ordering-instructions">
              <h2>🍕 How Ordering Works</h2>
              <ul>
                <li>
                  Each time slot can handle up to{" "}
                  <strong>2 pizzas total</strong>
                </li>
                <li>
                  You may order <strong>1 or 2 pizzas</strong> per order
                </li>
                <li>Availability updates in real time</li>
              </ul>

              <h3>🕒 Choosing a Time Slot</h3>
              <ul>
                <li>
                  <strong>2 spots left</strong> → order 1 or 2 pizzas
                </li>
                <li>
                  <strong>1 spot left</strong> → order 1 pizza only
                </li>
                <li>
                  <strong>Sold out</strong> → slot unavailable
                </li>
              </ul>
            </section>
            <section className="info-section payment-info">
              <h2>💳 Payment Information</h2>
              <ul>
                <li>
                  <strong> Each pizza is $20</strong>
                </li>
                <li>
                  Payment is accepted via <strong>Venmo</strong> or{" "}
                  <strong>cash</strong>
                </li>
                <li>
                  <strong>Venmo:</strong> @Tony-Ratliff-3
                </li>
                <li>
                  Please include your <strong>name and time slot</strong> in the
                  Venmo note
                </li>
                <li>
                  <strong>Cash</strong> accepted at pickup
                </li>
              </ul>
            </section>

            <section className="info-section pizza-description">
              <h2>🍕 Our Pizzas</h2>

              <p>
                All pizzas are made with one ingredient organic flour, olive oil
                shipped from a one source organic farm in Italy, the same sauce
                and cheese that only the best pizza joints in NYC use.
              </p>

              <ul>
                <li>
                  <strong>Cheese</strong> – Classic cheese pizza
                </li>
                <li>
                  <strong>Pepperoni</strong> – Cup and char pepperoni with hot
                  honey sauce
                </li>
                <li>
                  <strong>Pepperoni, Sausage, Bananna Peppers</strong> – Cup and
                  char pepperoni, sausage, and banana peppers with hot honey
                  sauce
                </li>
                <li>
                  <strong>Supreme</strong> – Flavor bomb of finely chopped
                  pepperoni, onion, green pepper, and sausage combined to make
                  one bold flavor.
                </li>
              </ul>
            </section>

            <PizzaOrderForm
              formData={formData}
              setFormData={setFormData}
              timeSlots={timeSlots}
              menuItems={menuItems}
              onSubmit={handleSubmit}
              backendMessage={message}
            />
          </>
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
