# Demande Claude Design — 0.7.19 : le traitement des montants se règle par taille

Lot lt-etude [#443](https://gitlab.laneuville.me/rom1/tatami/-/issues/443), rédigée et publiée par lt-atelier (écrivain
exchange). **Trois points, rien d'autre.** Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Pourquoi

L'étude [#440](https://gitlab.laneuville.me/rom1/tatami/-/issues/440) a tranché la lecture des montants : **un seul modèle
de glyphes par room**, pris à la taille de référence (1572 × 1080). Chaque autre taille lit son crop **rééchantillonné**
vers cette référence. Sur le vérifiable : natif 65 justes / 12 fausses / 19 abstentions, contre 122 / 2 / 0 avec le
modèle de room. Décision de Romain (23/09) : « si des traitements graphiques différents par taille augmentent le nombre
de lectures justes, alors on ajoute cette option dans la config du joueur et dans mon atelier, que je puisse finement
régler les paramètres par taille. »

Norme : `doc/architecture/contrat-des-stations.md` — **P3** (un réglage appartient à SA taille), **P7** (une écriture
rend le fait écrit et son verdict), **P9** (l'écran affiche, l'app décide).

## 1. Le panneau « Traitement de la taille » dans l'atelier

L'atelier de la station 5 (`PipelineTool`) règle aujourd'hui la chaîne de lecture d'une ROI. Il gagne un panneau pour la
**taille** affichée par le bandeau : cinq réglages et ce qu'ils valent.

**Contrat** — servi par l'app, par taille :

```ts
export interface AmountTreatment {
    sizeLabel: string;                     // « 698 × 720 »
    kernel: "bicubic" | "bilinear" | "nearest";
    space: "rgb" | "mask";
    digitHeight: number | null;            // hauteur des chiffres en px de la taille, mesurée en station 5 ; null = pas encore mesurée
    scale: number;                         // facteur vers la référence, en vigueur
    confidenceMin: number | null;          // plancher de confiance ; null = celui de la room
    source: "measured" | "forced";         // le facteur vient de la hauteur mesurée, ou le mainteneur l'a forcé
    reference: boolean;                    // la taille EST la référence : rien à rééchantillonner, les réglages ne s'offrent pas
    pass?: { before: Jfa; after: Jfa } | undefined;  // la passe du banc rendue par la dernière écriture de réglage
}
export interface Jfa { right: number; wrong: number; abstain: number }

/** OFFRE : sans handler, le panneau est en lecture seule. `value` null = revenir au défaut (mesuré / room). */
onSetAmountTreatment?: (sizeId: string, field: "kernel" | "space" | "scale" | "confidenceMin", value: string | number | null) => void;
```

- Les cinq valeurs se lisent toujours ; `source` se dit à côté du facteur (« mesuré » / « forcé »). `digitHeight` n'est
  pas réglable : c'est un produit de la station 5, il se lit (ou « pas encore mesurée »).
- Avec le handler : noyau et espace en choix fermés, facteur et plancher en champs numériques avec « revenir au
  défaut ». Chaque réglage part seul, à la validation du champ ; l'écran n'additionne ni ne recalcule rien.
- `pass` rendu en une ligne « avant 65 / 12 / 19 → après 122 / 2 / 0 » (justes / fausses / abstentions), la fausse en
  avant, jamais en couleur de succès si elle ne baisse pas. Absent : rien.
- `reference: true` : le panneau le dit en une phrase (« taille de référence : le modèle de la room est pris ici ») et
  n'offre aucun réglage.
- **Lecture seule** (pas de handler) : le même panneau, sans aucun contrôle. C'est la forme que l'app montrera côté
  joueur, là où elle le montera ; ne créez pas d'écran pour cela.

## 2. Station 5, glyphes : une taille non référence le dit

Sur une taille qui n'est pas la référence, les montants ne se récoltent plus : ils sont lus au modèle de la room. La
ligne de la taille (couverture glyphes, famille des montants) porte une phrase servie :

```ts
readAt?: string | undefined;   // sur la couverture de la taille : « lu au modèle de la room (1572 × 1080) »
```

Rendue verbatim sous le titre de la couverture, à la place des pastilles de la famille des montants quand elle est
servie. Les rangs de carte ne changent pas (ils restent par taille).

## 3. Pipette : trois points par bouton, trois pastilles d'une même ligne ([#420])

Le moteur sert désormais **trois sondes par bouton d'action** (`probe.<variante>.<action>`, puis `#2` et `#3`) : la
couleur d'un bouton se juge sur trois pixels que le joueur pose hors du texte. Aujourd'hui le rail les liste en trois
lignes « Fold », « Fold#2 », « Fold#3 ».

**Contrat** :

```ts
pointRank?: 1 | 2 | 3 | undefined;   // sur Probe : le rang du point dans son bouton ; absent = une sonde seule (`point` reste la position posée)
```

- Les sondes d'une même `action` et d'une même variante qui portent `pointRank` forment **une ligne** : le nom du bouton,
  puis trois pastilles (1, 2, 3), chacune avec son état et sa couleur, chacune armable pour sa pose comme une sonde
  aujourd'hui. Ni trois lignes, ni un suffixe « #2 » affiché.
- Une sonde sans `pointRank` (le pixel neutre, `bet_blur`) garde sa ligne actuelle.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le [`lint-bundle/`][bundle] à jour (`npm install`,
`npm run fix`, puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings.
Déclarez chaque point dans `parity.declaredChanges`.

[bundle]: https://github.com/mister-good-deal/claude-design-exchange/tree/main/lint-bundle
[#420]: https://gitlab.laneuville.me/rom1/tatami/-/issues/420
