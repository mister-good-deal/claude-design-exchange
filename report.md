# Demandes à Claude Design — vague 0.8.7

Publiée par lt-bet le 07/10, sur l'accord de Romain. Trois demandes indépendantes l'une de l'autre ; l'export reste
cumulatif avec le dernier drop (0.8.6, itération 3). Côté app, les données sont servies ou le seront au lot suivant
(dit dans chaque section). En attendant le drop, aucune CSS app ne compense.

- §1 — notices de table : un seul élément, centré en haut de la table (#637) ;
- §2 — Paramètres vocaux : arrêter et transcrire l'essai (#634), une ressource partagée affichée une fois (#636),
  raccourci « Arrêter et transcrire » de la dictée (#643) ;
- §3 — atelier d'overlay : un geste de slider = une écriture (#639).

## 1. Notices de table : un seul élément, centré en haut de la table (#637)

**Fichiers DS concernés** : `ui/screens/AllInNotice.tsx` (remplacé par `ui/screens/TableNotice.tsx`),
`ui/screens/TableElements.module.css`, `ui/screens/i18n.ts` (`tableHud`), `ui/screens/TableElements.fixtures.ts`
(`allInNoticeBox` retiré, une taille de notice exportée). L'app pose le composant dans `TableHud`, qui reste à elle.

### Le cas

Deux notices s'affichent sur une table : la touche All-in refusée (#615) et l'erreur du service vocal (« Le service
vocal s'est arrêté. Réessayez pour le relancer. »). Aujourd'hui la première est accrochée au-dessus de la bet bar, la
seconde dans la bande de refus du cluster siqnote. En campagne (0.8.6), l'erreur vocale déborde de la fenêtre de la
table, coupée au bord droit. Règle de Romain : **une seule règle pour toutes les notices de table**, centrées en haut
de la fenêtre de la table, entièrement dans la fenêtre, affichées 4 à 5 s puis retirées.

C'est l'app qui décide de la notice, de sa durée (servie 4,5 s par le moteur puis retirée) et de sa boîte. Le DS
n'affiche que ce qui lui est servi.

### Ce que l'app demande

1. **Un composant `TableNotice` qui remplit sa boîte hôte**, sans s'ancrer hors d'elle (pas de `bottom: calc(100% +
   …)`, pas de `left: 0` en `max-content`) : le texte centré dans la boîte, retour à la ligne à l'intérieur, jamais
   coupé ni hors de la boîte. L'app calcule la boîte : centrée en haut de la fenêtre de la table, largeur bornée à
   la fenêtre. Exporter sa taille de base (comme `siqClusterSize`) : largeur et hauteur de deux lignes.
2. **Données** : `data: { locale; notice: { kind: "allIn"; reason: "noDecision" | "nothingToBet"; keyLabel: string }
   | { kind: "voice"; text: string } }`. Pour `allIn`, les mots de `tableHud.noDecision` / `nothingToBet` restent ;
   pour `voice`, `text` est le message de refus servi, affiché tel quel. L'absence de `notice` = rien de dessiné.
3. **Un avis, pas une alerte** : teinte d'alerte (`--alert-*`) sur fond plein, `role="status"`, ni souris ni focus,
   aucun rectangle publié ; lisible d'un coup d'œil à 693×529.
4. **Aucun minuteur dans le DS** : l'apparition et la disparition suivent seulement `data.notice`.
5. **`AllInNotice` et `allInNoticeBox` retirés** ; l'erreur vocale ne passe plus par la bande de refus du cluster
   (`SiqClusterData.refusal` reste pour les refus d'un geste, sous le cluster, #548).
6. **Fixtures** : les deux refus All-in et l'erreur vocale la plus longue, fr et en, aux tailles 693×529, 1048×720
   et 1572×1080, pour la parité pixel.

### Côté app

Déjà servi : `BetStateDto.allInRefusal` et `PlayerVoiceView.error`, chacun retiré 4,5 s après son apparition
(MR 1 de #637). Après l'import, `TableHud` pose `TableNotice` dans la boîte centrée en haut ; rien avant.

## 2. Paramètres vocaux : essai, ressource partagée, raccourci de fin de dictée (#634, #636, #643)

**Fichiers DS concernés** : `ui/screens/VoiceSetup.tsx` (`TrialState`), `ui/screens/VoiceLevelCard.tsx`,
`ui/screens/VoiceLevels.tsx` (`ResourceState`), `ui/screens/Settings.fixtures.ts` (`SettingsCallbacks`),
`ui/screens/contract.ts`, `ui/screens/i18n.ts`. L'app câble les rappels dans `SettingsContainer`, qui reste à elle.

### 1. Arrêter et transcrire l'essai (#634)

**Le cas.** L'étape 5 du parcours guidé (« Essai ») enregistre 30 s sans geste pour s'arrêter, puis transcrit les 30 s
alors que seules les deux ou trois premières secondes comptent. En CPU Rapide, la transcription dépasse son délai et
l'essai échoue : « La fin de la configuration guidée est inutilisable en l'état » (Romain, 07/10).

**Ce que l'app demande.**
1. Dans l'état `trial.kind === "recording"`, un bouton **« Arrêter et transcrire »** (en : « Stop and transcribe »)
   à côté du vu-mètre : le même geste et le même libellé que l'arrêt d'une dictée (pas « Terminer », qui côtoie
   « Terminer et activer »). Rappel `onStopTrial?: () => void`, ajouté à `SettingsCallbacks` et à la liste
   du contrat ; bouton offert seulement si l'app fournit le rappel.
2. Rien d'autre ne change : l'état suivant (`transcribing`, puis `done` ou `failed`) est servi. Aucun minuteur, aucun
   compte à rebours dans le DS ; le plafond de 30 s reste une borne de l'app.
3. Fixture : l'état `recording` avec le bouton, fr et en.

**Côté app.** Déjà servi : `voice_stop(session)` arrête la capture d'un essai et transcrit seulement la partie
enregistrée. À l'import, `onStopTrial` appelle `voiceStop(operation.id)`. Le message d'échec n'est plus doublé :
`trial.failed` le porte seul, la note de refus `trial` ne sert plus qu'au refus du geste lui-même.

### 2. Une ressource partagée par deux niveaux s'affiche une fois (#636)

**Le cas.** En mode Carte graphique, Équilibré et Précis utilisent le même fichier (3,1 Go). L'app sert déjà UNE
ressource (`VoiceResource.id`, `levels: ["balanced", "precise"]`), mais chaque carte de niveau dessine
`ResourceState` pour sa ressource : deux barres au même pourcentage, deux « Annuler », et annuler l'un annule l'autre.
Le joueur croit lancer deux téléchargements.

**Ce que l'app demande.**
1. Quand `r.levels.length > 1`, la progression, « Annuler », « Télécharger », « Réessayer » et la suppression
   n'apparaissent qu'**une fois**, sur la carte du niveau choisi (ou, si aucun des deux n'est choisi, sur le premier de
   `r.levels`).
2. L'autre carte dit le partage, sans geste : par exemple « Ressource partagée avec Précis · Téléchargement 42 % »
   (en : « Shared with Precise »). Les noms des niveaux viennent de `r.levels`, comme `levelNames`.
3. Le libellé « Annuler » d'une ressource partagée dit qu'il retire les deux niveaux (par exemple « Annuler
   (Équilibré · Précis) ») ; même règle pour la confirmation de suppression, qui le fait déjà.
4. Fixtures : GPU, téléchargement en cours de la ressource partagée, niveau choisi Précis puis Équilibré, fr et en.

**Côté app.** Rien à servir de plus ; le pourcentage est désormais un entier (#635, `Math.floor` dans le mapping).

### 3. Raccourci « Arrêter et transcrire » de la dictée (#643, demande de Romain du 07/10)

**Le cas.** Pendant une dictée de note joueur, on ne peut arrêter et valider qu'en recliquant sur le micro de
l'overlay. Romain veut un raccourci clavier, **Entrée** par défaut, réglable dans les Paramètres vocaux. Échap reste
l'annulation et n'est pas réglable. Le raccourci n'est pris que lorsque la dictée est armée et que sa table ou son
overlay est au premier plan ; ailleurs, la touche passe (règle déjà servie par l'app, comme pour Échap).

**Ce que l'app demande.**
1. Dans la section des réglages vocaux (et pas dans le parcours guidé), une ligne **« Arrêter et transcrire »** (en :
   « Stop and transcribe ») : la touche servie, et un geste pour la changer, avec la **même capture que l'écran
   Raccourcis** (`keyCapture`, `captureKeyLabel` ; Échap annule la capture, comme dans Raccourcis).
2. Données servies : `stopKey: { label: string }` (par exemple « Entrée »). Refus servi par la `rejection` d'id
   `stop-key` (touche réservée, comme Échap, ou déjà prise), affiché sous la ligne.
3. Rappel `onSetStopKey?: (key: string) => void`, avec la touche capturée telle que la rend `captureKeyLabel` ;
   ligne offerte seulement si l'app fournit le rappel. Aucun bouton « Par défaut » demandé.
4. Une phrase d'aide sous la ligne : « Arrête la prise et ajoute la note. Échap l'annule. » (en : « Stops recording
   and adds the note. Escape cancels it. »).
5. Fixtures : touche par défaut, capture en cours, refus, fr et en.

**Côté app.** Le réglage et son interception sont le lot suivant de lt-voix (#643).

## 3. Atelier d’overlay : un geste de slider = une écriture (#639)

**Fichiers DS concernés** : `ui/Slider.tsx` (`onCommit`), `ui/screens/OverlayInspector.tsx` (`SizeAndOpacity`) et
ses fixtures. L’app garde `onGeo` tel quel dans son container.

### Constat

Onglet Overlay, inspecteur, section « Size & opacity » (`OverlayInspector.tsx`, `SizeAndOpacity`) : les trois
`Slider` (taille, opacité repos, opacité survol) appellent `onGeo` à chaque cran (`onChange`). Chaque `onGeo` est une
écriture du profil de la room côté app (1,85 Mo, puis ~1 s de rechargement) : glisser l'opacité de 40 % à 80 % = 20
écritures en file, l'atelier rame. Le canevas a déjà la bonne règle (« every write is sent on RELEASE »).

### Demande

1. **`Slider`** : une prop optionnelle `onCommit?: (value: number) => void`, émise UNE fois quand le geste se termine :
   pointeur relâché après un glisser ou un clic sur la piste, touche relâchée au clavier (flèches, Page, Début/Fin).
   `onChange` reste émis à chaque cran, inchangé pour les autres écrans.
2. **`OverlayInspector` — `SizeAndOpacity`** : pendant le geste, la valeur du slider est un **brouillon d'affichage**
   de l'écran : le slider, la valeur affichée (`%`, « rendered w×h », l'indice d'opacité) ET le canevas (l'élément
   sélectionné à sa taille / son opacité de brouillon) suivent en direct. `onGeo` n'est émis qu'au `onCommit`, avec la
   valeur finale. Au retour de l'atelier servi (`data.geometry`), le brouillon s'efface : la valeur affichée redevient
   celle que l'app a rendue (refus compris : un geste refusé revient à la valeur servie).
3. Un relâchement sur la même valeur que celle servie n'émet rien.

### Attendu côté app

Aucun nouveau callback : `onGeo` garde sa signature. Test e2e de l'atelier après import : glisser l'opacité de 10
crans → un seul `updateOverlayElement`, et le rendu du canevas a suivi pendant le glisser.
