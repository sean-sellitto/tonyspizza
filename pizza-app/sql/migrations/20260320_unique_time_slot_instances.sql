-- Prevent duplicate slot instances per date.
-- Safe to run after deduplication cleanup.

create unique index if not exists uq_time_slot_instances_date_slot
  on public.time_slot_instances (order_date_id, time_slot_id);
