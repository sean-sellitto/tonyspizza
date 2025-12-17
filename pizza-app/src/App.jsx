import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const pizzaOptions = ["Pepperoni", "Cheese", "Buffalo Chicken"];

function App() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pizzaType, setPizzaType] = useState(pizzaOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [timeslot, setTimeslot] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch all timeslots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      const { data, error } = await supabase.from("timeSlots").select("*");
      console.log("Supabase data:", data);
      console.log("Supabase error:", error);
      if (error) {
        console.error("Error fetching timeSlots:", error);
      } else {
        setTimeSlots(data);
        if (data.length > 0) setTimeslot(data[0].id); // set default selection
      }
    };
    fetchTimeSlots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from("orders").insert([
      {
        customer_name: customerName,
        phone,
        email,
        pizza_type: pizzaType,
        quantity,
        timeslot_id: timeslot,
        status: "pending",
      },
    ]);
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Order submitted successfully!");
      // Reset form
      setCustomerName("");
      setPhone("");
      setEmail("");
      setPizzaType(pizzaOptions[0]);
      setQuantity(1);
      if (timeSlots.length > 0) setTimeslot(timeSlots[0].id);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Pizza Order Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Phone: </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email: </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Pizza Type: </label>
          <select
            value={pizzaType}
            onChange={(e) => setPizzaType(e.target.value)}
          >
            {pizzaOptions.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Quantity: </label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>
        <div>
          <label>Timeslot: </label>
          <select
            value={timeslot}
            onChange={(e) => setTimeslot(Number(e.target.value))}
          >
            {timeSlots.map((ts) => (
              <option key={ts.id} value={ts.id}>
                {ts.slot}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Submit Order</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
