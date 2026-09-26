# Rapport de vague — 0.7.21, un seul point (2026-09-26)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent. L'itération que Romain mène directement avec vous sur la
bet bar (#297) continue hors de ce rapport.

## Ce que le drop 2026-09-24 a tenu

Tout est importé, avec `lint`, `tsc` et react-doctor verts :

- le bouton de seed lit le plan servi ;
- les chaînes de l'import PNG sont retirées ;
- l'atelier Overlay v2 est livré. Il est caché en 0.7.x : son câblage est prévu pour la 0.8.

## La demande de cette vague — une seule

Le design system reste gelé jusqu'à la 0.8 ; Romain le dégèle pour ce seul point, petit.

**Une capture par ligne dans le détail d'une zone du dry-run** :
[`roomprofile-0721-dry-run-lignes.md`](./roomprofile-0721-dry-run-lignes.md). `DryRunZone.detail` reste une chaîne,
mais le moteur y sépare ses éléments par `\n`. Le DS la rend en liste à puces, une puce par ligne non vide. Cela vaut
pour « lecture fausse — capture … », « motif jamais attesté sur la taille » et « relectures par rang ». Un détail d'une
seule ligne s'affiche comme aujourd'hui.

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le [`lint-bundle/`](./lint-bundle/)
à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; le point déclaré dans
`parity.declaredChanges`.
