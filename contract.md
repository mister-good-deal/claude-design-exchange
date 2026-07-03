# Tatami DS export contract — prompt for Claude Design

> Romain: send everything below the line to Claude Design. It is the binding contract for every future export so the
> app's automated importer (`pnpm import-ds <url>`) can drop it in with zero diffs and zero hand-edits.

---

You are the source of truth for the **Tatami** design system. The Tatami app imports your work through an **automated
script**: it's given a URL to your export archive and syncs every part to the right place, then the app's gates +
pixel-parity must be green with **no hand edits**. For that to be bulletproof, every export MUST obey this contract.
If something here can't be met, RAISE IT as a question — never silently deviate or hand-wave.

## 1 — Archive: one zip at a stable URL, this exact layout

```text
tatami-ds/
  manifest.json
  ui/                        # DS PRIMITIVES (→ apps/web/src/ui/)
    Button.tsx  Button.module.css   … (IconButton, Badge, Kbd, Input, Select, Toggle, Slider, Panel, StatReadout, KillSwitch)
    cx.ts  index.ts  css-modules.d.ts
  ui/screens/                # DS PRESENTATIONAL SCREENS (→ apps/web/src/ui/screens/)
    Overlay.tsx  Overlay.module.css  Overlay.fixtures.ts
    Hotkeys.tsx  Hotkeys.module.css  Hotkeys.fixtures.ts
    RoomProfile.tsx  RoomProfile.module.css  RoomProfile.fixtures.ts
    LayoutDesigner.tsx  LayoutDesigner.module.css  LayoutDesigner.fixtures.ts
    index.ts
  tokens/                    # (→ apps/web/src/styles/tokens/)  colors.css effects.css fonts.css spacing.css typography.css
  styles.css                 # (→ apps/web/src/styles/styles.css) tokens import + @font-face + keyframes
  standalone.html            # (→ doc/Tatami-App-(standalone).html) the FULL app render = the pixel-parity baseline
```

Do **NOT** ship: `ErrorBoundary`, `GlowConfig` (app-owned, §4), the `.jsx` previews, bundler artifacts,
`doctor.config.ts`, `node_modules`, `TableTile`/`ActionBar`/`ConfidenceMeter` (removed/unused).

## 2 — `manifest.json` (the importer reads this — deterministic sync)

```json
{
  "designSystem": "tatami",
  "version": "<ISO date, e.g. 2026-07-01>",
  "generatedBy": "claude-design",
  "primitives": ["Button","IconButton","Badge","Kbd","Input","Select","Toggle","Slider","Panel","StatReadout","KillSwitch"],
  "screens": [
    { "name": "Overlay", "props": { "data": "OverlayData", "on": "OverlayCallbacks", "slots": ["glow"] } },
    { "name": "Hotkeys", "props": { "data": "HotkeysData", "on": "HotkeysCallbacks", "slots": [] } },
    { "name": "RoomProfile", "props": { "data": "RoomProfileData", "on": "RoomProfileCallbacks", "slots": [] } },
    { "name": "LayoutDesigner", "props": { "data": "LayoutDesignerData", "on": "LayoutDesignerCallbacks", "slots": [] } }
  ],
  "targets": [
    { "from": "ui/",           "to": "apps/web/src/ui/",              "mode": "replace-dir" },
    { "from": "ui/screens/",   "to": "apps/web/src/ui/screens/",      "mode": "replace-dir" },
    { "from": "tokens/",       "to": "apps/web/src/styles/tokens/",   "mode": "replace-dir" },
    { "from": "styles.css",    "to": "apps/web/src/styles/styles.css","mode": "replace-file" },
    { "from": "standalone.html","to": "doc/Tatami-App-(standalone).html","mode": "replace-file" }
  ]
}
```

`ui/` is now 100 % yours: the app moved its two former `ui/` components (`ErrorBoundary`, `GlowConfig`) into
`app/components/`, so `replace-dir` is a clean wholesale replace — no exclusions needed.

## 3 — Screens are PRESENTATIONAL-WITH-PROPS (the rule that kills drift)

Each screen is a **pure view**: markup + its `.module.css` + LOCAL UI state only (hover, which menu is open, an
in-flight inline edit). ALL domain data + actions arrive as **props**:

- `data: <Screen>Data` — everything to render, typed (bindings, ROI set, layouts, seats/tags/notes, …).
- `on: <Screen>Callbacks` — every user action as a callback (`onRebind(scope,id,chord)`, `onMoveRoi(id,rect)`,
  `onAddTag(tag)`, `onSelectLayout(id)`, …), so the APP owns persistence / validation / IPC.
- `slots?` — app-injected nodes (Overlay's `glow?: ReactNode`).
- `<Screen>.fixtures.ts` exports a typed `<Screen>Data` used as the **default** so your DS preview and our
  pixel-parity render the fixtures; the app passes real data at runtime.

**Forbidden inside a screen:** IPC / `fetch` / `invoke`, reducers with side effects, cross-screen state, anything
backend-aware. Local `useState` for pure UI is fine. This is what makes parity automatic (app + your fixtures = your
prototype) and lets the app wire real data without forking your file.

## 4 — App-owned (NOT in the export)

`ErrorBoundary`, `GlowConfig` are the app's — they now live in `apps/web/src/app/components/` (out of `ui/`). Do not
ship them. `Overlay` exposes `glow?: ReactNode`; the app passes its `<GlowConfig/>` into that slot.

## 5 — Gate-clean, UNMODIFIED (this is non-negotiable)

The export must pass, with **zero hand edits**: `tsc` strict (incl. `exactOptionalPropertyTypes`), ESLint
`@stylistic`, and **react-doctor at full strictness — 0 diagnostics (errors AND warnings), no suppressions**.

- No `import React` (automatic JSX runtime). No `eslint-disable` anywhere.
- `exactOptionalPropertyTypes`: optional/callback props typed `prop?: T | undefined`.
- `@stylistic`: **semicolons required** (`semi: always` + `member-delimiter-style: semicolon` on every interface/type
  member — this is the biggest mismatch: do NOT export semicolon-free code), **no trailing commas**
  (`comma-dangle: never`), **no parens around a single arrow arg** (`arrow-parens: as-needed`), consistent
  quote-props, blank line before block statements + before comments (`lines-around-comment`), multiline ternary breaks
  each branch, no unnecessary parens, `object-curly-spacing: always`. Double quotes, 4-space indent, multi-line
  comments as one `/* */` block, ≤ ~120 cols, components/helpers ≤ ~40 lines.
- **`@stylistic` is auto-normalized by the importer** (a mechanical `lint:fix` pass runs post-sync), so you do NOT need
  to match our exact formatter dialect. Do keep **semicolons + member-delimiters** (so review diffs stay readable). The
  HARD, source-side requirement is **`tsc` + `react-doctor` = 0** — those can't be auto-fixed and must be clean by
  construction.
- Hoist static icon elements + no-op handlers to module scope; stable list keys (never array index); clean effect
  deps; no derived-state-from-props (use render-time prev-prop adjust); event logic in the handler, not an effect;
  a11y on custom clickables (role/tabindex/keyboard).
- CSS: layout/spacing/colour via `var(--…)` tokens only; runtime-only values via inline CSS custom properties
  (`style={{ ["--roi"]: color }}`) — this is the ONLY inline `style=` allowed.
- **Design-blocked react-doctor rules are YOURS to fix in the markup:** `prefer-tag-over-role` (use the semantic
  element, not `role=`), `prefer-html-dialog` (native `<dialog>`), `no-static-element-interactions` (put the handler
  on a real interactive element). We cannot fix these app-side without breaking pixels — the design must adopt the
  semantic markup. Also root-cause (not silence): `you-might-not-need-an-effect`, `no-cascading-set-state`,
  `no-derived-use`, `sharing-logic-between-event-handlers`, `prefer-module-scope-pure-function`, `no-event-handler`,
  `js-combine-iterations`.

## 6 — `standalone.html` = the pixel-parity baseline (must match your screens byte-for-byte)

It is the FULL app render (all 4 screens, the nav shell) at viewport **1320×780**, rendered with the fixtures data,
using the SAME markup + CSS your `ui/screens/` ship. Our harness diffs the app against it per region: each screen's
`<main>` and every Panel located by its `<h3>` title. If the screens and this HTML share one source, every region is
0 by construction. Update it every release.

## 7 — Confirmed environment (answers to your ACTION-1 questions)

1. Inline CSS custom property `style={{ ["--x"]: … }}` → **accepted** by react-doctor (no inline-style rule fires).
2. `color-mix(in srgb, var(--roi) N%, transparent)` → **works** (renders in webkit2gtk 2.52, Tauri's engine). Keep it.
3. `lucide-react` → **is a dependency**. Use it.

## 8 — Fix these in the current 3-screen drop before LayoutDesigner

- **@stylistic (~40, Hotkeys.tsx + Hotkeys.fixtures.ts, all mechanical):** `comma-dangle`, `arrow-parens`,
  `padding-line-between-statements`, `multiline-ternary`, `no-extra-parens`.
- **tsc (1):** `Overlay.tsx:325` — the object `addNote` builds doesn't match `PlayerNote` (from `Overlay.fixtures.ts:31`).
- **react-doctor (37): 12 Bugs / 8 Perf / 16 A11y / 1 Maint** — the rules listed in §5.

## 9 — Open questions (please answer)

1. **Props contract** — confirm each screen is presentational-with-props (`data` + `on` + `slots`), fixtures as
   defaults, no baked IPC/interaction. This is the boundary the app wires against.
2. **Behavior line** — local UI state in the screen; app-level behavior (persistence, validation, cross-screen
   registry, drag-drop-to-backend) in the app via `on.*` callbacks. Agree?
3. **Shell** — is `AppShell` (nav rail + topbar + window controls) DS-owned (ship it under `ui/screens/AppShell.*`)
   or app-owned? Pick one so it stops drifting.

## Delivery

One zip at a stable URL (so `curl` can fetch it) with the layout in §1 and a valid §2 manifest.
