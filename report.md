# Tatami app → Claude Design — v3.4 : premier import DROP-IN CLEAN, et la parité à 3 chiffres près

**`pnpm import-ds` a rendu « DS import GREEN — drop-in clean » pour la première fois de la feature.** lint ✓
tsc ✓ doctor ✓, 77/77. Les 8 points de finition sont traités, focus et nudge compris. Merci.

Le C (fidélité produit) a eu l'effet espéré : après avoir re-dérivé notre shadow de parité avec les mêmes
prédicats que le backend, **la géométrie est identique au pixel près** — 6 stations, 7 cartes de chemin critique,
la jauge, les 7 lignes et le bloc des différées tombent aux mêmes coordonnées des deux côtés.

| région | avant v3.4 | après |
|---|---|---|
| `rooms-requirements` | 22,59 % | **1,43 %** |
| `rooms-main` | 2,64 % | **0,97 %** |
| `rooms-stations` | 1,19 % | **0,64 %** |

Le seuil est 0,40 %. **Il ne reste que du TEXTE**, et c'est le sujet de ce rapport : on est à trois causes près
d'un CI vert, et les trois sont chez toi. Le job `pixel-parity` bloque le merge, donc c'est la dernière chose qui
nous sépare de la MR.

---

## 1 — Tes métas citent plus de faits que le contrat n'en porte

`StationStatusDto` = `{ complete, at, done, total }` : **une** date et **un** compte. Tes métas en citent deux ou
trois. L'app ne peut donc pas les reproduire — pas par choix, par absence de donnée.

| station | ton prototype | ce que l'app peut rendre au mieux |
|---|---|---|
| 1 détection | `4 rules · tested 12/07` | `12/07` |
| 2 métrologie | `14 points · 28/07` | `28/07` |
| 3 tour | `9/13 variants · 2/3 buckets` | `20/34 cellules attestées` |
| 4 ajustage | `6/20 zones · 1/3 buckets stale` | `43/60 gestes d'ajustage` |
| 5 mesures | `2/3 points · 2/4 suits · 14/17 codes` | `13/17 codes de glyphes` |
| 6 validation | `0/3 dry-runs` | `1/3 buckets validés` |

**Deux issues possibles, à toi de choisir :**
- **(a) tu réduis** chaque méta à exactement une date OU un compte — le contrat suit, la parité tombe ;
- **(b) on enrichit le DTO.** Certains de tes faits sont légitimement dérivables et rendraient l'écran meilleur :
  le nombre de règles (`[windows]` en a 4), le nombre de points de métrologie (`[metrology.points]`), le nombre
  de buckets concernés. On peut les porter. Dis-nous lesquels comptent pour le design et on les ajoute.

Notre préférence : **(b) pour les faits vraiment dérivables** (règles, points, buckets), **(a) pour le reste** —
mieux vaut un écran plus riche qu'un écran appauvri, tant que rien n'est fabriqué.

## 2 — Les libellés de tes lignes ne sont pas dans l'i18n que tu livres

Blocage plus fondamental que le précédent : **aucune clé i18n** n'existe pour « Detection rules validated (live
test) », « Bucket geometry confirmed », « Button probes + suit palette », « Glyph templates », ni pour les `sub`
de la file (« guided capture », « canvas »…). Ils vivent dans `RoomProfile.fixtures.ts`.

Or `Station.meta` et `ReadinessLine.label` sont rendus **verbatim** depuis `data` : c'est l'app qui doit les
fournir, et elle ne peut pas deviner tes formulations. Nos libellés diffèrent donc forcément
(`Zone geometry` vs `Bucket geometry confirmed`, `Reference pixels + suit palette` vs `Button probes + suit
palette`…), ce qui pèse dans le diff résiduel.

**Demande :** livre ces chaînes dans `i18n.ts` (fr + en), comme tu le fais déjà pour le reste de l'écran. On les
consommera et les deux côtés diront exactement la même chose.

**Et l'ORDRE des lignes diffère** : tu affiches la couverture avant la géométrie, `derive_readiness` émet
`Buckets` puis `Variants` (ordre figé côté Rust, il porte la dépendance : on ne peut pas attester une variante sur
un bucket sans géométrie). Aligne-toi sur cet ordre, ou dis-nous si le tien porte une intention qu'on n'a pas vue.

## 3 — Ton score pondère 4 états, notre contrat n'en porte que 2

`ReadinessLineStatusDto` est un **booléen** (`ok`). Tes fixtures pondèrent quatre états (`ok`=1, `warn`=0.5,
`ko`/`pending`=0) → **36 % / 3 blockers** là où la dérivation stricte donne **63 % / 5**. C'est l'arc de jauge plus
les chiffres, donc la plus grosse part du résidu de `rooms-requirements`.

Si `warn` porte une vraie intention produit — « mesuré mais périmé » n'est pas « jamais mesuré » — dis-le et on
enrichit `ReadinessLineStatusDto` d'un état intermédiaire, ce qui serait d'ailleurs plus juste que notre binaire.
Sinon, ramène le score à la conjonction stricte.

---

## 4 — Trois incohérences internes à tes fixtures v3.4

Rien de grave, mais elles se contredisent entre elles, donc l'une des deux valeurs est fausse quoi qu'il arrive :

- Station 6 : la méta dit `0/3 dry-runs`, la ligne d'exigence dit `1/3 buckets · 15:07`, et `SIZE_BUCKETS` porte
  bien **un** dry-run vert.
- Station 5 : la méta dit `14/17 codes` (3 manquants), mais `MEASURE.glyphs` a **quatre** codes à 0 (`7`, `,`,
  `A`, `Q`).
- Bloc des différées : tu composes `Actions · All-in confirmation` alors que ton catalogue ne porte que
  `All-in confirmation` pour cette variante.

## 5 — Cinq défauts d'accessibilité sur le geste de pose (dont un critique)

Vérifiés dans le code après ton drop :

- **D1, critique.** Le ref callback est inline (`CalibrationCanvas.tsx:148`) donc ré-invoqué à **chaque** render,
  et `focusId` n'est jamais purgé : le pixel **reprend le focus à chaque re-render**. Reproduit : on déplace le
  focus sur un ROI, le commit debouncé arrive ~400 ms plus tard, le focus est arraché. C'est WCAG 3.2.1 (« au
  focus ») et 2.4.3 (ordre de focus). Fix : consommer `takeFocus` une seule fois (effet + reset) et une ref stable.
- **D2.** Armer un pixel laisse le focus sur `<body>` (le bouton disparaît, rien ne reprend) — symétrique de ce que
  tu viens de corriger côté pose.
- **D3.** Le nudge est **muet** au lecteur d'écran : le nom accessible du pixel ne porte pas sa position. Plier les
  coordonnées dedans (`pointAria(label, x, y, colour)`) rendrait le geste utilisable sans voir l'écran.
- **D4.** Aucun `Escape` pour désarmer : mode sans sortie au clavier.
- **D5.** `placeHint` n'est relié à aucun contrôle (`aria-describedby` manquant), donc la consigne n'est jamais lue.

## 6 — Un trou de garde sur le sélecteur de ROI

`Zone.readKind` fonctionne bien (câblé chez nous ; au passage, comme le champ est optionnel, notre sélecteur
rendait **zéro** option tant qu'on ne l'avait pas renseigné — pense à ce piège quand tu ajoutes un champ dont
dépend un rendu). Mais `zoneOptions` n'a **aucune garde géométrique** : il propose `hero_cards` même sur un bucket
qui ne la place pas, et le backend refuse alors le crop. Il faudrait soit un `Zone.placed?: boolean`, soit que
`zoneOptions` consomme une liste que l'app fournit — on calcule déjà la bonne.

---

## Recette

Après ton export : `pnpm import-ds`, `make ci`, e2e complet, et pixel-parity — on vise **25/25** cette fois. On te
renvoie le verdict comme d'habitude.

## Rappel

`hotkeys-presets.md` (0.5.1) est toujours sur l'échange, indépendante de v3.
