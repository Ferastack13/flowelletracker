-- Notification scheduling and delivery (email-first). Preferences stay on profiles.

alter table public.profiles
  add column if not exists timezone text not null default 'UTC';

alter table public.profiles
  drop constraint if exists profiles_timezone_length;

alter table public.profiles
  add constraint profiles_timezone_length
  check (char_length(timezone) between 1 and 64);

alter table public.profiles
  add column if not exists quiet_hours_start time;

alter table public.profiles
  add column if not exists quiet_hours_end time;

alter table public.profiles
  add column if not exists preferred_notify_channel text not null default 'email';

alter table public.profiles
  drop constraint if exists profiles_preferred_notify_channel_allowed;

alter table public.profiles
  add constraint profiles_preferred_notify_channel_allowed
  check (preferred_notify_channel in ('email'));

comment on column public.profiles.timezone is
  'IANA timezone used when scheduling reminders. Defaults to UTC.';

comment on column public.profiles.quiet_hours_start is
  'Local quiet-hours start. Null means no quiet hours.';

comment on column public.profiles.quiet_hours_end is
  'Local quiet-hours end. Null means no quiet hours.';

create table public.notification_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reminder_type text not null,
  channel text not null default 'email',
  scheduled_for timestamptz not null,
  event_date date,
  status text not null default 'pending',
  dedupe_key text not null,
  attempt_count integer not null default 0,
  last_error_category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_schedules_reminder_type_allowed
    check (reminder_type in (
      'period',
      'ovulation',
      'fertile_window',
      'checkin'
    )),
  constraint notification_schedules_channel_allowed
    check (channel in ('email')),
  constraint notification_schedules_status_allowed
    check (status in (
      'pending',
      'processing',
      'sent',
      'cancelled',
      'failed'
    )),
  constraint notification_schedules_attempt_count_range
    check (attempt_count >= 0 and attempt_count <= 20),
  constraint notification_schedules_error_category_length
    check (
      last_error_category is null
      or char_length(last_error_category) <= 80
    )
);

create unique index notification_schedules_user_dedupe_active_uidx
  on public.notification_schedules (user_id, dedupe_key)
  where status in ('pending', 'processing', 'sent');

create index notification_schedules_due_idx
  on public.notification_schedules (status, scheduled_for);

create index notification_schedules_user_updated_idx
  on public.notification_schedules (user_id, updated_at desc);

alter table public.notification_schedules enable row level security;

create policy notification_schedules_select_own
  on public.notification_schedules
  for select
  to authenticated
  using (user_id = auth.uid());

comment on table public.notification_schedules is
  'Pending and completed reminder jobs. Cycle estimates are not stored as medical claims.';

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.notification_schedules (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  reminder_type text not null,
  channel text not null default 'email',
  status text not null,
  provider_message_id text,
  attempt_count integer not null default 1,
  last_attempt_at timestamptz not null default now(),
  error_category text,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notification_deliveries_reminder_type_allowed
    check (reminder_type in (
      'period',
      'ovulation',
      'fertile_window',
      'checkin'
    )),
  constraint notification_deliveries_channel_allowed
    check (channel in ('email')),
  constraint notification_deliveries_status_allowed
    check (status in (
      'queued',
      'accepted',
      'delivered',
      'failed',
      'bounced'
    )),
  constraint notification_deliveries_attempt_count_range
    check (attempt_count >= 1 and attempt_count <= 20),
  constraint notification_deliveries_error_category_length
    check (error_category is null or char_length(error_category) <= 80),
  constraint notification_deliveries_provider_id_length
    check (
      provider_message_id is null
      or char_length(provider_message_id) <= 120
    )
);

create index notification_deliveries_user_created_idx
  on public.notification_deliveries (user_id, created_at desc);

create index notification_deliveries_schedule_idx
  on public.notification_deliveries (schedule_id);

alter table public.notification_deliveries enable row level security;

create policy notification_deliveries_select_own
  on public.notification_deliveries
  for select
  to authenticated
  using (user_id = auth.uid());

create policy notification_deliveries_update_own
  on public.notification_deliveries
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on table public.notification_deliveries is
  'Delivery attempts and provider acceptance results. Avoid storing reproductive details.';
