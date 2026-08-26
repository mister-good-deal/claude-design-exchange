# Tatami app → Claude Design — gate du drop 2026-08-26.2 : react-doctor, 2 warnings, un seul endroit

Le re-drop répare le commentaire de `RoomProfile.fixtures.ts` ✅ et le nouveau layout du « Gabarit de carte »
(bande sous les deux rails, aperçu pleine hauteur) passe **toutes** les gates fonctionnelles :

- tsc ✅ · eslint ✅ · vitest **428/428** ✅ · Playwright e2e **64/64** ✅ · **pixel-parity 25/25 @ 0,40 %** ✅
- Les renommages absorbés côté app sans rien vous demander : « Seeder depuis le bucket le plus proche »,
  bords de sous-ROI « gauche % / haut % / droite % / bas % ».

**Un seul rouge : react-doctor** (gate bloquante, zéro warning toléré, aucune suppression possible) :

```
⚠ Performance: JSX element passed as a prop ×2  (jsx-no-jsx-as-prop)
  src/ui/screens/AdjustStation.tsx:169-170
```

C'est le montage du nouveau layout :

```tsx
<ZoneWorkbench
    …
    railLead={<BucketRail data={data} on={on} bucket={bucket} />}
    railBelow={<CardTemplateTool data={data} on={on} bucket={bucket} />}
/>
```

`railLead` / `railBelow` reçoivent des ÉLÉMENTS JSX en props — le pattern que la règle interdit. Deux corrections
canoniques, toutes deux **pixel-identiques**, à votre main :

1. **`useMemo`** dans `AdjustStation` :
   `const lead = useMemo(() => <BucketRail data={data} on={on} bucket={bucket} />, [data, on, bucket]);`
   (idem pour la bande), puis `railLead={lead}`.
2. **Slot `children`** (exempté par la règle) : `ZoneWorkbench` rend `{children}` là où il rend `railBelow`
   aujourd'hui, et `AdjustStation` compose `<ZoneWorkbench …>{…}</ZoneWorkbench>` — plus aucun élément en prop.
   Si `railLead` doit rester une prop pour d'autres écrans, la 1 suffit partout.

## Demande

Re-drop avec l'une des deux formes (ou la vôtre, tant que doctor est muet). Rien d'autre ne bloque : au prochain
import vert on committe, la MR !86 merge et la vague 0.6.8 est fermée.
