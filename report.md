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

---

# 3. Demande complémentaire (lot E, #104 — décision de Romain) : supprimer le bandeau « L'engine voit : » et sortir « live » du contrat

> Remplace la demande #98 de la vague (« bandeau conditionnel ») : la prémisse « le champ a un producteur réel » a été tranchée dans l'autre sens — les labels d'une capture viennent du joueur seul, l'app ne sert plus `TourState.live`. Tant que le DS ne l'a pas retiré, la station 3 rend une bande orange « L'engine voit : » suivie de rien.

# Tatami app → Claude Design — station 3 : le joueur est la seule source des labels ; `LiveFrame` sort du contrat

Arbitrage de Romain du 2026-08-29, station 3. **Remplace la demande précédente**
`doc/ds-report-rpv3-station3-bandeau-engine-voit.md` (rendre le bandeau « L'engine voit : » conditionnel et
informatif) : sa prémisse — « ce champ a un producteur réel, c'est la jonction app qui est à réparer » — a été
tranchée dans l'autre sens. Il n'y a plus de producteur, et il n'y en aura pas.

## L'arbitrage

Workflow arrêté pour la station 3 :

1. Le joueur arrive **sans preview live et sans case cochée**.
2. Il capture une frame au **F9** sur sa table.
3. La capture s'affiche au milieu de la station.
4. Il **coche les cases** que cette capture valide.
5. **À chaque coche ou décoche**, les métadonnées de la capture s'écrivent ET son **titre se construit** — pas une
   estimation de l'engine, pas de pré-labels : c'est le joueur qui détermine l'état de la capture, et lui seul.
6. Une correction après coup met à jour métadonnées et titre de la même façon.

> « Plus aucune notion de "live" ne doit persister. »

## Ce que l'app a déjà fait (livré dans cette MR)

Le rail de perception est **supprimé**, pas débranché :

- la commande `prelabel_preview` et son module de perception n'existent plus (`ipc/commands.rs`, `ipc/mod.rs`) ;
- `CalibrationStateDto.live` et `CalibrationLiveDto` sortent du contrat IPC — `packages/contracts/src/bindings.ts`
  est régénéré ;
- le sondage web à 1,5 s (`PRELABEL_POLL_MS`, `usePrelabelPoll`, `liveFrameOf`) et `tauriDriver.prelabelPreview`
  sont retirés de `apps/web/src/app/screens/RoomProfileContainer.tsx` et `apps/web/src/ipc/` ;
- `calibration_capture` ne prend plus de `label` : **F9 comme le bouton stockent une capture SANS titre**, et
  n'attestent que l'objectif armé depuis la matrice (une déclaration explicite du joueur, conservée telle quelle) ;
- le **titre** d'une capture est désormais réécrit par le store à chaque `label_shot` depuis les seules cases
  cochées (`board b3 · hero_cards dealt`) ; `Shot.label` a donc UNE source, et l'app ne le recompose plus.

Conséquence immédiate à l'écran, et c'est ce qui motive la demande : `TourState.live` n'est **plus servi**. Le
champ étant optionnel, rien ne casse — mais `apps/web/src/ui/screens/TourStation.tsx` rend toujours

```tsx
<p className={`${styles.callout} ${styles.grow}`} data-tone={!cold && live?.good === true ? "act" : "warn"}>
    {cold ? t.tourCaptureCold : t.tourEngineSees(seen)}
</p>
```

soit, hors état froid, une bande orange pleine largeur portant **« L'engine voit : »** suivi de rien du tout.

## Attendu, côté DS

1. **Supprimer le bandeau « L'engine voit : »** — pas le conditionner. Il n'y a plus d'estimation à afficher, et il
   n'y en aura plus : le message `tourEngineSees` sort de `i18n.ts` avec lui.
2. **Garder le cas FROID tel quel.** `cold` (`t.tourCaptureCold` : « Capture désarmée — aucune fenêtre de table
   détectée ») est un vrai refus : il garde sa bande et sa tonalité `warn`, seul dans son `<p>`.
3. **Sortir `LiveFrame` du contrat**, avec `TourState.live` et `TourState.liveSuspended` (tous deux déjà marqués
   « NO LONGER RENDERED » depuis #94) et le helper `seenLabels`. Plus rien ne les produit côté app.
4. **`onCaptureShot(sizeId, label, variantIds)` → `onCaptureShot(sizeId)`.** Ses deux derniers arguments étaient
   `live?.label ?? ""` et `live?.variantIds ?? []` : sans frame, ce sont structurellement `""` et `[]`. L'app les
   ignore déjà ; la signature doit suivre pour que le contrat cesse de promettre une estimation.
5. **`RoomProfileData.shotLabels` n'a plus d'emploi non plus** si le DS n'offre aucun choix de libellé de situation
   au moment de la capture (il n'en offre pas aujourd'hui) : à retirer du contrat au même drop, sauf usage prévu.
   Le geste **Renommer** de la capture chargée (`onSetShotLabel`), lui, **reste** — c'est une surcharge manuelle
   assumée, qui vaut jusqu'à la coche suivante.

## Ce qui change dans ce que le DS rend

Le titre d'une capture arrive maintenant du back sous une forme composée à partir des cases cochées
(`board b3 · hero_cards dealt`), et il est **vide** tant qu'aucune case ne l'est. L'app rend alors le rang de la
capture dans son bucket (`#1`, `#2`…), que le DS affiche déjà suivi de la date (`{label} · {at}`). Aucun changement
de rendu n'est demandé là-dessus : c'est une note pour que la maquette ne suppose plus un libellé de situation
(« preflop », « flop ») sur une capture fraîche.

## Critère de fermeture (terrain)

Station 3 sur profil vierge : aucune bande orange sous le moniteur hors table fermée ; F9 pose une capture nommée
`#1 · <date>` ; deux coches la renomment `<zone> <variante> · <zone> <variante>` dans le sélecteur, sans changement
de station ; une décoche fait l'inverse. Verdict rendu par Romain.
