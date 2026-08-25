# Room Profile v3 — deux MOTS qui manquent au contrat (écarts 62 / 64 / 67, campagne 0.6.6)

**Verdict : les trois écarts sont câblés côté app, et le contrat DS les portait déjà.** Les lignes du score
comptent désormais leur avancement (`ReadinessLine.meta` = un ratio, plus une date manquante), le dépliage rend
UNE ligne par trou (un code de glyphe = une ligne, comme `GLYPH_ITEMS` du prototype), et chaque trou porte SON
état (`missing` / `stale`) au lieu de celui de sa ligne — exactement la forme que `DRYRUN_ITEMS` et
`coverageItems` montrent déjà côté prototype.

Il reste **deux formulations** qui appartiennent au DS et que l'app ne peut pas corriger sans hand-éditer
`ui/screens/i18n.ts` (gate `ds-sync`). Les voici, avec le fait qui les rend fausses au terrain.

## 1 — `roomProfileV3.neverRun` : « jamais lancé » AFFIRME une histoire que l'app ne connaît pas

`DryRunRow` rend `neverRun` dès que `SizeBucket.dryRun` est `null`. Or `null` ne veut pas dire « aucune passe n'a
jamais tourné » : il veut dire « l'app n'a aucune passe enregistrée pour ce bucket ». Les deux se confondaient
tant que le backend gardait tout, mais un profil de terrain porte encore des buckets dont l'historique a été
**purgé** par une version antérieure du backend (l'ancien `clear_dry_runs`, remplacé depuis par une invalidation
qui MARQUE la passe et garde sa cause). Sur ces buckets hérités, l'écran dit « jamais lancé » d'un bucket où une
passe a bien tourné — l'information est perdue sur disque, aucun câblage ne la ramène.

Le mot juste ne doit rien affirmer sur le passé, seulement sur ce que l'app a :

- fr : « aucune passe enregistrée » (plutôt que « jamais lancé »)
- en : « no recorded pass » (plutôt que « never run »)

Il reste vrai pour un bucket réellement vierge, et cesse de mentir pour un bucket dont le verdict a été effacé.
Rien d'autre à changer : « périmé — à relancer » (`dryStale`) et sa cause (`dryInvalidatedBy`) sont câblés et
vérifiés par un test de bout en bout (éditer la géométrie d'un bucket vert → le rail dit « périmé — à relancer »
+ « invalidé : géométrie re-projetée depuis … »).

## 2 — `roomProfileV3.lineDetail` : « N manques » agrège des manques ET des péremptions

Le compteur du `<summary>` compte les items de la ligne. Pour la ligne « Variantes attestées », ces items sont de
deux natures : des cellules jamais capturées (une découverte) et des cellules dont l'évidence est tombée sous le
plancher de fraîcheur (un rejeu). Au terrain, « 19 manques » valait 14 + 5 — et « 12 attestées » face à
« 19 manques » ne tombait sur aucun total, puisqu'une cellule périmée est comptée des deux côtés.

L'app rend maintenant la nature de chaque item (`ReadinessItem.state` = `missing` | `stale`, et le libellé dit
« Capturer … » vs « Recapturer … (évidence périmée) »), donc le détail est lisible dès qu'on déplie. Reste le mot
du bandeau, qui ne peut pas venir de l'app :

- fr : « N à (re)jouer — déplier » (plutôt que « N manques — déplier »)
- en : « N to (re)play — unfold » (plutôt que « N holes — unfold »)

Ou, si vous préférez porter la décomposition : une signature `lineDetail(missing, stale)` rendant
« 14 manquantes + 5 périmées — déplier » quand `stale > 0`, et « 14 manquantes — déplier » sinon. L'app a les deux
comptes sous la main et les passerait sans dérivation nouvelle.

## Ce qui est déjà servi côté app (pour information, rien à faire)

- `ReadinessLine.meta` porte un ratio pour les CINQ lignes comptées, y compris « Pixels de référence prélevés »
  (unités de la pipette : une couleur par barre requise + la palette des enseignes). « Jamais effectuée » ne
  reste que pour une ligne qui n'a ni compte ni date.
- `ReadinessLine.items` : un item par trou, un code de glyphe par item, chacun avec son adresse et son état.
- Les dénominateurs des trois écrans (Couverture, station 3, score) sortent d'une dérivation unique côté backend :
  le total d'une ligne EST le nombre de cellules attestables de la matrice.
