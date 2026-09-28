# Demande Claude Design — 0.8.0 : choisir la source du seed

Issue d'origine : [#501](https://gitlab.laneuville.me/rom1/tatami/-/issues/501) (G1 note 12493). Écrivain exchange :
lt-atelier. Ce fichier appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.
Publiée le 2026-09-28 sur l'accord de Romain : `roomprofile-080-source-du-seed.md` sur l'exchange.

## Ce que le moteur change

Le plan de seed d'une taille devient une liste. `SizeBucketDto.seeds` (au lieu de `seed`) sert une entrée par autre
taille calibrée, la plus proche en ratio d'abord : `{ from, zones, points, replaced, default }`. `default` désigne la
taille source de la room, celle que le geste prend d'office. Vide = aucune autre taille calibrée, ou taille retenue.
`seedBucket(room, sizeId, from, context)` reçoit la source choisie ; une autre est refusée en la nommant.

Au terrain du 27/09, 1600×600 projetée depuis la source 1572×1080 (ratio 1,456 contre 2,667) tombait mal, alors que
1920×720, de même ratio, était calibrée : seedée depuis elle, la géométrie est celle que Romain a validée (0 px).

## Ce qui est attendu de l'écran

Station 4, `SeedControl` du rail : le joueur choisit la source dans `bucket.seeds`, dans l'ordre servi, le défaut
présélectionné. Le bouton dit la source qui sera projetée et ses comptes (zones, points, rectangles remplacés), comme
aujourd'hui `seedPlan(zones, from, replaced)`. Le geste devient `onSeedFromNearest(sizeId, from)` (renommage libre, par
exemple `onSeedFrom`). L'écran ne trie ni ne filtre : l'ordre et le défaut sont servis. Une seule entrée : pas de choix à
montrer, le bouton seul. Liste vide ou plan à zéro zone et zéro point : désactivé, avec son mot, comme aujourd'hui.

En attendant le drop, l'app mappe `seed` sur l'entrée par défaut et envoie sa source : le geste et l'affichage désignent
la même taille.
