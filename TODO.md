# Tech Debt & Roadmap

Prioritized list of improvements, grouped by category.

## Cleanup

- [ ] **Unify form handling** — `DateInputs.tsx` still uses `react-hook-form` + `zod` while `AbsenceForm.tsx` was refactored to plain `useState`. Pick one approach and apply it consistently. If removing react-hook-form, also remove `@hookform/resolvers`, and evaluate whether `zod` / `schemas/forms.ts` are still needed.
- [ ] **Remove `seed.spec.ts` placeholder** — the file is a no-op; either give it real purpose or delete it.

## Testing

- [ ] **Component unit tests** — no React components have unit tests (only `calculations.ts` and the Redux slice). Add tests for `CitizenshipCard`, `PRStatusCard`, `ResidencyCard`, `AbsenceForm`, `DateInputs`, and `DataManager`.
- [ ] **Hook unit tests** — `useFileHandling` and `useTheme` are untested.
- [ ] **Raise coverage thresholds** — currently only `utils/` has a 95% threshold; set global minimums once component/hook tests exist.

## UX

- [ ] **Auto-save to localStorage** — state is lost on refresh unless the user manually exports. Persist the Redux store (or a slice of it) to localStorage automatically.
- [ ] **Replace `alert()` with toast notifications** — `DataManager.tsx` uses `alert()` for import/export errors. Use a toast component (shadcn/ui has one) for non-blocking feedback.
- [ ] **Keyboard navigation audit** — axe-core catches structural a11y issues, but manual keyboard-only walkthrough hasn't been done.

## Performance

- [ ] **Lighthouse CI performance score** — currently 0.73, below the 0.80 warn threshold. Profile and address: code-split heavy deps, lazy-load cards, optimize initial bundle.
- [ ] **Memoize calculation results** — `CalculationEngine` recalculates on every state change; consider moving it to a Redux middleware or using `useMemo`/`createSelector` for derived data.

## Security

- [ ] **Validate imported JSON against a schema** — `DataManager.tsx` blindly trusts the shape of imported files. Validate with Zod (or a runtime check) before dispatching `loadSavedData`.

## Upgrades

- [ ] **React 19** — still on React 18.3; evaluate upgrade path for concurrent features and the new `use` hook.
- [ ] **Evaluate `CalculationEngine` as a hook** — it's currently a renderless component; a custom hook or Redux middleware would be a more idiomatic pattern.
