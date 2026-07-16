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
