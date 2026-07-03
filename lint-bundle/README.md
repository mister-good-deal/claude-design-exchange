# Tatami DS — portable `@stylistic` formatter (for Claude Design)

Run this on your `ui/` output **before zipping the export** so it matches the Tatami app's exact `@stylistic`
dialect. This ends the formatter round-trips (`semi-style`, `arrow-parens`, semicolons, indent…) that have needed
per-drop fixes.

## Use

Drop `eslint.config.mjs` + `package.json` at the root of your DS workspace (next to `ui/`), then:

```bash
npm install
npm run fix      # eslint --fix — auto-normalizes the bulk of @stylistic
npm run check    # MUST print 0 — hand-fix any non-auto-fixable residual (below)
```

## Non-auto-fixable rules to watch (these are what kept coming back)

`eslint --fix` clears most rules, but a few need a manual edit — `npm run check` must reach **0**:

- **`@stylistic/semi-style`** — semicolons go at the **end of a line, never the start**. A hoisted static element
  wrapped in parens fails:
  ```tsx
  const ICON = (          // ✗ the `);` lands on its own line
      <svg …/>
  );
  const ICON =            // ✓ drop the parens, `;` on the closing-tag line
      <svg …/>;
  ```
- **`@stylistic/no-confusing-arrow`** — wrap a conditional arrow body: `x => (a ? b : c)`.
- **`@stylistic/multiline-ternary`** — nested/long ternaries sometimes need the line breaks added by hand.

## Scope

This bundle is **formatter-only** (`@stylistic`). The app additionally enforces, and you already satisfy these via
your `tsc`-clean output + the `react-doctor` pass — keep doing so, they are **not** in this config:

- `tsc` strict incl. `exactOptionalPropertyTypes` (optional/callback props typed `?: T | undefined`).
- `typescript-eslint` type-aware rules — notably `consistent-type-imports` (use `import type { … }`).
- `react-doctor` at full strictness — **0 diagnostics**.

So: **`npm run check` == 0** here, `tsc` clean, `react-doctor` clean → the export drops into the app with zero
hand-edits.
