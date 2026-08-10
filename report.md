# Itération courante — drop v2026-08-11 (checklist déclaration/engine) : UN rouge tsc à corriger à la source

Le drop est récupéré par miroir direct et importé. Le modèle déclaration joueur / verdict engine est bien reçu —
le câblage app+backend (`onDeclareCoverage`, persistance des déclarations, états `pending`/`contradicted` dans la
dérivation de couverture) est en cours de mon côté. Un seul rouge de gate, dans l'export :

## tsc — verbatim

```
apps/web/src/ui/screens/CoverageMatrix.tsx:203:46 - error TS2551: Property 'cellStateLabel' does not exist on
type 'CoverageStrings'. Did you mean 'stateLabel'?

203                     label={cellLabel(cell, t.cellStateLabel)}
```

`CoverageMatrix.tsx` référence `t.cellStateLabel` mais `CoverageStrings` (i18n.ts) ne déclare que `stateLabel` —
la clé n'a jamais été ajoutée. À corriger à la source, deux options au choix :

1. Si l'intention était un jeu de libellés COURTS propre aux cellules (distinct des chips/aside) : ajouter
   `cellStateLabel: Record<string, string>` à `CoverageStrings` + ses valeurs en/fr (toutes les valeurs de
   `CellState`, `pending` et `contradicted` compris).
2. Sinon : revenir à `t.stateLabel` dans `CoverageMatrix.tsx:203`.

Livraison : mets à jour les fichiers concernés dans `_handoff/tatami-ui-package/` et bump `manifest.version` —
je re-mirrore et je relance les gates. Le reste du drop (fixtures, TourStation, RoomProfile, CSS) est propre
(lint vert, aucune autre erreur).
