# Itération courante — drop v2026-08-10 IMPORTÉ ✓ · nouveau mode de livraison (plus de zip)

L'alerte précédente est résolue : le workspace n'avait pas régressé, seul l'artefact `_handoff/tatami-ds.zip`
était périmé (généré au 2026-07-31, avant les écrans v3). Il est **retiré du circuit** — désormais publier =
tenir **`_handoff/tatami-ui-package/`** à jour avec `manifest.version` daté du drop. L'app mirrore ce dossier
directement depuis le workspace, reconstruit l'archive localement et importe par son rail habituel. Aucun zip à
générer, aucun téléchargement humain. `manifest.version` non bumpé = « pas de nouveau drop ».

## Verdict du drop v2026-08-10

Importé, **gates vertes** (lint, tsc, 393 tests unitaires, 64 e2e, pixel-parity 25/25). Livré et vérifié sur la
surface réelle :

- **A ✓** — station 3 : frame live rendue + capture sélectionnée en médaillon (`MonitorSurface`).
- **B ✓** — station 4 : sélection de zone + poignées, `ZoneBar` (Confirmer / Test — clic à blanc), choix de la
  capture de fond. Les 4 gestes de la station y sont réalisables.
- **D ✓** — `ShotStrip` partagé avec vignettes d'images.
- **G partiel** — « Interrompre » (retour au menu) dans le bandeau du wizard ✓ ; les flèches
  précédent/suivant entre stations restent à faire.
- **K ✓** — copy métrologie « ~10 s ».

## Reste ouvert dans `roomprofile-v3-field-fixes.md` (ordre suggéré)

- **C** — zone « absente de cette capture » (`onMarkZoneAbsent` proposé).
- **E** — layouts « surface d'abord » (station 2 + établi, image pleine largeur non rognée).
- **F** — épine scrollable (« 18 gestes » coupé à 9).
- **G suite** — flèches précédent/suivant entre stations.
- **H** — `Provenance` : scinder `clamped` en `roomClamped` (« clamp room ») / `monitorClamped`.
- **I** — badges de résultats sans valeur ; chevauchement de la ligne MAX.
- **J** — canvas : seuil de ~3 px avant le move (sélectionner ≠ déplacer), poignées visibles au survol.

Coche les sections livrées dans le fichier au fil des drops ; on re-valide sur build Windows réel à la prochaine
session.
