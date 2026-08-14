# Tatami app → Claude Design — E5 data contract: per-variant action sub-ROIs (standing request)

This is the data contract we promised for E5 (écart 20 — "action sub-ROIs exist only once, but the real button
positions depend on the displayed layout"). The app model now carries it end-to-end; the Établi (station 4 /
bench) can represent the declinations. This file is a STANDING request — it stays valid across iterations until
we say otherwise.

## The model, in screen terms

An action sub-ROI (`fold`, `call`, `raise`, `slider`) no longer has ONE geometry per size bucket — it has one
geometry **per action layout** (the `actions` variants of the catalogue):

| Variant id | Label | Sub-ROIs it owns |
|---|---|---|
| `idle` | Hors tour (aucun bouton) | — |
| `two_buttons` | Deux boutons (fold / call) | fold, call |
| `three_buttons` | Trois boutons (fold / call / raise) | fold, call, raise |
| `slider_open` | Slider de mise ouvert | fold, call, raise, slider |
| `allin_confirm` | Confirmation all-in | — |

(Room-specific variants added by overrides follow the same shape and must appear the same way.)

## What the app serves (already live in the payload)

- Each zone-catalogue entry for a scoped sub-ROI carries, in addition to the existing `parent` (the `actions`
  zone), a **`variant` ref**: `{ id, label }` — e.g. the entry for key `actions.two_buttons.fold` has
  `parent = actions`, `variant = { id: "two_buttons", label: "Deux boutons (fold / call)" }`. Flat legacy entries
  (`actions.fold`, no `variant`) still exist as fallback for un-migrated profiles.
- Bucket geometry (`pos`) and per-zone states (`zoneStates`) use the scoped keys. A freshly migrated profile has
  every declination in state `seeded` (projected) with identical rects; each declination becomes `adjusted`
  **only** by an adjustment made on a shot that attests ITS variant.
- Probe points follow the same grammar (`probe.<variant>.<action>`) and travel in the bucket's `points` — the
  pixel placement gesture (station 5 → canvas) is per-variant too.

## What the Établi should let the player do (the screen ask)

1. **See the declinations**: for each action sub-ROI, the rail shows one row per variant (label + state badge:
   `adjusted` / `seeded`), not a single opaque row. The variant whose geometry is DRAWN on the canvas is the one
   attested by the loaded capture; declinations not attested by this capture are not adjustable on it.
2. **Adjust on an attesting shot**: selecting a declination whose variant is NOT attested by the current capture
   should steer the player to load/capture a shot that attests it (same philosophy as « absente de cette
   capture » — never a blind adjustment). When the capture attests the variant, the adjustment writes the SCOPED
   key and flips only that declination to `adjusted`.
3. **Coverage tie-in**: a matrix cell for an `actions` variant is only fully verified when its scoped geometry is
   adjusted on an attesting shot — the declination states are the sub-detail behind the cell.
4. **Probes per variant** (station 5): the unplaced-pixels rail may now carry one chip per
   `probe.<variant>.<action>`; the placement gesture is unchanged, only the identity is finer.

Fixtures on our side already include a bucket in the migrated (scoped) state so your prototypes can render both
worlds: legacy flat (single row per sub-ROI) and scoped (declination rows).

Design questions are yours — rail layout, badges, the steering gesture. The contract above is stable; if a field
is missing for the design you want, say so in your next drop notes and we will extend the payload.
