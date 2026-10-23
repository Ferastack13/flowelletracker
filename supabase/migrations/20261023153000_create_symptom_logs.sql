create table public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null,
  symptom text not null,
  severity smallint not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint symptom_logs_logged_on_range
    check (logged_on >= date '1900-01-01'),
  constraint symptom_logs_severity_range
    check (severity >= 1 and severity <= 5),
  constraint symptom_logs_symptom_allowed
    check (symptom in (
      'cramps',
      'headache',
      'bloating',
      'fatigue',
      'mood-changes',
      'breast-tenderness'
    )),
  constraint symptom_logs_notes_length
    check (notes is null or char_length(notes) <= 400)
);

create index symptom_logs_user_logged_on_idx
  on public.symptom_logs (user_id, logged_on desc, created_at desc);

alter table public.symptom_logs enable row level security;

create policy symptom_logs_select_own
  on public.symptom_logs
  for select
  to authenticated
  using (user_id = auth.uid());

create policy symptom_logs_insert_own
  on public.symptom_logs
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy symptom_logs_update_own
  on public.symptom_logs
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy symptom_logs_delete_own
  on public.symptom_logs
  for delete
  to authenticated
  using (user_id = auth.uid());

comment on table public.symptom_logs is
  'User-recorded symptom journal entries. Informational only; not a diagnosis.';
