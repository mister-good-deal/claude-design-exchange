# Demande Claude Design — 0.7.15 : un pixel suit son bouton, la station 5 par taille

Issues d'origine : [#315](https://gitlab.laneuville.me/rom1/tatami/-/issues/315),
[#310](https://gitlab.laneuville.me/rom1/tatami/-/issues/310), [#314](https://gitlab.laneuville.me/rom1/tatami/-/issues/314),
[#313](https://gitlab.laneuville.me/rom1/tatami/-/issues/313). Campagne Windows 0.7.14, lot lt-atelier
[#316](https://gitlab.laneuville.me/rom1/tatami/-/issues/316). Écrivain exchange : lt-atelier. Ce fichier ne livre
aucun écran, aucun CSS app et aucune modification de `ui/`.

## La décision de Romain (2026-09-16, #315)

- **Chaque sonde de bouton suit son bouton** (`probe.<disposition>.<action>`). Déplacer la ROI du bouton déplace son
  pixel, et valider la ROI valide le pixel. Une sonde n'a plus d'état à valider à la main.
- **Sa couleur est prélevée par taille**, sur l'image de preuve de la validation du bouton, puis comparée à celle des
  autres tailles. Dans la tolérance, c'est fini. Hors tolérance, la cible est marquée « à reprendre » en station 5
  pour cette taille.
- **Exception, le pixel neutre `bet_blur`** : il n'appartient à aucun bouton et garde son propre état. Il est validé
  d'office pour une taille quand les ROI de la barre d'action sont validées et qu'il tombe hors de ces ROI. Sinon il
  est « à reprendre ». Une pose manuelle en station 4 le valide.
- **La station 5 devient le chemin d'exception** : bandeau des tailles, compteur par taille, pose manuelle seulement
  sur une cible marquée.

Le moteur (état des points, couleurs par taille) est à lt-engine. L'écran lit ce que l'app sert, sans rien calculer.

## 1. Station 4 — le compteur de ROI validées dans tous les états (#310)

**Décision de Romain.** « Le label "projeté depuis 1048x720", on s'en fout ; je préfère avoir le compteur de ROI
validées. » Au terrain, 1572×1080 affichait « projeté depuis 1048x720 » sans compteur, puis « 36 / 36 ROI validées »
avec le badge « à calibrer » : le badge jugeait sept points que l'écran ne permettait pas de revalider.

- `adjustMeta` (`BucketRail`) : `bucketProgress(zonesValidated, zonesTotal)` pour **tous** les états (`toCalibrate`,
  `seeded`, `calibrated`) dès que la paire est servie. Seul un bucket `tombstone` garde sa `note`.
- « projeté depuis <WxH> » quitte la méta. `seededFrom` reste au contrat pour ses autres usages.

## 2. Station 4 — les pixels de référence : pas de coche pour une sonde, « à reprendre » pour `bet_blur` (#315, #310)

- **Aucune coche de validation sur une sonde** : sa ligne dit qu'elle suit son bouton, sans état propre à cocher. La
  pose d'une sonde sur le canvas reste possible, mais la validation se fait sur la ROI du bouton.
- **`bet_blur` montre son état** : contrat `CalibPoint.retake?: string`, le motif servi par l'app (par exemple
  « dans la ROI Call »). Présent : la ligne et la puce du pixel affichent « à reprendre » avec ce motif. Absent : le
  pixel est bon. Poser le pixel (`onMovePoint`) le valide, sans autre geste.
- Le badge et le compteur de la carte parlent de la même chose : les ROI. Un `bet_blur` à reprendre se lit sur sa
  ligne, jamais comme une ROI manquante.

## 3. Station 5 — le bandeau des tailles, un compteur par taille, la pose sur une cible marquée seulement (#315)

**Décision de Romain.** « Même bandeau avec les buckets en station 5 qu'en station 4. » Aujourd'hui, la station 5
affiche ses outils (Pipette, Glyphes, Atelier) sans bandeau : la taille mesurée n'y est ni visible ni choisie à la main.

- **Bandeau** : la station 5 porte `BucketRail` en tête, avec le composant des stations 3 et 4. Une carte émet
  `onSelectSize(sizeId)`. L'app sert cette taille dans `data.activeSizeId`, et chaque outil ne montre que les
  captures de cette taille.
- **Compteur par taille** : la méta de la carte en station 5 est `SizeBucket.probesReady?` / `probesTotal?`, servis
  et lus tels quels (« 8 / 10 couleurs prêtes »). Une taille dont une cible est à reprendre le montre en ton
  d'avertissement. Le titre « N / N cibles complètes » se lit pour la taille choisie.
- **Marque « à reprendre »** : contrat `Probe.retake?: string`, le motif servi (par exemple « hors tolérance :
  ΔE 14 contre #E5A200 en 1048×720 »). La ligne de la cible affiche la marque et son motif.
- **Pose manuelle seulement sur une cible marquée** : `ColorSurface` n'est cliquable que si `retake` est servi. Une
  cible non marquée affiche sa couleur prélevée et la capture de sa preuve, sans surface de pose. Une cible sans
  couleur ni marque dit que son bouton est à valider en station 4, et renvoie vers la station 4 par
  `onReplayStation("adjust")`.
- Les enseignes (palette des cartes) ne changent pas : trois relevés, pose libre.

## 4. La pose d'un relevé transmet la capture affichée (#314)

**Terrain.** La surface de la pipette affiche la capture qui atteste la barre de la cible (`shotForVariant`), mais
`onPlaceColorSample` ne transmet pas cette capture. L'app écrivait donc sur la capture tenue par une autre station,
et a dû recopier la règle d'affichage pour corriger. Deux copies d'une même règle, c'est la classe de #307.

- `onPlaceColorSample(sizeId, targetId, index, at, shotId)` : `shotId` est la capture que `ColorSurface` affiche
  (`props.shot.id`), au clic comme à l'ajustement au clavier d'une marque (`nudge`).
- La règle durable de 0.7.14 s'applique : un écran ne tient jamais un id de domaine qu'une écriture utilise sans le
  recevoir en argument.

## 5. Une ligne de pixel nomme un seul bouton (#313)

**Terrain.** Le rail « Pixels de référence » affiche « Check · check / bet » : « c'est soit check, soit bet, pas les
deux ». Et le bouton `bet` n'a pas de sonde.

- Station 4 (rail des pixels) et station 5 (cibles de la pipette) : un groupe par disposition, nommé par la
  déclinaison servie (« Deux boutons fold / call », « Deux boutons check / bet », « Trois boutons »), puis une ligne
  par bouton, nommée par son action (« Check », « Bet »). `pixelLine` n'accole plus l'action et la déclinaison.
- La sonde `bet` arrive par le catalogue servi (moteur). L'écran rend les sondes servies, sans liste codée en dur.

## Fixtures

Une posture de station 5 sur une taille non principale avec une cible marquée « à reprendre » et une cible prête,
et une posture de station 4 où `bet_blur` est « à reprendre ». La parité et les gates doivent les rendre.
