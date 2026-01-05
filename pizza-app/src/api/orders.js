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
