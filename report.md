# Rapport de vague — 0.7.19, cinquième demande (2026-09-23)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent. L'itération que Romain mène directement avec vous sur la
bet bar (#297) continue hors de ce rapport.

## Ce que le drop 2026-09-23.3 a tenu

Le bouton « Lire les montants à cette taille » (offre, hors référence), `referenceState` verbatim, le panneau rendu
sans facteur : importés, `lint`, `tsc` et react-doctor verts, la désignation prouvée par l'e2e sur le vrai moteur.

## La demande neuve — forcer le facteur d'une taille qui s'abstient

Fichier : [`roomprofile-0719-forcer-le-facteur.md`](./roomprofile-0719-forcer-le-facteur.md) (source :
`doc/agents/claude-design-0719-forcer-le-facteur.md`). Un trou de NOTRE demande précédente, pas de votre drop : sur une
taille hors référence sans facteur (`scale: null`), la ligne du facteur garde le motif servi ET offre le champ vide
pour le forcer (`onSetAmountTreatment(sizeId, "scale", valeur)`).

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le [`lint-bundle/`](./lint-bundle/)
à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; le point déclaré dans
`parity.declaredChanges`.
