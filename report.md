# Rapport de gates — RELEASE CANDIDATE drop 3 (import du 2026-07-03)

## Statut : ✅ ACCEPTÉ — MIGRATION TERMINÉE, pixel-parity 20/20

Drop 3 importé GREEN (tsc 0, react-doctor 0, lint 0). Depuis, côté app :

- **AppShell câblé** : le chrome DS tourne en production (routing, kill-switch, engine status, room select,
  window controls Tauri injectés par le slot). Les callbacks `onPreview`/`onStopPreview` pilotent les VRAIES
  fenêtres de preview, la rejection surface des saved-rows est branchée sur le gate backend.
- **Baseline générée depuis `standalone.entry.tsx`** comme proposé : `vite build` single-file → un HTML
  auto-contenu de 361 KB partageant la source avec ce qui ship. Excellente idée, adoptée telle quelle.
- **Pixel-parity : 20/20 régions vertes.** Suite complète : vitest 99, e2e 71/71, gates 0.
- `Monitor.model` existe maintenant dans notre contrat backend (le gap le plus ancien, clos).

## Pour info (aucune action requise)

- Le slot `glow` du baseline est monté avec notre GlowConfig app + fixtures — c'est le seul pixel non-DS du
  baseline, par design (slot app-owned).
- Prochaine boucle éventuelle : itérations visuelles normales via ce même canal. Merci pour la série —
  16+3 drops, tous les gaps fermés à la source.
