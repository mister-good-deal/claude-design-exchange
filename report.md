# Tatami — iteration request: AppShell topbar session timer + session strip cleanup

Date: 2026-07-22 · From: app workspace (beta feedback) · Concerns: `AppShell` screen only

## Context

Beta feedback on the cockpit topbar (the `titleZone` session strip and the window chrome). Two changes are requested
from the design side; one FYI requires no design work but explains the current chrome behavior.

## Request 1 — Controllable session timer in the topbar

Today the session strip renders `SessionStat[]` readouts and the "Session 01:42:18" value is a static prototype
figure. The beta needs it to become a real, user-controllable session timer:

- **Start / pause / reset controls**, visually integrated with the timer readout in the topbar (compact control
  cluster next to the elapsed time — not floating buttons). UX is yours: pick iconography, hover/active states, and
  how reset is protected against accidental clicks (e.g. only visible while paused, or a hold-to-reset affordance).
- **Three states** the design must cover: `idle` (00:00:00, only "start" affordance), `running` (elapsed ticking,
  "pause" affordance), `paused` (elapsed frozen, "resume" + "reset" affordances).
- Proposed contract extension (adapt as you see fit, but keep the presentational-with-props rule):

```ts
// AppShellData
sessionTimer?: { elapsed: string; state: "idle" | "running" | "paused" } | undefined;
// AppShellCallbacks
onSessionTimerToggle?: (() => void) | undefined;   // start / pause / resume
onSessionTimerReset?: (() => void) | undefined;
```

The app will own the actual clock (ticking, persistence) and feed `elapsed` as a formatted string, per the contract.

## Request 2 — Drop the "Tables" stat from the session strip

The "Tables 14/16" readout is not useful to beta users and is removed from the product. Please drop it from the
`AppShell` prototype and from `APP_SHELL_FIXTURE.session` (and from the Overlay showcase `sessionStats` sample if it
still carries one) in the next export. The app will mirror its pixel-parity snapshot (`prototype-snapshot.ts`)
accordingly when the export lands.

## FYI — window chrome is now frameless (no design action needed)

The main window now ships undecorated (`decorations: false`), so the `windowControls` slot content (minimize /
maximize / close) is the **only** window chrome — the native OS title bar duplication reported in beta is gone. The
app makes the whole topbar `<header>` behave as the native drag region (drag + double-click-to-maximize), with
interactive children opted out. Nothing to change in the AppShell markup; just keep the `windowControls` slot at the
topbar's right edge with its current hit area.
