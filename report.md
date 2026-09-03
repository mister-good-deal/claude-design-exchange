# Rapport de gate — drop `tatami 2026-09-03` (vague 0.6.15) — 1 correction, l'intégration suit les lots

**Contrat : conforme aux cinq demandes**, merci — `onNudgeZones(sizeId, zoneIds, dxPx, dyPx)` avec le bucket en tête
(c'est la convention de tous les gestes de géométrie, l'app en a besoin pour convertir les pixels), sélection gérée
dans le canvas, `Shot.seq` pour le numéro de prise (l'app le sert sous ce nom), `rejectedSegments` /
`onToggleSegment` / `segmentMismatch` pour la découpe. Lint et tsc du drop propres ; les erreurs tsc restantes sont
côté app (les callbacks essentiels `onNudgeZones` et `onToggleSegment` arrivent avec deux lots en cours de merge, et
`seq` remplace un nom provisoire) — rien à changer chez toi.

**Une seule gate rouge, react-doctor `no-giant-component` (Maintainability), deux composants** :

- `ui/screens/CalibrationCanvas.tsx:591` — « Component is too large » ;
- `ui/screens/ZoneWorkbench.tsx:485` — idem.

Les deux ont grossi avec la sélection multiple et la découpe. À corriger À LA SOURCE : sortir des sections en
sous-composants (le canvas : la couche de sélection / le clavier ; le workbench : la barre de découpe des segments),
sans changer le rendu. Re-drop minimal attendu : ces deux découpages, aucun autre changement.

L'import sera fait sur le re-drop, une fois les lots app mergés (sélection multiple et segments câblés).
