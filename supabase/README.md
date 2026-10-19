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

Supported platforms are PC, PlayStation, Xbox, Nintendo Switch, macOS, Linux, iOS, Android, and Other. Platform names must match these values exactly. A future form will offer these as selectable options. The database does not currently reject duplicate platforms; the form should send unique selections.

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

## Next application step

The React catalog remains a placeholder until it queries `public.games`. Add the Create Game form next, protect its route with PrivateRoute, and implement catalog and details queries with loading, error, and empty states. The table starts empty; this migration does not insert sample games.
