# Tatami app → Claude Design — itération de finition avant merge : 8 points, tous petits

Room Profile v3 est **fonctionnellement bouclé** et toutes les gates sont vertes (`make ci` exit 0 : tsc 0, lint 0,
react-doctor 0, ds-sync 77/77, vitest 373, e2e 64, cargo 1121). On ouvre la MR juste après cette itération — donc
**aucun de ces points n'est bloquant**, mais on préfère les corriger maintenant, tant que le sujet est frais, plutôt
que de les laisser vieillir dans un backlog. Ce sont 8 corrections ciblées, la plupart d'une poignée de lignes.

Elles sont classées par ce qu'elles coûtent à l'utilisateur, pas par difficulté.

---

## A — Le geste de pose au clavier ne tient pas ses promesses (5 points)

Contexte : `react-doctor` est vert parce qu'il constate la PRÉSENCE d'un `onKeyDown`. On a vérifié ce qu'il FAIT,
en vrai navigateur, et le chemin clavier reste inutilisable en pratique. C'est le bloc qui compte le plus ici.

**A1. Le focus est perdu après la pose.**
Mesuré : après `Entrée` sur le cadre, `document.activeElement` vaut `BODY`. Le cadre focusé est démonté (`armedLabel`
repasse à `null`) et rien ne redonne le focus au pixel qui vient d'être posé — ni `CalibrationCanvas.tsx`, ni notre
container. L'utilisateur clavier perd sa position dans la page **et** ne peut pas enchaîner sur l'ajustement fin,
qui est pourtant la raison d'être du geste.
*Attendu :* rendre le `PointDot` fraîchement posé et lui donner le focus.
*Recette :* poser un pixel à `Entrée`, puis `ArrowRight` sans retoucher au clavier de navigation → le pixel bouge.

**A2. Les flèches ne font pas ce qu'annonce le changelog.**
`placeFromKey` calcule `50 ± step * 10`, soit **1 %**, pas le dixième de pour-cent (le `NUDGE` à 0,1 % ne s'applique
qu'au `PointDot` DÉJÀ posé). Et le calcul est **absolu depuis le centre**, donc deux `ArrowRight` ne cumulent pas :
le premier pose et désarme. Combiné à A1, « les flèches le déplacent » n'est vrai qu'après avoir re-tabulé jusqu'au
point.
*Attendu :* soit les flèches sur le cadre pré-positionnent de façon cumulative avant validation, soit elles ne
posent rien et c'est le `PointDot` focusé (A1) qui porte le nudge. La seconde lecture nous paraît plus simple et
plus proche du geste réel — à ta main.

**A3. Nom accessible dupliqué.**
`placeAria(label)` nomme à la fois la puce du rail (qui ARME) et le cadre de pose (qui POSE). Un lecteur d'écran
annonce deux fois « Poser le pixel Fold » pour deux gestes différents ; seul l'`aria-pressed` de la puce les
distingue, et le cadre plein écran n'a aucun texte propre.
*Attendu :* un nom distinct pour la surface, par ex. « Poser Fold sur la capture ». Bénéfice de bord : nos
sélecteurs de test n'ont plus besoin d'être scopés par la scène pour lever l'ambiguïté.

**A4. Flèches sans `preventDefault`.** `onKeyDown` ne neutralise pas l'action par défaut : la page scrolle sous le
geste pendant la pose.

**A5. La consigne est restée souris-seule.** `placeHint` dit « Cliquez sur la capture… glissez-le ensuite pour
l'ajuster » (en et fr) alors que le geste est désormais clavier aussi. Mentionner `Entrée` et les flèches.

---

**A6. AJOUT — cliquer sur un pixel DÉJÀ POSÉ ré-arme la pose, et le cadre armé recouvre tous les ROIs.**
Trouvé en revue, c'est le plus destructeur du lot. `beginPoint` (`CalibrationCanvas.tsx:300`) appelle
`onSelectPoint(pointId)` au `pointerdown` d'une pastille déjà posée — ce que le contrat mappe sur l'armement.
`endPoint` (`:311`) ne déclenche `onMovePoint`, donc le désarmement, que si un `pointermove` a eu lieu : **un clic
simple sur une pastille laisse la pose armée**. Or `.placeSurface` (`CalibrationCanvas.module.css:46`, `z-index: 2`,
`inset: 22px 0 0 0`) passe au-dessus des `.roi` et couvre toute la capture. Le clic suivant — destiné à saisir un
ROI — **téléporte la sonde** et déclenche le commit. Le bandeau de consigne rend l'état visible, donc ce n'est pas
silencieux, mais le geste de récupération naturel est précisément celui qui détruit la mesure.
*Racine :* un même callback pour « inspecter » et « armer », plus un overlay plein cadre qui masque les ROIs.
*Attendu :* dissocier les deux (un clic simple sélectionne sans armer ; l'armement reste le geste explicite depuis
le rail ou la station 5), et/ou ne monter `.placeSurface` que quand un pixel est réellement en attente de pose.

## B — Deux libellés qui trompent (restes de v3.2)

**B1. `PipetteTool` confond « pas de pixel posé » et « pixel posé mais pas encore prélevé ».**
Le même texte sert aux deux états, donc « aucun pixel de référence — rien à prélever » s'affiche **à côté d'un
bouton « Prélever » qui fonctionne**. Deux chaînes distinctes suffisent.

**B2. Le `zoneOptions` du `GlyphTool` propose 17 options refusées sur 20.**
Il filtre `kind !== "data"` sur `data.zones`, qui est le vocabulaire GÉOMÉTRIE du bucket **actif** — pas la liste
des ROIs extractibles du bucket **mesuré**, et plus large que la règle moteur (`number` / `card`). Mesuré sur la
posture par défaut, le sélecteur propose :
`pot, board, hero_cards, actions.call, actions.fold, actions.raise, actions.slider, title, hero-cards, v1-cards,
v2-cards, hero-pseudo, hero-stack, hero-bet, v1-pseudo, v1-stack, v1-bet, v2-pseudo, v2-stack, v2-bet` — **seules
les trois premières passent**. Les 17 autres produisent un refus backend.
L'app calcule déjà la bonne liste, mais le contrat n'a pas de champ pour la porter : il nous faudrait soit un
`MeasureState.glyphZoneIds`, soit que `zoneOptions` soit alimenté par une liste que l'app fournit.

---

## C — La pixel-parity : la balle est chez toi, si tu le veux bien

C'est notre dernier écart non vert (22/25), et il est **entièrement dû à un choix de fixtures**, pas à un défaut.

Notre gate de parité compare ton prototype à l'app rendue. Sur les 3 régions `rooms-*`, ton fixture montre un profil
**showcase** — `readiness.score: 73`, `blockers: 3`, et des métas rédigées à la main (« 4 regex rules · live-tested
12/07 · table + lobby designated », « missing: 2-buttons, all-in, turn, river @ 960×600 »). L'app, elle, ne peut
rendre que ce que le backend dérive honnêtement du profil : une date, un `done/total`, et la conjonction stricte du
badge. D'où `rooms-requirements` à 16 % (tes métas passent à la ligne, +37 px de hauteur), `rooms-main` à 2,6 % et
`rooms-stations` à 1,2 %.

**Ce qu'on te demande, si tu es d'accord :** aligner les fixtures des 3 panneaux sur ce que le contrat permet
RÉELLEMENT de dériver — c'est-à-dire des métas construites uniquement à partir des champs que le DTO porte
(`at`, `done`, `total`), tenant sur une ligne. Concrètement : `Station.meta` et `ReadinessLine.meta` composées de
faits, pas de prose ; `readiness.score` cohérent avec les lignes du même fixture plutôt qu'un nombre choisi.

C'est une demande de FIDÉLITÉ PRODUIT, pas de confort de test : aujourd'hui ton prototype montre une richesse
d'information que l'application ne pourra jamais afficher, ce qui est trompeur pour toi comme pour nous. Si tu
préfères garder le showcase pour la démo, dis-le et on verrouille nos 3 seuils sur l'acquis en documentant
pourquoi — c'est ton appel, tu es la source de vérité du design.

---

## Recette globale

Après ton export, on refait tourner l'intégralité : `pnpm import-ds`, `make ci`, e2e Playwright (dont le parcours
complet qui pose un pixel au clavier), et la pixel-parity. On te renvoie le verdict comme d'habitude.

## Rappel

`hotkeys-presets.md` (0.5.1, conflits de hotkeys de presets) est sur l'échange dans son fichier dédié, avec tout ce
qu'il te faut. Indépendante de v3, elle ne bloque pas la 0.6.0.
