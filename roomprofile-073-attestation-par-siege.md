# Demande durable — 0.7.3 : station 3, n'attester que l'écart au cas normal, et grouper par siège

Vague Claude Design de la **0.7.3** — les retours de la campagne Windows 0.7.1 (issue #220, méta #34). Cette demande
est celle de l'issue **#216**, la plus lourde de la vague : elle refond la saisie des attestations de la station 3.
Rien n'est contourné côté app : `apps/web/src/ui/` reste au rail Claude Design.

## 1. Ce que le joueur voit

Onze déclinaisons à cocher par capture, sur deux buckets, pendant toute une campagne. Romain, après les avoir
posées :

> « Pas besoin de mettre les choix antagonistes, je refondrais ça en mettant le choix le plus naturel induit. Par
> exemple ne laisser que "Héros couché (cartes absentes)" et si ce n'est pas le cas alors "Cartes héros
> distribuées" est implicite. Pareil pour "Timer" laisser seulement "Timer visible" car il est 95 % du temps absent
> et je dois le cocher à chaque capture c'est relou. »

Et sur les sièges :

> « "villain_1_seat" et "villain_2_seat" peuvent être remontés et même renommés en simplement "Vilain 1" et
> "Vilain 2" avec des sous-catégories et en première "éliminé" cochable et si coché alors ça disable le reste des
> sous-propriétés. En 2ème sous-propriété "cartes foldées" devrait suffire. »

Aujourd'hui `TourStation.tsx` rend une ligne par déclinaison du catalogue (`data.variants`), à plat, groupée par
`VariantDef.group`, avec une case éditable (« sur cette capture ») et une pastille dérivée (« toutes captures »).
Les deux faces d'une même famille — « Cartes héros distribuées » et « Héros couché » — y sont deux lignes
indépendantes, ce qui rend saisissable la contradiction (les deux cochées) autant que le silence (aucune des deux).

## 2. Les trois règles fermes

**(a) Une case = l'écart au cas normal.** Une famille binaire (deux déclinaisons dont l'une est le cas ordinaire)
n'offre plus qu'UNE case, celle de l'écart : « Héros couché (cartes absentes) », « Timer visible ». Le cas normal
n'a plus de case.

**(b) Non coché = ATTESTÉ à l'état normal, jamais « pas d'information ».** C'est le point technique à ne pas
manquer. La dérivation des empreintes de présence est en **leave-one-out** : chaque état a besoin de deux captures
de référence, **des deux côtés**, faute de quoi la zone n'a plus de voisin négatif et s'abstient à jamais (c'est le
`d_absent=None` du dry-run du 05/09). Une case non cochée doit donc écrire l'attestation ordinaire dans le store,
pas ne rien écrire. C'est un gain, pas une concession : aujourd'hui une case oubliée laisse la capture muette,
demain elle atteste le cas normal.

**(c) `absent_zones` reste le SEUL moyen de dire « je ne sais pas ».** Une zone masquée par un popup, hors du
cadre, non rendue : la famille se déclare **non visible sur cette capture** et n'atteste alors ni l'écart ni le
normal. Le store a déjà ce canal (`ShotMeta.absent_zones`, contrat DS `Shot.absentZoneIds`), et le moteur
l'honore : `attested_state` rend `None` dès que la zone d'attestation figure dans `absent_zones`, donc la capture
ne pèse d'aucun côté. La clé rangée dans `absentZoneIds` est **exactement l'id de famille** (`timer`,
`villain_1_cards`, `dealer`) — c'est déjà ce que le backend compare, rien à traduire.

## 3. Ce qu'on demande à Claude Design

### 3.1 Deux formes de famille, servies par la donnée

Le catalogue n'est pas homogène et l'écran ne doit pas prétendre le contraire :

- **famille « écart » (`deviation`)** — deux déclinaisons, l'une ordinaire : **une case à cocher**, libellée par la
  déclinaison d'écart, telle que l'app la sert. Cochée ⇒ l'écart est attesté ; décochée ⇒ le normal est attesté.
- **famille « choix » (`choice`)** — trois déclinaisons ou plus, mutuellement exclusives, dont aucune n'est le cas
  ordinaire : **un choix exclusif** (radiogroup, le motif que `DisplayUnitField` et la grille d'ancrage du
  LayoutDesigner livrent déjà vert). Aucune valeur par défaut : tant qu'aucune n'est choisie, la famille n'atteste
  rien, et l'écran le dit d'un mot au lieu de laisser croire à un normal implicite.

Le badge dealer reste une famille « choix » **au niveau de la table**, pas trois cases par siège : exactement un
siège porte le bouton, et trois cases indépendantes rendraient saisissable « deux boutons à la fois ».

### 3.2 Une entrée par siège, « éliminé » en premier, et ce qu'elle verrouille

Les familles se rangent en **entrées** (`VariantDef.group`, déjà servi) : « Vilain 1 » et « Vilain 2 » deviennent
des entrées, avec leurs familles dessous, **« Éliminé » en premier**. Une entrée est un titre et un bloc, pas un
groupe de plus dans une liste plate.

Cochée, « Éliminé » **implique** « Cartes couchées » du même siège : un siège vide n'a ni cartes ni mise. La
famille impliquée se rend alors **cochée ET verrouillée**, avec la phrase qui dit pourquoi — jamais grisée sans
motif, jamais vidée. Ce n'est pas « on ne sait plus » : c'est une attestation de plus, et une vraie (la ROI montre
du feutre, ce qui est exactement la référence « absent » dont la dérivation a besoin).

La relation est **une donnée**, pas une règle codée dans l'écran : `VariantDef.implies` porte les ids qu'une
déclinaison entraîne. C'est la seule relation croisée de cette vague ; aucune autre n'est introduite (le badge
dealer d'un siège déclaré éliminé, par exemple, reste saisissable — le dry-run est là pour ça).

### 3.3 Ce que la colonne de droite montre

La station garde ses deux colonnes, mais la droite change de grain : une famille « écart » y montre **ses deux
faces** (normal · écart), chacune ✓ dès qu'une capture du bucket l'atteste. C'est précisément ce que la dérivation
leave-one-out exige, et le joueur voit d'un coup d'œil laquelle des deux lui manque — aujourd'hui il ne le
découvre qu'au dry-run, en abstentions. Une famille « choix » garde une pastille par valeur.

Le compteur de tête (`tourCounters`) ne change pas de définition : il compte des DÉCLINAISONS couvertes sur le
catalogue actif, exactement comme aujourd'hui. Il se remplira simplement beaucoup plus vite, puisque chaque capture
atteste désormais tous ses cas normaux.

### 3.4 Le geste « non visible ici »

Chaque famille porte une bascule discrète **« Non visible ici »**, qui voyage sur les rappels déjà au contrat
(`onMarkZoneAbsent(sizeId, familyId, shotId)` / `onMarkZonePresent(…)`, tous deux déjà dans `RoomProfileWiring`).
Une famille déclarée non visible : sa case (ou son choix) est désactivée, elle n'entre pas dans l'émission, et la
ligne le dit. C'est le seul état « sans information » de l'écran.

### 3.5 Comment une case devient une attestation

L'émission ne change pas de canal : `onCorrectLabels(sizeId, shotId, variantIds)` porte **l'ensemble COMPLET** des
déclinaisons de la capture, et l'app le réécrit d'un bloc (`label_shot` → `ShotStore::set_labels`, qui remplace
l'intégralité des attestations de la prise). Ce que l'écran compose, famille par famille :

| Famille | Saisie | `variantIds` émis |
|---|---|---|
| écart, case décochée | rien | l'id **normal** (`timer/absent`, `hero_cards/dealt`, `villain_1_cards/present`) |
| écart, case cochée | la case | l'id **d'écart** (`timer/visible`, `hero_cards/folded`, `villain_1_seat/empty`) |
| écart, impliquée par une case cochée | verrouillée | l'id d'écart impliqué (`villain_1_cards/absent`) |
| écart ou choix, « non visible ici » | bascule | **rien** — `absentZoneIds` porte l'id de famille |
| choix, une valeur retenue | le radio | l'id retenu (`board/b4`, `dealer/villain_1`, `actions/three_buttons`) |
| choix, aucune valeur retenue | rien | **rien** — et la ligne le dit |

Côté store, chaque id aplati `zone/variant` redevient la paire `attest(zone, variant)` que le backend écrit
(`variantIdOf` / `splitVariantId` côté app, `ShotLabel { zone, variant, confirmed_at }` côté Rust). Rien de ce
mécanisme ne change : seule change la façon dont l'écran COMPOSE la liste.

## 4. Contrat de données

Types touchés : `apps/web/src/ui/screens/RoomProfile.fixtures.ts` (`VariantDef`, `RoomProfileCallbacks`) et
`apps/web/src/ui/screens/contract.ts` (`RoomProfileWiring`).

```ts
/** La forme de saisie d'une famille : une case (l'écart au normal), ou un choix exclusif sans normal. */
export type VariantFamilyShape = "deviation" | "choice";

export interface VariantDef {
    id: string;                  // inchangé : l'aplat `zone/variant`
    group: string;               // inchangé, mais il porte désormais l'ENTRÉE (« Vilain 1 », « Héros », « Table »)
    label: string;               // inchangé, servi verbatim
    source: "kind" | "room";     // inchangé
    state: VariantState;         // inchangé
    reason?: string | undefined; // inchangé
    at?: string | undefined;     // inchangé

    /**
     * AJOUTÉ — la zone d'attestation dont cette déclinaison est une valeur : c'est ELLE la famille, et ses valeurs
     * sont exclusives entre elles. Déjà porté par le backend (`VariantDto.zone`), aujourd'hui perdu au mapping.
     * C'est aussi la clé que `absentZoneIds` reçoit quand la famille est déclarée non visible.
     */
    zone: string;

    /**
     * AJOUTÉ — la forme de saisie de la famille, servie et jamais devinée : deux déclinaisons dont l'une est
     * ordinaire donnent `deviation`, tout le reste donne `choice`. Toutes les déclinaisons d'une même `zone`
     * portent la MÊME valeur ; un écran qui la dériverait du nombre de membres se tromperait le jour où le
     * catalogue gagne une troisième face.
     */
    family: VariantFamilyShape;

    /**
     * AJOUTÉ — cette déclinaison est le CAS ORDINAIRE de sa famille : elle est attestée dès que la case d'écart
     * n'est pas cochée. Exactement une déclinaison par famille `deviation` la porte ; aucune sur une famille
     * `choice`. Absent = false.
     */
    normal?: boolean | undefined;

    /**
     * AJOUTÉ — les déclinaisons que celle-ci ENTRAÎNE quand elle est attestée (`villain_1_seat/empty` implique
     * `villain_1_cards/absent`). Leur famille se rend cochée et VERROUILLÉE, avec le motif : un siège vide n'a ni
     * cartes ni mise, et la contradiction ne doit pas être saisissable. Absent ou vide = rien à verrouiller.
     */
    implies?: readonly string[] | undefined;
}
```

Retiré du contrat : **rien**. `VariantDef.group` change de sens (l'entrée, plus la zone) mais pas de type — la
valeur est servie par l'app, qui décide déjà du groupe d'affichage (`groupOfZone` dans
`apps/web/src/app/screens/roomProfileMapping.ts`).

Rappels : **aucun ajout, aucun retrait.** `onCorrectLabels`, `onMarkZoneAbsent`, `onMarkZonePresent`,
`onSelectShot`, `onDeclareVariant` sont déjà au contrat et déjà dans `RoomProfileWiring` ; ce sont ceux-là que la
nouvelle saisie emprunte.

Ne changent pas : `Shot` (`variantIds`, `absentZoneIds`), `CoverageCell`, `TourState`, `SizeBucket`, la matrice de
couverture et la station 4.

### Ce que l'app servira (pour information, hors périmètre DS)

`VariantDto` gagne `family`, `normal` et `implies`, alimentés par `DEFAULT_VARIANT_CATALOG`
(`crates/profile/src/lib.rs`) ; `variantDefsOf` cesse de jeter `zone` et compose l'entrée dans `group`. Les
libellés courts des sièges (« Éliminé », « Cartes couchées ») sont des libellés de CATALOGUE, servis comme les
libellés de pot de la 0.7.1 : rien à écrire côté DS.

Ce que le profil livré servira, à titre d'illustration et pour caler les fixtures :

| Entrée | Famille (`zone`) | Forme | Normal implicite | La case / les valeurs |
|---|---|---|---|---|
| Table | `actions` | choix | — | Hors tour · 2 boutons · 2 boutons (check/bet) · 3 boutons |
| Table | `board` | choix | — | Board vide · Flop · Turn · River |
| Table | `dealer` | choix | — | Héros · Vilain 1 · Vilain 2 |
| Table | `timer` | écart | Timer absent | **Timer visible** |
| Table | `requeue` | écart | Bouton Relancer absent | **Bouton Relancer affiché** |
| Héros | `hero_cards` | écart | Cartes héros distribuées | **Héros couché (cartes absentes)** |
| Vilain 1 | `villain_1_seat` | écart | Siège occupé | **Éliminé** → implique `villain_1_cards/absent` |
| Vilain 1 | `villain_1_cards` | écart | Cartes distribuées | **Cartes couchées** |
| Vilain 2 | `villain_2_seat` | écart | Siège occupé | **Éliminé** → implique `villain_2_cards/absent` |
| Vilain 2 | `villain_2_cards` | écart | Cartes distribuées | **Cartes couchées** |

## 5. i18n — clés FR/EN à prévoir dans `ui/screens/i18n.ts`

Toutes sous `roomProfileV3`, à côté des `tour*` existantes. Les libellés de déclinaison et les titres d'entrée sont
SERVIS : rien de ce qui nomme le poker n'entre ici.

- `attestNormalHint`
  - FR : « Une case non cochée atteste le cas ordinaire — ce n'est jamais « je ne sais pas ». »
  - EN : "An unticked box attests the ordinary case — never « I don't know »."
- `attestUnknown` — FR : « Non visible ici » · EN : "Not visible here"
- `attestUnknownAria(label)`
  - FR : « Déclarer « {label} » non visible sur cette capture »
  - EN : "Declare « {label} » not visible on this capture"
- `attestUnknownNote`
  - FR : « Non visible sur cette capture : cette famille n'atteste rien. »
  - EN : "Not visible on this capture: this family attests nothing."
- `attestImplied(cause)`
  - FR : « impliqué par « {cause} » — un siège vide n'a ni cartes ni mise »
  - EN : "implied by « {cause} » — an empty seat has neither cards nor bet"
- `attestNoChoice`
  - FR : « Aucun état retenu : cette famille n'atteste rien sur cette capture. »
  - EN : "No state chosen: this family attests nothing on this capture."
- `attestChoiceAria(family)`
  - FR : « État de « {family} » sur cette capture » · EN : "State of « {family} » on this capture"
- `attestColNormal` — FR : « Normal » · EN : "Normal"
- `attestColDeviation` — FR : « Écart » · EN : "Deviation"
- `attestNormalTitle(label)`
  - FR : « « {label} » : cas normal attesté par au moins une capture »
  - EN : "« {label} »: normal case attested by at least one capture"
- `attestDeviationTitle(label)`
  - FR : « « {label} » : écart attesté par au moins une capture »
  - EN : "« {label} »: deviation attested by at least one capture"

## 6. Fixtures

`RoomProfile.fixtures.ts` — `VARIANTS` se réécrit dans le nouveau vocabulaire (`zone`, `family`, `normal`,
`implies`, `group` = l'entrée), et il faut au moins ces postures pour que la parité pixel couvre la refonte :

1. **la posture courante** — une capture de flop, timer absent, deux vilains en jeu : toutes les cases d'écart
   décochées, les trois familles « choix » renseignées ;
2. **un écart coché** — « Timer visible » et « Héros couché » sur la même capture, pour que la case cochée et sa
   pastille « écart » de droite se voient ;
3. **un siège éliminé** — « Vilain 2 · Éliminé » coché, « Cartes couchées » du même siège cochée ET verrouillée
   avec sa phrase ;
4. **une famille non visible** — `dealer` dans `absentZoneIds` (le popup de rebuy couvre le badge), la ligne
   désactivée et sa note ;
5. **une famille « choix » vide** — aucune valeur `board` retenue, la phrase `attestNoChoice` rendue.

Les postures 3 et 4 sont celles qui manquent le plus : ce sont les deux seuls états où l'écran dit quelque chose
que le joueur ne peut pas deviner.

## 7. Ce qui ne bouge pas

- La station 4 (établi, canvas, rail des zones), la station 5 et la matrice de couverture : aucune ligne.
- Le canal d'émission : `onCorrectLabels` garde sa signature et sa sémantique de remplacement total.
- `Shot.variantIds`, `Shot.absentZoneIds`, `CoverageCell` : mêmes types, mêmes ids aplatis `zone/variant`.
- Le compteur de tête et les deux colonnes : mêmes clés, même définition.
- Les déclinaisons `disabled` du catalogue restent RETIRÉES de la liste servie (règle terrain 0.6.4) : elles
  n'apparaissent ni comme case, ni comme valeur de choix.
