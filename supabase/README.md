# GamePlay database setup

The games migration creates the shared catalog table, database validation, and access rules. Apply it to the same Supabase project configured in the React application's `.env.local`.

## Apply the migration

1. Open the GamePlay project in the Supabase dashboard.
2. Open SQL Editor and create a new query.
3. Copy the complete contents of `supabase/migrations/20261019000100_create_games.sql` into the query.
4. Run it once. The transaction either applies the setup together or rolls it back on failure.
5. Open Table Editor and confirm that the `games` table exists with RLS enabled.

This is an initial migration for a new table. It does not delete or replace an existing table. If `games` already exists, stop and inspect its structure before proceeding. Do not rerun the migration after it succeeds. Later changes should use a new migration file.

Applying this file in SQL Editor does not record it in the Supabase CLI migration history. If CLI deployment is introduced later, reconcile the history before running `supabase db push` against this database.

## Game fields

| Field | Database rule |
| --- | --- |
| `id` | Automatically generated UUID and primary key |
| `title` | Required; 2–120 characters after trimming surrounding spaces |
| `description` | Required; 20–5000 characters after trimming surrounding spaces |
| `image_url` | Required HTTP or HTTPS address without whitespace; at most 2048 characters |
| `genre` | Required; 2–60 characters after trimming surrounding spaces |
| `platforms` | Required one-dimensional array with 1–10 non-null entries from the supported list |
| `release_date` | Optional calendar date |
| `owner_id` | Defaults to the signed-in user's ID and references `auth.users` |
| `created_at` | Defaults to the database's current time |

Supported platforms are PC, PlayStation, Xbox, Nintendo Switch, macOS, Linux, iOS, Android, and Other. Platform names must match these values exactly. The creation and editing forms offer these as selectable options. The database does not currently reject duplicate platforms; the form should send unique selections.

The URL rule checks the address's basic shape. It does not check that the destination exists or serves an image. React should provide a fallback when a cover cannot load.

The owner reference prevents deletion of an Auth user while games still reference that user. Account deletion is not part of this feature.

## Access rules

| Operation | Guest | Signed-in creator | Other signed-in user |
| --- | --- | --- | --- |
| Read games | Allowed | Allowed | Allowed |
| Add a game | Denied | Allowed as self | Allowed as self |
| Edit a game | Denied | Allowed | Denied |
| Delete a game | Denied | Allowed | Denied |

Grants enable the permitted operations on the table. Row Level Security policies restrict which records each operation may affect. Both are configured explicitly because automatic exposure of new tables was disabled when the Supabase project was created.

Client inserts and updates may include only `title`, `description`, `image_url`, `genre`, `platforms`, and `release_date`. Omit `id`, `owner_id`, and `created_at`; the database supplies them for new records. The column grants prevent clients from rewriting ownership, IDs, or creation timestamps.

The creator is the user who added the catalog record, not the game's developer or publisher. RLS enforces ownership independently of React route guards and hidden buttons.

## Verify the setup

After applying the migration, run `supabase/check_games.sql` in SQL Editor. It is read-only and displays the columns, RLS flag, four policies, and role privileges.

Expected results:

- Nine columns exist.
- `rls_enabled` is true.
- There is one policy each for SELECT, INSERT, UPDATE, and DELETE.
- Guests have SELECT access only.
- Authenticated users have SELECT and DELETE table privileges, plus INSERT and UPDATE privileges on the six editable columns.

These checks verify configuration, not behavior with actual user requests. SQL Editor normally runs with administrator privileges and therefore does not reproduce ordinary guest or signed-in access. Once the forms exist, verify through the application with a guest and two different user accounts: public reads work, creators can create/edit/delete, and other users cannot modify their records.

## Personal library

The catalog and game CRUD are connected to Supabase. The personal library uses a separate `public.library_entries` table to connect an account to a game without copying the game record.

After the games migration has been applied, run the complete contents of `supabase/migrations/20261022000100_create_library.sql` once in SQL Editor. Do not rerun the games migration. The library migration adds a new table and does not replace existing catalog records.

The three columns are `user_id` (defaults to `auth.uid()`), `game_id`, and `saved_at` (defaults to `now()`). The composite primary key `(user_id, game_id)` prevents duplicate saves for the same account. Different accounts can save the same game independently, including games created by someone else.

Authenticated clients may select and delete their own library entries and insert only the `game_id` column. The database supplies the account ID and time. RLS restricts SELECT, INSERT, and DELETE to `auth.uid() = user_id`; guests have no table privileges and there is no UPDATE permission. Saving and removing are separate operations. Removing an entry leaves the public game intact.

Foreign keys use `ON DELETE CASCADE`: deleting a game removes its saved-list references; deleting an Auth user removes that user's library entries. This does not change the existing games-owner foreign key behavior.

Run `supabase/check_library.sql` to inspect the columns, RLS, three policies, grants, primary key, and two cascading foreign keys. Expect authenticated SELECT/DELETE table grants, INSERT on `game_id` only, and no guest or UPDATE grants. These are configuration checks; SQL Editor normally bypasses ordinary RLS as an administrator.

Verify through the app using two accounts: save a game, refresh, open My Library, remove it, and check the catalog still contains it. Account B should start with its own empty library, can save the same game independently, and must not see account A's saved list. A guest visiting `/library` should be redirected to login. Use a disposable catalog game to test cascading deletion if needed.
