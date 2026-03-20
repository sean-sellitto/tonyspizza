import { supabase } from "../supabaseClient";

/** Payment is only paid | unpaid (default unpaid). */
export function normalizePaymentStatus(status) {
  const v = String(status || "").toLowerCase();
  return v === "paid" ? "paid" : "unpaid";
}

export async function createOrder({
  timeslot_id,
  quantity,
  customer_name,
  phone,
  email,
  menu_item_id,
}) {
  const { data, error } = await supabase.rpc("create_order_safe", {
    p_customer_name: customer_name,
    p_phone: phone,
    p_email: email,
    p_menu_item_id: menu_item_id,
    p_timeslot_id: timeslot_id,
    p_quantity: Number(quantity),
  });

  if (error) {
    return { error: error.message };
  }

  return { remaining: data };
}

export async function reserveTimeslot({
  timeslot_id,
  quantity,
  session_id,
  previous_reservation_id,
}) {
  const { data, error } = await supabase.rpc("create_reservation_safe", {
    p_timeslot_id: timeslot_id,
    p_quantity: Number(quantity),
    p_session_id: session_id,
    p_previous_reservation_id: previous_reservation_id ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function releaseTimeslotReservation({ reservation_id, session_id }) {
  const { error } = await supabase.rpc("release_reservation_safe", {
    p_reservation_id: reservation_id,
    p_session_id: session_id,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function createGroupedOrder({
  customer_name,
  phone,
  email,
  items,
  session_id,
}) {
  const { data, error } = await supabase.rpc("create_grouped_order_safe", {
    p_customer_name: customer_name,
    p_phone: phone,
    p_email: email,
    p_items: items,
    p_session_id: session_id,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Set payment for a grouped checkout (parent) or a standalone line (no parent).
 */
export async function setCheckoutPaymentStatus({ status, parentOrderId, orderLineId }) {
  const s = normalizePaymentStatus(status);
  const { error } = await supabase.rpc("set_checkout_payment_status", {
    p_status: s,
    p_parent_order_id: parentOrderId ?? null,
    p_order_line_id: orderLineId ?? null,
  });
  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Fetch order lines with parent_orders join, enrich labels, then group into checkout groups.
 * Rows without parent_order_id are grouped as single-line checkouts.
 */
export async function fetchOrders() {
  const { data: orderRows, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_name,
      phone,
      quantity,
      status,
      created_at,
      menu_item_id,
      time_slot_id,
      parent_order_id
      `,
    )
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
    return [];
  }

  const parentIds = [
    ...new Set((orderRows || []).map((o) => o.parent_order_id).filter(Boolean)),
  ];
  let parentMap = {};
  if (parentIds.length > 0) {
    const { data: parents, error: parentsError } = await supabase
      .from("parent_orders")
      .select("id, customer_name, phone, email, status, created_at")
      .in("id", parentIds);
    if (parentsError) {
      console.warn("Could not load parent_orders (run migration / check RLS):", parentsError);
    } else if (parents) {
      parentMap = Object.fromEntries(parents.map((p) => [p.id, p]));
    }
  }

  const { data: menuItems } = await supabase.from("menu_items").select("id, name");
  const { data: slotInstances } = await supabase
    .from("time_slots_with_availability")
    .select("id, slot, order_date_id");
  const { data: orderDates } = await supabase.from("order_dates").select("id, order_date");

  const menuById = Object.fromEntries((menuItems || []).map((m) => [String(m.id), m.name]));
  const slotById = Object.fromEntries((slotInstances || []).map((s) => [String(s.id), s.slot]));
  const slotDateIdById = Object.fromEntries(
    (slotInstances || []).map((s) => [String(s.id), s.order_date_id]),
  );
  const orderDateById = Object.fromEntries(
    (orderDates || []).map((d) => [String(d.id), d.order_date]),
  );

  const lines = (orderRows || []).map((o) => {
    const slotId = String(o.time_slot_id);
    const dateId = slotDateIdById[slotId];
    const orderDate = orderDateById[String(dateId)] || null;
    const pid = o.parent_order_id;
    return {
      id: o.id,
      customer_name: o.customer_name,
      phone: o.phone,
      email: o.email,
      quantity: o.quantity,
      status: o.status,
      created_at: o.created_at,
      menu_item_id: o.menu_item_id,
      time_slot_id: o.time_slot_id,
      parent_order_id: pid,
      parent_orders: pid ? parentMap[pid] ?? null : null,
      menu_item_name: menuById[String(o.menu_item_id)] || "Unknown",
      timeslot_slot: slotById[slotId] || "Unknown",
      order_date: orderDate,
    };
  });

  return buildOrderGroups(lines);
}

/**
 * @returns {Array<{
 *   group_key: string,
 *   parent_order_id: string | null,
 *   customer_name: string,
 *   phone: string,
 *   email: string | null,
 *   status: string,
 *   placed_at: string | null,
 *   line_count: number,
 *   pizza_count: number,
 *   lines: Array<object>
 * }>}
 */
function buildOrderGroups(lines) {
  const byParent = new Map();

  for (const line of lines) {
    const pid = line.parent_order_id;
    if (pid) {
      if (!byParent.has(pid)) {
        const p = line.parent_orders;
        byParent.set(pid, {
          group_key: pid,
          parent_order_id: pid,
          customer_name: p?.customer_name ?? line.customer_name,
          phone: p?.phone ?? line.phone,
          email: p?.email ?? line.email ?? null,
          status: normalizePaymentStatus(p?.status ?? line.status),
          placed_at: p?.created_at ?? line.created_at,
          lines: [],
        });
      }
      byParent.get(pid).lines.push(line);
    } else {
      const key = `single-${line.id}`;
      byParent.set(key, {
        group_key: key,
        parent_order_id: null,
        customer_name: line.customer_name,
        phone: line.phone,
        email: line.email ?? null,
        status: normalizePaymentStatus(line.status),
        placed_at: line.created_at,
        lines: [line],
      });
    }
  }

  const groups = Array.from(byParent.values()).map((g) => {
    const pizzaCount = g.lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
    const latestPlaced = g.lines.reduce((max, l) => {
      const t = l.created_at ? new Date(l.created_at).getTime() : 0;
      return t > max ? t : max;
    }, 0);
    const placedAt =
      g.placed_at ||
      (latestPlaced ? new Date(latestPlaced).toISOString() : null);
    return {
      ...g,
      line_count: g.lines.length,
      pizza_count: pizzaCount,
      placed_at: placedAt,
    };
  });

  groups.sort((a, b) => {
    const ta = a.placed_at ? new Date(a.placed_at).getTime() : 0;
    const tb = b.placed_at ? new Date(b.placed_at).getTime() : 0;
    return tb - ta;
  });

  return groups;
}
