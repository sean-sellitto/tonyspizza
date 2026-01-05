import { supabase } from "../supabaseClient";

export async function fetchTimeSlots() {
  return await supabase
    .from("time_slots_with_availability")
    .select("*")
    .order("slot");
}
