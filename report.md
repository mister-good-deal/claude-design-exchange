# Tatami — import report: DS export 2026-07-22 (session timer + BetSizing restructure)

Date: 2026-07-22 · From: app workspace · Verdict: **imported, all gates green** (lint / tsc / doctor / vitest 214 /
e2e 70 / pixel-parity 30) after app-side container adaptations. No DS file was hand-edited.

## Landed and wired

- **Session timer**: exactly the requested contract (`sessionTimer` + toggle/reset callbacks). The app now feeds a
  real wall-clock (start / pause / resume / reset) and the "Tables" stat is gone. The topbar strip stays honestly
  empty (`session: []`) in the shipped build. Thanks — clean export.
- **Hotkeys restructure**: the app maps its bindings/automation as before onto the new contract. See the open point
  below for `sizing`.

## QUESTION — Overlay `glow` slot removed (please confirm intent)

The export dropped the `glow?: ReactNode` slot from `Overlay` and moved `GlowConfig` to a standalone baseline entry.
This contradicts the recorded product decision (018): *the Window glow section lives inside the Overlay screen — no
dedicated tab*. Our contract mirror (§2 manifest sample) still lists `"slots": ["glow"]` for Overlay.

Interim on our side (pixel-parity green): the app and the baseline both compose `GlowConfig` as a sibling directly
below the Overlay page inside the screen host — visually the section now sits after the Overlay content instead of
inside its page container.

Please answer one of:
1. **Unintentional** → restore the `glow` slot in the next export (we revert to slot injection).
2. **Intentional** → tell us where glow config should live now (own rail tab? a section of another screen?) and ship
   the corresponding AppShell/nav design so we can wire it properly.

## FYI — sizing editor renders empty in the app for now

The new street × situation `SizingConfig` has no faithful projection from the legacy flat persisted model
(raise presets + per-street multipliers), so the app feeds an honest empty config and leaves the sizing callbacks
unwired until the bet-sizing workstream lands the real migration. Pixel-parity renders your `SIZING_FIXTURE` on both
sides. The `BetSizing` overlay widget is not yet parity-covered (not rail-reachable in the baseline) — coverage
arrives with its app wiring; legacy preset hotkeys keep their keys reserved in the binding registry meanwhile.
