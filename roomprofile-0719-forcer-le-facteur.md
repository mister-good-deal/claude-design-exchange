# Demande Claude Design — 0.7.19 : forcer le facteur d'une taille qui s'abstient

Lot lt-etude [#443](https://gitlab.laneuville.me/rom1/tatami/-/issues/443), rédigée et publiée par lt-atelier (écrivain
exchange). **Un point, rien d'autre.** Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Pourquoi — un trou de la demande précédente, pas du drop

La demande « changement de référence » disait : sur une taille sans facteur, `abstain` se dit **à la place** du
facteur. Le drop 2026-09-23.3 l'a fait à la lettre, et c'est la demande qui avait tort : une taille qui s'abstient pour
« hauteur non comparable » n'a plus aucun champ pour **forcer** son facteur, alors que forcer le facteur est
précisément le remède. Parcours terrain rejoué sur le vrai moteur : 698 × 720 devient la référence, 1048 × 720 s'abstient
alors (« hauteur non comparable »), et le mainteneur force son facteur à 2 — geste impossible à l'écran aujourd'hui.

## Attendu

Sur une taille **hors référence** avec `scale: null` et le handler `onSetAmountTreatment` :

- la ligne du facteur garde le motif servi (`abstain`, verbatim) **et** offre le champ numérique du facteur, vide, pour
  le forcer (`onSetAmountTreatment(sizeId, "scale", valeur)`) — mêmes règles que le champ d'aujourd'hui (Échap remet la
  valeur servie, un champ vide n'envoie rien) ;
- une fois forcé, la taille revient servie avec `scale` et `source: "forced"` : le champ d'aujourd'hui et son « Revenir
  au défaut » s'appliquent tels quels.

Sans handler, ou sur la référence (`reference: true`), rien ne change.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le [`lint-bundle/`][bundle] à jour (`npm install`,
`npm run fix`, puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings.
Déclarez le point dans `parity.declaredChanges`.

[bundle]: https://github.com/mister-good-deal/claude-design-exchange/tree/main/lint-bundle
