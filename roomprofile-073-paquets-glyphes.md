# Demande durable — 0.7.3 : station 5, des paquets de gabarits nommés et une vérification par paquet

Vague Claude Design de la **0.7.3** — les retours de la campagne Windows 0.7.1 (issue #220, méta #34). Cette
demande est celle de l'issue **#214** : ranger les gabarits de glyphes par style, pour voir ce qui est couvert.

## 1. Ce que le joueur voit

Un seul tas de gabarits pour deux styles de chiffres. Constat de Romain, campagne 0.7.1, station 5, après
l'apparition des zones de blindes du header :

- **gras** : `hero_stack`, `villain_1_stack`, `villain_2_stack`, `hero_bet`, `villain_1_bet`, `villain_2_bet`,
  `pot_collected` ;
- **normal, plus fin** : `pot`, `blind_small`, `blind_big`.

Et ce qu'il demande :

> « pour moi ça m'aide à savoir où j'en suis de chaque collection différente donc même si le moteur le prend déjà en
> compte il faudra cette amélioration UX pour moi. […] je repère à l'œil 2 styles différents donc je crée 2 paquets
> de glyphes (avec chacun leur vérification à droite) et je note sur chaque extraction de ROI une fois le type
> auquel il correspond. »

Le jeu `amounts` du profil terrain compte 40 gabarits pour 12 codes — tous de 14 px de haut, donc tous du style
gras — et il manque `Cur` : le panneau de vérification affiche « 12 / 12 » sans que rien ne dise qu'un style
entier est absent. Le défaut ne se voit qu'au dry-run, en abstentions.

## 2. Ce que le moteur n'a pas à savoir

`GlyphSet.glyphs` est un `Vec<GlyphDef>` (`crates/profile/src/lib.rs`) : plusieurs gabarits peuvent déjà porter le
même code, et `best_match` retient le meilleur score sans notion de style. Un `D3` fin s'ajoute à côté des quatre
`D3` gras et gagne sur les zones fines — rien à séparer côté lecture.

Les paquets sont donc un **habillage** : un tag par gabarit, **le jeu compilé pour le moteur reste plat**. C'est un
outil de contrôle de couverture, pas de reconnaissance.

## 3. Ce qu'on demande à Claude Design

Station 5, outil glyphes (`apps/web/src/ui/screens/GlyphTool.tsx`). Trois choses, toutes sur des surfaces qui
existent déjà.

### 3.1 Créer et nommer un paquet

Au pied du panneau de vérification (colonne de droite), une saisie et un bouton — le motif que la station 3 livre
déjà pour déclarer une variante (`Input` + `Button`, désactivé sur une saisie vide). Un paquet appartient à une
FAMILLE de vocabulaire (`ranks` ou `amounts`) : on crée un paquet dans la famille qu'on regarde, et les paquets
d'une famille ne sont jamais offerts à l'autre — le « 3 » d'une carte et le « 3 » d'un pot ne sont pas les mêmes
pixels (#60), et un paquet qui les mélangerait ne mesurerait rien.

Renommer et supprimer restent des OFFRES (rendues seulement là où l'app les câble). **Supprimer un paquet ne
supprime aucun gabarit** : les extractions qui le portaient perdent leur tag et retombent dans « Sans paquet ». La
ligne du bouton le dit, avant confirmation.

### 3.2 Ranger une extraction de ROI dans un paquet

Sur chaque boîte de ROI de la colonne de gauche (`RoiTruth` / `NumberTruth`), à côté du geste d'écart de la récolte
(`RejectRoi`), **un sélecteur de paquet** : les paquets de la famille que cette ROI lit, plus « Sans paquet ». Un
seul geste, une seule fois par ROI et par capture — c'est le grain que Romain décrit (« je note sur chaque
extraction de ROI une fois le type auquel il correspond »), et c'est aussi le grain de la vérité de terrain
existante (`GlyphTruth`, une ligne par zone × capture).

Le tag ne touche PAS la récolte : `onSaveGlyphTemplates(zoneId, shotId)` garde sa signature, et une ROI sans
paquet se récolte comme aujourd'hui.

### 3.3 Une vérification par paquet

Le panneau de droite (chapeau `t.coverageEyebrow` = « Vérification », titre `t.glyphCoverageTitle(done, total)`)
gagne un **filtre de paquet** en tête : « Tous » (l'état actuel, le total plat que le moteur voit), puis un segment
par paquet de la famille, puis « Sans paquet » **dès qu'au moins un gabarit n'est pas rangé** — jamais un segment
vide qui ferait croire à un manque.

Sous le filtre, rien ne change de FORME : les deux sections de famille, leurs compteurs, leurs touches avec `×n`.
Seuls les comptes changent de source — ceux du paquet retenu. C'est exactement ce que le terrain attendait : avec
deux paquets, « montants · gras 12 / 12 » à côté de « montants · fin 0 / 12 » dit d'un coup d'œil qu'un style
entier manque.

Le filtre est un état de VUE : il vit dans l'écran, comme l'armement de la suppression ou le renommage en cours. Il
ne voyage sur aucun rappel et n'est pas servi.

## 4. Contrat de données

Types touchés : `apps/web/src/ui/screens/RoomProfile.fixtures.ts` (`GlyphCode`, `GlyphTruth`, `MeasureState`,
`RoomProfileCallbacks`) et `apps/web/src/ui/screens/contract.ts` (`RoomProfileWiring`).

```ts
/** Un paquet de gabarits nommé par le joueur, à l'intérieur d'une famille de vocabulaire. Habillage pur. */
export interface GlyphPack {
    id: string;
    label: string;               // servi, rendu verbatim — c'est le joueur qui nomme
    family: GlyphFamilyId;       // "ranks" | "amounts" — un paquet ne traverse pas les deux vocabulaires
}

export interface GlyphCode {
    code: string;
    label: string;
    count: number;               // INCHANGÉ : le total PLAT, ce que le moteur voit réellement
    unit?: boolean | undefined;
    family: GlyphFamilyId;

    /**
     * AJOUTÉ — le compte par paquet, clé = `GlyphPack.id`, plus la clé vide `""` pour les gabarits sans paquet.
     * La somme vaut `count` : les paquets partitionnent la récolte, ils ne la dupliquent pas. Absent = aucun
     * paquet n'existe encore, et le panneau rend son état d'aujourd'hui, sans filtre.
     */
    packCounts?: Readonly<Record<string, number>> | undefined;
}

export interface GlyphTruth {
    /* … inchangé : id, zoneId, shotId, value, segments, verifiedOn, rejected?, rejectedSegments?, segmentMismatch? */

    /**
     * AJOUTÉ — le paquet dans lequel l'extraction de CETTE ROI sur CETTE capture range ses gabarits. Absent =
     * « Sans paquet », qui reste un état légal et le seul état des profils d'avant cette vague.
     */
    packId?: string | undefined;
}

export interface MeasureState {
    /* … inchangé : tool, probes, suits, activeProbeId?, writes?, glyphs, truths, activeShotId?, glyphZoneIds?,
       shots?, glyphAdvice? */

    /** AJOUTÉ — les paquets déclarés par le joueur, dans l'ordre de création. Absent ou vide = aucun paquet. */
    packs?: readonly GlyphPack[] | undefined;
}
```

Rappels ajoutés à `RoomProfileCallbacks` :

```ts
/** Crée un paquet nommé dans une famille de vocabulaire. */
onCreateGlyphPack?: ((family: GlyphFamilyId, label: string) => void) | undefined;

/** Range l'extraction d'une ROI sur une capture dans un paquet — `null` = « Sans paquet ». */
onSetGlyphPack?: ((zoneId: string, shotId: string, packId: string | null) => void) | undefined;

/** OFFRE — renommer un paquet. Sans rappel, pas de contrôle de renommage. */
onRenameGlyphPack?: ((packId: string, label: string) => void) | undefined;

/** OFFRE — supprimer un paquet ; les extractions qu'il portait retombent dans « Sans paquet ». */
onDeleteGlyphPack?: ((packId: string) => void) | undefined;
```

`RoomProfileWiring` gagne **`onCreateGlyphPack` et `onSetGlyphPack`** : sans eux la demande n'existe pas (on ne
peut ni créer un paquet ni y ranger quoi que ce soit), donc le build doit casser plutôt que la session. Renommer
et supprimer restent hors Wiring — la maison de la station 5 (`onSampleProbe`, `onRetryExtraction`), où une offre
absente ne rend simplement pas son bouton.

**Retiré : rien.** `GlyphCode.count` reste le total plat et reste la valeur du filtre « Tous » : deux expressions
d'une même règle ne doivent pas dériver (#99), donc le panneau lit `count` pour « Tous » et `packCounts` pour un
paquet, jamais une somme recalculée.

Ne changent pas : `GlyphSegment`, `ExtractReport`, `onSaveGlyphTemplates`, `onSetGlyphTruth`, `onRejectGlyphRoi`,
`onToggleSegment`, `onRetryExtraction`, la colonne de gauche et son pager de captures.

### Ce que l'app servira (pour information, hors périmètre DS)

`GlyphDef` (`crates/profile/src/lib.rs`) gagne un `pack: Option<String>` écrit et relu par `set_glyphset`, ignoré
par la compilation vers `tatami-vision` — le jeu compilé reste plat. Chaque gabarit connaît déjà sa provenance
(`source = "<roi>@<capture>"`), donc ranger une extraction re-tague les gabarits de CETTE source ; un tag posé
avant toute récolte est retenu pour la récolte à venir. `GlyphCoverageDto.counts` se double d'un compte par
paquet, d'où sortent les `packCounts`.

## 5. i18n — clés FR/EN à prévoir dans `ui/screens/i18n.ts`

Sous `roomProfileV3`, à côté des `glyph*` existantes. Les noms de paquet sont SERVIS, jamais traduits.

- `packAll` — FR : « Tous » · EN : "All"
- `packNone` — FR : « Sans paquet » · EN : "No pack"
- `packFilterAria` — FR : « Filtrer la vérification sur un paquet » · EN : "Filter the verification by pack"
- `packOfRoiAria(zone)`
  - FR : « Paquet de l'extraction de « {zone} » » · EN : "Pack for the « {zone} » extraction"
- `packNewPlaceholder` — FR : « Nom du paquet (ex. gras, fin) » · EN : "Pack name (e.g. bold, thin)"
- `packCreate` — FR : « Créer le paquet » · EN : "Create pack"
- `packRename` — FR : « Renommer » · EN : "Rename"
- `packDelete` — FR : « Supprimer le paquet » · EN : "Delete pack"
- `packDeleteHint`
  - FR : « Les gabarits sont conservés : leurs extractions retombent dans « Sans paquet ». »
  - EN : "The templates are kept: their extractions fall back to « No pack »."
- `packEmpty` — FR : « Aucun gabarit dans ce paquet. » · EN : "No template in this pack."

## 6. Fixtures

`RoomProfile.fixtures.ts`, postures de la station 5 (`ROOM_PROFILE_GLYPHS_FIXTURE` et ses variantes) :

1. **aucun paquet** — `packs` absent : le panneau rend exactement ce qu'il rend aujourd'hui, sans filtre. C'est la
   posture de non-régression, et celle de tout profil d'avant la vague ;
2. **deux paquets, un vide** — « gras » couvert et « fin » à zéro sur la même famille `amounts` : c'est le constat
   de terrain, et la seule posture qui prouve que le panneau sait dire qu'un style manque ;
3. **des gabarits sans paquet** — le segment « Sans paquet » rendu à côté des deux autres, avec son compte ;
4. **une ROI rangée** — une boîte de la colonne de gauche dont le sélecteur porte « fin », à côté d'une boîte
   restée « Sans paquet ».

## 7. Ce qui ne bouge pas

- La colonne de gauche : crops, vérité de terrain, segments écartés, ROI écartée de la récolte, rejeu de la passe
  d'extraction, pager `‹ ›` et raccourcis `←` / `→`.
- Les deux familles de vocabulaire (`ranks`, `amounts`) et le prédicat de code requis (`codeRequired`, l'unité que
  la room ne lit pas reste hors du score).
- La pipette, le rail des présences, la station 6 et la matrice de couverture.
- La lecture : le moteur ne connaît aucun paquet, et aucune donnée servie ne le laisse croire.
