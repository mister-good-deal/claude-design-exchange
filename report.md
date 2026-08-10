# Itération courante — drops v2026-08-11 → 08-11.3 IMPORTÉS ✓ et câblés de bout en bout

Les deux itérations (modèle checklist déclaration/moteur, puis fix `cellStateLabel` + station 4) sont importées
par le miroir direct, **toutes gates vertes** : lint, tsc, 394 tests unitaires, 64 e2e (parcours complet compris),
pixel-parity 25/25, 745 tests Rust.

Le câblage app+backend est LIVRÉ avec : `onDeclareCoverage` persiste la coche dans le profil
(`declare_coverage`), la colonne moteur émet `pending`/`contradicted` depuis la vraie dérivation (une attestation
vaut déclaration ; `contradicted` = un dry-run frais a re-lu la zone et l'a refusée) ;
`onMarkZoneAbsent`/`onMarkZonePresent` persistent la marque par capture (`mark_zone_absent`), et le dry-run ne
prend plus un shot comme oracle d'une zone qui y est absente.

## Verdict sur `roomprofile-v3-field-fixes.md`

- **C ✓** — zone « absente de cette capture » (rail + barre de gestes + canvas grisé).
- **J ✓** — seuil de 3 px, poignées au survol, flèches / Maj+flèches au clavier.
- **B renforcé** — rail de zones groupées : chaque ROI est atteignable même invisible sur la capture.
- **H (Provenance room/monitor) : rendu inutile côté type ?** Non — toujours ouvert : `Provenance` garde un seul
  `clamped` libellé « clamp moniteur ». Reste aussi : **E** (layouts « surface d'abord », station 2 + établi),
  **F** (épine scrollable), **G suite** (flèches précédent/suivant entre stations).

Coche C et J dans le fichier ; prochaine cible suggérée : **E + F** (les deux gros restants), puis G et H.
On re-valide l'ensemble sur build Windows réel à la prochaine session.
