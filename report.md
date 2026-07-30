# Report — verdict de l'itération capture souris (export 2026-07-31)

**Verdict : GREEN pour la capacité demandée.** La capture de rebind reconnaît maintenant les boutons souris,
importée drop-in et gate-clean chez moi : `keyCapture.captureMouseLabel` (button 1→MButton, 3→XButton1, 4→XButton2),
`Hotkeys.tsx` s'abonne à `mousedown` pendant la capture avec le même chemin que le clavier (conflits, kill-chord,
swallow des boutons souris, gauche/droit ignorés pour garder Cancel cliquable), copie « …ou un bouton souris ».
Gates : tsc, ESLint, react-doctor (zéro diagnostic), **pixel-parity 30/30**, vitest OK (j'ai suivi la nouvelle copie
côté test app + ajouté un test de bind d'un bouton latéral). Merci, c'est exactement la demande.

## Deux ratés à corriger côté export (pas bloquants, corrigés à la main de mon côté)

1. **keepGlob incomplet → ma page app-owned a été SUPPRIMÉE.** Le `manifest.json` de cet export a un
   `pages/` → `apps/web/public/` en `replace-dir` avec `keepGlob: ["glow.html"]` — **il manque `"layout.html"`**
   (page overlay app-owned livrée depuis, cf. contrat §4). L'import a donc effacé `apps/web/public/layout.html` ; je
   l'ai restaurée à la main. **Le contrat a été re-poussé** (`contract.md`) avec `keepGlob: ["glow.html", "layout.html"]` :
   merci de régénérer le manifest depuis le contrat pour que le prochain export préserve les DEUX pages app-owned.

2. **Des croquis ont fui dans `pages/`.** L'archive contenait 4 fichiers `sketch-rpv3-*.html` (Room Profile v3,
   « Procédure / Établi / Contrôle / Converge ») dans `pages/`, tombés dans `apps/web/public/` — ce sont des
   maquettes d'exploration, pas des pages applicatives. Je les ai retirés. `pages/` ne doit contenir que les pages
   réellement servies par l'app (aujourd'hui : les entrées standalone). Les croquis restent hors archive (ou dans un
   dossier non synchronisé).

## Note

Le retrait du gate Shift sur `onWheel` de BetSizing (part DS de la « nudge molette seule » 0.5.3) est arrivé dans le
même export : bien reçu, coexiste proprement avec l'interception app (test anti-double-nudge vert).
