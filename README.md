# GamePlay

GamePlay is a React single-page application for discovering games, sharing reviews,
and building a personal saved-games library. The shared catalog, reviews, and
private libraries use a persistent Supabase backend.

- **Live application:** [game-play-lac.vercel.app](https://game-play-lac.vercel.app)
- **Public repository:** [darrost/GamePlay](https://github.com/darrost/GamePlay)
- **Frontend:** React 19, React Router 7, Vite 8, JavaScript, and external CSS
- **Backend:** hosted Supabase Auth and PostgreSQL, accessed through Supabase JS

## Install and run locally

Use Node.js 24 LTS and npm.

```sh
git clone https://github.com/darrost/GamePlay.git
cd GamePlay
npm ci
```

Copy `.env.example` to `.env.local` in the project root, then fill in the two values
for the Supabase project you will use:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

These are the Supabase project URL and browser publishable key. A service-role or
secret key must never be placed in a `VITE_` variable. `.env.local` is ignored by
Git; the repository contains only the empty `.env.example` template.

If using a new Supabase project, complete the database setup below before opening
data pages. Then start the frontend:

```sh
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Restart the
development server after changing environment variables. Running the frontend
locally still connects to the Supabase project configured in `.env.local`.

### Set up a new backend

Create a Supabase project and enable email/password authentication. In SQL Editor,
run these migration files **once, in order**, using their complete contents:

1. `supabase/migrations/20261019000100_create_games.sql`
2. `supabase/migrations/20261022000100_create_library.sql`
3. `supabase/migrations/20261022000200_create_reviews.sql`
4. `supabase/migrations/20261022000300_allow_short_reviews.sql`

Do not rerun successful initial migrations against an existing database.

In Supabase Authentication URL Configuration, set the Site URL to your frontend
origin and allow the confirmation redirect `http://localhost:5173/games` for local
development. Add your production `/games` URL when deploying. The running app
requests a confirmation redirect to `/games` on its current origin.

See [database setup and permission checks](supabase/README.md) for schema details.

### Checks and production build

```sh
npm run lint
node --test
npm run build
npm run preview
```

`npm run build` writes the production app to `dist`. `npm run preview` serves that build locally.

## Deployment

The frontend is hosted on Vercel. Supabase hosts the database and authentication.

## Functional Guide

The following sections follow the supplied React Exam Project Functional Guide
template.

### 1. Project Overview

**Application name:** GamePlay

**Category:** community game catalog with reviews and personal libraries.

**Main purpose:** GamePlay lets visitors discover games and read community
opinions. Signed-in users can contribute catalog entries, rate and review games,
and save favorites to a private library. Catalog ownership, review authorship,
and library membership are separate relationships.

### 2. User Access and Permissions

Guests can open Home, Games, and individual game details. They can read game
information, public reviews, average ratings, and review counts, and can open
Login or Register. They cannot add, edit, delete, review, or save games.

Authenticated users can also access My Library and Add Game, submit one review
per game, and manage their own reviews. Only the account that created a catalog
entry can edit or delete that game. Knowing its edit URL does not grant access.

| Action | Guest | Signed-in user |
| --- | --- | --- |
| Browse catalog and details | Yes | Yes |
| Read reviews and average ratings | Yes | Yes |
| Add a catalog game | No | Yes |
| Edit or delete a game | No | Its creator only |
| Post a review | No | One per account per game |
| Edit or delete a review | No | Its author only |
| Save or remove a library entry | No | Own library only |
| Open Login or Register | Yes | Redirected to Games |

Saving a game does not make the user its creator. Creating a game does not grant
control over other users' reviews. Removing a saved game from a library does not
delete the shared catalog entry. Supabase policies enforce ownership independently
of which buttons React displays.

### 3. Authentication and Session Handling

On startup, `AuthProvider` subscribes to Supabase authentication changes and calls
`getSession()`. The layout shows a session-loading state until the check finishes.
The provider shares `session`, `user`, loading status, and restoration errors
through Context.

Register submits email and password to Supabase after checking the form. When
email confirmation is required, the app shows Check your email. The confirmation
link returns to `/games`; a registration that immediately creates a session also
navigates there. Login uses `signInWithPassword` and navigates to Games on success.
The hosted backend uses email confirmation, so reviewers should use an inbox
they can access. No shared account credentials are included in this repository.

The Supabase browser client persists its session in localStorage by default and
handles token refresh. Context exposes that session to React; Context itself is
not persistent storage. After a page refresh, Supabase restores the session and
`AuthProvider` updates the app. Logout signs out the current browser session,
updates Context through the auth subscription, and returns to Home.

### 4. Routing Structure

`BrowserRouter` wraps the application. A shared layout route renders the header,
footer, and child pages through `Outlet`. There are eight main page routes plus
a wildcard page for unknown addresses:

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home with latest catalog additions | Public |
| `/games` | Shared game catalog | Public |
| `/games/:gameId` | Game details and reviews | Public |
| `/games/create` | Add game | Authenticated |
| `/games/:gameId/edit` | Edit game | Authenticated creator |
| `/library` | Personal saved games | Authenticated |
| `/login` | Login | Guest only |
| `/register` | Register | Guest only |
| `*` | Page not found | Public |

`PrivateRoute` redirects guests to `/login`; `GuestOnlyRoute` redirects signed-in
users to `/games`. The edit page separately compares the current user ID with
`game.owner_id`. Details and Edit are two distinct parameterized routes.

Home, Games, Details, and My Library all render remote data; the dynamic-page
requirement does not rely on counting Login or Register.

### 5. List to Details Flow

The catalog fetches games from Supabase and sorts them by newest creation time,
then ID for a stable order. Cards show title, cover, genre, platforms, average
rating, and review count. Unrated games show No ratings yet. The homepage displays
the three newest entries; My Library displays the current account's saved games,
most recently saved first. Search and catalog filters are not implemented.

Each card uses a React Router `Link` to `/games/:gameId`. Details reads `gameId`
with `useParams`, validates it, and fetches that game's description, cover,
platforms, genre, release date, and ownership. Its review section loads five
reviews per page and the signed-in account's own review separately, so its
controls remain available even on another review page. Rating summaries use all
reviews, not just the visible five.

### 6. Data Source and Backend

The backend is Supabase, a hosted backend-as-a-service. The frontend sends real
network requests through Supabase JS to Auth and the PostgreSQL data API.
Catalog and review records are not hardcoded in React.

- `games` stores catalog entries, creator IDs, and creation times.
- `library_entries` links accounts to saved games; the account/game pair is unique.
- `reviews` stores rating, text, author, game, and creation time; each author/game
  pair is unique.
- `game_review_stats` is a read-only view calculating each game's average and count.

Public game and review reads are allowed. Library reads are private. Row-level
security restricts writes to the current account's records, and column grants
prevent browser clients from assigning protected ownership fields. The database
supplies account IDs and timestamps. Deleting a game cascades to its library
entries and reviews.

### 7. Data Operations CRUD

**Create:** Add Game uses the controlled `GameForm`. After validation,
`createGame` inserts the editable fields and requests the saved ID and title.
The database assigns the creator. A success notice links to the new details page.

**Read:** service functions select records for Home, Games, Details, My Library,
and review pages. Custom hooks manage loading, success, error, retry, and request
cleanup. Cards receive database-calculated rating summaries.

**Update:** the creator opens `/games/:gameId/edit`. The shared form is prefilled
with the fetched values. `updateGame` updates only editable fields, filters by
game and owner IDs, and checks that a row was returned. A success notice links
back to Details, where the updated record is fetched.

**Delete:** the creator selects Delete game and confirms in a dialog. Cancel and
Escape leave the record intact. A successful deletion returns to Games and shows
a deletion notice. The database also removes saved-library references and reviews
for that game. Failed deletion keeps the dialog open with an error.

Reviews have their own create, read, update, and delete services. Their authors
can edit or confirm deletion from Details, after which the reviews and average
are fetched again. Saving and removing library entries are separate API actions
on `library_entries`; they never edit a game's catalog fields.

### 8. Forms and Validation

Forms include Register, Login, Add Game, Edit Game, and Write or Edit Review.
Inputs are controlled with React state and handled through `onChange` and
`onSubmit`. Submitting uses `preventDefault()`; request guards and disabled
controls prevent repeated submissions while a request is pending.

| Field | Client validation |
| --- | --- |
| Registration email | Required, valid basic email format, at most 254 characters |
| Registration password | Required, 8–128 characters; confirmation must match exactly |
| Game title | 2–120 characters after trimming |
| Game description | 20–5,000 characters after trimming |
| Cover image URL | Complete HTTP/HTTPS URL, no whitespace, at most 2,048 characters |
| Genre | 2–60 characters after trimming |
| Platforms | At least one supported value, no duplicates or unsupported values |
| Release date | Optional; if supplied, a valid calendar date |
| Review rating | Required whole number from 1 to 5, selected with clickable stars |
| Review text | 1–2,000 characters after trimming; empty or whitespace-only input rejected |

Login checks email and a nonempty password without imposing new-registration
password rules on existing accounts. Errors appear beside fields and the first
invalid input receives focus. Core data bounds, relationships, and ownership are
also constrained in PostgreSQL, so the UI is not the only enforcement layer.

### 9. React Specific Techniques

`useState` manages controlled values, form errors, notices, loading states, and
pagination. `useEffect` restores authentication, subscribes to session changes,
and loads remote data. `useRef` tracks pending requests, focus targets, and
dialogs; `useMemo` stabilizes the Context value. Router hooks supply navigation,
route parameters, and navigation state.

For a lifecycle example, `useGame` fetches a record when Details mounts, fetches
again when `gameId` or the retry counter changes, and aborts the previous request
when the effect cleans up. The hook ignores aborted results. `AuthProvider`
unsubscribes from authentication events when unmounted. User-specific review and
library components are keyed by identity to reset state when accounts change.

`AuthContext`, consumed through `useAuth`, shares identity with navigation,
guards, catalog actions, library components, and reviews. Pages and reusable
components use external CSS files. Global custom properties define the Neon
Arcade palette; media queries support mobile layouts, keyboard focus, and reduced
motion preferences.

### 10. Typical User Flow

1. Open Home, browse Games, and select a card to read its details and reviews.
2. Register with an accessible email address, confirm the email, and log in.
3. Save a game and open My Library. Removing it there leaves the catalog intact.
4. Choose 1–5 stars and post a review. Refresh, then edit the review and check the
   updated average. Other accounts can read it but cannot manage it.
5. Add a new catalog game, open its details, and edit its information.
6. For a disposable game, try Cancel in the delete dialog, then confirm deletion.
   The game disappears from the catalog and any saved-library entries.
7. Log out. Public browsing remains available; private routes require login again.

### 11. Error and Edge Case Handling

- Authentication errors distinguish invalid credentials and unconfirmed email;
  registration and logout also surface failures. Session restoration shows a
  loading state and an error if restoration fails.
- Data hooks expose loading and retryable error states. Failed review saves
  preserve the draft; failed deletions show an error instead of reporting success.
- Empty catalog, empty private library, and no-review states have clear messages.
  Missing or invalid game IDs show Game not found; unknown routes show Page not found.
- Broken cover images use a fallback. Missing release dates show Release date unknown.
- Duplicate account/game reviews are blocked by a unique database constraint.
  Concurrently removed or unauthorized game/review writes are not treated as
  successful when no affected row is returned.
- Destructive actions require confirmation, initially focus Cancel, and can be
  dismissed with Escape before deletion starts. Controls are disabled while a
  destructive request is pending.

## Project architecture

```text
src/
  components/   Reusable cards, covers, forms, reviews, navigation, and guards
  contexts/     Authentication provider and Context definition
  hooks/        Shared authentication access and remote-data lifecycle hooks
  lib/          Supabase browser client
  pages/        Route-level Home, Games, Details, Library, auth, and editing pages
  services/     Supabase queries and mutation functions
  utils/        Validation, payload preparation, and display helpers
supabase/
  migrations/   Tables, constraints, grants, policies, and rating view
  check_*.sql   Read-only database configuration inspections
tests/          Node test runner tests for pure validation and presentation logic
public/         Site icon and optimized homepage artwork
docs/           Visual-theme notes
```

Pages compose reusable components. Components call service functions or custom
hooks; services communicate with Supabase. The library and reviews reference
games instead of duplicating catalog data. Authentication is shared through
Context, while each page owns its request and form state.
