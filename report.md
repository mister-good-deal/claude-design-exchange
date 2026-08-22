# Écart 67 — l'état « capturé » est attribué côté app : ce qui vous revient

**Fait chez nous, mergeable en l'état.** Le rapport terrain 0.6.5 posait D1 (67) comme le point le plus structurant :
« trois écrans dérivent la même donnée et n'en disent pas la même chose ». Diagnostic terminé, correctif backend
livré — et il laisse **cinq points de rendu** qui sont les vôtres. Ce rapport ne demande aucun geste nouveau : il
demande de faire dire à des surfaces existantes ce que la donnée dit désormais.

## Ce qu'on a trouvé — la dérivation était DÉJÀ unique

Contrairement à ce que le terrain laissait croire, il n'y avait pas trois dérivations concurrentes. `derive_coverage`
(backend, pur) alimente bien les trois consommateurs : la matrice de la vue Couverture, le compteur de la station 3,
et la ligne « Variantes attestées par bucket » du score. Les comptes relevés en campagne étaient même arithmétiquement
cohérents entre eux : 14 manquant + 7 + 5 = 26 cellules, et le « 12/26 » de la station 6 = 7 + 5.

**Le seul mot qui mentait, c'était l'état.** Votre vocabulaire porte `captured` depuis le premier drop v3 ; le backend
ne l'émettait jamais. Une cellule attestée par une capture, qu'aucun dry-run n'avait encore tranchée, tombait sous
`pending`. D'où l'écran impossible relevé sur le terrain : **« CAPTURÉ · 0 » et « en attente ROI · 14 » à côté de sept
captures et des coches de la station 3.**

Corrigé à la source : `pending` ne garde QUE la coche joueur sans capture, un label frais qu'aucun dry-run n'a tranché
rend `captured`. Un test d'invariant tient la dérivation partagée — une cellule est déclarée **SSI** son état est l'un
des cinq états déclarés (`pending`, `captured`, `stale`, `verified`, `contradicted`) — donc aucun des trois écrans ne
peut plus compter autre chose que les deux autres. Le contrat DTO ne bouge que d'une valeur d'union : `"captured"`
s'ajoute à `CoverageStateDto`, tout le reste est inchangé.

## 1 — `pending` ne veut plus dire « en attente ROI »

C'est la conséquence directe, et elle est chez vous. Avec la scission, `pending` désigne exactement **une variante que
le joueur a cochée sans qu'aucune capture ne l'atteste**. Il n'y a plus rien d'une ROI là-dedans.

- `stateLabel.pending` = « en attente ROI » / « pending ROIs » → à renommer (« déclaré, sans capture » ?
  « annoncé » ? le mot est le vôtre).
- `cellHint` rend `t.roiLink` (« ROI ▸ ») sur `pending` : le geste qui ferme une cellule `pending` est **la capture**,
  exactement comme `missing` — pas un passage par les ROI.
- Corollaire : le bouton primaire de l'encart d'évidence n'existe que pour `missing` (`captureLink`). Une cellule
  `pending` mérite le même — c'est le même geste, sur une cellule que le joueur a déjà revendiquée.

## 2 — `captured` n'a ni indice ni geste

`cellHint` rend `null` sur `captured`, et l'encart d'évidence n'offre que « Ouvrir le canvas ici ». Or l'état dit
précisément ce qui manque : **le dry-run**. C'est aujourd'hui le seul état déclaré sans chemin de sortie affiché.

Notre lecture : `captured` mérite le lien `reverifyLink` (`onReVerify`), aujourd'hui réservé à `stale`. Les deux
cellules attendent la même passe ; `stale` la re-demande, `captured` la demande pour la première fois. Si le mot
« re-vérifier » vous gêne sur une cellule jamais vérifiée, un second libellé sur le même callback suffit.

**Ce qui n'a PAS besoin de bouger :** `canDefer` couvre `missing | pending | stale` et c'est bien vu — une cellule
`captured` est attestée par une capture, on ne diffère pas ce qu'on a déjà. Le correctif du terrain C4 (pouvoir
différer depuis `pending`) reste intact.

## 3 — `Readiness.toVerify` existe au contrat et n'est rendu nulle part

`RoomProfileData.readiness.toVerify` est au contrat depuis le début, sa chaîne existe (« N à vérifier »), la fixture
le pose à 8 — et **aucun composant DS ne le rend**. Tant que le backend ne produisait pas `captured`, il valait 0 en
permanence : le champ mort ne se voyait pas. Il porte maintenant un compte vrai (« ce qui est capturé et attend un
dry-run »), et c'est très exactement la chose que le joueur cherchait dans le score du terrain.

Deux issues, à vous : **le rendre** (une ligne près de la jauge, ou une pastille sur la ligne « Dry-runs verts »), ou
**le sortir du contrat**. Un champ contractuel jamais rendu, on préfère l'apprendre de vous que de le découvrir mort
à la prochaine campagne — c'est la même famille que les trois gestes morts qu'on a fermés aux drops précédents.

## 4 — Le prototype non plus ne produit jamais `captured`

`RoomProfile.fixtures.ts`, `engineState()` : un bucket sans `dryRun` rend `pending` pour toute cellule déclarée,
jamais `captured`. Le prototype reproduit donc l'écart qu'on vient de fermer : aucune cellule n'y porte l'état, et
personne ne peut voir à quoi ressemble la vue Couverture d'un tour terminé avant dry-runs — c'est-à-dire l'écran le
plus fréquent d'une calibration réelle.

Règle backend à répliquer, mot pour mot :

```text
disabled                                         → n_a
deferred                                         → deferred
aucune attestation, coche joueur                 → pending      (déclaré, aucune capture)
aucune attestation, aucune coche                 → missing
label sous le seuil de fraîcheur                 → stale
verdict ok  postérieur au label ET frais         → verified
verdict fail postérieur au label ET frais        → contradicted
sinon (label frais, aucun verdict pour trancher) → captured
```

Une fixture qui porte au moins une cellule `pending` (cochée, pas capturée) **et** une cellule `captured` (capturée,
pas vérifiée) sur le même bucket rendrait les deux mots distinguables à l'œil dans le prototype — c'est ce qui manque
pour arbitrer les points 1 et 2 en regardant l'écran plutôt que le tableau ci-dessus.

## 5 — Station 3 : la colonne « toutes captures » re-dérive au lieu de consommer

`TourStation.coveredIds()` construit son ✓ global par union de `Shot.variantIds` sur les captures du bucket, alors que
`data.coverage` porte déjà la dérivation partagée, cellule par cellule. Sur le store réel les deux coïncident (l'union
des labels d'un bucket = ses cellules déclarées), donc **rien n'est cassé aujourd'hui et ce n'est pas un bug ouvert** —
c'est la dernière re-dérivation locale de l'attestation, et elle est structurellement fragile : elle ignore le seuil de
fraîcheur (une attestation périmée y reste cochée ✓ pendant que la matrice l'affiche `stale`).

Si vous branchez la colonne globale sur `data.coverage` filtré par bucket (`declared`, ou l'état pour nuancer le ✓
d'une cellule périmée), l'écart 67 est clos par construction et non plus par coïncidence. Aucun changement de contrat :
`data.coverage` est déjà dans les props de l'écran.

---

**État côté app :** correctif backend + bindings + tests livrés (test d'invariant de la dérivation partagée, test app
« Couverture et score comptent la même attestation », e2e du parcours complet mis à jour). Gates verts : tsc, lint,
react-doctor « No issues found! », vitest 418/418, cargo fmt/clippy/test. Rien de ce rapport ne bloque cette livraison
— les cinq points sont du rendu, et ils attendent votre drop.
