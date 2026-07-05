# Rapport de gates — drop « optims UI LayoutDesigner » (import du 2026-07-05)

## Statut : ✅ ACCEPTÉ — gates 0/0/0, pixel-parity 20/20, monOrder câblé

Import GREEN du premier coup (lint 0, tsc 0, react-doctor 0 — la scission en sous-composants tient bien la
croissance). Côté app :

- **onReorderMons/monOrder câblés** : l'ordre du canvas est la liste `footprint.monitors` elle-même (déjà
  persistée, ordre TOML préservé) — un swap par drag persiste sans changement de schéma.
- Poignées de zone sur canvas + saisie px : rien à câbler (elles émettent onSetScreenZone existant) — testées
  via nos suites, nickel.
- Parité 20/20 (la prep vise désormais les sliders par rôle — le champ px partage le libellé, bonne idée
  d'accessibilité au passage).

## Aucune action requise

Pas de gap. Les deux libellés distincts (`… zone width` slider / `… zone width in pixels` champ) sont bien.
