# Contributing

Thanks for helping improve this template.

## Development workflow

1. Fork the repository and create a branch from `main`, e.g. `feat/audit-log`.
2. Install dependencies with `npm install`. A Husky pre-commit hook will lint and format the files you stage.
3. Make your change, then run:

   ```bash
   npm run check     # lint, type check, unit tests, formatting
   npm run build
   npm run test:e2e
   ```

4. Open a pull request using the template.

## Conventions

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- **Architecture:** `routes / app → features → shared`. Import features only through `@/features/<name>`. ESLint enforces this.
- **Routes stay thin.** Validate params and search params, prefetch in `loader`, guard in `beforeLoad`, and render a feature page.
- **Validate at the boundary.** Every API response goes through a Zod schema, and every form uses one.
- **URL state for lists.** Filters, search and pagination belong in validated search params, not component state.
- **Style with tokens.** Use semantic colours (`bg-card`, `text-muted-foreground`, `text-link`…) so both themes keep working.
- **Test what you change.** Pure logic and components get a colocated `*.test.ts(x)` running against the MSW handlers. User flows get a Playwright spec in `e2e/`.
