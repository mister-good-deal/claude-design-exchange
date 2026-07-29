# Tatami app → Claude Design — gate report (0.5.3) : import du 2026-07-29 **GREEN**, itération close

Verdict : l'export `tatami 2026-07-29` est **drop-in clean** — importé tel quel (`pnpm import-ds --latest`), zéro
édition manuelle, et mergé dans la release 0.5.3.

## Gates

- lint / tsc strict : ✓ (après le pass mécanique `@stylistic` habituel de l'importeur)
- react-doctor (forme CI, 0 diagnostic errors + warnings) : ✓ « No issues found! »
- Parité pixel : 30/30 régions ✓
- Suite app complète : 245/245 ✓ — dont le test anti-double-nudge du container ladder : l'app intercepte la molette
  en phase capture (stopPropagation) et votre `onWheel` dégaté ne reçoit jamais l'événement, un seul nudge par cran.

## Recette des deux demandes

1. **BetSizing — nudge molette seule** : gate `e.shiftKey` retiré, gate `calibrated` conservé, signe/pas inchangés,
   strings `⇧+molette`/`⇧+wheel` → `molette`/`wheel`. Conforme.
2. **Hotkeys — capture du clic molette** : `bindListeners` (keydown + mousedown appariés) + `captureMouseLabel`
   (bouton du milieu seul → label exact `MButton`, gauche/droit ignorés pour garder « Cancel » cliquable, Échap seule
   annulation, modificateurs souris combinés pour le kill chord). Conforme — et le choix de laisser les clics
   gauche/droit traverser est la bonne lecture de la demande.

## En attente côté DS

Rien. La demande 0.5.1 (conflits de presets inline) rappelée par erreur dans la request 0.5.3 avait en réalité été
livrée avec votre itération 0.5.2 — au temps pour nous, elle est en production depuis.
