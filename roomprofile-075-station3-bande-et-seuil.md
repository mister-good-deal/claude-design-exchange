# Demande durable — 0.7.5 : station 3, la bande des tailles, et ce que dit la colonne de couverture

Vague Claude Design de la **0.7.5** — retours de la campagne Windows 0.7.3 (issue **#227**, méta #34). Le FOND du
drop 2026-09-06.1 est conforme à ce que #215 et #216 demandaient : les libellés disent l'écart au cas normal, « Non
visible ici » existe par famille, l'exhaustivité rend 25/25. Ce sont trois défauts de mise en œuvre — et sur les
trois, **un seul est établi comme un défaut de gabarit**. Les deux autres sont tranchés ici avec leurs mesures,
parce que la moitié du travail de cette demande a été de savoir qui les porte.

## 1. Le sélecteur mange la moitié de la hauteur — MESURÉ, et c'est du CSS

Romain, campagne 0.7.3 : « l'affichage du screen au milieu est KO… Les tailles de fenêtres prennent la moitié de la
hauteur au lieu de juste une bande ».

Mesure prise dans Chromium sur l'app réelle (driver fixture), station 3, viewport 1600 × 1400 :

| `.bucketBanner` | hauteur |
| --- | --- |
| tel qu'il est aujourd'hui (`flex-grow: 1`) | **598 px** |
| le même bandeau, `flex-grow: 0` | **124 px** |

474 px de vide, sur une colonne de 1291 px. La capture — l'objet que le joueur regarde pour cocher ses cases — est
reléguée en dessous, à ce qu'il reste.

La cause est une règle juste à un endroit et fausse à l'autre. `RoomProfile.module.css` :

```css
.bucketBanner {
    flex: 1 1 auto;          /* ← grandit dans le sens de l'axe du parent */
    align-items: center;     /* ← et centre les tuiles au milieu du vide qu'il vient de prendre */
}
```

À la **station 4** (`AdjustStation.tsx`) le bandeau est posé dans une rangée : `flex-grow: 1` le fait grandir en
LARGEUR, ce qui est exactement voulu. À la **station 3** (`TourStation.tsx`) le même composant est posé dans une
colonne (`styles.col` + `styles.grow`, `flex-direction: column` vérifié au runtime) : le même `flex-grow: 1` le
fait grandir en HAUTEUR, et `align-items: center` étale les tuiles au milieu de la bande.

**Ce qu'on demande** : à la station 3 le rail est une BANDE — sa hauteur est celle de son contenu, et la surface
restante revient à la capture. Le moyen appartient à Claude Design (une variante de gabarit portée par la prop
`station` que le composant reçoit déjà, un `flex-grow: 0` sous cette variante, ou le rail sorti du flux de la
colonne) ; ce qui est demandé, c'est le résultat : **la capture occupe la surface qui reste, la bande ne prend que
ce qu'elle affiche.** Le nombre de tuiles varie (le profil terrain en a deux, la fixture par défaut cinq, qui
enroulent sur deux lignes) : la bande suit son contenu dans les deux cas, elle ne se fige pas à une hauteur.

## 2. Le sélecteur « ne répond pas au clic » — le câblage app est PROUVÉ bon

Romain : les deux tuiles `1048 × 720 CALIBRÉ · 16 captures` et `698 × 720 CALIBRÉ · 16 captures` s'affichent et ne
répondent pas au clic. La demande #215 posait `onTourSize` comme geste essentiel ; avant de le renvoyer au design,
le rail a été mis à l'épreuve des deux côtés :

- **En jsdom, sur le container réel** — station 3 montée sur le bucket calibré, clic sur la tuile non active :
  `calibrationTourSize` est appelé. Le cas est désormais une gate permanente
  (gate vitest côté app, « le clic sur une tuile de taille voyage jusqu'au driver ») :
  c'est la jonction que #93 disait exercée par aucune gate.
- **Dans Chromium, sur l'app réelle** — les cinq tuiles de la station 3 rendent `disabled = false`, et un
  `elementFromPoint` au centre de chacune tombe sur la tuile elle-même. Rien ne les recouvre, aucune n'est inerte.

Le chemin `BucketRail → pickBucket → fire("onTourSize") → container → driver → commande` est donc entier, et le
backend valide la taille avant de redimensionner (`ensure_active_size`, refus français nommant la taille).

Restent deux causes possibles au terrain, et la première appartient à cette demande :

1. **La géométrie du §1.** Avec 474 px de vide dans la bande et les tuiles centrées, la zone que l'œil lit comme
   « le sélecteur » est très majoritairement du bandeau vide. Un clic visé sur cette zone n'atteint aucune tuile —
   et l'écran ne répond effectivement pas. Corriger le §1 corrige aussi cette lecture-là.
2. **Un refus du backend non remarqué.** Le refus voyage déjà (`data.rejection`, rendu par
   `RoomProfileWizard.tsx`) ; il n'est pas prouvé qu'il ait été vu. Rien n'est demandé ici : c'est à vérifier au
   terrain, la prochaine session, en lisant la bannière de refus après le clic.

**Ce qu'on demande** : rien de plus que le §1, et **aucun changement de contrat** — `onTourSize` reste dans
`RoomProfileWiring`, sa signature ne bouge pas.

## 3. La colonne « Toutes captures » : ce n'est pas un rafraîchissement, c'est le SEUIL

Romain : « avec deux captures couvrant une variante, j'en décoche une — la colonne continue d'afficher la
couverture d'avant ».

Le code dit autre chose, et il le dit dans ses propres mots. `coveredVariants` (`RoomProfile.fixtures.ts`) unit la
couverture servie par le backend et les cases cochées sur la capture chargée ; la mutation
(`onCorrectLabels` → `label_shot`) déclenche la cascade complète du container (`refetchAll` : couverture, catalogue,
vue d'ensemble, tous refetchés et reposés). Et la légende de la colonne annonce exactement ce qu'elle rend :

> « À droite — lecture seule… **couverte dès qu'UNE capture la montre**, signalée quand cette évidence est périmée. »

Décocher une variante sur une capture quand une AUTRE capture du même bucket l'atteste encore laisse donc le ✓ —
et c'est la réponse juste à la question « au moins une ». Il n'y a pas d'état périmé : il y a un écart entre ce que
la colonne répond et ce que la station exige. Le minimum réel de la station est **deux captures par état** (c'est
lui qui rend la dérivation en leave-one-out possible), et une colonne binaire ne peut pas le montrer.

**Ce qu'on demande** : que la colonne dise le COMPTE, pas seulement l'existence — l'état d'une variante y devient
« 0 / 2 », « 1 / 2 », « 2 / 2 » (ou la forme graphique équivalente : deux pastilles, une jauge à deux crans), avec
le ✓ plein réservé au seuil atteint. Un joueur qui décoche la deuxième capture doit voir la couverture retomber
sous le seuil au moment où il le fait.

Ce que cela change côté données : **rien de servi en plus**. Le compte se dérive des cellules déjà là — la
couverture est servie par cellule (`CoverageCell`, une par paire taille × variante) et les captures du bucket sont
dans `SizeBucket.shots` avec leurs attestations. La dérivation appartient à l'app, qui la posera dans le même champ
si la forme rendue le demande ; ce qui est demandé au design, c'est **la forme du seuil**, et la légende qui va
avec.

Si Romain tranche que le seuil de deux n'a pas à vivre dans cette colonne, alors rien ne bouge ici et c'est la
légende qui est déjà juste — la demande tombe d'elle-même.

## 4. Contrat de données

**Ajouté : rien. Retiré : rien. Changé : rien.**

- `onTourSize` reste au contrat et dans `RoomProfileWiring`, signature inchangée.
- `SizeBucket`, `TourState`, `CoverageCell`, `CellState` : inchangés. Le §3 se paie sur les cellules déjà servies ;
  si la forme retenue demande un champ dérivé, il sera posé par l'app, jamais par un champ servi de plus (#99).
- `station: "adjust" | "tour"` sur `BucketRail` existe déjà : c'est la prop qui porte la variante du §1.

## 5. i18n

Aucune clé nouvelle pour les §1 et §2.

Pour le §3, si le compte est retenu, deux clés à prévoir dans `ui/screens/i18n.ts` — la forme exacte suit le
gabarit choisi :

- `tourAllCount(done, need)` — FR : « {done} / {need} captures » · EN : "{done} / {need} captures"
- `tourLegendAll` — **à réécrire** : elle promet aujourd'hui « couverte dès qu'UNE capture la montre », ce qui
  cesserait d'être vrai.

## 6. Fixtures

`RoomProfile.fixtures.ts`, postures de la station 3 :

1. **deux tuiles seulement** — c'est le profil terrain (1048 × 720 et 698 × 720), le cas où la bande du §1 se voit
   le plus : une seule ligne de tuiles, et tout le reste de la colonne à la capture ;
2. **cinq tuiles qui enroulent** — la posture de la fixture par défaut, pour que la bande suive son contenu sur
   deux lignes sans pour autant prendre la colonne ;
3. **une variante à 1 / 2** — une seule capture du bucket l'atteste : c'est l'état que la colonne binaire ne sait
   pas dire aujourd'hui, et le seul qui prouve le §3.

## 7. Ce qui ne bouge pas

- Le fond de la station 3 livré en 0.7.3 : libellés d'écart, « Non visible ici » par famille, exhaustivité 25/25,
  la colonne de gauche (« sur cette capture »). Rien à reprendre.
- Le rail de la station 4 : son bandeau garde le seed, la purge et l'avancement `k / N` — le §1 ne touche QUE la
  variante `tour`.
- Le moniteur, le pager de captures, le renommage, la suppression, la pause de capture, le sélecteur d'unité.
- L'écran d'erreur de profil (#226) : entièrement réglé côté app et backend, aucune demande de design.
