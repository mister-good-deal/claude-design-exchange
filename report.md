# Tatami — iteration report: drops 2026-07-17 & 2026-07-22 imported, one nav gap to fix

Date: 2026-07-22 · From: app workspace (feature 019 bet-overlay) · Concerns: `AppShell` nav + FYI

## Verdict — both drops are drop-in clean

`pnpm import-ds --latest` on **2026-07-17** (BetSizing + Account/Activation/GlowConfig promoted to screens) and then
**2026-07-22** (AppShell session timer) both synced with **all source-side gates green**: `tsc`, ESLint `@stylistic`,
and **react-doctor = 0** on every DS-owned file, no hand edits. The `BetSizing` ladder, the `Hotkeys & bets` sizing
editor and the session timer all wired to the backend without forking a single DS file. Thank you — the
presentational-with-props contract held perfectly through a large drop.

The only red we hit was **app-owned test maintenance** (a stale pixel-parity region, see below), not an export defect.

## Request 1 — ship APP_NAV entries for `glow` and `betsizing` (the one real gap)

The 2026-07-17 drop **removed the `glow` slot from `Overlay`** and promoted **`GlowConfig` to a standalone screen**
(good — one home for glow). But `APP_NAV` in `ui/screens/AppShell.fixtures.ts` still lists only the original 5 items
(`layouts`, `rooms`, `overlay`, `hotkeys`, `account`) — **no `glow` entry**. Consequences:

- In the **real cockpit**, `GlowConfig` became unreachable (nothing mounts it). We had to add a **temporary app-owned
  bridge** (`COCKPIT_NAV = [...APP_NAV, { id: "glow", … }]`) to restore access. We'd like to drop that bridge.
- In the **pixel-parity harness**, the glow screen is unreachable via the rail on both sides, so its region can't run.
  We removed the stale `overlay-glow` region (it still pointed at the old Overlay slot) — glow parity is uncovered
  until the nav ships.

Please add to `APP_NAV` (both are already valid `SCREEN` entries in `standalone.entry.tsx`):

```ts
{ id: "glow", label: <i18n nav.glow: "Window glow" / "Halo des tables">, icon: "…" },
```

`i18n.ts` already carries `nav.glow` ("Window glow" / "Halo des tables"), so only the `APP_NAV` array entry is
missing. The **new baseline screen `betsizing`** is in the same situation (SCREEN entry present, no nav) — if it is
meant to be cockpit-navigable rather than baseline-only, add a nav entry for it too; otherwise a one-line note that
`betsizing` is baseline-only is enough and we'll keep it out of the rail.

## FYI — no design work

- `BetSizing` is mounted in its own Tauri window over the hovered table; the app owns the window, the global hotkeys,
  and the exact-amount typing into the room's bet box. The screen's presentational contract is exactly right as-is.
- The `Overlay` glow-slot removal is fully absorbed app-side.

## Answer to your 2026-07-22 note — yes, please sync the preview kit

You asked whether to synchronize the preview kit (`ui_kits/tatami/AppShell.jsx`) with the new session timer. **Yes —
please sync it** so the Design System tab renders the timer cluster (idle/running/paused) like the production
`AppShell.tsx`. Same for any future BetSizing preview card if one is planned.
