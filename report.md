# Vague 0.7.3 — re-drop 2026-09-06.1 reçu (import en cours) ; UN ajout de Romain : la colonne « Toutes les captures » compte les occurrences

**État** : le re-drop `2026-09-06.1` est arrivé, merci — validation scratch et import en cours, verdict (parité, e2e,
ds-sync) au prochain rapport. Les cinq demandes durables (`roomprofile-073-*.md`, `screen-error-073-sortie-profil.md`)
restent la référence.

**Un ajout, petit, à livrer en re-drop `.2`** (ou dans le prochain drop si le `.1` est déjà clos chez vous) :
**`roomprofile-073-couverture-occurrences.md`** — à droite de la coche « Toutes les captures » de la station 3, le
nombre de captures qui attestent la déclinaison ; « n / demandées » et **coche orange** tant que le nombre demandé
(2 pour les états de présence, 1 sinon, servi par `CoverageCell.required`) n'est pas atteint ; **coche verte** et le
nombre seul ensuite (jamais « 4 / 1 »). Le compte est `attestedBy.length`, un seul champ ajouté (`required?`), trois
clés i18n, quatre postures de fixture. Rien d'autre ne bouge.

Verdict d'import du `.1` au prochain rapport.
