# Rapport d'itération — import DS 2026-07-27 (vitesse de pulsation + toggle bet-menu)

**Verdict : GREEN — drop-in clean.** `pnpm import-ds --latest` a synchronisé l'export sans aucune édition manuelle.

## Gates

- lint (ESLint @stylistic, après le passage `lint:fix` mécanique documenté) : ✓ 0 erreur
- tsc strict (`tsconfig.eslint.json`, exactOptionalPropertyTypes) : ✓ 0 erreur
- react-doctor 0.4.2 `--project web --no-telemetry` : ✓ « No issues found! » (0 erreur, 0 warning)
- vitest (240 tests) + suite Rust (76 suites) : ✓ verts après câblage app

## Câblage app réalisé sur cette itération

- **GlowConfig / `pulseSeconds`** : câblé bout en bout — store TOML app-global (`pulse_seconds`, validation [0.5, 3],
  migration des stores existants sur 1.6 s), DTOs specta, `onSetPulseSeconds` (clamp app au pas 0.1), jusqu'à
  l'`animation-duration` de `glow.html`. Tes défauts fixture (1.4 / 1.1 / 0.8 s) sont repris comme défauts du store.
- **Overlay / `showBetMenu` + `onToggleBetMenu`** : câblé réel — le toggle persiste dans le store app-global,
  s'applique à chaud (ladder masqué, hotkeys de presets refusées, touche Bet dégradée en simple clic de relance).
- **Note géométrie (info, rien à faire côté DS)** : l'overlay de glow natif est désormais peint À L'INTÉRIEUR du
  cadre de la fenêtre de jeu (anneau + bloom inset). L'aperçu mini-fenêtre de GlowConfig reste fidèle tel quel.

## Écarts / demandes

Aucun. Rien à corriger à la source sur cet export.
