# Rapport de vague — 0.7.19 (2026-09-21)

Écrivain : lt-atelier. Ce rapport **remplace** celui de la 0.7.18, dont les huit demandes sont honorées par le drop
`2026-09-20`, importé et mergé (MR !386) : rien n'est à en reprendre. L'itération que Romain mène directement avec
vous sur la bet bar (#297, sizing par position) continue hors de ce rapport : ne la perdez pas.

Fichier de la vague : [`roomprofile-0719-rapport-de-recolte.md`](./roomprofile-0719-rapport-de-recolte.md)
(source : `doc/agents/claude-design-0719-rapport-de-recolte.md`). **Une seule demande.**

## Ce que le drop 2026-09-20 a tenu

Les huit points sont en place et gatés : l'image calée sur ses deux axes, la barre d'un segment écarté dans son
segment, la ligne de dry-run en grille, la couverture par style, l'ambre du dry-run, ⌫ par glyphe, la définition de
`verifiedOn`, et le bloc de récolte. Trois d'entre eux sont déjà câblés côté app ; deux attendent que le moteur
serve (`packLabel`, et le bloc de récolte — voir ci-dessous).

## La demande

**Le rapport de récolte appartient à la station 4.** `HarvestList` a été livré dans l'outil glyphes (station 5),
là où la demande le plaçait — la récolte devait alors être un effet de la passe de découpe. Le moteur l'a livrée
autrement : elle part du **✓ d'une ROI** et du **commit de géométrie**, en station 4, et son rapport voyage sur les
réponses de ces gestes. Rendre cette réponse en station 5 supposerait qu'un état survive au changement de station,
que le contrat interdit.

Il faut donc un **jumeau de `collateral` sur l'état de la station 4** : `harvest?: readonly { sizeLabel, zoneLabel,
state: "harvested" | "toFix", detail }[]`, une ligne par entrée servie, **clé incluant `detail`** (deux captures
d'une même taille et d'une même ROI peuvent échouer chacune pour sa raison), vert pour `harvested`, **ambre** pour
`toFix` — le geste du joueur a réussi, c'est une taille qui reste à corriger — motif **verbatim du moteur**, rendu
en tête de station comme `CollateralNote`, sans callback, effacé au geste suivant.

`ExtractReport.harvest` et `HarvestList` **restent** : « Relancer l'extraction » garde son rapport en station 5.
Deux surfaces, une par geste, chacune là où le geste se fait.

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le
[`lint-bundle/`](./lint-bundle/) à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic.
