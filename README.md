# React.js Template

A production-grade **React 19 + TypeScript** single-page app starter, built with **Vite**, **TanStack Router**, **TanStack Query** and **Tailwind CSS v4**. It ships as a working admin dashboard (sign-in, dashboard, user management, settings) on top of a mock REST API, so it runs with no backend.

![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

> All data in this repository (the "Acme" brand, users, emails and figures) is generated placeholder data.
> Looking for server rendering and SEO? See the companion [Next.js Template](https://github.com/masabqurban/Next.js-Template).

## Contents

- [Highlights](#highlights)
- [Use this template](#use-this-template)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Data fetching](#data-fetching)
- [Authentication](#authentication)
- [Mock API](#mock-api)
- [Performance](#performance)
- [Security](#security)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Deployment](#deployment)
- [Customising the template](#customising-the-template)

## Highlights

| Area         | What's included                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Routing**  | File-based, fully type-safe routes (TanStack Router): typed links, params and validated search params, auth guards, per-route code splitting, prefetch on hover |
| **Data**     | TanStack Query with loaders that prefetch in parallel, query-key factories, targeted invalidation, and a fetch client that validates every response with Zod    |
| **Forms**    | react-hook-form + Zod: one schema for validation and types, with server errors mapped onto the right field                                                      |
| **Auth**     | Access token in memory, tab-scoped refresh token, single-flight refresh on 401, safe post-login redirects                                                       |
| **UI**       | Tailwind v4 design tokens, light / dark / system theme with no flash, Radix primitives for dialogs and menus                                                    |
| **Mocking**  | Mock Service Worker: one set of handlers for the browser, Vitest and the e2e suite                                                                              |
| **Quality**  | Strict TypeScript, ESLint (`strictTypeChecked`, hooks, jsx-a11y, import boundaries), Prettier, React Compiler                                                   |
| **Testing**  | Vitest + Testing Library (unit and component), Playwright (e2e on desktop and mobile), axe checks in light and dark mode                                        |
| **Delivery** | GitHub Actions CI, Dependabot, Docker (unprivileged nginx), Vercel config, strict CSP verified by the e2e suite                                                 |

## Use this template

**1. Create your repository.** Click **Use this template → Create a new repository** at the top of this page. Your new repository gets a clean history and no link back to this one. Or use the GitHub CLI:

```bash
gh repo create my-app --template masabqurban/React.js-Template --private --clone
cd my-app
```

Prefer no Git history at all? Run `npx degit masabqurban/React.js-Template my-app`.

**2. Install and run it.**

```bash
npm install
npm run dev    # http://localhost:5173, demo@example.com / password123 on the mock API
```

**3. Make it yours.**

- `package.json`: change `"name"` from `reactjs-template`.
- `VITE_APP_NAME` in `.env.example`, the colour tokens in `src/index.css`, and `public/favicon.svg`.
- `src/config/navigation.ts` for the sidebar.
- Replace the copyright holder in `LICENSE` (or choose another license), and rewrite this README for your project.

**4. Remove what you don't need.** The demo is there to show the patterns end to end. Keep the parts you'll build on and delete the rest:

- **Connect your API:** set `VITE_API_URL` in `.env.local`. The mock API switches off automatically, and `src/mocks/` stays available for tests and offline work. Adjust the Zod schemas in each feature's `schemas/` to match your contracts.
- Delete a demo screen by removing its `src/features/<name>/` folder, its route files under `src/routes/_app/` and its nav item. The route tree regenerates and `npm run typecheck` shows what's left to fix.
- Pair it with the [Node.js Template](https://github.com/masabqurban/Node.js-Template), which implements the same API contract.

**5. Turn on the repository settings.** In **Settings → Code security**, enable Dependabot alerts and private vulnerability reporting (`SECURITY.md` points reporters there). CI in `.github/workflows/` runs on your first push with no secrets required. Add branch protection on `main` that requires it to pass.

## Getting started

Requirements: **Node.js 22+** (24 recommended, see `.nvmrc`).

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with the demo account:

| Email              | Password      |
| ------------------ | ------------- |
| `demo@example.com` | `password123` |

No `.env` file is needed: without `VITE_API_URL`, the mock API is switched on automatically. To configure the app, copy `.env.example` to `.env.local`.

## Scripts

| Command                                         | Description                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`                                   | Start the dev server                                                      |
| `npm run build`                                 | Type-check and build for production                                       |
| `npm run preview`                               | Serve the production build locally (with the production security headers) |
| `npm run lint` / `lint:fix`                     | Lint with ESLint                                                          |
| `npm run typecheck`                             | Generate the route tree and run `tsc`                                     |
| `npm run format` / `format:check`               | Format with Prettier                                                      |
| `npm run test` / `test:watch` / `test:coverage` | Unit and component tests with Vitest                                      |
| `npm run test:e2e`                              | End-to-end tests with Playwright (run `npm run build` first)              |
| `npm run check`                                 | Lint, type check, tests and formatting in one go                          |

## Project structure

```text
src/
├── app/                    App wiring: router, providers, router context
├── routes/                 File-based routes (thin: params, loaders, guards)
│   ├── __root.tsx          Restores the session before any guard runs
│   ├── login.tsx
│   ├── _app.tsx            Signed-in layout + auth guard
│   └── _app/               Dashboard, users, users/$userId, settings
├── features/               Product features, each with a public index.ts
│   ├── auth/               api/ · components/ · lib/ · schemas/ · session-store.ts
│   ├── dashboard/
│   ├── settings/
│   └── users/              api/ (queries + mutations) · components/ · schemas/
├── components/             Shared UI: ui/ primitives, layout/, page-level pieces
├── config/                 env.ts (validated), navigation.ts
├── hooks/                  Shared hooks
├── lib/                    api/ (HTTP client, query client, tokens), theme, formatting, URL state
├── mocks/                  Mock backend: seeded db + MSW handlers (browser and Node)
├── test/                   Vitest setup and render helpers
└── main.tsx                Entry: starts mocks (if enabled), then renders
e2e/                        Playwright: auth, users CRUD, settings, accessibility
```

## Architecture

**Dependencies flow one way: `routes / app → features → shared`.** ESLint fails the build if shared code imports a feature, a feature imports a route, or the mock backend imports UI code.

- **Routes are thin.** They validate params and search params, prefetch data in a `loader`, guard access in `beforeLoad`, and render a page component from a feature.
- **Features have a public API.** Other code imports `@/features/users`, never `@/features/users/components/...`, so a feature's internals can change freely.
- **Pages get URL state as props.** `UsersPage` receives `search` and `onSearchChange` from its route, so the page doesn't depend on the router and is easy to test.
- **Shared components take data, not features.** `AppShell` receives the user and a sign-out callback as props instead of importing the auth feature.

## Data fetching

- **One HTTP client** (`src/lib/api/http-client.ts`): timeouts, abort signals, a normalised `ApiError`, and a **Zod schema on every request**. If the backend changes a contract, you get a clear `INVALID_RESPONSE` error instead of a crash deep in a component.
- **Loaders prefetch, components read.** Route loaders call `queryClient.query(...)` (the dashboard fetches two queries in parallel), so data starts loading on link hover and pages render with `useSuspenseQuery` without loading waterfalls.
- **Query-key factories** (`userKeys`) let mutations invalidate exactly the lists or records they affect. Edits write straight into the detail cache.
- **URL state for lists.** Page, search and filters are validated search params (`?page=2&q=jane&role=admin`). They survive reloads, can be shared, and work with the back button. Invalid values fall back to defaults instead of showing an error page.
- **Sensible defaults.** Client errors (4xx) and mutations are never retried automatically, and search input is debounced.

## Authentication

| Concern       | Approach                                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Access token  | Memory only, never in `localStorage`                                                                                                           |
| Refresh token | `sessionStorage`: scoped to the tab, restores the session after a reload. Prefer an httpOnly cookie if your API supports one                   |
| Expired token | The client refreshes once on 401 and retries. Concurrent 401s share a single refresh call                                                      |
| Guards        | `beforeLoad` in `_app.tsx` redirects to `/login?redirect=…`. The redirect target is checked by `safeRedirectPath`, which blocks open redirects |
| Sign-out      | Revokes the token, clears the session and empties the query cache, so the next user of the device sees nothing                                 |

Route guards only control the UI. Your API must authorise every request itself.

## Mock API

`src/mocks/` is a small REST backend built on [Mock Service Worker](https://mswjs.io): a seeded in-memory database and handlers for `/auth/*`, `/me`, `/dashboard/summary` and `/users`, with simulated latency, validation errors (`EMAIL_TAKEN`) and expiring tokens.

- **Browser:** loaded with a dynamic import only when mocks are enabled, so it never reaches production bundles that use a real API.
- **Vitest:** the same handlers run in Node (`src/mocks/node.ts`), so component tests exercise the real HTTP client.
- **Contract boundary:** the mocks never import frontend code. The UI validates mock responses exactly as it would real ones.

**Going live:** set `VITE_API_URL`. Mocks switch off automatically, and the request paths in each feature's `api/` folder are the endpoints your backend needs to implement.

## Performance

- **Route-based code splitting** (`autoCodeSplitting`): each screen is its own chunk, loaded on demand and prefetched on hover.
- **React Compiler** handles memoisation, so there is no hand-written `useMemo` or `useCallback`.
- **No heavy dependencies where CSS will do.** The dashboard chart is plain CSS with an accessible data table behind it, and menus and selects use native elements wherever possible.
- **Self-hosted variable font** via Fontsource: no third-party font request.
- **Caching:** hashed `/assets/*` are immutable for a year, and `index.html` is always revalidated (see `nginx.conf.template` and `vercel.json`).

## Security

| Measure                                                                                       | Where                                                  |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Strict CSP: `script-src 'self'` with no inline scripts (the theme script is an external file) | `vite.config.ts`, `nginx.conf.template`, `vercel.json` |
| HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`             | same                                                   |
| The production build runs under these headers in the e2e suite, so a CSP regression fails CI  | `playwright.config.ts` → `vite preview`                |
| Validated, public-only env vars (no secrets in `VITE_*`)                                      | `src/config/env.ts`                                    |
| Tokens out of `localStorage`, open-redirect protection, cache cleared on sign-out             | `src/lib/api`, `src/lib/safe-redirect.ts`              |
| Production dependency audit in CI, weekly Dependabot updates                                  | `.github/`                                             |

## Accessibility

- A skip link, landmark regions and a document title on every screen (React 19 `<title>`).
- Labels, hints and errors linked to inputs (`FormField` sets `aria-invalid` and `aria-describedby`).
- Radix dialogs and menus handle focus trapping, Escape and keyboard navigation.
- Visible focus rings, reduced-motion support, and colour tokens checked for contrast in both themes.
- [axe-core](https://github.com/dequelabs/axe-core) runs against every screen in **light and dark mode** and fails on serious or critical WCAG 2.2 AA issues.

## Testing

```bash
npm run test       # Vitest: HTTP client, URL state, formatting, login and user forms
npm run build
npm run test:e2e   # Playwright: desktop + mobile against the production build
```

Component tests render real features against the MSW handlers, with no mocking of modules. End-to-end tests cover guarded redirects, session restore, sign-out, URL-driven filters, pagination, the full create/edit/delete flow, validation, 404s, theme persistence and accessibility.

## Deployment

**Vercel / Netlify / any static host:** run `npm run build` and serve `dist/`. Every route must fall back to `index.html` (`vercel.json` already does this).

**Docker:**

```bash
docker build -t reactjs-template --build-arg VITE_API_URL=https://api.example.com .
docker run -p 8080:8080 -e API_ORIGIN=https://api.example.com reactjs-template
```

The image serves the build with unprivileged nginx on port 8080, includes a `/healthz` check, and adds `API_ORIGIN` to the CSP `connect-src` at startup.

### Environment variables

All `VITE_*` values are inlined at build time and are **public**.

| Variable            | Default                                     | Description                            |
| ------------------- | ------------------------------------------- | -------------------------------------- |
| `VITE_API_URL`      | (none)                                      | Base URL of your REST API              |
| `VITE_ENABLE_MOCKS` | `true` without an API URL, `false` with one | Force the mock API on or off           |
| `VITE_APP_NAME`     | `Acme Admin`                                | Shown in the UI and the document title |

## Customising the template

1. **Brand:** edit the colour tokens in `src/index.css`, `public/favicon.svg` and `VITE_APP_NAME`.
2. **Navigation:** edit `src/config/navigation.ts` (paths are type-checked against the routes).
3. **Connect your API:** set `VITE_API_URL`, then adjust the Zod schemas in each feature's `schemas/` to match your contracts.
4. **Add a screen:** create `src/features/<name>/` with an `index.ts`, add a route file under `src/routes/_app/`, and add a nav item. The route tree regenerates automatically.
5. **Error tracking:** report errors from `RouteError` in `src/components/route-status.tsx` to Sentry or a similar service.

## License

[MIT](./LICENSE)
