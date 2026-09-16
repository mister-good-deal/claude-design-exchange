# Rapport de vague — 0.7.15 (2026-09-16)

Écrivain : lt-atelier. Ce rapport **remplace** celui de la 0.7.14. Ses trois demandes (#307, #305 et #303) sont
honorées par le drop `2026-09-15`, importé dans la 0.7.14 : il n'y a rien à reprendre. L'itération que Romain mène
directement avec vous sur la bet bar (#297, sizing par position) continue hors de ce rapport : ne la perdez pas.

Fichier durable de la vague : [`roomprofile-0715-station5-par-taille.md`](./roomprofile-0715-station5-par-taille.md)
(source : `doc/agents/claude-design-0715-station5-par-taille.md`). Cinq demandes, un seul drop.

## La décision qui fonde la vague (Romain, 2026-09-16, #315)

Une sonde de bouton suit son bouton : elle se déplace et se valide avec lui. Sa couleur est prélevée par taille sur
l'image de preuve. Hors tolérance, elle est marquée « à reprendre » en station 5. Le pixel neutre `bet_blur` garde son
propre état : il est validé d'office hors des ROI de la barre d'action, sinon il est « à reprendre ». Une pose
manuelle en station 4 le valide. La station 5 devient le chemin d'exception.

## 1. Station 4 — le compteur de ROI validées dans tous les états (#310)

`adjustMeta` affiche `bucketProgress(zonesValidated, zonesTotal)` pour `toCalibrate`, `seeded` et `calibrated`. Un
`tombstone` garde sa note. « projeté depuis <WxH> » quitte la méta.

## 2. Station 4 — les pixels de référence (#315, #310)

Aucune coche de validation sur une sonde : elle suit son bouton. `bet_blur` affiche « à reprendre » avec le motif
servi (`CalibPoint.retake?: string`). Le poser le valide.

## 3. Station 5 — par taille (#315)

- `BucketRail` en tête ; une carte émet `onSelectSize`.
- Compteur par taille : `SizeBucket.probesReady` / `probesTotal`, servis.
- Marque `Probe.retake?: string` avec son motif.
- `ColorSurface` n'est cliquable que sur une cible marquée. Une cible prête montre sa couleur et sa preuve. Une cible
  sans couleur renvoie vers la station 4 pour valider son bouton.
- Les enseignes ne changent pas.

## 4. La pose d'un relevé transmet la capture affichée (#314, bloquant au terrain)

`onPlaceColorSample(sizeId, targetId, index, at, shotId)` : `shotId` est la capture que `ColorSurface` affiche, au
clic comme au `nudge` clavier. C'est la règle durable de 0.7.14 : aucun id de domaine qu'une écriture utilise ne reste
sans argument.

## 5. Une ligne de pixel nomme un seul bouton (#313)

Un groupe par disposition (« Deux boutons check / bet »), puis une ligne par action (« Check », « Bet »), en station 4
comme en station 5. `pixelLine` n'accole plus l'action et la déclinaison. La sonde `bet` arrive par le catalogue servi.

## Fixtures

- Station 5 : une taille non principale, avec une cible « à reprendre » et une cible prête.
- Station 4 : `bet_blur` « à reprendre ».

## Règles inchangées

- Un seul drop cumulatif avec manifeste ; version du prototype identique ; `previewOnly` vide ; FR/EN complets.
- Lint, typecheck et react-doctor à zéro, sans suppression.
- Conservez tous les acquis de 0.7.6 à 0.7.14 et les demandes permanentes.
- Import par `pnpm import-ds` seulement, puis tests app, e2e complète sans retry et parité pixel.
