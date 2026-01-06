import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          customer_name,
          phone,
          quantity,
          status,
          created_at,
          time_slots ( slot ),
          menu_items ( name )
        `
        )
        .order("created_at", { ascending: false });

      if (!error) setOrders(data);
    }

    loadOrders();
  }, []);

  return (
    <div className="admin-page">
      <h1>Incoming Orders</h1>

      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Customer</th>
            <th>Pizza</th>
            <th>Qty</th>
            <th>Timeslot</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{new Date(o.created_at).toLocaleTimeString()}</td>
              <td>{o.customer_name}</td>
              <td>{o.menu_items?.name}</td>
              <td>{o.quantity}</td>
              <td>{o.time_slots?.slot}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
