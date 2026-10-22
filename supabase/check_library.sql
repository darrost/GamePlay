select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'library_entries'
order by ordinal_position;

select relrowsecurity as rls_enabled
from pg_class
where oid = 'public.library_entries'::regclass;

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'library_entries'
order by policyname;

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'library_entries'
    and grantee in ('anon', 'authenticated', 'PUBLIC')
order by grantee, privilege_type;

select grantee, column_name, privilege_type
from information_schema.role_column_grants
where table_schema = 'public' and table_name = 'library_entries'
    and grantee in ('anon', 'authenticated', 'PUBLIC')
    and privilege_type in ('INSERT', 'UPDATE')
order by grantee, privilege_type, column_name;

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.library_entries'::regclass
order by conname;
