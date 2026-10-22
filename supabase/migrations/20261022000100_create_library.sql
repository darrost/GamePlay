begin;

create table public.library_entries (
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    game_id uuid not null references public.games (id) on delete cascade,
    saved_at timestamptz not null default now(),
    primary key (user_id, game_id)
);

create index library_entries_game_id_idx on public.library_entries (game_id);
create index library_entries_user_saved_at_idx on public.library_entries (user_id, saved_at desc);

alter table public.library_entries enable row level security;

revoke all on table public.library_entries from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, delete on table public.library_entries to authenticated;
grant insert (game_id) on public.library_entries to authenticated;

create policy "Users can read their library"
    on public.library_entries
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "Users can save games to their library"
    on public.library_entries
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

create policy "Users can remove games from their library"
    on public.library_entries
    for delete
    to authenticated
    using ((select auth.uid()) = user_id);

commit;
