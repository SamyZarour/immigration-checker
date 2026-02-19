# Contributing

Thanks for your interest in contributing to Canadian PR Planner!

## Development Setup

### Prerequisites

- Node.js 22 (see `.nvmrc` -- use `nvm use` or `fnm use` to activate)
- [pnpm](https://pnpm.io/) 10+

### Getting Started

```bash
git clone https://github.com/SamyZarour/immigration-checker.git
cd immigration-checker
pnpm install
pnpm dev
```

## Branch Naming

Use descriptive, kebab-case branch names prefixed with a category:

- `feat/add-absence-calendar`
- `fix/date-calculation-leap-year`
- `chore/upgrade-dependencies`
- `docs/update-readme`

## Commit Messages

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint. Every commit message must follow this format:

```
type(scope): description
```

Examples:

- `feat(calculations): add support for partial-year temp credit`
- `fix(ui): prevent overlapping absence form submission`
- `chore(deps): bump tailwindcss to v4.3`
- `docs: update contributing guide`

Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`, `revert`.

## Code Quality

Pre-commit hooks automatically run:

1. **lint-staged** -- ESLint + Prettier on staged files
2. **Test coverage** -- Full unit test suite with coverage thresholds

To run checks manually:

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier
pnpm test:unit     # Unit tests
pnpm test:coverage # Unit tests with coverage
pnpm test:e2e      # Playwright E2E tests
pnpm build         # TypeScript + Vite build
```

## Pull Requests

1. Create a branch from `main`
2. Make your changes
3. Ensure all checks pass locally (`pnpm lint && pnpm test:unit && pnpm build`)
4. Push and open a PR against `main`
5. Fill out the PR template
6. Wait for CI to pass and a review

## Architecture

- **`src/utils/calculations.ts`** -- Core business logic (IRCC-compliant date calculations)
- **`src/store/`** -- Redux Toolkit store, slice, and typed hooks
- **`src/components/`** -- React components (UI in `ui/` subdirectory via shadcn)
- **`src/schemas/`** -- Zod validation schemas
- **`tests/unit/`** -- Vitest unit tests
- **`tests/e2e/`** -- Playwright end-to-end tests
