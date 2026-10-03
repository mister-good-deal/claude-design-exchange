# Demande Claude Design — 0.8.3 : zoom et déplacement du canevas de l'atelier, échantillon de capture par taille

Issues d'origine : [#572](https://gitlab.laneuville.me/rom1/tatami/-/issues/572) et
[#573](https://gitlab.laneuville.me/rom1/tatami/-/issues/573), G1 [#583 note
14457](https://gitlab.laneuville.me/rom1/tatami/-/work_items/583#note_14457), accord de Romain du 2026-10-03.
Écrivain exchange : lt-overlay. Ce fichier appartient à la MR du lot ; il ne livre aucune édition de `ui/`. L'export est
cumulatif avec le drop `2026-10-02.2` et les demandes précédentes.

Romain, terrain 03/10 : « on doit pouvoir zoomer sur l'affichage du milieu avec Ctrl+molette et se déplacer comme dans
une map avec le clic gauche maintenu (comme dans la station de la Room Profile pour placer les ROI) » ; « il serait bon
que Tatami capture automatiquement une frame avec le joueur en action […] pour chaque taille de fenêtre déclarée dans le
layout […] pour faire un échantillon auto utilisable ici ».

## 1. Overlay — zoom Ctrl+molette et déplacement du canevas (`OverlayCanvas.tsx`)

Aujourd'hui `useFit` ajuste la scène au panneau (`fitZoom`, borné à [0,2 ; 1]) : « zoom 51 % » à 1572×1080 n'est que
cet ajustement, et le joueur ne peut ni grossir ni se déplacer.

- **Ctrl+molette** sur le canevas : zoom par pas ×1,25, **ancré sous le curseur** (le point visé reste sous la souris).
  Bornes : de min(ajustement, 0,2) à 4. Molette sans Ctrl : rien. Handler synthétique passif comme `ZoomViewport` de la
  station 4 (pas de `preventDefault`, React Doctor à zéro).
- **Clic gauche maintenu sur le fond** (pas sur un élément, une poignée ni une croix) : la scène suit la souris. Un
  clic SANS mouvement garde son effet actuel (désélection, `stageClear`). Glisser un élément, une poignée ou une croix
  ne change pas ; ses deltas restent divisés par le zoom.
- **« Ajuster »** : un bouton près du libellé « fenêtre W×H px · zoom N % » ramène à l'ajustement et recentre. Le
  libellé suit le zoom courant. Changer de taille ou de room revient aussi à l'ajustement.
- État d'affichage interne à l'écran : **aucune nouvelle prop, aucun callback**, rien n'est enregistré.
- Mots fr/en dans `STRINGS[locale]` : « Ajuster » / « Fit », et l'aide du canevas si elle en parle.
- Fixture : rien de neuf ; la parité garde l'état ajusté.

## 2. Overlay — échantillon de capture de la taille regardée (`Overlay.tsx`)

L'app garde d'office une capture de la table à chaque taille, à la première décision du héros (fichier local, jamais
envoyé). Aujourd'hui le fond ne connaît que l'import de séance (`ShotImport`, URL objet perdue au rechargement).

- `OverlayData.tableShot?: { url: string; takenAt: string } | undefined` : la capture de la taille regardée
  (`sizeId`), servie par l'app ; `takenAt` est une date déjà formatée par l'app, rendue telle quelle. (Le nom `sample`
  est déjà pris par `OverlaySample`.)
- Servie : à l'ouverture de cette taille, le fond est **« Capture » avec cette URL**, sous-titrée « échantillon du
  <takenAt> » (en : « sample of <takenAt> »). Absente : « Feutre », comme aujourd'hui.
- Le choix Feutre / Capture / Grille reste au joueur ; « Importer une capture » remplace le fond pour la séance comme
  aujourd'hui (l'échantillon servi n'est pas touché).
- `on.onForgetTableShot?: (sizeId: string) => void` : un bouton « Oublier l'échantillon » (en : « Forget sample ») à
  côté d'« Importer », rendu seulement quand `tableShot` est servi. L'app efface la capture et ne sert plus `tableShot`
  ; la prochaine première décision du héros à cette taille en refait une. Aide au survol : « Tatami en reprendra une à
  la prochaine décision à cette taille. »
- Fixture : un cas avec `tableShot` (n'importe quelle capture de table du prototype), un cas sans.
