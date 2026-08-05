# Tatami app → Claude Design — drop RPv3.2 : les 10 points traités, 3 diagnostics a11y restants

Très bon drop. **Les 10 points du rapport précédent sont traités** : le TDZ bloquant est parti (l'écran se rend de
nouveau, les 6 suites Vitest se chargent), `purge` est dédupliqué, `role="status"` est passé en `<output>`, la
bannière de refus est rendue dans le wizard, `RuleDraft.label` porte l'aria, `metroCancel` est renommé, les rangées
d'actions wrappent, et surtout les deux culs-de-sac produit sont levés : **sélecteur de ROI dans `GlyphTool`**
(A/T/J/Q/K enfin extractibles) et **geste de pose de pixels** (`CalibPoint`, `SizeBucket.points`,
`onPlacePoint`/`onMovePoint`/`onSelectPoint`, rail « pixels à poser », état `unplaced`). Avec `WriteVerdict` et
`TransitionNote`, il ne nous reste plus AUCUNE surface app interim à porter. Merci.

État des gates après import (`pnpm import-ds`, 77 fichiers, `lint:fix` mécanique suffisant) :
**`lint` ✓ · `tsc` ✓ côté DS** (l'unique erreur restante est dans notre container, on la corrige) · `doctor` ✗ (3).

## 1 — `react-doctor` : 3 diagnostics, tous sur les nouvelles surfaces

La barre est **zéro diagnostic, erreurs ET warnings** (job CI `quality` bloquant, aucune suppression permise).

**a) `ui/screens/CalibrationCanvas.tsx:335` — deux diagnostics sur le même nœud :**
- *Accessibility: Click handler missing keyboard handler*
- *Accessibility: Interaction on static element*

C'est le geste de pose que tu viens d'ajouter : le clic sur la capture pose le pixel, mais il est porté par un
élément non interactif, sans chemin clavier. Deux conséquences : le mainteneur qui ne peut pas viser à la souris
n'a aucun moyen de poser un point, et le nœud n'est pas atteignable au clavier ni annoncé par un lecteur d'écran.

Le canvas a déjà le bon patron ailleurs : les poignées de ROI sont de vrais `<button>`. Piste la plus simple, si
elle te va : faire de la surface de pose un `<button>` plein cadre (ou un nœud focusable avec `role="application"`
et un `onKeyDown`), et offrir un déplacement fin aux flèches une fois le point sélectionné — c'est d'ailleurs plus
précis qu'un drag pour un pixel unique, ce qui sert directement le geste.

**b) `ui/screens/RoomProfile.tsx:102` — *Bugs: Array index used as a key*.**
Une liste rendue avec l'index de tableau comme `key`. Ce n'est pas cosmétique : dès que la liste est réordonnée,
filtrée ou qu'un élément est inséré au milieu, React réconcilie sur le mauvais nœud (état local, focus et
animations partent sur la mauvaise ligne). Utilise une clé stable issue de la donnée.

## 2 — Deux points de logistique

**a) Le `manifest.json` porte encore `"version": "2026-08-05"`** — identique au drop précédent, alors que le contenu
est différent (c'est le 3ᵉ export sous cette étiquette en comptant celui du matin). Notre importeur affiche cette
version et notre lockfile la trace : deux drops indiscernables compliquent le diagnostic quand on remonte un défaut.
Un suffixe suffirait (`2026-08-05.2`) ou un horodatage.

**b) Rien à faire de ton côté sur la pixel-parity.** Les 3 régions `rooms-*` divergent toujours parce que tes
fixtures montrent un profil showcase (readiness choisi, métas rédigées) là où l'app rend la dérivation honnête du
profil réel. C'est attendu et documenté chez nous.

## Rappel — toujours en attente

L'itération « conflits de hotkeys de presets résolus inline » (`doc/ds-report-0.5.1-preset-hotkey-conflicts.md`)
reste due — indépendante de v3.
