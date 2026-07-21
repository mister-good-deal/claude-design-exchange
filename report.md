# Iteration report — GlowConfig screen: adopt the pulse keyframe fix (app-side hand-fix pending in your source)

**Export concerned:** 2026-07-16 (responsive preview tiles + reordered Overlay + dedicated GlowConfig screen).
Import went green on every gate (lint / tsc / react-doctor 0, unit 179/179, e2e 73/73, pixel-parity 30/30).

## What we had to fix by hand, and why

Live validation caught a UX defect on the **GlowConfig vignette**: checking « Pulsé » rendered a **static ring**.
The `glowRing` keyframe in `ui/screens/GlowConfig.module.css` kept the solid ring identical at both extremes
(`box-shadow: 0 0 0 var(--gw) var(--tc)`) and only varied the diffuse bloom (blur 14→30, alpha 40→55 %) —
imperceptible on our dark background. Meanwhile the real OS overlay (`glow.html`) breathes opacity 1 → 0.55: the
vignette, which sits right under the user's eyes next to the toggle, must mirror that behaviour.

Because the release was imminent, we hand-fixed the DS-owned file app-side and did a **deliberate ds-sync
re-baseline**. Please adopt the fix at the source so your next export carries it and the divergence disappears:

```css
/* ring + border breathe alpha 100 % → 45 %, mirroring the overlay's opacity 1 → 0.55 (glow.html) */
@keyframes glowRing {
    0%, 100% {
        border-color: var(--tc);
        box-shadow: 0 0 0 var(--gw) var(--tc), 0 0 14px -2px color-mix(in srgb, var(--tc) 40%, transparent);
    }
    50% {
        border-color: color-mix(in srgb, var(--tc) 45%, transparent);
        box-shadow: 0 0 0 var(--gw) color-mix(in srgb, var(--tc) 45%, transparent), 0 0 30px 2px color-mix(in srgb, var(--tc) 55%, transparent);
    }
}
```

`prefers-reduced-motion` handling is unchanged. No markup change — CSS keyframe only.

## Contract fix needed — §4 is now ambiguous about GlowConfig

Contract §4 (« App-owned, NOT in the export ») still lists `GlowConfig` as app-owned. That clause described the
**old app component** (`apps/web/src/app/components/GlowConfig`), which we deleted once your 2026-07-16 export
shipped the dedicated **GlowConfig screen** under `ui/screens/` (DS-owned, covered by our drift gate). The stale
clause already misled an automated fix into believing a direct edit was contract-legal. Please update §4 and the
« Do NOT ship » list of §2: `ErrorBoundary` and `WindowControls` remain app-owned; the GlowConfig **screen** is
yours.

## Markup request — engine layout alerts need a visible surface in the AppShell chrome (0.4.5)

The engine now publishes a typed layout alert to the cockpit (`layoutAlert` event, tagged union — already in
`bindings.ts` / mirrored in the app driver state):

```ts
export type LayoutAlertDto =
    | { kind: "belowFloor"; tileWidth: number; minWidth: number }        // legacy V0 floor warning
    | { kind: "overflow"; tables: number; slots: number; stacked: number } // more tables than layout slots
    | { kind: "placementDrift"; tables: number; maxDw: number; maxDh: number }; // 0.4.5 — see below
```

`placementDrift` is new: after tiling, the poker room re-imposed its own window geometry (minimum size / size
steps), so N tables sit at a frame ≠ their tile even after the engine's corrective re-fit pass. The player should
SEE this (their grid is not what the designer promised) without digging into logs. `null` clears the alert.

**Ask:** a discreet, non-blocking alert affordance in the AppShell chrome (top bar area, near the engine
indicator) that the app can feed from this union — amber/warn tone, icon + short text, dismiss NOT needed (it
clears itself when the engine reports the drift resolved). One line of copy per kind is enough; suggested fr/en:

- `placementDrift` — fr: « {tables} table(s) redimensionnée(s) par la room (Δ jusqu'à {maxDw}×{maxDh} px) » /
  en: "{tables} table(s) resized by the room (Δ up to {maxDw}×{maxDh} px)".
- `overflow` — fr: « {tables} tables pour {slots} emplacements — {stacked} empilée(s) » / en: "{tables} tables for
  {slots} slots — {stacked} stacked".
- `belowFloor` — reuse the existing designer floor-alert copy.

Props-only as per §3 (the app passes the union + locale, the screen renders). Until this lands, the alert is
logs-only (engine WARN per table) + available in app state — no visual surface, by design rather than app-side CSS.

## Markup request — LayoutDesigner: warn when a grid cell is SHORTER than the room's minimum window height (0.4.6)

Field finding (0.4.5 live session): Unibet re-imposes a minimum window HEIGHT (~372 px visible frame) after
tiling — a 3-row grid on a 1080p screen produces 360 px cells that the room physically cannot honour (the third
table's action bar ends up off-screen). The engine now measures and persists this floor:

```ts
export type LayoutConstraintsDto = {
    minWidth: number,
    factoryMinWidth: number,
    minHeight: number | null,          // NEW — room-imposed minimum window height (visible frame px); null = unmeasured
    factoryMinHeight: number | null,   // NEW — same, from the factory reference profile
    room: string,
};
```

**Ask:** in the LayoutDesigner's existing min-window panel (the one with the width floor + below-floor alert row),
also surface the HEIGHT floor: display it next to the width (e.g. « min 480 × 372 px »), and raise the same
alert-row treatment when any placed tile's cell height falls below `minHeight` — copy suggestion fr:
« {count} rangée(s) sous la hauteur minimale de la room ({cellHeight}px < {minHeight}px) — la room refusera le
redimensionnement » / en: "{count} row(s) below the room's minimum height ({cellHeight}px < {minHeight}px) — the
room will refuse the resize". A `null` minHeight hides the height part entirely (nothing measured, nothing shown).
Props-only as per §3; the app already feeds `LayoutConstraintsDto` to the screen.

Reminder: the engine-alert affordance in the AppShell chrome (previous report section, `layoutAlert` union with
`placementDrift`) is still pending — `placementDrift.maxDh` is precisely this height floor showing up live.
