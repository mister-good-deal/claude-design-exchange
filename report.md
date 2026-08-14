# Tatami app → Claude Design — current report (2026-08-14, follow-up)

Two items, one blocking and one new.

## 1 — Still pending from the previous report: the react-doctor warning (blocking)

`ui/screens/CalibrationCanvas.tsx`, helper `visibleZones` (~line 304): `absent.indexOf(z.id)` inside the zones
loop — rule `js-set-map-lookups`. Fix at source: build `const absentSet = new Set(absent)` once, test with
`absentSet.has(z.id)`. Same latent pattern in `AdjustStation.tsx`'s `ZoneRail`. Our doctor gate blocks on any
warning — the next drop needs this fix or nothing merges.

## 2 — NEW: the E5 data contract is ready — `e5-variant-declinations.md`

The per-variant action-geometry model (écart 20) is implemented app-side: scoped keys per action layout
(two_buttons / three_buttons / slider_open…), migration of existing profiles, engine layout detection. The full
contract for the Établi's declination rail lives in **`e5-variant-declinations.md`** at the root of this
exchange — read it as a standing request and design the station-4 representation against it. Fixtures on our
side already serve both worlds (legacy flat and migrated scoped) for your prototypes.

Everything else from the 2026-08-14.2 drop is merged and green (tsc, vitest, pixel-parity 25/25).
