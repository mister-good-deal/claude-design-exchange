# Rapport de gates — RELEASE CANDIDATE (import du 2026-07-03)

## Statut : ❌ REJETÉ — fichier corrompu à la source (l'import a été reverté, l'app reste sur v16)

Le contenu de la RC est exactement ce qu'on attendait (AppShell DS-owned, callbacks preview, rejection
surface, a11y canvas, `standalone.entry.tsx` en source partagée). Mais deux problèmes, dont un bloquant :

## 1. ⛔ `LayoutDesigner.tsx` — JSX corrompu (erreur de syntaxe, 12 erreurs tsc en cascade)

L'édition qui a inséré le handler `togglePreview` a **supprimé les éléments d'ouverture du JSX** du
composant screen. Ligne ~891, le `return (` enchaîne directement sur `title="Canvas"` :

```tsx
    return (
                title="Canvas"          // ← il manque au-dessus : <div className={styles.screen}>
                actions={               //    + l'ouverture <Panel eyebrow="Layout"
                    ...
            >
                <Canvas plan={plan} grid={g} ctx={ctx} />
            </Panel>                    // ← le </Panel> orphelin est toujours là
```

Restaure le wrapper d'ouverture (`<div className={styles.screen}>` + `<Panel eyebrow="Layout"`) devant
`title="Canvas"`. Première erreur : `LayoutDesigner.tsx:893 — TS1005: ')' expected`.

**Rappel process : lance `tsc` sur le paquet avant de zipper** — une erreur de syntaxe est le cas le plus
facile à attraper à la source, et elle invalide tout le drop (le screen est câblé en production chez nous).

## 2. `standalone.entry.tsx:59` — react-doctor `only-export-components`

```tsx
export const BASELINE_SCREENS = APP_NAV.map(n => n.id);
```

Le fichier exporte un composant ET une constante. Déplace `BASELINE_SCREENS` dans `AppShell.fixtures.ts`
(ou un fichier non-composant) et importe-le depuis là.

## Non vérifié à cause du blocage (à re-tester au prochain drop)

- AppShell (structure, slots windowControls, data/on) — pas encore câblé côté app.
- Les callbacks `onPreview`/`onStopPreview` + fallback modal.
- La rejection surface des saved-rows et l'a11y canvas (cells labellisées, radiogroups, menu).
- La génération du baseline depuis `standalone.entry.tsx` (l'approche source-partagée est validée sur le
  principe — c'est mieux qu'un HTML figé).

## Attendu au prochain drop

La même RC avec le JSX de `LayoutDesigner.tsx` réparé + `BASELINE_SCREENS` déplacé. Rien d'autre à changer.
Checklist avant zip : `tsc` → 0, `react-doctor` → 0, `lint-bundle npm run check` → 0.
