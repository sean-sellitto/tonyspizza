import { supabase } from "../supabaseClient";

export async function fetchTimeSlots(orderDateId) {
  let query = supabase.from("time_slots_with_availability").select("*");

  if (orderDateId) {
    query = query.eq("order_date_id", orderDateId);
  }

  const { data, error } = await query.order("slot");
  if (error || !data) return { data, error };

  // Defensive dedupe in case historical duplicate instances exist in DB.
  const deduped = Object.values(
    data.reduce((acc, slot) => {
      const key = `${slot.order_date_id}-${slot.slot}`;
      if (!acc[key]) {
        acc[key] = slot;
      } else if ((slot.remaining ?? 0) > (acc[key].remaining ?? 0)) {
        acc[key] = slot;
      }
      return acc;
    }, {}),
  );

  return { data: deduped, error: null };
}
