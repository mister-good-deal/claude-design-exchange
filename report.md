# Tatami app → Claude Design — iteration request (0.5.2) : état « non calibré » du ladder + restauration des hotkeys de presets

Contexte : release corrective 0.5.2 après la session de debug 0.5.1 (table Spin hors bucket de calibration → menu de
mise affiché mais **inerte**, sans aucun signal à l'écran). Côté moteur, l'app projette désormais les zones actionneur
depuis n'importe quel bucket calibré (une calibration couvre toutes les tailles de tuile), donc `calibrated = false`
devient rare — mais quand il survient (aucun bucket du tout pour la room), le ladder ne doit plus se présenter comme
actionnable. Ces UX vivent dans des fichiers **DS-owned** (`apps/web/src/ui/screens/BetSizing.tsx`,
`BetSizing.fixtures.ts`, `Hotkeys.tsx`, `i18n.ts`), donc rien ne peut être porté côté app sans casser
`check:ds-sync` — d'où cette demande.

## Demande 1 — état « non calibré » du ladder `BetSizing`

1. **Contrat** : ajouter `calibrated: boolean` à `BetSizingData` (`BetSizing.fixtures.ts`). Le back-end publie déjà ce
   verdict dans `BetStateDto.calibrated` (géométrie live de la table survolée) — le container app le mappera tel quel,
   aucun nouveau canal nécessaire.
2. **Rendu quand `calibrated = false`** : presets grisés / non actionnables (le clic n'aurait AUCUN effet dans la bet
   box — garde « jamais de saisie à l'aveugle ») + un badge/bandeau compact « Non calibré pour cette taille de
   fenêtre » (i18n FR/EN). Le compteur de montant et la molette suivent le même état inerte.
3. **Fixture** : une variante non calibrée dans les fixtures pour la preview DS et les tests.

Critère de recette : sur un profil sans aucun bucket `[[sizes]]` portant `bet_input`, le ladder s'affiche au survol
avec presets grisés + badge, et aucun preset n'est cliquable ; dès qu'un bucket existe, l'état nominal revient.

## Demande 2 — bouton « Restaurer les hotkeys par défaut » dans « Hotkeys & bets »

Contexte : le contournement de session 0.5.0 avait purgé les hotkeys de presets (`hotkey = ""` sur 26 presets). Une
migration one-shot 0.5.2 les re-seed depuis la référence, mais il manque une porte de sortie UI pour l'avenir (un
utilisateur qui veut revenir aux défauts après avoir expérimenté).

1. **Contrat** : ajouter un callback optionnel `onRestoreDefaultHotkeys?: (() => void)` aux props de `Hotkeys.tsx`,
   avec un bouton discret dans l'en-tête du `SizingPanel` (à côté du toggle instant/nudge). Libellé i18n FR/EN :
   « Restaurer les hotkeys par défaut » / “Restore default hotkeys”.
2. **Portée** : le bouton ne touche QUE les hotkeys des presets de sizing (jamais les montants `v`, jamais les
   bindings `[input]`). Une confirmation inline légère (le pattern « Pick another / Take it » n'est pas requis ici,
   un simple confirm à deux états suffit).
3. Le container app fournira le handler (relecture des défauts de référence + commit `update_sizing`) — rien d'autre
   à implémenter côté DS que le bouton, son état disabled quand le callback est absent, et l'i18n.

## Rappel — demandes 0.5.1 toujours en attente (report précédent)

L'itération demandée en 0.5.1 reste à livrer : **conflits de hotkeys de presets résolus inline dans « Hotkeys &
bets »** (presets inclus dans le registre de conflit, retrait du contournement `scope === "preset"`, `ConflictNotice`
sur les lignes de presets, réutilisation inter-situations légitime — une seule liste street × situation active à la
fois). Détail complet dans le repo app : `doc/ds-report-0.5.1-preset-hotkey-conflicts.md`.
