# Rapport de vague — 0.7.21, deuxième point (2026-09-26)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent. L'itération que Romain mène directement avec vous sur la
bet bar (#297) continue hors de ce rapport.

## Ce que le drop 2026-09-26 a tenu

Le détail d'une zone du dry-run en liste, une puce par ligne non vide : importé, `lint`, `tsc` et react-doctor verts.
Le moteur sert désormais ces lignes.

## La demande de cette vague — une seule

Romain dégèle le DS pour ce point, bloquant pour la dernière session de la 0.7.x.

**Le seuil de luminance d'une taille** : [`roomprofile-0721-seuil-par-taille.md`](./roomprofile-0721-seuil-par-taille.md).

- Station 5, panneau « Traitement de la taille » : un cinquième réglage, « Seuil de luminance », entier 0–255, vide =
  « celui de la chaîne ».
- Il est servi par `AmountScaleDto.threshold` et réglé par `setAmountTreatment(…, "threshold", n)`.
- Il est offert à toutes les tailles, **référence comprise** (les quatre autres réglages restent refusés à la
  référence).

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le [`lint-bundle/`](./lint-bundle/)
à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; le point déclaré dans
`parity.declaredChanges`.
