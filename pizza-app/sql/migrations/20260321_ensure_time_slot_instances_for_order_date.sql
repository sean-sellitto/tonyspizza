-- Ensure each active order date has one time_slot_instances row per master time_slots row.
-- Call when a new order_date is created or when the customer app switches to the next date.

create or replace function public.ensure_time_slot_instances_for_order_date(p_order_date_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not exists (select 1 from public.order_dates where id = p_order_date_id) then
    raise exception 'Invalid order date id';
  end if;

  insert into public.time_slot_instances (order_date_id, time_slot_id)
  select p_order_date_id, ts.id
  from public.time_slots ts
  on conflict (order_date_id, time_slot_id) do nothing;

  select count(*)::int into v_count
  from public.time_slot_instances
  where order_date_id = p_order_date_id;

  return jsonb_build_object(
    'ok', true,
    'instance_count', v_count
  );
end;
$$;

grant execute on function public.ensure_time_slot_instances_for_order_date(uuid) to anon, authenticated, service_role;

-- Auto-generate instances whenever a new pizza-making date is inserted.
create or replace function public.tg_order_dates_ensure_instances()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_time_slot_instances_for_order_date(new.id);
  return new;
end;
$$;

drop trigger if exists trg_order_dates_ensure_instances on public.order_dates;
create trigger trg_order_dates_ensure_instances
  after insert on public.order_dates
  for each row
  execute function public.tg_order_dates_ensure_instances();
