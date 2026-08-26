# Tatami app → Claude Design — gate du drop 2026-08-26.1 (vague 0.6.8) : UN défaut de syntaxe, tout le reste est vert

Le drop couvre la vague entière (gabarit de carte, fin des candidats, compteur, mot du score, dette de parité) et
il est **fonctionnellement bon** — on a tout vérifié en scratch. Un seul défaut bloque l'import committable, et il
est **à la source** : un commentaire cassé dans `ui/screens/RoomProfile.fixtures.ts`. Re-drop de ce fichier corrigé
et la vague est fermée.

## Le défaut (bloquant tsc + lint)

`ui/screens/RoomProfile.fixtures.ts`, bloc `STATIONS`, entrée `tour` (~l. 1735) :

```ts
    /* Parity — the é67 word again: the spine's panel and the app count cells the captures ATTEST. */
       ATTEST. « declared » was the tour's old vocabulary and it made the two views disagree. */    { id: "tour", status: "current", meta: `${COVERAGE_COUNTS.attested}/${COVERAGE_COUNTS.total} cells attested` },
```

Le commentaire est **dupliqué et auto-fermé** : la première ligne se termine par `*/`, la seconde répète la fin de
la phrase, porte un second `*/` orphelin, et **l'entrée `{ id: "tour", … }` est piégée derrière** — le fichier ne
parse plus (7 erreurs tsc en cascade, 485 erreurs lint dans le fichier faute de parse).

**Attribution vérifiée** : le texte cassé est présent tel quel dans l'archive brute (avant toute passe de
formatage de notre côté) — ce n'est pas notre `lint:fix` cette fois (leçon du `;` orphelin de 2026-08-19 retenue).

Forme attendue (celle que votre propre convention `multiline-comment-style` produit) :

```ts
    /*
     * Parity — the é67 word again: the spine's panel and the app count cells the captures
     * ATTEST. « declared » was the tour's old vocabulary and it made the two views disagree.
     */
    { id: "tour", status: "current", meta: `${COVERAGE_COUNTS.attested}/${COVERAGE_COUNTS.total} cells attested` },
```

## Vérifié en scratch avec cette seule correction — TOUT est vert

- tsc ✅ · eslint ✅ · react-doctor « No issues found! » ✅
- vitest **428/428** ✅ · Playwright e2e **64/64** ✅
- **pixel-parity 25/25 au seuil nominal 0,40 %** — la dette `rooms-requirements` (0,55 % temporaire) est SOLDÉE
  par votre régénération dérivée ✅

## Ce que l'app a câblé en face (dans la MR, prêt)

- `Zone.cardFamily` servi par le mapping (dérivé du catalogue : `kind === "card"`, `hero*` → hero, sinon board).
- `RoomProfileData.cardRankSubRoi` servi depuis le DTO (fractions → % du gabarit) et `onSetCardRankSubRoi`
  reconverti en fractions au commit (miroir exact du chemin gabarit).
- Miroir de parité (`prototype-roomprofile.ts`) aligné sur vos prédicats dérivés : attestées = `verified` seul,
  géométrie par ROI du catalogue que le bucket clé, pixels de référence « couleur lue / clic posé » (11/20),
  dry-runs « passe enregistrée = faite, stale ⊆ done » (2/3) et « validated = passed » (1/3) sous leurs deux mots,
  `captured` traverse en DTO (le donut retrouve son « 8 captured · dry-run pending »).
- Vos décisions sont prises telles quelles : poignées non rendues sur ROI carte (le canvas suit `readKind`),
  villains sans `readKind` (déjà le cas dans les profils réels : ils sont `kind = "text"`).

## Demande

**Re-drop du seul `RoomProfile.fixtures.ts` corrigé** (ou de l'export complet régénéré, comme vous préférez —
l'archive est énumérée, on réimporte tel quel). Rien d'autre : pas de changement de design demandé, la question
des poignées est tranchée et adoptée, le point de forme `occludedWarn` répété par ROI est noté pour le verdict
terrain à venir.
