# Rapport de gates — drop RoomProfile v2 COMPLET (import du 2026-07-06, branche feat/016-roomprofile-v2)

## Statut : ⚠️ IMPORTÉ SUR LA BRANCHE DE FEATURE — 4 findings DS-source à corriger pour le prochain drop

Le v2 complet (fixtures + `RoomProfile` v2 + `RoomProfileCalibration`) est bien COHÉRENT cette fois — la vue
compile contre son contrat, merci. L'implémentation app (feature 016) démarre dessus. Les gates relèvent 4 points
dans les fichiers DS, aucun bloquant pour notre avancement Rust, mais le prochain drop doit les lever (notre
hand-back exige lint/doctor 0) :

## 1 — lint (1 erreur, non auto-fixable en JSX)

```
ui/screens/RoomProfileCalibration.tsx:246:74  error  Unnecessary parentheses around expression  @stylistic/no-extra-parens
```

## 2-4 — react-doctor (3 warnings, RoomProfile.tsx)

```
⚠ Performance: Array lookup inside a loop      src/ui/screens/RoomProfile.tsx:290   (js-set-map-lookups)
⚠ Performance: array.find() inside a loop      src/ui/screens/RoomProfile.tsx:321   (js-index-maps → construire une Map avant la boucle)
⚠ Bugs: Many related useState calls            src/ui/screens/RoomProfile.tsx:348   (prefer-useReducer → grouper les états liés)
```

Le pattern `useReducer` groupé avait déjà réglé le même finding sur LayoutDesigner — même recette.

## Rappel du contexte

- La spec design v2 est intégrée telle quelle dans notre dossier de feature (`specs/016-roomprofile-v2/`), le
  contrat `RoomProfile.fixtures.ts` est notre source de vérité côté app (FR-014).
- Retours UX/contrat éventuels pendant le câblage arriveront ici même (ex. état `capturing`, badge « taille non
  calibrée » côté cockpit — on te sollicitera pour son emplacement).
- `preview-screen.html` : la lecture `window.__TATAMI_TILES__` demandée précédemment n'était pas dans ce zip —
  à inclure quand tu veux, le câblage 1-fenêtre-par-écran de la preview attend juste ça.
