# Demande durable — Room Profile : unité d'affichage de la room et vocabulaire `presence` (0.7.0)

## 1. L'unité d'affichage de la room (bloquant pour le geste, pas pour la garde)

La room affiche ses montants soit en **jetons**, soit en **BB**. C'est une déclaration du joueur — Tatami ne la devine
pas — et tout le reste en dépend : le dry-run refuse une lecture dont les glyphes la contredisent (« affichage room
incompatible »), et le résolveur d'unité du moteur convertit selon elle. La plupart des joueurs jouent en BB : c'est
la valeur livrée par défaut, jetons reste supporté.

Aujourd'hui la valeur ne se déclare qu'en éditant le fichier de profil à la main. Il manque, sur l'écran Room Profile,
**exactement le même couple que la pause de capture** : un champ servi (jamais un défaut d'écran) et son offre de
modification.

- `displayUnit: "chips" | "bb"` dans `RoomProfileData`, **non optionnel** : la station rend la valeur SERVIE, comme
  `captureDelayMs`. Un défaut d'écran mentirait sur ce que le profil porte.
- `onSetDisplayUnit?: ((unit: "chips" | "bb") => void)` dans `RoomProfileCallbacks` : une préférence, donc une offre
  — sans handler la station ne rend pas le contrôle et reste entière, comme `onSetCaptureDelay`.

Où : la station qui porte déjà `captureDelayMs` (station 3). Deux états, pas d'état intermédiaire, pas de saisie
libre. Le mot que le joueur lit doit dire l'AFFICHAGE de la room, pas une préférence de Tatami. Clés i18n à prévoir
dans `ui/screens/i18n.ts` (FR/EN) : le libellé du champ, « Jetons », « BB ».

## 2. Le vocabulaire `presence` (cosmétique, non bloquant)

Une zone de kind `presence` (badge dealer, dos de carte d'un vilain, siège occupé) est un rect que le joueur pose,
plus une couleur de référence qu'il prélève. Le vocabulaire DS n'a pas de mot pour elle :

- `ZoneKind = "data" | "action" | "timer" | "actuator"` — une présence se rend donc en `data`, comme un montant, alors
  qu'elle ne lit aucun glyphe (elle n'expose pas de `readKind`, et l'outil glyphes ne l'offre pas).
- `PointKind = "probe" | "suit" | "actuator"` — sa cible de couleur se rend en `probe`, le mot des boutons.

Rien n'est faux fonctionnellement et rien n'est bloqué. Un kind `presence` (ou une pastille qui distingue « ce signal
est là / il n'y est pas » d'une lecture de valeur) rendrait la station lisible : sur le profil livré, sept lignes du
rail des pixels sont des présences, et rien ne les distingue des six sondes de boutons.

## Pour information — déclinaisons par siège (aucun changement de contrat)

Le catalogue de déclinaisons de la matrice de couverture passe de 20 à 24 sur le profil livré : les états « cartes
distribuées / absentes » et « siège occupé / vide » sont désormais attestés **par siège** (vilain 1, vilain 2), comme
le bouton l'était déjà. Ce sont des données servies par l'app dans la forme existante de `CoverageMatrix` ; rien à
changer côté DS, sinon vérifier que les libellés « Vilain 1 — cartes distribuées » etc. tiennent dans la cellule.
