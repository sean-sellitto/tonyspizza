import { supabase } from "../supabaseClient";

export async function createOrder({
  menu_item_id,
  customer_name,
  phone,
  email,
  quantity,
  timeslot_id,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Lock the timeslot row
    const { rows: timeslotRows } = await supabase
      .from("time_slots")
      .select("max_pizzas")
      .eq("id", timeslot_id)
      .single();

    if (timeslotRows.length === 0) {
      throw new Error("Timeslot not found");
    }

    const maxPizzas = timeslotRows[0].max_pizzas;

    // 2. Calculate current total pizzas for this timeslot
    const { data, count } = await supabase
      .from("orders")
      .select("quantity", { count: "exact" })
      .eq("timeslot_id", timeslot_id)
      .in("status", ["pending", "confirmed"]);

    const totalOrdered = data.reduce((sum, order) => sum + order.quantity, 0);
    const remaining = timeslotRows.max_pizzas - totalOrdered;

    // 3. Check if adding this order exceeds max
    if (currentTotal + quantity > maxPizzas) {
      await client.query("ROLLBACK");
      return { error: "Timeslot sold out" };
    }

    // 4. Insert the new order
    if (totalOrdered + newQuantity <= timeslot.max_pizzas) {
      const { error } = await supabase
        .from("orders")
        .insert([{ timeslot_id, quantity: newQuantity, status: "pending" }]);

      if (error) throw error;
    } else {
      throw new Error("Timeslot sold out");
    }

    // 5. Return remaining slots
    //const remaining = maxPizzas - (currentTotal + quantity);

    await client.query("COMMIT");

    return { success: true, remaining };
  } catch (err) {
    await client.query("ROLLBACK");
    return { error: err.message || "Unknown error" };
  } finally {
    client.release();
  }
}

// return supabase.from("orders").insert([order]);
