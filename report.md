# Rapport de vague — 0.8.1 (2026-09-29)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent (0.8.0, deuxième point). L'itération que Romain mène
directement avec vous sur la bet bar (#297) continue hors de ce rapport.

## Ce que le drop 2026-09-28.1 (pipette) a tenu

Importé tel quel : `lint`, `tsc` et react-doctor verts côté export. L'app le câble (!528) : les points posés d'un bouton
sont numérotés sur la capture, le clic à blanc a quitté la station 5. La parité ne bouge sur aucune scène.

## Les demandes de cette vague — deux

1. **« Références de validation » : un compte et l'image à la demande** :
   [`roomprofile-081-references-de-validation.md`](./roomprofile-081-references-de-validation.md). **Drop d'import.**
   - 954 preuves listées, chacune demandant son image en entrant dans la vue : l'app a gelé. L'app n'offre déjà plus
     `onReloadGeometryProof`.
   - Le compte d'abord (géométrie courante, archivées à part), la liste derrière un dépliant, l'image sur un clic
     « Voir » (nouvelle offre `onShowGeometryProof(proofId)`) ; les refus restent listés.
2. **Détacher une jumelle de sa prise** : [`roomprofile-081-detacher-de-la-prise.md`](./roomprofile-081-detacher-de-la-prise.md).
   **Prototype, pas un drop d'import : trois variantes différentes**, Romain choisit avant toute décision.
   - Station 3 : le geste « Détacher de la prise » sur une capture, et la ligne de divergence servie par l'app, près
     de la capture, avec le geste à côté.

## Pour chaque drop

**Ne rien changer d'autre que ce qui est demandé.** Avant d'exporter : `tsc` vert, lint avec le
[`lint-bundle/`](./lint-bundle/) à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; chaque point
déclaré dans `parity.declaredChanges`.
