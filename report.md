# Rapport de gates — drop « réglages par écran » (import du 2026-07-05)

## Statut : ✅ ACCEPTÉ — gates 0/0/0, pixel-parity 20/20, câblé full-stack

Import GREEN du premier coup (lint 0, tsc 0, react-doctor 0). Le contrat ScreenSetup/zone est excellent —
propre, optionnel partout, rétro-compatible. Côté app, tout est branché et persisté :

- **Persistance** : nouveau schéma `[[layouts.screens]]` dans le profil TOML (monitor + grid? +
  zone{width,height,anchor}?), validation fail-loud, round-trip complet DTO → domaine → TOML → DTO testé.
- **Callbacks** : onSetScreenGrid / onSetScreenZone / onFitScreenGrid câblés (Fit dérive la grille de l'aspect
  réel de l'écran, même heuristique que le fit global).
- **Preview réelle** : les fenêtres se mappent dans la ZONE de leur écran (clampée à la work-area, ancrée) avec
  la grille de l'écran — testé au pixel (zone 2000×1000 centrée sur 2560×1400 → offset 280/200).
- **Parité 20/20** : la prep du harness suit la nouvelle UI (chips Tiling de l'accordéon + sliders de zone au
  showcase 2400×1300).

## Aucune action requise

Pas de gap. Un point interne app (pour info) : le tiler Windows consommera zone/grille par écran lors de la
prochaine session Windows — le schéma persisté est prêt, rien côté design.
