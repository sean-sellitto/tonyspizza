import { supabase } from "../supabaseClient";

export async function fetchTimeSlots(orderDateId) {
  const { data, error } = await supabase
    .from("time_slots_with_availability")
    .select("*")
    .eq("order_date_id", orderDateId)
    .order("slot", { ascending: true });

  return { data, error };
}
