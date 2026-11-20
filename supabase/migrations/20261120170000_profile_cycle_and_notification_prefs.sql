-- Profile fields for reported cycle length and reminder preferences.
-- Preferences only: no delivery infrastructure in this migration.

alter table public.profiles
  add column if not exists usual_cycle_length_days smallint;

alter table public.profiles
  drop constraint if exists profiles_usual_cycle_length_range;

alter table public.profiles
  add constraint profiles_usual_cycle_length_range
  check (
    usual_cycle_length_days is null
    or (usual_cycle_length_days >= 14 and usual_cycle_length_days <= 60)
  );

comment on column public.profiles.usual_cycle_length_days is
  'Optional user-reported usual cycle length in days. Not period duration. Null means unknown.';

-- Reminder preferences: enabled by default for new profile rows.
-- Existing rows receive the same defaults only because these columns are new.
alter table public.profiles
  add column if not exists notify_period_reminder boolean not null default true;

alter table public.profiles
  add column if not exists notify_ovulation_reminder boolean not null default true;

alter table public.profiles
  add column if not exists notify_fertile_window_reminder boolean not null default true;

alter table public.profiles
  add column if not exists notify_checkin_reminder boolean not null default true;

comment on column public.profiles.notify_period_reminder is
  'User preference for upcoming-period reminders. Preference only; delivery is separate.';

comment on column public.profiles.notify_ovulation_reminder is
  'User preference for estimated-ovulation reminders. Preference only; delivery is separate.';

comment on column public.profiles.notify_fertile_window_reminder is
  'User preference for estimated fertile-window reminders. Preference only; delivery is separate.';

comment on column public.profiles.notify_checkin_reminder is
  'User preference for optional cycle check-in reminders. Preference only; delivery is separate.';
