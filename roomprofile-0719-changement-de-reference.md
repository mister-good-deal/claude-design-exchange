# Demande Claude Design — 0.7.19 : choisir la taille de référence des montants

Lot lt-etude [#443](https://gitlab.laneuville.me/rom1/tatami/-/issues/443) (lot 4), rédigée et publiée par lt-atelier
(écrivain exchange). **Un point, rien d'autre.** Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Pourquoi

Les montants se lisent au modèle de la room, pris à UNE taille de référence ; les autres tailles lisent leur crop
rééchantillonné vers elle. Le drop 2026-09-23.2 affiche le traitement d'une taille, mais rien ne permet de **changer**
de référence. Le moteur sert désormais la commande : une taille hors référence peut le devenir, et les gabarits de
montants se récoltent alors à cette taille.

Norme : `doc/architecture/contrat-des-stations.md` — **P7** (une écriture rend le fait écrit), **P9** (l'écran affiche,
l'app décide).

## Le contrôle « lire les montants à cette taille »

Dans le panneau « Traitement de la taille » (`AmountTreatmentPanel`), sur une taille **hors référence** :

```ts
/** OFFRE : sans handler, aucun contrôle. La taille devient la référence de la room. */
onSetAmountReference?: (sizeId: string) => void;
```

et sur `AmountTreatment` :

```ts
scale: number | null;                 // ÉLARGI : null = la taille n'a pas de facteur (elle s'abstient)
abstain?: string | undefined;         // pourquoi elle s'abstient, servi (« référence non écrite »), rendu verbatim
referenceState?: string | undefined;  // l'état de la référence, servi : « référence 1572 × 1080 : ✓ attendu sur Pot total »
```

- Le panneau se rend **aussi** pour une taille sans facteur (`scale: null`) : il dit `abstain` à la place du facteur, et
  garde tout le reste (noyau, espace, hauteur, plancher). Aujourd'hui l'app ne peut pas le servir sans facteur, et c'est
  précisément la taille qui s'abstient qui a besoin du contrôle.
- Le contrôle est un bouton « Lire les montants à cette taille ». Il n'est offert ni sur la référence (`reference: true`)
  ni sans handler. Pas de confirmation en deux temps, pas de calcul : la réponse de la commande reviendra servie.
- `referenceState` se rend verbatim en une ligne sous le titre du panneau, sur toutes les tailles, référence comprise.
  Il dit quelle taille est la référence et, tant que sa récolte attend, sur quelle zone un ✓ est attendu. Absent : rien.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le [`lint-bundle/`][bundle] à jour (`npm install`,
`npm run fix`, puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings.
Déclarez le point dans `parity.declaredChanges`.

[bundle]: https://github.com/mister-good-deal/claude-design-exchange/tree/main/lint-bundle
