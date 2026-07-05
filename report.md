# Rapport & demandes d'itération — 2026-07-05 (préparation bêta)

## Statut : ✅ RoomProfile v2 mergé sur master — nouvelle itération : 2 évolutions Layout Designer + reliquat

Le drop RoomProfile v2 est intégré et la feature 016 est mergée. Cette itération combine **deux évolutions du
Layout Designer** (sections A et B — livrables dans le MÊME drop, elles touchent le même écran) et le **reliquat
du rapport précédent** (section C, findings inchangés). Livraison selon `contract.md` habituel : zip + manifest,
gates 0, fixtures mises à jour.

---

## A — Contrainte « taille minimum de fenêtre » dans le Layout Designer

Tatami tuile des fenêtres de poker réelles. Chaque room impose une **taille minimum de fenêtre** : en dessous, le
client (Unibet) refuse simplement le resize — le tuilage produirait alors des fenêtres qui ne correspondent pas au
canvas. Aujourd'hui le Layout Designer laisse composer des slots arbitrairement petits (50×50 possible) sans aucun
retour visuel. Le backend, lui, connaît déjà la contrainte et émet une alerte — c'est un pur gap d'UI.

### Données disponibles (contrat IPC existant, rien à inventer)

- **Par room** : `minWidth` en pixels (la hauteur minimum se **dérive** du ratio forcé du layout : le designer impose
  déjà un ratio aux fenêtres de jeu, donc `minHeight = minWidth / ratio`). Valeur **pré-remplie** par le profil room
  (Unibet, valeur mesurée empiriquement) et **éditable** par l'utilisateur — les clients room changent, une valeur
  figée fausse serait une impasse.
- **Alerte existante** : `LayoutAlertDto { belowFloor: boolean, tileWidth: number, minWidth: number }` — émise quand
  la largeur de tuile calculée passe sous le plancher. Elle est déjà transportée jusqu'au front (`useLayoutAlert()`)
  mais **aucun écran ne la consomme**.

### Besoin UX (à toi de concevoir la forme, voilà l'intention)

1. **Rendre la contrainte visible en permanence** dans le Layout Designer : le joueur doit voir la taille minimum de
   la room active (ex. « Unibet — min 480 × 340 px ») pendant qu'il compose. Probablement près des contrôles de
   grille/zone, là où se décide la taille effective des slots.
2. **Réaction immédiate quand un slot passe sous le plancher** : composer une grille trop dense sur une zone trop
   petite doit se voir sans ambiguïté (état d'alerte sur les tuiles concernées et/ou le contrôle fautif), avec la
   valeur calculée vs le minimum (« tuiles 312 px < min 480 px »). Ce n'est **pas bloquant** (on tuile quand même —
   comportement backend actuel « alerte mais tuile ») : c'est un avertissement fort, pas une erreur.
3. **Édition de la valeur** : champ éditable pré-rempli, avec un moyen évident de revenir à la valeur d'origine du
   profil. À toi de trancher où il vit le mieux (réglages du designer ? écran Room Profile, où la contrainte
   appartient conceptuellement à la room ?) — la valeur est **globale par room**, pas par layout.
4. **Hiérarchie d'honnêteté** : la valeur pré-remplie vient d'une mesure empirique, pas d'une doc officielle. Si tu
   distingues visuellement « valeur d'usine » vs « valeur modifiée par le joueur », c'est un plus.

### Contraintes

- Écran(s) touché(s) : `LayoutDesigner` (affichage + alerte), potentiellement `RoomProfile` (édition de la valeur).
- Room unique pour cette phase : Unibet. Pas d'UI multi-room à prévoir.
- Fixtures couvrant au moins : état nominal (aucune alerte), état below-floor (tuiles sous le plancher), valeur
  éditée vs valeur d'usine.
- Zéro logique métier dans les vues : le calcul `tileWidth`/`belowFloor` arrive par props (il existe déjà backend).

---

## B — Ghost de drag & drop à l'empreinte réelle de la tuile

Dans le Layout Designer, une tuile peut occuper plusieurs cellules de la grille (`cw × ch`, ex. une table en 2×2).
Pendant un drag, le retour visuel de drop actuel n'allume qu'**une seule cellule** — celle sous le curseur
(`data-over` sur le `EmptyCell`/`TileCell` survolé). Pour une tuile 2×2 on ne voit donc qu'un quart de l'empreinte
réelle : impossible de juger si la tuile rentre, ce qu'elle recouvre, ou où elle va vraiment atterrir.

### Comportement actuel (repères dans TON export)

- `LayoutDesigner.tsx` : `TileCell` / `EmptyCell` posent `data-over` quand `ctx.over` correspond à leur clé — un
  seul élément à la fois, span ignoré.
- Le drag connaît déjà la tuile déplacée (`ctx.drag`) donc son `cw`/`ch` ; la géométrie de drop (clamp aux bords,
  swap vs place) est déjà calculée au drop — seul le **retour visuel pendant le survol** est en retard.

### Besoin UX (à toi de concevoir la forme, voilà l'intention)

1. **Le ghost couvre l'empreinte complète** : en survol, les `cw × ch` cellules que la tuile occuperait s'allument
   comme un seul bloc (ex. 4 cellules pour une 2×2), ancré exactement comme le drop réel le poserait — y compris le
   clamp quand on approche un bord de grille (le ghost se décale comme la tuile se décalera, pas de mensonge visuel).
2. **Lisibilité du résultat** : distinguer visuellement « je vais me poser sur du vide » de « je vais swapper avec
   cette tuile » à l'échelle de l'empreinte entière (le hint Swap/Place actuel existe déjà sur une cellule — à
   généraliser ou repenser à l'échelle du bloc).
3. **Cohérence avec l'existant** : même vocabulaire visuel que les états `data-over`/`data-selected` actuels du
   canvas ; le `sizeBadge` (`2×2`) peut aider à annoncer l'empreinte pendant le drag si tu le juges utile.

### Contraintes

- Écran touché : `LayoutDesigner` uniquement (canvas de composition).
- Le calcul de la cellule d'ancrage/clamp peut rester dans la vue DS (géométrie pure de grille, déjà ton
  territoire — drop/swap/clamp vivent déjà dans l'export), zéro nouvel aller-retour app.
- Fixtures couvrant au moins : drag d'une tuile 1×1 (comportement actuel préservé), drag d'une 2×2 en plein milieu,
  drag d'une 2×2 clampée contre un bord, survol d'une tuile existante (swap) avec empreinte multi-cellules.

---

## C — Reliquat du drop RoomProfile v2 (rapport précédent, toujours dû)

1. **lint** : `ui/screens/RoomProfileCalibration.tsx:246:74` — `@stylistic/no-extra-parens` (non auto-fixable en JSX).
2. **react-doctor** (3 warnings `RoomProfile.tsx`) : `js-set-map-lookups` (l.290), `js-index-maps` (l.321 —
   construire une Map avant la boucle), `prefer-useReducer` (l.348 — même recette que LayoutDesigner).
3. **Vue crashe sur `sizes: []`** (`RoomProfile.tsx:356-357`) : garde sur `data.sizes[0]` + un état vide designé
   (« Aucune taille à calibrer — crée des layouts d'abord », dans ton langage). Un `RoomProfileData` avec
   `sizes: []` est légal.
4. **Surface d'offre de recadrage à l'import** : `data.cropOffer?: { sizeId, rect } | null` +
   `onConfirmCrop?()` / `onDeclineCrop?()` — l'app fournit l'offre, la vue la matérialise. Bonus : sélecteur de
   label de situation dans `ImportShotDialog`.
5. **Micro-gap parité rooms-rois** : nom court vs complet des zones de siège — dis-nous la clé que `ZoneRow` doit
   lire (slot `full?` ou l'inverse), cosmétique.
