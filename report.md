# Rapport de gate — drop `tatami 2026-08-29` (vague 0.6.11), import refusé — 2 points

Import joué sur une copie scratch (`pnpm import-ds`, contrat inchangé). **tsc ✓, react-doctor ✓, lint ✗** — et un test de
container app rouge qui révèle un trou fonctionnel du drop. Les deux sont à corriger À LA SOURCE ; rien n'est édité côté
app sous `apps/web/src/ui/`. Tout le reste du drop est bon (les 6 demandes sont là : suppression désarmée + `key`,
boutons ‹ ›, bandeau conditionnel, bande rouge retirée avec lignes fantômes au rail, `capturedSizes`, `zones` du bucket).

## 1. Lint (gate bloquante CI) — `ui/screens/TourStation.tsx:575` — `@stylistic/multiline-ternary`

```tsx
{loaded === null ? null : (
```
La règle du bundle exige un retour à la ligne entre test, conséquent et alternative dès que le ternaire s'étale sur
plusieurs lignes :
```tsx
{loaded === null
    ? null
    : (
        <div className={styles.row}>
```
(`lint:fix` du bundle ne le corrige pas seul ici — l'alternative est un JSX multi-ligne.)

## 2. Canvas de la station 4 — les déclinaisons non attestées sont DESSINÉES quand aucune capture n'est chargée

La demande #99 (« `zones : N` compte le bucket ») a été appliquée comme demandé : `ZoneWorkbench.buildCanvas` passe
`bucketZones` telles quelles et s'appuie sur `hiddenForCanvas` → `derivedHidden` pour ne pas dessiner les déclinaisons
que la capture n'atteste pas. Mais `derivedHidden` sort tôt :

```ts
export function derivedHidden(zones: Zone[], shot: Shot | null): string[] {
    const out: string[] = [];
    if (shot === null) return out;     // ← aucune capture chargée ⇒ RIEN n'est masqué
```

Sur un bucket vierge **sans capture chargée** (le cas du premier lancement, et celui du bucket qu'on ouvre avant
d'avoir capturé), le canvas dessine désormais `actions.two_buttons.fold`, `actions.three_buttons.fold`,
`actions.two_buttons.call`, … en « projetée » — douze ROI d'action là où il n'y en avait aucune avant le drop
(`zonesOnShot` les retirait). C'est l'inverse de la règle E5 que la demande invoquait : une déclinaison ne se pose
que sur une capture qui l'atteste ; sans capture, aucune n'est attestée.

**Attendu** : « aucune capture chargée » = « rien n'est attesté ». `requiresMet(zone, null)` rend déjà `false` pour
toute zone qui porte un `requires` — il suffit de retirer le retour anticipé :

```ts
export function derivedHidden(zones: Zone[], shot: Shot | null): string[] {
    const out: string[] = [];
    for (const z of zones) {
        if (!requiresMet(z, shot)) out.push(z.id);
    }
    return out;
}
```

Le rail, lui, est déjà juste (œil éteint, « autre capture ») ; seul le canvas dérive.

Détail vu au passage, sans demande : les trois ROI `actions.<déclinaison>.fold` portent le même nom accessible
« actions.fold » que la tête plate — trois boutons homonymes pour un lecteur d'écran. À nommer par déclinaison le jour
où vous touchez `RoiBox`.

## Recette du prochain drop

`pnpm import-ds` vert (lint/tsc/doctor), puis côté app : test « first zone of a virgin bucket » (aucune déclinaison
au canvas, `zones : 7`), « deux suppressions d'affilée » (#96, passe désormais — le `it.fails` sera retiré),
« pose sur le canvas de la station 4 » (ligne fantôme armée `aria-pressed`), pixel-parity 27/27.
