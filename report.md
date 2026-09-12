# Rapport de vague — 0.7.11 (2026-09-12)

Écrivain : lt-atelier. Ce rapport **remplace** celui de la 0.7.9 et le reprend : le drop 0.7.9 est toujours
attendu, deux de ses trois demandes tiennent telles quelles, la troisième est **annulée** par le moteur.

## ⚠️ Annulation — la capture remplacée n'existe plus (#292, lot moteur #295)

Le rapport précédent demandait une tête de bannière « Capture remplacée sur k taille(s) », **sous réserve du
contrat moteur**. La réserve a tranché : **elle n'a plus d'objet**.

Fichier durable : [`roomprofile-0711-capture-remplacee.md`](./roomprofile-0711-capture-remplacee.md)
(source : `doc/agents/claude-design-0711-capture-remplacee.md`, release/0.7.11 @ `934eec0f`).

La 0.7.9 plafonnait la station 3 à une capture par taille et par tour, et le bouton **supprimait** la capture
précédente de la même taille. Le terrain a tranché : un jeu exhaustif demande plusieurs mains par taille. Le moteur
capture désormais à chaque appui et le bouton **ajoute** — rien n'est jamais remplacé ni supprimé implicitement.

- `CaptureFailure.failures[].kind = "replaced"` reste au contrat (aucune migration), mais **le moteur ne l'émet
  plus** : la branche d'affichage est morte, à retirer.
- `CaptureFailureNotice` : **une seule tête**, celle des refus — « Capture refusée sur k tailles sur n ».
- Chaînes `captureReplaced` et `captureRefusedOrReplaced` : **supprimées**, FR et EN.
- Ligne par taille : inchangée, le message du back verbatim.

Si le drop en cours porte déjà la tête « remplacée », il suffit de la retirer : rien d'autre de la 0.7.9 ne bouge.

## Toujours attendu — la station 3 dit ce qu'elle refuse et ce qu'elle diffère

Fichier durable : [`roomprofile-079-station3.md`](./roomprofile-079-station3.md). Les deux points ci-dessous sont
**inchangés** ; seule la section #277 de ce fichier est caduque.

- **Asset refusé visible** (#278) : `onError` sur le moniteur de la station 3 (callout d'échec, chaîne
  `tourShotRefused(label)`) et sur les vignettes de `ShotStrip` (`data-failed`, chaîne `shotImgRefused`), idiome
  déjà en place dans `PipelineFrame`. Aucun champ de contrat.
- **Rien de recalculé pendant la série** (#276) : une note statique en station 3 (`tourCoverageDeferred`) —
  l'app ne relit plus la couverture qu'à la sortie de la station. La 0.7.11 étend cette règle à **toutes** les
  mutations de l'écran : supprimer, renommer, désigner la capture principale, poser le délai, poser l'unité posent
  leur effet sans aucune relecture. La note vaut donc pour la station entière, pas pour la seule série de capture.

## Règles inchangées

Un seul drop cumulatif avec manifeste ; version du prototype identique ; `previewOnly` vide ; FR/EN complets ; lint,
typecheck et react-doctor à zéro sans suppression ; conserver tous les acquis 0.7.6 à 0.7.8 et les demandes permanentes.
Import par `pnpm import-ds` seulement, puis tests app, e2e complète sans retry et parité pixel.
