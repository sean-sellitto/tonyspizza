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
    p_timeslot_id: timeslot_id,
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
      quantity,
      status,
      created_at,
      time_slot_instances!fk_orders_time_slot (
        id,
        order_dates!time_slot_instances_order_date_id_fkey ( order_date ),
        time_slots!time_slot_instances_time_slot_id_fkey ( slot )
        ),
      menu_items!orders_menu_item_id_fkey ( name )
      `,
    )

    .order("created_at", { ascending: false });

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
    order_date: o.time_slot_instances?.order_dates?.order_date || "Unknown",
    timeslot_slot: o.time_slot_instances?.time_slots?.slot || "Unknown",
    menu_item_name: o.menu_items?.name || "Unknown",
  }));
}
