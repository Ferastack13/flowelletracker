create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  self_care_intention text,
  show_cycle_estimate boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length
    check (display_name is null or char_length(display_name) <= 80),
  constraint profiles_intention_length
    check (self_care_intention is null or char_length(self_care_intention) <= 280)
);

alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (user_id = auth.uid());

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy profiles_delete_own
  on public.profiles
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on table public.profiles to authenticated;

comment on table public.profiles is
  'Account preferences only. Does not store period dates, symptoms, or medical records.';
