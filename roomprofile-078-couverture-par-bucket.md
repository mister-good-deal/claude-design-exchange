# Demande Claude Design — 0.7.8 : couverture des glyphes par bucket en station 5

Issue d'origine : [#275](https://gitlab.laneuville.me/rom1/tatami/-/issues/275), G1 tranchée par l'orchestrateur
(nuit du 2026-09-11, mandat Romain). Écrivain exchange : lt-atelier. Base DS : drop cumulatif `2026-09-09.x`
(vague #265) tel qu'importé par le lot géométrie #272. Un seul drop cumulatif attendu, après #272.
Ce fichier appartient à la MR du lot B de #273 ; il ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Ce que le banc a prouvé

Les gabarits d'un bucket ne se transfèrent pas à un autre : avec 80 gabarits tous prélevés à 1048×720, le bucket
698×720 lit 12/28 montants exacts (10 unités « BB » perdues, `0` lu `6`, `7` lu `1`). Pourtant la station 5
annonçait « 25 / 25 codes » **pour la room**, et le joueur avait fini de bonne foi.

Décision G1, les deux volets :

1. **La couverture des glyphes se calcule et se dit par bucket actif.** Un bucket sans gabarit natif pour une zone
   `number` est « manquant » pour cette zone ; les gabarits d'une autre taille ne le couvrent jamais.
2. **« Écrire » refuse** un bucket actif dont une zone `number` n'a aucun gabarit natif. Le refus est nommé :
   bucket, zones, codes.

Le calcul est côté Rust (lt-engine : `derive_glyph_coverage` par bucket, puis DTO et refus d'Écrire après #272).
L'app projette. Claude Design rend. Rien ici ne demande un nouveau canal IPC : les champs proposés sont des
extensions de présentation, optionnelles tant que le câblage n'est pas là.

## Station 5 — ce que l'écran montre par taille

Aujourd'hui `MeasureState.glyphs` (`GlyphCode.count`, `packCounts`) et le titre `glyphCoverageTitle(done, total)`
parlent de la room entière ; `data.activeSizeId` dit pourtant sur quel bucket le joueur prélève. Attendu :

| Élément | Attendu |
|---|---|
| Titre de couverture | compte **du bucket actif**, taille nommée : « Couverture glyphes — 1048×720 · 25 / 25 codes ». Jamais un total de room. |
| Codes et paquets (`GlyphCode`, `PackSummary`, onglet TOUS) | les compteurs sont ceux des gabarits **natifs** du bucket actif ; un code prélevé à une autre taille est manquant ici. |
| Résumé par bucket | une ligne par bucket **actif** du layout, dans l'ordre servi : taille, état (complet / incomplet / aucun gabarit natif), `couverts / requis`, codes manquants, nombre de gabarits natifs. Le bucket actif est distingué. |
| Changer de bucket en station 5 | un geste sur la ligne d'un autre bucket pose `activeSizeId` sur lui (rappel existant `onSelectSize(sizeId)`, sémantique froide de #244 : aucun redimensionnement, aucune capture). Le tour des captures, les vérités et l'atelier suivent ce bucket. |
| Bucket sans gabarit natif | l'état se lit sans ouvrir le bucket : « 698×720 — aucun gabarit natif : Écrire refusera ce bucket ». Ce n'est pas un compteur à zéro parmi d'autres, c'est le motif du refus à venir. |
| Bucket inactif (tombstone, hors layout) | absent du résumé, ou grisé avec sa raison si le contrat servi le porte ; jamais compté dans le requis. |
| Ligne d'aide (`glyphAdvice`) | reste par bucket actif : la situation de jeu conseillée fait tomber des codes **de ce bucket**. |

Idiome à réutiliser : la grille de couverture de la station 3 (`CoverageMatrix`, une colonne par taille, une cellule
par état) est déjà le langage « par bucket » de l'écran ; le résumé de station 5 peut en reprendre les mots et les
états sans en reprendre la grille (deux familles × N buckets tiennent en lignes).

Extension de présentation proposée, à typer optionnelle :

```ts
interface BucketGlyphCoverage {
    sizeId: string;
    label: string;                   // « 698×720 », servi
    family: GlyphFamilyId;           // amounts | ranks — une ligne par famille et par bucket
    state: "complete" | "incomplete" | "none";   // none = aucun gabarit natif
    covered: number;                 // codes couverts par des gabarits NATIFS de ce bucket
    required: number;                // dénominateur de SA famille et de l'unité requise par la room
    missing: string[];               // codes manquants, dans l'ordre du catalogue
    native: number;                  // gabarits natifs de ce bucket, toutes ROI confondues
    writeBlocked: boolean;           // vrai ⇔ une zone number de ce bucket n'a aucun gabarit natif
}
// MeasureState.bucketCoverage?: readonly BucketGlyphCoverage[]
```

`glyphs` et `packs` restent ce qu'ils sont, mais **portent le bucket actif** : le drop n'a pas à changer leur forme,
seulement à dire dans les mots que le compte est celui de la taille regardée.

## Spine et station 6 — le refus d'Écrire nommé

La ligne de préparation « glyphes » de la spine (`ReadinessLine`) compte aujourd'hui pour la room. Attendu : son
`meta` nomme le pire bucket (« 698×720 : 0 / 25 ») et ses `items` sont **un par bucket incomplet**, avec `sizeId`,
routés vers la station 5 **sur ce bucket** (la route existe : `ReadinessItem.sizeId` + `station`).

Le refus d'Écrire est déjà rendu verbatim en station 6 (`WriteVerdict.blockers`, fixture `WRITE_REFUSED`). Attendu :

| Cas | Rendu |
|---|---|
| Un bucket actif sans gabarit natif sur une zone `number` | un blocker par bucket, phrase du back verbatim, qui nomme la taille, les zones et les codes : « 698×720 : pot, hero_stack, blind_big — aucun gabarit natif (Unit, 0, 6, 7 manquants) ». |
| Plusieurs buckets | un blocker par bucket, dans l'ordre des tailles, jamais une somme. |
| Geste de reprise | depuis le blocker, rejoindre la station 5 sur ce bucket (même route que la spine) ; si le contrat ne porte pas de callback, le texte suffit et le geste passe par la spine. |
| Tout couvert | le verdict « écrit » nomme les buckets et leurs gabarits natifs : « 2 buckets · 1048×720 : 80 gabarits, 698×720 : 61 gabarits ». |

Aucun compteur composite, aucune moyenne de room, aucun « 25 / 25 » tant qu'un bucket actif est à zéro.

## Fixtures et recette

Postures à servir dans les fixtures DS, cohérentes avec le DTO :

- `journey` : deux buckets actifs, 1048×720 complet (25 / 25, 80 natifs), 698×720 **sans gabarit natif**
  (0 / 25, `none`, `writeBlocked`), station 6 refuse avec un blocker qui nomme 698×720 ; la spine porte un item
  698×720 vers la station 5.
- `terrain` : 698×720 incomplet (21 / 25, manquants `Unit · 0 · 6 · 7`, 61 natifs) — refus tant qu'une zone
  `number` reste sans gabarit, sinon écriture.
- `seed` : un seul bucket, aucun gabarit — un seul état `none`.

Recette (à rendre telle quelle) :

| Situation | Ce que l'écran dit |
|---|---|
| 1048×720 actif, 698×720 à zéro | titre « 1048×720 · 25 / 25 » ; résumé : 1048×720 complet, 698×720 « aucun gabarit natif : Écrire refusera » |
| Bascule sur 698×720 depuis le résumé | titre « 698×720 · 0 / 25 » ; onglets de paquets à zéro ; captures et vérités du bucket 698 ; aucun redimensionnement |
| Prélèvement de 4 codes à 698×720 | titre « 698×720 · 4 / 25 » ; 1048×720 inchangé à 25 / 25 |
| Station 6, 698×720 encore à zéro | refus, un blocker nommant 698×720 et ses zones ; geste vers la station 5 sur 698×720 |
| Station 6, les deux complets | écrit, buckets et gabarits natifs nommés |
| F5 | mêmes comptes par bucket, même bucket actif |

## Hors de cette demande

- Les rangs de cartes suivent le même rendu par bucket ; le **refus** d'Écrire ne porte que sur les zones `number`
  (G1). Si Romain étend le refus aux rangs, seule la fixture change.
- Le transfert automatique de gabarits entre tailles n'existe pas et ne doit pas être suggéré par l'écran.
- Le banc de non-régression par bucket (lt-engine) et le DTO définitif (lt-engine, lot B) précèdent le câblage app ;
  le drop peut arriver avant, avec ses champs optionnels.

## Drop et vérification

Un seul drop cumulatif avec manifeste ; version du prototype identique ; `previewOnly` vide ; FR/EN complets ;
lint, typecheck, react-doctor à zéro sans suppression. Conserver tous les acquis 0.7.6 / 0.7.7 (navigation froide,
sélection capture/ROI, paquets par ROI, palette datée, source de l'atelier, mantisses). Import par `pnpm import-ds`
seulement ; puis tests app, e2e complète, parité pixel.
