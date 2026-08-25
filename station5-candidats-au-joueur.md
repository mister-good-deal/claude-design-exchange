# Tatami app → Claude Design — station 5 : montrer TOUS les candidats et laisser le joueur juger

Demande autonome issue de la campagne terrain 0.6.6 (2026-08-25), suivie côté app par l'issue #40. Fichier
d'échange propre : elle survit à l'itération courante.

## Ce que le terrain a vécu

Le correctif de l'écart 56 a donné au segmenteur le pouvoir de **rejeter** ce qu'il juge n'être pas une carte. Sur
la capture `#20260816T093311136` il a les deux erreurs, à trois lignes d'écart :

- `board_3` — **il a raison** : « 13 composantes rejetées comme décor », le jeton de mise et le badge du pot sont
  posés sur la carte, et la carte sort proprement ;
- `hero_1` — **il a tort** : « aucun crop … 1 composante rejetée comme décor », alors que la vignette existe en
  cache et que le A♠ est parfaitement lisible à l'œil.

Une heuristique qui tranche seule aura toujours ces deux erreurs symétriques : garder du décor, jeter une vraie
carte. Le joueur, lui, voit immédiatement laquelle est laquelle. **La responsabilité doit s'inverser.**

## Ce qui est fait côté app (MR sur #40)

Le moteur **ne décide plus**. `segment_card_glyph_boxes` rend désormais chaque composante avec ce qu'elle
inspire — `CardBox { rect, doubt: Option<CardDoubt> }` — au lieu d'en jeter la moitié, et `glyphs_crop` sert les
douteuses entières :

```ts
GlyphCropDto = {
    segmentation: BoxDto[],        // les RETENUES — inchangé : la vérité s'aligne dessus, l'extraction les découpe
    segmentPaths: string[],        // inchangé
    rejected: number | null,       // inchangé : le compte, désormais = doubted.length
    doubted: {                     // ← NOUVEAU
        rect: BoxDto,
        imageUrl: string,          // ses VRAIS pixels, vignette à elle (jamais l'index d'une retenue)
        reason: string,            // motif verbatim, à afficher tel quel
    }[],
}
```

Les quatre motifs, mot pour mot :

- « hors du coin haut-gauche — décor posé par-dessus la carte » (le cas du terrain) ;
- « trop petite pour un rang ou son pip » ;
- « plus haute qu'un rang de carte » ;
- « plus large qu'un rang de carte ».

**L'app a donc de quoi tout montrer.** Il lui manque un contrat pour le rendre, et un geste pour trancher.

## Attendu, côté DS

### 1. Une ROI carte montre TOUS ses candidats — les retenus ET les douteux

Aujourd'hui `Crop` ne rend que `truth.segments` et résume les autres en une note (`t.rejectedNote(n)`,
« N composantes rejetées comme décor »). Un compte n'est pas une preuve : `hero_1` disait « 1 composante rejetée »
pour la seule vraie carte de la ROI, et rien à l'écran ne permettait de le voir.

*Attendu :* les candidats douteux sont rendus **à côté** des retenus, avec leurs pixels, visiblement mis en retrait
(c'est une suggestion d'écart, pas un rejet), chacun portant **son motif** — pas le compte agrégé.

### 2. Un geste par candidat, réversible

*Attendu :* sur chaque candidat, un geste pour le faire passer d'un état à l'autre — un douteux que le joueur
reconnaît **rejoint la sélection**, un retenu qu'il juge illisible **en sort**. Réversible : le joueur revient
dessus sans recharger la capture.

C'est le seul ajout de contrat que la demande porte. Notre proposition, à votre main :

```ts
/** Le joueur tranche la lisibilité d'un candidat — l'heuristique ne fait que suggérer (issue #40). */
onSetGlyphSegmentKept?: ((sizeId: string, zoneId: string, shotId: string, segmentId: string, kept: boolean) => void) | undefined;
```

Nous fournirons alors `GlyphTruth.segments` avec **tous** les candidats et un drapeau `kept` par segment (plus
`doubt?: string`, le motif). Si vous préférez deux listes séparées à un drapeau, dites-le : c'est votre forme.

⚠️ **Invariant à ne pas casser** : la vérité saisie s'aligne sur les cellules **retenues** (`map_truth` refuse un
désalignement tokens ↔ cellules, et c'est ce refus qui a fermé l'écart 56a). Basculer un candidat change donc le
nombre de cellules à étiqueter — le composer doit suivre, pas se figer sur l'ancien compte.

### 3. La consigne « ne pas conserver une ROI occultée » est présente à l'écran

Elle manque totalement aujourd'hui, et c'est la partie que seul un mot bien placé peut porter :

> Même quand l'œil reconnaît le contenu, une ROI occultée ou « pas clean » **ne doit pas être conservée** : les
> gabarits de glyphes et les oracles de dry-run se construisent dessus, une capture dégradée dégrade toute la
> collection.

*Attendu :* cette consigne vit **là où le geste se fait** — sur la ROI dont un candidat est douteux, pas dans une
aide générale en bas de page. Formulation à votre main ; le fond est celui-ci.

### 4. Ce que nous n'avons PAS demandé

Ni durcissement du filtre (l'écart 56a est **tenu**, `board_3` sort une carte propre : ne pas y toucher), ni
suppression du rejet automatique. Il reste, **pré-appliqué** : à l'ouverture, la sélection est exactement celle
d'aujourd'hui. Ce qui change, c'est qu'elle est visible, expliquée et réversible.

## Contexte connexe

L'issue #10 (le geste de relance d'extraction, à rendre debout dans l'en-tête) porte sur le même écran et part dans
son propre fichier d'échange, `ds-report-rpv3-station5-relance-extraction.md`. Les deux sont indépendantes.
