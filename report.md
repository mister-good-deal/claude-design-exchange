# Iteration — l'export de l'écran Overlay est en retard sur le workspace

Constat d'intégration (feature 018, après l'import du re-export v2026-07-10) : Romain compare l'app à ta maquette
`ui_kits/tatami/Overlay.jsx` et l'app ne correspond pas — normal, **l'export livre un `ui/screens/Overlay.tsx`
ancien** (inchangé depuis l'itération 017). Deux écarts + une ambiguïté à trancher.

## 1. La preview « Overlay on table » doit être EN HAUT

Ta maquette place le panneau Preview **en tête de page, pleine largeur** (`order: -1`, commentaire « live preview —
on top, full width, keeps the table-window aspect ratio »), avec la grille de config (HUD stats / Color tags /
Player notes) en dessous. L'export, lui, rend la preview **en dernier** (markup final, aucun réordonnancement dans
`Overlay.module.css`). Côté app je ne peux pas réordonner un écran DS-owned (contrat : zéro CSS app sur `ui/`).

**Demande** : ré-exporter `Overlay.tsx`/`Overlay.module.css` alignés sur la maquette — preview en premier
visuellement (ordre DOM ou `order`, à ta main dans le set CSS-modules), pleine largeur, ratio 16/9 conservé.

## 2. Ambiguïté : le glow config est en double — tranche pour UNE source

- Ta maquette Overlay **embarque** une section « window glow — states + config » (`{GlowConfig && <GlowConfig />}`).
- Ton export donne au GlowConfig **son propre écran** + l'entrée nav « glow » (icône focus) — et c'est CE contrat que
  l'app a câblé (container, clamp width, bouton Preview branché sur le preview réel du layout actif, parité
  `glow-main`/`glow-panel` verte).

Les deux à la fois = la même config à deux endroits. **Demande** : choisis UN emplacement dans le prochain export.
Recommandation : garder l'écran dédié (déjà câblé et navigable) et sortir la section embarquée de l'Overlay — le
prop/slot `glow` de l'écran Overlay peut alors disparaître du contrat (l'app n'injecte plus rien dedans depuis
aujourd'hui). Si tu préfères l'inverse (section dans Overlay, plus d'écran dédié), dis-le explicitement dans le
README de l'export : l'app re-câblera.

## Pour info côté app (déjà fait)

Le panneau glow legacy que l'app injectait encore dans le slot `glow` de l'Overlay est retiré (il datait d'avant
l'écran GlowConfig et poussait la preview encore plus bas). L'app est désormais l'image exacte de ton export
courant ; l'écart restant avec ta maquette (preview en bas, pas de section glow) se résorbe à ton ré-export. Les
régions pixel-parity de l'écran Overlay seront re-mesurées à l'import (le réordonnancement va les déplacer — c'est
attendu, pas un blocage).

Rappel process inchangé : ré-export **complet** drop-in — `pnpm import-ds` doit rester vert (lint / tsc /
react-doctor) sans édition manuelle.
