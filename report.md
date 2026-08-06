# Tatami app → Claude Design — v3.6 : parité 24/25, et il ne reste QUE quatre phrases

Ton drop est intégré : le patch `Set` a fermé le dernier diagnostic doctor, ton `LineState` aligné sur notre
tri-état rend notre mapping passe-plat, et **on a implémenté ta pondération à l'identique** (verte 1, périmée 0,5,
manquante 0). Merci d'avoir tranché — c'était bien ta décision à prendre.

**La parité est passée à 24/25.** `rooms-requirements` et `rooms-stations` sont verts. Il ne reste que
`rooms-main` à **0,573 %** (seuil 0,40 %), avec des boîtes **identiques** des deux côtés (1072×736) : plus aucune
divergence de mise en page, uniquement du texte.

On a attribué **100 % des 4 521 pixels résiduels** à des runs nommés — voici l'inventaire complet, et surtout
**l'arbitrage chiffré** : un seul poste bloque, les autres non.

## L'arbitrage : les 4 cartes du chemin critique font 72 % du résidu

| scénario | pixels | ratio | verdict |
|---|---|---|---|
| aujourd'hui | 4 521 | 0,573 % | ❌ |
| **on ne ferme QUE les 4 cartes** | 1 246 | **0,158 %** | ✅ |
| on ferme tout SAUF les 4 cartes | 3 275 | 0,415 % | ❌ |
| on ne ferme que le score | 4 155 | 0,527 % | ❌ |
| on ne ferme que la station 6 | 3 949 | 0,501 % | ❌ |
| on ne ferme que les métas 1+2 | 4 213 | 0,534 % | ❌ |

Autrement dit : **si tu ne fais qu'une chose, fais les cartes.** Tout le reste peut rester tel quel et la région
passe au vert.

### Les 4 cartes

| ton prototype | ce que l'app rend |
|---|---|
| `Capture actions/2-buttons @ 960×600` | `Capture 2 buttons — check / bet @ 960×600` |
| `Capture board/4 and board/5 @ 960×600` | `Capture 4 cards (turn) @ 960×600` |
| `Confirm 14 projected zones @ 960×600` | `Confirm zone hero_cards @ 960×600` |
| `Place 1 probe + 2 suit pixels @ 960×600` | `Sample the suit palette with the pipette` |

`ResumeItemDto` est **un geste à une adresse** : une action, un bucket, une zone ou une variante. Tes cartes
agrègent — une *liste* de variantes (carte 2), un *compte* de zones (carte 3), deux comptes et un bucket que le
geste `measure_suits` ne porte pas (carte 4). Et la carte 1 emploie un slug (`actions/2-buttons`) qui n'est ni ton
id de variante (`act-2`) ni la paire du DTO (`actions/two_buttons`).

**Deux issues :** soit tes cartes se composent d'une action + une adresse (ce que le contrat porte), soit tu nous
dis quels champs d'agrégation te manquent et on les ajoute. Dis-nous simplement lequel des deux tu préfères.

## Les trois autres, pour information — deux sont des incohérences de tes fixtures

**Le score, 43 vs 29 : ta fixture se contredit elle-même.** Notre formule est désormais la tienne, au caractère
près. L'écart ne vient pas du calcul mais de **quelles lignes sont périmées** :

- ligne `coverage` : tu la déclares `stale`. La règle backend veut que `stale` = *toutes* les cellules attestées au
  moins une fois. Or ton `COVERAGE` porte **4 cellules réellement manquantes** (`s960` × `act-2`, `board-4`,
  `board-5`, `hero-folded`) — précisément celles que tes propres cartes 1 et 2 demandent de **capturer**. → `missing`.
- ligne `dryruns` : tu la déclares `stale`. La règle veut que *chaque* bucket actif porte une passe verte. Or
  `s960` a `dryRun: null`, jamais lancé — comme le dit ta propre carte 7 (`Dry-runs — 3 buckets`). → `missing`.

Deux `missing` au lieu de deux `stale` = 2/7 = **29 %**, pas 3/7 = 43 %. On ne fera pas dire `stale` à notre shadow :
il afficherait un nombre que la production ne peut pas produire pour ce profil.

**Station 6 `LOCKED`.** Le seul verrou que le contrat exprime est « `[metrology]` absente ⇒ stations 3+ verrouillées ».
Ici la métrologie est faite. Et ta fixture se contredit deux fois : elle affiche `1/3 buckets validated` (un bucket
est donc déjà passé) et sa carte 7 propose un geste sur cette station — une station verrouillée n'offre rien.

**Métas des stations 1 et 2.** `4/4 rules` et `5/5 phases` n'ont aucun porteur : `StationStatusDto` remplit `at`
seul pour la détection, `at` + `count` pour la métrologie. **Et il y a une régression** : tu avais demandé `count`
en v3.5 précisément pour afficher « 14 points » — on l'a livré, et v3.6 affiche « 5/5 phases » à la place. `count`
n'est donc plus rendu par personne. Soit tu reviens à `14 points`, soit tu nous demandes `done/total` sur ces deux
stations et on les ajoute.

## Un point silencieux, à savoir avant qu'il ne morde

Tu as redéfini `Readiness.toVerify` comme *le nombre de lignes périmées* (2). Notre `readinessOf` le remplit encore
avec *les cellules capturées en attente de dry-run* (8). **Aucun de tes composants ne le rend aujourd'hui**, donc la
parité est aveugle dessus — mais le jour où l'un le rendra, les deux ne diront pas la même chose. Confirme ta
définition et on aligne.

## Ce qu'on a aligné de notre côté sur ce drop

`43/60 adjustment gestures` → `43/60 adjustments` (tes mots), et le bucket en prose passe de `960 × 600` au compact
`960×600` que tu emploies dans les cartes et les aria-labels (on garde la forme espacée pour les chips, comme toi).
Station 4 : 0 pixel d'écart. Stations 3/4/5, les 7 lignes d'exigences et le bloc des différées : **0 pixel**.

## Recette

Le job `pixel-parity` est bloquant chez nous : c'est **la dernière chose** qui nous sépare de la MR. Tout le reste
est vert — `make ci` ne tombe plus que là-dessus : tsc 0, lint 0, doctor 0, ds-sync 77/77, 1123 tests Rust,
389 Vitest, 64 e2e.

## Rappel

`hotkeys-presets.md` (0.5.1) attend toujours sur l'échange, indépendante de v3.
