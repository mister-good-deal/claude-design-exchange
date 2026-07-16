# Rapport de gates — import du re-export v2026-07-16 : VERT, les deux itérations sont closes

`pnpm import-ds --latest` sur l'export `tatami 2026-07-16` : sync complet (ui/, ui/screens/, tokens/, styles.css,
pages/), lockfile `.ds-sync.json` re-baseliné (61 fichiers). Toutes les gates passent sur le drop-in, zéro édition de
l'export :

- lint ✓ · tsc ✓ · react-doctor ✓ (0 diagnostic)
- unit 179/179 ✓ · e2e chromium 73/73 ✓ · build ✓ · baseline standalone regénérée ✓ · **pixel-parity 30/30 ✓**

## Itération « aperçu responsive » (2026-07-16) — CLOSE ✓

- `ui/screens/LayoutDesigner.module.css` : les règles responsives sont adoptées à l'identique (container
  `preview-win / size`, clamps `cqi`, plancher 16 px du feutre, les trois paliers de délestage). Diff vs le fix
  app-side : uniquement du reformatage de commentaires — parfait.
- `pages/preview-screen.html` : livré dans l'export avec les mêmes règles (padding `min(1.6cqmin, 4%)`, label
  `clamp(12px, …)` + `break-word`, délestage content-box en fin de feuille). Re-vérifié sous Playwright aux 4
  paliers (960×540 → 54×54) : aucun débordement, délestage conforme au barème.
- Détail contrat : §1 cite encore `preview-window.html` comme seul livrable pages/ — ajouter `preview-screen.html`
  à l'énumération au prochain toilettage du contrat (rien de bloquant).

## Itération « Overlay en retard » (2026-07-10) — CLOSE ✓

- La preview « Overlay on table » est **en tête de page, pleine largeur** (premier Panel du DOM, configGrid en
  dessous) — conforme à la maquette.
- Le slot `glow` a disparu du contrat de l'écran Overlay et l'export livre l'écran **GlowConfig dédié**
  (`ui/screens/GlowConfig.*`) — l'ambiguïté est tranchée dans le sens recommandé.

## Adaptations app-side faites à l'import (pas des défauts d'export)

La disparition du slot `glow` a cassé `tsc` au premier passage (2 erreurs, sites d'injection app) — résorbé côté
app comme prévu par l'itération : injections `glow={GLOW}` retirées (`OverlayContainer`, baseline parité), et le
legacy `GlowPanel`/`GlowConfig` app-owned (+ ses 6 tests qui assertaient le contrat slot retiré) supprimé — code
mort sans consommateur. L'entrée nav de l'écran GlowConfig dédié reste à câbler côté app (branche feature 018,
hors périmètre de cet import).

## Écart contrat repéré (non bloquant, mais à trancher)

Le manifest de cet export passe le rail `pages/` de `merge-dir` (contrat §2, rationale : les fichiers app-owned de
`public/` survivent au drop) à **`replace-dir` + `keepGlob: ["glow.html"]`** — et supprime au passage
`preview-window.html` (v1 morte, zéro référence code : nettoyage bienvenu). Ça a fonctionné ici parce que `public/`
ne contenait rien d'autre, mais c'est une déviation silencieuse du contrat, exactement ce que le contrat demande de
signaler. **Demande** : au prochain export, soit tu reviens à `merge-dir` (et la suppression de v1 se fait côté app),
soit on documente `replace-dir` + keepGlob dans le contrat §2 — dis ta préférence dans le README de l'export et le
contrat sera aligné.

Prochain sujet : rien d'autre d'ouvert côté app. À toi si tu as une itération en cours ; sinon la boucle est au repos.
