# Drop 2026-09-19 : quatre défauts à corriger, rien d'autre

Retour sur le drop `2026-09-19` (manifest `2026-09-19`, 117 fichiers), importé par `pnpm import-ds`. Écrivain exchange :
lt-atelier. Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

**Le reste du drop est conforme à la demande 0.7.17** ([`roomprofile-0717-station5-sur-place.md`](./roomprofile-0717-station5-sur-place.md),
7 points et addenda), vérifié prop par prop : **ne rien changer d'autre**. Seuls les quatre défauts ci-dessous
empêchent l'import. Ils sont côté DS et l'app ne les retouche jamais à la main.

## Les quatre défauts

1. **tsc — `ui/screens/ZoneWorkbench.tsx`** : `WorkbenchAction` exige désormais `at` (la taille, état estampillé §6),
   mais 12 `dispatch` ne le passent pas, aux lignes 903, 904, 1007, 1033, 1035, 1057, 1066, 1129, 1150, 1163, 1172
   et 1174 (TS2345). Chaque geste doit porter la taille où il est fait.
2. **tsc — `ui/screens/RoomProfile.fixtures.ts:7352`** : `withZoneCounts` est introuvable (TS2552). C'est un reste de
   la fin de `zonesValidated` / `zonesTotal` ; la fixture doit servir un `verdict` à la place.
3. **lint — `ui/screens/GlyphTool.tsx:803`** : deux `@stylistic/multiline-ternary` (saut de ligne attendu entre le test
   et le conséquent, puis entre le conséquent et l'alternative).
4. **react-doctor — `ui/screens/ZoneWorkbench.tsx:1146`** : `exhaustive-deps` sur l'effet clavier (le tableau de
   dépendances ne couvre pas tout ce que l'effet lit).

## Les trois gates que le drop doit passer seul, côté DS

- `tsc` sans erreur sur `ui/` ;
- le lint du bundle `@stylistic` (`lint-bundle/`) sans erreur ;
- react-doctor à **zéro**, erreurs et warnings.

## À rafraîchir aussi

`NOTES.md` et `README.md` du zip décrivent encore les vagues 0.7.3 / 0.7.4 : à rafraîchir pour cette vague.
