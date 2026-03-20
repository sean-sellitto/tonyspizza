-- Grouped checkout: one parent_orders row per multi-pizza submission; each line is still orders.parent_order_id -> parent.
-- Run after existing reservation + grouped RPC migration.

create table if not exists public.parent_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

comment on table public.parent_orders is 'One row per customer checkout; orders rows with same parent_order_id are line items.';

alter table public.orders
  add column if not exists parent_order_id uuid references public.parent_orders (id) on delete cascade;

create index if not exists idx_orders_parent_order_id on public.orders (parent_order_id);

-- Replace grouped checkout: create parent first, then insert line rows with parent_order_id (still validates reservations).
create or replace function public.create_grouped_order_safe(
  p_customer_name text,
  p_phone text,
  p_email text,
  p_items jsonb,
  p_session_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_menu_item_id integer;
  v_timeslot_id uuid;
  v_quantity integer;
  v_reservation_id uuid;
  v_created_count integer := 0;
  v_parent_id uuid;
begin
  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Order items are required';
  end if;

  insert into public.parent_orders (customer_name, phone, email, status)
  values (p_customer_name, p_phone, p_email, 'new')
  returning id into v_parent_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_menu_item_id := (v_item ->> 'menu_item_id')::integer;
    v_timeslot_id := (v_item ->> 'timeslot_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    v_reservation_id := (v_item ->> 'reservation_id')::uuid;

    if v_quantity < 1 or v_quantity > 2 then
      raise exception 'Each item quantity must be between 1 and 2';
    end if;

    perform 1
    from public.order_reservations r
    where r.id = v_reservation_id
      and r.session_id = p_session_id
      and r.timeslot_id = v_timeslot_id
      and r.quantity = v_quantity
      and r.released_at is null
      and r.expires_at > now();

    if not found then
      raise exception 'Reservation is invalid or expired for one or more items';
    end if;

    -- Line item: same semantics as create_order_safe but tied to parent checkout.
    insert into public.orders (
      customer_name,
      phone,
      email,
      menu_item_id,
      time_slot_id,
      quantity,
      status,
      parent_order_id
    )
    values (
      p_customer_name,
      p_phone,
      p_email,
      v_menu_item_id,
      v_timeslot_id,
      v_quantity,
      'new',
      v_parent_id
    );

    update public.order_reservations
    set released_at = now()
    where id = v_reservation_id
      and session_id = p_session_id
      and released_at is null;

    v_created_count := v_created_count + 1;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'parent_order_id', v_parent_id,
    'item_count', v_created_count
  );
end;
$$;

grant select on public.parent_orders to anon, authenticated, service_role;

-- RLS: allow reads for the admin UI (tighten in production if needed).
alter table public.parent_orders enable row level security;

drop policy if exists "parent_orders_select_public" on public.parent_orders;
create policy "parent_orders_select_public"
  on public.parent_orders
  for select
  using (true);
