select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'reviews'
order by ordinal_position;

select relname, relrowsecurity as rls_enabled, reloptions
from pg_class
where oid in ('public.reviews'::regclass, 'public.game_review_stats'::regclass);

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'reviews'
order by policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('reviews', 'game_review_stats')
    and grantee in ('anon', 'authenticated', 'PUBLIC')
order by table_name, grantee, privilege_type;

select grantee, column_name, privilege_type
from information_schema.role_column_grants
where table_schema = 'public' and table_name = 'reviews'
    and grantee in ('anon', 'authenticated', 'PUBLIC')
    and privilege_type in ('INSERT', 'UPDATE')
order by grantee, privilege_type, column_name;

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.reviews'::regclass
order by conname;
