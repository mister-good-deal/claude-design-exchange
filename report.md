# Iteration request — LayoutDesigner (2026-07-08)

**Verdict of the last import (DS v2026-07-08):** GREEN — drop-in clean (lint + tsc + react-doctor = 0, pixel-parity
26/26, e2e 21/21 on LayoutDesigner). No gate failures. This is a **feature iteration** from live testing (`make run`),
scoped to the **LayoutDesigner** screen only.

Please apply the two changes below and re-export the full DS. Keep every gate green (tsc + react-doctor = 0 at source,
per `contract.md`). Touch only `ui/screens/LayoutDesigner.tsx` + `ui/screens/LayoutDesigner.module.css` (+ its
`.fixtures.ts` as noted).

## 1. Drag cursor while placing a window (palette drag)

**Symptom (live):** while dragging a slot-type from the palette onto the canvas, the cursor stays the default arrow —
it should read as a "placing / copy" drag, not a plain pointer.

**Diagnosis:** in `LayoutDesigner.tsx`, `PaletteItem.onDragStart` sets `e.dataTransfer.effectAllowed = "copy"` (good),
but the drop-zone `onDragOver` handlers only call `e.preventDefault()` without ever setting
`e.dataTransfer.dropEffect`, so the browser falls back to the default cursor over the canvas:
- `TileCell` `onDragOver` (~line 552)
- `EmptyCell` `onDragOver` (~line 589)
- the canvas / gutter `onDragOver` (~line 692)

**Ask:** set `e.dataTransfer.dropEffect = "copy"` in those `onDragOver` handlers while a palette drag is active, so the
browser shows the copy cursor over valid drop targets (and the native "no-drop" cursor only over genuinely invalid
areas). Optionally add `cursor: grabbing` on the canvas root while a drag is in progress for extra clarity.
For consistency, the tile-move and monitor-reorder drags use `effectAllowed = "move"` — the same `dropEffect = "move"`
treatment is welcome, but the palette "copy" case is the one reported.

## 2. Never offer to delete the last layout

**New app invariant:** a room profile now always keeps **≥ 1 layout** — the backend refuses deleting the last one (a
room must have a layout to tile). The UI must therefore not offer a Remove that will be rejected.

**Ask:** in the Saved "Layouts" panel (`SavedRow`), when only **one** layout remains (`data.saved.length <= 1`),
**disable** that row's **Remove** control (keep Rename / Rebind / Apply active), ideally with a disabled tooltip such
as "A room keeps at least one layout". No new data prop is needed — `data.saved.length` already carries it. With 2+
layouts, Remove is unchanged.

## Notes
- Keep `LayoutDesigner.fixtures.ts` seeding ≥ 2 layouts so the Remove-enabled path stays visible; please also cover
  the single-layout state (a fixture variant or story) so the disabled Remove is exercised.
- Re-export the whole DS with `manifest.json` unchanged so `pnpm import-ds` stays a clean drop-in.
