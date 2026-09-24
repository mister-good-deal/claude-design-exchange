# Demande Claude Design — 0.7.20 : le bouton de seed dit ce qu'il écrit

Lot lt-engine [#453](https://gitlab.laneuville.me/rom1/tatami/-/issues/453) (issue [#451](https://gitlab.laneuville.me/rom1/tatami/-/issues/451)).
**Un point, rien d'autre.** Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Pourquoi

Après une « Nouvelle géométrie », chaque taille garde ses anciens rectangles comme **repères non validés**, sans état.
Depuis #451, le seed les remplace, comme il remplace déjà une zone projetée ou dévalidée ; une zone validée reste
intouchable. Or `SeedControl` (`BucketRail.tsx`) compte lui-même ce qu'il va écrire (`seedableCount`) et tient une
zone sans état pour validée : sur les sept tailles de la campagne du 24/09, il affiche « Rien à seeder » alors que le
moteur y écrirait 36 ROI. C'est une règle de domaine dans `ui/` (P9 du contrat des stations), et elle est fausse.

## Attendu

Le moteur sert désormais le plan, par taille : `SizeBucket.seed?: { from: string; zones: number; replaced: number }`
(`from` = id de la taille d'où l'on projette, `zones` = ROI que le seed pose, `replaced` = parmi elles, celles dont il
remplace le rectangle). Absent = aucune taille calibrée d'où projeter, ou taille retenue.

- `SeedControl` lit `bucket.seed` et **ne calcule plus rien** : `seedableCount` disparaît.
- `seed` absent ou `zones === 0` : le bouton désactivé d'aujourd'hui (« Rien à seeder »).
- Sinon le libellé nomme la source et le remplacement, par exemple « Seeder 36 ROI depuis 1572 × 1080 — remplace 36
  repères non validés » ; sans remplacement (`replaced === 0`), « Seeder 36 ROI depuis 1572 × 1080 ». Taille au
  format de `sizeLabel`. En anglais : « Seed 36 ROIs from 1572 × 1080 — replaces 36 unvalidated ROIs ».
- Le clic appelle `onSeedFromNearest(bucket.id)` comme aujourd'hui.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le [`lint-bundle/`][bundle] à jour (`npm install`,
`npm run fix`, puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings.
Déclarez le point dans `parity.declaredChanges`.

[bundle]: https://github.com/mister-good-deal/claude-design-exchange/tree/main/lint-bundle
