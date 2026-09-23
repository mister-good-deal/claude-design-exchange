# Rapport de vague — 0.7.19, verdict du drop 2026-09-23 (2026-09-23)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent. L'itération que Romain mène directement avec vous sur la
bet bar (#297) continue hors de ce rapport.

## Conformité : 6 / 6

Le drop `2026-09-23` (md5 `b87c34f01135aad3a4f41d3a71628255`) honore les cinq points de
[`roomprofile-0719-ecran-de-campagne.md`](./roomprofile-0719-ecran-de-campagne.md) et `Shot.staleRejections` repris du
21/09 : `lastGesture` sur la carte de taille et les trois notes retirées, « Scinder / Fusionner / défaire » avec
`GlyphSegment.edits`, le titre sans compte et une section par paquet, `written` et `harvestGap`, `validatedAt`. Les
sept ajouts déclarés sont acceptés. `lint` du design system : vert. `tsc` : rouge côté app seulement (le câblage).

## Deux défauts, à corriger à la source

### 1. react-doctor, 1 warning

`ui/screens/GlyphTool.tsx:719` — règle `no-reset-all-state-on-prop-change` (Bugs) : l'effet qui écoute `Escape` sur
`window` pendant qu'un geste est armé, et n'y fait que `setCut(null)`. La gate exige **zéro** diagnostic, sans
suppression ni changement de règle.

Correctif proposé, sans effet : `Escape` se lit dans le `onKeyDown` de la ligne du crop armée (qui prend le focus à
l'armement), comme le clic du segment se lit dans son `onClick`. Aucun écouteur global, aucun `useEffect`.

### 2. Le repère d'une correction avale le clic qui coupe à côté de lui

Armé « Scinder », un repère posé (`EditMark` rendu en `span.cutMark`, inerte) couvre 10 px par-dessus le segment
(`.cutMark` : `position: absolute`, `width: 10px`, sans `pointer-events: none`). Le cas terrain est exactement celui-là : le
pot « 17,4BB » de #41, fusionné, puis recoupé entre le 7 et la virgule — la coupure voulue tombe 1 px à côté du repère
de la fusion, et le clic n'atteint jamais « Scinder le segment 2 ici ». Prouvé par le parcours e2e sur la charge du vrai
moteur (Playwright : « span data-kind="join" intercepts pointer events »).

Correctif proposé : `span.cutMark { pointer-events: none; }` — un repère inerte ne prend aucun clic ; le `button.cutMark`
(hors geste armé, « Défaire ») garde le sien.

**Ne rien changer d'autre** : re-drop du même contenu avec ces deux seuls correctifs. Avant d'exporter : `tsc` vert, lint avec le
[`lint-bundle/`](./lint-bundle/) à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic.
