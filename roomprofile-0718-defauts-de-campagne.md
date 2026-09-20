# Demande Claude Design — 0.7.18 : les huit défauts d'écran de la campagne du 20/09

Lot lt-atelier [#409](https://gitlab.laneuville.me/rom1/tatami/-/issues/409). Écrivain exchange : lt-atelier.
Source : campagne Windows 0.7.17 du 2026-09-20 (`recon/win-validation-2026-09-20/REPORT.md`) — la première qui va
jusqu'au dry-run complet, arrêtée avant « Écrire ». **Huit points, rien d'autre** : ne rien changer d'autre dans le
drop. Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

La norme reste `doc/architecture/contrat-des-stations.md`. Les clauses qui portent cette vague :

- **P2** — une donnée, une source : badge, compteur et lignes d'une taille sortent du même verdict, servi.
- **P9** — le design system affiche, l'app décide : aucun total, aucun minimum, aucun verdict calculé dans `ui/`.
- **« Ce qui est affiché est ce qui est écrit »** : un contour qui ne tombe pas sur ses pixels est un mensonge d'écran.

## 1. `ColorSurface` : l'image est calée sur ses deux axes ([#400](https://gitlab.laneuville.me/rom1/tatami/-/issues/400))

**Terrain.** Station 5, 1572 × 1080, cible « Fold », capture #41. En vue **« ROI entière »**, le contour de la ROI est
juste (y 1,2 → 86,8 dans un cadre de 88 px, comme le profil) et **l'image est 10 px plus bas**, base rognée. En vue
« Bouton visé », rien ne se voit.

**Cause.** `cropVars` (`ColorSurface.tsx:92`) ne cale l'image qu'en **largeur** (`--iw`), et `.surfaceImg`
(`RoomProfile.module.css:3192`) n'a pas de hauteur : celle-ci sort du ratio **intrinsèque** de l'image. Le cadre, lui,
tient son ratio de `--ar = px.w / px.h`, **arrondi à l'entier** (`537 / 88` pour un crop réel de 537,35 × 87,99). Les
deux ne coïncident que par chance, et `--iy` multiplie l'écart par `crop.top / crop.h` — ici **11**. Une barre
d'action en bas de fenêtre est le pire cas ; la vue centrée sur la ROI a un multiplicateur proche de 1.

**Attendu.** Le décalage de l'image ne dépend plus d'un accord de ratios : `cropVars` sert aussi
`--ih = 10000 / crop.h`, et `.surfaceImg` prend `height: calc(var(--ih) * 1%)`. Contour et contenu coïncident dans les
deux vues, quelle que soit la position de la ROI dans la fenêtre.

**Même mécanisme, même correction** : `AssetFrame.tsx:54` (`cropVars`) et `.pipeSrcImg`
(`RoomProfile.module.css:3581`) portent le même calage en largeur seule — l'outil glyphes y montre ses crops.

## 2. `.segment` : une barre qui traverse l'écran ([#402](https://gitlab.laneuville.me/rom1/tatami/-/issues/402))

**Terrain.** 698 × 720, capture #39 · Flop, onglet Glyphes. Romain écarte la ROI du pot ; **une ligne ocre continue
traverse l'écran en diagonale**, du panneau d'extraction au panneau de couverture, par-dessus les cartes et le bouton
« Ouvrir l'atelier » — 1 280 px mesurés, de (45, 803) à (673, 500).

**Cause.** `.segment[data-off="true"]::after` (`RoomProfile.module.css:2053`) est la barre du segment écarté :
`position: absolute; left: -3px; right: -3px; top: 50%; border-top: 2px solid var(--warn-text);
transform: rotate(-22deg)`. Or `.segment` (`:2013`) **n'est pas positionné** : la barre s'ancre au premier ancêtre
positionné — un panneau — et prend sa largeur, tournée de 22°. Écarter la ROI passe ses segments à `off` et allume la
barre.

**Attendu.** `.segment { position: relative }`. La barre tombe sur SON segment, 18 px de large, et rien ne se dessine
hors de sa carte. (À vérifier une fois posé : aucune autre `::after` absolue du module n'est ancrée par accident — le
défaut est invisible tant que le segment n'est pas écarté.)

## 3. `DryRunRow` : l'action reste dans la colonne ([#405](https://gitlab.laneuville.me/rom1/tatami/-/issues/405) point 2)

**Terrain.** Station 6, panneau « Dry-runs — Persistés avec les shots ». Les boutons « Dry-run » sont **hors du cadre
visible** ; il faut défiler horizontalement pour les atteindre — et, une fois défilé, les libellés de taille sont
tronqués (« 1080 », « 720 »). Romain a cru le bouton cassé : ses premiers clics ne tombaient sur rien.

**Cause.** `.line` (`RoomProfile.module.css:.line`) est une rangée flex sans repli, et `DryRunRow`
(`ValidateStation.tsx:313`) y met cinq enfants : taille, compte, badge, date, bouton. Aucun ne peut rétrécir sous son
contenu (`min-width: auto`) : la rangée déborde la colonne.

**Attendu.** Rien d'actionnable ne dépend d'un défilement horizontal, dans aucun panneau du Room Profile. Le bouton de
la ligne est toujours visible dans la colonne, et le libellé de la taille n'est jamais tronqué : c'est au reste (date,
compte) de se replier ou de passer à la ligne. Gate : le panneau rendu à 1440 × 720, colonne de droite, bouton dans le
cadre.

## 4. Couverture : une ligne par style de glyphes ([#404](https://gitlab.laneuville.me/rom1/tatami/-/issues/404))

**Terrain.** L'écran annonce « 12 / 12 » sur les montants d'une taille dont le paquet **fin** est à 9 / 12 : un code
récolté en **gras** masque son absence en **fin**. Le détail, lui, dit vrai (« FIN MONTANTS 3 / 12 codes · INCOMPLET »).
Conséquence : un pot portant un 7 ou un 9 ne se lit pas alors que la taille est annoncée complète.

**Décision de Romain** : **un détail par style — ni un total, ni un minimum.**

**Attendu, contrat** (`BucketGlyphCoverage`, `BucketGlyphTotal`, rendus par `BucketCoverage.tsx`) :

- une `BucketGlyphCoverage` porte un `packLabel?: string` servi : le grain d'une ligne devient (famille, style), et
  l'app sert autant de lignes qu'elle en a — l'écran les rend **dans l'ordre servi**, sans en fusionner deux ;
- `BucketGlyphTotal.covered` et `required` deviennent **optionnels** : absents, la tête de la ligne ne montre que le
  libellé de la taille et son badge d'état. Le compte d'une famille à plusieurs styles n'est plus composé au-dessus
  de ses lignes.
- `state` et `missing` restent servis et rendus verbatim, comme aujourd'hui.

Gate : une taille dont un style est incomplet ne peut afficher aucun compte qui contredise ses lignes.

## 5. Dry-run : l'ambre a son état ([#373](https://gitlab.laneuville.me/rom1/tatami/-/issues/373), [#388](https://gitlab.laneuville.me/rom1/tatami/-/issues/388))

Le moteur juge désormais chaque lecture contre la vérité saisie de sa capture. Une lecture sans vérité est **« lue,
non vérifiée »** : ni verte, ni rouge. Le dry-run du terrain rend par exemple, à 1920 × 720, « 6 ok · 1 abstention ·
2 non vérifiées ».

**Attendu :**

- `DryRunZone["verdict"]` gagne `"unverified"`, avec son ton (ambre, ni `act` ni `alert`) et son mot FR/EN dans
  `dryVerdict` (« non vérifiée » / « unverified ») ;
- la ligne d'une passe distingue **vert** et **ambre** : l'app sert les deux nombres, l'écran les rend côte à côte et
  n'additionne rien. Aujourd'hui `dryRunLabel` (`ValidateStation.tsx:25`) rend `passed/total`, et une ligne ambre
  compte dans `passed` — « 7 / 7 » avec deux lignes ambres dessous ;
- l'état de la passe (verte ou non) reste **servi** (`DryRun.state`) : l'écran ne le recompose pas.

## 6. `TruthComposer` : ⌫ ôte un glyphe, pas un caractère

Trouvé par la gate e2e des montants sur le transcript du vrai moteur. `TruthComposer.tsx:234` fait
`onChange(value.slice(0, -1))` : sur « 1,5BB », ⌫ rend **« 1,5B »** — une vérité qu'aucun gabarit ne peut former,
puisque `BB` est **un seul code** `Unit` du catalogue servi.

**Attendu.** ⌫ retire la dernière **touche composée** (le dernier `k.label` ajouté), jamais un caractère : un code de
deux caractères s'ôte d'un coup. La valeur reste une chaîne au contrat ; c'est la composition qui se souvient de ses
touches, ou la touche la plus longue du catalogue qui termine la valeur qui est retirée.

## 7. `GlyphTruth.verifiedOn` : le compte des **autres** captures ([#397](https://gitlab.laneuville.me/rom1/tatami/-/issues/397))

Le DS écrit « valeur relue sur N **autres** shots ✓ » (`glyphDryRun`), et `verifiedOn` reçoit aujourd'hui le total de
la relecture, **capture saisie comprise** : « 3 autres shots » pour 2. La correction est app-side ; ce qu'on vous
demande est **une ligne de contrat** : documenter `verifiedOn` comme le nombre de captures **autres que celle où la
vérité a été saisie**. Aucun markup ne bouge.

## 8. La récolte est automatique : nommer la taille « à corriger » ([#368](https://gitlab.laneuville.me/rom1/tatami/-/issues/368))

**Décision de Romain (20/09)** : la récolte d'une vérité héritée devient **automatique** — pour les cartes, et pour les
glyphes tant que la découpe rend le même nombre de segments. Le geste manuel devient **l'exception signalée**. Elle
vaut aussi quand une taille devient bonne : une taille seedée puis calibrée récolte seule, sans retaper une vérité.
Romain : « je m'attends à ce que tout se propage automatiquement quand les ROI seront bonnes ».

Côté écran, la récolte cesse donc d'être un bouton. Il reste **une chose à montrer** : ce que la propagation a rendu.

**Attendu.** `ExtractReport` (rendu par `ExtractionFailure`, `GlyphTool.tsx:556`) gagne un bloc servi, indépendant de
l'échec :

```ts
/** Ce que la récolte automatique a rendu, taille par taille — servi, rendu verbatim, jamais composé. */
harvest?: readonly { sizeId: string; label: string; state: "harvested" | "toFix"; detail?: string }[] | undefined;
```

rendu en liste sous le panneau d'extraction : une ligne verte par taille récoltée, une ligne **ambre « à corriger »**
par taille où la découpe n'a pas rendu le même nombre de segments, avec son `detail` servi (« 6 segments contre 5 »).
Absent ou vide : rien n'est rendu, comme aujourd'hui.

Le bouton « Relancer l'extraction » (`t.extractRetry`) **reste**, et redevient ce qu'il dit : la passe de découpe de
la capture affichée. Il ne récolte plus rien de lui-même.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le [`lint-bundle/`][bundle] à jour (`npm install`,
`npm run fix`, puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings.

[bundle]: https://github.com/mister-good-deal/claude-design-exchange/tree/main/lint-bundle
