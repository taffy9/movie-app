# Watchlist Feature Spec

## Overview

Add a watchlist feature that lets users save movies and TV shows they want to watch. Data is stored in the browser via `localStorage` — no backend required. The feature integrates into the existing app through a new Watchlist page, a nav link, and add/remove buttons on movie cards and detail pages.

## Requirements

### Functional

1. **Add to watchlist** — Users can save any movie or TV show from:
   - The `MovieCard` component (heart/bookmark icon overlay)
   - The `Detail` page (button next to the existing UI)
2. **Remove from watchlist** — Users can unsave an item from the same locations, plus from the Watchlist page itself.
3. **Watchlist page** — A dedicated `/watchlist` route that displays all saved items in a grid (same layout as the Catalog page).
4. **Persistence** — Watchlist survives page reloads and browser restarts (localStorage).
5. **Visual indicator** — Saved items show a filled icon; unsaved items show an outlined icon. The state is visible everywhere the item appears (cards, detail page, watchlist).
6. **Empty state** — The Watchlist page shows a friendly message when no items are saved, with a link to browse movies.
7. **Category tracking** — Each saved item stores its category (`movie` or `tv`) so links and lookups work correctly.

### Non-Functional

- No authentication or backend.
- No limit on watchlist size (localStorage practical limit is ~5MB, more than enough).
- Works with the existing dark/light theme system.
- Responsive — matches the app's existing mobile-first approach.

## Data Model

Each watchlist entry stores the minimum data needed to render a `MovieCard` and link to the detail page:

```ts
interface WatchlistItem {
  id: string;
  category: "movie" | "tv";       // needed for routing and API calls
  poster_path: string;
  original_title: string;          // movie title
  name: string;                    // tv show name
  overview: string;
  backdrop_path: string;
}
```

This matches the existing `IMovie` interface plus the `category` field. Storing these fields means the Watchlist page can render cards without making any API calls.

localStorage key: `"watchlist"`
Format: `JSON.stringify(WatchlistItem[])`

## Design Approach

### State Management — React Context

Create a new `WatchlistContext` (same pattern as the existing `ThemeContext` and `GlobalContext`):

```
src/context/watchlistContext.tsx
```

**Provided values:**

| Name | Type | Description |
|------|------|-------------|
| `watchlist` | `WatchlistItem[]` | Current watchlist items |
| `addToWatchlist(item)` | `(WatchlistItem) => void` | Add an item |
| `removeFromWatchlist(id)` | `(string) => void` | Remove by id |
| `isInWatchlist(id)` | `(string) => boolean` | Check if item is saved |

**Why Context over Redux/RTK?** The existing app already uses Context for global UI state (GlobalContext, ThemeContext). The watchlist is simple client-side state with no async fetching — Context + localStorage is the right tool. No new dependencies needed.

### New Files

| File | Purpose |
|------|---------|
| `src/context/watchlistContext.tsx` | Context provider, localStorage sync, add/remove/check logic |
| `src/pages/Watchlist/index.tsx` | Watchlist page component |
| `src/common/WatchlistButton/index.tsx` | Reusable add/remove toggle button |

### Modified Files

| File | Change |
|------|--------|
| `src/main.tsx` | Wrap app with `WatchlistProvider` |
| `src/App.tsx` | Add `/watchlist` route |
| `src/constants/index.ts` | Add watchlist nav link |
| `src/common/MovieCard/index.tsx` | Add `WatchlistButton` overlay |
| `src/pages/Detail/index.tsx` | Add `WatchlistButton` next to movie info |
| `src/common/index.ts` | Export `WatchlistButton` |
| `src/types.d.ts` | Add `WatchlistItem` interface |

## Implementation Plan

Build incrementally so each step is independently testable.

### Step 1: Data layer — WatchlistContext

Create `src/context/watchlistContext.tsx`:

- Initialize state from `localStorage.getItem("watchlist")`.
- `addToWatchlist`: append item, deduplicate by `id`, write to localStorage.
- `removeFromWatchlist`: filter out by `id`, write to localStorage.
- `isInWatchlist`: check if `id` exists in the array.
- Wrap state updates with `useCallback` for stable references.

Add the `WatchlistProvider` to `src/main.tsx` (alongside the existing providers).

Add `WatchlistItem` to `src/types.d.ts`.

**How to test:** Open React DevTools or the browser console. Call the context methods and verify localStorage updates under the `watchlist` key.

### Step 2: WatchlistButton component

Create `src/common/WatchlistButton/index.tsx`:

- Accepts `item: WatchlistItem` (the movie/show data + category).
- Accepts an optional `className` prop for positioning variants.
- Reads `isInWatchlist(item.id)` from context.
- On click: calls `addToWatchlist` or `removeFromWatchlist`.
- Renders a bookmark icon — outlined when not saved, filled when saved.
- Uses `react-icons` (already installed): `BsBookmark` / `BsBookmarkFill`.
- `e.preventDefault()` + `e.stopPropagation()` to avoid triggering parent `<Link>` navigation on the MovieCard.

Export from `src/common/index.ts`.

**How to test:** Import the button into any existing page temporarily, click it, and confirm the icon toggles and localStorage updates.

### Step 3: Add WatchlistButton to MovieCard

Modify `src/common/MovieCard/index.tsx`:

- Accept `category` (already passed as a prop).
- Build a `WatchlistItem` from the movie prop + category.
- Render `WatchlistButton` positioned absolute in the top-right corner of the card.
- Show on hover (use the existing `group-hover` pattern).

**How to test:** Hover over any movie card on the Home or Catalog page. Click the bookmark icon. Refresh the page — the icon should remain filled for saved items.

### Step 4: Add WatchlistButton to Detail page

Modify `src/pages/Detail/index.tsx`:

- Build a `WatchlistItem` from the fetched show data + category param.
- Render `WatchlistButton` inline next to the movie title/info area.

**How to test:** Navigate to any movie detail page. Click the button. Navigate away and back — state should persist.

### Step 5: Watchlist page

Create `src/pages/Watchlist/index.tsx`:

- Read `watchlist` from context.
- Render items in a grid using `MovieCard` (same grid layout as the Catalog page).
- If empty, show a message like "Your watchlist is empty" with a link to `/movie`.
- Each card gets its `category` from the stored `WatchlistItem.category`.

Add to `src/App.tsx`:
- Lazy-load: `const Watchlist = lazy(() => import("./pages/Watchlist"))`.
- Route: `<Route path="/watchlist" element={<Watchlist />} />`.

**How to test:** Save a few movies/shows from different pages. Navigate to `/watchlist`. Verify they all appear. Remove one — it should disappear from the grid.

### Step 6: Navigation link

Modify `src/constants/index.ts`:

- Add a watchlist entry to `navLinks` with path `/watchlist` and an appropriate icon (`BsBookmark` from `react-icons`).

**How to test:** The watchlist link should appear in the header and mobile sidebar. Clicking it navigates to the Watchlist page.

## Tech Stack

No new dependencies. Everything uses what's already in the project:

| Need | Solution | Already installed? |
|------|----------|--------------------|
| State management | React Context + useState | Yes (React) |
| Persistence | localStorage | Built-in browser API |
| Icons | react-icons (`BsBookmark`, `BsBookmarkFill`) | Yes |
| Routing | react-router-dom | Yes |
| Styling | Tailwind CSS | Yes |
| Types | TypeScript | Yes |

## Edge Cases

- **Duplicate adds**: `addToWatchlist` deduplicates by `id` before appending.
- **Stale data**: Poster URLs and titles are stored at save time. If TMDB updates metadata later, the card shows the original data. This is acceptable — clicking through to the Detail page always fetches fresh data.
- **localStorage unavailable**: If localStorage throws (e.g., private browsing on some browsers), catch the error and fall back to in-memory-only state. The watchlist works for the session but won't persist.
- **Corrupt localStorage**: Wrap `JSON.parse` in a try/catch. If parsing fails, reset to an empty array.
