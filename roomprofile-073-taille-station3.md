# Demande durable — 0.7.3 : station 3, choisir la taille sur place, et voir les captures de chaque taille

Vague Claude Design de la **0.7.3** — les retours de la campagne Windows 0.7.1 (issue #220, méta #34). Cette
demande est celle de l'issue **#215** : le sélecteur de taille de la station 4 doit être disponible à la station 3,
avec l'indication des captures existantes par taille.

## 1. Ce que le joueur voit

La station 3 montre les captures du bucket courant et ne permet pas d'en changer. Romain, campagne 0.7.1 :

> « en station 3 ça serait bien de pouvoir choisir la résolution de la capture et de l'afficher (donc 2 résolutions
> dans mon cas) ; là je suis obligé d'aller en station 4 pour changer le bucket et revenir à la station 3 pour y
> voir les captures de cette résolution. »

Le geste est fréquent : les attestations se posent par bucket, et un profil terrain en a onze à cocher par bucket,
plus deux captures par état pour chaque présence. L'aller-retour par la station 4 est un détour pur.

Deuxième moitié du constat : **les buckets ne portent pas les mêmes prises**. Sur le profil terrain, la prise #9
(élimination) n'existe qu'en 1048×720 et la #7 qu'en 698×720 — et rien à l'écran ne le dit.

## 2. Ce qu'on demande à Claude Design

### 2.1 Le même contrôle, au même endroit

Le sélecteur existe déjà : c'est le bandeau `BucketRail` en tête de la station 4
(`apps/web/src/ui/screens/AdjustStation.tsx`, chapeau `t.bucketsEyebrow` — « Taille de fenêtre en calibration »),
une carte par bucket avec ses dimensions, son badge d'état et sa ligne de méta. **Le même composant, à la même
place** — en tête de la station 3, au-dessus du moniteur.

Ce qui NE le suit pas à la station 3 : le bouton de seed (`onSeedFromNearest`) et la purge d'un tombstone
(`onPurgeBucket`). Ce sont des gestes de géométrie, ils appartiennent à l'établi. La station 3 ne fait que
DÉSIGNER une taille.

### 2.2 À la station 3, changer de taille redimensionne la vraie fenêtre

C'est la différence de fond avec la station 4, et elle a trois conséquences que l'écran doit rendre :

- Le geste voyage sur **`onTourSize(sizeId)`**, pas sur `onSelectSize` : à la station 3 le bucket courant est celui
  du TOUR (`tour.sizeId`, projeté par l'événement `calibration-state`), et en changer redimensionne la table du
  joueur puis relit ses captures. `onSelectSize` ne déplace que le bucket regardé par l'écran.
- Le contrôle est **désactivé à froid**, exactement comme le bouton de capture : sans fenêtre détectée
  (`tour.window === null` ou `data.tourOpenable === false`), il n'y a rien à redimensionner. La bannière froide
  déjà rendue (`t.tourCaptureCold`) suffit à dire pourquoi ; aucune phrase de plus.
- Un bucket **`tombstone` est rendu DÉSACTIVÉ**, avec son `note`, jamais retiré de la liste : le tour ne
  redimensionne que vers un bucket actif (le backend refuse le reste), et un contrôle qui disparaît fait douter de
  son existence.

### 2.3 Ce que chaque carte dit des captures

À la station 3, la ligne de méta d'une carte est **le compte de captures de ce bucket**, toujours — pas
l'avancement de la calibration, pas le `note` d'un bucket seedé. C'est l'information que le joueur vient chercher
ici, et elle est déjà dans les données servies : `data.sizes[].shots.length`, servi pour TOUS les buckets, pas
seulement l'actif (`bucketOf` dans `apps/web/src/app/screens/RoomProfileContainer.tsx` mappe `b.shots` de chaque
bucket). La clé i18n existe : `t.shots(n)` (« 3 captures » / « 3 shots »). Le badge d'état, lui, reste.

### 2.4 Et où vit la capture qu'on regarde

Sous le titre de la capture chargée, une ligne dit **dans quelles tailles la même PRISE existe**. Une prise est un
appui F9 : `Shot.seq` est son numéro et il est partagé par les jumelles des autres buckets (le store le garantit —
`ShotMeta.take_id`, monotone par room, et une attestation posée sur l'une vaut pour toutes). La ligne se dérive
donc entièrement des données déjà servies : pour la prise chargée, les buckets de `data.sizes` dont un `Shot` porte
le même `seq`.

- Présente partout : la ligne ne dit rien (c'est le cas ordinaire, et une évidence répétée ne se lit plus).
- Présente ailleurs seulement en partie : « Prise #9 — seulement en 1048×720 ».

Aucune donnée nouvelle : ni compteur servi, ni champ sur `SizeBucket`.

## 3. Contrat de données

Types touchés : `apps/web/src/ui/screens/RoomProfile.fixtures.ts` et `apps/web/src/ui/screens/contract.ts`.

**Ajouté : rien.** Tout ce que la demande consomme est déjà au contrat —

```ts
/* déjà servi, pour tous les buckets, pas seulement l'actif */
interface SizeBucket {
    id: string; w: number; h: number; shots: Shot[]; state: BucketState; note?: string | undefined; /* … */
}

/* déjà servi : le numéro de PRISE, partagé par les jumelles d'un même appui F9 */
interface Shot { seq: number; /* … */ }

/* déjà DÉCLARÉ, jamais rendu ni câblé — c'est lui que le sélecteur de la station 3 emprunte */
onTourSize?: ((sizeId: string) => void) | undefined;
```

**Retiré : rien.** `SizeBucket` ne gagne pas de `shotCount` : `shots.length` est la même vérité, et deux
expressions d'une même règle finissent par diverger (#99).

**Changement de contrat, un seul** — `onTourSize` rejoint `RoomProfileWiring` dans `contract.ts` :

```ts
export type RoomProfileWiring = Wiring<RoomProfileCallbacks, "onSetView" | "onSelectSize" | "onTourSize" | /* … */>;
```

C'est la posture de `onSetTilingEnabled` (#128) et de `onNudgeZones` (#131) : la demande EST le geste, donc un
sélecteur que l'app ne saurait pas honorer serait le défaut lui-même, et il vaut mieux que le build casse que la
session. `onSelectSize` reste dans la Wiring et garde son rôle à la station 4.

Ne changent pas : `TourState` (`sizeId`, `window`, `capturedSizes`), `Shot`, `BucketState`, le rail de la
station 4, la matrice de couverture.

## 4. i18n — clés FR/EN à prévoir dans `ui/screens/i18n.ts`

Deux clés seulement ; le reste est déjà là (`bucketsEyebrow`, `bucketState`, `shots`, `tourCaptureCold`).

- `tourSizeAria(w, h)` — FR : « Passer la capture en {w}×{h} » · EN : "Switch capture to {w}×{h}"
- `takeOnlyIn(seq, sizes)`
  - FR : « Prise #{seq} — seulement en {sizes} » · EN : "Take #{seq} — only in {sizes}"

## 5. Fixtures

`RoomProfile.fixtures.ts`, postures de la station 3 (`ROOM_PROFILE_TOUR_FIXTURE` et ses variantes) :

1. **deux buckets aux comptes différents** — c'est le cas terrain : 1048×720 avec n captures, 698×720 avec m ≠ n,
   les deux cartes rendues avec leur compte ;
2. **une prise dépareillée** — la capture chargée porte un `seq` qu'un seul bucket possède, pour que la ligne
   « Prise #9 — seulement en 1048×720 » soit rendue ;
3. **la posture froide** — `tour.window === null` : cartes désactivées, bannière froide déjà en place ;
4. **un bucket tombstone** — carte désactivée avec son `note`, à côté d'un bucket actif.

La posture froide est celle qui manque le plus : c'est l'état où le contrôle est visible et inerte, et la seule où
le joueur doit comprendre pourquoi sans lire une phrase de plus.

## 6. Ce qui ne bouge pas

- La station 4 : son bandeau garde le seed, la purge, l'avancement `k / N` et son propre libellé de méta.
- Le moniteur, le pager de captures (`ShotPager`), le renommage, la suppression, le champ de pause de capture et
  le sélecteur d'unité d'affichage de la station 3 : aucune ligne.
- `onSelectSize`, `onCaptureShot`, `onSelectShot` : signatures et sémantiques inchangées.
- Aucun champ servi en plus : la demande se paie entièrement sur les données déjà là.
