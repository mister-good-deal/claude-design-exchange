# Demande Claude Design — 0.7.17 : la station 5 pose sur place, l'écran affiche ce que l'app décide

Issues d'origine : [#332](https://gitlab.laneuville.me/rom1/tatami/-/issues/332) (bloquant),
[#333](https://gitlab.laneuville.me/rom1/tatami/-/issues/333), [#330](https://gitlab.laneuville.me/rom1/tatami/-/issues/330),
[#328](https://gitlab.laneuville.me/rom1/tatami/-/issues/328), [#331](https://gitlab.laneuville.me/rom1/tatami/-/issues/331)
— campagne Windows 0.7.16 (2026-09-18), méta [#334](https://gitlab.laneuville.me/rom1/tatami/-/issues/334), lot
lt-atelier [#336](https://gitlab.laneuville.me/rom1/tatami/-/issues/336). Écrivain exchange : lt-atelier. Ce fichier ne
livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Pourquoi

Neuvième campagne arrêtée par une station. Pour poser **une** sonde `bet`, Romain a fait station 5 → 4 → 3 → 4 → 5.
Romain : « j'avais dit qu'on affichait les ROI concernées dans la station 5 et qu'on prélevait les pixels dans cette
station sur les ROI affichées, avec possibilité de reprendre un pixel ou de l'annuler. J'ai l'impression que
10 releases plus tard je suis revenu dans le passé. » Il ne veut plus voir « des captures d'autre bucket de taille ou
des ROI non à jour ou prises d'autres stations ».

La norme est désormais écrite : `doc/architecture/contrat-des-stations.md` (dépôt Tatami). Les clauses qui vous
concernent :

- **P1** — ce qui est affiché est ce qui est écrit : taille, capture et cible d'un geste sont celles que l'écran montre.
- **P2** — une donnée, une source : badge, compteur et lignes d'une taille sortent du même verdict, servi.
- **P4** — aucun retour en arrière : aucun geste ne renvoie vers une station antérieure.
- **P9** — le design system affiche, l'app décide : ce qui est posable, quelle capture atteste, quelle couleur est
  retenue, combien sont prêtes — tout cela est servi, jamais calculé dans `ui/`.

**Cette demande annule** la porte `placeable` de la 0.7.15 (#315) et le renvoi de la 0.7.16 (§1, #322). Si une
règle écrite dans un commentaire de `PipetteTool.tsx` ou `ColorSurface.tsx` la contredit, c'est cette demande qui
tient.

## 1. Station 5 : la pose se fait sur place (#332, bloquant)

| Où | Aujourd'hui | Attendu |
|---|---|---|
| `placeable()` | seule une enseigne ou une cible `retake` offre la surface | **supprimé** : toute cible sans `blocked` (§3) offre la surface et ses relevés |
| `TargetWaiting`, `handoverOf`, `goPlacePixel`, `probeWaitsRoi` | renvoi « Poser le pixel ▸ station 4 » | **supprimés** |
| `TargetView` | note `probeSettled` (« rien à poser ici ») à la place des relevés | **supprimée** : relevés et surface toujours rendus |
| `TargetNoShot`, `PresenceRail` | bouton « Aller capturer ▸ station 3 » (`onReplayStation("tour")`) | la ligne **dit** ce qui manque, **sans bouton** : la station 5 n'émet plus `onReplayStation` |
| `ActuatorRow` (`bet_blur`) | « Pointer le pixel » → `onPlacePoint` → station 4 | `bet_blur` se pose **dans la station**, sur la surface cadrée sur la barre (`zoneId: "actions"`) ; un point, pas de couleur : l'app le sert en `Probe` avec `kind: "point"` |
| « Refaire » d'un relevé | vide le slot | devient **« Reprendre »** : arme ce relevé, le clic suivant sur la surface le remplace (`onPlaceColorSample` avec le même `index`) ; `onRejectColorSample` reste l'écho de ce geste |
| — | — | **« Annuler »** par cible : `onCancelColorSample?: (sizeId: string, targetId: string) => void`. L'app retire la pose de cette taille ; la ligne rend ce qu'elle sert ensuite (couleur amorcée, ou rien) |

`onPlacePoint` quitte le contrat : plus aucun écran ne l'émet. Libellés FR/EN de « Reprendre », « Annuler », et du
`kind: "point"` (« point de défocalisation, sans couleur »). La marque « à reprendre » (`retake`) reste un **avis** sur
la ligne, jamais une condition de pose.

## 2. Le cadre est la ROI (#332, note du 18/09)

**Terrain.** 1572×1080, ROI `actions.two_buttons.fold` de 174 × 86 px, juste à un pixel près. La station annonce
« cadre 222 × 88 px » : `cropOf` ajoute `PAD_X`/`PAD_Y` en % de **fenêtre**, puis rogne par la barre ; toute la marge
tombe à droite, le bouton est collé en haut à gauche et **aucun contour ne montre la ROI**.

**Attendu, dans `ColorSurface`, vue « Bouton visé » :**

- le cadre est **centré** sur la ROI de la cible (`zoomZoneId`, ou `targetRect` d'une enseigne) ;
- la marge est **proportionnelle** à la ROI (`ring.w × MARGIN`, `ring.h × MARGIN`, sans unité) : le facteur de zoom
  est le même d'une taille à l'autre ;
- un cadre qui déborde de la capture est **translaté** dans la capture (0–100 %), jamais rogné ; la barre ne limite
  plus le cadre, elle est le contexte de la vue « ROI entière » ;
- le contour de la ROI est **toujours** dessiné et l'extérieur assombri, dans les deux vues ;
- l'en-tête dit la taille de la **ROI** avant celle du cadre : « ROI 174 × 86 px · cadre 235 × 116 px ».

## 3. Le design system affiche, l'app décide (P9)

Quatre règles de domaine quittent `ui/` ; l'app les sert.

| Donnée | Aujourd'hui (`ui/`) | Servi par l'app |
|---|---|---|
| Capture de chaque cible | `shotForVariant` → `attestingShot` (la **première** capture attestante, pas celle de la station) | `Probe.shotId?: string` : la capture de cette taille que la station 5 montre pour cette cible. `SuitSwatch.shotId` existe déjà, sans le repli `?? shotForVariant(bucket, undefined)`. `shotForVariant` quitte `PipetteTool` |
| Posable ou non | `placeable()` | `Probe.blocked?: string`, verbatim : « ROI actions.two_buttons.fold non validée pour 1048 × 720 », « aucune capture de 1048 × 720 n'atteste Deux boutons ». Présent : pas de surface, pas de bouton, la ligne le dit. Absent : la surface est offerte |
| Origine de la couleur | rien | `Probe.origin?: "posed" \| "seeded"` : **posée ici**, ou **amorcée** (déduite de la preuve du bouton, ou `bet_blur` validé d'office hors des ROI de la barre). Absent = pas de couleur. La ligne et la loupe disent l'origine |
| Couleur retenue d'une enseigne | `retainedColor` (médiane par luma dans `ui/`) | `SuitSwatch.retained?: string`, la couleur que l'app retient **sur cette taille**. `retainedColor` quitte `ui/` |

Et chaque relevé nomme ce dont il vient (#333) : `ProbeSample.sizeId: string` (obligatoire) et
`ProbeSample.zoneId?: string` (la carte d'une enseigne), à côté de `shotId`/`shotLabel`. Le slot l'affiche :
« 1048 × 720 · Board 3 · #2 Turn ». Une pose servie porte son `at` : le marqueur se dessine sur la surface.

## 4. Le bandeau est le verdict de la station (#330)

**Règle de Romain.** « Si dans la station 4 toutes les ROI d'une taille sont validées, le badge doit passer vert avec
36 / 36. La situation 36 / 36 avec un badge orange est IMPOSSIBLE. Ça n'empêche pas que pour une autre station ce
badge redevienne orange. »

**Contrat proposé.**

```ts
interface SizeVerdict {
    state: BucketState;
    done: number;
    total: number;
    lines?: { key: string; ok: boolean; reason?: string; shotId?: string; shotLabel?: string }[];
}
// SizeBucket
verdict?: SizeVerdict;   // le verdict de la station AFFICHÉE, servi tel quel
```

- `BucketRail` (stations 3, 4, 5) et la ligne de taille de la station 6 rendent **badge et compteur depuis `verdict`
  seul** : ton du badge par `verdict.state`, méta « `done` / `total` » suivie du mot de la station (variantes
  attestées, ROI validées, couleurs prêtes, passes vertes). Plus de texte composé depuis des champs différents selon
  la station.
- `zonesValidated`, `zonesTotal`, `probesReady`, `probesTotal` quittent le bandeau ; `state` ne sert plus au badge.
  `verdict` absent : la carte dit « verdict non servi », jamais un repli.
- L'en-tête du canevas de la station 4 lit le même `verdict`.

## 5. Station 4 : un refus se voit, une chute s'annonce (#328, #331)

- **Ligne de ROI refusée (#328).** Une ROI dont la ligne de `verdict.lines` porte `ok: false` n'est **pas** cochée,
  même si `zoneStates` la dit `adjusted` (qui ne sert plus qu'au dessin). La ligne porte `reason` verbatim
  (« faits d'origine périmés »), le `shotLabel` de la capture refusée, et le geste qui la répare : « Revalider sur
  cette capture » → `onConfirmZone(sizeId, zoneId)`, sur la capture affichée.
- **Chute annoncée (#331).** `WizardState.collateral?: { sizeLabel: string; zoneLabel: string; reason: string }[]` :
  ce que la dernière écriture a fait tomber. Présent et non vide : une note en tête de la station les énumère
  verbatim (« Ce réglage a dévalidé 7 zones de 1920 × 720 : Board 1… »). L'app cesse de la servir au geste suivant ;
  aucun callback.
- **La sous-ROI de rang est de la taille (#331, ajout du 18/09).** `onSetCardRankSubRoi?: (sizeId: string, family:
  CardFamily, rect: CardRankSubRoi) => void`, comme `onSetCardTemplate(sizeId, …)` : le geste reçoit la taille que la
  vignette règle, l'app ne la lit plus dans un état ambiant. La mention « bucket-independent » du contrat tombe.

## 6. L'état local ne survit pas à sa taille ni à sa cible

**Règle (contrat, « Le contexte de station »).** Tout état d'interface transitoire porte la clé sous laquelle il a été
produit et n'est lu que sous cette clé. C'est la comparaison au rendu qui le garantit, pas un effacement programmé. Le
motif existe déjà chez vous : `ZoneWorkbench.hiddenShotId`, `PipelineTool.wanted.ctx`, `TourStation.pending`.

| Composant | État | Clé à estampiller |
|---|---|---|
| `ColorSurface` | `view`, `zoom`, le relevé armé par « Reprendre » | (taille, capture, cible) |
| `CardTemplateTool` | `Stage.grip`/`draft`, `slotId` du réducteur | (taille, famille) |
| `ZoneWorkbench` | `zoneId`, `selected`, `pointId` | taille |
| `BucketRail` / `PurgeControl` | `armed` | taille |

Changer de taille, de capture ou de cible ne montre donc rien de l'ancienne, pas même une image.

## Fixtures

- Station 5 : une cible **posée ici** (relevé servi avec `at`, `origin: "posed"`), une **amorcée**
  (`origin: "seeded"`, surface offerte), une `blocked` « ROI non validée », une `blocked` « aucune capture »,
  `bet_blur` en `kind: "point"`, une enseigne à trois relevés et sa couleur `retained`.
- Station 5 : un cadre de bouton au bord droit de la barre (le cas du terrain), pour que le centrage se voie.
- Bandeau : une taille verte `36 / 36` en station 4 et orange `8 / 12` en station 5 ; une taille sans `verdict`.
- Station 4 : une ROI `adjusted` dont la ligne est refusée (« faits d'origine périmés ») ; une note `collateral`.
