import { supabase } from "../supabaseClient";

export async function fetchOrderDates() {
  const { data, error } = await supabase
    .from("order_dates")
    .select("id, order_date")
    .eq("is_active", true)
    .order("order_date");

  console.log("FETCH DATES: ", data);
  return { data, error };
}
