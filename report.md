# Vague 0.7.3 — drop 2026-09-06 RENVOYÉ : les cinq demandes sont honorées sur le fond, trois défauts mécaniques sous `ui/` bloquent l'import

**État** : drop `2026-09-06` validé sur copie scratch, **NON importé**. Cinq cibles synchronisées, 8 fichiers modifiés,
6 neufs (`AttestPanel`, `BucketRail`, `GlyphPacks`, `ScreenError` ×3), verrou 88 → 94. Sur le fond, merci : types,
rappels, 29 clés i18n FR/EN et postures y sont, toutes les déviations déclarées sont acceptées. Mais `lint` (1 erreur),
`tsc` (2 erreurs sous `ui/`) et `doctor` (5 warnings sous `ui/`) sont rouges **à cause du drop seul** (verts sur la même
branche avant import), et le rail interdit de corriger sous `ui/` côté app. **Re-drop `2026-09-06.1` attendu**, ne
portant que les trois réparations ci-dessous (et les deux clés mortes) ; les cinq demandes durables
(`roomprofile-073-*.md`, `screen-error-073-sortie-profil.md`) restent la référence, rien d'autre ne bouge.

## Les trois défauts, à réparer à la source

1. **`ui/screens/TourStation.tsx:439` — `mountInput` orphelin, et la sélection à l'ouverture est perdue.** Le drop
   remplace `ref={mountInput}` par `ref={inputRef}` dans `ShotRename` (l. 459) mais laisse la fonction : `lint`
   `@typescript-eslint/no-unused-vars`, `tsc` TS6133. Surtout, `mountInput` portait le `el?.select()` qui sélectionnait
   le nom de la capture à l'ouverture du champ : ce geste est perdu. Rendre le `ref` de rappel, ou porter le `select()`
   dans l'effet d'ouverture.
2. **`ui/screens/BucketRail.tsx:73` — `t.shots` n'existe pas sur `RoomProfileV3Strings`** (`tsc` TS2339). La clé
   `shots(n)` existe sur `RoomProfileStrings` (écran v2, l. 325), pas sur les chaînes v3 que `BucketRail` reçoit :
   ajouter `shots: (n: number) => string` à `RoomProfileV3Strings` et à ses deux locales (« {n} captures » /
   "{n} shots"). Au passage, `adjustMeta` (l. 61) garde le repli anglais en dur `` `${bucket.shots.length} shots` ``
   recopié d'`AdjustStation.tsx` : le faire passer par la même clé.
3. **`ui/screens/GlyphPacks.tsx` — 5 warnings `react-doctor/no-multi-comp`** (l. 72, 94, 146, 212, 255 : `PackDelete`,
   `PackTools`, `PackFilter`, `PackCreate`, `PackPicker`). Six composants et aucun ne s'appelle `GlyphPacks` : c'est le
   seul fichier d'écran sans composant principal homonyme, ce qui le distingue de `TourStation.tsx` ou `AttestPanel.tsx`
   que la règle ne relève pas. Correctif maison : un fichier = un composant principal qui porte son nom — trois fichiers
   `PackFilter.tsx` / `PackCreate.tsx` / `PackPicker.tsx`, chacun avec ses auxiliaires ; `GlyphTool.tsx` importe les
   trois. La gate `doctor` exige zéro diagnostic, warnings compris, aucune règle ne se désactive.

## À retirer dans le même re-drop

`RoomProfileV3Strings.shotsEyebrow` et `shotsTitle(n, max)` (« n / max ») : plus aucun écran ne les rend depuis le
retrait de `maxShotsPerSize` (#218 refuse ce compteur). Deux clés mortes, dans les deux locales.

## Ce que chaque demande a obtenu (vérifié fichier par fichier) — rien à reprendre

- **Attestation (#216)** : `VariantFamilyShape`, `VariantDef.zone/family/normal?/implies?` ; `AttestPanel` compose
  l'ensemble complet par famille (case d'écart → id normal au décochage, radiogroup sans défaut, « Non visible ici »
  sur `onMarkZoneAbsent/Present`, verrou `implies` avec motif) ; onze clés `attest*` ; postures sur sh1/sh5/sh6/sh7.
- **Taille station 3 (#215)** : `BucketRail` partagé (`station="adjust"` / `"tour"` + `cold`), `onTourSize` dans la
  Wiring, `tourSizeAria`, `takeOnlyIn`. Déviation acceptée : pas de note « manquante ici » à la station 3.
- **Paquets (#214)** : `GlyphPack`, `packCounts?`, `packId?`, `MeasureState.packs?`, rappels `onCreateGlyphPack` /
  `onSetGlyphPack` (+ rename/delete en offres), dix clés `pack*`, fixture bold/thin/`""`. Déviation acceptée : champ
  de création au pied de chaque section de famille.
- **Échec de capture (#218)** : `CaptureFailure`, `TourState.captureFailure?`, `onDismissCaptureFailure?`,
  `CaptureFailureNotice`, `maxShotsPerSize` retiré, six clés, deux fixtures.
- **Écran d'erreur (#212)** : `ScreenError` + css + fixtures, `ScreenErrorData/Callbacks`, `ScreenErrorWiring`, neuf clés,
  quatre fixtures ; hors parité, déclaré et accepté.

Une contrainte que l'app tiendra de son côté (pour information) : `AttestPanel.compose` prend l'écart d'une famille
`deviation` par `values[0]` ; le catalogue servi garantira exactement un `normal` et un écart par famille.

Verdict d'import (parité, e2e, ds-sync) au prochain rapport, après le re-drop et le câblage.
