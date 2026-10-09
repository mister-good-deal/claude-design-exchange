# Demande Claude Design — Room Profile V4 : retrait des écrans V3, portage de la station des lois (B)

Issue d'origine : [#666](https://gitlab.laneuville.me/rom1/tatami/-/issues/666) (spec 026, tâche T002). Ce fichier
appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Le constat

Room Profile V4 remplace le calibrage par taille (une calibration par `bucket`) par une **loi** par zone, évaluée à toute
taille de fenêtre depuis une référence unique 1572 × 1080. Les écrans V3 de l'export n'ont plus de données à afficher.
Cette vague a deux parties : retirer ces écrans (1), puis livrer la station des lois, proposition B (2).

## 1. Retrait des écrans V3 de l'export

Tout se retire de `apps/web/src/ui/screens/`. Après le drop, `rooms` ne rend plus que les stations de room : détection
des fenêtres (`DetectStation`), inchangée, et métrologie (`MetrologyStation`), que le § Station 2 de
`specs/026-room-profile-v4/design/stations-v4-composants-contrats.md` refait à son propre drop ; les autres stations
arrivent par leurs drops.

### 1.1 À retirer (noms et fichiers vérifiés dans l'export courant)

| Composant | Fichiers |
|---|---|
| `BucketRail` | `BucketRail.tsx` |
| `BucketCoverage` | `BucketCoverage.tsx` |
| `CoverageMatrix` | `CoverageMatrix.tsx`, `CoverageMatrix.fixtures.ts`, `CoverageMatrix.module.css` |
| `TourStation` | `TourStation.tsx` |
| `AdjustStation` | `AdjustStation.tsx` |
| `MeasureStation` | `MeasureStation.tsx` |
| `ValidateStation` | `ValidateStation.tsx` |
| `CardTemplateTool` | `CardTemplateTool.tsx` |
| `ZoneWorkbench` | `ZoneWorkbench.tsx` |

Aucun n'a de `.module.css` ou de fixture propre hors `CoverageMatrix` : leurs styles vivent dans
`RoomProfile.module.css`, leurs données dans `RoomProfile.fixtures.ts`, leurs textes dans `i18n.ts`. Aucune story
n'existe dans l'export.

À réécrire en conséquence :

- `index.ts` : retirer les exports `TourStation`, `AdjustStation`, `MeasureStation`, `BucketRail`, `CardTemplateTool`,
  `ZoneWorkbench`, `BucketCoverage`, `ValidateStation`, `CoverageMatrix`.
- `RoomProfileWizard.tsx` : retirer les imports et les branches `tour`, `adjust`, `measure`, `validate`, ainsi que
  `STATION_ORDER` et `TOOLS` pour ce qui ne reste pas ; `StationId` ne garde que `detect`, `metrology` et, à venir, `laws`.
- `RoomProfile.tsx` : retirer l'import de `CoverageMatrix` et la vue `coverage` (`RoomProfileView` devient `spine` ou
  `{ wizard }`). Le panneau « Géométrie de la room » (`GeometryPanel`) est conservé tel quel.
- `RoomProfile.fixtures.ts`, `contract.ts` et `standalone.entry.tsx` : plus aucun import vers un fichier retiré.

### 1.2 Données et fixtures (`RoomProfile.fixtures.ts`)

À retirer, par nom d'export : les types `SizeBucket`, `BucketState`, `SizeVerdict`, `VerdictLine`, `VerdictGroupCount`,
`VerdictGroup`, `DryRun`, `DryRunZone`, `SeedPlan`, `SizeGesture`, `CoverageCell`, `TourState`, `CardTemplateSize`,
`CardTemplateMap`, `BucketGlyphCoverage`, `BucketGlyphTotal`, `WriteVerdict`, et les fonctions `worstBucketGlyph`,
`deadBucket`, `attestationsOf`, `coveredVariants`, `witnessCounts`, `cellStateFor`, `suitCards`, `zonesInBucket`,
`attestingShot`, `sizeRatio` ; les constantes `SIZE_BUCKETS`, `COVERAGE`, `STATIONS` (ses six entrées
V3), `READINESS`, `LAYOUT_REFS`, `PRESENCES`, `WRITE_*`, `CASCADE`, `TRANSITION` ; les fixtures d'écran
`ROOM_PROFILE_TOUR_*`, `ROOM_PROFILE_ADJUST_*`, `ROOM_PROFILE_WRITE_*`, `ROOM_PROFILE_COVERAGE_FIXTURE`,
`ROOM_PROFILE_PLACE_POINT_FIXTURE`, `ROOM_PROFILE_WIZARD_REJECTION_FIXTURE`, `ROOM_PROFILE_REJECTION_FIXTURE`,
`ROOM_PROFILE_TRANSITION_FIXTURE`, `ROOM_PROFILE_CASCADE_FIXTURE`, `ROOM_PROFILE_EMPTY_QUEUES_FIXTURE`.
Règle générale : tout export que plus aucun fichier conservé n'importe. Les fixtures `ROOM_PROFILE_DETECT_FIXTURE`,
`ROOM_PROFILE_METROLOGY_FIXTURE` et `ROOM_PROFILE_GEOMETRY_*` restent.

### 1.3 CSS (`RoomProfile.module.css`)

Retirer toute classe que plus aucun fichier conservé n'utilise. Les 64 classes propres aux huit écrans retirés :
`captureRow delayField delayInput unitField unitSeg unitBtn lineWrap lineDetails lineConsequence lineItems lineItem
dryRow dryLine dryLineSize dryLineMeta dryAmber dryZonesHead dryZones dryZone dryZoneDetail dryZoneLines bucketBanner
bucketDims bucketBadge bucketMeta bucketGesture stripRow monitorImg monitorEmpty detachConfirm detachConsequence
stationCanvas stationBar blockedBy blockerLink stationWrap stationBanner bucketCaption stationRow seedControl seedPick
railRegion cardTpl cardTplBar cardTplBody cardTplRow cardTplStage cardTplSurface cardTplTpl cardTplHandle
cardTplRankBox cardTplRankTag cardTplRankHandle cardTplPx cardTplNotes cardTplFields cardTplField captureFailed
captureFailedHead captureFailedLine bucketSum bucketFam famPack bucketMiss`.
Onze classes ne sont déjà référencées par personne (`loupeGrid loupeTarget loupeCol glyphGrid dialogTitle dialogActions
ckRow harvestRow harvestWord harvestDetail harvestNote`) : à retirer aussi. `CoverageMatrix.module.css` part avec son
composant.

### 1.4 Textes (`i18n.ts`, FR et EN, interfaces comprises)

- `CoverageStrings` (bloc `coverage`) : les 17 clés propres à `CoverageMatrix` — `zoneVariant roomOverride captureLink
  reverifyLink verifyLink fixLink declaredBy notDeclared evidenceEyebrow noProof shotAt openCanvas deferAction
  deferReasonPlaceholder cellAria stateLabel cellStateLabel` — puis le reste du bloc si `RoomProfile.tsx` n'en lit plus
  rien après le retrait de la vue `coverage` (le bloc entier part alors, avec `viewCoverage` de `RoomProfileV3Strings`).
- `RoomProfileV3Strings` (bloc `roomProfileV3`), clés lues par les seuls écrans retirés (157, comptées par recherche de
  mot dans les fichiers de l'export) :
  - tour : `tourCapture orF9 tourCapturedSizes tourCaptureCold tourTickHint tourNoShots tourLoadedTitle tourShotNoImg
    tourShotAlt tourShotRefused shotImgRefused tourCoverageDeferred tourSizeAria coldSizeAria tourSizeMismatch takeOnlyIn
    captureFailedAll captureFailedSome captureFailedTake captureFailedDismiss captureFailedDismissAria shotKeysBusy
    shotCards shotNoImage missingHere primaryStar deleteShot deleteShotAria deleteConfirm detachShot detachShotAria
    restoreHint kindPresence` ;
  - délai de capture et unité d'affichage (à confirmer, voir 1.6) : `captureDelayLabel captureDelayUnit
    captureDelayHint displayUnitLabel displayUnitHint displayUnitChips displayUnitBb` ;
  - rail des tailles et amorçage : `bucketsEyebrow bucketState verdictCount verdictTour verdictAdjust verdictValidate
    verdictGroup verdictNoGroups verdictNone bucketRetained bucketRetainedNote seedPlan seedNothing seedFromAria
    seedDefaultOption` ;
  - ajustement des zones : `zoneState declState declOtherTag autoHiddenNote excludedNote declNeedsShot declGoTour
    declNeedsShotCold hideZoneAria showZoneAria focusZones pixelsGroup pixelsShowAll pixelsHideAll pixelNoColour
    pixelGroupOther pixelFollows pixelRetake pixelToPlace pixelPlaceAria pixelNeedsShot seatSurplus renameShot
    renameShotAria testClick confirmZone validateZoneAria invalidateZone invalidateZoneAria revalidateZone zoneRefused
    zoneRefusedOn zonesEyebrow absentTag markAbsent markPresent adjustHint selectAll selectionCount noZone` ;
  - gabarit de carte : `cardTplEyebrow cardTplTitle cardTplSizeOf cardTplFamily cardTplW cardTplH cardTplRank
    cardTplEdge cardTplNone cardTplNoRank cardTplInvariant cardTplSizeAria cardTplRankAria cardTplZoomAria
    cardTplSlotAria cardTplShotAria cardTplRealPx cardTplMarginNote cardTplHandleAria cardTplRankBoxAria
    cardTplRankHandleAria cardTplDragNote cardTplNoShot cardTplNoImage cardTplNoSlot cardSizeFrom cardSizeNoFamily
    cardMoveHint` ;
  - couverture par taille et glyphes : `bucketCoverTitle bucketCoverNote bucketCoverActive bucketCoverNative
    bucketCoverBlocked bucketCoverDead bucketCoverPick bucketCoverComplete bucketCoverIncomplete bucketCoverNone
    glyphMissing` ;
  - validation : `purgeConfirm writeVerdictEyebrow writeOk writeRefused writeBlockers writeStale writeStaleNote
    writtenTo validateEyebrow validateTitle dryRunsEyebrow dryRunsTitle rerunAll runDryRun neverRun dryStale
    dryInvalidatedBy dryZonesDetail dryUnverified lineDetail lineOpen writeProfile writeBlockedBy`.
- Trente clés de `RoomProfileV3Strings` ne sont déjà lues par personne : `unplacedProbe notSampled declareGroupField
  adoptSuit queueNext bucketsTitle inspectorTitle fieldType fieldParent fieldVariant fieldRect fieldState fieldVisible
  zoneKind seatHole closeWizard nextBucket tourAllStaleTitle tourWindowOk probeTitle adopt loupeFor loupeCaption
  patchCaption noPatch dispersionExplain probeSampling suitsTitle probeHidden truthField`. À retirer aussi.
- Le bloc `RoomProfileStrings` (`roomProfile`) porte 93 clés lues par personne (vestiges des écrans antérieurs : `wiz*`,
  `step1`, `sizeTour`, `shotsFor`, `dropPng`, …) et `primaryStar deleteShot prevShot nextShot orF9` propres aux écrans
  retirés. Retirer ce qui n'est lu par aucun fichier conservé.

### 1.5 Contrôles de fin

`pnpm import-ds` côté app : `tsc`, `lint` et `doctor` doivent passer sur l'export seul. Aucune clé i18n sans lecteur, aucune
classe CSS sans lecteur, aucun export sans importeur (hors `index.ts`). `.ds-sync.json` se ré-écrit à l'import.

### 1.6 À confirmer par Claude Design

Aucun composant de la liste demandée n'est introuvable. En revanche, les composants ci-dessous n'ont plus aucun
importeur une fois les neuf retirés. Ils servent le calibrage par taille V3 (pipette, glyphes, atelier, captures) ; les
nouvelles stations 2, 3, 4 et 6 les remplaceront ou les reprendront. **À confirmer** : les retirer maintenant ou les
garder jusqu'au drop de la station qui les reprend. Défaut proposé : retirer ce que les prototypes validés ne reprennent
pas.

- Outils de mesure : `PipetteTool.tsx`, `GlyphTool.tsx`, `PipelineTool.tsx` et ses pièces (`PipelineFrame`,
  `PipelineInspector`, `PipelineOverview`, `PipelineParams`, `PipelineSelect`, `PipelineSourceView`, `PipelineStrip`),
  `AmountTreatmentPanel.tsx` (traitement d'une taille), `NumberCounter.tsx`, `SuitCardStrip.tsx`, `ColorSurface.tsx`,
  `PackCreate`, `PackFilter`, `PackPicker`, `PackSummary`, `PresenceRail.tsx` (`.tsx` chacun).
- Captures et vérités : `AttestPanel.tsx`, `ShotStrip.tsx` (`ShotStrip`, `ShotPager`), `TruthComposer.tsx`,
  `truthCards.ts`, `ZoneRail.tsx`, `AssetFrame.tsx`.
- Canevas : `CalibrationCanvas.tsx`, `CalibrationCanvas.module.css`. `CalibrationCanvas.fixtures.ts` est importé par
  `contract.ts` (`CalibrationCanvasWiring`) : à traiter avec lui.
- Textes de ces composants : le bloc `calibCanvas` (`CalibCanvasStrings`) et les clés `roomProfileV3` qu'ils sont seuls à
  lire (sonde, loupe, glyphes, pipeline, traitement, paquets : `probe*`, `slot*`, `glyph*`, `pipeline*`, `treat*`,
  `pack*`, `reading*`, `truth*`, `suit*`, `attest*`, `cut*`, `crop*`, …).
- Délai de capture et unité d'affichage (`captureDelay*`, `displayUnit*`, classes `delayField`, `unitField`, …) : ce sont
  des réglages de joueur que le profil V4 garde (grille, raccourcis, unité). Les retirer de `TourStation` ne dit pas
  où ils vont : à confirmer avec la station 3.
- `Bucket*` : aucun autre composant de l'export ne porte « bucket » dans son nom. `SizingUnit`, `SizingFilters`,
  `SizingUnitChip` / `SizingUnitDrawer` concernent la taille de mise (sizing), pas le calibrage : à conserver.

## 2. Station des lois — proposition B, portage dans `ui/`

Références : `specs/026-room-profile-v4/design/station-des-lois-B.md` (prototype retenu le 9 octobre 2026, état de
l'itération 4) et `station-des-lois-B-legende.html` (notations, composants, contrat esquissé). La forme des données que
l'app sert est celle du contrat IPC, normatif pour ce portage :
`specs/026-room-profile-v4/contracts/ipc-station-des-lois.md`.

### 2.1 Ce que la station fait

Station 5 du `RoomProfileWizard`, juste après l'ajustement des ROI à la taille principale. Le joueur règle la taille de
la fenêtre (deux règles graduées : largeur et ratio, avec ▶ balayage), voit à cette taille le rectangle que la loi donne à
chaque zone, ouvre la loi d'une zone, la modifie (ancre, mot de taille, mot de position, sections, plages, `follow`) et
voit aussitôt le résultat servi. Planche (`LawSheet`), notations (`LawMarks`, `LawGlyph`, `LawLegend`), cartouche
(`TitleBlock`), règles (`Slider` étendu par `marks` et `bands` plutôt qu'un primitif neuf), éditeur de loi (`LawEditor`),
loi écrite (`WrittenLaw`), ligne d'écarts (`GapRow`), abaque largeur × ratio (`LawAbaque`) : la liste des composants est
celle de la légende, tableau « Composants nécessaires », colonne B. Un composant par fichier, `LawsStation` en racine.

### 2.2 Contrat de données (props `data` et `on`)

L'écran reçoit `LawsDto` et quatre rappels ; les noms de champs sont ceux de `packages/contracts/src/bindings.ts`
(générés, camelCase), pas ceux du croquis. L'écran ne définit pas ces types à la main : il déclare l'interface de
fixture au même format.

- `LawsDto` (`LawsData` du contrat) : `reference`, `chrome`, `table`, `domain`, `requested { w, h }`, `served { size,
  frames, status, inDomain, capture?, rois: LawRoi[] }`, `root` (la loi par défaut, son ancre, ses sections, la section
  servie, ses utilisatrices), `captures` (avec `gaps` par zone : nombre, `"absent"` ou `"unplaced"`), `sectionMap:
  number[][]` (l'abaque largeur × ratio de la zone choisie : une rangée par ratio, du plus haut au plus bas, une colonne
  par largeur, la valeur est l'indice de la section qui tient la case, `-1` = trou),
  `trajectory? { w, h, rect | null }[]` (l'épure : la zone placée le long de la largeur ou du ratio, `rect` `null`
  là où elle n'est pas placée), `rejection? { id, message }`.
- `LawRoi` : `id`, `rep`, `group`, `layout`, `follows`, `point`, `note`, `usesDefault`, `written` (json5 de la loi telle
  qu'écrite), `law`, `sections` (`range`, `at`, `holdsRef`, `size`, `position`), `section` (`-1` = non placée), `rect`,
  `marks: LawMarks | null`, `refGap` (Δ calibration, en ambre), `truth { rect, gap?, calibration } | null`.
- `LawMarks` : deux formes. Zone à loi propre : `anchor`, `frame` (`window` ou `table`, celui de l'ancre),
  `anchorPoint`, `roiPoint`, `start { rect, window }`, `size` (deux `SizeMark`, largeur puis hauteur), `position` (deux
  `AxisMark`), `at` (booléen). Zone qui en suit une autre : `follows`, `container`, `fractions`. `SizeMark` est l'un de
  `fixed`, `scaled`, `stretched` (mot appliqué, `word`, `rate?`, `k`, `clamp?`), `step` (paliers, `index`, `value` en px
  sur l'axe) ou `measured` (table mesurée) ; `AxisMark` l'un de `pinned`, `proportional`, `rail` (part du point
  d'ancrage `origin`, s'étend sur `extent`, avec `centre` et `ends`), `follow` ou `measured`. La forme exacte est celle
  du contrat IPC (§ LawsDto, `LawMarks`, `SizeMark`, `AxisMark`) : l'écran la lit, ne la reconstruit pas.
- `on.onRequestSize(w, h, roi, along)` : demande la vue d'une taille pour la ROI choisie (`roi`, `"__root"` pour la loi
  par défaut) et l'axe de l'épure (`along` : `"width"` ou `"ratio"`), y compris pendant l'animation ;
  `on.onSetLaw(region | null, law | null)` (`null` = loi par défaut ; loi `null` = revenir au défaut) ;
  `on.onSetFollows(region, container | null)` (`null` = loi propre) ; `on.onContinue()` : station suivante, sans retour
  arrière.

**Ce qui diffère de la première version de cette demande** (le contrat IPC fait foi, voir aussi § Station 5 de
`specs/026-room-profile-v4/design/stations-v4-composants-contrats.md`) :

- `sectionMap` est la matrice `number[][]` du croquis, et non plus une liste de cellules `SectionCellDto`.
- L'épure `trajectory` est servie par l'app (`{ w, h, rect | null }[]`) : l'écran ne la calcule pas et la dessine telle
  quelle. Le ▶ balayage reste joué par l'écran, par des `onRequestSize` successifs.
- `domain` (le domaine de lecture) et `served.inDomain` s'ajoutent à `LawsData` : hors domaine, chaque zone est dite
  « hors loi ».
- Les noms sont ceux du contrat : `served.rois: LawRoi[]` (et non `regions: LawRegionDto[]`), `roiPoint`, `refGap` ;
  `LawMarks`, `SizeMark` et `AxisMark` ont la forme du contrat IPC, ci-dessus.
- `onRequestSize` porte aussi la ROI choisie et l'axe de l'épure : la carte des sections et l'épure sont servies pour
  elles (`laws_view`), l'app ne les devine pas.
- `onSetFollows(region, container | null)` : `null` rend sa loi propre à la zone. Un refus de la loi par défaut porte
  `rejection.id = "__root"`.

### 2.3 Règles à tenir

Clauses de [Contrat des stations](../architecture/contrat-des-stations.md) que la station sert :

- **P9, « le design system affiche, l'app décide »** : l'écran ne calcule aucune loi. `sl-model.js` joue l'app dans le
  prototype et n'entre pas dans l'export ; `.tsx` met à l'échelle des coordonnées servies, compose la loi DEMANDÉE (mots et
  nombres) et l'envoie. Aucune évaluation de section, aucun placement, aucun écart, aucune validation de plage côté écran.
- **P2, « une donnée, une source »** : rectangles, repères, écarts, statut, carte des sections et épure sortent de la même
  réponse servie ; l'écran ne recalcule rien de ce que `LawsDto` porte.
- **P1, « ce qui est affiché est ce qui est écrit »** : l'écran dit pour quelle taille la vue est servie (« servi pour
  W × H ») tant que la réponse est en retard sur la demande. La loi montrée est `written`, verbatim.
- **P4, « aucun retour en arrière »** : `onContinue()` seul ; aucun geste ne renvoie à une station antérieure.
- **P5 et P7, refus nommé et mutation qui rend son fait** : un refus (`rejection`) s'affiche en bandeau rouge qui
  nomme la zone et la cause ; la loi écrite ne change pas, l'écran n'invente aucun repli ni état « presque accepté ».
  La réponse d'une modification est la vue à jour : l'écran la pose, ne relit rien.

Règles propres à cette station :

1. **#622 — ce qui est projeté ne s'affiche jamais comme validé** : pointillé pour tout ce que la loi projette, trait
   plein seulement pour la ROI calibrée (`truth.calibration`) ; cartouche `CALIBRATION` / `PROJECTION` / `CONTRÔLE` selon
   `served.status` ; écart à la calibration (Δ calib.) en ambre ; Δ de la ROI choisie seulement.
2. **Mode live** : pas de bouton « Écrire ». Chaque modification part à l'app par `onSetLaw` / `onSetFollows`.
3. **Un trou entre sections est une erreur du profil**, montrée comme telle (hachures « trou », encadré) ; la zone est
   non placée (`section = -1`, `rect` absent). Une zone hors domaine se dit « hors loi ».
4. **Le bandeau du haut du prototype** (service instantané ou lent, Réinitialiser) simule l'app : il ne fait pas partie
   de la station et n'entre pas dans l'export.
5. Zoom molette et glisser, masquer / « Afficher… » / Focus, menu déroulant de ROI, légende à droite : tels que dans
   l'itération 4.

### 2.4 Dialecte du design system

Presentational-with-props (`data`, `on`, état local d'interface seulement : ROI choisie, fond, densité des cotes, zoom,
focus), `.module.css` et tokens `var(--…)` à la place des styles inline, `prop?: T | undefined`
(`exactOptionalPropertyTypes`), aucun `useEffect` de synchronisation de props (ajustement au rendu, logique d'événement
dans le gestionnaire), `<button>` réels, JSX statique hissé au module, un composant par fichier, textes dans `i18n.ts`
(FR et EN). `react-doctor` rapporte zéro diagnostic, erreurs et avertissements.

### 2.5 Fixtures demandées

`LawsStation.fixtures.ts` (et celles des sous-composants qui en ont besoin) au **format du contrat**, c'est-à-dire des
objets typés comme `LawsDto` : les mêmes champs que `bindings.ts`, pas la forme interne du prototype. Les valeurs reprennent
la géométrie Unibet v2 et la calibration réelle du prototype, et couvrent chaque état :

- statut `calibration` (1572 × 1080), `projection`, `control` (une des cinq captures : 640 × 440, 1100 × 780,
  1386 × 1058, 1920 × 1080, 1920 × 720), et `inDomain: false` ;
- une zone par mot de taille et de position, une zone qui en suit une autre, une zone avec `at`, une zone non placée
  (trou), une loi par défaut seule ;
- un refus (`rejection`) pour chacune de ces causes : `law_without_anchor`, `sections_overlap`,
  `no_section_holds_reference`, `follows_self`, `follows_loop`, `follows_missing`, `follows_follower`, `bound_inverted`,
  `sections_unordered` ;
- écarts `gap` de plusieurs ordres (franc, ambre, `"absent"`, `"unplaced"`) ;
- `ROOM_PROFILE_LAWS_FIXTURE` et ses variantes, branchées dans `RoomProfileWizard` et dans la parité pixel.

L'app remplace ensuite ces fixtures par la charge réelle d'une commande `laws_view` (P10) et vérifie la concordance dans
les deux sens : les champs de la fixture sont ceux du contrat, ni plus ni moins.

### 2.6 Hors de cette demande

Les stations 2, 3, 4, 6 et 7 de V4 viennent par leurs propres drops. Ne rien changer à `DetectStation`,
`MetrologyStation`, `GeometryPanel`, ni aux autres écrans de l'app.
