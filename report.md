# Vague 0.6.12 — Tatami app → Claude Design (2026-08-30)

Retours de la campagne de validation Windows 0.6.11 (session 2026-08-30, from scratch, layout à deux tailles). Deux
demandes, compilées par le coordinateur ; le contrat DS ne bouge que par l'ajout d'une variante de `BucketState`.
Le rapport de gate du drop précédent est clos (drop `.4` intégré en v0.6.11).

| # | Demande | Issue | Nature |
|---|---|---|---|
| 1 | Station 4 : badge de bucket « à calibrer » (orange) avec `k / N ROI placées`, le rouge « périmé » rendu au périmé réel | #109 | `BucketState` gagne `toCalibrate` ; l'app sert déjà `zonesPlaced` / `zonesTotal` |
| 2 | Station 4 : désélectionner une ROI — re-clic sur la ligne sélectionnée = bascule, `Échap`, clic sur le fond du canvas | #110 | tout dans `ZoneWorkbench` (la sélection est un état local du DS) ; le test container app est posé en `it.fails` |

Non demandé, pour information : #111 (image du bucket 698×720 étirée au terrain) — deux passes de mesure côté app n'ont
rien reproduit (le cadre suit `--ar`, l'image suit le bucket) ; la cause se cherche au terrain, rien à changer côté DS.

Le drop se valide comme d'habitude : `pnpm import-ds <zip>` → lint:fix → tsc + react-doctor (bundle de lint inchangé ;
`@stylistic/multiline-ternary` reste actif) ; un rouge d'import revient ici en rapport de gate.

---

# Tatami app → Claude Design — le badge d'un bucket : « à calibrer » avec son avancement, et le rouge rendu au périmé

Campagne de validation Windows 0.6.11 (session 2026-08-30, branche `windows/validation-0.6.11`), station 4.
Suivi côté app par l'issue #109. Le DTO est déjà servi ; il ne manque que le badge.

## Ce que le terrain a vécu

À l'ouverture de la station sur un profil VIERGE, les deux tailles du layout accueillent le joueur en rouge :

```
1048 × 720   PÉRIMÉ    aucune géométrie calibrée — seed par projection disponible
 698 × 720   PÉRIMÉ    aucune géométrie calibrée — seed par projection disponible
```

Verdict de Romain : « ce qui est complètement faux ». Un bucket jamais calibré n'a rien à périmer. Puis, au fur et
à mesure qu'il posait ses ROI, le premier a basculé d'un coup en `CALIBRÉ · 7 shots` — sans que rien, entre les
deux, n'ait jamais dit ce qu'il restait à poser.

Coût de signal, le même que #98 et #101 relevés la même campagne : deux bandeaux d'alerte sur un profil qu'on
vient de créer, c'est une couleur qu'on apprend à ne plus lire.

## Les cinq états, et ce que chacun dit

| `SizeBucket.state` | teinte | libellé | sous-titre |
|---|---|---|---|
| `calibrated` | vert | calibré | `N shots` *(inchangé)* |
| `seeded` | orange | seedé | `projeté depuis <bucket>` *(inchangé)* |
| **`toCalibrate`** *(nouveau)* | **orange** | **à calibrer** | **`k / N ROI placées`** |
| `stale` | rouge | périmé | son motif réel, servi par l'app *(inchangé, mais plus jamais émis pour un bucket neuf)* |
| `tombstone` | neutre | tombstone | `plus produite par aucun layout — purge possible` *(inchangé)* |

`toCalibrate` couvre les deux moments d'un bucket qui n'est pas fini : aucune géométrie (`0 / N`) et géométrie
partielle (`k / N`). Le vert reste réservé au moment où tout est posé. Le rouge redevient ce qu'il n'aurait jamais
dû cesser d'être : une géométrie devenue obsolète, avec sa cause.

## Ce que le contrat demande

Dans `apps/web/src/ui/screens/RoomProfile.fixtures.ts` :

```ts
export type BucketState = "calibrated" | "seeded" | "toCalibrate" | "stale" | "tombstone";
```

Dans `apps/web/src/ui/screens/AdjustStation.tsx`, la table des teintes gagne son entrée :

```ts
const BUCKET_TONE: Record<string, "act" | "warn" | "alert" | "neutral"> = {
    calibrated: "act",
    seeded: "warn",
    toCalibrate: "warn",
    stale: "alert",
    tombstone: "neutral"
};
```

Dans `apps/web/src/ui/screens/i18n.ts`, `roomProfileV3.bucketState` gagne `toCalibrate` : « à calibrer » (fr),
« to calibrate » (en).

Le sous-titre de la card vient de `bucketMeta(bucket, seeded)`, qui préfère déjà `bucket.note` : **rien à changer
là non plus si le DS s'en tient au `note`**, que l'app remplit en `k / N ROI placées` pour ce seul état. Si le DS
préfère composer le sous-titre lui-même (mise en forme du chiffre, alignement), il peut lire deux champs déjà
servis par le contrat backend et que l'app est prête à recopier dans `SizeBucket` :

```ts
/** #109 — les ROI du catalogue que ce bucket a posées, sur celles qu'il a à poser. */
zonesPlaced?: number | undefined;
zonesTotal?: number | undefined;
```

Dis-nous laquelle des deux formes tu prends ; l'app suit.

## Ce qui est déjà livré côté app (drop non bloquant)

- Le backend sert l'état honnête : `BucketStateDto::ToCalibrate` remplace le `stale` de complaisance d'un bucket
  jamais calibré, et `VIRGIN_BUCKET_NOTE` (« aucune géométrie calibrée — seed par projection disponible ») est
  **supprimé** : il n'apprenait rien que le bouton « Seeder depuis le bucket le plus proche », déjà sur la card,
  ne dise mieux.
- Le backend sert le compte : `SizeBucketDto.zonesPlaced` / `zonesTotal`, sur la même règle que le rail (sondes
  exclues, vocabulaire d'action plat OU scopé selon le bucket, clés `pos` hors catalogue comptées).
- Le container écrit `k / N ROI placées` dans le `note` de ce seul état, compté sur la géométrie LOCALE : le
  chiffre bouge à chaque ROI posée, avant même que le commit debouncé ne parte.
- **En attendant ce drop**, `toCalibrate` est projeté sur la teinte de `stale` (le container ne peut pas servir
  une valeur que le type DS ne porte pas). Le mot reste donc faux ; le chiffre en dessous le contredit déjà. Le
  jour du drop, c'est une ligne à changer dans `DS_BUCKET_STATE` (`RoomProfileContainer.tsx`).

## Côté app : les tests sont écrits, et ils sont verts

`premierLancement.test.tsx` — « #109 — un bucket jamais calibré est « à calibrer » et son avancement k/N est celui
du rail » : sur la charge du VRAI backend, l'état est `toCalibrate`, le motif a disparu, et le compte du DTO est
asserté contre le total que la scène annonce elle-même (`zones : N · ajustées k`) ET contre le sous-titre du rail.
C'est la gate anti-divergence du compte : deux expressions d'une même règle, et #99 a déjà montré ce qu'il en
coûte quand elles s'écartent.

## Critère de fermeture (terrain)

À l'ouverture de la station 4 sur un profil neuf : aucun bandeau rouge, deux cards orange « à calibrer » qui
disent `0 / N ROI placées`, un chiffre qui monte à chaque ROI posée, et le vert « calibrée » seulement quand tout
est posé. Verdict rendu par Romain sur la prochaine campagne Windows.

---

# Tatami app → Claude Design — désélectionner une ROI : le re-clic, `Échap`, le fond du canvas

Campagne de validation Windows 0.6.11 (session 2026-08-30, branche `windows/validation-0.6.11`), station 4.
Suivi côté app par l'issue #110. La sélection vit ENTIÈREMENT dans `ZoneWorkbench` : l'app n'a aucun canal pour
la rendre à `null`, ce correctif est tout entier chez toi.

## Ce que le terrain a vécu

> « Impossible de désélectionner une ROI : quand on re-clique dessus dans le menu de gauche où elle est en
> surbrillance, ça ne la désélectionne pas. Donc impossible de revenir aux raccourcis clavier pour défiler les
> screenshots. »

## La conséquence dépasse la gêne

`ZoneWorkbench` arme le pas-à-pas des captures HORS sélection seulement — c'est l'arbitrage de #97, et il est le
bon : ← / → affinent la ROI sélectionnée au pixel, et une correction qui saute de capture est du travail perdu.

```tsx
const stepArmed = ui.zoneId === null && ui.pointId === null;
```

Sans moyen de revenir à `zoneId === null`, la première sélection de la session confisque définitivement le
pas-à-pas que le joueur venait de valider en station 3. La sélection est un piège sans sortie.

## La cause, dans le composant

`selectZone` (`apps/web/src/ui/screens/ZoneWorkbench.tsx`) POSE l'id, il ne bascule jamais :

```tsx
const selectZone = (id: string | null) => {
    dispatch({ type: "selectZone", id });
    …
};
```

et `ZoneRail` appelle `onSelect(zone.id)` sur chaque ligne, y compris celle déjà en surbrillance. Le réducteur,
lui, sait déjà écrire `null` (`case "selectZone": return { ...ui, zoneId: action.id, … }`) — c'est l'appelant qui
ne le lui demande jamais.

## Ce que le drop doit rendre vrai

Trois portes de sortie, les trois attendues par habitude :

1. **Re-clic sur la ligne sélectionnée = bascule.** Dans `selectZone`, `id === ui.zoneId ? null : id`. Le
   `ZoneRail` n'a rien à changer : c'est l'appelant qui décide. Même chose pour un pixel de référence
   (`pickPoint`) — le rail des sondes a exactement le même piège, et `stepArmed` regarde aussi `ui.pointId`.
2. **`Échap` désélectionne.** Dans le `useEffect` de raccourcis qui porte déjà ← / →, une branche
   `e.key === "Escape"` qui dispatch `selectZone: null` ET `selectPoint: null`, sous la même garde
   `isFormField(e.target)` (un `Échap` dans un champ de saisie appartient au champ). Elle doit vivre HORS de la
   garde `stepArmed`, qui n'est vraie que quand rien n'est sélectionné.
3. **Clic sur le fond du canvas, hors de toute ROI, = désélection.** Sur la scène (`CalibrationCanvas`), un
   pointerdown dont la cible est la scène elle-même ou la `PanSurface` — jamais une `RoiBox`, jamais une poignée,
   jamais un point — appelle `on.onSelectZone?.(null)`. À ne pas confondre avec le geste de pose d'un pixel armé
   (`placeOnStage`), qui a sa propre surface et doit rester prioritaire.

L'écran doit revenir à son repos nommé : « Sélectionnez une zone sur le canvas pour l'inspecter et l'ajuster. »
(`ZoneWorkbench`, `t.noZone`), et ← / → doivent redéfiler les captures.

## Côté app : le test est écrit, il est rouge

`apps/web/src/app/screens/RoomProfile.test.tsx` — « station 4 : re-cliquer la ligne sélectionnée désélectionne, et
les flèches redéfilent les captures (#110) » : il prouve d'abord que les flèches défilent bien hors sélection,
sélectionne `pot` au rail, re-clique la même ligne, et exige le repos nommé puis le retour du pas-à-pas. Il
échoue aujourd'hui exactement sur l'assertion utile — le repos n'est pas revenu. Il est porté par `it.fails` :
vert tant que le drop n'est pas là, et il SE PLAINT le jour où il passe, ce qui est le signal de retirer le
`.fails`. Aucune gate rouge laissée à plaider.

## Critère de fermeture (terrain)

En station 4 : re-cliquer la ROI en surbrillance la désélectionne, `Échap` fait le même service, un clic sur le
feutre hors ROI aussi — et dans les trois cas ← / → redéfilent les captures. Verdict rendu par Romain sur la
prochaine campagne Windows.

---

