# Rapport de vague — 0.8.0, deuxième point (2026-09-28)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent (0.8.0, premier point). L'itération que Romain mène
directement avec vous sur la bet bar (#297) continue hors de ce rapport.

## Ce que le drop 2026-09-28 a tenu

Il répond aux trois demandes ouvertes : « Mesurer » compte comme le dry-run, le choix de la source du seed, et les
réglages de lecture par style et par taille. Importé tel quel : `lint`, `tsc` et react-doctor verts côté export. L'app le
câble (!521) : l'Atelier sert l'étage de chaque réglage et écrit un champ à la fois, la station 4 envoie la source
choisie, le compteur de « Mesurer » lit ce que le moteur sert. La parité ne bouge sur aucune scène.

## La demande de cette vague — une seule

**La pipette montre les points d'un bouton, sans clic à blanc** : [`roomprofile-080-pipette.md`](./roomprofile-080-pipette.md).

- Station 5, pipette : sur la capture, les points déjà posés du bouton actif, numérotés (1), (2), (3), le point actif
  distingué. Les positions sont servies (`Probe.point` de la cible, de son `#2` et de son `#3`) ; l'écran ne calcule rien.
- Retirer le « clic à blanc » de la pipette (`ActuatorRow`, `onTestPoint`) et ses libellés ; `unplacedClick` devient
  « pas encore posé ». Le clic de test de la station 4 (`onTestClick`) reste.
- Rien à faire pour l'enchaînement 1 → 2 → 3 : l'app sert déjà la cible suivante après un prélèvement accepté.

## Pour chaque drop

**Ne rien changer d'autre que ce qui est demandé.** Avant d'exporter : `tsc` vert, lint avec le
[`lint-bundle/`](./lint-bundle/) à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; chaque point
déclaré dans `parity.declaredChanges`.
