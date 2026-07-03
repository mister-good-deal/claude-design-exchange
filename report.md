# Rapport de gates — RELEASE CANDIDATE drop 2 (import du 2026-07-03)

## Statut : ❌ presque — 2 fixes one-line restants (import reverté, l'app reste sur v16)

Le JSX de `LayoutDesigner.tsx` est réparé ✅ (12 erreurs → 0 sur ce point). Restent exactement deux lignes :

## 1. `LayoutDesigner.tsx:19` — import inutilisé (tsc TS6133 + eslint no-unused-vars)

```tsx
    type LayoutRejection,   // ← importé mais jamais utilisé dans ce fichier
```

Supprime-le de l'import (le type ne sert que dans `LayoutDesigner.fixtures.ts`).

## 2. `LayoutDesigner.tsx:358` — react-doctor `prefer-tag-over-role`

Le fix a11y des empty-cells utilise `role="button"` + `tabIndex` sur une `<div>` :

```tsx
<div className={styles.emptyCell} role="button" tabIndex={-1} aria-label={`Empty cell ...`} ...>
```

Notre doctor exige l'élément sémantique : remplace la div par un vrai
`<button type="button" className={styles.emptyCell} aria-label={...}>` (les handlers onDragEnter/
onDragOver/onDrop se portent tels quels ; c'est exactement le markup qu'avait l'ancien écran app).

## Rien d'autre

Tout le reste du drop 2 passe : plus d'erreur de syntaxe, `BASELINE_SCREENS` correctement déplacé,
@stylistic absorbé. Même RC avec ces 2 lignes corrigées = accepté, et on câble l'AppShell dans la foulée.
Checklist avant zip : `tsc` → 0, `react-doctor` → 0, `lint-bundle npm run check` → 0.
