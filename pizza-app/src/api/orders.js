import { supabase } from "../supabaseClient";

export async function createOrder({
  timeslot_id,
  quantity,
  customer_name,
  phone,
  email,
  menu_item_id,
}) {
  const { data, error } = await supabase.rpc("create_order_safe", {
    p_customer_name: customer_name,
    p_phone: phone,
    p_email: email,
    p_menu_item_id: menu_item_id,
    p_timeslot_id: Number(timeslot_id),
    p_quantity: Number(quantity),
  });

  if (error) {
    return { error: error.message };
  }

  return { remaining: data };
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_name,
      phone,
      email,
      quantity,
      status,
      menu_item:menu_items!orders_menu_item_id_fkey(name),
      timeslot:time_slots!orders_timeslot_id_fkey(slot)
      `
    )

    .order("timeslot_id", { ascending: true });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data.map((o) => ({
    id: o.id,
    customer_name: o.customer_name,
    phone: o.phone,
    email: o.email,
    quantity: o.quantity,
    status: o.status,
    menu_item_name: o.menu_item?.name || "Unknown",
    timeslot_slot: o.timeslot?.slot || "Unknown",
  }));
}
