# Rapport de vague — 0.7.17 (2026-09-18)

Écrivain : lt-atelier. Ce rapport **remplace** celui de la 0.7.16, dont les cinq demandes sont honorées par le drop
`2026-09-17` (importé dans la 0.7.16, MR !319) : rien n'est à en reprendre, **sauf son §1, que cette vague annule**
(voir plus bas). L'itération que Romain mène directement avec vous sur la bet bar (#297, sizing par position)
continue hors de ce rapport : ne la perdez pas.

Fichier durable de la vague : [`roomprofile-0717-station5-sur-place.md`](./roomprofile-0717-station5-sur-place.md)
(source : `doc/agents/claude-design-0717-station5-sur-place.md`). **Sept demandes**, un seul drop. Toute la station 5
de la 0.7.17 en dépend. **Ajouts du 18/09, avant tout drop** : point 5, `onSetCardRankSubRoi` reçoit sa
taille ; point 7, l'outil glyphes et la station 6. **Corrections du 19/09**, alignées sur ce que le moteur servira :
la palette des enseignes est un produit de room relevé sur une taille nommée (`retainedOn`), et ses relevés sont de
session ; une taille retenue garde son badge « retenue » ; un blocker de validation finale n'a ni station ni ligne.
Et, même jour : en station 4, le bandeau collant ne recouvre jamais le canevas (fenêtre 1440 × 720,
« Pot total » masqué).


## Pourquoi cette vague (campagne Windows 0.7.16, 2026-09-18)

Neuvième campagne arrêtée par une station. Pour poser une sonde, Romain a fait station 5 → 4 → 3 → 4 → 5. La norme
est désormais écrite (`doc/architecture/contrat-des-stations.md`) ; quatre de ses clauses vous concernent : P1 (ce
qui est affiché est ce qui est écrit), P2 (une donnée, une source), P4 (aucun retour en arrière), **P9 (le design
system affiche, l'app décide)**.

## Ce que cette vague annule

- La porte `placeable()` de la 0.7.15 (#315) : toute cible est posable en station 5.
- Le renvoi de la 0.7.16 (§1, #322) : `TargetWaiting`, `handoverOf`, `goPlacePixel`, et `onPlacePoint` avec lui.

## Les sept demandes

1. **Station 5 sur place (#332, bloquant).** Plus de porte, plus de renvoi, plus de note `probeSettled`, plus de
   bouton vers la station 3. « Reprendre » (remplace « Refaire ») et « Annuler » (`onCancelColorSample(sizeId,
   targetId)`). `bet_blur` se pose dans la station (`kind: "point"`).
2. **Le cadre est la ROI.** Centré sur elle, marge proportionnelle, translaté et jamais rogné, contour toujours
   dessiné, taille de la ROI affichée.
3. **L'app décide (P9).** Servis : `Probe.shotId`, `Probe.blocked`, `Probe.origin` (posée ici / amorcée),
   `SuitSwatch.retained` et `retainedOn` (la palette est de room), `ProbeSample.sizeId` et `zoneId`. `shotForVariant`
   et `retainedColor` quittent `ui/`.
4. **Bandeau = verdict (#330).** `SizeBucket.verdict { state, done, total, lines? }`, celui de la station affichée,
   rendu tel quel dans les stations 3 à 6 ; aucun repli ; une taille retenue garde « retenue ».
5. **Station 4 (#328, #331).** Une ROI dont la ligne est refusée n'est pas cochée et dit son motif, sa capture et
   « Revalider sur cette capture » ; `WizardState.collateral` annonce ce qu'une écriture a fait tomber. **Ajout** :
   `onSetCardRankSubRoi(sizeId, family, rect)` reçoit sa taille, comme `onSetCardTemplate(sizeId, …)`. Le bandeau
   collant ne recouvre jamais le canevas.
6. **État local estampillé.** `ColorSurface`, `CardTemplateTool`, `ZoneWorkbench`, `PurgeControl` : lu sous la clé
   (taille, capture, cible) où il a été produit.
7. **Outil glyphes et station 6 (ajout, audit #351–#367).** Couverture glyphes servie pour la taille affichée (plus
   aucun compte dans `GlyphTool`) et « glyphes couverts » au bandeau de la station 5 ; saisie sans découpe dite, jamais
   déguisée en cellules ; nom de paquet gardé jusqu'au service ; `WriteVerdict.blockers` structurés et verdict périmé.

## Règles inchangées

- Un seul drop cumulatif avec manifeste ; version du prototype identique ; `previewOnly` vide ; FR/EN complets.
- Lint, typecheck et react-doctor à zéro, sans suppression.
- Conservez tous les acquis de 0.7.6 à 0.7.16 (hors ce qui est annulé ci-dessus) et les demandes permanentes.
- Import par `pnpm import-ds` seulement, puis tests app, e2e complète sans retry et parité pixel.
