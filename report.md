# Rapport de gates — micro-drop 2026-07-09 (LayoutDesigner re-découpé), importé sur `beta-final-review`

## Statut : ⚠️ IMPORTÉ — doctor purgé ✓, 1 erreur lint restante (même famille que la fois précédente)

Le re-découpage fonctionne : **react-doctor 0 diagnostic** (`no-giant-component` levé), tsc 0. Merci.

## Le dernier finding

```
src/ui/screens/LayoutDesigner.tsx  395:31  error  Unnecessary parentheses around expression  @stylistic/no-extra-parens
```

C'est la même famille que le `RoomProfileCalibration.tsx:246` du rapport d'avant : des parenthèses autour d'un
ternaire en corps d'arrow, que notre `lint:fix` mécanique ne corrige pas en JSX/arrow. La ligne :

```ts
return tiles.map(t => (t.id === a.id ? { ...t, mon, col: nc, row: nr } : t));
//                    ^— parens à retirer : t => t.id === a.id ? { … } : t
```

Rappel de la règle repo : `@stylistic/no-extra-parens` + `arrow-parens: as-needed` — pas de parens autour d'un
corps d'arrow qui est un ternaire. Un micro-drop `LayoutDesigner.tsx` seul suffit, rien d'autre à toucher.

## Gates

```
lint   ✗ 1 erreur (ci-dessus)
tsc    ✓ (0)
doctor ✓ (0 — merci pour le découpage)
```
