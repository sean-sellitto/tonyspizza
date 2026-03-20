-- Payment status: only paid / unpaid. Normalizes existing data and adds admin update RPC.

-- Normalize existing rows
update public.parent_orders
set status = 'unpaid'
where status is null
   or lower(status) not in ('paid', 'unpaid');

update public.parent_orders
set status = 'unpaid'
where lower(status) in ('new', 'completed', 'pending');

update public.orders
set status = 'unpaid'
where status is null
   or lower(status) not in ('paid', 'unpaid');

update public.orders
set status = 'unpaid'
where lower(status) in ('new', 'completed', 'pending');

alter table public.parent_orders
  alter column status set default 'unpaid';

alter table public.parent_orders
  drop constraint if exists parent_orders_status_check;

alter table public.parent_orders
  add constraint parent_orders_status_check check (status in ('unpaid', 'paid'));

-- Grouped checkout: use unpaid for new checkouts
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
  values (p_customer_name, p_phone, p_email, 'unpaid')
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
      'unpaid',
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

-- Admin: set payment for a whole checkout (parent) or a standalone line (no parent)
create or replace function public.set_checkout_payment_status(
  p_status text,
  p_parent_order_id uuid default null,
  p_order_line_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rowcount integer;
begin
  if lower(p_status) not in ('paid', 'unpaid') then
    raise exception 'Invalid payment status';
  end if;

  if p_parent_order_id is not null and p_order_line_id is not null then
    raise exception 'Provide only one of p_parent_order_id or p_order_line_id';
  end if;

  if p_parent_order_id is not null then
    update public.parent_orders
    set status = lower(p_status)
    where id = p_parent_order_id;

    get diagnostics v_rowcount = row_count;
    if v_rowcount = 0 then
      raise exception 'Parent order not found';
    end if;

    update public.orders
    set status = lower(p_status)
    where parent_order_id = p_parent_order_id;

    return jsonb_build_object('ok', true, 'scope', 'parent');
  end if;

  if p_order_line_id is not null then
    update public.orders
    set status = lower(p_status)
    where id = p_order_line_id
      and parent_order_id is null;

    get diagnostics v_rowcount = row_count;
    if v_rowcount = 0 then
      raise exception 'Standalone order line not found (grouped lines use parent checkout)';
    end if;

    return jsonb_build_object('ok', true, 'scope', 'line');
  end if;

  raise exception 'p_parent_order_id or p_order_line_id required';
end;
$$;

grant execute on function public.set_checkout_payment_status(text, uuid, uuid) to anon, authenticated, service_role;
