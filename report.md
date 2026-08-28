# Tatami app → Claude Design — VAGUE 0.6.10 (compilée par le coordinateur, 2026-08-28)

Quatre demandes issues de la campagne terrain 0.6.9 (2026-08-28). Le rapport de campagne a établi que les trois murs
levés par la 0.6.9 sont justes dans le modèle et qu'aucun n'est franchissable À L'ÉCRAN : les demandes ci-dessous
sont les surfaces qui manquent au joueur, chacune avec la donnée que l'app sert déjà.

- **A (#81)** est la plus lourde : au prélèvement d'une enseigne, le joueur doit pouvoir CHOISIR la carte (toutes
  les cartes du bucket, par enseigne) — l'app sert la liste, il manque le sélecteur. Contrat proposé dans le fichier.
- **B (#84)** est un pur défaut de rendu : l'action de chaque sonde est servie, elle n'est pas rendue dans la
  catégorie « pixels de référence ».
- **C (#85)** suit le modèle arrêté en commentaire de l'issue (3-max, index horaire depuis le héros).
- **D (#94)** décrit l'écran de la station 3 tel qu'il existe APRÈS le correctif #92 (livré dans la même release) :
  l'aperçu est la dernière capture, hot-loadée à chaque F9, plus d'incrustation « live ».

Ordre de lecture conseillé : A, puis B/C (station 4), puis D. Fichiers sources committés dans le repo app
(`doc/ds-report-rpv3-*.md`), un par sujet.

---

# Demande A — station 5, pipette : prélever une enseigne = choisir SA carte (issue #81 — lot C, MR !105)

Demande issue de la campagne terrain 0.6.9 (2026-08-28, branche `windows/validation-0.6.9`), suivie côté app par
l'issue **#81**. Elle vit dans son propre fichier d'échange : elle survit à l'itération courante et n'a pas à être
écrasée par le prochain `report.md`.

## Ce que le terrain a trouvé

Station 5, pipette v2. La palette des enseignes est bien proposée : quatre cibles « ♠ / ♥ / ♦ / ♣ », 0/3 relevés
chacune, et une ligne « PALETTE DES ENSEIGNES — ♠♥♦♣ · 0/4 ». **Aucune n'est prélevable.** Verdict de Romain :

> « lorsque je clique sur la carte pour prélever la couleur d'un pique, j'ai une carte de carreau (bleu) qui
> apparaît en plein écran, donc impossible de prélever la couleur d'un pique ici. Pareil pour toutes les
> couleurs. »

Les quatre cibles pointaient la **même capture** (`#20260816T095004326`) et le **même cadrage** (47 × 67 px) :
une seule carte offerte pour quatre enseignes. Trois cibles sur quatre étaient insatisfiables par construction,
et la quatrième ne l'était que par hasard.

## Le nœud, et pourquoi il n'est pas soluble côté app

C'est l'œuf et la poule. **L'app ne PEUT pas présenter « une carte de pique »** : savoir qu'une carte est un pique
demande la palette des enseignes, qui est précisément ce qu'on est en train de prélever. Le seul agent capable de
reconnaître un pique à ce stade, c'est le joueur qui regarde l'écran.

La sortie est donc la navigation : la cible dit ce qu'elle CHERCHE, le joueur dit OÙ c'est.

## Ce que l'app sert déjà (câblage prêt, drop 0.6.10)

Le container dérive et sert désormais **toutes les cartes prélevables du bucket** — chaque ROI de cartes que le
bucket place × chaque capture qui la montre (`requires` × attestations de la capture, la même dérivation que le
canvas et l'outil glyphes), captures les plus récentes d'abord. Chaque candidate porte :

```ts
interface SuitSurface {
    zoneId: string;   // la ROI de la carte — « board_1 », « hero_2 »…
    shotId: string;   // la capture qui la montre
    rank: Rect;       // sa sous-ROI de RANG ([cards].rank_sub_roi), en % de la fenêtre
}
```

`SuitSwatch` est renseigné en conséquence, par enseigne et indépendamment des trois autres :

- `zoneId` / `shotId` → la carte et la capture COURANTES de cette enseigne ;
- `targetRect` → **la sous-ROI de rang** de cette carte (voir le détail annexe plus bas) ;
- `target` → la phrase que la cible affiche, composée par l'app.

**Faute de markup, l'app expose la navigation sur le seul geste que le contrat DS offre aujourd'hui :
`onSelectProbe` sur une cible DÉJÀ sélectionnée avance d'une carte**, et la phrase `target` le dit
(« … · carte 3/12, re-cliquez la cible pour la suivante »). C'est fonctionnel, ce n'est pas découvrable.

## Attendu du DS

Un **sélecteur de carte dans la cible d'une enseigne** — visible sans être deviné :

- **Précédente / suivante** sur la carte candidate, avec un rang lisible (« carte 3 / 12 ») ;
- de préférence un **bandeau des candidates** (vignettes des ROI de cartes) plutôt que deux flèches aveugles :
  le joueur cherche une carte d'une enseigne donnée, il la reconnaît d'un coup d'œil et n'a pas à défiler une par
  une ;
- l'**état est par enseigne** : ♠ et ♥ ne cherchent pas la même carte, et celle qui porte un pique n'est celle
  d'aucune autre. Quatre curseurs indépendants, pas un curseur global ;
- **rien ne présume de l'enseigne d'une carte.** La cible annonce ce qu'elle cherche (« ♠ »), jamais que la carte
  cadrée en est une. Un libellé du genre « la carte de pique » serait faux tant que la palette n'existe pas ;
- **la navigation ne perd aucun relevé** : les trois relevés d'une enseigne peuvent venir de trois cartes
  différentes — c'est même souhaitable (trois pips, arbitrage 2026-08-22). Changer de carte ne vide rien.

### Contrat proposé

`SuitSwatch` gagne la liste et son curseur, et `RoomProfileCallbacks` le geste :

```ts
export interface SuitSwatch {
    // … existant …

    /** #81 — les cartes candidates du bucket, dans l'ordre servi par l'app. */
    cards?: { id: string; zoneId: string; shotId: string; shotLabel: string }[] | undefined;

    /** L'index de la carte courante DANS `cards` — propre à CETTE enseigne. */
    cardIndex?: number | undefined;
}

export interface RoomProfileCallbacks {
    // … existant …

    /** Le joueur vise une autre carte pour cette enseigne (#81) — l'app déplace le curseur, rien d'autre. */
    onSelectSuitCard?: (sizeId: string, suitId: string, index: number) => void;
}
```

L'app câble `onSelectSuitCard` le jour du drop et retire le repli « re-clic = carte suivante ».

## Détail annexe, déjà tranché côté app

Le bandeau annonçait « ce bucket n'a pas calibré la ROI propre du pip — la carte est le seul cadrage », et le zoom
s'ouvrait sur le **rang** : il fallait défiler pour atteindre le pip. Or, depuis #46, **l'enseigne se lit à la
couleur de l'encre du RANG** — le pip n'est même plus dans le crop des glyphes.

La cible assume donc ce qu'elle prélève : elle cadre la **sous-ROI de rang** (`[cards].rank_sub_roi`, la géométrie
que le runtime relit) via `targetRect`, et sa phrase dit « l'encre du rang de « board » sur <capture> ». La
bascule « Enseigne visée » est armée, et le mot `viewNoZoomSuit` (« la ROI propre du pip ») ne s'affiche plus.

**Reste au DS** : le mot de la bascule parle encore du *pip*. `viewSuit` (« Enseigne visée ») convient ; c'est
`viewNoZoomSuit` qui est désormais mort pour ce chemin, et `zoomDeclared` qui ne se conjugue qu'au bouton
(« la ROI propre du bouton n'est pas calibrée ici »). Si une enseigne doit un jour porter ce mot, il lui faut sa
conjugaison — sinon les deux peuvent partir.

## Ce qui n'est PAS demandé

- Aucune reconnaissance d'enseigne côté app ou DS : impossible avant la palette, et le prétendre serait le bug.
- Aucun changement du modèle de mesure : trois relevés par enseigne, la médiane est retenue, l'écriture de la
  palette reste atomique aux quatre couleurs.


---

# Demande B — station 4 : un pixel de référence se nomme par son ACTION (issue #84 — lot F, mergé)

Demande issue de la campagne de validation Windows 0.6.9 (session 2026-08-28, branche `windows/validation-0.6.9`),
station 4. Suivie côté app par l'issue **#84**. Fichier d'échange propre : il survit à l'itération courante.

Même rail que `doc/ds-report-rpv3-sondes-dans-le-rail-roi.md` (#63) : la catégorie « pixels de référence » qu'il
demandait **existe et fonctionne** — « le masquage des pixels de références est bon ». Ce qui suit ne remet rien
en cause de ce drop, il n'en corrige que les libellés.

## Ce que le terrain a vécu

Sur un bucket calibré, le rail de gauche affiche, dans cet ordre :

```
PIXELS DE RÉFÉRENCE
  Pixel neutre     SANS COULEUR
  2 boutons        SANS COULEUR
  2 boutons        SANS COULEUR
  check / bet      SANS COULEUR
  3 boutons        SANS COULEUR
  3 boutons        SANS COULEUR
  3 boutons        SANS COULEUR
```

Verdict de Romain : « leur label est "faux", ou en tout cas ne permet pas de les différencier dans la liste. Ils
indiquent tous "2 boutons" ou "3 boutons" quasiment. Il faut leur donner un label différenciant pour un humain. »

Deux lignes « 2 boutons » strictement identiques, trois lignes « 3 boutons » strictement identiques. Chaque ligne
porte un œil, un focus et une couleur — mais rien ne dit laquelle montrer, laquelle masquer, laquelle est celle
qu'on cherche. Sept pixels tous distincts, quatre libellés pour les nommer.

## Vérification faite côté app avant d'écrire : le défaut est au rendu

L'app **sert déjà** l'action de chaque pixel. Ce n'est pas une donnée à ajouter au contrat.

Les sept points du profil livré sortent de `calibPointsOf` (`apps/web/src/app/screens/roomProfileMapping.ts`)
exactement ainsi :

| `id` | `action` | `label` | `variant.label` | `kind` |
|---|---|---|---|---|
| `bet_blur` | — | `Pixel neutre` | — | `actuator` |
| `probe.two_buttons.fold` | `Fold` | `2 boutons` | Deux boutons (fold / call) | `probe` |
| `probe.two_buttons.call` | `Call` | `2 boutons` | Deux boutons (fold / call) | `probe` |
| `probe.two_buttons_check_bet.check` | `Check` | `check / bet` | Deux boutons (check / bet) | `probe` |
| `probe.three_buttons.fold` | `Fold` | `3 boutons` | Trois boutons (fold / call / raise) | `probe` |
| `probe.three_buttons.call` | `Call` | `3 boutons` | Trois boutons (fold / call / raise) | `probe` |
| `probe.three_buttons.raise` | `Raise` | `3 boutons` | Trois boutons (fold / call / raise) | `probe` |

La colonne `action` est renseignée depuis le drop 2026-08-19 et sa raison d'être est écrite dans le contrat DS
lui-même (`CalibPoint.action`, `RoomProfile.fixtures.ts`) :

> « the ACTION this pixel serves, app-supplied display label. The canvas rail **groups by it** instead of queueing
> sixteen flat chips, which is what makes a row's own label short enough to read in full. »

Le libellé court est donc **intentionnel** : il a été conçu comme le nom d'une ligne **à l'intérieur** d'un groupe
qui, lui, porte l'action. La demande #63 a ensuite créé une seconde liste de ces mêmes points — la catégorie
« pixels de référence » du rail ROI — et celle-ci les rend **à plat**, une ligne par point, `action` non lue. Le
libellé court se retrouve seul à porter l'identité, ce qu'il n'a jamais eu à faire.

Les deux rendus coexistent aujourd'hui dans l'écran :

- le rail de POSE du canvas (« N pixels à poser ») **groupe par action** — on y lit « Fold », puis « 2 boutons » /
  « 3 boutons » dessous ;
- la catégorie « PIXELS DE RÉFÉRENCE » du rail ROI **ne groupe pas** — d'où les doublons ci-dessus.

**Rien à câbler côté app.** La donnée est servie, sur le même objet, sur la même liste de points.

## Ce que Romain demande

Un libellé qui nomme **l'action ET sa déclinaison**, dans la langue de l'écran : « Fold · deux boutons »,
« Call · deux boutons », « Check · deux boutons (check/bet) », « Fold · trois boutons »…

Contrainte de vocabulaire attachée : **la station 6 nomme déjà ses manques de cette façon** (« il manque Fold,
Call, Raise »). Les deux écrans parlent des mêmes pixels ; ils doivent employer les mêmes mots. Un joueur qui lit
« il manque Fold » en station 6 doit pouvoir chercher « Fold » en station 4 et le trouver.

## Les deux sorties possibles, et notre lecture

**(a) Grouper la catégorie par action**, comme le rail de pose le fait déjà : sous-titres `Fold` / `Call` /
`Raise` / `Check`, et sous chacun les déclinaisons (« 2 boutons », « 3 boutons »). Le pixel neutre, qui n'a pas
d'action, tombe dans le groupe de repli du rail.

**(b) Composer le libellé de ligne** : `action · déclinaison` sur une seule ligne, la catégorie restant plate.

Notre lecture : **(b)**, et voici pourquoi malgré (a) qui semble plus cohérent avec le rail de pose.

La catégorie du rail ROI est une **liste de calques à éteindre**, pas une file de gestes à accomplir. Elle vit à
côté des catégories de ROI (SHARED, HERO, VILLAIN…) qui sont plates, et elle porte un œil de groupe qui commande
tout le bloc. Y insérer un second niveau de groupes crée deux œils de groupe emboîtés (celui de la catégorie,
celui de l'action) — donc un troisième régime de visibilité à définir alors que #63 vient d'en installer un.
Sept lignes ne justifient pas ça. La ligne composée règle le défaut sans toucher à la mécanique d'œil.

Si le design préfère (a), il faut alors répondre explicitement à : l'œil du sous-groupe existe-t-il, et que fait
l'œil de la catégorie sur un sous-groupe éteint ?

## Ce que l'app sert déjà, et qui suffit dans les deux cas

Sur chaque `CalibPoint` de la catégorie :

- `action` — `"Fold"`, `"Call"`, `"Raise"`, `"Check"` ; **absent** sur le pixel neutre (`bet_blur`) et sur toute
  sonde non scopée, qui n'ont pas de déclinaison à distinguer ;
- `label` — la déclinaison seule (`"2 boutons"`, `"check / bet"`), ou le nom complet du point quand il n'a pas
  d'action (`"Pixel neutre"`, `"Fold"` pour une sonde plate `probe.fold`) ;
- `variant` — `{ id, label }` avec le libellé LONG de la déclinaison (« Deux boutons (check / bet) »), utile en
  `title`/tooltip si la ligne composée doit rester courte ;
- `color`, `at`, `hint`, `test` — inchangés.

Une règle de repli à respecter, elle est déjà celle du rail de pose : **`action` peut être absent**. Le libellé
doit alors être `label` seul, jamais « undefined · 2 boutons » ni une action fabriquée.

## Critère de clôture

À l'ouverture de la station 4 sur le profil livré, les sept lignes de « PIXELS DE RÉFÉRENCE » portent **sept
libellés deux à deux différents**, chacun nommant une action reconnaissable dans le vocabulaire de la station 6.
Aucune ligne ne se lit « 2 boutons » ou « 3 boutons » toute seule. Le pixel neutre reste « Pixel neutre » — il
n'a pas d'action, et on ne lui en invente pas.


---

# Demande C — station 4 : nommer les vilains par index horaire depuis le héros (issue #85 — lot F, modèle en commentaire d'issue)

Demande issue de la campagne de validation Windows 0.6.9 (session 2026-08-28, branche `windows/validation-0.6.9`),
station 4. Suivie côté app par l'issue **#85**, dont le modèle est arrêté en commentaire avant cette demande.
Fichier d'échange propre : il survit à l'itération courante.

Périmètre **3-max (Spin)** — méthode arrêtée avec Romain en fin de campagne : la passe de vérification finale de
la 0.6.x se fera sur un jeu de captures complet en Spin 3-max. Les autres tailles de table ne sont pas au
programme de ce drop.

## Ce que le terrain a vécu

Le rail « VILLAIN » de la station 4 offre quatre zones, aux noms positionnels :

```
VILLAIN
  Vilain haut-gauche (pseudo)
  Vilain haut-droit (pseudo)
  Vilain milieu-gauche (pseudo)
  Vilain haut-gauche (slot large)
```

Verdict de Romain, sur une capture de table **6-max** : « j'ai 4 ROI pour 5 joueurs (je suis en 6-max sur la
capture) et une ROI "slot large" dont je ne sais pas à quoi elle correspond ».

Convention demandée :

> « Pour différencier les positions, on peut plutôt définir une convention avec héros à l'index 0 et un incrément
> de 1 dans le sens horaire de la table pour les positions des vilains. Donc ici Vilain 1, Vilain 2, …, Vilain 5. »

## Ce que la lecture du code a établi, et qui change la demande

**Le compte n'est pas « 4 pour 5 » : c'est « 3 sièges + 1 fuite ».**

`villain_top_left_big` n'est pas un quatrième siège. C'est la **même ancre** que `villain_top_left`, calibrée pour
une géométrie de slot différente — elle porte `set = "big"` au profil (jeu de régions nommé, adaptation d'aspect).
Elle apparaît dans le rail parce que le catalogue servi à l'écran **aplatit tous les jeux de régions** : le DTO de
zone ne porte aucun champ `set`. Une ROI d'un jeu qu'on ne calibre pas se retrouve offerte à la calibration, sans
rien qui la distingue — d'où « je ne sais pas à quoi elle correspond ».

**Et le nombre de joueurs est déjà servi, mais lu par personne.** `[room].players` est déclaré au profil (le
profil livré dit `players = 3`), validé côté moteur (borne `[2, 10]`, défaut 3 « le format spin historique ») et
transporté jusqu'à l'écran dans la charge de calibration. Aucun consommateur côté app. Le nombre de ROI de siège
n'est dérivé de rien : il est la liste des régions `villain_*` que le TOML se trouve déclarer.

C'est le motif de fond de la campagne (#93) : le contrat existe, la couche du dessus ne le lit pas.

## Ce que Romain demande

1. **Le compte** : autant de ROI de pseudo vilain que d'adversaires, soit `players − 1`. En 3-max, **deux**.
2. **La désignation** : `Vilain 1` … `Vilain N`, index relatif au héros (héros = 0), incrément dans le sens
   horaire de la table — celui dans lequel tourne le bouton. `Vilain 1` est le voisin immédiat du héros dans ce
   sens.
3. **Plus de nom positionnel à l'écran** : ni « haut-gauche », ni « haut-droit », ni « milieu-gauche », ni « slot
   large ». Un placement à l'écran dépend du nombre de joueurs, de la disposition de la table et de la taille de
   fenêtre ; il ne peut pas servir d'identité.

## Pourquoi la désignation positionnelle est un défaut de fond, pas un défaut de mot

Le rail est l'endroit où le joueur associe **une boîte sur sa capture** à **un adversaire de la partie**. Un nom
positionnel décrit la boîte ; il ne dit rien de l'adversaire. Sur une autre table du même profil — même room,
même taille de fenêtre, autre disposition — « haut-gauche » désigne un autre joueur, et le rail n'a aucun moyen
de le signaler.

L'index horaire depuis le héros est la seule ancre qui ne dépende ni du rendu, ni du nombre de joueurs, ni de la
fenêtre. C'est d'ailleurs déjà celle du moteur : une position de table y est un décalage depuis le héros, pas un
coin d'écran. Le rail est le dernier endroit du produit à parler en coins d'écran.

Note : le prototype DS **parle déjà cette langue** — les sièges y sont `v1` / `v2`, libellés « Villain 1 » /
« Villain 2 ». C'est l'app qui sert des noms positionnels, parce que le profil livré en déclare. Le drop demandé
est donc moins une refonte qu'un alignement, plus les deux points d'écran ci-dessous.

## Les deux points qui demandent une décision d'écran

**1. Un groupe par siège, ou un groupe « VILLAIN » à N lignes ?**

Le prototype pose aujourd'hui un **groupe par siège** (« Villain 1 », « Villain 2 »), ce qui suppose que chaque
siège porte plusieurs ROI (pseudo, tapis, cartes…). Le profil terrain n'en a **qu'une par siège** — le pseudo — et
#89 (ROI de tapis du héros) montre que les autres arriveront par le héros d'abord.

Notre lecture : **un seul groupe `VILLAIN`, une ligne par siège** tant qu'un siège n'a qu'une ROI, et le passage
au groupe-par-siège le jour où il en a deux. Un groupe d'une ligne est un titre pour rien, répété N fois.
Le regroupement dérivé côté app appuie cette lecture : le groupe d'affichage est le préfixe de l'id, donc
`villain_1` et `villain_2` tombent dans le même groupe `villain` **sans rien changer au dérivateur**.

**2. Que fait l'écran quand le profil déclare un compte et livre un autre ?**

C'est exactement l'état du profil livré aujourd'hui : `players = 3` (donc deux vilains attendus) et trois régions
`villain_*` déclarées, plus une du jeu `big`. Dès que le rail dérive son compte de `players`, l'écart devient
visible — et il faut savoir quoi en faire.

Notre lecture : le rail montre **`players − 1` lignes**, et une région `villain_*` déclarée au-delà du compte est
rendue comme un **surplus nommé** (elle existe au TOML, donc elle ne disparaît pas — l'invariant d'honnêteté du
rail : on ne fait pas disparaître une géométrie posée), sous un intitulé qui dit ce qu'elle est. Jamais un
silence : une ROI qu'on ne comprend pas est le défaut qu'on corrige.

Côté app, la ROI `_big` ne devrait pas atteindre l'écran du tout — voir « ce qui reste à faire côté app ».

## Ce que l'app sert déjà, et ce qui reste à faire côté app

**Déjà servi, sans nouveau contrat :**

- `players` — le nombre de joueurs de la room, dans la charge de calibration. Il suffit de le lire.
- Le libellé d'affichage de chaque zone, tel que le profil le déclare (`Zone.label`) : le renommage des sièges
  est un changement de profil, pas de contrat.
- Le groupe d'affichage, dérivé du préfixe d'id — `villain_1` → groupe `villain`, comme aujourd'hui.

**Reste à faire côté app, hors de ce drop (issue #85, arbitrage de Romain en attente) :**

- renommer les régions du profil en `villain_1` / `villain_2` avec leurs libellés ;
- cesser de servir au catalogue les régions d'un jeu de régions non actif, pour que `_big` sorte de l'écran ;
- lire `players` pour en dériver le compte attendu.

Ces trois points ne sont pas des prérequis à la maquette : ils changent ce que l'app **envoie**, pas ce que
l'écran **rend**. La maquette peut être faite contre deux sièges nommés « Vilain 1 » / « Vilain 2 ».

## Critère de clôture

Sur un profil 3-max, la station 4 offre **exactement deux** ROI de pseudo vilain, nommées « Vilain 1 » et
« Vilain 2 », et **aucune** ROI dont le joueur ne puisse dire à quel adversaire elle correspond. Aucun libellé de
siège ne mentionne une position à l'écran. Le jour où un profil déclare `players = 6`, le rail en offre cinq sans
qu'une ligne de vocabulaire ait à changer.


---

# Demande D — station 3 : l'aperçu montre une capture, jamais un « live » (issue #94 — lot F ; décrit l'écran APRÈS #92)

Demande issue de la campagne de validation Windows 0.6.9 (session 2026-08-28, branche `windows/validation-0.6.9`),
station 3. Suivie côté app par l'issue **#94**. Fichier d'échange propre : il survit à l'itération courante.

**À lire APRÈS #92**, qui est corrigé en parallèle dans la même release : #92 rend visible ce que le backend
produit déjà (les captures prises, ce que l'engine voit) ; cette demande-ci change le **modèle d'affichage** de
l'aperçu. Tout ce qui suit décrit l'écran **une fois #92 livré** — sans quoi la demande décrirait un écran qui
n'existe plus au moment du drop.

## Ce que le terrain a vécu

Le sélecteur de captures propose une entrée « **— live —** », **sélectionnée par défaut**, qui n'affiche **rien** —
table ouverte, détectée, `glow_spec` émis en continu, deux PNG de 453 ko réellement écrits sur le disque. La zone
d'aperçu porte à la place : « Pas de flux live avant calibration — capturez au F9 avec la vraie table visible. »

Verdict de Romain : « Ce n'est pas normal qu'une capture avec l'option "live" n'affiche rien alors qu'une table
tourne. »

L'explication technique est correcte et documentée : **l'engine n'émet aucune frame pendant la calibration**, et
le message a déjà été corrigé une fois en 0.6.4 (écart 6/C5) — il a remplacé « la promesse mensongère d'une frame
à venir ». Mais le correctif s'est arrêté au texte. **L'option « live » est restée dans le sélecteur**, elle en est
restée la valeur par défaut, et elle ne peut, par construction, rien montrer.

On explique au joueur pourquoi le mode qu'on lui propose ne marche pas, au lieu de ne pas le lui proposer.

## La décision de Romain

Deux sorties étaient possibles, il tranche :

> « Soit on supprime ce mode live de rendu et on attend une capture pour l'afficher, soit on diffuse le flux live
> dans la capture et on laisse les captures se faire au fil de l'eau lorsque le joueur les demande. Je pense
> plutôt pour l'option 1 qui paraît plus simple. »

**Option 1 retenue.** Plus de mode live dans le rendu de la station 3.

Et l'exigence qui va avec :

> « Note qu'il faudra qu'à chaque capture celle-ci s'affiche dans la preview, donc soit hot-loadée. »

## L'écran demandé

1. **La zone d'aperçu montre une capture, et rien d'autre.** Celle choisie au sélecteur ; à défaut, la dernière
   prise.
2. **Le sélecteur n'offre plus « — live — »**, ni comme entrée, ni comme valeur par défaut. Sa valeur par défaut
   est une capture réelle du bucket.
3. **F9 hot-load.** Une capture prise devient **immédiatement** l'aperçu affiché, sans geste ni navigation. C'est
   la contrepartie de la suppression du mode live : si l'aperçu ne montre plus qu'une capture, la boucle « F9 → je
   vois ce que je viens de prendre » doit être instantanée.
4. **L'incrustation « live » disparaît elle aussi.** L'aperçu porte aujourd'hui, quand une capture est chargée, une
   vignette en incrustation légendée « live · … ». Elle est alimentée par la même source vide et ne montre donc
   rien non plus. Un mode qu'on retire se retire partout.
5. **Le bouton « Repasser au live » disparaît.** Il n'a plus de destination.

## L'état vide, qui est le vrai sujet de conception

Tant qu'aucune capture n'existe, la zone d'aperçu **n'a rien à montrer et c'est normal** — c'est l'état d'entrée
de toute première calibration. Le message actuel garde son sens **à cet endroit**, mais change de rôle : d'excuse
d'un mode défaillant, il devient l'**état vide d'un aperçu** et la consigne du geste suivant.

À reformuler, pas à supprimer. Le mot « live » n'a plus rien à y faire : il nommait le mode qu'on retire. Ce que
l'état vide doit dire, c'est « aucune capture pour l'instant — ouvrez la table et appuyez sur F9 », avec le
raccourci rendu comme un raccourci (la touche F9 est déjà rendue en `Kbd` sur le bouton de capture de la même
colonne — l'état vide doit renvoyer au même geste, avec le même signe).

Deux états vides distincts à ne pas confondre, et c'est le point d'arbitrage :

- **aucune capture dans le bucket** — le cas ci-dessus, l'invitation à capturer ;
- **une capture sélectionnée dont l'image n'est pas servie** — cas déjà rendu (« pas d'image pour cette
  capture »), qui reste ce qu'il est : une anomalie, pas une invitation.

Les deux se ressemblent à l'écran aujourd'hui parce que l'un des deux était masqué par le mode live. Une fois le
live retiré, ils deviennent les deux seuls états non nominaux de la zone, et ils doivent se distinguer d'un coup
d'œil : le premier appelle un geste, le second signale un défaut.

## Ce que ça change pour le reste de la station, et qui ne bouge pas

La colonne d'exhaustivité (variantes × captures) et les coches ne changent pas : elles travaillaient déjà sur « la
capture chargée », jamais sur le live — le message « Chargez ou prenez une capture pour cocher ce qu'elle montre »
le dit déjà. Ce qui change, c'est que **« la capture chargée » cesse d'être un état optionnel** : après la
première capture du bucket, il y en a toujours une.

Le champ « L'engine voit : … » reste. Il n'est pas un rendu du live : c'est le prélabel — ce qu'une capture
attesterait si on la prenait maintenant. C'est précisément l'information qui remplace utilement un flux d'images,
et #92 lui rend son contenu.

Le sélecteur reste ce qu'il est à cette station (une liste, pas le rail à miniatures demandé pour la station 4
dans `doc/ds-report-rpv3-selecteur-captures-miniatures.md`) — hors périmètre ici, on ne change que ce qu'il
propose.

## Ce que l'app sert déjà

Rien à ajouter au contrat côté données :

- la liste des captures du bucket avec, pour chacune, son id, son libellé, son horodatage et l'URL de son image ;
- la capture sélectionnée, et le geste de sélection ;
- le geste de capture F9 et le prélabel de ce que l'engine attesterait.

Ce qui disparaît côté contrat, c'est l'**entrée vide** du sélecteur (la valeur « aucune capture sélectionnée =
live ») et le geste « repasser au live ». Le champ de frame live du modèle reste servi mais n'est plus rendu ;
l'app cessera de l'alimenter le jour où il n'a plus aucun consommateur.

**Le hot-load est câblé côté app** (issue #92, même release) : après une capture, l'écran reçoit la liste à jour
et la nouvelle capture comme sélection courante. Le DS n'a pas de logique de rafraîchissement à porter — il rend
la capture sélectionnée qu'on lui donne.

## Critère de clôture

Sur un profil vierge, table ouverte : la station 3 montre un aperçu vide **qui invite à capturer**, et le
sélecteur ne propose aucune entrée « live ». Un appui sur F9 fait apparaître la capture prise dans l'aperçu
**sans aucun autre geste**. Un second F9 la remplace par la nouvelle. Le mot « live » n'apparaît plus nulle part
dans la zone d'aperçu ni dans le sélecteur.


---

