import { supabase } from "../supabaseClient";

export async function fetchOrderDates() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("order_dates")
    .select("id, order_date")
    .eq("is_active", true)
    .gte("order_date", today)
    .order("order_date");

  return { data, error };
}
