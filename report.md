# Demandes à Claude Design — vague 0.8.5

Rédigée par lt-atelier le 05/10, publiée sur l'accord de Romain du 05/10. Ce fichier
rassemble la demande neuve de la campagne 0.8.4 (§1) et toutes les demandes restées sans drop depuis la 0.8.3 (§2 à
§8), vérifiées une à une contre le code DS du 04/10 (`.ds-sync.json` de la release 0.8.3). L'export est cumulatif avec
le dernier drop. Côté app, tout est déjà servi ; en attendant le drop, un geste reste refusé en le disant, ou n'est pas
offert, et aucune CSS app ne compense.

Ne sont **pas** reprises : `ds-request-083-atelier.md` (zoom du canevas, échantillon de capture) et
`ds-request-082-molette-note.md` (pas de molette, note de la SiqCluster), livrées ; `ds-request-083-bet-bar.md`, caduque
depuis #594.

## 1. Overlay : à 100 % d'opacité, rien ne transparaît (#607, neuve)

Campagne 0.8.4, vraie table Spin 1572×1080 : la bet bar réglée à `opacity { idle: 1, hover: 1 }` laisse lire « PAROLE »,
« MISER » et la rangée de presets de la room sous Third / Half / Two thirds / Pot. Même chose dans l'aperçu de l'atelier.
Règle de Romain : **à 100 % d'opacité, aucun composant de l'overlay n'a de transparence** ; il occulte complètement ce
qui est dessous.

L'opacité réglée arrive bien à ta maquette (`BetBar` → `opacityVars` → `--op-idle` / `--op-hover` sur `.bar`). La
transparence restante vient des fonds de `TableElements.module.css`, mélangés avec `transparent` :

- `.bar` : `color-mix(var(--bg-0) 74%, transparent)` plus `backdrop-filter: blur(5px)` ;
- `.chip` (tuiles de preset) : `color-mix(var(--text-hi) 5%, transparent)`, presque sans fond ;
- `.key` 8 %, `.stats` 86 %, `.aid` 85 %, `.railWarn` 88 %, `.siqGrid` 74 %, `.flyBox` 94 % plus `blur(7px)`,
  `.noteArea` 7 %, `.noteBtn` 6 %, `.siqRefusal` 94 %, `.disc[data-off]` 7 %.

**Demande** : des fonds pleins pour les quatre éléments (BetBar, SeatStats, DecisionAid, SiqCluster) et ce qu'ils
contiennent. Une teinte se pose sur un fond opaque (`color-mix(in srgb, var(--text-hi) 5%, var(--bg-0))` au lieu de
`… transparent`), le `backdrop-filter` disparaît. La seule translucidité de l'élément est alors celle de son opacité
réglée : à 1, la room ne se voit plus du tout ; à 0,58 (le défaut), l'élément entier s'estompe d'un bloc. L'en-tête du
fichier (« Translucent grounds are the page background mixed down, so the table reads through ») change avec. L'aperçu
de l'atelier (`OverlayCanvas`) rend les mêmes composants : il suit sans autre changement.

## 2. Raccourcis & mises : le curseur « Maintenir en jeu » part (`Hotkeys.tsx`, demande 0.8.3)

La cible « maintenir N tables en jeu » n'a jamais été câblée (aucun clic lobby) ; elle est retirée de l'app (décision
D4 du 03/10).

**Demande** : retirer le curseur (`keepTables`, `onSetKeepTables`, la chaîne `keepRunning`, et `tablesSuffix` s'il ne
sert qu'à lui) ; l'interrupteur « Ré-inscription auto à la fin d'une partie » reste seul dans son bloc. `HotkeysWiring`
perd `onSetKeepTables`. En attendant, l'app passe `keepTables: 4` et un rappel vide.

## 3. Halo des tables et Room Profile : le déclencheur et la ROI `timer` partent (demande 0.8.3)

Le déclencheur « Chrono proche de la fin » n'a jamais produit de halo ; le profil ne connaît plus la ROI `timer`.

**Demande** :

- `i18n.ts`, groupe `glow` : retirer `trigger.timer`, `hierTimerSub`, `timeLow`, `dataBlocked` et `unavailable`.
- `RoomProfile.fixtures.ts` : retirer la zone de kind `timer` du prototype ; `ZoneKind` perd `"timer"`, la chaîne
  `zoneKind.timer` disparaît, et le champ `timerThreshold` (ni lecteur ni source) aussi. L'état de capture « Timer
  visible / absent » reste. Au drop, `tests/e2e/calibration-v3.spec.ts` passe de 10 à 9 zones après le seed.

## 4. Layout designer : le dernier layout se supprime (`LayoutDesigner.tsx`, `SavedRow`, demande 0.8.3, #609)

Décision D7 du 03/10 : la suppression du dernier layout est autorisée, le tuilage devient inerte. Campagne 0.8.4 : la
corbeille du dernier layout est encore désactivée (curseur « sens interdit »), alors que les notes de version
l'annoncent corrigée.

**Demande** : la corbeille de chaque layout enregistré est active, le dernier compris (`canRemove={data.saved.length >
1}` disparaît, avec le titre `keepOneLayout`, fr et en). Sans aucun layout enregistré, la liste dit : **« Aucun layout :
Tatami laisse chaque table à sa place et la lit là. »** (en : « No layout: Tatami leaves each table where it is and reads
it there. »). Le shell accepte déjà la suppression du dernier layout.

## 5. Mises : l'écran BetSizing et la sauvegarde de templates de glyphes partent (demande 0.8.4)

Le ladder 019 est retiré de bout en bout (#594) ; la bet bar sert la liste de `[sizing]` de la table survolée.

**Demande** :

- Retirer `BetSizing.tsx`, `BetSizing.module.css` et leurs exports (`screens/index.ts`, `standalone.entry.tsx`,
  `contract.ts`). Garder `SizingStreet`, `SizingPresetCfg` et `SIZING_FIXTURE` dans un module qui survit, par exemple
  `SizingUnit.fixtures.ts` ; l'app suit l'import au drop.
- `RoomProfile.fixtures.ts` : retirer le rappel `onSaveGlyphTemplates` et la mention qui en parle (l. ~1682) ;
  `i18n.ts` : retirer la clé `saveTemplates` (type, en, fr).

## 6. Géométrie : une archive abîmée se liste et se supprime (`GeometryPanel.tsx`, demande 0.8.4)

Une archive dont la vérification échoue ne bloque plus l'écran : le shell la sert à part
(`RoomGeometryDto.damagedArchives`, `id` et `reason`), et `geometry_delete_damaged_archive` la supprime.

**Demande** : sous `ArchivedList`, une liste « Archives abîmées » (n), une ligne par archive : son identifiant (mono),
la raison servie telle quelle, et un bouton **« Supprimer »** (en : « Delete »), seul geste offert ; une note : **« Une
archive abîmée ne se consulte plus : elle se supprime. »** (en : « A damaged archive can no longer be read: it can only
be deleted. »). Données : `damaged: readonly { id: string; reason: string }[]`, rappel `onDeleteDamaged(id)`.

## 7. Room Profile : stations et gestes que le shell refuse (demandes 0.8.4, #595)

- **F3, « Valider la géométrie » sans version** (`GeometryPanel.tsx`, `ValidateBlock`) : le shell inscrit la validation
  même sans version de client (`lastValidation.client` vaut `null`). Ta maquette désactive encore le bouton tant
  qu'aucune version n'est lue ni saisie (`disabled={busy || !ready}`). **Demande** : l'offrir sans version (la saisie
  reste facultative) et rendre une validation sans client avec « version inconnue » / « unknown version ».
- **F17/F18, onglets et ‹ › vers une station verrouillée** (`RoomProfileWizard.tsx`) : le shell sert
  `StationStatusDto.locked` (`metrology` | `no_size`) ; l'app refuse le geste en le disant. **Demande** : désactiver
  l'onglet et la flèche d'une station dont `data.stations[i].status === "locked"`.
- **F20, « Tester en direct » et « Conserver ces règles » sans règles** (`DetectStation.tsx`) : **Demande** : ne pas
  les offrir (`disabled`) quand `detect.rules` est vide.
- **F6, corrections de découpe d'une découpe caduque** (`GlyphTool.tsx`) : le crop sert `staleCutEdits` (scissions et
  jointures posées contre une découpe automatique qui a changé), la réponse d'un geste de découpe `droppedCutEdits`
  (celles qu'il a effacées). **Demande** : la même note que pour `staleRejections`, sur le crop pour `staleCutEdits` et
  à la réponse du geste pour `droppedCutEdits`.

## 8. Raccourcis : le refus d'une préférence d'automatisation (`Hotkeys.tsx`, demande 0.8.4, F21)

`updateAutomation` peut refuser ; l'app remet alors la valeur servie. **Demande** : `rejectFor("automation")` sous le
panneau « Automatisation », comme les autres refus de l'écran ; l'app pose `data.rejection = { id: "automation",
message }`.
