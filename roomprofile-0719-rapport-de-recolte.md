# Demande Claude Design — 0.7.19 : le rapport de récolte appartient à la station 4

Lot lt-atelier [#409](https://gitlab.laneuville.me/rom1/tatami/-/issues/409), suite de
[#368](https://gitlab.laneuville.me/rom1/tatami/-/issues/368). Écrivain exchange : lt-atelier. **Un seul point.**
Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Pourquoi : le bloc livré est au bon dessin, à la mauvaise station

Le drop `2026-09-20` a livré `ExtractReport.harvest` et `HarvestList` dans l'outil glyphes — exactement ce que la
demande décrivait, quand la récolte devait être un effet de la passe de découpe. **Le moteur l'a livrée ailleurs** :
la récolte part du **✓ d'une ROI de glyphes** et du **commit de géométrie**, en station 4. Son rapport voyage donc
sur `SizeWriteDto` et `GeometryRewriteDto`, jamais sur les commandes de l'outil glyphes.

Rendre cette réponse dans le panneau de la station 5 supposerait qu'un état survive au changement de station, ce que
le contrat interdit (I4/I5). `HarvestList` reste donc **non servi**, et il lui faut un jumeau là où le geste se fait.

## Ce qu'il faut : `harvest` sur l'état de la station 4, jumeau de `collateral`

`WizardState` porte déjà `collateral` — ce que la dernière écriture a fait tomber, servi avec ses libellés, rendu en
tête de station par `CollateralNote`, sans callback, effacé au geste suivant. La récolte est de la même nature :

```ts
/** Ce que le DERNIER geste de cette station a récolté seul, et ce qu'il laisse à corriger. Servi, rendu verbatim. */
harvest?: readonly { sizeLabel: string; zoneLabel: string; state: "harvested" | "toFix"; detail: string }[] | undefined;
```

- **Une ligne par entrée servie**, dans l'ordre servi. L'app ne regroupe pas, l'écran n'additionne pas.
- **La clé doit inclure `detail`** : deux lignes peuvent partager la même paire (taille, zone). Le moteur boucle sur
  les captures d'une taille, et deux captures d'une même ROI peuvent échouer chacune pour sa raison.
- **`state`** : `harvested` en vert (le ton d'un fait acquis), `toFix` en ambre — jamais en rouge : le geste du
  joueur a réussi, c'est une taille qui reste à corriger. Une même liste porte les deux.
- **`detail` est le motif du moteur, verbatim** — le design system n'en compose aucun. Ses formes d'aujourd'hui :
  - `capture 8e737532-… : 6 segments découpés pour 5 glyphes saisis : corriger la découpe`
  - `capture 8e737532-… : crop hors image`
  - `corpus de la taille illisible : …`
  - pour une ligne `harvested`, la liste des codes posés (« D1 · D5 · Sep »).
- **En tête de station**, comme `CollateralNote`, avec un titre qui dit les deux comptes (« 2 tailles récoltées,
  1 à corriger »). Le titre est du design system, les lignes sont verbatim.
- **Aucun callback, rien à fermer** : l'app cesse de servir la liste au geste suivant.

## Ce qui ne change pas

`ExtractReport.harvest` et `HarvestList` **restent** : « Relancer l'extraction » garde son rapport en station 5 —
sur une jumelle déjà posée, une vérité héritée se récolte par ce geste explicite. Les deux surfaces coexistent, une
par geste, chacune là où le geste se fait.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le [`lint-bundle/`][bundle] à jour (`npm install`,
`npm run fix`, puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings.

[bundle]: https://github.com/mister-good-deal/claude-design-exchange/tree/main/lint-bundle
