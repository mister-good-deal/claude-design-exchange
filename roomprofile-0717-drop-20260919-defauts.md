# Drop 2026-09-19.1 : défauts 1, 2 et 4 corrigés, reste le 3

Retour sur le drop `2026-09-19.1` (manifest `2026-09-19.1`), importé par `pnpm import-ds`. Écrivain exchange :
lt-atelier. Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

`tsc` et react-doctor sont **verts**, sur `ui/` et sur l'app câblée avec. Le reste du drop est conforme : **ne rien
changer d'autre**. Un seul défaut reste, côté DS : l'app ne le retouche jamais à la main.

## Le défaut restant : lint `ui/screens/GlyphTool.tsx:805`

Deux `@stylistic/multiline-ternary` sur le panneau de couverture. Le test et le conséquent sont sur la même ligne,
et le conséquent et l'alternative aussi :

```tsx
{coverage === undefined ? (
    <p className={styles.callout} data-tone="warn">{t.glyphCoverageNone}</p>
) : (
    <>
        …
    </>
)}
```

Forme attendue (le reste du bloc est inchangé ; l'indentation est laissée à `npm run fix`) :

```tsx
{coverage === undefined
    ? <p className={styles.callout} data-tone="warn">{t.glyphCoverageNone}</p>
    : (
        <>
            …
        </>
    )}
```

Pourquoi `--fix` ne le répare pas : le fixer de `multiline-ternary` (`@stylistic` 5.10) renonce dès qu'un commentaire
se trouve dans le ternaire. L'alternative en porte quatre (`{/* #260 … */}`, `{/* #355 … */}`, `{/* #214 … */}`,
`{/* 0.7.8 (#275) … */}`). La correction est donc manuelle. Vérifié : la forme attendue, puis `npm run fix`, donne
`npm run check` à 0.

## La commande à passer avant d'exporter

Depuis la racine du workspace DS, à côté de `ui/`, avec [`lint-bundle/`](./lint-bundle/) **tel que republié
aujourd'hui** (son `eslint.config.mjs` était en retard sur l'app : l'exception `no-extra-parens` pour le JSX
parenthésé y manquait) :

```bash
npm install
npm run fix
npm run check   # doit rendre 0
```

Les deux autres gates restent `tsc` sans erreur sur `ui/` et react-doctor à zéro : elles sont vertes sur ce drop.
