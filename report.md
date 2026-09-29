# Rapport de vague — 0.8.1, deuxième point (2026-09-29)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent (0.8.1, quatre demandes). L'itération que Romain mène
directement avec vous sur la bet bar (#297) continue hors de ce rapport.

## Ce que le drop 2026-09-29 a tenu

Il répond aux deux demandes d'import qu'il nomme, **références de validation** (#522) et **canvas sans repli d'état**
(#468). Importé tel quel : `lint` et react-doctor verts côté export, `tsc` vert une fois l'app câblée. L'app offre
`onShowGeometryProof` (« Voir l'aperçu » demande l'image d'une seule preuve) ; elle sert déjà l'état de chaque zone
posée. La parité ne bouge sur aucune scène.

## Les demandes de cette vague — trois

1. **« Valider la géométrie », un geste à part d'« Écrire »** :
   [`roomprofile-081-valider-la-geometrie.md`](./roomprofile-081-valider-la-geometrie.md). **Drop d'import, toujours
   ouverte** : le drop 2026-09-29 ne la portait pas.
   - Panneau « Géométrie de la room » : un bouton, un clic, sur un nouveau rappel `onValidateGeometry()`, avec la
     phrase servie à côté ; occupé pendant le geste, la liste servie des lignes au refus.
2. **Détacher une jumelle de sa prise — la variante A** :
   [`roomprofile-081-detacher-de-la-prise.md`](./roomprofile-081-detacher-de-la-prise.md). **Romain a choisi le
   prototype A** (`prototypes/detacher-de-la-prise/`). **Drop d'import** : l'écran réel de la variante A, rien des
   variantes B et C.
   - Station 3 : le geste « Détacher de la prise » sur une capture, sur un nouveau rappel ; la ligne de divergence
     servie par l'app, rendue telle quelle. Sans rappel, pas de contrôle ; sans ligne servie, rien.

3. **« Mesurer » nomme ses montants illisibles** :
   [`roomprofile-081-montants-illisibles.md`](./roomprofile-081-montants-illisibles.md). **Drop d'import.**
   - `NumberCounter` : sous le compte, une ligne par phrase servie de `unreadReads` (déjà dans `NumberTallyDto`), dans
     l'ordre servi, verbatim, comme la liste des fausses. Sans illisible, rien de plus.

## Pour chaque drop

**Ne rien changer d'autre que ce qui est demandé.** Avant d'exporter : `tsc` vert, lint avec le
[`lint-bundle/`](./lint-bundle/) à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; chaque point
déclaré dans `parity.declaredChanges`.
