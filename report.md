# Rapport de vague — 0.7.16 (2026-09-17)

Écrivain : lt-atelier. Ce rapport **remplace** celui de la 0.7.15. Ses six demandes (#310, #315, #314, #313, §6) sont
honorées par les drops `2026-09-16` et `2026-09-16.1`, importés dans la 0.7.15 (MR !311) : il n'y a rien à reprendre.
L'itération que Romain mène directement avec vous sur la bet bar (#297, sizing par position) continue hors de ce
rapport : ne la perdez pas.

Fichier durable de la vague : [`roomprofile-0716-renvoi-et-rail.md`](./roomprofile-0716-renvoi-et-rail.md)
(source : `doc/agents/claude-design-0716-renvoi-et-rail.md`). Quatre demandes, un seul drop.

## Pourquoi cette vague (campagne Windows 0.7.15, 2026-09-17)

En station 5, une cible sans couleur renvoie en station 4 **sans cible** : la pose est partie sur le pixel Fold de la
mauvaise barre, et le moteur l'a refusée. C'est la règle durable de la 0.7.14, appliquée à un geste qui change de
station : il emporte l'adresse complète de ce qu'il arme, et l'app n'en devine rien.

## 1. Le renvoi emporte sa cible (#322, bloquant)

`onPlacePoint(sizeId, pointId, shotId?)`. `TargetWaiting` émet `onPlacePoint(bucket.id, target.pointId,
target.shot.id)` : la taille du bandeau, le pixel de la sonde et la capture qui atteste sa barre. Le libellé nomme ce
qui sera armé (« Poser le pixel Fold · 2 boutons ▸ station 4 »). « Pointer le pixel » (`bet_blur`) passe `bucket.id`.

## 2. Station 4 — une puce n'arme rien sur une barre non attestée (#322)

Si la capture servie n'atteste pas la déclinaison d'une sonde (`attestsVariant` faux), la puce n'émet pas
`onSelectPoint` et dit quelle capture elle attend (« attend une capture à trois boutons »).

## 3. Station 4 — une ligne de pixel sur une seule ligne (#321)

Pastille, nom, étiquette et œil sur une ligne, comme une ROI. « suit la ROI de son bouton » ne repousse plus l'œil :
une fois par groupe, ou dans le `title`. Les notes (« à reprendre », §2) passent sous la ligne.

## 4. La déclinaison survit dans chaque nom accessible (#318)

`pixelPlaceAria`, puce posée, œil de la station 4 et `probeSelectAria` de la station 5 composent par `pixelLabel`
(« Fold · 2 boutons »). Le texte visible ne change pas.

## Fixtures

- Station 5 : une cible sans couleur dont la barre est attestée par une capture non principale.
- Station 4 : une taille à deux barres, capture servie à deux boutons.

## Règles inchangées

- Un seul drop cumulatif avec manifeste ; version du prototype identique ; `previewOnly` vide ; FR/EN complets.
- Lint, typecheck et react-doctor à zéro, sans suppression.
- Conservez tous les acquis de 0.7.6 à 0.7.15 et les demandes permanentes.
- Import par `pnpm import-ds` seulement, puis tests app, e2e complète sans retry et parité pixel.
