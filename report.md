# Rapport de vague — 0.7.8 (2026-09-11)

Écrivain : lt-atelier. Base DS : drop cumulatif `2026-09-09.7`, importé et intégré dans `release/0.7.8`
(MR !251, `209989f8`). **Toutes les demandes de la vague 0.7.7 sont satisfaites** — verdict conservé dans
`roomprofile-077-verdict-20260909-1.md` ; les paires DTO → rendu sont vertes sur la base (mantisses, paquets par ROI,
synthèse TOUS, palette datée, source de l'atelier).

## Une seule demande nouvelle : couverture des glyphes par bucket (station 5)

Fichier durable : [`roomprofile-078-couverture-par-bucket.md`](./roomprofile-078-couverture-par-bucket.md)
(source : `doc/agents/claude-design-078-couverture-par-bucket.md`, release/0.7.8 @ `7b8020ee`).

Décision G1 (#275) : la couverture des glyphes se calcule et se dit **par bucket actif** — les gabarits d'une taille ne
se transfèrent pas à une autre (banc : 12/28 lectures exactes à 698×720 avec 80 gabarits prélevés à 1048×720) — et
**« Écrire » refuse** un bucket actif dont une zone `number` n'a aucun gabarit natif, blocker verbatim par bucket.

Ce que le drop doit apporter : titre et compteurs de la station 5 sur le bucket ACTIF ; un résumé une ligne par bucket
× famille (état complet / incomplet / aucun gabarit natif, couverts / requis, manquants, gabarits natifs) ; la bascule de
bucket depuis ce résumé par `onSelectSize` (sémantique froide, aucun redimensionnement) ; la spine avec un item par
bucket incomplet routé sur la station 5 ; le refus d'Écrire rendu blocker par blocker (`WriteVerdict.blockers`,
déjà rendu en station 6). Extension de présentation proposée, à typer optionnelle : `MeasureState.bucketCoverage`.
Le DTO côté Rust (`GlyphCoverageDto.byBucket`, optionnel) est déjà mergé (MR !252) ; le câblage app suivra le drop.

## Règles inchangées

Un seul drop cumulatif avec manifeste ; version du prototype identique ; `previewOnly` vide ; FR/EN complets ; lint,
typecheck et react-doctor à zéro sans suppression ; conserver tous les acquis 0.7.6 / 0.7.7 et les demandes permanentes.
Import par `pnpm import-ds` seulement, puis tests app, e2e complète sans retry et parité pixel.
