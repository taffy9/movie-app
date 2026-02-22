# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Vite, hot reload)
- **Build:** `npm run build` (runs `tsc && vite build`)
- **Preview production build:** `npm run preview`
- **No test runner is configured.** There are no test scripts, no testing libraries installed, and no test files.

## Environment Variables

Create a `.env` file in the project root:

```
VITE_API_KEY=<tmdb-api-key>
VITE_TMDB_API_BASE_URL=https://api.themoviedb.org/3
```

Optional: `VITE_GA_MEASUREMENT_ID`, `VITE_GOOGLE_AD_CLIENT`, `VITE_GOOGLE_AD_SLOT`.

## Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS

**Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### Routing

React Router v6 with lazy-loaded pages:
- `/` — Home (hero carousel + content sections)
- `/:category` — Catalog (movie or tv listing with search + pagination)
- `/:category/:id` — Detail (single movie/show info, cast, trailers, similar)
- `*` — 404

The `category` param is either `"movie"` or `"tv"` and is used throughout the app to build TMDB API paths and navigation links.

### Data Fetching

RTK Query (`src/services/TMDB.ts`) with two endpoints:
- `useGetShowsQuery` — lists, search results, and similar shows
- `useGetShowQuery` — single item with appended videos and credits

API key is passed as a query parameter directly in endpoint URLs, not via headers.

### State Management

No Redux store — the app uses `ApiProvider` from RTK Query (not a full Redux `Provider`). All other global state is managed through React Context:

- `GlobalContext` (`src/context/globalContext.tsx`) — video modal state, sidebar toggle, trailer fetching
- `ThemeContext` (`src/context/themeContext.tsx`) — dark/light/system theme with localStorage persistence

### Component Organization

- `src/common/` — shared components, each in its own folder with an `index.tsx`. Barrel-exported from `src/common/index.ts`.
- `src/pages/` — page components, each with a local `components/` subfolder and barrel export.
- `MovieCard` is the core reusable display unit — used on Home, Catalog, and Detail pages.

### Styling

Tailwind CSS with class-based dark mode (`darkMode: "class"` in `tailwind.config.cjs`). The `cn()` utility (`src/utils/helper.ts`) merges classnames via `clsx` + `tailwind-merge`. Custom colors, fonts (Nunito, Roboto), and a `xs: 380px` breakpoint are defined in the Tailwind config.

### Types

`src/types.d.ts` defines the shared interfaces (`IMovie`, `INavLink`, `ITheme`). This is an ambient declaration file — types are imported from `@/types` without a file extension.

### Animations

Framer Motion with `LazyMotion` + `domAnimation` for tree-shaking. The `useMotion` hook disables animations on mobile (<768px) and when `prefers-reduced-motion` is active.

## Development Practices

### Testing

- Write tests for each implementation step before moving on to the next. Verify each piece works in isolation before building on top of it.
- No test framework is installed yet. When adding one, use Vitest (already compatible with the Vite toolchain) and React Testing Library.
- Test context providers by verifying state changes (e.g., localStorage updates, re-renders with new values).
- Test components that depend on context by wrapping them in the relevant provider during tests.
- Run `npm run build` to catch TypeScript errors — this is the closest thing to a CI check until tests are set up.

### Commits

- Make small, focused commits — one logical change per commit.
- Commit after each working step, not after an entire feature is done.
- Use descriptive messages that explain *why*, not just *what*: `"Add WatchlistContext with localStorage persistence"` not `"update context"`.
- Prefix with the type of change: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`.

### Following Existing Patterns

- **New context:** Follow the `GlobalContext`/`ThemeContext` pattern — create the context with a default value, export a provider component, and export a `useXxxContext` hook. Add the provider in `main.tsx` alongside the existing ones.
- **New pages:** Lazy-load in `App.tsx` with `const Foo = lazy(() => import("./pages/Foo"))`. Put sub-components in a local `components/` folder with a barrel `index.ts`.
- **New shared components:** Create a folder under `src/common/` with an `index.tsx`, then add the export to `src/common/index.ts`.
- **New types:** Add interfaces to `src/types.d.ts` with the `I` prefix convention (e.g., `IWatchlistItem`).
- **Styling:** Use Tailwind utility classes. Use `cn()` from `src/utils/helper.ts` for conditional classes. Always support dark mode with `dark:` variants.
- **Icons:** Use `react-icons` — the project already depends on it. Import from the specific icon set (e.g., `react-icons/bs`).

### Code Quality

- Run `npm run build` before considering a change complete — it runs both `tsc` and `vite build`, catching type errors and build issues.
- Use `React.memo` for components that receive stable props but sit inside frequently re-rendering parents (existing pattern in `Section`, `Casts`).
- Use `useCallback` for functions passed as context values or props to memoized children.
- Keep components focused — if a component handles both data fetching and presentation, split it.
- Use the `@/` path alias for all imports from `src/`. Never use relative paths that climb more than one level (`../../`).
