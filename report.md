# Tatami app → Claude Design — VAGUE 0.6.8 (compilée par le coordinateur, 2026-08-26)

Trois demandes issues de la campagne terrain 0.6.7 (2026-08-26), une par MR d'agent, agrégées ici en une vague.
L'ordre de lecture est l'ordre ci-dessous : la demande A change le contrat et la géométrie des écrans que la
demande B compte ensuite. Les fichiers sources committés : `doc/ds-report-rpv3-gabarit-carte.md` (MR !86),
`doc/ds-report-rpv3-station5-liste-et-compteur.md` (!84), `doc/ds-report-rpv3-station6-decompte-lignes.md` (!85).

**Retiré de la vague par le coordinateur** : la demande « replier la liste des candidats écartés » (issue #47) du
fichier station 5 — la demande A supprime la découverte de composantes, donc la liste des candidats n'existe plus
du tout. Ne pas la construire.

**Rappel de la dette 0.6.7** : le réalignement de la fixture `rooms-requirements`
(`parity-fixture-requirements.md`, déjà sur cet exchange) reste attendu au prochain drop — le seuil pixel-parity
est monté à 0,55 % temporairement et doit redescendre à 0,40 %.

---

# Demande A — Tatami app → Claude Design — RPv3 : gabarit de carte partagé, et la fin de la liste de candidats


Trois issues terrain (#51, #46, #40) changent la géométrie des cartes et, avec elle, deux écrans : la **station 4**
gagne une card, la **station 5** en perd un bloc entier. On a implémenté le markup app-side pour que le backend et
le câblage ne restent pas en l'air — **c'est ton exemplaire qui fera foi** : rends-nous ces deux zones dans le
prochain drop et on jette le nôtre.

## Ce que le domaine a changé

Une carte, à l'écran d'une room, c'est **toujours le même sprite**. La station 4 calibrait pourtant **un rect libre
par slot** (`board_1`..`board_5`, `hero_1`, `hero_2`) : sept largeurs et sept hauteurs tracées à la main pour sept
objets identiques. Chaque rect encodait sa propre imprécision, et les gabarits de glyphes extraits en héritaient.

Désormais :

1. **Une taille par FAMILLE** (`board`, `hero`) et par bucket — le *gabarit de carte*. Les sept slots en dérivent
   leur rect ; **poser un slot, c'est déplacer une ancre**, plus jamais le redimensionner.
2. **Une sous-ROI de rang**, en fractions du gabarit (indépendante du bucket : le sprite est homothétique). Elle
   cadre le rang **sans son pip** — le pip change de forme par enseigne, l'inclure ferait 52 gabarits au lieu de 13.
3. L'extraction devient **top-down** : on croppe cette sous-ROI, on binarise (Otsu), on recadre à l'encre. **Plus
   aucune découverte de composantes sur une ROI carte**, donc plus aucun décor promu candidat (le terrain a vu
   *onze candidats pour une seule carte* : jeton de mise, badge du pot, bandes de feutre).

La mesure qui fonde le 3 : sur les 75 crops réels committés, le taux de lecture correcte (rang **et** enseigne)
passe de **69 % à 88 %** — les rangs 6 et 8, à 0 % sous l'ancien seuil fixe, sont à 100 %.

## Demande 1 — station 4 : la card « Gabarit de carte »

Une petite card dans la colonne de gauche de la station 4, **sous le rail des buckets**. Elle porte trois lignes :

| ligne | contenu |
|---|---|
| `Board` | largeur % + hauteur % de UNE carte du board |
| `Héros` | largeur % + hauteur % de UNE carte héros |
| `Sous-ROI de rang (% du gabarit)` | gauche % · haut % · droite % · bas % |

…et **une phrase qui dit l'invariant** : « les slots cartes ci-dessous ne portent plus que leur POSITION ».

Ce qu'on a mis en place côté app (à remplacer par ton rendu) :

- composant `CardTemplateCard` dans `ui/screens/AdjustStation.tsx`, classes `.cardTpl`, `.cardTplRow`,
  `.cardTplField` dans `RoomProfile.module.css` ;
- la colonne gauche de la station 4 est devenue un conteneur `.benchSide` (rail des buckets **+** la card) ;
- champs `Input` numériques, **committés au blur / Entrée** — jamais à la frappe (chaque commit réécrit la
  géométrie de sept ROIs et invalide les dry-runs du bucket).

Contrat (déjà dans `RoomProfile.fixtures.ts`) :

```ts
export type CardFamily = "board" | "hero";
export type CardTemplateMap = Partial<Record<CardFamily, { w: number; h: number }>>;

// sur SizeBucket
cardTemplates?: CardTemplateMap | undefined;

// sur RoomProfileData
cardRankSubRoi?: { x0: number; y0: number; x1: number; y1: number } | undefined;

// callbacks (tous deux dans RoomProfileWiring — ce ne sont PAS des offres :
// sans eux la géométrie des cartes n'a aucun éditeur)
onSetCardTemplate?: ((sizeId: string, family: CardFamily, size: { w: number; h: number }) => void) | undefined;
onSetCardRankSubRoi?: ((rect: { x0: number; y0: number; x1: number; y1: number }) => void) | undefined;
```

**La question qu'on te pose** : le canvas doit-il cesser de rendre les poignées de redimensionnement sur une ROI
carte ? Aujourd'hui elles sont rendues et **inertes** (l'app ignore la taille d'un glissé de poignée et ne garde
que le coin haut-gauche) — ce qui est exactement le « rendu-et-inerte » que le contrat §3 proscrit. On penche pour
**ne pas les rendre du tout** sur une ROI dont le catalogue dit `readKind === "card"`, avec la card ci-dessus comme
seule adresse de la taille. C'est ta décision : on n'a pas voulu toucher `CalibrationCanvas` sans ton avis.

## Demande 2 — station 5 : la liste d'écartés disparaît, la ROI se juge en entier

Ce qui **sort** de `GlyphTool.tsx` (composants supprimés côté app, à supprimer aussi chez toi) :

- `Candidate`, `Candidates`, `splitCandidates`, `toggler` — et avec eux les classes `.candRow`, `.candidate`,
  `.candReason`, `.doubted` ;
- le champ `GlyphSegment.kept` et le champ `GlyphSegment.doubt` : le moteur ne doute plus, il ne découvre plus ;
- les chaînes `candKeep`, `candDrop`, `candKeepAria`, `candDropAria`, `doubtedTitle`, `rejectedNote`,
  `rejectedNoPixels`.

Ce qui **entre** :

- une ROI carte affiche **UNE cellule** — la sous-ROI de rang, les pixels exacts que le lecteur appariera. Une
  ROI carte = une carte (les composants `cardSegments` / `cardCount` / `cardSlots` n'ont plus d'objet) ;
- l'enseigne **ne consomme plus de cellule** : elle se lit à la COULEUR de l'encre du rang, dans ce même coin.
  Saisir « K♦ » étiquette donc l'unique cellule ;
- **le geste #40 change de grain** : ce n'est plus « écarter un candidat », c'est **« écarter cette ROI de la
  récolte »** — occultée, pas clean. Un bouton par ROI, réversible, et la consigne d'occultation vit à côté de lui.

Contrat :

```ts
// sur GlyphTruth — remplace l'ancien `rejected?: number` (un COMPTE de composantes)
rejected?: boolean | undefined;   // le joueur a écarté CETTE ROI sur CETTE capture

// sur Shot
rejectedZoneIds?: string[] | undefined;

// callback (dans RoomProfileWiring — ce n'est pas une offre : c'est le SEUL
// jugement de lisibilité qui reste dans toute la chaîne)
onRejectGlyphRoi?: ((sizeId: string, zoneId: string, shotId: string, rejected: boolean) => void) | undefined;
```

Ce qu'on a mis en place, à remplacer : composant `RejectRoi` dans `GlyphTool.tsx`, classe `.roiJudge`
(`data-state="kept" | "rejected"`), chaînes `roiHarvestDrop`, `roiHarvestBack`, `roiDroppedNote` ; `occludedWarn`
est conservée telle quelle et rendue **sur chaque ROI**, là où le geste se fait.

## Ce qu'on te demande de ne PAS refaire

Le backend, le câblage container et les fixtures sont faits et verts (typecheck, lint, doctor 0 diagnostic,
428 tests unitaires, 64 e2e). Ce rapport ne demande que **le markup et le CSS** de ces deux zones : la card de la
station 4, le bloc de jugement de la station 5, et l'arbitrage sur les poignées de redimensionnement.

Issues d'origine : #51 (gabarit partagé & sous-ROI), #46 (extraction top-down), #40 (le joueur juge la lisibilité).


---

# Demande B — station 5 : le compteur d'en-tête (issue #48)

*(Du fichier station 5 : seule la section « compteur » reste — voir le retrait #47 ci-dessus. La garantie « le
regroupement de lecture `readGroup` ne bouge pas » tient toujours.)*

## 1. Le compteur d'en-tête compte les groupes de lecture, pas les cartes à identifier (#48)

Sur la capture `#20260816T094521547` (board **b4** · `hero_cards` **dealt**), le panneau ouvre **six** boîtes —
`board_1`, `board_2`, `board_3`, `board_4`, `hero_1`, `hero_2` — et l'en-tête annonce **« 2 ROI sur cette
capture »**.

L'origine est dans `GlyphTool.tsx` :

```tsx
const blocks = blocksOf(roisOnShot(data, measure, shot));
…
<span className={styles.fieldLabel}>{t.glyphRoiCount(blocks.length)}</span>
```

`roisOnShot` rend bien les six ROI que la capture montre ; `blocksOf` les replie ensuite en **lignes de lecture**
(l'écart 57 : le board est une ligne, les cartes héros une autre), et c'est ce nombre-là — 2 — qui part au
compteur. Le regroupement est un choix d'affichage juste ; le compteur n'aurait jamais dû rouler dessus.

*Attendu :* le compteur annonce **le nombre de cartes que le joueur a à identifier sur cette capture**, c'est-à-dire
exactement le nombre de boîtes que le panneau ouvre : deux cartes héros plus autant de cartes que le board en
montre (3 au flop, 4 au turn, 5 à la river). Sur la capture ci-dessus : **6**.

Formulation robuste, à votre main : compter les **slots de carte réellement rendus**, pas les ROI ni les blocs —
la somme de `cardCount()` sur les ROI carte, 1 pour les autres. C'est le seul comptage qui reste vrai que la room
pose les cartes héros en deux ROI d'une carte (cas d'`unibet.toml` : `board_1..5`, `hero_1`, `hero_2`) ou en une
ROI de deux cartes ; les deux formes existent dans les profils.

*Sur le libellé :* « N ROI sur cette capture » (`glyphRoiCount`, fr + en) ne nomme plus ce qui est compté. Un
joueur ne voit pas des « ROI », il voit des cartes à saisir. Une reformulation du type « 6 cartes à identifier sur
cette capture » dit ce qu'il lui reste à faire ; le mot exact est à vous, et il doit rester honnête si un jour la
capture mêle des ROI carte et des ROI de valeur (le pot n'est pas une carte).

*Ce qui ne bouge pas :* `readGroup` reste purement présentationnel et le rendu groupé (le board sur une ligne) est
le bon — c'est le compteur seul qui doit cesser d'en dépendre. Rien à changer côté app : `data.zones`,
`Zone.requires`, `Shot.absentZoneIds` et `measure.glyphZoneIds` portent déjà la dérivation exacte.



---

# Demande C — Station 6 — `lineDetail` invite à additionner ce qui ne s'additionne pas


**Une chaîne, deux langues, aucun changement de contrat.** Le terrain 0.6.7 (issue #50) a relevé une incohérence de
comptes là où l'arithmétique est juste : c'est la FORME du libellé qui la fabrique. Le correctif est entièrement dans
`roomProfileV3.lineDetail` (`ui/screens/i18n.ts`), donc chez vous.

## Ce que le joueur voit

Ligne « Variantes attestées par bucket » du score agrégé, sur un profil en cours de calibration :

```text
Variantes attestées par bucket        12/26        14 À JOUER + 5 À REJOUER — DÉPLIER
```

Verdict terrain, verbatim : « le décompte n'est pas celui que tu indiques, j'ai 12/26 avec 14 + 5 à rejouer donc les
totaux ne sont pas vraiment cohérents ». Le joueur a conclu à un bug de dérivation et a cessé de faire confiance au
score — alors que les quatre nombres affichés sont exacts.

## Pourquoi la forme ment alors que les nombres sont vrais

`meta` (app-side) rend `done/total` de la ligne ; `lineDetail(missing, stale)` (DS) décompose les trous de la ligne.
L'invariant de la dérivation partagée (`derive_coverage`, écart 67, livré en 0.6.7) est :

```text
done   = cellules attestées          = 12   ← les 5 « à rejouer » SONT dedans (attestées, évidence périmée)
missing = cellules jamais capturées  = 14
total  = done + missing              = 26
stale  ⊆ done                        = 5    ← une cellule périmée compte des deux côtés
```

Le `+` de `A + B` est le seul opérateur affiché de la ligne : l'œil l'applique, obtient 19 trous, puis 12 + 19 = 31,
et conclut à 31 ≠ 26. La juxtaposition suggère deux ensembles disjoints là où `stale` est un **sous-ensemble de
`done`**, jamais un addend de `missing`.

Les deux autres écrans qui consomment la même dérivation restent, eux, lisibles : la vue Couverture rend cellule par
cellule (7 capturé + 5 périmé + 14 manquant = 26) et le compteur de la station 3 rend « 12 / 26 couvertes ». **Seule
la station 6 introduit l'opérateur** — c'est bien un problème de libellé, pas de dérivation.

## Ce qu'on vous demande

Reformuler `lineDetail` pour que `stale` se lise comme une **part de `meta`**, jamais comme un second terme à côté de
`missing`. Critère de fermeture de l'issue : *un lecteur qui additionne les chiffres affichés retombe sur le total*.

Notre proposition, si elle vous va (la ligne complète se lit alors de gauche à droite sans opérateur) :

```ts
lineDetail: (missing, stale) => (stale > 0
    ? `dont ${stale} à rejouer · ${missing} restent à jouer — déplier`
    : `${missing} restent à jouer — déplier`),
```

```text
Variantes attestées par bucket        12/26        DONT 5 À REJOUER · 14 RESTENT À JOUER — DÉPLIER
```

`dont` ancre les 5 dans le `12/26` qui précède immédiatement ; `·` sépare deux natures au lieu de les additionner ;
12 + 14 = 26 est la seule addition que la ligne propose encore. En anglais, le même ancrage :
`${stale} of them to replay · ${missing} left to play — unfold`.

Une séparation visuelle des deux natures (deux `fieldLabel`, ou une pastille `stale` distincte du compte des manques)
répondrait tout aussi bien au critère — c'est votre arbitrage, on câble ce que le drop porte.

**Deux garde-fous** : la chaîne sert les 7 lignes du score, pas seulement « variantes » (la ligne « Templates de
glyphes » l'affiche avec `stale = 0`, la branche sans rejeu doit donc rester naturelle) ; et le vocabulaire de la file
de reprise dit « jouer » un geste — d'où « restent à jouer » plutôt que « restent à capturer », qui serait faux pour
la ligne des glyphes comme pour celle des dry-runs.

---

**État côté app :** rien à câbler de notre part, `lineDetail` ne prend aucune donnée nouvelle — la MR de ce lot ne
porte que le correctif de l'issue #49 (les codes de glyphes nommés en clair dans le dépliage, table app-side). #50
reste ouverte tant que ce drop n'est pas arrivé.

