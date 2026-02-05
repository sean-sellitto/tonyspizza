import { supabase } from "../supabaseClient";

export async function fetchTimeSlots(orderDateId) {
  const { data, error } = await supabase
    .from("time_slots_with_availability")
    .select("*")
    .eq("order_date_id", orderDateId)
    .order("slot", { ascending: true });

  // Map time_slot_instance_id to id for easier use in the form
  const formattedData = data?.map((item) => ({
    ...item,
    id: item.time_slot_instance_id, // This is the key change!
  }));

  console.log("Formatted Data: ", formattedData);
  return { data: formattedData, error };
}
