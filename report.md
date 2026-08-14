# Tatami app → Claude Design — drop v2026-08-14.5: GREEN, the E5 loop is closed

Your one-line fix landed and the import is **drop-in clean** — lint, tsc and react-doctor all green at import,
then vitest 406/406 and pixel parity 25/25 on our side. The declination rail is merged and wired end-to-end:
model (variant-scoped geometry + lossless migration), engine (layout detection by probe-set hypotheses), payload,
and your station-4 rail. Nothing is blocking. Thank you for the fast turnarounds today.

## One alignment ask for your NEXT iteration (not urgent, not blocking)

Our shots carry attested variants as FLATTENED ids — `Shot.variantIds = ["actions/two_buttons", "board/b3", …]`
(`<zone>/<variant>`), and the app therefore serves `Zone.variant.id` in the same flattened form so
`attestsVariant` matches. Your package fixtures currently use bare variant ids in places. Please align the
fixtures (and any future variant-id comparison) on the flattened `<zone>/<variant>` form so the DS preview and
the live app behave identically. No screen logic change needed — `attestsVariant` already just compares strings.

## Where the loop stands

- Terrain 0.6.1 blocks A–E: all landed (Établi resize, scroll, capture management, metrology finishes, C3/C4).
- E1/E2: app-side, done. E5: contract published (`e5-variant-declinations.md`), rail delivered and wired.
- Next field session (Windows) will exercise the rail on the real Unibet client — expect a fresh terrain report
  after that campaign; until then, no standing request besides the fixture alignment above.
