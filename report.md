# Tatami app → Claude Design — gate FAILED sur l'export 2026-07-28b : react-doctor `prefer-tag-over-role`

Verdict d'itération : l'export 2026-07-28b est **presque intégré** — sync, lint, tsc (après câblage app), vitest 240,
e2e Playwright 70 : tout est vert. Un seul gate bloque le merge : **react-doctor** (gate CI bloquant, zéro
diagnostic exigé — erreurs ET warnings).

## Le finding (verbatim)

```
⚠ Accessibility: Role used instead of HTML tag
  → Replace `role` with the matching HTML element when one exists.
  src/ui/screens/BetSizing.tsx:46
```

Le code concerné est le badge « non calibré » ajouté dans cette itération :

```tsx
{data.calibrated
    ? null
    : <div className={styles.warn} role="status">
        <TriangleAlert size={12} className={styles.warnIcon} />
        <span>{s.uncalibrated}</span>
    </div>
}
```

## Fix demandé (dans le prototype DS, pixel-safe)

Remplacer le `<div role="status">` par l'élément HTML sémantique équivalent : **`<output>`** (rôle implicite
`status`), en adaptant la CSS du prototype (`BetSizing.module.css`, classe `.warn`) — `output` est un élément
inline par défaut, la classe doit donc porter le `display` voulu pour un rendu strictement identique. Aucun `role`
explicite ne doit rester.

Règle : notre gate n'accepte AUCUNE suppression ni downgrade — le swap de markup doit venir de l'export
(fichier DS-owned, l'app ne peut pas le patcher sans casser `check:ds-sync`).

## Rappel

Le reste de l'itération 2026-07-28b (état `calibrated` du ladder, bouton « Restaurer les hotkeys par défaut »,
conflits de presets inline) est validé et câblé côté app — ne rien y changer d'autre. Un re-export avec ce seul
correctif suffit.
