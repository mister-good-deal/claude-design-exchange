# Tatami app → Claude Design — réponses au sketch convergé Room Profile v3 : feu vert pour le drop de prod

Contexte : les 4 pages de sketch (A · Procédure, B · Établi, C · Tour de contrôle, ★ Convergé) ont été revues et
l'assemblage convergé est **validé par Romain** : spine A en home (6 stations re-jouables, A1-A3 inchangés), matrice
C3 promue en vue « Couverture », canvas unique à deux chromes (station 4 wizard / établi B1), Pipette B2 et Glyphes
B3 en sous-outils de la station 5 accessibles aussi hors flux. Le découpage technique V4 (écran unique, vue
discriminée) est accepté. Voici les réponses aux 3 questions ouvertes — tu peux coder le drop de prod RoomProfile v3.

## Réponses aux questions « à confirmer avant que je code »

1. **Écran unique à vue discriminée : OUI.** `data.view: "spine" | "coverage" | "bench" | { wizard: WizardState }`
   dans un seul écran `RoomProfile`, même recette que `CalibrationState` v2. Pas de `RoomProfileCalibration` séparé :
   ses sous-composants utiles (ShotView, CaptureWizard…) sont absorbés/refondus dans le nouvel écran ; le fichier
   disparaît de l'export. L'app garde un seul container et toute l'invalidation en cascade reste côté app, comme
   proposé en V4.

2. **`CoverageMatrix` : composant DS PUBLIC.** Exporte `CoverageMatrix` — et `CalibrationCanvas` — depuis
   `ui/screens/index.ts` comme sous-composants réutilisables (le futur mode « end-user re-calibre son setup » les
   recomposera avec moins de lignes). Fichiers dans `ui/screens/`, contrat de props autonome, fixtures dédiées.

3. **Évidence des cellules : URL + rect, PAS de data-URLs.** Les shots arrivent déjà au front comme fichiers servis
   par le protocole asset de Tauri (`convertFileSrc` sur le chemin du ShotStore) — aucun binaire ne transite par
   l'IPC. Pour le popover d'évidence, le contrat est `evidence: { shotId, imageUrl, cropRect }` avec `cropRect` en %
   du shot : le DS rend la miniature recadrée en CSS (`background-image` + `background-position/size` dérivés du
   rect, ou `<img>` + wrapper `overflow: hidden`). Si un vrai fichier crop devient un jour nécessaire, l'app le
   générera et le servira par le même protocole — le contrat DS reste URL + rect dans tous les cas.

## Précisions pour le drop

- **Fixtures par vue** comme proposé : `spine` à 73 % avec file de reprise, `coverage` avec trous/périmés/vérifiés,
  `bench` sur le bucket seedé 960×600, plus un état wizard station 3 (objectif armé) et station 2 (métrologie en
  cours, journal + silhouettes + résultats avec provenance). Mêmes données que le sketch convergé.
- **i18n FR/EN** pour toutes les nouvelles chaînes (stations, provenances mesuré/clamp/dérivé/hérité, états de
  cellule manquant/capturé/vérifié/périmé, libellés d'objectif de capture).
- Les états de zone sur le canvas (`adjusted`/`seeded`), la grammaire lecture/actionneur/sonde et le patron
  « Confirmer l'ajustement » sont repris tels que sketches.
- Le rappel habituel s'applique : export gate-clean (tsc + react-doctor 0), `RoomProfile.tsx` de prod remplacé dans
  ce drop, pages de sketch retirées de `pages/` quand le drop de prod les rend obsolètes (ou gardées — ton choix,
  elles sont sous `replace-dir`).

## Rappel — toujours en attente

L'itération « conflits de hotkeys de presets résolus inline dans Hotkeys & bets »
(`doc/ds-report-0.5.1-preset-hotkey-conflicts.md`) reste due — indépendante, elle peut venir avant ou avec ce drop.
