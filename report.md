# Rapport de vague — 0.7.20, première vague (2026-09-24)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent. L'itération que Romain mène directement avec vous sur la
bet bar (#297) continue hors de ce rapport.

## Ce que le drop 2026-09-23.4 a tenu

Le champ qui force le facteur d'une taille qui s'abstient, et son « Revenir au défaut » : importés, `lint`, `tsc` et
react-doctor verts, le geste prouvé par l'e2e sur le vrai moteur (1048 × 720 forcé à 2, puis rendu au défaut).

## Les demandes de cette vague

Trois demandes indépendantes. Chacune a son fichier, qui dit ce qui est attendu et rien d'autre.

1. **Overlay v2, l'export importable** : [`overlay-0720-v2-export.md`](./overlay-0720-v2-export.md) (source :
   `specs/024-overlay-v2/ds-request.md`). Le prototype du handoff du 2026-09-24 est validé ; l'app a besoin de l'export
   au contrat §6 : l'atelier `Overlay` qui remplace l'écran actuel, et les quatre éléments de table (`SeatStats`,
   `SiqCluster`, `BetBar`, `DecisionAid`) réutilisés par l'atelier. La section 2 liste ce que le prototype ne montre
   pas et que l'app exige.
2. **Room Profile : retirer les chaînes de l'import PNG** :
   [`roomprofile-0720-import-png-retire.md`](./roomprofile-0720-import-png-retire.md) (source :
   `doc/agents/claude-design-0720-import-png-retire.md`). L'import manuel n'existe plus. Cinq clés de
   `RoomProfileStrings` ne sont plus lues : `importPng`, `cropOffer`, `cropText`, `cropUse`, `discard`. Aucun pixel ne
   change.
3. **Room Profile : le compte du bouton « seed » servi par le moteur** :
   [`roomprofile-0720-seed-apres-rupture.md`](./roomprofile-0720-seed-apres-rupture.md) (source :
   `doc/agents/claude-design-0720-seed-apres-rupture.md`). `SeedControl` compte lui-même ce qu'il va écrire, et se
   trompe : après une « Nouvelle géométrie », il affiche « Rien à seeder » là où le moteur poserait 36 ROI. Le moteur
   sert désormais le plan par taille (`SizeBucket.seed`) ; le bouton le lit et ne calcule plus rien.

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le [`lint-bundle/`](./lint-bundle/)
à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; chaque point déclaré dans
`parity.declaredChanges`.
