import { useEffect, useState } from "react";
import { fetchOrders } from "../api/orders";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchOrders(); // now always an array
      setOrders(data);
    };
    loadOrders();
  }, []);

  return (
    <div className="page">
      <header className="header">
        <h1>Admin Orders Dashboard</h1>
        <p>All incoming pizza orders</p>
      </header>

      <main className="card">
        {orders.length === 0 ? (
          <p style={{ textAlign: "center" }}>No orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Pizza</th>
                <th>Quantity</th>
                <th>Timeslot</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.customer_name}</td>
                  <td>{o.phone}</td>
                  <td>{o.email}</td>
                  <td>{o.menu_item_name}</td>
                  <td>{o.quantity}</td>
                  <td>{o.timeslot_slot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
