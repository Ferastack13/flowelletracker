-- Daily bleeding intensity for recorded periods.
-- Period duration remains start→end inclusive in the app; this table stores per-day flow.

create table public.period_bleeding_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period_id uuid not null references public.cycle_periods (id) on delete cascade,
  logged_on date not null,
  intensity text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint period_bleeding_logs_logged_on_range
    check (logged_on >= date '1900-01-01'),
  constraint period_bleeding_logs_intensity_allowed
    check (intensity in ('none', 'spotting', 'light', 'medium', 'heavy')),
  constraint period_bleeding_logs_period_day_unique
    unique (period_id, logged_on)
);

create index period_bleeding_logs_user_logged_on_idx
  on public.period_bleeding_logs (user_id, logged_on desc);

create index period_bleeding_logs_period_logged_on_idx
  on public.period_bleeding_logs (period_id, logged_on asc);

alter table public.period_bleeding_logs enable row level security;

create policy period_bleeding_logs_select_own
  on public.period_bleeding_logs
  for select
  to authenticated
  using (user_id = auth.uid());

create policy period_bleeding_logs_insert_own
  on public.period_bleeding_logs
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy period_bleeding_logs_update_own
  on public.period_bleeding_logs
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy period_bleeding_logs_delete_own
  on public.period_bleeding_logs
  for delete
  to authenticated
  using (user_id = auth.uid());

comment on table public.period_bleeding_logs is
  'Daily bleeding intensity for a cycle_periods row. Informational only.';
