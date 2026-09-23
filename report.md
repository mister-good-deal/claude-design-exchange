# Rapport de vague — 0.7.19, quatrième demande (2026-09-23)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent. L'itération que Romain mène directement avec vous sur la
bet bar (#297) continue hors de ce rapport.

## Ce que le drop 2026-09-23.2 a tenu

Les trois points de « Traitement de la taille » et le défaut #446 : importés (MR !426, !429), `lint`, `tsc` et
react-doctor verts, « Défaire votre coupe » à la souris prouvé par l'e2e. Rien à en reprendre.

## La demande neuve — choisir la taille de référence des montants

Fichier : [`roomprofile-0719-changement-de-reference.md`](./roomprofile-0719-changement-de-reference.md) (source :
`doc/agents/claude-design-0719-changement-de-reference.md`). Un point : sur le panneau « Traitement de la taille »
d'une taille hors référence, le contrôle « Lire les montants à cette taille » (`onSetAmountReference`, offre), la ligne
`referenceState` (« référence 1572 × 1080 : ✓ attendu sur Pot total »), et le panneau rendu aussi sans facteur
(`scale: null`, `abstain` dit pourquoi).

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le [`lint-bundle/`](./lint-bundle/)
à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; le point déclaré dans
`parity.declaredChanges`.
