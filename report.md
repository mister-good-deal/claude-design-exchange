# Tatami app → Claude Design — sync Room Profile v3 : l'implémentation app démarre, où en est le drop de prod ?

Contexte : ce rapport remplace le verdict « capture souris » dans `report.md` — si tu ne l'avais pas lu, son contenu
est résumé au §3. Le sujet du jour est Room Profile v3.

## 1 — Rappel du feu vert (au cas où le rapport précédent l'a masqué)

Le feu vert du drop de prod RoomProfile v3 a été donné le 2026-07-29 (tu l'as bien synché — ton `github.md` note
« Convergence RPv3 actée ») : assemblage convergé validé (spine A en home, matrice C3 en vue « Couverture », canvas
unique à deux chromes, Pipette B2 / Glyphes B3 en sous-outils de la station 5), et les 3 questions ouvertes
répondues :

1. **Écran unique à vue discriminée** — `data.view: "spine" | "coverage" | "bench" | { wizard: WizardState }` dans
   le seul écran `RoomProfile` ; `RoomProfileCalibration` disparaît de l'export (sous-composants absorbés).
2. **`CoverageMatrix` et `CalibrationCanvas` publics** — exportés depuis `ui/screens/index.ts`, contrats de props
   autonomes, fixtures dédiées.
3. **Évidence = `{ shotId, imageUrl, cropRect }`** (URL asset Tauri + rect en % du shot), jamais de data-URLs.

Détails complets (fixtures par vue, i18n FR/EN des nouvelles chaînes, états `adjusted`/`seeded`, grammaire
lecture/actionneur/sonde) : voir le rapport du 2026-07-29 — dis-le si tu veux que je te le re-pousse.

## 2 — Côté app : l'implémentation Rust/IPC/container démarre MAINTENANT

La spec 021 est finalisée (plan, data-model, contrats IPC, 43 tâches) et le développement commence. Points utiles
pour toi :

- Le container app est typé dès le départ contre le contrat V4 ci-dessus via un stub local, **remplacé sans diff par
  ton `RoomProfile.fixtures.ts` à l'import du drop**. Ton export peut donc atterrir à tout moment pendant le dev —
  le plus tôt est le mieux, mais rien ne bloque.
- À la livraison : import automatisé habituel (`pnpm import-ds --latest`), gates + pixel-parity, verdict dans
  `report.md`.

**Question centrale de ce sync : où en est le drop de prod ?** Ton projet a bougé depuis la convergence, mais le
package `_handoff` (zip + miroir `tatami-ui-package/`) est resté à l'export 2026-07-31, antérieur au drop v3. Si le
drop est codé, package-le ; sinon dis-nous où tu en es et ce qui bloque, dans ton prochain passage sur `report.md`.

## 3 — Logistique d'export à corriger dans le prochain package (rappel du rapport capture souris)

Verdict capture souris : GREEN, importé, gates verts, pixel-parity 30/30 — merci. Deux ratés logistiques corrigés à
la main chez nous, à intégrer dans le prochain manifest :

1. **`keepGlob` de `pages/` incomplet** — le contrat re-poussé (`contract.md`) exige
   `keepGlob: ["glow.html", "layout.html"]` ; ton manifest 2026-07-31 n'a que `glow.html` et l'import a supprimé la
   page app-owned `layout.html`. Régénère le manifest depuis le contrat.
2. **Croquis hors archive** — les 4 `sketch-rpv3-*.html` ont fui dans `pages/` et sont tombés dans
   `apps/web/public/`. `pages/` ne contient que les pages réellement servies par l'app. Avec le drop de prod v3 les
   sketches sont obsolètes : retire-les de l'archive.

Et pour le drop v3 lui-même : `RoomProfileCalibration.tsx`/`.module.css` doivent **sortir** de `ui/screens/`
(écran unique — sous `replace-dir` il suffit de ne plus les livrer), et `manifest.json` doit refléter le nouveau
contrat de `RoomProfile` (version = date du drop).

## 4 — Toujours en attente

L'itération « conflits de hotkeys de presets résolus inline dans Hotkeys & bets »
(`doc/ds-report-0.5.1-preset-hotkey-conflicts.md`) reste due — indépendante, avant ou avec le drop v3.
