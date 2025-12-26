import { supabase } from "../supabaseClient";

export async function fetchTimeSlots() {
  return supabase.from("time_slots").select("*");
}
