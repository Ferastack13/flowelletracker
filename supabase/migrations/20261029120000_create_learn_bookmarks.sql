create table public.learn_bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  article_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, article_slug),
  constraint learn_bookmarks_slug_format
    check (article_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(article_slug) between 3 and 80)
);

create index learn_bookmarks_user_created_idx
  on public.learn_bookmarks (user_id, created_at desc);

alter table public.learn_bookmarks enable row level security;

create policy learn_bookmarks_select_own
  on public.learn_bookmarks
  for select
  to authenticated
  using (user_id = auth.uid());

create policy learn_bookmarks_insert_own
  on public.learn_bookmarks
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy learn_bookmarks_delete_own
  on public.learn_bookmarks
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on table public.learn_bookmarks to authenticated;

comment on table public.learn_bookmarks is
  'Saved Learn guides for the signed-in user. Article bodies live in the app, not in this table.';
