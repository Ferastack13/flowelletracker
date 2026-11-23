-- Extend allowed symptoms for Phase 4 personalization.
alter table public.symptom_logs
  drop constraint if exists symptom_logs_symptom_allowed;

alter table public.symptom_logs
  add constraint symptom_logs_symptom_allowed
  check (symptom in (
    'cramps',
    'headache',
    'bloating',
    'fatigue',
    'mood-changes',
    'breast-tenderness',
    'acne',
    'back-pain',
    'food-cravings',
    'nausea'
  ));

-- Personalized recommendation completion (per user, local date, recommendation id).
create table if not exists public.self_care_activity_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  local_date date not null,
  recommendation_id text not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint self_care_activity_completions_local_date_range
    check (local_date >= date '1900-01-01'),
  constraint self_care_activity_completions_recommendation_id_format
    check (
      recommendation_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and char_length(recommendation_id) between 3 and 80
    )
);

create unique index if not exists self_care_activity_completions_user_day_rec_uidx
  on public.self_care_activity_completions (user_id, local_date, recommendation_id);

create index if not exists self_care_activity_completions_user_date_idx
  on public.self_care_activity_completions (user_id, local_date desc);

alter table public.self_care_activity_completions enable row level security;

create policy self_care_activity_completions_select_own
  on public.self_care_activity_completions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy self_care_activity_completions_insert_own
  on public.self_care_activity_completions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy self_care_activity_completions_delete_own
  on public.self_care_activity_completions
  for delete
  to authenticated
  using (user_id = auth.uid());

comment on table public.self_care_activity_completions is
  'Daily completion of personalized wellness recommendations. Not medical advice.';
