# Demande durable — 0.7.4 : atelier de traitement, station 5

Vague Claude Design de la **0.7.4** — la suite du lot I des montants (issue **#221**, méta #34). Cette demande est
celle de la décision de Romain du 2026-09-06 : un **atelier de traitement** dans la station 5, où l'on règle la
chaîne de lecture d'un montant étape par étape et où l'on voit ce que chaque étape fait, avant et après.

La chaîne elle-même — les onze étapes, leurs paramètres, leurs défauts, ce qui est mesuré et ce qui reste à
mesurer — est décrite dans notre wiki, page « Lecture des montants » (résumée ci-dessous : onze étapes crop → luma → ink → column → components → morphology → cells → series → match → grammar → result).
Cette demande ne la rediscute pas : elle demande la surface qui la rend réglable.

## 1. Ce que le joueur voit

La lecture des montants a été mesurée pour la première fois sur des captures réelles : **59 lectures fausses sur
320**, sur les 32 captures de campagne. Le spike du 2026-09-06 a montré que deux traitements — filtrer l'encre en
teinte, et choisir la bonne série de chiffres dans le rect — ramènent les 59 à **20**, sans un seul faux positif et
pour +4 % de coût, **sans qu'un seul rect bouge**.

Le verdict de Romain, après la fiche G1 :

> « les traitements coûtent peu et améliorent nettement → **on continue à les pousser** […] chaîne de traitement
> paramétrable dans le lecteur (filtrage d'encre en teinte, sélection de série + ancrage par zone, filtre de taille
> des composantes, seuil), **règles métier en dernier filtre / décodage sous grammaire** […] et un **atelier
> station 5** pour ajuster finement les paramètres avec prévisualisation des étapes au clic. »

Aujourd'hui, rien de tout cela n'est visible. La station 5 sait récolter des gabarits et vérifier une couverture ;
elle ne sait pas montrer **pourquoi** une zone lit « 21,5 BB » là où l'œil lit « 1,5 BB ». Le seul outil est un banc
hors ligne piloté par des variables d'environnement, réservé à un agent. Le joueur, lui, n'a que le verdict.

Ce que l'atelier change : on prend **une zone `number` d'une capture du bucket**, on déroule les onze étapes, on
voit le masque **avant** et **après** chacune, on bascule un interrupteur ou on pousse un paramètre, on **exécute**,
et on lit d'un coup ce que le réglage vaut — sur ce crop, puis sur toutes les captures étiquetées du bucket.

## 2. Ce qu'on demande à Claude Design

Un **prototype de station expert** dans la station 5. Il ne remplace rien : c'est un **troisième outil** à côté de
« Pipette » et « Glyphes » (`MeasureState.tool` gagne `"pipeline"`), avec son entrée depuis une boîte de ROI
`number` de l'outil glyphes — on ouvre l'atelier sur la zone et la capture qu'on regardait.

Il tient en quatre surfaces.

### 2.1 La vue d'ensemble, en tête

L'image **originale** ⇒ l'image **finale**, toutes étapes actives appliquées, côte à côte, avec entre les deux la
**valeur lue**, sa **confiance** et la **règle qui a tranché** (rendue verbatim). C'est ce qu'on regarde en premier
et ce qu'on regarde en dernier ; les onze cartes sont là pour expliquer l'écart entre les deux images.

Quand la lecture est une abstention, la place de la valeur porte la **raison** — pas un tiret muet : c'est
exactement l'information qu'on est venu chercher.

### 2.2 Une carte par étape, dans l'ordre

Onze cartes, `crop` → `result`, chacune portant :

- son **numéro et son libellé**, servis (`PipelineStep.label`) et rendus **verbatim** — l'app les traduit, parce
  qu'ils nomment des étapes du moteur ;
- son **interrupteur** (`PipelineStep.enabled`), sauf `crop`, `cells` et `result` qui ne se désactivent pas — sans
  crop il n'y a rien à lire, sans cellules rien à apparier, et le résultat est la sortie ;
- son **témoin AVANT / APRÈS** : deux images, chacune une URL servie ;
- son **coût**, en µs, pour **cette** exécution ;
- ses **paramètres**, avec leur valeur appliquée, leur défaut, et une marque quand la zone **surcharge** le défaut ;
- sa **note** servie, quand l'étape en a une : ce qu'elle a fait — « 3 colonnes vidées », « 2 cellules écartées »,
  « série de droite retenue, 2 candidates », « refusé : deux séparateurs ».

Une étape éteinte rend sa carte **inerte et lisible** : l'interrupteur, le libellé, et le fait qu'elle n'a rien fait
— jamais une carte qui disparaît. C'est une chaîne : on doit voir les maillons absents.

### 2.3 La portée : la ROI entière, ou un glyphe

Un choix en tête de l'atelier — **sur la ROI** (défaut) ou **sur un glyphe** : les témoins des onze cartes se
recadrent alors sur cette seule cellule. Le glyphe se choisit en cliquant une boîte dans le témoin de l'étape
`cells`, qui les numérote. C'est le geste qui manque le plus au bucket 698, où un glyphe fait 6×9 px et où la faute
se joue sur trois pixels.

### 2.4 Exécuter au clic — **jamais en continu**

Un seul bouton **« Exécuter »**. Aucune exécution automatique : ni à l'ouverture, ni à chaque frappe, ni au
relâchement d'un curseur. Une lecture complète coûte ~120 µs, mais l'atelier la rejoue sur des images qu'il faut
produire et servir ; et surtout, un réglage se juge sur un geste délibéré, pas sur un tremblement.

**L'écran le dit** : dès qu'un interrupteur ou un paramètre bouge après une exécution, les témoins deviennent
**périmés** — marqués comme tels, pas effacés — et une ligne dit que les réglages s'appliqueront à la prochaine
exécution. C'est la règle des gestes armés de la station 3, appliquée ici.

### 2.5 Le compteur : ce que le réglage vaut sur tout le bucket

Un jeu de paramètres qui répare CE crop peut en casser dix autres. Sous la vue d'ensemble, un panneau
**exactes / fausses / abstentions** sur les captures étiquetées du bucket — les vérités de la station 5
(`GlyphTruth`) —, **le total et le détail par zone**, avec son propre bouton de mesure (elle est plus longue qu'une
exécution : c'est le bucket entier).

Trois nombres, trois poids différents, et la lecture doit les séparer à l'œil : **une valeur fausse est un défaut**,
une abstention est un aveu, une exacte est le but. Zéro faux positif est le critère du projet — un réglage qui
corrige dix fautes en en créant une est refusé, et le panneau doit rendre ce jugement possible d'un coup d'œil.

Enfin, **« Enregistrer les paramètres »** : pour la zone regardée, ou pour toutes (le défaut du profil). Un
enregistrement n'est jamais implicite — on règle, on mesure, puis on décide.

## 3. Contrat de données

Types touchés : `apps/web/src/ui/screens/RoomProfile.fixtures.ts` (`MeasureState`, `RoomProfileCallbacks`) et
`apps/web/src/ui/screens/contract.ts` (`RoomProfileWiring`).

```ts
export type PipelineStepId =
    "crop" | "luma" | "ink" | "column" | "components" | "morphology"
    | "cells" | "series" | "match" | "grammar" | "result";

export interface PipelineStep {
    id: PipelineStepId;
    label: string;                 // servi, FR/EN par l'app
    enabled: boolean;
    params: Record<string, number | string | boolean>;   // les paramètres de l'étape, tels qu'appliqués
    costUs: number;                // coût mesuré de CETTE exécution
    before: string;                // URL asset (PNG) du témoin avant
    after: string;                 // URL asset (PNG) du témoin après
    note?: string | undefined;     // ce que l'étape a fait, verbatim
}

export interface PipelineRun {
    steps: PipelineStep[];
    original: string;              // URL asset du crop d'origine
    final: string;                 // URL asset de l'image finale
    read: { value: NumberRead | null; confidence: number; rule: string };
    scope: { kind: "roi" } | { kind: "glyph"; index: number };
}

export interface NumberMeasure {
    exact: number; wrong: number; abstain: number;
    perZone: Record<string, { exact: number; wrong: number; abstain: number }>;
}
```

`NumberRead` n'existe pas encore côté DS ; c'est le miroir du type du moteur (`crates/vision/src/number.rs`) :

```ts
/** Ce que le lecteur rend. `value: null` est l'abstention — jamais un zéro de repli. */
export interface NumberRead {
    value: number | null;
    decimals: number;
    unit: "bb" | "cur" | null;
}
```

`PipelineRun.read.value` est donc `null` quand la chaîne s'abstient **avant** d'avoir un `NumberRead` à rendre, et
`read.rule` porte alors la raison — les deux ne disent pas la même chose et l'écran a besoin des deux.

Servi dans `MeasureState` :

```ts
export interface MeasureState {
    /* … inchangé : tool, probes, suits, activeProbeId?, writes?, glyphs, truths, activeShotId?,
       glyphZoneIds?, shots?, glyphAdvice?, packs? */

    /** AJOUTÉ — l'atelier rejoint la pipette et les glyphes comme troisième outil de la station 5. */
    tool: "pipette" | "glyphs" | "pipeline";

    /**
     * AJOUTÉ — la configuration COURANTE de la chaîne pour la zone regardée, sans images : elle rend les onze
     * cartes (libellé, interrupteur, paramètres, surcharges) AVANT toute exécution. Toujours onze entrées, dans
     * l'ordre du pipeline — une chaîne à trous ne se rend pas.
     */
    numberSteps: PipelineStep[];

    /** AJOUTÉ — la dernière exécution. Absente = rien n'a encore été exécuté : les cartes sont là, les témoins non. */
    pipeline?: PipelineRun | undefined;

    /** AJOUTÉ — le dernier comptage sur les captures étiquetées du bucket. Absent = jamais mesuré. */
    numberMeasure?: NumberMeasure | undefined;
}
```

Sur `numberSteps`, `costUs` vaut 0 et `before` / `final` sont les URL vides tant qu'aucune exécution n'a eu lieu :
c'est la posture « cartes sans témoins », et elle doit se rendre proprement (§5, posture 1).

Rappels ajoutés à `RoomProfileCallbacks` :

```ts
/** Exécute la chaîne sur une zone d'une capture, à la portée demandée. LE geste de l'atelier. */
onRunPipeline?: ((sizeId: string, shotId: string, zoneId: string, scope: PipelineRun["scope"]) => void) | undefined;

/** Allume ou éteint une étape pour cette zone. */
onToggleStep?: ((zoneId: string, stepId: PipelineStepId, enabled: boolean) => void) | undefined;

/** Pousse un paramètre d'une étape pour cette zone. */
onSetParam?:
    ((zoneId: string, stepId: PipelineStepId, name: string, value: number | string | boolean) => void) | undefined;

/** OFFRE — compte exactes / fausses / abstentions sur les captures étiquetées du bucket. */
onMeasureNumbers?: ((sizeId: string) => void) | undefined;

/** OFFRE — écrit les paramètres au profil : pour une zone, ou `null` pour le défaut de toutes. */
onSaveNumberParams?: ((zoneId: string | null) => void) | undefined;
```

**Ce qui entre dans `RoomProfileWiring` : `onRunPipeline`, `onToggleStep`, `onSetParam`.** Sans ces trois-là
l'atelier n'existe pas — on ne peut ni exécuter, ni régler quoi que ce soit, et le build doit casser plutôt que la
session. `onMeasureNumbers` et `onSaveNumberParams` restent des **offres** : la mesure du bucket et l'écriture au
profil peuvent arriver après, et la maison de la station 5 est qu'un contrôle sans rappel n'est **pas rendu**.

**Les images sont servies par URL**, comme `GlyphSegment.imageUrl` et `GlyphCropDto.image_url` : protocole asset
Tauri en production, convention `fixture://…` chez le driver de fixtures. **Jamais une data-URL, jamais un canvas
maison** — l'atelier n'invente aucun pixel, il affiche ceux que le moteur a produits. Une URL que la prévisualisation
DS ne sait pas résoudre doit dégrader en **cadre vide étiqueté** (« avant », « après »), jamais en image cassée.

**Retiré : rien.**

## 4. i18n — clés FR/EN à prévoir dans `ui/screens/i18n.ts`

Sous `roomProfileV3`, à côté des `glyph*` existantes.

- `pipelineTool` — FR : « Atelier » · EN : "Workshop"
- `pipelineEyebrow` — FR : « Traitement » · EN : "Pipeline"
- `pipelineTitle(zone)` — FR : « Chaîne de lecture — {zone} » · EN : "Read pipeline — {zone}"
- `pipelineRun` — FR : « Exécuter » · EN : "Run"
- `pipelineNeverRun` — FR : « Aucune exécution : les réglages sont là, les témoins non. » · EN : "Not run yet: the
  settings are here, the previews are not."
- `pipelineStale` — FR : « Réglages modifiés — les témoins datent de l'exécution précédente. » · EN : "Settings
  changed — these previews are from the previous run."
- `pipelineManualOnly` — FR : « La chaîne ne s'exécute qu'au clic. » · EN : "The pipeline only runs on click."
- `pipelineBefore` — FR : « Avant » · EN : "Before"
- `pipelineAfter` — FR : « Après » · EN : "After"
- `pipelineScopeRoi` — FR : « Sur la ROI » · EN : "On the ROI"
- `pipelineScopeGlyph` — FR : « Sur un glyphe » · EN : "On one glyph"
- `pipelineScopeAria` — FR : « Portée des témoins » · EN : "Preview scope"
- `pipelineGlyphPick(n)` — FR : « Glyphe {n} » · EN : "Glyph {n}"
- `pipelineCost(us)` — FR : « {us} µs » · EN : "{us} µs"
- `pipelineCostTotal(us)` — FR : « Lecture complète : {us} µs » · EN : "Full read: {us} µs"
- `pipelineStepOff` — FR : « Étape désactivée » · EN : "Step off"
- `pipelineStepLocked` — FR : « Étape indispensable » · EN : "Required step"
- `pipelineOverridden` — FR : « Surchargé pour cette zone » · EN : "Overridden for this zone"
- `pipelineDefault(v)` — FR : « défaut {v} » · EN : "default {v}"
- `pipelineRead` — FR : « Valeur lue » · EN : "Value read"
- `pipelineConfidence` — FR : « Confiance » · EN : "Confidence"
- `pipelineRule` — FR : « Règle » · EN : "Rule"
- `pipelineAbstained` — FR : « Abstention » · EN : "Abstained"
- `pipelineMeasure` — FR : « Mesurer sur les captures étiquetées » · EN : "Measure on the labelled captures"
- `pipelineMeasureNever` — FR : « Jamais mesuré sur ce bucket. » · EN : "Never measured on this bucket."
- `pipelineExact` — FR : « Exactes » · EN : "Exact"
- `pipelineWrong` — FR : « Fausses » · EN : "Wrong"
- `pipelineAbstain` — FR : « Abstentions » · EN : "Abstentions"
- `pipelineWrongIsDefect` — FR : « Une valeur fausse est un défaut ; une abstention est comptée à part. » · EN : "A
  wrong value is a defect; an abstention is counted apart."
- `pipelineSaveZone(zone)` — FR : « Enregistrer pour « {zone} » » · EN : "Save for « {zone} »"
- `pipelineSaveAll` — FR : « Enregistrer comme défaut du profil » · EN : "Save as the profile default"
- `pipelineOpen` — FR : « Ouvrir l'atelier » · EN : "Open the workshop"

**Les onze libellés d'étape ne sont PAS des clés DS** : ils arrivent par `PipelineStep.label` et se rendent
verbatim. Pour concevoir avec les vraies chaînes, voici ce que l'app servira :

| id | FR | EN |
| --- | --- | --- |
| `crop` | 0 · Crop de la zone | 0 · Zone crop |
| `luma` | 1 · Seuil de luminance | 1 · Luminance threshold |
| `ink` | 2 · Filtrage d'encre (teinte) | 2 · Ink filter (hue) |
| `column` | 3 · Colonnes d'encre | 3 · Ink columns |
| `components` | 4 · Composantes connexes | 4 · Connected components |
| `morphology` | 5 · Nettoyage morphologique | 5 · Morphological cleanup |
| `cells` | 6 · Segmentation en cellules | 6 · Cell segmentation |
| `series` | 7 · Séries et ancrage | 7 · Series and anchor |
| `match` | 8 · Appariement aux gabarits | 8 · Template matching |
| `grammar` | 9 · Décodage sous grammaire | 9 · Grammar decoding |
| `result` | 10 · Résultat et confiance | 10 · Result and confidence |

## 5. Fixtures

`RoomProfile.fixtures.ts`, une posture de station 5 par cas. Les images sont des **URL** (`fixture://crops/…`), pas
des fichiers : c'est la convention des captures de fixture d'aujourd'hui, et c'est ce que la prévisualisation doit
savoir dégrader (§3).

1. **jamais exécuté** — `numberSteps` servi, `pipeline` absent : les onze cartes rendent leur libellé, leur
   interrupteur et leurs paramètres, les témoins sont des cadres vides étiquetés. C'est la posture d'ouverture, et
   celle qu'on voit le plus souvent.
2. **une exécution complète, riche en notes** — la zone `pot` du bucket 1048 : `ink` note l'encre appliquée,
   `components` note **une cellule écartée**, `series` note **deux candidates, celle du centre retenue**, `match`
   rend ses scores, `grammar` **tranche** (« un seul séparateur »), `result` rend `1,5 BB` à 0,686. Toutes les
   étapes portent un `costUs` et deux témoins.
3. **une abstention avec sa raison** — `read.value` à `null` et `read.rule` non vide (« séparateur en tête ») : la
   place de la valeur porte la raison, et la carte `grammar` porte la même phrase.
4. **une étape éteinte au milieu** — `ink` à `enabled: false` : sa carte est inerte, et l'image finale de la vue
   d'ensemble n'est plus la même. C'est la posture qui prouve que la chaîne se lit avec ses trous.
5. **la portée « sur un glyphe »** — `scope: { kind: "glyph", index: 3 }` : les témoins recadrés sur une cellule de
   quelques pixels, agrandie.
6. **un compteur** — `numberMeasure` avec un total et un détail par zone où **une zone concentre les fautes**
   (`pot` : 9 exactes, 23 fausses), les autres au vert. C'est le vrai visage du terrain.
7. **jamais mesuré** — `numberMeasure` absent : le panneau dit qu'il n'a rien à dire et propose la mesure.

## 6. Ce qui ne bouge pas

- **La récolte de gabarits** : la colonne de gauche de l'outil glyphes, les crops, la vérité de terrain, les
  segments écartés, la ROI écartée, le rejeu de la passe d'extraction. `onSaveGlyphTemplates` garde sa signature.
- **Les paquets de gabarits et leur vérification** (#214) : le filtre de paquet, les compteurs, `GlyphPack`,
  `packCounts`, `packId`. L'atelier ne connaît pas les paquets.
- **Le pager de captures** et ses raccourcis `←` / `→`, partagés par les deux outils.
- **La station 4** : l'atelier ne déplace aucun rect. C'est même sa raison d'être — le spike a conclu qu'il ne faut
  PAS resserrer les rects, et l'atelier est ce qui rend le resserrement inutile.
- **La pipette**, le rail des présences, la station 6 et la matrice de couverture.
- **Le moteur** : l'atelier n'apporte aucune lecture qui ne soit celle du lecteur livré, avec les paramètres du
  profil. Ce qu'on y voit est ce que la session verra.
