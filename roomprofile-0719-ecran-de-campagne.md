# Demande Claude Design — 0.7.19 : l'écran d'une campagne qui s'enchaîne

Lot lt-atelier [#436](https://gitlab.laneuville.me/rom1/tatami/-/issues/436). Écrivain exchange : lt-atelier. Source : la
campagne Windows du 2026-09-22 (0.7.18), **interrompue par les bandeaux** — « c'est trop pénible, j'attendrai le fix des
alertes ». La prochaine campagne recalibre sept tailles sur une géométrie neuve : des centaines de glissés de ROI.
**Cinq points, rien d'autre.** Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

Norme : `doc/architecture/contrat-des-stations.md` — **P2** (une donnée, une source), **P5** (un geste qui fait tomber
une zone le dit), **P7** (une mutation rend ce qu'elle a changé), **P9** (le design system affiche, l'app décide).

## 1. Aucun retour de geste ne s'empile : il se lit dans la carte de SA taille ([#428], [#433])

**Terrain.** Station 4, 1048 × 720 : revalider « Pot total » récolte 15 captures → **15 lignes vertes** sous « 15 TAILLES
RÉCOLTÉES », l'outil repoussé hors écran. Sur 1600 × 600, **chaque glissé** de ROI de carte en rajoute une pile (le
commit de géométrie récolte aussi). Un seed fait tomber 8 zones → **huit boîtes rouges** en bande horizontale, et le
titre « Ce réglage a dévalidé 8 zones : » s'imprime par-dessus la première.

**Décision de Romain (22/09)** : « je ne veux pas de 15 notifications stackées en colonnes […] À la limite une seule
notif et fermable ; et encore je peux m'en passer. » Règle générale : **aucun retour de geste ne s'empile en colonne
dans une station.** On retient **zéro notification**.

**Attendu, contrat.**

- `CollateralNote`, `HarvestNote` (station 4) et `HarvestList` (station 5) **disparaissent**, avec les props
  `ZoneWorkbench.collateral`, `ZoneWorkbench.harvest`, le type `StationHarvestRow`, `ExtractReport.harvest` et
  `HarvestRow`. Plus rien ne grandit avec le nombre d'entrées.
- Le retour d'un geste se lit **dans la carte de la taille concernée**, dans le bandeau des tailles (`BucketRail`, le
  même en stations 3, 4 et 5) :

  ```ts
  /** Ce que le DERNIER geste a fait à cette taille, en une phrase servie. Absent : rien. */
  lastGesture?: { tone: "act" | "warn"; text: string } | undefined;   // sur SizeBucket
  ```

  Une ligne sous `meta`, rendue **verbatim**, ton `act` (vert, fait acquis) ou `warn` (ambre, reste à faire) — jamais
  rouge : le geste a réussi. Exemples de phrases que l'app servira : « 15 captures récoltées », « 8 zones dévalidées —
  voir la liste des ROI », « 6 récoltées · à corriger : #41 · River ». Une ligne, jamais deux : trop longue, elle
  s'ellipse et garde son texte entier en `title`. La carte ne change pas de largeur.
- Le détail par zone reste où il est déjà : la liste des ROI de gauche porte l'état de chaque zone. Le motif d'une
  capture à corriger reste où la capture parle (`segmentMismatch`, station 5).
- Rien à fermer : l'app cesse de servir la phrase au geste suivant.

## 2. Station 5 : « Scinder » et « Fusionner » une découpe ([#430])

**Terrain.** `villain_1_bet`, capture « #41 · River », vérité « 7,2BB » : un liseré d'un pixel soude le 7 et la virgule,
4 segments pour 5 glyphes. À l'inverse, le pot « 4,8BB » de « #45 · Flop » en 698 × 720 sort en 6 segments pour 5. Le
moteur dit « corriger la découpe » ; la station n'offre qu'« écarter », qui retranche.

**Attendu, contrat** (des OFFRES : sans handler, rien n'est rendu) :

```ts
/** Coupe le segment `index` à `at` ∈ ]0, 1[ de sa largeur affichée (0 = bord gauche). */
onSplitSegment?: (shotId: string, zoneId: string, index: number, at: number) => void;
/** Fusionne le segment `index` avec le suivant (`index + 1`). */
onJoinSegments?: (shotId: string, zoneId: string, index: number) => void;
/** Défait une correction du joueur, désignée par son id servi. */
onUndoCutEdit?: (shotId: string, zoneId: string, editId: string) => void;
```

et sur `GlyphSegment` : `edits?: readonly { id: string; kind: "split" | "join"; at: number }[]` — servi : les
corrections du JOUEUR qui tombent dans ce segment ou sur son bord gauche, `at` ∈ [0, 1] de sa largeur.

- Deux boutons sur la ligne du crop, « Scinder » et « Fusionner », qui **arment** leur geste ; `Échap` désarme ; un
  geste posé désarme. Armé « Scinder » : un trait vertical suit le pointeur dans les segments, le clic coupe à la
  position cliquée. Armé « Fusionner » : les jonctions entre deux segments voisins deviennent les cibles, le clic
  fusionne les deux. Hors de ces modes, le clic d'un segment reste « écarter / reprendre », inchangé.
- Offerts seulement sur un crop `ready`, ROI non écartée — les mêmes conditions que l'écartement.
- Une correction posée se voit (un repère à sa position, d'un ton distinct de celui d'un segment écarté) et se défait
  depuis ce repère par `onUndoCutEdit`.
- Aucune découpe calculée à l'écran : elle revient du moteur, l'écran la redessine.

## 3. Couverture glyphes : plus aucun nombre qui unit deux paquets ([#432])

**Terrain.** Panneau « Vérification », 1920 × 720 : titre « 25 / 25 codes », famille « MONTANTS 12 / 12 » avec une
pastille « 7 ×1 »… au-dessus de « FIN MONTANTS 10 / 12 — manquants : 7 · 9 » et de « Écrire refusera ce bucket ».

**Attendu.**

- Le titre perd son compte : `glyphCoverageTitle(size)` → « Couverture glyphes — 1920 × 720 ». Les comptes sont ceux
  des lignes de paquet (`PackSummary`), servis.
- En vue « Tous », une famille dont les codes sont rangés dans des paquets nommés se rend **en une section par
  paquet** — la section même qu'on obtient en choisissant ce paquet dans le filtre (son compte, ses pastilles), dans
  l'ordre servi. Aucune section, aucune pastille ne somme deux paquets.

## 4. Station 5 : « découpé » n'est pas « écrit », et le geste qui répare se nomme ([#431])

**Terrain.** 1920 × 720, `pot` de « #41 · River » : l'écran montre le 7 découpé et nommé pendant que la couverture le
dit manquant. Les deux disent vrai — il est à l'écran, il n'est pas écrit — mais rien ne porte la différence.

**Attendu, contrat** :

- `GlyphSegment.written?: boolean` — servi : vrai quand le gabarit de ce segment est écrit au profil. Un segment écrit
  porte une marque discrète (coin, point) ; un segment non écrit reste tel quel. L'écran ne déduit rien.
- `GlyphTruth.harvestGap?: string` — la phrase servie qui dit, pour CETTE ROI sur CETTE capture, pourquoi rien n'est
  écrit et le geste qui répare (« vérité saisie, découpe juste, rien d'écrit : Relancer l'extraction »). Rendue
  verbatim dans la boîte de la ROI, à la place où parle `segmentMismatch`. Absente : rien.

## 5. Géométries : l'état de la géométrie active se lit ([#435], [#268])

**Terrain.** Le 22/09, la table Unibet a perdu sa bande réglementaire : tout le contenu a remonté de 57 px. Romain :
« comme je n'avais pas encore clôturé la géométrie en cours ça m'a un peu perdu ». Il manquait un « avant » net.

**Attendu, contrat** : `GeometryState.validatedAt?: string`, servi. La ligne d'état du `GeometryPanel` dit les deux
dates : « Déclarée le … · Validée le … », ou « Déclarée le … · Jamais validée » quand le champ est absent. Rien d'autre
ne bouge dans le panneau.

## Hors de ce drop

- [#429] (« 1 · , · 5 · BB · BB ») : c'est un libellé de l'app (`Unit` → « B »), livré sans vous.
- [#297] (sizing par position) : l'itération que Romain mène avec vous continue hors de ce fichier.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le [`lint-bundle/`][bundle] à jour (`npm install`,
`npm run fix`, puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings.
Déclarez chaque point dans `parity.declaredChanges`.

[bundle]: https://github.com/mister-good-deal/claude-design-exchange/tree/main/lint-bundle
[#268]: https://gitlab.laneuville.me/rom1/tatami/-/issues/268
[#297]: https://gitlab.laneuville.me/rom1/tatami/-/issues/297
[#428]: https://gitlab.laneuville.me/rom1/tatami/-/issues/428
[#429]: https://gitlab.laneuville.me/rom1/tatami/-/issues/429
[#430]: https://gitlab.laneuville.me/rom1/tatami/-/issues/430
[#431]: https://gitlab.laneuville.me/rom1/tatami/-/issues/431
[#432]: https://gitlab.laneuville.me/rom1/tatami/-/issues/432
[#433]: https://gitlab.laneuville.me/rom1/tatami/-/issues/433
[#435]: https://gitlab.laneuville.me/rom1/tatami/-/issues/435
