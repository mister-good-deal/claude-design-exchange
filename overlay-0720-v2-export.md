# Demande Claude Design — Overlay v2, l'export importable

Le handoff du 2026-09-24 est un prototype validé (21/08). L'app a besoin de l'export au contrat §6 : des écrans
présentationnels (`data` / `on` / `slots`), la géométrie, les tags, les notes et toute valeur de jeu servis par l'app.
Rien ne se contourne côté app (`apps/web/src/ui/` appartient au rail Claude Design).

## 1. Les écrans attendus

1. **`Overlay`, l'atelier** — il remplace l'écran actuel (la tab Notes disparaît). Données servies : rooms et tailles
   offertes, paire courante, badge enregistré / défaut, géométrie des quatre éléments, croix (servies, avec leur
   origine), rectangles de sièges calibrés (ou leur absence), valeurs d'exemple des sièges, palette de tags. Rappels :
   `onSelectRoom`, `onSelectSize`, `onGeo(element, patch)`, `onCross(seat, point)`, `onResetCrosses`,
   `onResetElement`, `onCopy(scope)`, `onAddTag`, `onUpdateTag`, `onDeleteTag`, `onImportTagIcon`. Mode, fond, capture
   importée, sélection et « Tout au survol » restent un état d'écran.
2. **Les quatre éléments de table** — composants rendus dans les fenêtres d'overlay, un par instance :
   `SeatStats`, `SiqCluster` (avec son panneau de note et sa palette), `BetBar` (rail et échelle ; il reprend le rôle
   de `BetSizing`), `DecisionAid`. Chacun reçoit ses valeurs formatées, son contenu et son opacité ; l'atelier les
   réutilise sur son canvas, pour qu'il n'y ait qu'un seul rendu.

## 2. Ce que le prototype ne montre pas et que l'app exige

- **Raccourci de tag** dans l'éditeur (décision de Romain, 24/09), avec le refus de conflit servi par l'app (texte du
  propriétaire), comme l'écran actuel.
- **États du HUD** : Dégradé (stats sans decision aid), Perdu / hors décision (aucune valeur de la main, un mot le
  dit), joueur non reconnu (cluster sans « + » actif, mot servi).
- **Bet bar** : titre street · situation · position servis ; marque « borné » sur un montant ; repli étiqueté
  « situation non lue » ; état inerte sans calibration (le `calibrated` de `BetSizing`).
- **Decision aid** sans « Équité bluff » (retirée de la 0.8) : cotes du pot et SPR seuls, ligne des cotes absente sans
  mise à payer.
- **Micro de dictée** rendu seulement si son handler est fourni (dictée en 0.9.x).
- **Atelier** : une taille sans sièges calibrés le dit ; un seul format de table ⇒ pas de sélecteur de taille de table ;
  une table au-delà de la réserve d'overlay est signalée.
- **Édition de note** : l'app signale le début et la fin de l'édition (`onNoteEditStart` / `onNoteEditEnd`), pour
  suspendre le routage des frappes et rendre le focus (écart E1, accordé en GATE 2).
