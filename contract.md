# Tatami DS export contract — prompt for Claude Design

> This file is mirrored on the exchange repo (`mister-good-deal/claude-design-exchange` → `contract.md`), which is
> what Claude Design reads. Any edit here must be re-pushed with `pnpm ds-report doc/claude-design-DS-export-contract.md contract.md`.

---

You are the source of truth for the **Tatami** design system. The Tatami app imports your work through an **automated
script**: Romain downloads your export archive, `pnpm import-ds --latest` syncs every part to the right place, then
the app's gates + pixel-parity must be green with **no hand edits**. Your gate report for each iteration is published
at `report.md` on the exchange repo — read it at the start of every iteration. If something in this contract can't be
met, RAISE IT as a question — never silently deviate or hand-wave.

## 1 — Archive: one downloadable zip, this exact layout

```text
tatami-ds/
  manifest.json
  ui/                        # DS PRIMITIVES (→ apps/web/src/ui/)
    Button.tsx  Button.module.css   … (IconButton, Badge, Kbd, Input, Select, Toggle, Slider, Panel, StatReadout, KillSwitch)
    cx.ts  index.ts  css-modules.d.ts
  ui/screens/                # DS PRESENTATIONAL SCREENS (→ apps/web/src/ui/screens/)
    AppShell.tsx  AppShell.module.css  AppShell.fixtures.ts
    Account.tsx  Account.module.css  Account.fixtures.ts
    Activation.tsx  Activation.module.css  Activation.fixtures.ts
    Overlay.tsx  Overlay.module.css  Overlay.fixtures.ts
    BetSizing.tsx  BetSizing.module.css  BetSizing.fixtures.ts
    GlowConfig.tsx  GlowConfig.module.css  GlowConfig.fixtures.ts
    Hotkeys.tsx  Hotkeys.module.css  Hotkeys.fixtures.ts
    RoomProfile.tsx  RoomProfile.module.css  RoomProfile.fixtures.ts
    LayoutDesigner.tsx  LayoutDesigner.module.css  LayoutDesigner.fixtures.ts
    standalone.entry.tsx     # the baseline composition (see §6) — the APP builds the HTML from it
    index.ts
  tokens/                    # (→ apps/web/src/styles/tokens/)  colors.css effects.css fonts.css spacing.css typography.css
  styles.css                 # (→ apps/web/src/styles/styles.css) tokens import + @font-face + keyframes
  pages/                     # STANDALONE HTML pages (→ apps/web/public/)  preview-screen.html
```

Do **NOT** ship: `ErrorBoundary` (app-owned, §4), a pre-rendered `standalone.html` (the app builds the
baseline itself, §6), `.jsx` previews, bundler artifacts, `doctor.config.ts`, `node_modules`.

## 2 — `manifest.json` (the importer reads this — deterministic sync)

```json
{
  "designSystem": "tatami",
  "version": "<ISO date, e.g. 2026-07-17>",
  "prototypeIteration": "<ISO date of the LAST prototype iteration this drop contains — the preview↔drop freshness trace (§8)>",
  "pendingFromPreview": ["<component/behaviour visible in the preview but NOT in this drop — empty array when none>"],
  "generatedBy": "claude-design",
  "primitives": ["Button","IconButton","Badge","Kbd","Input","Select","Toggle","Slider","Panel","StatReadout","KillSwitch"],
  "screens": [
    { "name": "AppShell", "props": { "data": "AppShellData", "on": "AppShellCallbacks", "slots": ["windowControls"] } },
    { "name": "Account", "props": { "data": "AccountData", "on": "AccountCallbacks", "slots": [] } },
    { "name": "Activation", "props": { "data": "ActivationData", "on": "ActivationCallbacks", "slots": [] } },
    { "name": "Overlay", "props": { "data": "OverlayData", "on": "OverlayCallbacks", "slots": [] } },
    { "name": "BetSizing", "props": { "data": "BetSizingData", "on": "BetSizingCallbacks", "slots": [] } },
    { "name": "GlowConfig", "props": { "data": "GlowConfigData", "on": "GlowConfigCallbacks", "slots": [] } },
    { "name": "Hotkeys", "props": { "data": "HotkeysData", "on": "HotkeysCallbacks", "slots": [] } },
    { "name": "RoomProfile", "props": { "data": "RoomProfileData", "on": "RoomProfileCallbacks", "slots": [] } },
    { "name": "LayoutDesigner", "props": { "data": "LayoutDesignerData", "on": "LayoutDesignerCallbacks", "slots": [] } }
  ],
  "targets": [
    { "from": "ui/", "to": "apps/web/src/ui/", "mode": "replace-dir", "keepGlob": ["ErrorBoundary.*"] },
    { "from": "ui/screens/", "to": "apps/web/src/ui/screens/", "mode": "replace-dir" },
    { "from": "tokens/", "to": "apps/web/src/styles/tokens/", "mode": "replace-dir" },
    { "from": "styles.css", "to": "apps/web/src/styles/styles.css", "mode": "replace-file" },
    { "from": "pages/", "to": "apps/web/public/", "mode": "replace-dir", "keepGlob": ["glow.html", "layout.html"] }
  ]
}
```

`ui/` is yours except the app-owned `ErrorBoundary`, which lives in `apps/web/src/ui/` and survives the
`replace-dir` through `keepGlob: ["ErrorBoundary.*"]` — do not ship it (§4). `WindowControls` stays in
`app/components/`, out of the sync path.

`pages/` carries the STANDALONE HTML deliverables (self-contained, no external assets): `preview-screen.html`
today, the checkout pages if they migrate later. Target mode is `replace-dir` with
`keepGlob: ["glow.html", "layout.html"]` — the app-owned `glow.html` and `layout.html` survive every drop;
everything else in `public/` is yours. Ship the full set of
DS-owned pages in every zip: under `replace-dir` absent siblings are removed (no more `merge-dir` overlay).
Without this target a page fix has no rail to ship on (a `cursor: none` removal was lost exactly this way).

## 3 — Screens are PRESENTATIONAL-WITH-PROPS (the rule that kills drift)

Each screen is a **pure view**: markup + its `.module.css` + LOCAL UI state only (hover, which menu is open, an
in-flight inline edit). ALL domain data + actions arrive as **props**:

- `data: <Screen>Data` — everything to render, typed (bindings, ROI set, layouts, seats/tags/notes, …).
- `on: <Screen>Callbacks` — every user action as a callback (`onRebind(scope,id,chord)`, `onMoveRoi(id,rect)`,
  `onAddTag(tag)`, `onSelectLayout(id)`, …), so the APP owns persistence / validation / IPC.
- `slots?` — app-injected nodes (AppShell's `windowControls?: ReactNode`).
- `<Screen>.fixtures.ts` exports a typed `<Screen>Data` used as the **default** so your DS preview and our
  pixel-parity render the fixtures; the app passes real data at runtime.

**Forbidden inside a screen:** IPC / `fetch` / `invoke`, reducers with side effects, cross-screen state, anything
backend-aware. Local `useState` for pure UI is fine. This is what makes parity automatic (app + your fixtures = your
prototype) and lets the app wire real data without forking your file.

**Production surfaces beat in-view simulations.** When a feature exists for real in the app (e.g. LayoutDesigner's
preview spawns real OS windows), the screen exposes callbacks (`onPreview`/`onStopPreview`) and only falls back to an
in-view simulation when they are absent.

## 4 — App-owned (NOT in the export)

`ErrorBoundary` and `WindowControls` are the app's — `WindowControls` lives in `apps/web/src/app/components/`,
`ErrorBoundary` in `apps/web/src/ui/` behind the `ui/` `keepGlob` (§2). Do not ship them. `GlowConfig` is a full DS
screen — ship it like the others. `Overlay` no longer exposes a `glow` slot (`slots: []`); `AppShell` still exposes
`windowControls?: ReactNode` and the app fills it. The standalone `glow.html` and `layout.html` pages in
`public/` are app-owned, preserved by the `pages/` `keepGlob`.

## 5 — Gate-clean, UNMODIFIED (this is non-negotiable)

The export must pass, with **zero hand edits**: `tsc` strict (incl. `exactOptionalPropertyTypes`), ESLint
`@stylistic`, and **react-doctor at full strictness — 0 diagnostics (errors AND warnings), no suppressions**.
Run `tsc` and the `lint-bundle/` formatter check (`npm install && npm run check` → 0) on the package BEFORE zipping.

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
  on a real interactive element), `only-export-components` (a component file exports components only — constants go in
  the `.fixtures.ts`). We cannot fix these app-side without breaking pixels — the design must adopt the semantic
  markup. Also root-cause (not silence): `you-might-not-need-an-effect`, `no-cascading-set-state`, `no-derived-use`,
  `sharing-logic-between-event-handlers`, `prefer-module-scope-pure-function`, `no-event-handler`,
  `js-combine-iterations`.

## 6 — The pixel-parity baseline is BUILT from `standalone.entry.tsx` (shared source = 0 drift)

You ship the **composition** (`ui/screens/standalone.entry.tsx`: `StandaloneBaseline`, `BASELINE_W/H` = 1320×780);
the app **builds** the baseline HTML from it (`pnpm build:standalone` → `doc/Tatami-App-(standalone).html`, one
self-contained file). Because the baseline and the shipped screens share one source, every parity region is 0 by
construction — never ship a hand-authored or pre-rendered HTML. The app-side mount adds only: nav state (so the parity
harness can click the rail) and the `app.css` globals (border-box reset — parity-critical).

## 7 — Confirmed environment

1. Inline CSS custom property `style={{ ["--x"]: … }}` → **accepted** by react-doctor (no inline-style rule fires).
2. `color-mix(in srgb, var(--roi) N%, transparent)` → **works** (renders in webkit2gtk 2.52, Tauri's engine). Keep it.
3. `lucide-react` → **is a dependency**. Use it.

## 8 — Preview ↔ app parity (rule set after the 0.6.3 field campaign)

What the preview shows and what the app renders after import MUST stop diverging silently. The preview being less
dynamic and partly mocked is accepted — the divergence being untracked is not. Three field-verified leaks motivated
this section: a prototyped tab bar never exported (3 reports), the two Établi views diverging invisibly, and a
preview showing a populated live feed where the real app is structurally empty.

1. **Every iteration visible in the preview ships in the next drop.** If a prototyped component cannot be exported
   yet, it is listed in `manifest.pendingFromPreview` — never silent.
2. **`manifest.prototypeIteration` traces the prototype state each drop contains.** The importer compares it to the
   drop `version`: any lag is surfaced at import time, not discovered in a Windows field campaign.
3. **Mocked zones are declared.** Any preview area running on canned data that the app cannot reproduce at that
   point of the flow is annotated as mocked in the preview itself and listed in the drop notes.
4. **Empty and degraded states are designed too** (no frame before probes are placed, empty lists, lost window…).
   The preview must show what the app will REALLY show in those conditions — a fixture that fakes a populated state
   the app cannot reach is a contract violation, not a nicety.
5. **A view delivered in several declinations in the app (in-session / standalone) exists in the preview in ALL its
   declinations**, or the missing one is declared in `pendingFromPreview`.

## Delivery loop

1. Read `report.md` on the exchange repo (verdict + verbatim errors + gaps of the previous iteration).
2. Apply the fixes at source, run `tsc` + the lint-bundle check.
3. **Publish by keeping `_handoff/tatami-ui-package/` current in the workspace** (§1/§2 layout, `manifest.version`
   bumped to the drop date). No zip, no download, no human hop: the app side mirrors that folder directly from the
   workspace (DesignSync file reads), rebuilds the archive locally, runs `pnpm import-ds <path>` and its gates, and
   pushes the next `report.md` to the exchange. The `_handoff/tatami-ds.zip` artifact is RETIRED — a stale copy of
   it once regressed the whole v3 surface; never point anyone at it again. `manifest.version` is the freshness
   check the importer trusts: an unbumped version reads as « no new drop ».

### Standing requests live in their own exchange files

`report.md` is OVERWRITTEN by every iteration, so it only ever carries the current subject. A request that outlives
one iteration — an independent feature ask, a spec that spans several drops — gets **its own named file at the root
of the exchange repo** (e.g. `hotkeys-presets.md`), pushed with `pnpm ds-report <local-file> <exchange-name>`, and
`report.md` links to it by that name. Read those files too when `report.md` points at them; they stay valid until we
say otherwise.

**Never reference a path inside the app repo in anything you send to Claude Design** (`doc/…`, `specs/…`): it has no
access to it. This exact mistake sat unnoticed for weeks — a recurring one-line reminder pointing at a local doc,
for a request whose content had never actually crossed the channel.
