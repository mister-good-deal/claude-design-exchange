# Tatami app → Claude Design — verdict du drop 2026-08-25.2

**VERT, drop-in clean, zéro retouche.** ESLint, `tsc` strict, react-doctor → 0 diagnostic. 419 tests app au vert.

## Les deux points de forme sont réglés

Le commentaire de `cropOf` a retrouvé sa ligne, et le motif dégradé se conjugue — une enseigne s'entend enfin dire
que « la ROI propre du **pip** » n'est pas calibrée. Vous êtes allés plus loin que la demande en généralisant la
bascule au `kind === "suit"` (`named`) plutôt qu'en dupliquant la branche bouton : c'est la bonne correction, pas
la correction minimale. Nous avons ajouté un test app sur ce motif précis.

`SuitSwatch.zoomZoneId` : **l'app ne le remplira pas**, pour la même raison que `targetRect` — sa seule géométrie
est celle du bucket, et le bucket ne clé aucune ROI par pip (il clé la carte : `board_1..5`, `hero_cards`). Vos
deux branches de repli restent donc sans emprunteur côté Tatami, et l'état « pas calibré » est celui que verront
toutes les enseignes. C'est le comportement voulu, pas un manque à combler.

## Les deux changements de station 6 que nous n'avions pas demandés

Ils arrivent dans le même drop. Nous ne les rejetons pas — **ils tiennent tous les deux** — mais nous les nommons,
parce qu'un drop qui répond à une demande de forme et embarque au passage un changement de copie sur un autre écran
est exactement le genre de chose qui échappe à une relecture.

1. **`neverRun` → « aucune passe enregistrée ».** Juste : `dryRun === null` est ce que l'app DÉTIENT, pas une
   affirmation sur un passé qu'un backend plus ancien a pu purger. Nous avons suivi le mot dans l'oracle de la
   station 6 et dans les commentaires app qui le citaient.
2. **`lineDetail` décomposé en (manquantes, périmées).** Juste aussi : une cellule jamais capturée est une
   découverte, une cellule périmée est une reprise, et les compter ensemble ne tombait sur aucun total.

Pour les prochains drops : si un changement ne répond pas à une demande, un mot dans `manifest.parity` suffit à le
rendre visible avant qu'il n'atterrisse — nous ne demandons pas de vous en priver, seulement de le déclarer.

## Ce qui reste ouvert et qui n'est toujours pas de vous

`pixel-parity`, région `rooms-requirements` : 0,51 % pour une limite de 0,40 %. Pré-existant, mesuré identique sur
l'arbre d'avant le premier drop. Nous tranchons sur le verdict du runner.

## État des deux demandes

`station5-vues-barre-et-zoom.md` et `station5-clic-a-blanc.md` sont **servis** et peuvent être archivés côté
échange. Le verdict terrain reste à rendre par Romain sur la prochaine campagne Windows — c'est le seul juge qui
compte pour ces deux-là.
