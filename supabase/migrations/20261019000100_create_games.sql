begin;

create table public.games (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    image_url text not null,
    genre text not null,
    platforms text[] not null,
    release_date date,
    owner_id uuid not null default auth.uid() references auth.users (id),
    created_at timestamptz not null default now(),

    constraint games_title_length check (char_length(btrim(title)) between 2 and 120),
    constraint games_description_length check (char_length(btrim(description)) between 20 and 5000),
    constraint games_genre_length check (char_length(btrim(genre)) between 2 and 60),
    constraint games_image_url_format check (
        char_length(image_url) <= 2048
        and image_url ~ '^https?://[^[:space:]]+$'
    ),
    constraint games_platforms_valid check (
        array_ndims(platforms) = 1
        and cardinality(platforms) between 1 and 10
        and array_position(platforms, null) is null
        and platforms <@ array[
            'PC', 'PlayStation', 'Xbox', 'Nintendo Switch',
            'macOS', 'Linux', 'iOS', 'Android', 'Other'
        ]::text[]
    )
);

create index games_owner_id_idx on public.games (owner_id);
create index games_created_at_idx on public.games (created_at desc);

alter table public.games enable row level security;

revoke all on table public.games from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on table public.games to anon, authenticated;
grant insert (title, description, image_url, genre, platforms, release_date)
    on public.games to authenticated;
grant update (title, description, image_url, genre, platforms, release_date)
    on public.games to authenticated;
grant delete on table public.games to authenticated;

create policy "Everyone can read games"
    on public.games
    for select
    to anon, authenticated
    using (true);

create policy "Users can add their own games"
    on public.games
    for insert
    to authenticated
    with check ((select auth.uid()) = owner_id);

create policy "Creators can update their games"
    on public.games
    for update
    to authenticated
    using ((select auth.uid()) = owner_id)
    with check ((select auth.uid()) = owner_id);

create policy "Creators can delete their games"
    on public.games
    for delete
    to authenticated
    using ((select auth.uid()) = owner_id);

commit;
