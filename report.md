# Tatami app → Claude Design — drop 2026-08-05 : ESLint enfin vert, 3 défauts minuscules restants

Excellent drop. **Les 21 erreurs ESLint sont parties** — c'était LE bloqueur du merge, merci. L'éclatement de
`RoomProfileTools` en 7 fichiers de station, les 4 ajouts de contrat (`VariantDef.state/reason/at`,
`CellState "deferred"`, `Readiness.deferred`, `WizardState.detect`) et les 10 surfaces manquantes sont tous là.
Les fixtures sont alignées produit (16 captures, 17 codes, totaux dérivés). L'import est passé :
`pnpm import-ds` a synché 77 fichiers, la passe `lint:fix` mécanique a suffi, **`lint` ✓**.

Il reste **3 défauts**, tous très petits, tous à corriger à la source (on ne touche pas à `ui/`). Le côté app est
déjà en cours d'adaptation au nouveau contrat, donc le prochain export devrait être drop-in.

## 1 — `tsc` ✗ : deux erreurs dans l'export

**a) `ui/screens/RoomProfile.fixtures.ts:795` — variable utilisée avant sa déclaration (TDZ).**
```
795  { id: "w1", title: SAMPLE_WINDOW_TITLE, process: "unibet.exe", role: "table" },
```
```
TS2448: Block-scoped variable 'SAMPLE_WINDOW_TITLE' used before its declaration.
TS2454: Variable 'SAMPLE_WINDOW_TITLE' is used before being assigned.
```
`SAMPLE_WINDOW_TITLE` est déclaré plus bas dans le fichier. Ce n'est pas qu'un souci de type : au runtime, la
constante des fenêtres candidates s'évalue à l'import du module et lèverait un `ReferenceError`. Remonte la
déclaration de `SAMPLE_WINDOW_TITLE` au-dessus de son premier usage.

**b) `ui/screens/i18n.ts:573` et `:602` — identifiant `purge` dupliqué.**
```
TS2300: Duplicate identifier 'purge'.
```
La clé `purge` est déclarée deux fois dans la même interface de strings. Garde-en une (ou renomme la seconde si
les deux libellés sont censés être distincts — dis-nous lequel va où, on n'a pas voulu deviner).

## 2 — `react-doctor` ✗ : un rôle ARIA à remplacer par une balise

`ui/screens/RoomProfile.tsx:76` — *Accessibility: Role used instead of HTML tag* :
```tsx
<div className={styles.rejection} role="status">
```
`role="status"` sur un `<div>` : la balise native équivalente est `<output>` (implicitement `role="status"`,
région live polie). Le remplacement demande de vérifier le rendu, donc il t'appartient — nous ne pouvons pas
l'écrire côté app sans casser la parité (règle du repo : les swaps de markup se font dans le DS d'abord, jamais
en CSS applicatif).

C'est le seul diagnostic restant : les 3 warnings précédents (`RoomProfileTools` ×2, `RoomProfileWizard` ×1) ont
disparu avec la refonte. **La barre est zéro diagnostic**, erreurs ET warnings.

## 3 — Pour info : ce que l'app fait de son côté

On retire les contrôles app INTERIM que tu remplaces (métrologie run/interrupt/retry/commit, bascule
pipette↔glyphes, purge, `data.rejection`, station 1) et on câble le nouveau contrat (`deferred` rendu comme tel
au lieu d'être replié sur `na`, encart des variantes différées, `WizardState.detect`). Deux points à savoir :

- **Les ids de zones ne sont plus jamais codés en dur côté app** : ils arrivent par `data.zones`, construits
  depuis les régions déclarées du profil de la room. Sur Unibet ce sont `board_1..board_5`, `hero_1`, `hero_2`,
  `villain_*`, `actions` (+ sous-ROI `actions.fold/call/raise/slider`, actionneurs `bet_input/bet_button/bet_blur`,
  sondes `probe.*`). N'écris aucun id de zone en dur dans le DS — ils varient d'une room à l'autre.
- La pixel-parity compare ton prototype à l'app. Les 3 régions `rooms-*` divergent encore parce que tes fixtures
  montrent un profil showcase (readiness choisi, métas en prose) là où l'app rend la dérivation honnête du vrai
  profil. Ce n'est pas un défaut de ton côté et on ne te demande rien — juste pour que tu ne t'en inquiètes pas.

## Rappel — toujours en attente

L'itération « conflits de hotkeys de presets résolus inline » (`doc/ds-report-0.5.1-preset-hotkey-conflicts.md`)
reste due — indépendante de v3.
