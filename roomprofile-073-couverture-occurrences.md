# Demande durable — 0.7.3 (ajout) : la colonne « Toutes les captures » de la station 3 compte les occurrences

Ajout de Romain (2026-09-06) à la vague 0.7.3, sur la refonte de l'attestation (`roomprofile-073-attestation-par-siege.md`).
Rien ne se redessine : la colonne de droite (« Toutes les captures », lecture seule, `tourColAll`) gagne un nombre et
une couleur de plus.

## 1. Ce que le joueur voit

À droite de la coche de « Toutes les captures », pour chaque déclinaison : **le nombre de captures du bucket qui
l'attestent**. Certaines déclinaisons exigent **deux témoins** (les états des présences dérivées en leave-one-out :
une capture « présent » ne suffit pas, il en faut deux de chaque côté) ; d'autres se contentent d'une.

- Tant que le nombre demandé n'est pas atteint : `{occurrences} / {demandées}` (« 1 / 2 »), et la coche est
  **orange** — attestée, mais pas encore suffisante.
- Dès que le nombre demandé est atteint : la coche redevient **verte** comme aujourd'hui, et la cellule n'affiche
  plus que **le nombre d'occurrences seul** (« 2 », puis « 4 »), sans dénominateur — jamais un « 4 / 1 » inutile.
- Aucune occurrence : l'état d'aujourd'hui (pastille vide), avec `0 / 2` en texte discret quand deux témoins sont
  demandés, pour que la cible se lise ; rien quand un seul témoin suffit.

La colonne de gauche (« Sur cette capture ») ne change pas.

## 2. Contrat de données

`CoverageCell` porte déjà les captures qui attestent la cellule : `attestedBy?: string[]` (ordre de capture). Le
compte est donc **`attestedBy.length`**, jamais un champ de plus. Un seul ajout, servi par l'app :

```ts
export interface CoverageCell {
    // … inchangé …

    /**
     * AJOUTÉ — le nombre de captures qu'il faut pour que cette déclinaison soit SUFFISAMMENT attestée sur ce bucket.
     * Servi par l'app : 2 pour les états d'une famille à référence de présence (dérivation leave-one-out : deux
     * témoins par état), 1 pour tout le reste. Absent = 1. La colonne « Toutes les captures » compare
     * `attestedBy.length` à cette valeur : au-dessous, coche orange et « n / required » ; à partir de la valeur,
     * coche verte et « n » seul.
     */
    required?: number | undefined;
}
```

`CellState` ne change pas : l'orange n'est pas un état de plus, c'est la lecture de `attestedBy.length < required`
sur une cellule `declared`. Le titre de la coche (`tourAllTitle`) dit le compte.

## 3. i18n — clés FR/EN à prévoir dans `ui/screens/i18n.ts`, section `roomProfileV3`

- `tourAllCount(n)` — FR : « {n} capture(s) l'attestent » · EN : "{n} capture(s) attest it" (pluriel dans la clé, comme
  `presencePresent`)
- `tourAllNeeded(n, required)` — FR : « {n} / {required} — encore {required − n} témoin(s) à capturer » · EN :
  "{n} / {required} — {required − n} more witness(es) to capture"
- `tourAllInsufficientTitle(label, n, required)` — FR : « « {label} » : {n} capture(s) sur {required} demandées » ·
  EN : "« {label} »: {n} capture(s) out of {required} required"

`tourAllTitle` / `tourAllStaleTitle` / `tourAllCovered` restent.

## 4. Fixtures

`RoomProfile.fixtures.ts` — sur les postures de l'attestation déjà demandées : une cellule à `required: 2` avec un seul
témoin (coche orange, « 1 / 2 »), une à `required: 2` avec trois témoins (coche verte, « 3 »), une à `required` absent
avec quatre témoins (coche verte, « 4 »), une à `required: 2` sans témoin (« 0 / 2 » discret).

## 5. Ce qui ne bouge pas

La colonne « Sur cette capture », `CellState`, `attestedBy`, la matrice de couverture de la station 4 (elle garde sa
propre lecture), le compteur de tête `tourCounters`.
