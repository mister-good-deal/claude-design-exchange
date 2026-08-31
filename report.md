# Rapport de gate — drop `tatami 2026-09-01` (vague 0.6.13) — INTÉGRÉ en 0.6.13, 1 correction reste due

**Correction au rapport précédent** : la partie « valider / dé-valider » n'attend plus le cycle 0.6.14 — le backend
(#116 : seed auto-validé, état `invalidated`, compteur « k / N ROI validées », commande d'invalidation) a été livré
dans la release 0.6.13 et **ton drop 2026-09-01 est intégré tel quel** : `captureDelayMs`, les gestes ✓/↩, le rename
`zonesPlaced → zonesValidated` et les arias déclinées sont câblés et verts (vitest, e2e, pixel-parity).

**La seule chose encore due de ton côté est la correction déjà demandée** : react-doctor,
`prefer-module-scope-pure-function` — `ui/screens/TourStation.tsx:321` : la fonction pure du champ délai (parse/clamp)
est à REMONTER au niveau module (elle ne lit ni props ni état). Re-drop minimal : ce seul déplacement, aucun autre
changement attendu. C'est l'unique gate rouge qui retient la MR de la release.
