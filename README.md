# Canadian PR Planner

Track your Canadian Permanent Residency status, Citizenship eligibility, and Residency requirements.

**[Live App](https://SamyZarour.github.io/immigration-checker)**

## Features

- Calculate days of physical presence in Canada for citizenship eligibility
- Track PR status and risk of losing permanent residency
- Monitor tax residency requirements (183-day rule)
- Log absences with automatic overlap merging (IRCC-compliant boundary day rules)
- Export/import your data as JSON for backup and portability

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 7
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Redux Toolkit
- **Forms:** React Hook Form + Zod validation
- **Testing:** Vitest (unit) + Playwright (E2E)
- **CI/CD:** GitHub Actions (lint, test, build, release, deploy)
- **Release:** Semantic Release with Conventional Commits

## Getting Started

### Prerequisites

- Node.js 22 (see `.nvmrc`)
- [pnpm](https://pnpm.io/) 10+

### Setup

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:5173/immigration-checker/`.

## Scripts

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Start development server            |
| `pnpm build`         | Type-check and build for production |
| `pnpm preview`       | Preview production build locally    |
| `pnpm lint`          | Run ESLint                          |
| `pnpm lint:fix`      | Run ESLint with auto-fix            |
| `pnpm format`        | Format code with Prettier           |
| `pnpm format:check`  | Check formatting without writing    |
| `pnpm test:unit`     | Run unit tests                      |
| `pnpm test:coverage` | Run unit tests with coverage        |
| `pnpm test:e2e`      | Run Playwright E2E tests            |
| `pnpm test:e2e:ui`   | Run E2E tests with Playwright UI    |

## Project Structure

```
src/
├── components/       # React components
│   └── ui/           # shadcn/ui primitives
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries (shadcn utils)
├── schemas/          # Zod validation schemas
├── store/            # State management (atoms/slices)
└── utils/            # Core business logic (calculations)
tests/
├── unit/             # Vitest unit tests
├── e2e/              # Playwright E2E tests
└── fixtures/         # Test data
```

## Roadmap & Tech Debt

See [TODO.md](TODO.md) for the prioritized list of improvements covering cleanup, testing gaps, UX, performance, security, and upgrades.

## Deployment

The app is deployed to GitHub Pages automatically on each release. See [DEPLOYMENT.md](DEPLOYMENT.md) for manual deployment instructions and troubleshooting.

## License

[MIT](LICENSE)
