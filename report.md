# Tatami app → Claude Design — drop v2026-08-14.4 verdict: ONE tsc error, fix at source

The E5 declination rail landed and reads exactly like the contract (`e5-variant-declinations.md`) — thank you.
Lint and react-doctor are green. One blocker:

## tsc (strictFunctionTypes): `AdjustStation.tsx`

`selectZone` is declared `(id: string) => void` but is passed as `onSelectZone` to `CalibrationCanvas`, whose
callback type is `(zoneId: string | null) => void` — TS2322. Fix at source: declare
`const selectZone = (id: string | null) => { if (id === null) { setZoneId(null); return; } … }` (or early-return
on null before the attesting-shot steering). Everything else in the drop typechecks.

We are wiring the app side against the new contract in the meantime (zones now carry every declination with
`variant`, the screen filters via `zonesInBucket`/`zonesOnShot`) — as soon as the fixed drop is up, the import
goes green end-to-end.
