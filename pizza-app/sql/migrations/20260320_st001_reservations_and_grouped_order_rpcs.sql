-- ST-001: reservation + grouped checkout RPCs
-- Creates:
--   public.create_reservation_safe
--   public.release_reservation_safe
--   public.create_grouped_order_safe

create extension if not exists pgcrypto;

create table if not exists public.order_reservations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  timeslot_id uuid not null references public.time_slot_instances(id) on delete cascade,
  quantity integer not null check (quantity between 1 and 2),
  expires_at timestamptz not null,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_reservations_slot_active
  on public.order_reservations (timeslot_id, expires_at)
  where released_at is null;

create index if not exists idx_order_reservations_session_active
  on public.order_reservations (session_id, expires_at)
  where released_at is null;

create or replace function public.tg_touch_order_reservations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_order_reservations_updated_at on public.order_reservations;
create trigger trg_touch_order_reservations_updated_at
before update on public.order_reservations
for each row execute function public.tg_touch_order_reservations_updated_at();

create or replace function public.create_reservation_safe(
  p_timeslot_id uuid,
  p_quantity integer,
  p_session_id uuid,
  p_previous_reservation_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
  v_reservation_id uuid;
  v_expires_at timestamptz;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 2 then
    raise exception 'Quantity must be between 1 and 2';
  end if;

  -- If replacing a previous hold, release it first so capacity is recalculated cleanly.
  if p_previous_reservation_id is not null then
    update public.order_reservations
    set released_at = now()
    from public.order_reservations r
    where order_reservations.id = r.id
      and r.id = p_previous_reservation_id
      and r.session_id = p_session_id
      and r.released_at is null;
  end if;

  select t.remaining
  into v_remaining
  from public.time_slots_with_availability t
  where t.id = p_timeslot_id;

  if v_remaining is null then
    raise exception 'Invalid or unavailable time slot';
  end if;

  if p_quantity > v_remaining then
    raise exception 'Selected time slot does not have enough remaining capacity';
  end if;

  v_expires_at := now() + interval '3 minutes';

  insert into public.order_reservations (session_id, timeslot_id, quantity, expires_at)
  values (p_session_id, p_timeslot_id, p_quantity, v_expires_at)
  returning id into v_reservation_id;

  return jsonb_build_object(
    'reservation_id', v_reservation_id,
    'expires_at', v_expires_at,
    'remaining_after_hold', v_remaining - p_quantity
  );
end;
$$;

create or replace function public.release_reservation_safe(
  p_reservation_id uuid,
  p_session_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.order_reservations
  set released_at = now()
  where id = p_reservation_id
    and session_id = p_session_id
    and released_at is null;

  if not found then
    raise exception 'Reservation not found or already released';
  end if;

  return true;
end;
$$;

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
begin
  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Order items are required';
  end if;

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

    perform public.create_order_safe(
      p_customer_name,
      p_phone,
      p_email,
      v_menu_item_id,
      v_timeslot_id,
      v_quantity
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
    'item_count', v_created_count
  );
end;
$$;

grant execute on function public.create_reservation_safe(uuid, integer, uuid, uuid) to anon, authenticated, service_role;
grant execute on function public.release_reservation_safe(uuid, uuid) to anon, authenticated, service_role;
grant execute on function public.create_grouped_order_safe(text, text, text, jsonb, uuid) to anon, authenticated, service_role;
