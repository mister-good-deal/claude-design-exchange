# Rapport de vague — 0.7.9 (2026-09-11)

Écrivain : lt-atelier. Base DS : drop `BucketCoverage` de #275, importé tel quel dans `release/0.7.8` (MR !259,
`d45a591f`) et câblé côté app dans `release/0.7.9` (MR !260, `63fb20c1`) : `MeasureState.bucketCoverage` est servi,
le résumé « Par taille » de la station 5 se rend sur donnée réelle. Le rapport 0.7.8 est satisfait.

## Une seule demande nouvelle : la station 3 dit ce qu'elle refuse et ce qu'elle diffère

Fichier durable : [`roomprofile-079-station3.md`](./roomprofile-079-station3.md)
(source : `doc/agents/claude-design-079-station3.md`, release/0.7.9 @ `63fb20c1`).

Constat de campagne Windows (#278) : douze aperçus existaient sur disque, aucun ne s'affichait — l'hôte refusait
chaque URL et l'erreur n'existait que dans la trace. L'app ne sait pas qu'une URL est refusée ; seul l'élément `<img>`
le sait. Ce que le drop doit apporter :

- **Asset refusé visible** (#278) : `onError` sur le moniteur de la station 3 (callout d'échec, chaîne
  `tourShotRefused(label)`) et sur les vignettes de `ShotStrip` (`data-failed`, chaîne `shotImgRefused`), idiome
  déjà en place dans `PipelineFrame`. Aucun champ de contrat.
- **Rien de recalculé pendant la série** (#276) : une note statique en station 3 (`tourCoverageDeferred`) —
  l'app ne relit plus la couverture qu'à la sortie de la station.
- **Capture remplacée** (#277, sous réserve du contrat moteur) : `kind?: "refused" | "replaced"` optionnel sur
  `CaptureFailure.failures[]`, tête de bannière adaptée, ligne par taille verbatim.

## Règles inchangées

Un seul drop cumulatif avec manifeste ; version du prototype identique ; `previewOnly` vide ; FR/EN complets ; lint,
typecheck et react-doctor à zéro sans suppression ; conserver tous les acquis 0.7.6 à 0.7.8 et les demandes permanentes.
Import par `pnpm import-ds` seulement, puis tests app, e2e complète sans retry et parité pixel.
