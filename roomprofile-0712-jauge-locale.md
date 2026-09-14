# Demande Claude Design — 0.7.12 : la jauge de la station 3 dit ce qui manque

Issue d'origine : [#298](https://gitlab.laneuville.me/rom1/tatami/-/issues/298) (campagne Windows 0.7.11, lot
lt-atelier #301), décisions de Romain dans ses notes du 2026-09-13. Écrivain exchange : lt-atelier. Ce fichier
appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Ce que l'app change déjà

`CoverageCell.attestedBy` et `CoverageCell.state` sont désormais **vivants** : l'app les recompte à chaque rendu depuis
les labels écrits des captures qu'elle tient (coche, F9, suppression, jumelles d'une même prise). Le témoin d'une
cellule est donc juste quelle que soit la capture affichée. Aucun champ de contrat ne bouge.

## Ce qui est attendu de l'écran (`AttestPanel`)

| Élément | Attendu |
|---|---|
| Compte d'une jauge | `attestedBy.length` de la cellule de la taille, lu tel quel. `witnessCounts` perd sa correction ±1 par la capture affichée (et ses paramètres `ticks`, `shotId`). |
| Style de jauge | **un seul** : une case ; 0 témoin vide, 1 témoin deux carrés dont un allumé, 2 et plus ✓. |
| Famille `deviation` | **une ligne par variante, face ordinaire comprise**, exclusives sur une capture (la forme `choice`, un radiogroup), chacune avec sa jauge. Sur une capture qui n'a encore rien d'écrit pour la famille, **seule la valeur par défaut que le catalogue déclare** (`VariantDef.normal` : héros servi, timer absent, message de nouvelle partie absent…) est cochée. La paire de jauges côte à côte (`vfaces`) disparaît. |
| Famille `choice` (actions, board, dealer) | **aucune valeur par défaut** : rien n'est coché tant que le joueur n'a pas choisi — inchangé. |
| Face ordinaire non nommée | `Family.normal === null` : aucune valeur par défaut ; la famille garde sa seule ligne d'écart, avec sa jauge. |
| En-tête de colonne | « Toutes captures » → « Cette taille » / « This size » ; le sous-titre « Normal · Écart » (`attestColNormal`, `attestColDeviation`) disparaît. |
| Légendes | `tourLegendAll` ne décrit plus deux styles ; `attestNormalHint` (« une case non cochée atteste le cas ordinaire ») n'a plus d'objet, la face ordinaire ayant sa ligne. |

## Ce qui ne bouge pas

L'émission reste l'ensemble **complet** de la capture (`compose`) : le premier geste sur une capture écrit les choix
du joueur plus les seules valeurs par défaut que le catalogue déclare, jamais une valeur pour une famille `choice` non
choisie — `compose` fait déjà cette distinction. Une capture F9 jamais ouverte reste à zéro témoin, même si ses
valeurs par défaut s'affichent cochées. « Non visible ici » et le compteur « n / m couvertes » restent
tels quels. Fixtures attendues : une famille d'écart à 1 témoin (deux carrés), une à 2 (✓), une capture neuve avec
la face ordinaire cochée par défaut.
