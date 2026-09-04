# Demande durable — 0.7.1 : pots, numéro de main, seed, plancher, présences attestées, vue moteur cachée

Vague Claude Design de la **0.7.1** — les retours de la campagne Windows 0.7.0 (#178, #177, #182, #181 ; méta #34)
et un retour de Romain sur le drop 2026-09-04.2 (§6). Six points, tous actés côté modèle ; les lots A (présences) et B
(seed, catalogue) sont codés en parallèle, la vague
n'attend pas leur merge. Rien n'est contourné côté app : `apps/web/src/ui/` reste au rail Claude Design.

## 1. Les deux pots : des libellés qui disent la relation, et la formule en aide (#178)

Au terrain, « Montant total du pot » et « Pot ramassé (près du board) » ne se distinguent pas : « qui est qui ? ».
La sémantique réelle, celle que le solveur impose (`close_conservation`) :

```
pot  =  pot_collected  +  Σ mises de la street en cours (hero_bet, villain_1_bet, villain_2_bet)
```

`pot_collected` vaut 0 à l'ouverture d'une main et ne bouge qu'à la fermeture d'une street. Une ROI de pot mal
attribuée fait mentir la conservation du pot sur toutes les mains, en silence.

- Libellés servis par l'app (`Zone.label`, données du profil, rien à coder côté DS) : **« Pot total (mises
  comprises) »** (`pot`) et **« Pot au centre (hors mises de la street) »** (`pot_collected`).
- Aide contextuelle : la formule ci-dessus, servie dans `Zone.hint` des deux ROI. Elle s'affiche déjà en `title` au
  rail des zones et en note de barre à l'établi (`ZoneWorkbench`) ; ce qu'on demande : **que la formule soit lisible
  là où le joueur POSE la ROI** (la note de l'établi, pas seulement un tooltip), et que les deux pots se lisent comme
  une paire (même groupe, l'un sous l'autre). Fixtures DS : reprendre les deux libellés et le hint.

## 2. Une seule zone de numéro de main (#178)

« Numéro de main (frontière) » et « Numéro de main (valeur) » sont le même rectangle posé deux fois. La seconde
zone (`hand_number_value`) **disparaît du catalogue** : une seule ROI, libellée **« Frontière de main (empreinte) »**,
lue par deux lecteurs (empreinte pour la frontière, chiffres pour le numéro quand des glyphes existent). Aucun
changement de contrat : une entrée de moins dans `zones`, un libellé servi. Fixtures DS à aligner (une seule zone).

## 3. Le seed ne touche que les ROI non validées — un bouton qui compte (#177)

« Seeder depuis le bucket le plus proche » réécrivait la géométrie ENTIÈRE du bucket, ROI validées comprises ;
Romain ne l'a pas pressé et a reposé quinze zones à la main. Désormais le seed ne projette que les zones **sans
géométrie ou non validées** (`seeded`, `invalidated`) ; une zone `adjusted` n'est jamais écrasée. Un bucket vierge
se seede intégralement, comme aujourd'hui.

- `onSeedFromNearest(sizeId)` ne change pas.
- Le libellé dit ce qu'il fait, avec le compte : **« Seeder les N ROI sans géométrie »** (EN : « Seed the N ROIs
  without geometry »). N = zones du catalogue sans géométrie dans ce bucket + zones `seeded`/`invalidated` — dérivable
  des données déjà servies (`zones` × `pos` × états de zone) ; si le DS préfère une valeur servie, un
  `SizeBucket.seedable?: number` est acceptable, dites-le.
- N = 0 : le bouton se désactive avec son mot (« rien à seeder : toutes les ROI sont validées ») plutôt que de
  disparaître.

## 4. Plancher de redimensionnement d'une ROI en pixels du bucket (#182)

`CalibrationCanvas.tsx` : `MIN_SIDE = 2` (% de la fenêtre, les deux axes). Traduit en pixels c'est 21 × 14 px sur
1048×720 et 14 × 14 sur 698×720 — **plus large que le jeton dealer** (~20 px) qu'on cadre. Les signaux ont une
taille en pixels, pas en fraction de fenêtre.

- Plancher **en pixels du bucket**, symétrique : **10 px** de côté (`10 × 100 / data.w` en % sur x,
  `10 × 100 / data.h` sur y — `pxUnit` fait déjà la conversion pour le clavier, #131). Au drag comme aux flèches.
- Pourquoi 10 : c'est le plancher du **hash de présence** (décision G1 #181) — sous 10 px de côté le dHash 9×8
  dégénère et la zone s'abstient, l'app le dit par une ligne rouge à la station 4. Un seul plancher, le même pour
  toutes les ROI ; pas de plancher par kind, pas de seuil adaptatif.

## 5. Rail de la station 5 : les présences ne se prélèvent plus, elles s'attestent (#181)

Une présence (badge dealer, dos de cartes d'un vilain, siège occupé) se lit désormais comme une **empreinte de
zone** (dHash de la ROI, plus proche voisin entre références « présent » et « absent », abstention loin des deux).
Il n'y a plus de couleur de référence, plus de tolérance, plus de point à poser, plus de pipette : les références
se **dérivent des captures attestées** (référence de profil) ou se **capturent en début de partie** (référence de
session : les sièges, dont le motif dépend du joueur). #179, #184 et #180 disparaissent avec le mécanisme.

Ce que le rail de la station 5 montre, une ligne par présence, sans cible :

```ts
export type PresenceReference = "profile" | "session";

export interface PresenceRow {
    id: string;                 // la zone (hero_dealer, villain_1_cards, villain_2_seat…)
    label: string;              // servi
    seat?: string | undefined;
    seatIndex?: number | undefined;
    reference: PresenceReference;
    /** captures du bucket qui attestent chaque état — l'app compose, le rail rend */
    present: { count: number; shotIds: string[] };
    absent: { count: number; shotIds: string[] };
    /** profile : références dérivées (ready) ou un état sans capture ; session : rien à calibrer ici */
    status: "ready" | "missingPresent" | "missingAbsent" | "session";
    /** phrase de l'app rendue verbatim (« aucune capture n'atteste villain_2_seat/empty — capturez-en une ») */
    detail?: string | undefined;
}
```

- `RoomProfileData.presences?: readonly PresenceRow[]` ; le rail les rend en groupe « Présences » sous les sondes.
- Une ligne dit **les deux états attestés** (présent · n captures / absent · m captures) et **l'état de la
  référence** : « calibrée » (dérivée des captures), « à attester : état absent manquant », ou « dérivée à la session
  » pour un siège (rien à faire ici, la partie la capture). Le seul geste offert est d'aller attester une capture
  (station 3, `onReplayStation`) — jamais une pipette, jamais une capture à choisir (#180 sans objet).
- `PointKind` perd `presence` : plus de point de présence sur le canvas ni au rail des points ; le badge « présence »
  de la barre de l'établi (station 4) reste.
- Les `Probe` de kind présence (couleur, tolérance, échantillons) ne sont plus servies : rien à rendre pour elles.

Clés i18n FR/EN à prévoir dans `ui/screens/i18n.ts` : le groupe, « présent / absent », « calibrée », « à attester »,
« dérivée à la session », le libellé du seed avec compte, « rien à seeder ».

## 6. La vue moteur quitte l'AppShell : un écran caché, gaté comme Room Profile (retour Romain)

Le drop 2026-09-04.2 a livré la carte « vue moteur » comme un **bandeau en haut de toutes les pages** (slot
`engineView` de `AppShell`, `styles.engineBand`). Romain n'en veut pas du tout : rien ne doit s'ajouter au cockpit
de tous les écrans.

Ce qu'on demande :

- **Retirer le slot `engineView` et la bande de `AppShell`** — le shell redevient exactement ce qu'il était avant
  le drop, sur tous les écrans, sans pixel de plus.
- **Un écran dédié, caché**, qui héberge la carte `EngineView` (le composant lui-même ne change pas) : une entrée de
  navigation supplémentaire, rendue **seulement quand l'app la fournit** — exactement le mécanisme de Room Profile.
  Côté app, ce gating existe déjà : le **mode mainteneur** (`apps/web/src/app/useMaintainerMode.ts` — bascule
  `Ctrl+Alt+Shift+R` dans le build Tauri, persistée ; toujours actif hors Tauri) filtre `AppShellData.nav` : l'entrée
  `rooms` n'est servie qu'en mode mainteneur (`nav: maintainer ? APP_NAV : APP_NAV.filter(n => n.id !== "rooms")`).
  Le nouvel écran suit la même règle : une entrée `{ id: "engine", label: "Engine view" / « Vue moteur », icon }`
  dans `APP_NAV`, filtrée par l'app hors mode mainteneur comme `rooms` — le DS n'a rien à gater, il rend le `nav`
  qu'on lui sert. Icône à choisir dans `NavIconName` (ou une de plus, à dire).
- **L'écran** : la (les) carte(s) `EngineView` seules, une par table suivie, dans le host d'écran normal (children
  de `AppShell`), avec l'état « aucune main suivie » qu'elle porte déjà. Pas de bandeau, pas de résumé ailleurs.
- **Parité pixel** : l'écran caché rejoint `BASELINE_SCREENS` comme `rooms` (il est rendu en mode mainteneur, donc
  dans les builds de parité) ; la posture de fixture demandée dans #174 devient celle de cet écran, ce qui règle
  #174 par la même occasion.
- Rien d'autre ne bouge dans le cockpit.

Côté app, au prochain drop : le container ne monte plus `EngineViewContainer` dans le shell mais dans ce nouvel
écran (`CurrentScreen` de `apps/web/src/app/AppShell.tsx`, `ScreenId` + `SCREEN_IDS`), sous le même `maintainer`
que `rooms`.
