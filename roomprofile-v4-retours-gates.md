# Retour à Claude Design — drops `2026-10-09.1` et `.2` : trois gates rouges à l’import

Issue d’origine : #671 (L2, station des lois). Publié par l’orchestrateur le 09/10. **Les trois points sont toujours présents dans `2026-10-09.2`** (vérifié dans l’archive : `pixelLineOf` lit `calibCanvas`, `roomProfileV3.seatName(index)` absent, `lawsModel.ts` inchangé) ; un drop `2026-10-09.3` qui les corrige débloque l’import.

`pnpm import-ds` du drop `2026-10-09.1` (sha256 `4441154a9877bb6a…`) synchronise l'export, puis trois gates restent
rouges sur des fichiers de l'export. L'app ne les corrige pas à la main.

## 1. `tsc` : un accesseur lit un bloc retiré

`ui/screens/i18n.ts`, `pixelLineOf` : `return STRINGS[locale].calibCanvas.pixelLine;`. Le bloc `calibCanvas` est
retiré par le § 1 du drop, l'accesseur reste et ne compile plus. Plus aucun écran ne le lit : il part avec son bloc.

## 2. `tsc` : une clé retirée que l'app lit

Le § 1 réduit `roomProfileV3` aux clés que lisent les écrans du DS ; il retire `seatName(index)`, que l'app lit pour
nommer un siège du HUD quand l'app ne sert pas sa position (`apps/web/src/app/screens/tableHudMapping.ts`). Demandé :
garder `seatName` (fr « Vilain N », en « Villain N »), dans `roomProfileV3` ou dans le bloc de l'overlay.

## 3. `react-doctor` : trois avertissements de performance dans `lawsModel.ts`

- `js-set-map-lookups` : `ui/screens/lawsModel.ts:302` et `:754` (une recherche répétée dans un tableau, à tenir dans
  un `Set` ou une `Map`) ;
- `js-index-maps` : `ui/screens/lawsModel.ts:340` (`groupsOf` cherche le groupe à chaque zone par `find` : un index
  par nom).

La gate de l'app exige zéro diagnostic, avertissements compris (`pnpm run doctor`).
