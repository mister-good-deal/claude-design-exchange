# Tatami app → Claude Design — VAGUE 0.6.9 (compilée par le coordinateur, 2026-08-27)

Sept demandes issues de la campagne terrain 0.6.8 (2026-08-27), quatre lots d'agents, agrégées en une vague.

**Le chantier à lire comme UN SEUL : la card « Gabarit de carte » (station 4).** La demande A en change le
CONTRAT (sous-ROI de rang PAR FAMILLE), la demande B en change le LAYOUT (bande pleine largeur, grille interne) et
corrige l'écart kit ↔ export découvert au terrain (le miroir `ui_kits` pose 402 px / rails 190+200 / gap 12, l'export
`.4` pose 380 px / 178+186 / gap réel 8 alors que le manifest déclare 16). **Corriger aussi le manifest** : un gap
déclaré faux fausse tous les drops suivants.

Ordre de lecture conseillé : A et B ensemble (la card), puis C (station 6), D (station 5), E–G (rail des captures
et du canvas). Les fichiers sources sont committés dans le repo app (`doc/ds-report-rpv3-*.md`), un par sujet.

---

# Demande A — CONTRAT CardTemplateTool + palette d'enseignes (issues #52, #62 — lot A, MR !92)

Campagne de validation Windows 0.6.8 (2026-08-27), lot A : **#62** (bloquant), **#52**, **#53**. Le moteur, l'IPC
et tout le câblage app partent dans la MR `fix/rpv3-lot-a` → `release/0.6.9`. Restent **deux points qui vivent dans
`apps/web/src/ui/**`** (DS-owned, `.ds-sync.json`) et que l'app ne peut pas porter sans casser `check:ds-sync` —
d'où cette demande.

> **Un seul chantier `CardTemplateTool`.** Le lot D porte en parallèle une demande de **layout** sur cette même
> card (#54 : bandeau pleine largeur, bande minimale, grille interne). La demande ci-dessous porte le **contrat**
> (un cadrage par famille). Les deux se traitent ensemble, sur le même composant.

## 1. Station 6 — la ligne « Pixels de référence prélevés » doit dire que le manque est la palette (#62)

### Le fait

Le profil terrain n'a **aucune** palette d'enseignes (`[suits]` absente). `resolve_region` refuse alors toute
déclaration `card`, si bien que **les quatorze oracles de cartes s'abstiennent** — quel que soit le nombre de
gabarits de rang posés :

```
dry_run_zone zone="actions"     oracles=3  ok=3  abstain=0  verdict=Ok
dry_run_zone zone="board"       oracles=7  ok=0  abstain=7  verdict=Abstain
dry_run_zone zone="hero_cards"  oracles=7  ok=0  abstain=7  verdict=Abstain
```

La station 6 résumait tout cela par « **Pixels de référence prélevés — 6/7 · 1 reste à jouer — déplier** ».

### Ce que l'app livre déjà dans cette MR (aucune contrepartie DS)

- Le **dépliage** nomme désormais chaque manque, comme celui des glyphes nomme son code : une couleur de barre par
  geste, avec sa déclinaison × son action (« Prélever la couleur du bouton « call » — Deux boutons (fold / call) »)
  et, pour la palette, sa conséquence — « **Prélever la palette des enseignes — sans elle, toutes les cartes
  s'abstiennent** ». Les deux gestes routent station 5 (pipette).
- Le **verdict de zone** du panneau des dry-runs et le **blocage de `write_profile`** nomment la même cause avec
  les mêmes mots : « palette des enseignes jamais prélevée à la pipette (station 5) — sans elle une carte n'a
  aucune couleur de référence à comparer : TOUTES les cartes s'abstiennent, quel que soit le nombre de gabarits de
  rang posés ».

### La demande

Le manque le plus lourd du profil ne devrait pas exiger un dépliage pour se voir. `ReadinessLine` ne porte
aujourd'hui que `label` / `meta` / `items` — `meta` est la place d'UN ratio (« 6/7 »), et le contrat note
explicitement que la redite y débordait la rangée jusqu'à tronquer le libellé.

Nous demandons **un champ de conséquence au niveau de la ligne**, rendu sous la rangée (pas dans `meta`) quand il
est présent :

```ts
export interface ReadinessLine {
    id: string;
    label: string;
    state: LineState;
    meta: string;
    station: StationId;
    items?: ReadinessItem[] | undefined;

    /** Ce que cette ligne rouge EMPÊCHE, en une phrase — rendu sous la rangée, jamais dans `meta`. */
    consequence?: string | undefined;
}
```

Côté app, la phrase est composée depuis le fait backend (la file de reprise porte le geste `measure_suits`), donc
aucune string DS n'est à inventer : le prototype a seulement besoin de la **place** et de son style (une note
d'alerte, tonalité `alert`, pleine largeur sous la rangée dépliable, visible sans dépliage). Si le prototype
préfère porter lui-même le mot, nous prenons aussi une clé `roomProfileV3.lineConsequence` — dites-nous laquelle
des deux formes vous convient.

## 2. Station 4 — la sous-ROI de rang est par FAMILLE, la card doit la piloter (#52)

### Le fait

Verdict de Romain : « la sous-ROI de capture de rang est partagée entre les cartes du board et les cartes du
joueur au lieu d'être distinctes. Quand je modifie l'une ça affecte l'autre et vice versa. La ROI principale de
carte est bien distincte. »

L'argument de conception de #46 (la sous-ROI est indépendante du bucket, le sprite étant homothétique) reste vrai
**entre tailles de fenêtre** ; il est faux **entre familles**, parce que les deux gabarits n'ont pas les mêmes
proportions — sur le profil terrain :

```
board = [0.044847, 0.124074]   ratio l/h 0.361
hero  = [0.025521, 0.116462]   ratio l/h 0.219   ← les cartes héros se chevauchent en éventail
```

Une fraction qui cadre le rang sans le pip sur une carte de board tombe donc ailleurs sur une carte héros.

### Ce que l'app livre déjà dans cette MR

`[cards].rank_sub_roi` est désormais **par famille** (`board` / `hero`), avec le rail one-shot habituel : la forme
héritée (`rank_sub_roi = [x0, y0, x1, y1]`) se lit sur les deux familles — aucune lecture ne change — et se
réécrit en `[cards.rank_sub_roi] board = … / hero = …` à la première écriture. L'IPC suit :
`set_card_rank_sub_roi(room, family, rect)`, `RoomCalibrationDto.cardRankSubRois: { board, hero }`.

### La demande — le contrat de `CardTemplateTool`

Le composant porte DÉJÀ le sélecteur de famille et le champ de sous-ROI ; il ne lui manque que de les relier. Le
contrat DS rend encore un cadrage unique :

```ts
// RoomProfile.fixtures.ts — aujourd'hui
cardRankSubRoi?: CardRankSubRoi | undefined;
onSetCardRankSubRoi?: ((rect: CardRankSubRoi) => void) | undefined;
```

Nous demandons la forme par famille :

```ts
/** #52 — un cadrage de rang par famille de gabarit : board et hero n'ont pas les mêmes proportions. */
cardRankSubRois?: Partial<Record<CardFamily, CardRankSubRoi>> | undefined;
onSetCardRankSubRoi?: ((family: CardFamily, rect: CardRankSubRoi) => void) | undefined;
```

et, dans `CardTemplateTool.tsx`, que le champ et la boîte de rang du `Stage` lisent
`data.cardRankSubRois?.[family]` et committent `onSetCardRankSubRoi(family, next)` — `family` étant celle que le
sélecteur déjà présent désigne. Le message `cardTplNoRank` devient alors « pas de cadrage de rang réglé pour
**cette famille** » (une clé par famille, ou le nom de famille interpolé comme le fait déjà `cardTplNone`).

Deux autres consommateurs DS-owned lisent le cadrage et devront le prendre par famille :
`ZoneWorkbench.tsx` (qui le transmet au canvas) et `CalibrationCanvas.tsx` (qui dessine la boîte de rang sur une
ROI carte) — la famille d'une ROI est déjà connue là-bas via `Zone.cardFamily`.

**En attendant le drop**, l'app ne régresse pas : le champ montre le cadrage `board` et un réglage écrit les DEUX
familles — exactement le comportement d'avant #52, jamais une famille qui perd le sien. Le test
`RoomProfile.test.tsx` « station 4 : la card règle la taille partagée et la sous-ROI de rang » épingle cet état
transitoire et sera resserré sur la famille au drop.

## 3. #53 — aucune demande DS

Pour mémoire : « aucun gabarit Board sur ce bucket » s'affichait sur un profil hérité dont les cinq ROI board
étaient calibrées, et poser un gabarit à la main écrasait la géométrie du joueur. C'est réglé **entièrement côté
moteur** — le gabarit se dérive dès la LECTURE des slots hérités (la plus grande carte de la famille, pas la
première venue : `hero_1` est justement celle que l'éventail rogne), et la même dérivation ensemence la migration
à l'écriture. `cardTplNone` ne s'affiche donc plus sur un bucket calibré, sans un mot à changer côté DS.


---

# Demande B — LAYOUT station 4 + écart kit↔export + manifest (issues #54, #55 — lot D, MR !91)

Demande autonome issue de la campagne de validation Windows 0.6.8 (session 2026-08-27, sur les 7 captures du
profil terrain, aucune table ouverte). Suivie côté app par les issues **#54** (le layout) et **#55** (l'écart de
rendu preview ↔ app). Fichier d'échange propre : la demande survit à l'itération courante.

Chantier partagé : la même card « Gabarit de carte » fait l'objet d'une demande de contrat séparée (#52,
`ds-report-rpv3-…-gabarit-par-famille`, portée par un autre lot) — **traitez la card comme UN seul chantier**,
contrat + layout.

---

## 1 — Ce que le terrain a vécu (#54)

L'arrivée de la card « Gabarit de carte » (#51, drop `2026-08-26.2`) casse la colonne de gauche de la station 4.
Verdict de Romain, mot pour mot : « l'affichage UI est foireux […] J'avais pourtant fait un gros travail
d'itération hier avec Claude Design. »

Ce qui est visible à l'écran, sur une fenêtre de cockpit réelle :

- la bande de gauche est **trop étroite pour la card** : le libellé `0 × 0 px · + 8 px de capture autour`
  **chevauche** le bloc suivant, et `47 × 67 px · + 8 px de capture autour` passe **par-dessus** les libellés
  `GAUCHE %` / `HAUT %` ;
- la grille deux colonnes **interne** à la card est cassée : `LARGEUR %` / `HAUTEUR %` puis
  `GAUCHE / HAUT / DROITE / BAS` ne s'alignent pas, les champs débordent de la card ;
- la vignette d'aperçu du rang **sort du cadre** de la card ;
- le bas de la card est **tronqué par le viewport** ; la liste des ROI a sa propre barre de défilement et se
  retrouve écrasée entre les deux blocs.

C'est le troisième signalement de la même famille (« le rendu sort en une colonne ») : les notes du drop
`2026-08-26.2` le disent elles-mêmes — « the single-column look reported three times ». Les bases de flex ont été
réduites à chaque fois (contrôles `1 1 180px` → `1 1 120px`, stage `3 1 260px` → `3 1 120px`) sans que le
symptôme cède. **Le problème n'est pas la base de flex, c'est la largeur disponible** : la bande fait ~380 px et
doit y loger deux colonnes de contrôles numériques ET un rendu de pixels à taille réelle avec 8 px de capture
tout autour.

## 2 — La refonte demandée par Romain

Sa formulation, dans l'ordre :

1. **« Dérivé des layouts de cette room » passe en pleine largeur, au-dessus de tout le reste** — un bandeau,
   plus une colonne. Le rail des buckets est une bande horizontale en tête de station.
2. La colonne de gauche ne porte plus que **ROI → Actions**, à gauche de la vue de la capture.
3. **« Gabarit de carte » se place dessous**, avec une **largeur de bande minimale** à définir — c'est vous qui
   la posez, à partir de ce que la card doit contenir sans se replier : deux colonnes de champs + le stage à
   `1:1` avec sa marge de 8 px réels.
4. Poser une **largeur minimale** sur la colonne principale de gauche, pour que la bande ne puisse plus se
   réduire au point de faire chevaucher son contenu. Aujourd'hui `.railRegion` descend jusqu'à `min-width: 300px`
   et la card n'a aucun plancher à elle : c'est ce plancher-là qui manque.
5. Corriger le **bug d'affichage deux colonnes interne** à la card, indépendamment de la largeur : les rangées
   `cardTplRow` doivent tenir leur grille, pas se disloquer quand la bande rétrécit.

Le geste 1 libère mécaniquement la largeur que les gestes 3 et 5 réclament : le bandeau des buckets rendu
horizontal, la colonne de gauche n'a plus à porter deux sous-colonnes, et la card récupère ~180 px.

**Ce qu'il ne faut pas refaire** (déjà essayé, déjà rejeté, c'est écrit dans vos propres notes de drop) : un rail
gauche fixe à 452 px (la capture était poussée 443 px hors d'un viewport de 924 px), une région gauche pleine
hauteur avec le rail en bande de chips (prend la largeur de la capture), une bande pleine largeur sous TOUT (la
capture perd sa hauteur). Le bandeau demandé ici est **au-dessus**, pas en dessous, et il ne porte que les
buckets — c'est la différence.

## 3 — L'écart kit ↔ export, mesuré (#55)

Romain a itéré sur ce layout **le 2026-08-26 dans la preview**, l'a validé, et a retrouvé **un rendu différent
dans l'application**. Verdict : « le rendu de l'appli est différent du rendu que j'avais hier dans Claude Design
donc il y a encore des écarts pénibles de rendu Claude Design / app réelle. »

Nous avons instrumenté les deux côtés. **Le port app-side ne diverge pas de l'export : c'est l'export qui
diverge du miroir de preview.** Les nombres, relevés dans les deux sources :

| | miroir de preview (`RoomProfileV3.jsx`, `AdjustBody`) | export `2026-08-26.4` (`RoomProfile.module.css`) |
|---|---|---|
| région gauche | `width: 402`, `flex: 0 1 402px`, `minWidth: 300` | `.railRegion` — `width: 380px`, `flex: 0 1 380px`, `min-width: 300px` |
| rail des buckets | `width: 190`, `flex: 0 0 190px` | `.benchBuckets` — `width: 178px`, `flex: 0 0 178px` |
| liste des ROI | `width: 200`, `flex: 1 1 200px` | `.zoneRail` — `width: 186px`, `flex: 1 1 186px` |
| gouttière entre les deux rails | `gap: 12` | `gap: var(--space-4)` |
| gouttière interne du rail buckets | `gap: 8` | `gap: var(--space-3)` |

Deux conséquences, et la seconde est la plus coûteuse :

**(a) 402 px contre 380 px.** 22 px de moins, et surtout deux rails plus étroits de 12 et 14 px chacun. Sur une
bande déjà au bord de la rupture, c'est exactement la marge qui manque à la card.

**(b) `--space-4` vaut 8 px, pas 16 px.** Les notes du drop `2026-08-26.2` posent le calcul
« 178 + 16 + 186 = 380 px » et en tirent la largeur de la région. Mais `tokens/spacing.css` — votre propre
fichier — déclare `--space-4: 8px` (`--space-6` vaut 16 px). Le calcul est donc faux de 8 px, et la région
mesurée dans l'app rend bien `178 + 8 + 186 = 372 px` de contenu dans une boîte de 380 : **8 px de jeu inerte**
là où la card manque de place. Un manifest qui se trompe sur la valeur d'un token fausse tous les calculs de
layout des drops suivants : **c'est à corriger à la source**, pas seulement ici.

**Attendu, en plus de la refonte :**

- le miroir de preview et l'export **portent les mêmes nombres**. C'est le miroir que Romain valide ; si l'export
  en diverge, la validation ne vaut rien. Si le miroir doit rester approximatif sur un point, il est déclaré dans
  `parity.mockedInPreview` — jamais silencieux.
- les notes de drop qui posent un calcul de layout **citent la valeur réelle du token**, pas une valeur
  supposée. `--space-4 = 8px`, `--space-5 = 12px`, `--space-6 = 16px`.

## 4 — Ce qui est fait côté app, et qui ne l'était pas

L'écart n'a pas été attrapé par la parité pixel parce que **la station 4 n'était pas couverte, et ne pouvait pas
l'être** : deux verrous app-side, tous deux levés dans cette MR.

1. Le montage du baseline de parité ne câblait pas `onReplayStation`. Le baseline standalone était donc
   **incapable d'entrer dans une station** : les boutons de l'épine ne répondaient pas. Aucune région de parité
   n'était rédigeable sur un écran qu'un seul des deux côtés savait atteindre.
2. L'ombre de parité (les payloads app qui rejouent votre fixture) servait `cardTemplates: {}`, `points: {}` et
   la sous-ROI de rang **par défaut de l'app** au lieu de celle de votre fixture. Côté app, la station 4 rendait
   donc : aucune card « Gabarit de carte » (elle ne s'affiche pas sans famille de gabarit), aucune pastille de
   sonde sur la capture, et une boîte de rang pointillée à la mauvaise géométrie. **La card qui a cassé le layout
   était invisible du harnais.**

La station 4 est désormais couverte par deux régions de parité, dont la card elle-même. Rien à faire de votre
côté là-dessus — c'est dit ici parce que le §8 du contrat vous engage sur la parité preview ↔ app, et que la
moitié app de ce contrat n'était pas tenue.

## 5 — Critère de clôture

- Le rail des buckets est un **bandeau pleine largeur** en tête de station ; la colonne de gauche ne porte que la
  liste des ROI, et la card « Gabarit de carte » dessous.
- La card a une **largeur minimale** propre, et la colonne de gauche un plancher qui la respecte : à la largeur
  minimale, **aucun libellé n'en chevauche un autre** et la grille deux colonnes tient.
- La vignette d'aperçu du rang reste **dans** le cadre de la card.
- Miroir de preview et export portent les **mêmes nombres** de layout pour cette station.
- Le manifest ne pose plus de calcul sur une valeur de token supposée.


---

# Demande C — station 6 : la liste des blocages au pied d'« Écrire le profil » (issue #61 — lot C, mergé)

**Une liste, aucune donnée neuve, aucun contrat neuf.** Le terrain 0.6.8 (issue #61, étiquetée *bloquant*) bute sur un
bouton primaire désactivé qui ne dit pas ce qu'il attend. Tout ce qu'il faudrait afficher est **déjà dans `data`** —
il manque le markup qui le rend au pied du bouton, et ce markup est dans `ui/screens/ValidateStation.tsx`, donc chez
vous.

## Ce que le joueur voit

Station 6, profil en cours de calibration, panneau de droite (« Dry-runs · Persistés avec les shots ») :

```text
1152 × 770        8/8 · 14:02        [ Relancer ]
960 × 600         8/8 · 13:58        [ Relancer ]

[            Écrire le profil — 0 valeur manuelle            ]   ← désactivé, muet
```

Verdict de Romain, verbatim : « **Je ne peux pas écrire le profil, le bouton est disabled.** » Il n'a aucun moyen de
savoir ce qui bloque : le bouton ne réagit pas, et rien à côté ne nomme l'obstacle. Le score agrégé est bien à
l'écran — mais dans l'AUTRE colonne, sous un titre qui ne parle pas d'écriture ; le joueur qui vise le bouton ne fait
pas le lien, et l'issue le documente noir sur blanc.

## Le backend nomme déjà tout — c'est le rendu qui manque

`write_profile` ne se contente pas de refuser : il détaille ligne par ligne. Le journal du terrain porte la preuve :

```text
WARN write_profile_bloque  blockers=5  lines=[Buckets, Variants, ProbesPalette, Glyphs, DryRuns]
```

Et le même prédicat est **déjà servi à l'écran** dans le contrat DS, sans le moindre aller-retour supplémentaire :

```ts
data.readiness.lines   // les 7 lignes du score : { id, label, state, meta, station, items? }
data.readiness.ready   // = badge backend = « les 7 lignes sont Ok » (conjonction STRICTE, cf. derive_readiness)
data.readiness.blockers // = lines.filter(l => l.state !== "ok").length
```

`badge === lines.every(state === "ok")` est un invariant du backend, pas une coïncidence : **la liste des blocages et
l'état `disabled` sont le même fait**. Il n'y a donc rien à dériver en plus, rien à demander à l'app, rien à ajouter
au contrat — seulement à rendre.

## Ce qu'on vous demande

Rendre, **au pied du bouton « Écrire le profil »**, la liste des lignes rouges du score, nommées, chacune cliquable
vers sa ligne. Critère de fermeture de l'issue : *un joueur devant le bouton désactivé sait POURQUOI, et par quoi
commencer.*

Notre proposition, si elle vous va — `ValidateStation.tsx`, panneau des dry-runs :

```tsx
/* Le MÊME prédicat sert le disabled et la liste : deux dérivations pourraient afficher « 0 blocage » sous un
   bouton verrouillé. */
const blocked = data.readiness.lines.filter(l => l.state !== "ok");

<Button variant="primary" block disabled={blocked.length > 0} onClick={() => on.onWriteProfile?.()}>
    {t.writeProfile}
</Button>
{blocked.length === 0 ? null : (
    <div className={styles.blockedBy}>
        <span className={styles.fieldLabel}>{t.writeBlockedBy(blocked.length)}</span>
        {blocked.map(l => (
            <a key={l.id} className={styles.blockerLink} data-state={l.state} href={`#score-${l.id}`}>{l.label}</a>
        ))}
    </div>
)}
```

et l'ancre côté score, dans `ReadinessRow` (les deux branches, avec et sans `items`) :

```tsx
// branche dépliable
<summary id={`score-${line.id}`} className={styles.line} data-state={line.state}>
// branche sans trous
<div id={`score-${line.id}`} className={styles.line} data-state={line.state}>
```

Un `scroll-margin-top` sur `.line` évite que l'en-tête du panneau ne mange la cible.

Chaînes à ajouter (`roomProfileV3`) :

```ts
// fr
writeBlockedBy: n => (n > 1 ? `${n} lignes rouges bloquent l'écriture — aller à la ligne` : "1 ligne rouge bloque l'écriture — aller à la ligne"),
// en
writeBlockedBy: n => (n > 1 ? `${n} red lines block the write — go to the line` : "1 red line blocks the write — go to the line"),
```

**Pourquoi l'ancre plutôt qu'un rappel de station.** Atterrir sur la ligne du score enchaîne sur ce que vous avez déjà
livré en 0.6.6 : la ligne se déplie (`<details>`), et chacun de ses trous porte son adresse et son clic
(`onOpenReadinessItem`). Le joueur passe donc de « pourquoi c'est verrouillé » à « le geste exact qui le déverrouille »
sans qu'aucun callback nouveau n'existe. Un rappel direct de la station via `onReplayStation(line.station)` répondrait
aussi au critère — c'est votre arbitrage, on câble ce que le drop porte ; notez seulement que la ligne « Dry-runs »
porte `station: "validate"`, donc ce chemin-là serait un clic mort sur la station où le joueur se trouve déjà.

## Second défaut de l'issue : un bouton désactivé doit se lire désactivé

`.btn:disabled` ne pose aujourd'hui que `opacity: 0.45` + `cursor: not-allowed`. Sur `variant="primary"`, le résultat
reste un aplat d'accent qui se lit comme une action primaire disponible — c'est le constat n°2 de l'issue, relevé sur
capture. Un traitement désactivé propre au `primary` (fond neutralisé plutôt qu'accent atténué, bordure sourde) le
règlerait pour tous les écrans d'un coup.

## Garde-fous

- **Une seule dérivation.** Si le `disabled` reste sur `!data.readiness.ready` pendant que la liste filtre `lines`,
  les deux peuvent se contredire à l'écran. Le `const blocked` unique est le point du correctif.
- **Le cas vert.** À 0 blocage, la liste disparaît entièrement (pas d'encart vide, pas de « tout est vert » : le badge
  du fil et le verdict d'écriture le disent déjà ailleurs).
- **Verbatim des libellés.** Les `label` viennent de `lineLabel` — ce sont vos chaînes, à rendre telles quelles ; l'app
  ne les reformule pas et ne veut pas d'un second vocabulaire pour les mêmes 7 lignes.
- **`.blocker` reste au verdict.** La classe existante (`.blocker`, bordure `--alert-line`, fond `--alert-bg`, mono)
  est celle des blockers VERBATIM du backend dans le panneau « Écriture refusée ». La liste au pied du bouton nomme
  des lignes du score, pas des phrases backend : une classe à elle (`.blockerLink`, cliquable, `data-state` pour
  distinguer `missing` de `stale` comme le fait déjà `.lineItem`) évite de faire dire deux choses au même style.
- **Les variantes différées** sont hors conjonction : elles n'apparaissent jamais dans cette liste (elles ne sont pas
  des `lines`, elles vivent dans `readiness.deferred`).

---

**État côté app :** rien à câbler de notre part — `data.readiness.lines` est servi depuis 0.6.6 et porte déjà `id`,
`label`, `state` et `station` ; aucune donnée ni aucun callback nouveau n'est demandé. La MR de ce lot ne porte que
cette demande. **#61 reste ouverte tant que ce drop n'est pas arrivé.**


---

# Demande D — station 5 : deux vocabulaires de glyphes, deux sections (issues #60/#58/#59 — lot B, MR !93)

Origine : campagne de validation Windows 0.6.8, station 5 (glyphes). Issues moteur/app `#60` (les rangs de carte et
les chiffres de montant partagent le même code), `#58` (aucune ROI de montant dans le profil), `#59` (la couverture
n'est pas réversible). Les trois sont corrigées côté app/moteur ; ce qui reste est du markup DS et n'est pas
corrigeable app-side sans casser les pixels.

## Ce qui a changé sous l'écran

Un « 3 » de carte (grande encre colorée sur une carte claire) et un « 3 » de pot (petite encre claire sur le feutre)
ne sont pas les mêmes pixels. Ils partageaient pourtant la même case de gabarit : le dernier prélèvement écrasait
l'autre, en silence. Le vocabulaire est désormais coupé en **deux familles disjointes** :

- **Rangs de carte** — 13 codes : `R2 R3 R4 R5 R6 R7 R8 R9 T J Q K A`, prélevés dans la sous-ROI de rang.
- **Chiffres et symboles de montant** — 13 codes : `D0`…`D9`, `Sep` (,), `Cur` (€) / `Unit` (BB), prélevés dans une
  ROI de montant (le pot). Une room affiche `€` **ou** `BB` : une seule des deux unités est exigée.

La couverture complète est donc **25 codes sur 26** au lieu de 18, et chaque famille a son propre compte.

## La demande

### 1. Le panneau « Couverture glyphes » en DEUX sections (`ui/screens/GlyphTool.tsx`)

Aujourd'hui la colonne de droite range les codes en « Chiffres / Séparateurs / Rangs » **d'après leur libellé**
(`familiesOf`) : tout ce qui s'écrit `0`-`9` tombe dans « Chiffres », et « Rangs » ne contient que `A T J Q K` — ce
qui laisse croire que les rangs se limitent aux figures. Avec deux vocabulaires, ce découpage par libellé range
maintenant le « 3 » de carte et le « 3 » de pot dans la MÊME rangée, deux fois le même caractère, l'un couvert et
l'autre pas. Verdict terrain avant même le split : « la vérification est confusante sur ce point ».

Attendu : deux sections nettes, chacune avec son compteur propre, et le découpage porté par la DONNÉE, pas par le
libellé :

```text
Rangs de carte              8 / 13
  A  K  Q  J  T  9  8  7  6  5  4  3  2

Montants                    4 / 12
  0  1  2  3  4  5  6  7  8  9  ,  € (ou BB)
```

Le titre du panneau peut garder un total global (`x / 25`) si la maquette le préfère, mais les deux compteurs par
section sont ce que le joueur lit pour savoir quoi provoquer ensuite.

### 2. Le contrat de données : `GlyphCode` porte sa famille

Pour que le découpage cesse de se deviner au libellé, il faut un champ dans `RoomProfile.fixtures.ts` :

```ts
export interface GlyphCode {
    code: string;
    label: string;
    count: number;
    unit?: boolean | undefined;

    /** La famille du code — deux vocabulaires disjoints, et le même LIBELLÉ peut exister dans les deux. */
    family: "ranks" | "amounts";
}
```

L'app le remplit déjà côté données (elle connaît la famille de chaque code) ; elle ne peut pas l'ajouter au type,
qui est à vous. `code` reste unique (`R3` ≠ `D3`) et sert de clé de liste ; `label` reste le caractère affiché ET
tapé (`onChange(value + k.label)` continue de marcher tel quel — c'est la ROI qui décide vers quel code part le
caractère saisi, côté moteur).

### 3. Les touches du composer filtrées par famille (`ui/screens/TruthComposer.tsx`)

Même cause, même effet : `groupOf(label)` range les touches par libellé, donc la rangée « chiffres » d'une ROI de
montant montre aujourd'hui **dix-huit touches** — les dix chiffres de montant plus les huit rangs 2-9, deux fois le
même caractère. Attendu :

- ROI de montant (`readKind` ≠ `card`) : uniquement les codes `family === "amounts"` (chiffres, séparateur, et
  l'unité déjà filtrée par `unitCode`).
- Grille de rang de `CardTruthPicker` : uniquement les codes `family === "ranks"` (elle a besoin des rangs 2-9,
  qu'elle prend actuellement par libellé — d'où le doublon qu'elle résout au hasard de l'ordre).

C'est le seul point qui dégrade le geste dès aujourd'hui : le doublon de touches est visible à l'écran tant que le
drop n'est pas passé (les deux touches produisent la même vérité, donc rien n'est cassé — c'est du bruit, pas une
erreur).

## Ce qui n'est PAS demandé (déjà là)

Le panneau de prélèvement des **montants** en station 5 existe déjà dans le design : une ROI `readKind: "number"`
rend son crop, sa légende de cellules et le composer avec sa rangée d'unité (`unitCode`), et la fixture porte même
la zone `pot` (« Pot value », `unitCode: "unit"`). Il n'apparaissait jamais à l'écran parce que le PROFIL ne
déclarait aucune zone de lecture de montant — c'était un trou dans les données, pas dans la maquette. La ROI `pot`
est déclarée depuis `#58` : le panneau s'ouvre tout seul. Rien à dessiner de ce côté.

## Contrainte transverse

Le compteur d'une section et la liste qu'elle affiche doivent dériver du **même** prédicat (`count === 0` sur les
codes de la famille) : deux dérivations qui peuvent se contredire, c'est exactement le défaut que `#59` vient de
corriger côté moteur (la couverture affirmait un gabarit que plus rien n'alimentait).


---

# Demande E — sélecteur de captures : miniatures (issue #56 — lot D)

Demande autonome issue de la campagne de validation Windows 0.6.8 (session 2026-08-27), station 4. Suivie côté
app par l'issue **#56**. Fichier d'échange propre : elle survit à l'itération courante.

## Ce que le terrain a vécu

Le sélecteur de captures, en bas de la station, rend chaque capture comme une **puce de texte dense**. Toute la
méta du shot y est écrite en clair, sur trois à cinq lignes de mono 9 px dans une puce de 118 px. Relevé à
l'écran, verbatim :

```
board b5 · hero_c…      actions              board b5 · hero_c…    board b4 · hero_c…
dealt · timer abs…      three_buttons        dealt · actions       dealt · actions
· actions               board b0 ·           two_buttons_check_bet two_buttons_check_bet
two_buttons_check_bet   hero_cards dealt     · timer absent ·      · timer absent ·
· 16/08 11:32 ·         · timer absent ·     16/08 11:32           16/08 11:33
principale              16/08 11:32
```

Résultat : la bande est illisible, chaque puce est tronquée par des ellipses, et **rien ne permet de reconnaître
visuellement la capture** qu'on cherche — alors que c'est exactement ce qu'on fait quand on choisit un
screenshot. Verdict de Romain : il veut voir les captures, pas les lire.

**La miniature existe déjà dans le composant** (`ShotStrip` pose un `.shotImg` de 50 px de haut sur la puce, en
`background-size: cover`). Elle est écrasée par la méta : 50 px d'image contre cinq lignes de texte, dans une
puce de 118 px de large. Le rapport de forme est inversé par rapport à ce que le geste demande.

D'où vient le texte : quand le shot n'a pas de libellé propre, l'app compose son nom à partir des **libellés de
la capture** (`board b5`, `hero_cards dealt`, `timer absent`, `actions two_buttons_check_bet`, …). C'est une
chaîne qui grandit avec le nombre de groupes de variantes du profil — sept groupes sur ce profil-ci. Elle ne
tiendra jamais dans une puce, quelle que soit la largeur.

## Ce que Romain demande

1. Afficher la **miniature de la capture** dans le sélecteur, à la place du bloc de texte — c'est elle le sujet
   de la puce, pas sa légende.
2. **Retirer les métadonnées écrites** de la puce.
3. Les passer en **tooltip au survol** : la méta complète y reste consultable, en entier, sans ellipse.
4. Ne garder en clair sur la vignette que **deux informations** : le **nombre de cartes du board** et la **date**
   de la capture. Rien d'autre.

Le sélecteur est **partagé** par toutes les stations qui travaillent sur une capture enregistrée — le changement
doit y valoir partout, pas seulement en station 4.

## Ce que ça implique côté contrat, et ce que l'app peut servir

Le point 4 est le seul qui ne tienne pas avec le contrat actuel : `Shot` ne porte qu'**un libellé unique** déjà
composé (`label`) et une heure (`at`). « Le nombre de cartes du board » n'est pas extractible d'une chaîne
d'affichage sans la parser — ce que le DS ne doit pas faire.

Ce que l'app **a déjà** et peut servir sans aucun travail moteur, si le contrat le demande :

- `Shot.variantIds` — les cellules que la capture atteste, sous forme d'ids plats `<zone>/<variante>`. Le nombre
  de cartes du board en est un : `board/b0`, `board/b3`, `board/b4`, `board/b5`. Le DS y a déjà accès (c'est ce
  qui fait le calcul de visibilité des ROI), mais il ne dispose pas du **mot** à afficher.
- la date : `Shot.at` est déjà une forme courte locale (`16/08 11:32`).
- `Shot.imageUrl` — la vignette, déjà servie quand la capture en a une.

**Proposition de forme, à arbitrer par vous :** un champ dédié plutôt qu'un parsing — p. ex. `Shot.boardCards?:
number | undefined` (le nombre de cartes du board que la capture montre, `undefined` quand aucun libellé de board
ne la qualifie), l'app le dérivant de `variantIds`. La vignette rend alors « 5 cartes · 16/08 11:32 », et tout le
reste — libellés, déclinaisons d'actions, timer, « principale », importée — part dans le tooltip.

Si vous préférez que la puce reste alimentée par le seul `label` composé, dites-le : l'app peut aussi le
raccourcir à la source. Mais alors c'est l'app qui décide de la typographie de la puce, ce que le rail interdit —
d'où la proposition de contrat.

## Deux points que la refonte ne doit pas perdre

- **L'état « principale »** : une capture est la primaire du bucket, et ça se voit aujourd'hui dans la méta
  (`· principale`). Sur une vignette sans texte, il lui faut une marque visuelle propre.
- **La suppression en deux temps** est posée sur la puce (croix, puis confirmer / annuler). Elle doit rester
  atteignable sur une vignette, et ne pas se déclencher au survol qui ouvre le tooltip.
- **L'état dégradé est à dessiner aussi** : une capture **sans** `imageUrl` (l'app n'en sert pas toujours, et les
  fixtures n'en portent aucune) doit avoir sa vignette vide DESIGNÉE, pas une case noire — c'est le §8.4 du
  contrat.

## Critère de clôture

Sur une bande de sept captures d'une même session, à la largeur réelle du cockpit : on **reconnaît** la capture
qu'on cherche sans survoler, chaque vignette porte exactement deux informations écrites (cartes du board, date),
et la méta complète reste lisible au survol, sans ellipse.


---

# Demande F — consigne « ROI occultée » une fois par ligne (issue #57 — lot D)

Demande autonome issue de la campagne de validation Windows 0.6.8 (session 2026-08-27), station 5. Suivie côté
app par l'issue **#57**. Fichier d'échange propre : elle survit à l'itération courante.

## Ce que le terrain a vécu

La consigne d'occultation introduite avec le geste « écarter cette ROI » (#40, drop `2026-08-26`) est répétée
**sous chaque carte**. Le paragraphe, verbatim :

> Même quand l'œil reconnaît le contenu : une ROI occultée ou « pas clean » ne doit PAS être conservée — les
> gabarits de glyphes et les oracles de dry-run se construisent dessus, et une capture dégradée dégrade toute la
> collection.

Sur une capture de river, la station ouvre **sept boîtes** (cinq cartes de board + deux cartes du héros). C'est
donc **sept fois le même paragraphe à l'écran**, dans un panneau où le joueur est censé taper des rangs à la
chaîne. Verdict de Romain : « c'est très répétitif ».

Ce n'est pas une régression : c'est la lecture littérale de l'intention de #40, qui demandait la consigne **à
l'endroit du geste**. Le geste (« écarter cette ROI ») est bien par ROI. Mais le CRITÈRE, lui, ne l'est pas : il
est le même pour toutes les cartes de l'écran, et il ne change pas d'une boîte à l'autre. Une fois par zone de
travail suffit.

## Ce que Romain demande

Afficher l'instruction **une seule fois**, en bas de la **zone globale**, à côté des deux annotations qui y
vivent déjà :

> Uniquement ce que cette capture montre — les libellés décident, un flop propose donc trois cartes.
>
> Chaque touche enregistre — les templates se reconstruisent au fil de l'eau, rien à confirmer.

C'est exactement le registre : trois phrases de cadrage, en fin de panneau, valables pour tout ce qui est
au-dessus. La consigne d'occultation en est la troisième.

*(Deuxième choix évoqué par Romain : en bas de la card « Board » seulement. **La zone globale a sa
préférence** — c'est le choix à porter, l'autre n'est mentionné que pour montrer qu'il a été pesé.)*

## Ce qui reste par ROI

Le **bouton** ne bouge pas : « écarter cette ROI de la récolte » / « la remettre » reste sur chaque ROI, avec son
libellé accessible, et reste réversible. Ce qui part, c'est le **paragraphe de critère** qui l'accompagne
aujourd'hui sur chaque ROI.

Une chose à ne pas perdre : sur une ROI **déjà écartée**, ce n'est pas la consigne qui est rendue mais la phrase
qui dit ce qu'être écartée signifie. Celle-là est **un état, pas un critère** — elle est justifiée à l'endroit
où elle est, et elle ne s'affiche que sur les ROI concernées (jamais sept fois). Elle reste.

Autrement dit : le critère (« une ROI occultée ne doit PAS être conservée ») monte en zone globale ; le verdict
(« cette ROI-ci est hors récolte ») reste sur la ROI.

## Critère de clôture

Sur une capture de river — sept boîtes ouvertes — le paragraphe d'occultation apparaît **une fois** à l'écran, en
bas de la zone de travail, et les sept ROI gardent chacune leur bouton et, le cas échéant, leur mention d'état.


---

# Demande G — pixels de sondes masquables dans le rail ROI (issue #63 — lot D)

Demande autonome issue de la campagne de validation Windows 0.6.8 (session 2026-08-27), station 4. Suivie côté
app par l'issue **#63**. Fichier d'échange propre : elle survit à l'itération courante.

À coordonner avec la refonte du layout de la même colonne (`ds-report-rpv3-station4-layout.md`, #54) : c'est le
même rail qui change de forme et qui gagne une catégorie.

## Ce que le terrain a vécu

Les pixels de sondes prélevés en station 5 — `probe.<déclinaison>.<action>`, plus le pixel neutre `bet_blur` —
sont **dessinés sur le canvas de la station 4** : ce sont les pastilles visibles par-dessus la barre d'actions
sur les captures de session, avec leur couleur prélevée et leur libellé (`Fold · #76828F`, `Call · #2E86DC`,
`Raise · #D98A2B`, `Blur`, …).

Mais **ils n'ont aucune entrée dans le rail « ROI » de gauche**. Les catégories du rail sont SHARED, HERO,
VILLAIN 1, VILLAIN 2 — rien pour les points de sonde.

Conséquence, et c'est tout le sujet : **ils ne peuvent pas être masqués**. Chaque zone du rail a son œil
(montrer / masquer) et son focus ; les sondes non. Elles encombrent le canvas en permanence — et précisément
par-dessus la zone d'actions qu'on est en train d'ajuster, puisque c'est là qu'elles sont posées. Le joueur qui
règle la boîte `actions` travaille avec six pastilles et six étiquettes colorées collées dessus, sans aucun
moyen de les écarter.

## Ce que Romain demande

1. Ajouter une **catégorie dédiée dans le rail ROI**, regroupant tous les pixels de sondes du bucket.
2. Elle est **masquée par défaut** (icône œil barré) — un calque qu'on n'allume que pour vérifier une pose, pas
   un état permanent.
3. Chaque entrée garde le comportement des autres lignes du rail : **montrer / masquer, focus**.

## Ce que ça change dans le modèle, et pourquoi ce n'est pas qu'un ajout de groupe

Le rail des ROI et le rail des sondes ne sont pas nourris par la même chose : le rail ROI liste des `Zone` du
bucket (des rects), les sondes sont des `CalibPoint` du bucket (des points, jamais des rects) que le canvas rend
lui-même, avec son propre rail de POSE (« N pixels à poser ») pour celles qui n'ont pas de position.

Trois points d'arbitrage, à trancher côté design :

- **Ce que la catégorie liste.** Les sondes POSÉES seulement, ou aussi celles qui restent à poser ? Le rail de
  pose du canvas existe déjà pour les secondes ; les faire apparaître aux deux endroits ferait dire deux fois la
  même chose. Notre lecture : la catégorie liste **les sondes posées** — ce sont elles qui encombrent le canvas,
  et c'est d'elles qu'on veut se débarrasser à l'œil.
- **Les cibles de clic.** `act.bet-input` / `act.bet-button` sont aussi des points (des actionneurs testés au
  clic à blanc, pas des couleurs prélevées) et ils sont dessinés sur le même canvas. Une catégorie « sondes »
  qui les oublie laisserait deux pastilles inmasquables. Notre lecture : la catégorie couvre **tous les pixels
  de référence** — sondes, pixel neutre, cibles de clic, pixels d'enseigne — quitte à ce que son libellé le dise
  (« pixels de référence » plutôt que « sondes »).
- **Le défaut masqué et la visibilité dérivée.** La visibilité des ROI est aujourd'hui DÉRIVÉE des libellés de
  la capture chargée, recalculée à chaque chargement, l'œil manuel se surajoutant par-dessus. Un groupe
  « masqué par défaut » est un **troisième** régime : ni dérivé de la capture, ni un masquage de session
  provoqué par le joueur, mais un état initial du rail. Il doit survivre au changement de capture (qui
  aujourd'hui remet à zéro les masquages manuels) — sinon il se rallumera tout seul à chaque shot chargé, ce
  qui est exactement le défaut qu'on corrige.

## Ce que l'app sert déjà

Rien à ajouter côté contrat pour la partie données : le bucket porte déjà ses points, chacun avec son id, son
libellé, son action, sa déclinaison quand la clé est scopée, sa couleur quand elle a été prélevée, sa position
quand il est posé et le verdict de son dernier clic à blanc pour un actionneur. Le canvas les consomme déjà.

Ce qui manque est **côté écran** : une catégorie de rail qui les expose, et un état de visibilité qui les
concerne. Le workbench possède déjà la mécanique (liste des masqués, œil par ligne, focus) — c'est son
vocabulaire qui ne connaît que des zones.

## Critère de clôture

À l'ouverture de la station 4 sur un bucket calibré, **aucune pastille de sonde n'est dessinée sur la capture**,
et le rail de gauche porte une catégorie repliée/éteinte qui les nomme. Un clic sur son œil les rallume toutes ;
un clic sur l'œil d'une ligne n'en rallume qu'une ; changer de capture **ne les rallume pas**.


---


# Demande H — la file du chemin critique (rooms-main) : réaligner les 6 titres sur le wording réel (ajout coordinateur, post-compilation)

En couvrant le nouveau wording #62, la parité a mis au jour que la file « Critical path » du prototype bake des
titres que l'app ne peut pas (ou plus) dire. Réaligner la fixture `READINESS.queue` sur ce que l'app dérive
réellement :

| # | prototype aujourd'hui | l'app dérive |
|---|---|---|
| q1 | Capture 2 buttons — check / bet @ 960×600 | Capture 2 buttons — **fold / call** @ 960×600 (la déclinaison servie est `two_buttons`) |
| q4 | Confirm zone hero_1 @ 960×600 | Confirm zone **hero_cards** @ 960×600 (l'id de zone servi) |
| q5 | Place the raise probe @ 960×600 | **Sample the action-bar colours with the pipette** (forme globale) — et dès que la fixture porte une clé `probe` (`ResumeItemDto.probe`, nouveau contrat #62) : « Sample the colour of the « raise » button — … » |
| q6 | Sample the suit palette with the pipette | Sample the suit palette **— without it every card abstains** (#62 : le geste porte sa conséquence ; prévoir la 2ᵉ ligne dans la hauteur de carte) |
| q7 | Extract glyph templates from zone pot | **Extract the glyph for 7** (un geste par code — et le vocabulaire à deux familles de la demande D changera les codes) |
| q8 | (inchangé) | (inchangé) |

Ces quatre premiers écarts existaient déjà sous le seuil de parité ; le wording #62 (q5/q6) fait passer q6 sur deux
lignes et le décalage vertical crève le seuil — monté à 1,5 % temporaire, il redescend à 0,4 % à votre drop.
Libre à vous d'ajuster la curation (c'est votre fixture) tant que chaque titre est DÉRIVABLE par l'app depuis les
données servies — un titre que l'app ne peut pas produire est une divergence permanente.
