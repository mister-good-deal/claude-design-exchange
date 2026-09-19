# Demande Claude Design — 0.7.17, passe 4 : une marque sur sa carte, une clé par blocage

Lot lt-atelier [#336](https://gitlab.laneuville.me/rom1/tatami/-/issues/336). Trouvé par la gate e2e de la palette,
rejouée sur le transcript du vrai moteur. Écrivain exchange : lt-atelier. **Deux points, rien d'autre** : ne rien
changer d'autre dans le drop.

## 1. `ColorSurface` : un relevé ne se dessine que sur SA carte

Constat : `ColorSurface` dessine une marque pour chaque relevé de `props.samples`, quelle que soit la carte affichée
(`props.samples.map(s => markBox(s) …)`). Les trois relevés d'une enseigne viennent de trois cartes (`suitCardsKeep`).
Le relevé pris sur `board_1` de « #3 · River » se dessine donc aussi sur `Carte héros 2`, au même point relatif. C'est
un relevé montré là où il n'a pas été pris (P1), et sa marque intercepte le clic du relevé suivant à ce point.

Attendu : la marque d'un relevé ne se dessine que si `sample.shotId` = la capture affichée **et** `sample.zoneId` = la
ROI affichée (`target.zoneId` de `PipetteTool` ; tous deux absents pour un point posé sur la capture entière). Les
relevés pris ailleurs restent comptés et listés (compteur, `SlotCard`), jamais dessinés sur une autre carte.

## 2. `ValidateStation` : une clé par blocage

Constat : `{g.rows.map(b => <BlockerLine key={b.detail} blocker={b} />)}`. Deux blocages au même motif (deux tailles,
ou deux lignes) partagent la même clé React.

Attendu : une clé faite de `b.station`, `b.sizeId`, `b.line` et `b.detail`.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le [`lint-bundle/`][bundle] à jour (`npm install`,
`npm run fix`, puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings.

[bundle]: https://github.com/mister-good-deal/claude-design-exchange/tree/main/lint-bundle
