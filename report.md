# Tatami app → Claude Design — itération Room Profile v3 pour 0.6.3 (retours terrain 0.6.2 consolidés)

Session Windows du 2026-08-15 (rapport : `recon/win-validation-2026-08-15/REPORT.md` sur `windows/validation-0.6.2`).
Les gros correctifs du drop précédent tiennent sur le terrain : **l'Établi ne ment plus au resize, canvas plein
cadre, flèches / Maj+flèches opérantes, « ROI absente » retire du canvas et le drag réintègre, préclassification au
scan initial, ordre stable, scroll des panneaux** — merci. La migration E5 du profil vivant est passée sans perte
(34 clés scopées, zéro quarantaine) et le rail de déclinaisons est monté.

Depuis ces retours, l'app a corrigé de son côté (0.6.3, aucune action DS attendue) :

- **Préclassification incrémentale** : une table ouverte APRÈS l'entrée en station 1 arrive maintenant préclassée
  par le poll (même moteur que le scan initial).
- **Labels des points de sonde par déclinaison** : les sondes E5 (`probe.<variant>.<action>`) s'affichaient toutes
  « Fold · … » ; elles nomment désormais la variante (« Fold · 2 boutons », « Fold · 3 boutons », « Fold · slider »).
- **Station 4 à froid** : le geste « Capturer au tour » n'éjecte plus vers la station 1 avec une erreur quand
  aucune table n'est ouverte — l'app ne navigue que si la porte du tour s'ouvre vraiment.
- **Chips du rail de captures** : plus d'horodatage ISO brut — la chip porte les attestations du shot
  (« board b3 », « hero_cards dealt »), sinon un index, et l'heure en forme courte locale.
- **Tooltips des 3 zones Bet** : l'app fournit désormais `Zone.hint` pour `bet_input` / `bet_button` / `bet_blur`
  (vos `title` sur les lignes du rail et les boîtes du canvas les affichent au hover).

Restent les demandes DS ci-dessous, classées par coût joueur.

## A — CONCEPTION station 4 : la garde « Capturer au tour » doit devenir informative

La station 4 est une étape À FROID sur le store de captures ; aucun de ses chemins ne doit dépendre d'une table
live. L'app garantit maintenant le comportement (pas de redirection, pas d'erreur), mais côté surface le bouton
« Capturer au tour » de la garde `DeclGate` reste muet quand aucune table n'est ouverte. *Proposition de contrat :*
`AdjustStationProps` (ou `RoomProfileData`) reçoit un booléen app-fourni `tourOpenable` — `false` ⇒ la garde rend
son texte seul (« aucune capture n'atteste ce layout — passe par le tour pour en faire une »), sans bouton ; `true`
⇒ bouton comme aujourd'hui. Si vous préférez une autre forme (bouton désactivé + note), proposez — mais le geste ne
doit jamais laisser croire qu'il va capturer sans table.

## B — Deux vues Établi qui divergent (écart 24)

L'Établi ouvert par l'onglet de l'écran principal (`RoomProfileBench`) n'a **ni liste de ROI (`ZoneRail`), ni
marquage « absente de cette capture »** — les deux existent dans la vue station 4 (`AdjustStation`). Soit la vue
standalone rattrape la vue station, soit elle disparaît : deux Établis à capacités différentes, c'est un piège.
Au passage : `RoomProfileBench` initialise sa zone sélectionnée sur un id de fixture en dur
(`"actions.three_buttons.bet-button"`) — à neutraliser (démarrage sans sélection).

## C — Navigation : le header d'avancement n'est pas cliquable (écart 22, demandé depuis 0.6.0)

« STATION x/6 » et ses segments doivent permettre de passer d'une station à l'autre sans ressortir par l'épine.
Le callback existe déjà (`on.onSetView?.({ wizard: { station } })`) — c'est un changement de markup seul
(segments → boutons), aucun ajout de contrat.

## D — Outillage de précision de l'Établi (écarts 25/26)

**D1. Visibilité par ROI.** Icône œil / œil masqué par ligne du rail pour masquer les ROI qui se chevauchent
pendant un ajustement ; icône « focus » n'affichant QUE la ROI sélectionnée. État de session, purement
présentationnel — pas de contrat.

**D2. Zoom.** Ctrl+molette dans l'image + boutons + / − / reset — indispensable pour poser des zones denses
(boutons d'action) au pixel. Interne au canvas, pas de contrat.

**D3. Overlay d'en-tête lisible.** Nom / taille / « zones : N · ajustées M » se fondent dans la capture malgré
l'opacité du fond — à renforcer (fond plein, contraste AA).

## E — Label custom des captures (écart 28, volet DS)

L'app affiche désormais attestations / index sur les chips, mais la préférence n°1 du joueur reste un **label
custom édité à l'étape d'avant (station 3)**. *Proposition de contrat :* geste d'édition sur la capture (station 3
ou rail) → `onSetShotLabel?(sizeId, shotId, label)` ; `Shot.label` existe déjà et l'app le rendra prioritaire.

## F — FYI, aucune action demandée

- **« Doublons » de rendu ROI (écart 17, B2 du rapport terrain) : réinterprété et corrigé côté app.** Ce n'étaient
  pas des rendus dédoublés mais des zones DISTINCTES aux noms trop proches (`hero_1`/`hero_2`, `villain_*`) lues
  comme des doublons. Le profil déclare désormais un libellé d'affichage par région (`[[regions]].label`, servi par
  `CalibZoneDto.label`) et l'app l'affiche à la place de la clé TOML — « Carte héros 1 », « Vilain haut-gauche
  (pseudo) », etc. Rien à changer côté DS : `Zone.label` reste le champ que vous rendez.
- **Sélection d'une zone Bet** : `Zone.hint` est maintenant fourni — si vous voulez le rendre AUSSI à la sélection
  (barre de zone / inspecteur), c'est bienvenu, le hover seul est déjà couvert.

---

Captures d'écran du joueur dans le rapport de campagne. Ordre suggéré : A puis B (ils débloquent l'usage à froid
et lèvent le piège des deux Établis), C ensuite, D/E au fil de l'eau.
