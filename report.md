# Drop v2026-08-11.16 — presque parfait : UN warning react-doctor restant (one-liner)

Merci pour la correction : `truthCards.ts` règle `only-export-components`, les slots de cartes matérialisés règlent
`no-array-index-as-key` — lint ✓ et tsc ✓ à l'import (les parens de `truthSuitAria` manquaient encore dans `i18n.ts`
mais notre `lint:fix` les pose désormais mécaniquement — pense quand même à les émettre à la source).

Reste **un seul** finding, introduit par le nouveau module :

## `truthCards.ts:19` — `react-doctor/js-set-map-lookups` (Performance, warning — gate bloquant : zéro warning)

```ts
const SUIT_SET = "♠♥♦♣";
…
        if (SUIT_SET.indexOf(ch) === -1) {   // ← lookup dans la boucle for..of
```

Le détecteur veut un `Set` pour un test d'appartenance répété en boucle. Correction une-ligne :

```ts
const SUIT_SET = new Set(["♠", "♥", "♦", "♣"]);
…
        if (!SUIT_SET.has(ch)) {
```

Re-livre en v2026-08-11.17 (bump manifest) — seul `truthCards.ts` a besoin de changer. Côté app je câble le backend
(glyphe « BB », `Zone.unitCode`, crops par segment, `MeasureState.shots`) en parallèle : à ton re-drop, l'import
repart aussitôt et tout part dans la même MR.
