# Tatami app → Claude Design — verdict d'import du drop v2026-08-14.2

The drop was mirrored from `_handoff/tatami-ui-package/` and imported via `pnpm import-ds`. Result: **almost
drop-in clean** — one gate is red and must be fixed at source.

## Gate results

| Gate | Verdict |
|---|---|
| lint (lint-bundle rules) | ✅ |
| tsc | ✅ (after app-side wiring: `room_clamp`/`monitor_bound` → the new `roomClamped`/`monitorClamped` provenances) |
| vitest (399) | ✅ (app tests adopted the new contracts: CorrectDialog gesture, `keyDisplay` humanized mouse labels) |
| pixel-parity (25 regions) | ✅ after rebuilding the standalone baseline |
| **react-doctor** | ❌ **1 warning — fix at source** |

## The one blocker — Performance warning in `ui/screens/CalibrationCanvas.tsx`

`react-doctor` (rule `js-set-map-lookups`) flags the `visibleZones` helper (~line 304): `absent.indexOf(z.id)`
runs inside the `for (const z of zones)` loop — an array scan per zone. Same pattern in `AdjustStation.tsx`'s
`ZoneRail` (`absent.indexOf(z.id) !== -1` per row) is not flagged today but is one refactor away.

*Fix at source:* build `const absentSet = new Set(absent)` once before the loop and test membership with
`absentSet.has(z.id)`. Zero visual impact, removes the warning. Our doctor gate is blocking (zero errors AND
warnings), so the next drop needs this or it cannot merge.

## What we wired app-side this iteration (for your context)

- **E1 (préclassification)** — handled on our side as you suggested: the backend now derives a
  `suggestedRole` per candidate window from the committed `[windows]` rules (same regex engine as detection),
  and the station-1 rail pre-fills the role selects (table→table, lobby→lobby) without replacing the committed
  rules on screen. No screen change needed — the existing candidates contract carries it.
- **E2 (stable candidate ordering)** — handled on our side in the rail: stable order by first appearance under
  the poll; new windows append, the list never reshuffles under the cursor. No screen change needed.
- **D2 provenance** — wired: the app now maps the engine's `room_clamp`/`monitor_bound` onto your split
  `roomClamped`/`monitorClamped`, so the MAX badge finally tells the truth on the field.

## E5 (per-variant action sub-ROIs) — deferred to a model iteration

The Établi representation you'd build for E5 needs the app's profile model to carry variant-scoped geometry for
`actions.fold/call/raise` (today one rect per sub-ROI, whatever the variant). That is a declaration/engine model
change on our side — we'll iterate the model first and then send you the data contract to represent (which
variant is covered / missing per sub-ROI, adjustment on a shot that attests the variant). Don't design against a
contract that doesn't exist yet; we'll spec it in the next report.

Everything else from the terrain report (blocs A–D, C1–C5) landed and passed the gates — the Établi resize fix
(A1/A2) unblocks station 4 for the next Windows validation session.
