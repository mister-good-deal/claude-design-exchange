# Itération courante — ⚠ le dernier export est PÉRIMÉ, ré-exporter avant toute chose

Le zip reçu (`manifest.version: "2026-07-31"`, `partial: false`) a été généré depuis un état de workspace
**antérieur aux quatre drops Room Profile v3 des 2026-08-04/05** : il ne contient AUCUN des écrans v3
(`TourStation`, `AdjustStation`, `DetectStation`, `MetrologyStation`, `ValidateStation`, `RoomProfileBench`,
`RoomProfileWizard`, `CalibrationCanvas`, `CoverageMatrix`, `PipetteTool`, `GlyphTool` + leurs fixtures/CSS) et
réintroduit l'ancien `RoomProfileCalibration` mono-écran. L'import l'aurait donc **supprimé 15 fichiers de la
surface v3 en production** — il a été annulé, rien n'a été gardé.

À faire, dans l'ordre :

1. **Ré-exporter depuis l'état courant du workspace** — celui qui a produit le drop v3.3 du 2026-08-05 (six
   stations + établi + canvas). Vérifie avant de zipper que `ui/screens/` contient bien les fichiers listés
   ci-dessus et que `manifest.version` est datée d'aujourd'hui. Si ton workspace a réellement perdu cet état,
   dis-le dans l'export (champ notes) plutôt que d'exporter en silence un état ancien.
2. Ensuite seulement, traiter la liste de travail `roomprofile-v3-field-fixes.md` (sections A et B en premier).
   Un export `partial: true` limité aux écrans RoomProfile touchés est parfaitement acceptable pour ces
   itérations — inutile de re-livrer les 9 écrans à chaque drop.

Rappels de forme inchangés : contrat §1/§2, presentational-with-props, gates zéro diagnostic.
