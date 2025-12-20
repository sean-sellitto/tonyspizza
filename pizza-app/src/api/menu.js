import { supabase } from "../supabaseClient";

export async function fetchMenuItems() {
  return supabase
    .from("menu_items")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
}
