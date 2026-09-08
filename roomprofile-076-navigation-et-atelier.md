# Demande Claude Design — 0.7.6 : navigation froide et atelier

Demande groupée préparée pour le lieutenant, liée à
[#244](https://gitlab.laneuville.me/rom1/tatami/-/issues/244) et
[#247](https://gitlab.laneuville.me/rom1/tatami/-/issues/247).
Statut : proposition locale à transmettre ; aucun drop importé et aucun correctif d'écran livré par ce document.
Le suivi actif reste dans les issues GitLab. Le lieutenant consolide et publie seul le rapport de vague suivant
le [rail Claude Design](../../doc/agents/claude-design.md).

## Station 3 : choisir ce que l'on regarde à froid

Sans fenêtre de table ouverte, les captures des deux tailles existent et les attestations fonctionnent.
Les tuiles de taille doivent permettre de passer de 1048×720 à 698×720 et retour, avec mise à jour de la capture,
de la taille active et de la couverture, sans détour par la station 4.

| Situation | Geste | Résultat visible et contrat |
|---|---|---|
| Froid, deux buckets actifs | Choisir l'autre taille | Contenu et taille changent ; aucun resize ni capture |
| Froid, bucket sans capture | Choisir ce bucket | Taille active, « Aucune capture », couverture manquante |
| Froid | Capture F9 ou bouton | Capture désarmée, explication « Ouvrez une table pour capturer » |
| Chaud, fenêtre confirmée | Choisir une taille | Chemin de redimensionnement actuel conservé et résultat confirmé |
| Resize interrompu | Fenêtre fermée | État froid ; résultat tardif sans écrasement du bucket regardé |
| Retour à chaud | Confirmer une fenêtre | Taille regardée et taille réelle distinguées jusqu'à confirmation réussie |

Conserver la politique explicite des tombstones. Le libellé accessible doit décrire la navigation à froid,
sans promettre de redimensionner une fenêtre absente. Conserver la bande de tailles compacte réparée par #227.

Contrat proposé : réutiliser `onSelectSize(sizeId)` pour la navigation froide et `onTourSize(sizeId)` pour le
redimensionnement chaud. Le container tient le bucket consulté à froid ; aucun appel illégal à
`calibration_tour_size` pour fabriquer un état Tour sans fenêtre. La réconciliation chaud/froid appartient
à l'app, tandis que Claude Design fournit les tuiles et les états visibles.

Preuves dans la base lue : `BucketRail.tsx`, `BucketRail`, désactive toutes les tuiles avec
`tour && (cold || b.state === "tombstone")` ; `pickBucket` appelle toujours `onTourSize` en station 3.
`RoomProfileContainer.tsx`, `tourSizeId`, prend la taille du driver en étape Tour ; `tourStateOf` expose
la fenêtre nulle et la capture active. La recette doit donc prouver le contenu réellement regardé,
pas seulement que le bouton a reçu un clic.

## Station 5 : sélectionner la capture et la ROI dans l'atelier

L'entrée directe dans ATELIER doit permettre de sélectionner sur place une capture du bucket courant et
une ROI numérique de ce bucket. Réutiliser le vocabulaire et les composants des outils voisins :
`ShotPager` / bande de captures et choix explicite des zones `number` disponibles.

Afficher en permanence la taille, le libellé et l'ID de la capture, puis le libellé et l'ID de la ROI.
Le cadrage et les résultats affichés doivent correspondre à ces deux sélections. À l'ouverture depuis GLYPHES,
conserver la capture et la ROI d'origine. Si une valeur initiale est proposée automatiquement, le dire ;
ne pas présenter silencieusement la première ROI numérique comme le choix de l'utilisateur.

| État | Rendu attendu | Action |
|---|---|---|
| Capture et ROI sélectionnées, aucun résultat | Identité complète ; « Pas encore exécuté » | Exécuter disponible |
| Pas de capture | « Aucune capture pour cette taille » ; pas de résultat précédent | Exécuter désactivé |
| Pas de ROI numérique | « Aucune ROI numérique calibrée pour cette taille » | Exécuter désactivé |
| Capture supprimée ou ROI devenue indisponible | Sélection devenue invalide expliquée | Choisir une autre entrée |
| Image ou crop illisible | Message d'erreur avec capture/ROI concernées | Réessayer disponible |
| Lecture sans valeur reconnue | Abstention et cause | Résultat valide, distinct d'une erreur de chargement |
| Requête en cours | Identité des données demandées et état de chargement | Sélections restent cohérentes |
| Sélection ou réglage changé après lecture | « Résultat périmé — réexécuter » | Ancien résultat identifié ou masqué |
| Réponse tardive | Aucun ancien résultat présenté comme courant | Conserver le contexte choisi |

## Identité et péremption des résultats

Une exécution appartient au contexte **room, bucket, capture, ROI, portée et configuration de traitement**.
La révision de géométrie et celle du corpus invalident également la lecture si elles changent. Un changement
de capture doit périmer les images AVANT/APRÈS, les cellules, le texte reconnu et la confiance, même si les
paramètres restent identiques. Un changement de ROI ou de portée remet aussi en cause la sélection de glyphe.

La mesure du corpus a son propre contexte : room, bucket, corpus annoté et configuration mesurée. Son compteur
ne doit pas sembler mesurer seulement la capture affichée. Un changement de capture seul ne modifie pas une
mesure du même corpus ; un changement de corpus, ROI/configuration applicable ou taille peut la périmer.

L'app associe les requêtes à leur contexte et ignore une réponse périmée ou dépassée. Le DS reçoit les états
nécessaires pour rendre l'identité du résultat et sa péremption ; il ne déduit pas la fraîcheur du seul texte
des paramètres. Un échec de la requête courante ne rend pas frais le succès de la requête précédente.

Contrat de présentation retenu pour la demande, sans changement IPC :

- `onSelectShot(sizeId, shotId)` existe ; le pager de l'atelier doit le déclencher.
- Un choix explicite de ROI pose `pipelineZoneId` sans exécuter de lecture via
  `onOpenPipeline(sizeId, shotId, zoneId)` ; l'app corrigera le respect des trois arguments.
- `onRunPipeline(sizeId, shotId, zoneId, scope)` existe ; garder son contexte explicite.
- Étendre `MeasureState` avec `pipelineStatus?: "idle" | "running" | "ready" | "stale" | "error"`,
  `pipelineContext?: { sizeId: string; shotId: string; zoneId: string }` et `pipelineError?: string`.
  Le contexte est celui du résultat ou de la requête montrée, les sélecteurs restent le contexte courant.
  Sans statut fourni, utiliser `ready` si `pipeline` existe, sinon `idle`, pour les anciennes fixtures.
  Le DS masque les témoins périmés et présente « Résultat périmé — réexécuter » ; une erreur montre sa cause.
  L'app garde les générations de requêtes et empreintes de configuration en interne, ignore les réponses
  tardives et ne présente jamais un résultat d'une autre capture comme courant.
- Ajouter `numberMeasureStale?: boolean` pour distinguer une mesure périmée du corpus et une mesure absente.
  Le compteur périmé est masqué avec invitation à mesurer de nouveau ; changer seulement de capture ne le périme pas.

Preuves dans la base lue avec Serena :

- `PipelineTool.tsx`, `PipelineTool`, lit `activeShotId` et `pipelineZoneId` sans rendre de sélecteur ; son
  `canRun` ne teste que l'existence de la capture et de la zone.
- `PipelineTool.tsx`, `workshopZone`, retombe sur la première zone `number` ; une zone demandée par ID est
  rendue avant de vérifier le filtre des zones autorisées. Le sélecteur doit utiliser l'ensemble légal du bucket.
- `RoomProfileContainer.tsx`, `pipelineCallbacks`, ignore actuellement `_sizeId` et `_shotId` dans
  `onOpenPipeline`. L'ouverture depuis GLYPHES doit être testée avec une capture différente de celle déjà active.
- `usePipelineRail.ts`, `commands`, applique les réponses de `numberPreview` et `numberMeasure` à leur
  résolution sans vérifier leur identité ni l'ordre des requêtes. Une ancienne réponse peut remplacer la nouvelle.
- `usePipelineRail.ts`, `usePipelineRail`, efface `run` dans `open` ; éditer les paramètres et changer de
  capture ne passe pas nécessairement par cette méthode. La fraîcheur doit couvrir ces gestes explicitement.

## Recette demandée au drop et à l'intégration

1. Monter station 3 à froid, sans fenêtre, avec deux buckets aux captures et couvertures différentes.
   Cliquer la taille inactive : tuile active, ID de capture et couverture changent ; zéro resize et zéro capture.
2. Répéter avec un bucket vide, puis fermer une fenêtre pendant une opération et vérifier la transition froide.
   Monter ensuite à chaud et prouver que le resize atteint toujours le driver.
3. Ouvrir directement ATELIER avec deux captures et deux ROI. Changer chaque sélecteur puis exécuter :
   les arguments du driver, l'identité affichée et les images résultats sont ceux du choix courant.
4. Ouvrir depuis GLYPHES avec une autre capture/ROI : les deux sont sélectionnées, sans repli silencieux.
5. Exécuter A, changer pour B puis exécuter B ; résoudre B avant A. Seul B reste courant. Répéter en changeant
   paramètres, portée, bucket ou géométrie pendant l'attente ; une erreur tardive de A ne remplace pas B.
6. Après succès, changer seulement la capture : résultats de lecture périmés. Changer seulement un paramètre :
   même exigence. Contrôler séparément la péremption du compteur de mesure du corpus.
7. Vérifier tous les états vides et erreurs du tableau, navigation clavier, focus et libellés accessibles.
   Une abstention moteur n'est pas un état « aucune capture ».

Le drop est cumulatif pour les deux issues. Son import doit passer typecheck, lint, doctor sans diagnostic,
tests d'intégration ciblés, suite e2e complète et parité pixel, en plus des autres gates du dépôt.
Aucune retouche manuelle sous `apps/web/src/ui/` ni contournement CSS côté app. Les résultats de recette
et l'archive exacte du drop seront joints à la MR d'intégration ; ils restent à produire.
