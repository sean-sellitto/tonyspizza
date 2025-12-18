import { supabase } from "../supabaseClient";

export async function createOrder(order) {
  return supabase.from("orders").insert([order]);
}
