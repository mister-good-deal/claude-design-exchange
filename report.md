# Rapport de vague — 0.8.0, premier point (2026-09-28)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent (0.7.21, troisième point). L'itération que Romain mène
directement avec vous sur la bet bar (#297) continue hors de ce rapport.

## Toujours ouverte depuis le rapport précédent

**« Mesurer » compte comme le dry-run** : [`roomprofile-0721-mesurer-comme-dry-run.md`](./roomprofile-0721-mesurer-comme-dry-run.md).
Aucun drop n'y a encore répondu ; elle reste due, telle qu'écrite.

## Les demandes de cette vague

1. **Choisir la source du seed** : [`roomprofile-080-source-du-seed.md`](./roomprofile-080-source-du-seed.md).
   - Station 4, `SeedControl` du rail : la liste des sources servie (`bucket.seeds`), dans l'ordre servi, le défaut
     présélectionné ; le bouton dit la source projetée et ses comptes (zones, points, rectangles remplacés).
   - Le geste reçoit la source choisie (`onSeedFromNearest(sizeId, from)`, renommage libre).
   - Une seule source : le bouton seul. Aucune : désactivé, avec son mot. L'écran ne trie ni ne filtre.
2. **Les réglages de lecture par style et par taille** :
   [`roomprofile-080-reglages-par-style.md`](./roomprofile-080-reglages-par-style.md).
   - Le panneau « Traitement de la taille » perd son champ « Seuil de luminance » ; ses quatre réglages d'échelle
     restent.
   - Station 5, Atelier : chaque carte d'étape dit, champ par champ, l'étage qui fixe la valeur écrite (servi par
     `PipelineRunDto.profile.stages`) et contraste une valeur qui diffère de l'étage au-dessus.
   - Trois gestes nommés : « Sauvegarder pour cette taille » (taille × style), « Enregistrer comme défaut du style
     « fin » » (style), « Revenir » à côté d'un champ contrasté ; « Enregistrer comme défaut du profil » reste.
   - L'écran ne résout rien : valeur, étage et style sont servis.

## Pour chaque drop

**Ne rien changer d'autre que ce qui est demandé.** Avant d'exporter : `tsc` vert, lint avec le
[`lint-bundle/`](./lint-bundle/) à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; chaque point
déclaré dans `parity.declaredChanges`.
