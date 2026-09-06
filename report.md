# Vague 0.7.4 — atelier de traitement à la station 5 : voir ce que chaque étape de lecture d'un montant fait, et la régler

**État** : le re-drop `2026-09-06.1` (vague 0.7.3) est **importé** — MR d'import verte (lint, doctor, tsc, 528 tests,
e2e 74/74, parité pixel 28/28 sans re-baseline, verrou 96/96), cinq demandes câblées côté app (familles
d'attestation servies avec `zone` / `family` / `normal` / `implies`, sélecteur de taille, événement d'échec de
capture, paquets de gabarits persistés, écran d'erreur branché sur ses commandes). Vague 0.7.3 CLOSE, merci — les
deux écarts précédents (`engineView` dans les slots, `roiFloorPx`) ne sont plus là.

**Cette vague tient en UNE demande, et c'est un prototype** : `roomprofile-074-atelier-station5.md`. Lisez-la en
entier ; `report.md` ne fait que la situer.

## L'atelier de traitement — `roomprofile-074-atelier-station5.md`

La lecture des montants vient d'être mesurée pour la première fois sur des captures réelles : 59 lectures fausses sur
320. Deux traitements les ramènent à 20 sans qu'un rect bouge. Romain veut **voir** ce que chaque étape fait pour la
régler lui-même : un **troisième outil de la station 5** (`MeasureState.tool` gagne `"pipeline"`), ouvert depuis une
boîte de ROI `number` de l'outil glyphes.

1. **Vue d'ensemble en tête** : image originale ⇒ image finale, entre les deux la valeur lue, sa confiance et la règle
   qui a tranché (ou la raison de l'abstention, jamais un tiret muet).
2. **Une carte par étape, onze, dans l'ordre** (`crop` → `luma` → `ink` → `column` → `components` → `morphology` →
   `cells` → `series` → `match` → `grammar` → `result`) : libellé servi verbatim, interrupteur (sauf `crop`, `cells`,
   `result`), **témoin avant / après** (deux URL d'image servies), coût en µs de cette exécution, paramètres avec
   défaut et marque de surcharge, note servie (« 3 colonnes vidées », « série de droite retenue, 2 candidates »). Une
   étape éteinte reste une carte inerte et lisible, jamais absente.
3. **Portée** : sur la ROI (défaut) ou sur un glyphe choisi en cliquant une boîte numérotée dans le témoin de `cells`.
4. **Exécution au clic seulement** (« Exécuter »), jamais en continu ; après un réglage, les témoins sont marqués
   périmés, pas effacés.
5. **Compteur** exactes / fausses / abstentions sur les captures étiquetées du bucket, total et par zone, avec son
   propre bouton ; une valeur fausse est un défaut, une abstention est comptée à part. Puis « Enregistrer les
   paramètres » pour la zone ou comme défaut du profil — jamais implicite.

Contrat : `PipelineStep`, `PipelineRun`, `NumberMeasure`, `NumberRead` (miroir du moteur) ; `MeasureState` gagne
`numberSteps`, `pipeline?`, `numberMeasure?` ; rappels `onRunPipeline` / `onToggleStep` / `onSetParam` dans la
Wiring, `onMeasureNumbers` / `onSaveNumberParams` en offres. Images **par URL servie** (`fixture://…` en preview,
cadre vide étiqueté si non résolue), jamais une data-URL ni un canvas maison. 32 clés i18n `pipeline*`, sept postures
de fixture (jamais exécuté, exécution riche en notes, abstention avec raison, étape éteinte, portée glyphe, compteur
avec une zone qui concentre les fautes, jamais mesuré).

## Ce qui ne bouge pas

La récolte de gabarits, les paquets (#214), le pager de captures, la station 4 (aucun rect ne bouge — c'est la
raison d'être de l'atelier), la pipette, le rail des présences, la station 6, la matrice de couverture. Le contrat
d'export et le bundle lint sont inchangés.

Verdict d'import au prochain rapport, après le drop.
