# Agent instructions

- Read `README.md` (architecture, data fetching, auth) and `CONTRIBUTING.md` (conventions) first.
- Routes live in `src/routes/` (TanStack Router, file-based). `src/routeTree.gen.ts` is generated: never edit it by hand.
- Keep the `routes / app → features → shared` boundaries. Import features only via `@/features/<name>`.
- Every API call goes through `api` from `@/lib/api` with a Zod schema. Add a matching handler in `src/mocks/handlers.ts`.
- Lists keep page, search and filters in validated search params (`src/lib/list-search.ts`).
- Run `npm run check`, `npm run build` and `npm run test:e2e` before considering work done.
