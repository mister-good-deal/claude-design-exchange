# Vague 0.7.0 — drop 2026-09-04 REFUSÉ à la gate (un warning react-doctor), les deux demandes honorées dans l'archive

**État** : merci, le drop `2026-09-04` (93 fichiers) porte les deux surfaces demandées **en entier** — la carte
« vue moteur » (`EngineView.{tsx,module.css,fixtures.ts}`, lecture seule, `legal: null`, « hors décision », « aucune
main suivie » sans zéro de repli, les 30 clés `engineView.*` FR/EN, le slot `engineView` dans `AppShell`, l'entrée
`engine` dans `standalone.entry.tsx`) et Room Profile (`displayUnit` non optionnel + `onSetDisplayUnit` en offre dans
`TourStation`, `presence` dans `ZoneKind` et `PointKind`). La déviation `EngineViewData.locale: LocaleCode` non
optionnel est acceptée. Rien n'a été retouché à la main : **le drop n'est pas importé**, une gate est rouge.

## Le rouge, verbatim (`react-doctor --blocking warning`, exit 1)

```
  ⚠ Accessibility: Role used instead of HTML tag
    → Replace `role` with the matching HTML element when one exists.
    ui/screens/TourStation.tsx:385
  All 1 issue  ·  Accessibility › 1 warning
```

C'est le `<span … role="group" aria-labelledby={UNIT_LABEL_ID}>` qui enveloppe les deux segments du sélecteur d'unité
neuf (`DisplayUnitField`). Régression du drop : la même gate est verte avant import. Correctif à la source (§5 du
contrat, jamais côté app) : un `<fieldset>` + `<legend>` pour le groupe, ou le motif `role="radiogroup"` /
`role="radio"` que ce même export emploie déjà ailleurs sans déclencher la règle. Re-drop attendu avec
`manifest.version` bumpé.

## Les trois écarts au contrat du rapport précédent, toujours présents

1. `manifest.version` `2026-09-04` ≠ `parity.previewVersion` `2026-09-03` — §8 : les deux se bumpent à l'identique,
   sinon l'alarme de fraîcheur de l'importeur devient du bruit.
2. `assets/`, `NOTES.md`, `README.md` dans l'archive, hors §1 et non déclarés dans `targets` (ignorés).
3. `keepGlob` `ErrorBoundary.*` / `GlowConfig.*` sur `ui/` et `ui/screens/` alors que ces fichiers sont app-owned
   (§4) — no-op à retirer.

## Demandes durables

`engine-view-card.md` et `roomprofile-display-unit-presence.md` restent ouvertes jusqu'au re-drop vert ; elles
seront closes dans le rapport de la gate qui l'intègre. Les demandes précédentes restent honorées.
