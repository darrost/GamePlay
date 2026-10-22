begin;

create table public.reviews (
    id uuid primary key default gen_random_uuid(),
    game_id uuid not null references public.games (id) on delete cascade,
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    rating smallint not null check (rating between 1 and 5),
    body text not null check (char_length(btrim(body)) between 20 and 2000),
    created_at timestamptz not null default now(),
    unique (game_id, user_id)
);

create index reviews_game_created_at_idx on public.reviews (game_id, created_at desc, id);
create index reviews_user_id_idx on public.reviews (user_id);

alter table public.reviews enable row level security;

revoke all on table public.reviews from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.reviews to anon, authenticated;
grant insert (game_id, rating, body) on public.reviews to authenticated;
grant update (rating, body) on public.reviews to authenticated;
grant delete on table public.reviews to authenticated;

create policy "Everyone can read reviews"
    on public.reviews for select to anon, authenticated
    using (true);

create policy "Users can add their own review"
    on public.reviews for insert to authenticated
    with check ((select auth.uid()) = user_id);

create policy "Authors can edit their reviews"
    on public.reviews for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Authors can delete their reviews"
    on public.reviews for delete to authenticated
    using ((select auth.uid()) = user_id);

create view public.game_review_stats
with (security_invoker = true)
as
select game_id, count(*) as review_count, avg(rating)::numeric(3, 2) as average_rating
from public.reviews
group by game_id;

revoke all on table public.game_review_stats from public, anon, authenticated;
grant select on table public.game_review_stats to anon, authenticated;

commit;
