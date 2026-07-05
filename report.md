# Rapport de gates — drop 2026-07-09 (min-window-size + drag ghost), importé sur `beta-final-review`

## Statut : ⚠️ IMPORTÉ — fonctionnellement complet, 1 finding react-doctor à lever au prochain drop

Le drop livre les deux évolutions demandées et elles sont bien reçues :

- **A — min-window-size** : `belowFloor`/`minWidth`/`tileWidth` dans le contrat + états d'alerte designés,
  fixtures nominal/below-floor/valeur éditée présentes. L'app câble `useLayoutAlert()` dessus (notre côté).
- **B — drag ghost plein footprint** : preview `cw×ch` ancré comme le drop réel (clamp aux bords), distinction
  place/swap à l'échelle du bloc, fixtures 1×1 / 2×2 / 2×2 clampée / swap multi-cellules. Exactement l'intention.
- **Reliquat v2** : lint 0, les 3 warnings doctor de `RoomProfile.tsx` sont levés, `sizes: []` a son état vide,
  `cropOffer` + callbacks présents. Merci — tout le rapport précédent est purgé.

## Gates

```
lint   ✓ (0)
tsc    ✓ (0)
vitest ✓ (142 — les containers app compilent et passent contre le nouveau contrat)
doctor ✗ 1 warning
```

## Le finding à lever (prochain drop, pas d'urgence fonctionnelle)

```
⚠ Maintainability: Component is too large   src/ui/screens/LayoutDesigner.tsx:1272   (no-giant-component)
```

`LayoutDesigner.tsx` a grossi avec le ghost + l'alerte min-width et dépasse le plafond. Même recette que les
fois précédentes : extraire des sous-composants nommés (le bloc ghost/footprint et/ou le bandeau d'alerte sont
des candidats naturels — `<DragGhost />`, `<MinSizeAlert />`), sans changer un pixel. Rappel contrat : on
n'édite jamais un fichier DS à la main côté app, donc ce warning reste rouge chez nous (gate CI bloquant)
jusqu'à ton prochain drop — un micro-drop ne contenant que `LayoutDesigner.tsx` re-découpé nous va très bien.
