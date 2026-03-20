import { supabase } from "../supabaseClient";

export async function fetchNextOrderDate() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("order_dates")
    .select("id, order_date")
    .eq("is_active", true)
    .gte("order_date", today)
    .order("order_date", { ascending: true })
    .limit(1);

  if (error) return { data: null, error };
  if (data?.[0]) return { data: data[0], error: null };

  // Fallback for environments with only past active dates.
  const { data: fallbackData, error: fallbackError } = await supabase
    .from("order_dates")
    .select("id, order_date")
    .eq("is_active", true)
    .order("order_date", { ascending: false })
    .limit(1);

  return { data: fallbackData?.[0] ?? null, error: fallbackError };
}

export async function fetchOrderDatesAdmin() {
  const { data, error } = await supabase
    .from("order_dates")
    .select("id, order_date, is_active")
    .order("order_date", { ascending: true });

  return { data: data ?? [], error };
}

export async function createOrderDate({ order_date, is_active = true }) {
  const { data, error } = await supabase
    .from("order_dates")
    .insert([{ order_date, is_active }])
    .select("id, order_date, is_active")
    .single();

  return { data, error };
}

export async function updateOrderDate({ id, order_date, is_active }) {
  const payload = {};
  if (order_date) payload.order_date = order_date;
  if (typeof is_active === "boolean") payload.is_active = is_active;

  const { data, error } = await supabase
    .from("order_dates")
    .update(payload)
    .eq("id", id)
    .select("id, order_date, is_active")
    .single();

  return { data, error };
}

export async function deleteOrderDate(id) {
  const { error } = await supabase.from("order_dates").delete().eq("id", id);
  return { error };
}

/**
 * Ensures one time_slot_instances row exists per master time_slots row for this order date.
 * Safe to call repeatedly (idempotent). Run after resolving the active order date so slots exist
 * when the calendar advances to the next pizza-making date.
 */
export async function ensureTimeSlotInstancesForOrderDate(orderDateId) {
  if (!orderDateId) return { data: null, error: null };
  const { data, error } = await supabase.rpc("ensure_time_slot_instances_for_order_date", {
    p_order_date_id: orderDateId,
  });
  return { data, error };
}
