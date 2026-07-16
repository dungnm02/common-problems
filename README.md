# common-problems

Solutions to common **front-end patterns problems** — the kind that show up in
interviews and real work. Every solution is written in **TypeScript**, runs in a
**Vite + React** app, and is covered by **Vitest** tests.

## Getting started

```bash
npm install
npm test          # run all tests once
npm run test:watch
npm run dev       # gallery of components with a UI
npm run typecheck
```

## Structure

Solutions are grouped by category. Each lives in its own folder next to its test.

```
src/
  js-patterns/       Vanilla JS interview utilities
    debounce/        debounce with leading/trailing, cancel, flush, pending
  react-patterns/    Reusable React patterns
    compound-tabs/   Compound components via Context (Tabs/TabList/Tab/TabPanel)
  redux-patterns/    Redux state-architecture patterns
    sync-derived-data/  Source-of-truth + normalized cache joined on read
  ui-components/      Built-from-scratch accessible widgets
    autocomplete/    Combobox with keyboard nav + ARIA
```

## Solved so far

| Category      | Problem          | Highlights                                              |
| ------------- | ---------------- | ------------------------------------------------------- |
| JS utilities  | `debounce`       | leading/trailing edges, `cancel`/`flush`/`pending`, `this` |
| React pattern | Compound `Tabs`  | Context sharing, controlled/uncontrolled, ARIA tablist  |
| Redux pattern | Sync derived data | normalized cache + selector join on read + listener middleware; no manual sync |
| UI component  | `Autocomplete`   | substring filter, Up/Down/Enter/Escape, `aria-activedescendant` |

## Adding a new solution

1. Create `src/<category>/<name>/<Name>.ts(x)` with the solution.
2. Add `src/<category>/<name>/<Name>.test.ts(x)` with tests.
3. Run `npm test`. Add it to the table above.
